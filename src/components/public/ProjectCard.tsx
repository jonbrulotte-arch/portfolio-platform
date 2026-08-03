import Link from "next/link";
import { devStatusColor, devStatusLabel } from "@/lib/utils";
import type { ProjectWithRelations } from "@/types";

export default function ProjectCard({ project, accent }: { project: ProjectWithRelations; accent?: string }) {
  const techStack = project.techStack ? JSON.parse(project.techStack) as string[] : [];
  const coverImage = project.screenshots[0]?.url;
  const accentColor = accent || "#6366f1";

  return (
    <Link href={`/projects/${project.slug}`} className="group block h-full">
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 h-full flex flex-col"
        style={{ ["--card-accent" as string]: accentColor }}
      >
        {coverImage ? (
          <div className="aspect-video overflow-hidden bg-gray-100">
            <img
              src={coverImage}
              alt={project.screenshots[0]?.alt ?? project.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        ) : (
          <div
            className="aspect-video flex items-center justify-center text-4xl opacity-20"
            style={{ background: `linear-gradient(135deg, ${accentColor}10, ${accentColor}25)` }}
            aria-hidden="true"
          >
            {project.category?.icon || "◈"}
          </div>
        )}
        <div className="p-5 flex flex-col flex-1">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3
              className="font-semibold text-gray-900 group-hover:transition-colors line-clamp-1"
              style={{ ["--tw-text-opacity" as string]: "1" }}
            >
              <span className="group-hover:text-[var(--card-accent)] transition-colors">{project.title}</span>
            </h3>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${devStatusColor(project.devStatus)}`}>
              {devStatusLabel(project.devStatus)}
            </span>
          </div>

          {project.shortDesc && (
            <p className="text-sm text-gray-500 mb-3 line-clamp-2 flex-1 leading-relaxed">{project.shortDesc}</p>
          )}

          <div className="mt-auto pt-3 border-t border-gray-100 flex flex-wrap gap-1.5">
            {project.category && (
              <span
                className="text-xs px-2.5 py-1 rounded-full font-medium"
                style={{
                  backgroundColor: project.category.color ? `${project.category.color}18` : `${accentColor}15`,
                  color: project.category.color ?? accentColor,
                }}
              >
                {project.category.icon && <span aria-hidden="true">{project.category.icon} </span>}
                {project.category.name}
              </span>
            )}
            {techStack.slice(0, 3).map((t) => (
              <span key={t} className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 font-medium">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
