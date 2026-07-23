import type { LegalPageConfig } from "../types";

export const PRIVACY_POLICY_CONFIG: LegalPageConfig = {
  titleKey: "legal.privacy.title",
  subtitleKey: "legal.privacy.subtitle",
  lastUpdatedKey: "legal.privacy.lastUpdated",
  sections: [
    {
      id: "information-collection",
      titleKey: "legal.privacy.sections.informationCollection.title",
      contentKey: "legal.privacy.sections.informationCollection.content",
    },
    {
      id: "information-use",
      titleKey: "legal.privacy.sections.informationUse.title",
      contentKey: "legal.privacy.sections.informationUse.content",
    },
    {
      id: "cookies",
      titleKey: "legal.privacy.sections.cookies.title",
      contentKey: "legal.privacy.sections.cookies.content",
    },
    {
      id: "data-security",
      titleKey: "legal.privacy.sections.dataSecurity.title",
      contentKey: "legal.privacy.sections.dataSecurity.content",
    },
    {
      id: "third-parties",
      titleKey: "legal.privacy.sections.thirdParties.title",
      contentKey: "legal.privacy.sections.thirdParties.content",
    },
    {
      id: "your-rights",
      titleKey: "legal.privacy.sections.yourRights.title",
      contentKey: "legal.privacy.sections.yourRights.content",
    },
    {
      id: "contact",
      titleKey: "legal.privacy.sections.contact.title",
      contentKey: "legal.privacy.sections.contact.content",
    },
  ],
};

export const TERMS_OF_SERVICE_CONFIG: LegalPageConfig = {
  titleKey: "legal.terms.title",
  subtitleKey: "legal.terms.subtitle",
  lastUpdatedKey: "legal.terms.lastUpdated",
  sections: [
    {
      id: "acceptance",
      titleKey: "legal.terms.sections.acceptance.title",
      contentKey: "legal.terms.sections.acceptance.content",
    },
    {
      id: "services",
      titleKey: "legal.terms.sections.services.title",
      contentKey: "legal.terms.sections.services.content",
    },
    {
      id: "bookings",
      titleKey: "legal.terms.sections.bookings.title",
      contentKey: "legal.terms.sections.bookings.content",
    },
    {
      id: "cancellation",
      titleKey: "legal.terms.sections.cancellation.title",
      contentKey: "legal.terms.sections.cancellation.content",
    },
    {
      id: "liability",
      titleKey: "legal.terms.sections.liability.title",
      contentKey: "legal.terms.sections.liability.content",
    },
    {
      id: "intellectual-property",
      titleKey: "legal.terms.sections.intellectualProperty.title",
      contentKey: "legal.terms.sections.intellectualProperty.content",
    },
    {
      id: "governing-law",
      titleKey: "legal.terms.sections.governingLaw.title",
      contentKey: "legal.terms.sections.governingLaw.content",
    },
    {
      id: "contact",
      titleKey: "legal.terms.sections.contact.title",
      contentKey: "legal.terms.sections.contact.content",
    },
  ],
};
