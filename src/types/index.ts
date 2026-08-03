export type ProjectStatus = "draft" | "published" | "archived" | "scheduled";
export type DevStatus = "active" | "maintained" | "experimental" | "deprecated" | "completed" | "wip";
export type PageStatus = "draft" | "published" | "archived" | "scheduled";

export interface ProjectWithRelations {
  id: string;
  title: string;
  slug: string;
  shortDesc: string | null;
  description: string | null;
  status: string;
  devStatus: string;
  featured: boolean;
  sortOrder: number;
  categoryId: string | null;
  techStack: string | null;
  repoUrl: string | null;
  liveUrl: string | null;
  embedCode: string | null;
  seoTitle: string | null;
  seoDesc: string | null;
  ogImage: string | null;
  publishedAt: Date | null;
  scheduledAt: Date | null;
  archivedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  category: { id: string; name: string; slug: string; color: string | null; icon: string | null } | null;
  tags: { tag: { id: string; name: string; slug: string } }[];
  screenshots: { id: string; url: string; alt: string | null; caption: string | null; sortOrder: number }[];
  links: { id: string; label: string; url: string; icon: string | null; sortOrder: number }[];
}
