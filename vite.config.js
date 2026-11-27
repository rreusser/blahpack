import { observable, config } from "@observablehq/notebook-kit/vite";
import { defineConfig } from "vite";
import { resolve } from "path";
import { copyFileSync, mkdirSync } from "fs";

function copyStaticFiles(files) {
  return {
    name: "copy-static-files",
    apply: "build",
    closeBundle() {
      for (const { src, dest } of files) {
        mkdirSync(resolve(import.meta.dirname, "site", dest, ".."), {
          recursive: true,
        });
        copyFileSync(
          resolve(import.meta.dirname, src),
          resolve(import.meta.dirname, "site", dest)
        );
      }
    },
  };
}

export default defineConfig(async ({ command }) => {
  const isDev = command === "serve";

  const { debugNotebook } = isDev
    ? await import("@rreusser/mcp-observable-notebook-kit-debug").catch(
        () => ({})
      )
    : {};

  return {
    ...config(),
    plugins: [
      isDev && debugNotebook?.(),
      observable(),
      copyStaticFiles([{ src: "progress.html", dest: "progress.html" }]),
    ],
    base: process.env.BASE_URL || "/",
    root: "notebooks",
    build: {
      outDir: resolve(import.meta.dirname, "site"),
      emptyOutDir: true,
      rollupOptions: {
        input: [
          resolve(import.meta.dirname, "notebooks/aaa/index.html"),
          resolve(import.meta.dirname, "notebooks/naca/index.html"),
          resolve(import.meta.dirname, "notebooks/pseudospectra/index.html"),
        ],
      },
    },
    server: {
      host: true,
    },
  };
});
