import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    vue(),
    dts({
      insertTypesEntry: true,
      copyDtsFiles: true,
      outDir: "./types",
      exclude: ["**/*.test.*", "**/*.spec.*"],
      rollupTypes: false, // 改为 false，保持文件结构
      include: ["src/**/*"], // 明确指定包含的文件
      staticImport: true, // 保持静态导入
      beforeWriteFile: (filePath, content) => {
        // 可选：自定义文件写入前的处理
        return { filePath, content };
      }
    })
  ],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "XGanttVue",
      formats: ["es", "umd"],
      fileName: format => `index.${format === "es" ? "js" : "umd.cjs"}`
    },
    rollupOptions: {
      external: ["vue", "@huang_zengrong/kingdee-xk-gantt-core"],
      output: {
        globals: {
          vue: "Vue",
          "@huang_zengrong/kingdee-xk-gantt-core": "XGanttCore"
        },
        assetFileNames: assetInfo => {
          const assetsFileType = assetInfo.name?.split(".")[1];
          if (assetsFileType === "css") return "style.css";
          return assetInfo.name || "";
        }
      }
    }
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src")
    }
  }
});
