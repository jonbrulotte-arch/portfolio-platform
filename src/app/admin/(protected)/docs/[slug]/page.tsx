import { notFound } from "next/navigation";
import Link from "next/link";
import fs from "fs";
import path from "path";

const VALID_SLUGS = ["installation", "admin-guide", "backup-restore", "development"];

const TITLES: Record<string, string> = {
  "installation": "Installation & Configuration",
  "admin-guide": "Admin Guide",
  "backup-restore": "Backup & Restore",
  "development": "Development Guide",
};

function markdownToHtml(md: string): string {
  return md
    // Fenced code blocks (must come before inline code)
    .replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) =>
      `<pre class="doc-pre"><code>${code.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre>`
    )
    // Headings
    .replace(/^#{4} (.+)$/gm, "<h4>$1</h4>")
    .replace(/^#{3} (.+)$/gm, "<h3>$1</h3>")
    .replace(/^#{2} (.+)$/gm, "<h2>$1</h2>")
    .replace(/^#{1} (.+)$/gm, "<h1>$1</h1>")
    // Horizontal rules
    .replace(/^---$/gm, "<hr/>")
    // Bold / italic / inline code
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`([^`\n]+)`/g, "<code>$1</code>")
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    // Tables
    .replace(/^\|(.+)\|$/gm, (row) => {
      const cells = row.slice(1, -1).split("|").map((c) => c.trim());
      return `<tr>${cells.map((c) => `<td>${c}</td>`).join("")}</tr>`;
    })
    .replace(/(<tr>.*<\/tr>\n?)+/g, (m) => {
      // First row becomes thead if followed by separator
      const rows = m.trim().split("\n").filter((r) => r.includes("<tr>"));
      if (rows.length > 1 && rows[1].replace(/<[^>]+>/g, "").replace(/[-| ]/g, "") === "") {
        return `<table><thead>${rows[0]}</thead><tbody>${rows.slice(2).join("")}</tbody></table>`;
      }
      return `<table>${m}</table>`;
    })
    // Unordered lists
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>[\s\S]*?<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`)
    // Paragraphs (lines not starting with a block element)
    .replace(/\n\n/g, "</p><p>")
    .replace(/^(?!<[h|u|o|l|t|p|h|c|s])(.+)$/gm, "<p>$1</p>")
    .replace(/<p><\/p>/g, "")
    .replace(/<p>(<pre|<ul|<table|<h[1-6]|<hr)/g, "$1")
    .replace(/(<\/pre>|<\/ul>|<\/table>|<\/h[1-6]>|<hr\/>)<\/p>/g, "$1");
}

export default function DocPage({ params }: { params: { slug: string } }) {
  if (!VALID_SLUGS.includes(params.slug)) notFound();

  const filePath = path.join(process.cwd(), "docs", `${params.slug}.md`);
  if (!fs.existsSync(filePath)) notFound();

  const raw = fs.readFileSync(filePath, "utf8");
  const html = markdownToHtml(raw);
  const title = TITLES[params.slug] ?? params.slug;

  return (
    <div className="max-w-3xl">
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/admin/docs" className="hover:text-gray-600">Documentation</Link>
        <span>/</span>
        <span className="text-gray-600">{title}</span>
      </nav>

      <div
        className="doc-content"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
