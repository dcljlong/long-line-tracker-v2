import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initThemeFromStorage } from "@/lib/theme";

// Single source of truth for theme:
// - mode stored under llt:mode (light|dark)
// - palette stored under llt:theme (default|forest|ocean|ember|slate)
initThemeFromStorage();

createRoot(document.getElementById("root")!).render(<App />);
