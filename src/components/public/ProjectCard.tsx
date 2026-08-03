import Link from "next/link";
import { devStatusColor, devStatusLabel } from "@/lib/utils";
import type { ProjectWithRelations } from "@/types";

export default function ProjectCard({ project }: { project: ProjectWithRelations }) {
  const techStack = project.techStack ? JSON.parse(project.techStack) as string[] : [];
  const coverImage = project.screenshots[0]?.url;

  return (
    <Link href={`/projects/${project.slug}`} className="group block">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-indigo-300 hover:shadow-md transition-all duration-200 h-full flex flex-col">
        {coverImage && (
          <div className="aspect-video overflow-hidden bg-gray-100">
            <img
              src={coverImage}
              alt={project.screenshots[0]?.alt ?? project.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <div className="p-5 flex flex-col flex-1">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
              {project.title}
            </h3>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${devStatusColor(project.devStatus)}`}>
              {devStatusLabel(project.devStatus)}
            </span>
          </div>

          {project.shortDesc && (
            <p className="text-sm text-gray-500 mb-3 line-clamp-2 flex-1">{project.shortDesc}</p>
          )}

          <div className="mt-auto pt-3 border-t border-gray-100 flex flex-wrap gap-1.5">
            {project.category && (
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{
                  backgroundColor: project.category.color ? `${project.category.color}20` : "#e0e7ff",
                  color: project.category.color ?? "#4f46e5",
                }}
              >
                {project.category.icon} {project.category.name}
              </span>
            )}
            {techStack.slice(0, 3).map((t) => (
              <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
