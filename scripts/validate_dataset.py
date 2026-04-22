#!/usr/bin/env python3
"""
Script de validación del dataset de temas para el simulador de oposiciones.
Recorre los 133 JSON y verifica estructura, consistencia e inconsistencias.

Se ejecuta con: .venv\Scripts\Activate.ps1 && python scripts/validate_dataset.py
No requiere dependencias externas (solo stdlib).
"""

import json
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Any


# Rutas
ROOT_DIR = Path(__file__).parent.parent
DATASET_DIR = ROOT_DIR / "dataset_temas"
OUTPUT_REPORT = ROOT_DIR / "validation_report.json"


def normalize_text(text: str) -> str:
    """Normaliza texto eliminando espacios extra y caracteres problemáticos."""
    if not text:
        return ""
    # Eliminar espacios al inicio y final
    text = text.strip()
    # Reemplazar saltos de línea múltiples por uno solo
    while "\n\n" in text:
        text = text.replace("\n\n", "\n")
    return text


def validate_opcion_correcta(opcion_correcta: str, opciones: list[str]) -> tuple[bool, str]:
    """
    Verifica que opcion_correcta coincida con alguna de las opciones.
    Devuelve (es_valido, mensaje).
    """
    if not opcion_correcta:
        return False, "opcion_correcta está vacío o es nulo"

    # Normalizar para comparación
    opc_norm = normalize_text(opcion_correcta)

    for opt in opciones:
        opt_norm = normalize_text(opt)
        if opc_norm == opt_norm:
            return True, ""

    # Intentar comparación sin el prefijo (A. B. C. D.)
    opc_base = opc_norm
    for prefix in ["A.", "B.", "C.", "D."]:
        if opc_base.startswith(prefix):
            opc_base = opc_norm[len(prefix):].strip()
            break

    for opt in opciones:
        opt_norm = normalize_text(opt)
        opt_base = opt_norm
        for prefix in ["A.", "B.", "C.", "D."]:
            if opt_base.startswith(prefix):
                opt_base = opt_norm[len(prefix):].strip()
                break
        if opc_base == opt_base:
            return True, ""

    return False, f"opcion_correcta '{opcion_correcta}' no coincide con ninguna opción"


def validate_tema(tema_numero: int, data: dict[str, Any]) -> list[str]:
    """Valida un único tema y devuelve lista de errores/warnings."""
    errores = []
    prefijo = f"Tema {tema_numero:03d}"

    # 1. Verificar campos obligatorios
    if "nombre_tema" not in data:
        errores.append(f"{prefijo}: Falca campo 'nombre_tema'")
        return errores  # No se puede continuar sin nombre

    nombre = data.get("nombre_tema", "")
    if not str(nombre).strip():
        errores.append(f"{prefijo}: 'nombre_tema' está vacío")

    if "preguntas" not in data:
        errores.append(f"{prefijo}: Falca campo 'preguntas'")
        return errores

    preguntas = data.get("preguntas", [])
    if not isinstance(preguntas, list):
        errores.append(f"{prefijo}: 'preguntas' no es un array")
        return errores

    if len(preguntas) == 0:
        errores.append(f"{prefijo}: 'preguntas' está vacío (0 preguntas)")
        return errores

    # 2. Validar cada pregunta
    ids_vistos = set()
    for i, preg in enumerate(preguntas):
        id_preg = f"{prefijo} - Pregunta {i+1}"

        if not isinstance(preg, dict):
            errores.append(f"{id_preg}: No es un objeto JSON válido")
            continue

        # Campos obligatorios de pregunta
        for campo in ["id_pregunta", "enunciado", "opciones", "opcion_correcta", "justificacion"]:
            if campo not in preg:
                errores.append(f"{id_preg}: Falca campo '{campo}'")

        # id_pregunta duplicado
        id_orig = preg.get("id_pregunta", "")
        if id_orig in ids_vistos:
            errores.append(f"{id_preg}: Duplicado de id_pregunta '{id_orig}' en el mismo tema")
        ids_vistos.add(id_orig)

        # Enunciado
        enunciado = preg.get("enunciado", "")
        if not str(enunciado).strip():
            errores.append(f"{id_preg}: 'enunciado' está vacío")

        # Opciones
        opciones = preg.get("opciones", [])
        if not isinstance(opciones, list):
            errores.append(f"{id_preg}: 'opciones' no es un array")
        elif len(opciones) != 4:
            errores.append(f"{id_preg}: 'opciones' tiene {len(opciones)} elementos (se esperan 4)")

        # Validar que cada opción tenga texto
        if isinstance(opciones, list):
            for j, opt in enumerate(opciones):
                if not str(opt).strip():
                    errores.append(f"{id_preg}: Opción [{j+1}] está vacía")

        # Validar que las opciones no estén duplicadas entre sí
        if isinstance(opciones, list) and len(opciones) == 4:
            opts_norm = [normalize_text(str(o)) for o in opciones]
            opts_unique = set(opts_norm)
            if len(opts_unique) < 4:
                errores.append(f"{id_preg}: Hay opciones duplicadas entre sí")

        # Validar opcion_correcta
        opc_correcta = preg.get("opcion_correcta", "")
        if isinstance(opciones, list) and len(opciones) == 4 and opc_correcta:
            es_valido, msg = validate_opcion_correcta(str(opc_correcta), opciones)
            if not es_valido:
                errores.append(f"{id_preg}: {msg}")

        # Justificación
        justificacion = preg.get("justificacion", "")
        if not str(justificacion).strip():
            errores.append(f"{id_preg}: 'justificacion' está vacío")

        # Referencia (opcional, pero advertir si parece incompleta)
        referencia = preg.get("referencia", "")
        if referencia and not str(referencia).strip():
            errores.append(f"{id_preg}: 'referencia' está vacío")

        # Detectar caracteres problemáticos en textos
        for campo_texto in ["enunciado", "justificacion", "referencia"]:
            valor = str(preg.get(campo_texto, ""))
            # Detectar HTML no procesado
            if "<" in valor and ">" in valor:
                errores.append(f"{id_preg}: '{campo_texto}' contiene posible HTML/markdown residual")
            # Detectar caracteres de control
            for char in valor:
                if ord(char) < 32 and char not in "\n\r\t":
                    errores.append(f"{id_preg}: '{campo_texto}' contiene carácter de control no imprimible (U+{ord(char):04X})")
                    break

    # 3. Advertencia si el tema tiene muy pocas preguntas
    if 0 < len(preguntas) < 10:
        errores.append(f"{prefijo}: ⚠️ Solo {len(preguntas)} preguntas (puede ser insuficiente para simulación)")

    return errores


def main():
    print("=" * 70)
    print("VALIDACIÓN DE DATASET - Simulador de Oposiciones A1")
    print("=" * 70)
    print(f"Directorio de datos: {DATASET_DIR}")
    print(f"Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()

    if not DATASET_DIR.exists():
        print(f"ERROR: El directorio '{DATASET_DIR}' no existe.")
        sys.exit(1)

    # Encontrar todos los JSON
    json_files = sorted(DATASET_DIR.glob("dataset_tema*.json"))
    total_archivos = len(json_files)

    if total_archivos == 0:
        print(f"ERROR: No se encontraron archivos JSON en '{DATASET_DIR}'.")
        sys.exit(1)

    print(f"Se encontraron {total_archivos} archivos JSON.")
    print()

    # Validar cada tema
    todos_errores = []
    temas_validados = 0
    total_preguntas = 0
    temas_con_advertencias = 0
    resumen_por_tema = {}

    for filepath in json_files:
        tema_numero_str = filepath.stem.replace("dataset_tema", "")
        try:
            tema_numero = int(tema_numero_str)
        except ValueError:
            todos_errores.append(f"{filepath.name}: No se puede extraer número del nombre de archivo")
            continue

        try:
            with open(filepath, "r", encoding="utf-8") as f:
                data = json.load(f)
        except json.JSONDecodeError as e:
            todos_errores.append(f"{filepath.name}: Error al parsear JSON: {e}")
            continue
        except UnicodeDecodeError as e:
            todos_errores.append(f"{filepath.name}: Error de codificación: {e}")
            continue

        temas_validados += 1
        preguntas = data.get("preguntas", []) if isinstance(data, dict) else []
        num_preguntas = len(preguntas) if isinstance(preguntas, list) else 0
        total_preguntas += num_preguntas

        errores_tema = validate_tema(tema_numero, data)

        if errores_tema:
            for err in errores_tema:
                todos_errores.append(err)
            temas_con_advertencias += 1

        resumen_por_tema[f"tema_{tema_numero:03d}"] = {
            "archivo": filepath.name,
            "preguntas": num_preguntas,
            "errores": len(errores_tema),
        }

    # Generar informe
    informe = {
        "metadata": {
            "fecha_validacion": datetime.now().isoformat(),
            "directorio_dataset": str(DATASET_DIR),
            "archivos_encontrados": total_archivos,
            "temas_validados": temas_validados,
            "total_preguntas": total_preguntas,
            "temas_con_advertencias": temas_con_advertencias,
        },
        "resumen": {
            "total_errores": len(todos_errores),
            "archivos_sin_error": temas_validados - temas_con_advertencias,
            "archivos_con_error": temas_con_advertencias,
        },
        "detalles": todos_errores,
        "por_tema": resumen_por_tema,
    }

    # Guardar informe
    with open(OUTPUT_REPORT, "w", encoding="utf-8") as f:
        json.dump(informe, f, ensure_ascii=False, indent=2)

    # Mostrar resumen en consola
    print("-" * 70)
    print("RESUMEN DE VALIDACIÓN")
    print("-" * 70)
    print(f"  Temas validados:        {temas_validados}")
    print(f"  Total preguntas:         {total_preguntas}")
    print(f"  Temas sin errores:       {temas_validados - temas_con_advertencias}")
    print(f"  Temas con advertencias:  {temas_con_advertencias}")
    print(f"  Total de incidencias:    {len(todos_errores)}")
    print()

    if todos_errores:
        print("-" * 70)
        print("INCIDENCIAS DETECTADAS:")
        print("-" * 70)
        for i, err in enumerate(todos_errores, 1):
            print(f"  {i:4d}. {err}")
        print()

        # Clasificar por tipo
        warnings = [e for e in todos_errores if "⚠️" in e]
        errors = [e for e in todos_errores if "⚠️" not in e]
        if warnings:
            print(f"  ⚠️  Advertencias: {len(warnings)}")
        if errors:
            print(f"  ❌ Errores críticos: {len(errors)}")
        print()

    print(f"Informe completo guardado en: {OUTPUT_REPORT}")
    print("=" * 70)

    # Salir con código no cero si hay errores críticos
    if len(todos_errores) > 0:
        sys.exit(1)
    else:
        print("✅ Dataset validado correctamente. Sin incidencias.")
        sys.exit(0)


if __name__ == "__main__":
    main()
