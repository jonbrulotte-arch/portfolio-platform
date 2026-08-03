import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getSettings } from "@/lib/settings";
import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await prisma.page.findUnique({ where: { slug: params.slug, status: "published" } });
  if (!page) return {};
  const s = await getSettings();
  return {
    title: page.seoTitle ?? page.title,
    description: page.seoDesc ?? s.siteDescription,
  };
}

function markdownToHtml(text: string): string {
  return text
    .replace(/^#{3} (.+)$/gm, "<h3>$1</h3>")
    .replace(/^#{2} (.+)$/gm, "<h2>$1</h2>")
    .replace(/^#{1} (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`)
    .replace(/\n\n/g, "</p><p>")
    .replace(/^(?!<[h|u|o|l|p|b|i])(.+)$/gm, "<p>$1</p>")
    .replace(/<p><\/p>/g, "");
}

export default async function DynamicPage({ params }: Props) {
  const page = await prisma.page.findUnique({
    where: { slug: params.slug, status: "published" },
  });

  if (!page) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <nav className="text-sm text-gray-400 mb-8">
        <Link href="/" className="hover:text-gray-600">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-600">{page.title}</span>
      </nav>
      <h1 className="text-4xl font-bold text-gray-900 mb-8">{page.title}</h1>
      {page.content && (
        <div
          className="prose-content"
          dangerouslySetInnerHTML={{ __html: markdownToHtml(page.content) }}
        />
      )}
    </div>
  );
}
