import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Braces,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  RemoveFormatting,
  Strikethrough,
  Undo2,
  Underline,
  Unlink,
} from "lucide-react";
import { useEffect, type ReactNode } from "react";

type RichTextEditorProps = {
  value: string;
  onChange: (html: string, json: Record<string, unknown>) => void;
  placeholder?: string;
  disabled?: boolean;
};

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Kezdd el megírni a tartalmat...",
  disabled = false,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3, 4],
        },
        link: {
          openOnClick: false,
          autolink: true,
          linkOnPaste: true,
          defaultProtocol: "https",
          HTMLAttributes: {
            rel: "noopener noreferrer",
            target: "_blank",
          },
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value || "<p></p>",
    editable: !disabled,
    editorProps: {
      attributes: {
        class:
          "min-h-[420px] px-5 py-5 text-base leading-7 text-ink outline-none [&_h2]:mt-8 [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h3]:mt-7 [&_h3]:text-2xl [&_h3]:font-bold [&_h4]:mt-6 [&_h4]:text-xl [&_h4]:font-semibold [&_p]:my-4 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-7 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-7 [&_li]:my-1 [&_blockquote]:my-6 [&_blockquote]:border-l-4 [&_blockquote]:border-brand [&_blockquote]:bg-brand/5 [&_blockquote]:px-5 [&_blockquote]:py-3 [&_blockquote]:italic [&_pre]:my-6 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:bg-slate-950 [&_pre]:p-5 [&_pre]:text-sm [&_pre]:text-slate-100 [&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_a]:font-semibold [&_a]:text-brand [&_a]:underline [&_hr]:my-8 [&_hr]:border-border",
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange(
        currentEditor.getHTML(),
        currentEditor.getJSON() as Record<string, unknown>,
      );
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    const currentHtml = editor.getHTML();
    const nextHtml = value || "<p></p>";

    if (currentHtml !== nextHtml) {
      editor.commands.setContent(nextHtml, {
        emitUpdate: false,
      });
    }
  }, [editor, value]);

  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [disabled, editor]);

  if (!editor) {
    return (
      <div className="min-h-[470px] animate-pulse rounded-2xl border bg-muted/40" />
    );
  }

  function setLink() {
    const previousUrl = editor.getAttributes("link").href as string | undefined;

    const url = window.prompt("Hivatkozás címe:", previousUrl ?? "https://");

    if (url === null) {
      return;
    }

    const normalizedUrl = url.trim();

    if (!normalizedUrl) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();

      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({
        href: normalizedUrl,
      })
      .run();
  }

  return (
    <div className="overflow-hidden rounded-2xl border bg-background shadow-sm">
      <div className="flex flex-wrap gap-1.5 border-b bg-muted/30 p-3">
        <ToolbarButton
          label="Félkövér"
          active={editor.isActive("bold")}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          label="Dőlt"
          active={editor.isActive("italic")}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          label="Áthúzott"
          active={editor.isActive("strike")}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          label="Aláhúzott"
          active={editor.isActive("underline")}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <Underline className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarSeparator />

        <ToolbarButton
          label="Második szintű címsor"
          active={editor.isActive("heading", {
            level: 2,
          })}
          disabled={disabled}
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleHeading({
                level: 2,
              })
              .run()
          }
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          label="Harmadik szintű címsor"
          active={editor.isActive("heading", {
            level: 3,
          })}
          disabled={disabled}
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleHeading({
                level: 3,
              })
              .run()
          }
        >
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarSeparator />

        <ToolbarButton
          label="Felsorolás"
          active={editor.isActive("bulletList")}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          label="Számozott lista"
          active={editor.isActive("orderedList")}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          label="Idézet"
          active={editor.isActive("blockquote")}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          label="Kódblokk"
          active={editor.isActive("codeBlock")}
          disabled={disabled}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          <Braces className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          label="Elválasztó vonal"
          disabled={disabled}
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <Minus className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarSeparator />

        <ToolbarButton
          label="Hivatkozás"
          active={editor.isActive("link")}
          disabled={disabled}
          onClick={setLink}
        >
          <Link2 className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          label="Hivatkozás eltávolítása"
          disabled={disabled || !editor.isActive("link")}
          onClick={() => editor.chain().focus().unsetLink().run()}
        >
          <Unlink className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarSeparator />

        <ToolbarButton
          label="Formázás törlése"
          disabled={disabled}
          onClick={() =>
            editor.chain().focus().unsetAllMarks().clearNodes().run()
          }
        >
          <RemoveFormatting className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          label="Visszavonás"
          disabled={disabled || !editor.can().chain().focus().undo().run()}
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Undo2 className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          label="Újra"
          disabled={disabled || !editor.can().chain().focus().redo().run()}
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo2 className="h-4 w-4" />
        </ToolbarButton>
      </div>

      <EditorContent editor={editor} />

      <div className="border-t bg-muted/20 px-4 py-2 text-xs text-muted-foreground">
        Címsorok, listák, idézetek, kódblokkok és hivatkozások használhatók.
      </div>
    </div>
  );
}

type ToolbarButtonProps = {
  label: string;
  children: ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
};

function ToolbarButton({
  label,
  children,
  active = false,
  disabled = false,
  onClick,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={`grid h-9 w-9 place-items-center rounded-lg border text-sm transition ${
        active
          ? "border-brand bg-brand text-white"
          : "bg-background hover:bg-muted"
      } disabled:cursor-not-allowed disabled:opacity-35`}
    >
      {children}
    </button>
  );
}

function ToolbarSeparator() {
  return <span aria-hidden="true" className="mx-1 h-9 w-px bg-border" />;
}
