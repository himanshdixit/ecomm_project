"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  adminGhostButtonClass,
  adminInputClass,
} from "@/components/admin/adminStyles";
import { cn } from "@/lib/utils";
import { normalizeRichTextInput, sanitizeRichTextHtml, stripHtml } from "@/lib/rich-text";

const toolbarButtons = [
  { label: "P", title: "Paragraph", action: "paragraph" },
  { label: "H2", title: "Heading", action: "heading" },
  { label: "B", title: "Bold", action: "bold" },
  { label: "I", title: "Italic", action: "italic" },
  { label: "UL", title: "Bullet list", action: "unordered" },
  { label: "OL", title: "Numbered list", action: "ordered" },
  { label: "Q", title: "Quote", action: "quote" },
  { label: "Clear", title: "Clear formatting", action: "clear" },
];

export default function AdminRichTextEditor({ value = "", onChange, placeholder = "Write here...", error = "" }) {
  const editorRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const normalizedValue = useMemo(() => normalizeRichTextInput(value), [value]);
  const isEmpty = !stripHtml(normalizedValue);

  useEffect(() => {
    if (!editorRef.current) {
      return;
    }

    if (editorRef.current.innerHTML !== normalizedValue) {
      editorRef.current.innerHTML = normalizedValue;
    }
  }, [normalizedValue]);

  const syncValue = () => {
    if (!editorRef.current) {
      return;
    }

    const nextValue = sanitizeRichTextHtml(editorRef.current.innerHTML);
    onChange?.(nextValue);
  };

  const runCommand = (action) => {
    if (!editorRef.current) {
      return;
    }

    editorRef.current.focus();

    if (action === "paragraph") {
      document.execCommand("formatBlock", false, "p");
    } else if (action === "heading") {
      document.execCommand("formatBlock", false, "h2");
    } else if (action === "bold") {
      document.execCommand("bold");
    } else if (action === "italic") {
      document.execCommand("italic");
    } else if (action === "unordered") {
      document.execCommand("insertUnorderedList");
    } else if (action === "ordered") {
      document.execCommand("insertOrderedList");
    } else if (action === "quote") {
      document.execCommand("formatBlock", false, "blockquote");
    } else if (action === "clear") {
      document.execCommand("removeFormat");
      document.execCommand("formatBlock", false, "p");
    }

    syncValue();
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const text = event.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
    syncValue();
  };

  return (
    <div className={cn("overflow-hidden rounded-[1.15rem] border border-slate-200 bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]", error && "border-rose-300") }>
      <div className="flex flex-wrap gap-2 border-b border-slate-200 bg-slate-50/80 px-3 py-3">
        {toolbarButtons.map((button) => (
          <button
            key={button.action}
            type="button"
            title={button.title}
            onClick={() => runCommand(button.action)}
            className={`${adminGhostButtonClass} !w-auto !px-3 !py-1.5 text-xs`}
          >
            {button.label}
          </button>
        ))}
      </div>

      <div className="relative">
        {isEmpty && !isFocused ? (
          <div className="pointer-events-none absolute left-0 top-0 z-10 px-4 py-3 text-sm text-slate-400">
            {placeholder}
          </div>
        ) : null}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={syncValue}
          onBlur={() => {
            setIsFocused(false);
            syncValue();
          }}
          onFocus={() => setIsFocused(true)}
          onPaste={handlePaste}
          className={`${adminInputClass} min-h-[12rem] resize-none border-0 bg-white !px-4 !py-3 shadow-none focus:ring-0`}
        />
      </div>

      <div className="border-t border-slate-200 bg-slate-50/70 px-4 py-2 text-xs text-slate-400">
        Supports headings, bold text, italics, quotes, and lists. Pasted content is converted to plain text before formatting.
      </div>
    </div>
  );
}
