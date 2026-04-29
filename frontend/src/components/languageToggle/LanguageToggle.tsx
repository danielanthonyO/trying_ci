import { useTranslation } from "react-i18next";
import styles from "./LanguageToggle.module.css";
const languages = ["en", "fi", "sv"];

const LanguageToggle = () => {
  const { i18n } = useTranslation();

  const handleChange = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("lang", lang);
  };

  return (
    <div className={styles.btnWrapper}>
      {languages.map((lang) => (
        <button
          key={lang}
          value={lang}
          onClick={() => handleChange(lang)}
          style={{ fontWeight: i18n.language === lang ? "bold" : "normal" }}
          className={styles.btn}
        >
          {lang.toUpperCase()}
        </button>
      ))}
    </div>
  );
};

export default LanguageToggle;
