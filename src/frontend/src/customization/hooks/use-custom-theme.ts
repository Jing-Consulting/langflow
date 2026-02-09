// Custom Hook to manage theme logic

import { useEffect, useState } from "react";
import { useDarkStore } from "@/stores/darkStore";

const useTheme = () => {
  const [systemTheme, setSystemTheme] = useState(false);
  const { setDark, dark, setMacp, macp } = useDarkStore((state) => ({
    setDark: state.setDark,
    dark: state.dark,
    setMacp: state.setMacp,
    macp: state.macp,
  }));

  const handleSystemTheme = () => {
    if (typeof window !== "undefined") {
      const systemDarkMode = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      setDark(systemDarkMode);
    }
  };

  useEffect(() => {
    const themePreference = localStorage.getItem("themePreference");
    if (themePreference === "light") {
      setDark(false);
      setMacp(false);
      setSystemTheme(false);
    } else if (themePreference === "dark") {
      setDark(true);
      setMacp(false);
      setSystemTheme(false);
    } else if (themePreference === "macp") {
      setDark(false);
      setMacp(true);
      setSystemTheme(false);
    } else {
      // Default to system theme
      setSystemTheme(true);
      handleSystemTheme();
    }
  }, []);

  useEffect(() => {
    if (systemTheme && typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = (e) => {
        setDark(e.matches);
      };
      mediaQuery.addEventListener("change", handleChange);
      return () => {
        mediaQuery.removeEventListener("change", handleChange);
      };
    }
  }, [systemTheme]);

  const setThemePreference = (theme) => {
    if (theme === "light") {
      setDark(false);
      setMacp(false);
      setSystemTheme(false);
    } else if (theme === "dark") {
      setDark(true);
      setMacp(false);
      setSystemTheme(false);
    } else if (theme === "macp") {
      setDark(false);
      setMacp(true);
      setSystemTheme(false);
    } else {
      setSystemTheme(true);
      handleSystemTheme();
    }
    localStorage.setItem("themePreference", theme);
  };

  return { systemTheme, dark, macp, setThemePreference };
};

export default useTheme;
