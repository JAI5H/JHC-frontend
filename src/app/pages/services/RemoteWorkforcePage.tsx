import ServiceLayout from "../../../components/services/ServiceLayout";
import { useLanguage } from "../../providers/LanguageProvider";
import { servicesContent } from "../../../data/servicesContent";
import { usePageMetadata } from "../../hooks/usePageMetadata";

export default function RemoteWorkforcePage() {
  const { language } = useLanguage();
  const service = servicesContent["remote-workforce"];
  const isArabic = language === "ar";

  usePageMetadata({
    title: "Remote Workforce Solutions | JHC",
    description: service.overviewEn,
    canonicalUrl: "https://www.jisrhc.com/services/remote-workforce",
    ogTitle: "Remote Workforce Solutions | JHC",
    ogDescription: service.overviewEn,
    ogUrl: "https://www.jisrhc.com/services/remote-workforce",
    ogType: "website",
    twitterTitle: "Remote Workforce Solutions | JHC",
    twitterDescription: service.overviewEn,
  });

  return (
    <ServiceLayout
      title={isArabic ? service.titleAr : service.titleEn}
      subtitle={isArabic ? service.subtitleAr : service.subtitleEn}
      overview={isArabic ? service.overviewAr : service.overviewEn}
      ctaText={isArabic ? service.ctaAr : service.ctaEn}
      sections={
        isArabic
          ? service.sectionsAr.map((section) => ({
              title: section.titleAr,
              body: section.bodyAr,
            }))
          : service.sectionsEn.map((section) => ({
              title: section.titleEn,
              body: section.bodyEn,
            }))
      }
    />
  );
}
