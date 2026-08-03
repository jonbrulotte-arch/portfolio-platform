import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import ProjectCard from "@/components/public/ProjectCard";
import Link from "next/link";

export default async function HomePage() {
  const settings = await getSettings();

  const showHero       = settings.homeShowHero       !== "false";
  const showCategories = settings.homeShowCategories !== "false";
  const showFeatured   = settings.homeShowFeatured   !== "false";
  const showRecent     = settings.homeShowRecent     !== "false";

  const accent = settings.accentColor || "#6366f1";
  const heroStyle = settings.heroStyle || "gradient";
  const heroImage = settings.heroImage || "";
  const heroImageAlt = settings.heroImageAlt || "";

  const [featured, recentProjects, categories] = await Promise.all([
    showFeatured
      ? prisma.project.findMany({
          where: { status: "published", featured: true },
          orderBy: { sortOrder: "asc" },
          take: 3,
          include: {
            category: true,
            tags: { include: { tag: true } },
            screenshots: { orderBy: { sortOrder: "asc" }, take: 1 },
            links: { orderBy: { sortOrder: "asc" } },
          },
        })
      : Promise.resolve([]),
    showRecent
      ? prisma.project.findMany({
          where: { status: "published" },
          orderBy: { publishedAt: "desc" },
          take: 6,
          include: {
            category: true,
            tags: { include: { tag: true } },
            screenshots: { orderBy: { sortOrder: "asc" }, take: 1 },
            links: { orderBy: { sortOrder: "asc" } },
          },
        })
      : Promise.resolve([]),
    showCategories
      ? prisma.category.findMany({
          orderBy: { sortOrder: "asc" },
          include: { _count: { select: { projects: { where: { status: "published" } } } } },
        })
      : Promise.resolve([]),
  ]);

  return (
    <>
      {/* Hero */}
      {showHero && (
        <>
          {/* Image overlay style */}
          {heroStyle === "image-overlay" && heroImage ? (
            <section className="relative min-h-[480px] flex items-center overflow-hidden">
              <img
                src={heroImage}
                alt={heroImageAlt || "Hero background"}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-black/30" />
              <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-8 py-24">
                <div className="max-w-xl">
                  {settings.ownerAvatar && (
                    <img
                      src={settings.ownerAvatar}
                      alt={settings.ownerName || "Owner avatar"}
                      className="w-16 h-16 rounded-full object-cover border-2 border-white/40 mb-6"
                    />
                  )}
                  <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
                    {settings.ownerName || settings.siteName}
                  </h1>
                  {settings.siteTagline && (
                    <p className="text-lg sm:text-xl text-white/80 mb-3">{settings.siteTagline}</p>
                  )}
                  {settings.ownerBio && (
                    <p className="text-white/65 mb-8 leading-relaxed">{settings.ownerBio}</p>
                  )}
                  <HeroButtons settings={settings} accent={accent} dark />
                </div>
              </div>
            </section>
          ) : heroStyle === "split" && heroImage ? (
            /* Split style */
            <section className="bg-gray-950 overflow-hidden">
              <div className="max-w-6xl mx-auto px-6 sm:px-8 flex flex-col lg:flex-row items-center min-h-[440px]">
                <div className="flex-1 py-16 pr-8">
                  {settings.ownerAvatar && (
                    <img
                      src={settings.ownerAvatar}
                      alt={settings.ownerName || "Owner avatar"}
                      className="w-14 h-14 rounded-full object-cover border-2 mb-6"
                      style={{ borderColor: accent }}
                    />
                  )}
                  <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
                    {settings.ownerName || settings.siteName}
                  </h1>
                  {settings.siteTagline && (
                    <p className="text-lg text-white/70 mb-3">{settings.siteTagline}</p>
                  )}
                  {settings.ownerBio && (
                    <p className="text-white/50 mb-8 leading-relaxed max-w-lg">{settings.ownerBio}</p>
                  )}
                  <HeroButtons settings={settings} accent={accent} dark />
                </div>
                <div className="lg:w-[45%] shrink-0 lg:self-stretch relative hidden lg:block">
                  <img
                    src={heroImage}
                    alt={heroImageAlt || "Hero image"}
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/20 to-transparent" />
                </div>
              </div>
            </section>
          ) : (
            /* Default gradient style */
            <section
              className="relative overflow-hidden py-24 px-4 sm:px-6"
              style={{
                background: `linear-gradient(135deg, ${accent}18 0%, white 45%, ${accent}10 100%)`,
              }}
            >
              {/* Decorative blobs */}
              <div
                className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
                style={{ backgroundColor: accent }}
                aria-hidden="true"
              />
              <div
                className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full blur-3xl opacity-15 pointer-events-none"
                style={{ backgroundColor: accent }}
                aria-hidden="true"
              />
              <div className="relative max-w-4xl mx-auto text-center">
                {settings.ownerAvatar && (
                  <div className="flex justify-center mb-6">
                    <img
                      src={settings.ownerAvatar}
                      alt={settings.ownerName || "Owner avatar"}
                      className="w-20 h-20 rounded-full object-cover ring-4 ring-white shadow-lg"
                    />
                  </div>
                )}
                <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-4 leading-tight">
                  {settings.ownerName || settings.siteName}
                </h1>
                {settings.siteTagline && (
                  <p
                    className="text-xl sm:text-2xl font-medium mb-4"
                    style={{ color: accent }}
                  >
                    {settings.siteTagline}
                  </p>
                )}
                {settings.ownerBio && (
                  <p className="text-gray-500 max-w-2xl mx-auto mb-8 text-lg leading-relaxed">{settings.ownerBio}</p>
                )}
                <HeroButtons settings={settings} accent={accent} />
              </div>
            </section>
          )}
        </>
      )}

      {/* Categories */}
      {showCategories && categories.length > 0 && (
        <section className="py-10 px-4 sm:px-6 border-b border-gray-100 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-wrap gap-2.5 justify-center">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/projects?category=${cat.slug}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all hover:shadow-md hover:scale-105"
                  style={{
                    backgroundColor: cat.color ? `${cat.color}12` : "#f5f3ff",
                    borderColor: cat.color ? `${cat.color}40` : "#c4b5fd",
                    color: cat.color ?? accent,
                  }}
                >
                  {cat.icon && <span aria-hidden="true">{cat.icon}</span>}
                  {cat.name}
                  <span className="opacity-50 text-xs">({cat._count.projects})</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured */}
      {showFeatured && featured.length > 0 && (
        <section className="py-16 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <SectionHeading title="Featured Projects" href="/projects" accent={accent} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((p) => (
                <ProjectCard key={p.id} project={p as any} accent={accent} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recent */}
      {showRecent && recentProjects.length > 0 && (
        <section className="py-16 px-4 sm:px-6 bg-gray-50/70">
          <div className="max-w-6xl mx-auto">
            <SectionHeading title="Recent Projects" href="/projects" accent={accent} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentProjects.map((p) => (
                <ProjectCard key={p.id} project={p as any} accent={accent} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

function HeroButtons({ settings, accent, dark = false }: { settings: Record<string,string>; accent: string; dark?: boolean }) {
  return (
    <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
      <Link
        href="/projects"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white shadow-lg hover:opacity-90 transition-all hover:shadow-xl hover:-translate-y-0.5"
        style={{ backgroundColor: accent }}
      >
        Browse Projects
      </Link>
      {settings.githubUrl && (
        <a
          href={settings.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold border transition-all hover:-translate-y-0.5 ${
            dark
              ? "border-white/30 text-white hover:bg-white/10"
              : "border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
          }`}
        >
          GitHub
        </a>
      )}
    </div>
  );
}

function SectionHeading({ title, href, accent }: { title: string; href: string; accent: string }) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-3">
        <div className="w-1 h-6 rounded-full" style={{ backgroundColor: accent }} aria-hidden="true" />
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      </div>
      <Link href={href} className="text-sm font-medium hover:underline" style={{ color: accent }}>
        View all →
      </Link>
    </div>
  );
}
