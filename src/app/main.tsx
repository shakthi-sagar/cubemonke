import { createRoot } from "react-dom/client"

import "@/styles/index.css"
import App from "@/app/App"
import { ThemeProvider } from "@/components/common/theme-provider"

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <App />
  </ThemeProvider>
)
