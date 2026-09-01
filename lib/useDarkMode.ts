import { useEffect, useState } from "react";

export function useDarkMode() {
  const [isDark, setIsDark] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldBeDark = savedTheme ? savedTheme === "dark" : prefersDark;
    setIsDark(shouldBeDark);
    applyTheme(shouldBeDark);
  }, []);

  const toggleDarkMode = () => {
    const newValue = !isDark;
    setIsDark(newValue);
    localStorage.setItem("theme", newValue ? "dark" : "light");
    applyTheme(newValue);
  };

  const applyTheme = (dark: boolean) => {
    const html = document.documentElement;
    if (dark) {
      html.style.setProperty("--bg", "#1a1a1a");
      html.style.setProperty("--surface", "#2a2a2a");
      html.style.setProperty("--border", "#3a3a3a");
      html.style.setProperty("--ink", "#f0f0f0");
      html.style.setProperty("--ink-muted", "#999999");
    } else {
      html.style.setProperty("--bg", "#ffffff");
      html.style.setProperty("--surface", "#f8f8f8");
      html.style.setProperty("--border", "#e0e0e0");
      html.style.setProperty("--ink", "#1a1a1a");
      html.style.setProperty("--ink-muted", "#666666");
    }
  };

  return { isDark, toggleDarkMode, isMounted };
}
