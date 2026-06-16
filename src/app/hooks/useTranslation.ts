import { useLanguage } from "../providers/LanguageProvider";
import { translations } from "../../locales";

export function useTranslation() {
  const { language } = useLanguage();
  return translations[language] ?? translations.en;
}
