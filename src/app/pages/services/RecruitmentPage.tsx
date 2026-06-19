import ServiceLayout from "../../../components/services/ServiceLayout";
import { servicesContent } from "../../../data/servicesContent";
import { usePageMetadata } from "../../hooks/usePageMetadata";
import { useLanguage } from "../../providers/LanguageProvider";

export default function RecruitmentPage() {
  const { language } = useLanguage();
  const service = servicesContent.recruitment;
  const isArabic = language === "ar";

  usePageMetadata({
    title: "Professional Recruitment Services | JHC",
    description: service.overviewEn,
    canonicalUrl: "https://www.jisrhc.com/services/recruitment",
    ogTitle: "Professional Recruitment Services | JHC",
    ogDescription: service.overviewEn,
    ogUrl: "https://www.jisrhc.com/services/recruitment",
    ogType: "website",
    twitterTitle: "Professional Recruitment Services | JHC",
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
