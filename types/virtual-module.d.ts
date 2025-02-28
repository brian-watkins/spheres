declare module 'virtual:spheres/vite' {
  import type { Manifest } from "vite"
  
  interface ViteContext {
    command: "serve" | "build"
    manifest: Manifest | undefined
  }
  
  const context: ViteContext;
}
