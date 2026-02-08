import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";


export default defineConfig({
  plugins: [
    tsconfigPaths({
      root: "./",
      projects: ["tsconfig.web.json"], // <-- point to your web tsconfig
    }),
    viteStaticCopy({
      targets: [
        {
          src: "build/module.wasm",
          dest: "build",
        },
        {
          src: "build/module.wasm.map",
          dest: "build",
        },
      ],
    }),
  ],
  server: {
    open: true,
    port: 5173,
  },

  build: {
    target: "esnext",
    commonjsOptions: {
      include: [],
      transformMixedEsModules: false,
    },
    rollupOptions: {
      treeshake: {
        moduleSideEffects: (id) => id.includes("inkjs") || id.includes("src"),
      },
    },
  },
  optimizeDeps: {
    include: ["inkjs/full"],

    esbuildOptions: {
      target: "esnext",
    },
  },
  resolve: {
    alias: {
      "react-native-wgpu": path.resolve(__dirname, "src/shims/react-native-wgpu.ts"),
      "react-native": path.resolve(__dirname, "src/shims/react-native-web.ts"),
      "react-native-fs": path.resolve(__dirname, "src/shims/react-native-fs.ts"), // empty stub for web
      "expo-asset": path.resolve(__dirname, "src/shims/expo-asset.ts"),
    },
    extensions: [".ts", ".js", ".json"],
  },
  base: "./",
});
