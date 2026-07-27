import DOMPurify from "dompurify";
import { useMemo } from "react";

type RichTextContentProps = {
  html: string;
  className?: string;
};

export function RichTextContent({
  html,
  className = "",
}: RichTextContentProps) {
  const sanitizedHtml = useMemo(
    () =>
      DOMPurify.sanitize(html, {
        USE_PROFILES: {
          html: true,
        },
      }),
    [html],
  );

  return (
    <div
      className={`text-base leading-8 text-ink [&_h2]:mb-4 [&_h2]:mt-12 [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h3]:mb-3 [&_h3]:mt-10 [&_h3]:text-2xl [&_h3]:font-bold [&_h4]:mb-3 [&_h4]:mt-8 [&_h4]:text-xl [&_h4]:font-semibold [&_p]:my-5 [&_ul]:my-5 [&_ul]:list-disc [&_ul]:pl-8 [&_ol]:my-5 [&_ol]:list-decimal [&_ol]:pl-8 [&_li]:my-2 [&_blockquote]:my-8 [&_blockquote]:border-l-4 [&_blockquote]:border-brand [&_blockquote]:bg-brand/5 [&_blockquote]:px-6 [&_blockquote]:py-4 [&_blockquote]:text-lg [&_blockquote]:italic [&_pre]:my-8 [&_pre]:overflow-x-auto [&_pre]:rounded-2xl [&_pre]:bg-slate-950 [&_pre]:p-6 [&_pre]:text-sm [&_pre]:leading-6 [&_pre]:text-slate-100 [&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_a]:font-semibold [&_a]:text-brand [&_a]:underline [&_hr]:my-10 [&_hr]:border-border ${className}`}
      dangerouslySetInnerHTML={{
        __html: sanitizedHtml,
      }}
    />
  );
}
