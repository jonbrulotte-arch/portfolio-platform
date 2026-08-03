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
    openGraph: page.ogImage ? { images: [{ url: page.ogImage }] } : undefined,
  };
}


export default async function DynamicPage({ params }: Props) {
  const page = await prisma.page.findUnique({
    where: { slug: params.slug, status: "published" },
  });

  if (!page) notFound();

  return (
    <div>
      {/* Hero banner image */}
      {page.heroImage ? (
        <div className="relative h-56 sm:h-72 md:h-80 overflow-hidden bg-gray-900">
          <img
            src={page.heroImage}
            alt={page.heroImageAlt ?? page.title}
            className="w-full h-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 max-w-3xl mx-auto px-4 sm:px-6 pb-8">
            <nav className="text-sm text-white/70 mb-3">
              <Link href="/" className="hover:text-white">Home</Link>
              <span className="mx-2">/</span>
              <span className="text-white/90">{page.title}</span>
            </nav>
            <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">{page.title}</h1>
          </div>
        </div>
      ) : null}

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        {!page.heroImage && (
          <>
            <nav className="text-sm text-gray-400 mb-8">
              <Link href="/" className="hover:text-gray-600">Home</Link>
              <span className="mx-2">/</span>
              <span className="text-gray-600">{page.title}</span>
            </nav>
            <h1 className="text-4xl font-bold text-gray-900 mb-8">{page.title}</h1>
          </>
        )}
        {page.heroImage && <div className="mb-8" />}
        {page.content && (
          <div
            className="prose prose-gray max-w-none prose-headings:font-bold prose-a:text-indigo-600 prose-img:rounded-xl prose-img:shadow-md"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        )}
      </div>
    </div>
  );
}
