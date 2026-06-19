import { useEffect } from "react";

type PageMetadata = {
  canonicalUrl: string;
  description: string;
  ogDescription: string;
  ogTitle: string;
  ogType: string;
  ogUrl: string;
  title: string;
  twitterDescription: string;
  twitterTitle: string;
};

function getOrCreateMeta(selector: string, attributeName: "name" | "property", attributeValue: string) {
  const existingMeta = document.head.querySelector<HTMLMetaElement>(selector);

  if (existingMeta) {
    return { element: existingMeta, existed: true };
  }

  const meta = document.createElement("meta");
  meta.setAttribute(attributeName, attributeValue);
  document.head.appendChild(meta);
  return { element: meta, existed: false };
}

function getOrCreateCanonicalLink() {
  const existingLink = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');

  if (existingLink) {
    return { element: existingLink, existed: true };
  }

  const link = document.createElement("link");
  link.setAttribute("rel", "canonical");
  document.head.appendChild(link);
  return { element: link, existed: false };
}

export function usePageMetadata(metadata: PageMetadata) {
  useEffect(() => {
    const previousTitle = document.title;

    const descriptionMeta = getOrCreateMeta('meta[name="description"]', "name", "description");
    const previousDescription = descriptionMeta.element.getAttribute("content");

    const ogTitleMeta = getOrCreateMeta('meta[property="og:title"]', "property", "og:title");
    const previousOgTitle = ogTitleMeta.element.getAttribute("content");

    const ogDescriptionMeta = getOrCreateMeta('meta[property="og:description"]', "property", "og:description");
    const previousOgDescription = ogDescriptionMeta.element.getAttribute("content");

    const ogUrlMeta = getOrCreateMeta('meta[property="og:url"]', "property", "og:url");
    const previousOgUrl = ogUrlMeta.element.getAttribute("content");

    const ogTypeMeta = getOrCreateMeta('meta[property="og:type"]', "property", "og:type");
    const previousOgType = ogTypeMeta.element.getAttribute("content");

    const twitterTitleMeta = getOrCreateMeta('meta[name="twitter:title"]', "name", "twitter:title");
    const previousTwitterTitle = twitterTitleMeta.element.getAttribute("content");

    const twitterDescriptionMeta = getOrCreateMeta('meta[name="twitter:description"]', "name", "twitter:description");
    const previousTwitterDescription = twitterDescriptionMeta.element.getAttribute("content");

    const canonicalLink = getOrCreateCanonicalLink();
    const previousCanonicalHref = canonicalLink.element.getAttribute("href");

    document.title = metadata.title;
    descriptionMeta.element.setAttribute("content", metadata.description);
    ogTitleMeta.element.setAttribute("content", metadata.ogTitle);
    ogDescriptionMeta.element.setAttribute("content", metadata.ogDescription);
    ogUrlMeta.element.setAttribute("content", metadata.ogUrl);
    ogTypeMeta.element.setAttribute("content", metadata.ogType);
    twitterTitleMeta.element.setAttribute("content", metadata.twitterTitle);
    twitterDescriptionMeta.element.setAttribute("content", metadata.twitterDescription);
    canonicalLink.element.setAttribute("href", metadata.canonicalUrl);

    return () => {
      document.title = previousTitle;

      if (previousDescription) {
        descriptionMeta.element.setAttribute("content", previousDescription);
      } else if (!descriptionMeta.existed) {
        descriptionMeta.element.remove();
      }

      if (previousOgTitle) {
        ogTitleMeta.element.setAttribute("content", previousOgTitle);
      } else if (!ogTitleMeta.existed) {
        ogTitleMeta.element.remove();
      }

      if (previousOgDescription) {
        ogDescriptionMeta.element.setAttribute("content", previousOgDescription);
      } else if (!ogDescriptionMeta.existed) {
        ogDescriptionMeta.element.remove();
      }

      if (previousOgUrl) {
        ogUrlMeta.element.setAttribute("content", previousOgUrl);
      } else if (!ogUrlMeta.existed) {
        ogUrlMeta.element.remove();
      }

      if (previousOgType) {
        ogTypeMeta.element.setAttribute("content", previousOgType);
      } else if (!ogTypeMeta.existed) {
        ogTypeMeta.element.remove();
      }

      if (previousTwitterTitle) {
        twitterTitleMeta.element.setAttribute("content", previousTwitterTitle);
      } else if (!twitterTitleMeta.existed) {
        twitterTitleMeta.element.remove();
      }

      if (previousTwitterDescription) {
        twitterDescriptionMeta.element.setAttribute("content", previousTwitterDescription);
      } else if (!twitterDescriptionMeta.existed) {
        twitterDescriptionMeta.element.remove();
      }

      if (previousCanonicalHref) {
        canonicalLink.element.setAttribute("href", previousCanonicalHref);
      } else if (!canonicalLink.existed) {
        canonicalLink.element.remove();
      }
    };
  }, [metadata]);
}
