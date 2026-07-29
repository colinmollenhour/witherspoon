export const LICENSE_IDS = [
  'all-rights-reserved',
  'cc-by-nc-nd-4.0',
  'cc-by-4.0',
  'cc0-1.0',
] as const;

export type CourseLicenseId = (typeof LICENSE_IDS)[number];

export interface CourseLicense {
  id: CourseLicenseId;
  holder: string | null;
  year: number;
}

interface LicenseInfo {
  label: string;
  url: string | null;
  verb: 'Licensed under' | 'Dedicated under' | null;
}

const LICENSE_INFO: Record<CourseLicenseId, LicenseInfo> = {
  'all-rights-reserved': {
    label: 'All rights reserved',
    url: null,
    verb: null,
  },
  'cc-by-nc-nd-4.0': {
    label: 'CC BY-NC-ND 4.0',
    url: 'https://creativecommons.org/licenses/by-nc-nd/4.0/',
    verb: 'Licensed under',
  },
  'cc-by-4.0': {
    label: 'CC BY 4.0',
    url: 'https://creativecommons.org/licenses/by/4.0/',
    verb: 'Licensed under',
  },
  'cc0-1.0': {
    label: 'CC0 1.0',
    url: 'https://creativecommons.org/publicdomain/zero/1.0/',
    verb: 'Dedicated under',
  },
};

export function licenseInfo(license: CourseLicense): LicenseInfo & { copyright: string } {
  return {
    ...LICENSE_INFO[license.id],
    copyright: license.holder ? `© ${license.year} ${license.holder}.` : '',
  };
}
