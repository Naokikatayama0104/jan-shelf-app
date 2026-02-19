import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    host: true,
    https: {
      key: fs.readFileSync("./192.168.121.82-key.pem"),
      cert: fs.readFileSync("./192.168.121.82.pem")
    }
  }
});