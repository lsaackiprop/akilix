import type { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/src/constants/config";
import { ROUTES } from "@/src/constants/routes";
import { subjects } from "@/src/data/subjects";
import { learningLevels } from "@/src/data/learningLevels";
import { resources } from "@/src/data/resources";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_CONFIG.url}${ROUTES.HOME}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_CONFIG.url}${ROUTES.SEARCH}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_CONFIG.url}${ROUTES.PRICING}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_CONFIG.url}${ROUTES.CONTACT}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_CONFIG.url}${ROUTES.LOGIN}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${SITE_CONFIG.url}${ROUTES.REGISTER}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];

  const subjectRoutes: MetadataRoute.Sitemap = subjects.map((s) => ({
    url: `${SITE_CONFIG.url}${ROUTES.SEARCH}?subject=${s.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const levelRoutes: MetadataRoute.Sitemap = learningLevels.map((l) => ({
    url: `${SITE_CONFIG.url}${ROUTES.SEARCH}?level=${l.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const resourceRoutes: MetadataRoute.Sitemap = resources.map((r) => ({
    url: `${SITE_CONFIG.url}${ROUTES.RESOURCE}/${r.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.65,
  }));

  return [...staticRoutes, ...subjectRoutes, ...levelRoutes, ...resourceRoutes];
}
