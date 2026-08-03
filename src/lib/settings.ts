import { prisma } from "./prisma";

export const SETTING_KEYS = {
  siteName: "siteName",
  siteTagline: "siteTagline",
  siteDescription: "siteDescription",
  ownerName: "ownerName",
  ownerEmail: "ownerEmail",
  ownerBio: "ownerBio",
  ownerAvatar: "ownerAvatar",
  githubUrl: "githubUrl",
  linkedinUrl: "linkedinUrl",
  twitterUrl: "twitterUrl",
  accentColor: "accentColor",
  footerText: "footerText",
  analyticsId: "analyticsId",
  ogDefaultImage: "ogDefaultImage",
} as const;

export type SettingKey = keyof typeof SETTING_KEYS;

const defaults: Record<string, string> = {
  siteName: "My Portfolio",
  siteTagline: "Software Projects & Experiments",
  siteDescription: "A collection of software projects, tools, and experiments.",
  ownerName: "Portfolio Owner",
  accentColor: "#6366f1",
  footerText: "Built with care.",
  // Homepage section visibility (default all on)
  homeShowHero: "true",
  homeShowCategories: "true",
  homeShowFeatured: "true",
  homeShowRecent: "true",
};

export async function getSettings(): Promise<Record<string, string>> {
  const rows = await prisma.siteSetting.findMany();
  const result: Record<string, string> = { ...defaults };
  for (const row of rows) result[row.key] = row.value;
  return result;
}

export async function getSetting(key: string): Promise<string> {
  const row = await prisma.siteSetting.findUnique({ where: { key } });
  return row?.value ?? defaults[key] ?? "";
}

export async function setSetting(key: string, value: string) {
  await prisma.siteSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}
