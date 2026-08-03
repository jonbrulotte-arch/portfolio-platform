import { getSettings } from "@/lib/settings";
import { prisma } from "@/lib/prisma";
import SiteNav from "@/components/public/SiteNav";
export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [settings, navPages] = await Promise.all([
    getSettings(),
    prisma.page.findMany({
      where: { status: "published", inNav: true },
      orderBy: { navOrder: "asc" },
      select: { title: true, slug: true },
    }),
  ]);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteNav
        siteName={settings.siteName}
        pages={navPages}
        accentColor={settings.accentColor}
      />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-gray-100 bg-gray-50 mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>{settings.footerText}</p>
          <div className="flex gap-4">
            {settings.githubUrl && (
              <a href={settings.githubUrl} target="_blank" rel="noopener noreferrer" className="hover:text-gray-900">GitHub</a>
            )}
            {settings.linkedinUrl && (
              <a href={settings.linkedinUrl} target="_blank" rel="noopener noreferrer" className="hover:text-gray-900">LinkedIn</a>
            )}
            {settings.twitterUrl && (
              <a href={settings.twitterUrl} target="_blank" rel="noopener noreferrer" className="hover:text-gray-900">Twitter</a>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
