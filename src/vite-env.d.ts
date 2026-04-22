/// <reference types="vite/client" />

declare module '*.css' {
  const content: Record<string, any>;
  export default content;
}

declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}
