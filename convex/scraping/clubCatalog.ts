type ClubProfile = {
  name: string;
  slug: string;
  websiteUrl?: string;
};

const ALIAS_PROFILES: Array<ClubProfile & { aliases: string[]; sourceHosts?: string[] }> = [
  {
    name: 'Club Aquarium',
    slug: 'club-aquarium',
    websiteUrl: 'https://club-aquarium.de',
    aliases: ['club aquarium', 'club aquarium e v'],
    sourceHosts: ['club-aquarium.de'],
  },
  {
    name: 'Club 11',
    slug: 'club-11',
    websiteUrl: 'https://clubelf.de',
    aliases: ['club 11', 'club 11 e v'],
    sourceHosts: ['clubelf.de'],
  },
  {
    name: 'CountDown',
    slug: 'countdown',
    websiteUrl: 'https://countdowndresden.de',
    aliases: ['countdown'],
    sourceHosts: ['countdowndresden.de'],
  },
  {
    name: 'GAG 18',
    slug: 'gag-18',
    websiteUrl: 'https://www.gag-18.com',
    aliases: ['kellerklub gag 18', 'kellerklub gag 18 e v', 'gag 18'],
    sourceHosts: ['gag-18.com', 'www.gag-18.com'],
  },
  {
    name: 'Neue Mensa',
    slug: 'neue-mensa',
    websiteUrl: 'https://neue-mensa.de',
    aliases: ['foyer der neuen mensa', 'bierstube', 'neue mensa'],
    sourceHosts: ['neue-mensa.de'],
  },
  {
    name: 'Club HängeMathe',
    slug: 'club-haengemathe',
    websiteUrl: 'https://www.club-haengemathe.de',
    aliases: ['club hangemathe', 'club hängemathe'],
    sourceHosts: ['club-haengemathe.de', 'www.club-haengemathe.de'],
  },
  {
    name: 'Club Traumtänzer',
    slug: 'club-traumtaenzer',
    websiteUrl: 'https://club-traumtaenzer.de',
    aliases: ['club traumtanzer', 'club traumtänzer', 'club traumtanzer e v', 'club traumtänzer e v'],
    sourceHosts: ['club-traumtaenzer.de'],
  },
  {
    name: 'Wu5',
    slug: 'wu5',
    websiteUrl: 'https://wu5.de',
    aliases: ['studentenclub wu5', 'studentenclub wu5 e v', 'wu5'],
    sourceHosts: ['wu5.de'],
  },
];

function normalizeLookupValue(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\be\.?\s*v\.?\b/g, ' ')
    .replace(/\bstudentenclub\b/g, ' ')
    .replace(/\bclub\b(?=\s+\d)/g, 'club')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function parseHost(sourceUrl?: string) {
  if (!sourceUrl) {
    return null;
  }

  try {
    return new URL(sourceUrl).hostname.toLowerCase();
  } catch {
    return null;
  }
}

export function resolveClubProfile(rawClubName: string, sourceUrl?: string): ClubProfile {
  const normalizedName = normalizeLookupValue(rawClubName);
  const host = parseHost(sourceUrl);

  for (const profile of ALIAS_PROFILES) {
    if (profile.aliases.some((alias) => normalizeLookupValue(alias) === normalizedName)) {
      return profile;
    }
  }

  if (host) {
    for (const profile of ALIAS_PROFILES) {
      if (profile.sourceHosts?.includes(host)) {
        return profile;
      }
    }
  }

  const fallbackName = rawClubName.replace(/\be\.?\s*v\.?\b/gi, '').replace(/\s+/g, ' ').trim();
  return {
    name: fallbackName,
    slug: normalizeLookupValue(fallbackName).replace(/[^a-z0-9]+/g, '-'),
  };
}
