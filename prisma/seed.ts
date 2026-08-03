import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("admin123", 12);
  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      password,
      name: "Admin",
      role: "admin",
    },
  });

  const defaultSettings = [
    { key: "siteName", value: "My Portfolio" },
    { key: "siteTagline", value: "Software Projects & Experiments" },
    { key: "siteDescription", value: "A collection of software projects, tools, and experiments." },
    { key: "ownerName", value: "Portfolio Owner" },
    { key: "accentColor", value: "#6366f1" },
    { key: "footerText", value: "Built with care." },
  ];

  for (const s of defaultSettings) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    });
  }

  const webCategory = await prisma.category.upsert({
    where: { slug: "web" },
    update: {},
    create: { name: "Web", slug: "web", color: "#6366f1", icon: "🌐" },
  });

  const cliCategory = await prisma.category.upsert({
    where: { slug: "cli" },
    update: {},
    create: { name: "CLI Tools", slug: "cli", color: "#22c55e", icon: "⌨️" },
  });

  const demoTag = await prisma.tag.upsert({
    where: { slug: "demo" },
    update: {},
    create: { name: "Demo", slug: "demo" },
  });

  const openSourceTag = await prisma.tag.upsert({
    where: { slug: "open-source" },
    update: {},
    create: { name: "Open Source", slug: "open-source" },
  });

  const project = await prisma.project.upsert({
    where: { slug: "example-project" },
    update: {},
    create: {
      title: "Example Project",
      slug: "example-project",
      shortDesc: "A demonstration project to showcase the platform capabilities.",
      description: `## Overview

This is an example project showcasing how the portfolio platform works.

## Features

- Rich text descriptions with markdown support
- Screenshots, links, and embed codes
- Category and tag organization
- Version history

## Technical Details

Built to demonstrate the full capabilities of the portfolio platform.`,
      status: "published",
      devStatus: "active",
      featured: true,
      categoryId: webCategory.id,
      techStack: JSON.stringify(["Next.js", "TypeScript", "Prisma", "Tailwind CSS"]),
      repoUrl: "https://github.com/example/example-project",
      publishedAt: new Date(),
      links: {
        create: [
          { label: "GitHub", url: "https://github.com/example/example-project", icon: "github" },
          { label: "Live Demo", url: "https://example.com", icon: "globe" },
        ],
      },
      tags: {
        create: [
          { tagId: demoTag.id },
          { tagId: openSourceTag.id },
        ],
      },
    },
  });

  console.log("Seed complete.");
  console.log("Admin login: admin@example.com / admin123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
