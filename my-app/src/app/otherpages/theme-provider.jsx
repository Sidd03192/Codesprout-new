"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeProviderContext = createContext({
  theme: "dark",
  setTheme: () => null,
});

export const ThemeProvider = ({
  children,
  defaultTheme = "dark",
  storageKey = "code-sprout-theme",
}) => {
  const [theme, setTheme] = useState(defaultTheme);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  const setThemeWithStorage = (theme) => {
    localStorage.setItem(storageKey, theme);
    setTheme(theme);
  };

  return (
    <ThemeProviderContext.Provider
      value={{
        theme,
        setTheme: setThemeWithStorage,
      }}
    >
      {children}
    </ThemeProviderContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};
