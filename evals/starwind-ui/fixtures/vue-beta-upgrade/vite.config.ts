import { getThemeInitScript } from "@starwind-ui/vue/theme";
import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";
import { defineConfig, type Plugin } from "vite";

function starwindThemeInitPlugin(): Plugin {
  return {
    name: "starwind-theme-init",
    transformIndexHtml() {
      return [
        {
          tag: "script",
          attrs: { "data-starwind-theme-init": "" },
          children: getThemeInitScript(),
          injectTo: "head-prepend",
        },
      ];
    },
  };
}

export default defineConfig({
  plugins: [vue(), tailwindcss(), starwindThemeInitPlugin()],
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
});
