"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface TextEditorProps {
  initialContent: string;
  onChange?: (content: string) => void;
  onSave?: (content: string) => Promise<void>;
  className?: string;
  readOnly?: boolean;
  placeholder?: string;
  minHeight?: string;
  maxHeight?: string;
}

export function TextEditor({
  initialContent,
  onChange,
  onSave,
  className,
  readOnly = false,
  placeholder = "内容を入力してください...",
  minHeight = "150px",
  maxHeight = "600px",
}: TextEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  // コンテンツの変更を処理
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setContent(newValue);
    onChange?.(newValue);
  };

  // 保存処理
  const handleSave = async () => {
    if (onSave && content !== initialContent) {
      setIsSaving(true);
      try {
        await onSave(content);
        setIsEditing(false);
      } catch (error) {
        console.error("Failed to save content:", error);
      } finally {
        setIsSaving(false);
      }
    } else {
      setIsEditing(false);
    }
  };

  // 編集モードを切り替え
  const toggleEdit = () => {
    if (readOnly) return;
    if (isEditing) {
      handleSave();
    } else {
      setIsEditing(true);
      // フォーカスを当てる（少し遅延させることで確実にフォーカスされる）
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.focus();
        }
      }, 100);
    }
  };

  return (
    <div
      className={cn(
        "relative rounded-md border border-input bg-background",
        className
      )}
    >
      {isEditing ? (
        <div className="flex flex-col h-full">
          <textarea
            ref={editorRef}
            value={content}
            onChange={handleChange}
            className={cn(
              "flex-1 w-full p-4 resize-none outline-none",
              "focus:ring-0 focus:outline-none",
              readOnly ? "cursor-not-allowed opacity-70" : ""
            )}
            style={{ minHeight, maxHeight }}
            placeholder={placeholder}
            disabled={readOnly}
          />
          <div className="flex justify-end gap-2 p-2 bg-muted/20 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setContent(initialContent);
                setIsEditing(false);
              }}
              disabled={isSaving}
            >
              キャンセル
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving || content === initialContent}
            >
              {isSaving ? "保存中..." : "保存"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="relative">
          <div
            className={cn(
              "p-4 whitespace-pre-wrap",
              "min-h-[150px] overflow-auto",
              content ? "" : "text-muted-foreground"
            )}
            style={{
              minHeight,
              maxHeight,
              overflowY: "auto",
            }}
            onClick={toggleEdit}
          >
            {content || placeholder}
          </div>
          {!readOnly && (
            <Button
              variant="outline"
              size="sm"
              className="absolute top-2 right-2"
              onClick={toggleEdit}
            >
              編集
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
