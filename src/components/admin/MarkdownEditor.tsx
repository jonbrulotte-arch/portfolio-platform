"use client";
import { useRef, useState } from "react";

interface Props {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}

type Mode = "write" | "preview";

function markdownToHtml(text: string): string {
  return text
    .replace(/^#{3} (.+)$/gm, "<h3>$1</h3>")
    .replace(/^#{2} (.+)$/gm, "<h2>$1</h2>")
    .replace(/^#{1} (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`([^`\n]+)`/g, "<code>$1</code>")
    .replace(/```[\s\S]*?```/g, (m) => `<pre><code>${m.slice(3, -3).trim()}</code></pre>`)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-indigo-600 underline">$1</a>')
    .replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`)
    .replace(/^\d+\. (.+)$/gm, "<li>$1</li>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/^(?!<[h|u|o|l|p|b|i|p|c])(.+)$/gm, "<p>$1</p>")
    .replace(/<p><\/p>/g, "");
}

interface ToolbarAction {
  label: string;
  title: string;
  wrap?: [string, string];
  line?: string;
}

const TOOLBAR: (ToolbarAction | null)[] = [
  { label: "H1", title: "Heading 1", line: "# " },
  { label: "H2", title: "Heading 2", line: "## " },
  { label: "H3", title: "Heading 3", line: "### " },
  null,
  { label: "B", title: "Bold", wrap: ["**", "**"] },
  { label: "I", title: "Italic", wrap: ["*", "*"] },
  { label: "</>", title: "Inline code", wrap: ["`", "`"] },
  null,
  { label: "Link", title: "Link", wrap: ["[", "](url)"] },
  { label: "• List", title: "Bullet list", line: "- " },
  { label: "1. List", title: "Ordered list", line: "1. " },
  { label: "Quote", title: "Blockquote", line: "> " },
  null,
  { label: "Code block", title: "Code block", wrap: ["```\n", "\n```"] },
];

export default function MarkdownEditor({ value, onChange, rows = 18, placeholder }: Props) {
  const [mode, setMode] = useState<Mode>("write");
  const ref = useRef<HTMLTextAreaElement>(null);

  function applyAction(action: ToolbarAction) {
    const ta = ref.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = value.slice(start, end);

    let next = value;
    let cursor = start;

    if (action.wrap) {
      const [before, after] = action.wrap;
      const inserted = before + (selected || "text") + after;
      next = value.slice(0, start) + inserted + value.slice(end);
      cursor = start + before.length + (selected || "text").length + after.length;
    } else if (action.line) {
      const lineStart = value.lastIndexOf("\n", start - 1) + 1;
      next = value.slice(0, lineStart) + action.line + value.slice(lineStart);
      cursor = start + action.line.length;
    }

    onChange(next);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(cursor, cursor);
    }, 0);
  }

  const inputCls = "w-full border border-gray-300 rounded-b-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 font-mono resize-y";

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-indigo-300">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 bg-gray-50 border-b border-gray-200 flex-wrap">
        {TOOLBAR.map((action, i) =>
          action === null ? (
            <span key={i} className="w-px h-4 bg-gray-300 mx-1" />
          ) : (
            <button
              key={action.label}
              type="button"
              title={action.title}
              onClick={() => { if (mode === "preview") setMode("write"); applyAction(action); }}
              className={`px-2 py-0.5 text-xs rounded hover:bg-gray-200 text-gray-600 font-medium transition-colors ${
                action.label === "B" ? "font-bold" : action.label === "I" ? "italic" : ""
              }`}
            >
              {action.label}
            </button>
          )
        )}

        <span className="flex-1" />

        <div className="flex rounded border border-gray-200 overflow-hidden text-xs">
          <button
            type="button"
            onClick={() => setMode("write")}
            className={`px-2 py-0.5 transition-colors ${mode === "write" ? "bg-indigo-600 text-white" : "text-gray-500 hover:bg-gray-100"}`}
          >
            Write
          </button>
          <button
            type="button"
            onClick={() => setMode("preview")}
            className={`px-2 py-0.5 transition-colors ${mode === "preview" ? "bg-indigo-600 text-white" : "text-gray-500 hover:bg-gray-100"}`}
          >
            Preview
          </button>
        </div>
      </div>

      {mode === "write" ? (
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          placeholder={placeholder}
          className={inputCls + " border-0 ring-0 focus:ring-0 rounded-none"}
          style={{ outline: "none" }}
        />
      ) : (
        <div
          className="prose-content min-h-32 p-4 text-sm bg-white"
          style={{ minHeight: `${rows * 1.5}rem` }}
          dangerouslySetInnerHTML={{ __html: value ? markdownToHtml(value) : '<p class="text-gray-400">Nothing to preview.</p>' }}
        />
      )}
    </div>
  );
}
