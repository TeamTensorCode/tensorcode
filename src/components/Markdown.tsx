import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function Markdown({ children, className }: { children: string; className?: string }) {
  return (
    <div
      className={
        "text-sm leading-relaxed text-foreground/90 " +
        "[&_p]:my-2 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0 " +
        "[&_strong]:font-semibold [&_strong]:text-foreground " +
        "[&_em]:italic " +
        "[&_a]:text-primary [&_a]:underline hover:[&_a]:opacity-80 " +
        "[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 " +
        "[&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 " +
        "[&_li]:my-1 " +
        "[&_h1]:mt-4 [&_h1]:mb-2 [&_h1]:text-lg [&_h1]:font-semibold " +
        "[&_h2]:mt-4 [&_h2]:mb-2 [&_h2]:text-base [&_h2]:font-semibold " +
        "[&_h3]:mt-3 [&_h3]:mb-1 [&_h3]:text-sm [&_h3]:font-semibold " +
        "[&_code]:rounded [&_code]:bg-secondary [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em] " +
        "[&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:border [&_pre]:border-border [&_pre]:bg-[var(--code-bg)] [&_pre]:p-3 " +
        "[&_pre_code]:bg-transparent [&_pre_code]:p-0 " +
        "[&_blockquote]:my-3 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground " +
        "[&_hr]:my-4 [&_hr]:border-border " +
        (className ?? "")
      }
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}
