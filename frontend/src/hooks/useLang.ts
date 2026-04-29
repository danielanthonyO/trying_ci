import { useEffect, useState } from "react";

export type Lang = "en" | "fi";

export function useLang() {
  const [lang, setLang] = useState<Lang>(() => {
    const saved = localStorage.getItem("lang");
    return saved === "fi" ? "fi" : "en";
  });

  useEffect(() => {
    local<Storage.setItem("lang", lang);
  }, [lang]);

  const toggleLang = () => setLang((p) => (p === "en" ? "fi" : "en"));

  return { lang, setLang, toggleLang };
}