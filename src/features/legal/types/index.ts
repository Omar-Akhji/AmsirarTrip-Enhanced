export type LegalSection = { id: string; titleKey: string; contentKey: string };

export type LegalPageConfig = {
  titleKey: string;
  subtitleKey: string;
  lastUpdatedKey: string;
  sections: LegalSection[];
};
