import { landing as landingEn } from "./en/landing";
import { talentNetwork as talentNetworkEn } from "./en/talentNetwork";
import { landing as landingAr } from "./ar/landing";
import { talentNetwork as talentNetworkAr } from "./ar/talentNetwork";

export const translations = {
  ar: {
    landing: landingAr,
    talentNetwork: talentNetworkAr,
  },
  en: {
    landing: landingEn,
    talentNetwork: talentNetworkEn,
  },
} as const;

export type TranslationDictionary = typeof translations.en;
