import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// IMPORTANT for GitHub Pages:
// Set `base` to "/YOUR-REPO-NAME/" (with leading and trailing slashes)
// e.g. if your repo is github.com/imrannazeer/medical-mentor, use "/medical-mentor/"
// If you deploy to a custom domain or use username.github.io root repo, use "/"
export default defineConfig({
  plugins: [react()],
  base: "/medical-mentor/",
});
