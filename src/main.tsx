import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// THEME INIT (LLT)
// -------------------------------------------------
// Priority:
// 1. Saved user preference
// 2. System preference
// 3. Default: light

const savedTheme = localStorage.getItem("llt-theme");

if (savedTheme === "dark") {
  document.documentElement.classList.add("dark");
} else if (savedTheme === "light") {
  document.documentElement.classList.remove("dark");
} else {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (prefersDark) {
    document.documentElement.classList.add("dark");
  }
}

createRoot(document.getElementById("root")!).render(<App />);
