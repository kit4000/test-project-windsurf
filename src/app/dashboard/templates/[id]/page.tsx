"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TextEditor } from "@/components/ui/text-editor";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatJaDate } from "@/lib/utils";

interface JobTemplateSection {
  id: string;
  title: string;
  description: string | null;
  promptTemplate: string;
  order: number;
  required: boolean;
}

interface JobTemplate {
  id: string;
  name: string;
  description: string | null;
  industryId: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  sections: JobTemplateSection[];
}

export default function TemplateDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [template, setTemplate] = useState<JobTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [editedTemplate, setEditedTemplate] = useState<{
    name: string;
    description: string;
  }>({ name: "", description: "" });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState<Partial<JobTemplateSection> | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedSection, setDraggedSection] = useState<JobTemplateSection | null>(
    null
  );

  // テンプレート詳細を取得
  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/job-templates/${params.id}`);
        if (!response.ok) {
          throw new Error("テンプレートの取得に失敗しました");
        }
        const data = await response.json();
        setTemplate(data.template);
        setEditedTemplate({
          name: data.template.name,
          description: data.template.description || "",
        });
      } catch (error) {
        console.error("Error fetching template:", error);
        setError(
          error instanceof Error ? error.message : "予期せぬエラーが発生しました"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplate();
  }, [params.id]);

  // テンプレート基本情報を更新
  const handleSaveTemplate = async () => {
    if (!template) return;

    try {
      const response = await fetch(`/api/job-templates/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editedTemplate.name,
          description: editedTemplate.description,
        }),
      });

      if (!response.ok) {
        throw new Error("テンプレートの更新に失敗しました");
      }

      const data = await response.json();
      setTemplate({
        ...template,
        name: data.template.name,
        description: data.template.description,
      });
      setIsEditingTemplate(false);
    } catch (error) {
      console.error("Error updating template:", error);
      setError(
        error instanceof Error ? error.message : "予期せぬエラーが発生しました"
      );
    }
  };

  // 新規セクション追加ダイアログを開く
  const handleAddSection = () => {
    const maxOrder = template?.sections.reduce(
      (max, section) => Math.max(max, section.order),
      -1
    ) ?? -1;

    setCurrentSection({
      title: "",
      description: "",
      promptTemplate: "",
      order: maxOrder + 1,
      required: true,
    });
    setIsDialogOpen(true);
  };

  // セクション編集ダイアログを開く
  const handleEditSection = (section: JobTemplateSection) => {
    setCurrentSection({ ...section });
    setIsDialogOpen(true);
  };

  // セクションを削除
  const handleDeleteSection = async (id: string) => {
    if (!template) return;
    if (template.sections.length <= 1) {
      setError("テンプレートには少なくとも1つのセクションが必要です");
      return;
    }

    if (!confirm("このセクションを削除してもよろしいですか？")) {
      return;
    }

    try {
      const response = await fetch(`/api/job-templates/sections/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("セクションの削除に失敗しました");
      }

      // 削除後に一覧を更新
      setTemplate({
        ...template,
        sections: template.sections.filter((s) => s.id !== id),
      });
    } catch (error) {
      console.error("Error deleting section:", error);
      setError(
        error instanceof Error ? error.message : "予期せぬエラーが発生しました"
      );
    }
  };

  // フォーム送信処理（セクション追加・編集）
  const handleSubmitSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!template || !currentSection) return;

    setIsSubmitting(true);
    setError(null);

    try {
      if (currentSection.id) {
        // 更新
        const response = await fetch(
          `/api/job-templates/sections/${currentSection.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              title: currentSection.title,
              description: currentSection.description,
              promptTemplate: currentSection.promptTemplate,
              required: currentSection.required,
            }),
          }
        );

        if (!response.ok) {
          throw new Error("セクションの更新に失敗しました");
        }

        const data = await response.json();
        setTemplate({
          ...template,
          sections: template.sections.map((s) =>
            s.id === data.section.id ? data.section : s
          ),
        });
      } else {
        // 新規作成
        const response = await fetch(
          `/api/job-templates/${params.id}/sections`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              title: currentSection.title,
              description: currentSection.description,
              promptTemplate: currentSection.promptTemplate,
              order: currentSection.order,
              required: currentSection.required,
            }),
          }
        );

        if (!response.ok) {
          throw new Error("セクションの作成に失敗しました");
        }

        const data = await response.json();
        setTemplate({
          ...template,
          sections: [...template.sections, data.section],
        });
      }

      // ダイアログを閉じる
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving section:", error);
      setError(
        error instanceof Error ? error.message : "予期せぬエラーが発生しました"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // プロンプトテンプレートを更新
  const handleSavePrompt = async (sectionId: string, promptTemplate: string) => {
    if (!template) return;

    try {
      const response = await fetch(
        `/api/job-templates/sections/${sectionId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ promptTemplate }),
        }
      );

      if (!response.ok) {
        throw new Error("プロンプトテンプレートの更新に失敗しました");
      }

      const data = await response.json();
      
      // 更新が成功したらtemplateを更新
      setTemplate({
        ...template,
        sections: template.sections.map((s) =>
          s.id === sectionId ? { ...s, promptTemplate } : s
        ),
      });

      return data.section;
    } catch (error) {
      console.error("Error updating prompt template:", error);
      throw error;
    }
  };

  // ドラッグ＆ドロップでセクション順序を変更
  const handleDragStart = (section: JobTemplateSection) => {
    setIsDragging(true);
    setDraggedSection(section);
  };

  const handleDragOver = (e: React.DragEvent, targetSection: JobTemplateSection) => {
    e.preventDefault();
    if (!draggedSection || targetSection.id === draggedSection.id) return;

    // ドロップ領域の表示を変更
    e.currentTarget.classList.add("bg-primary/10");
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // ドロップ領域の表示を戻す
    e.currentTarget.classList.remove("bg-primary/10");
  };

  const handleDrop = async (e: React.DragEvent, targetSection: JobTemplateSection) => {
    e.preventDefault();
    e.currentTarget.classList.remove("bg-primary/10");

    if (!template || !draggedSection || targetSection.id === draggedSection.id) return;

    // 新しい順序のセクション配列を作成
    const newSections = [...template.sections];
    const draggedIndex = newSections.findIndex((s) => s.id === draggedSection.id);
    const targetIndex = newSections.findIndex((s) => s.id === targetSection.id);

    // ドラッグしたセクションを一旦削除
    const [removed] = newSections.splice(draggedIndex, 1);
    // ターゲットの位置に挿入
    newSections.splice(targetIndex, 0, removed);

    // 順序プロパティを更新
    const updatedSections = newSections.map((section, index) => ({
      ...section,
      order: index,
    }));

    try {
      // 順序を更新
      const response = await fetch(
        `/api/job-templates/${params.id}/sections`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sections: updatedSections.map((s) => ({ id: s.id, order: s.order })),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("セクション順序の更新に失敗しました");
      }

      // 更新成功
      setTemplate({
        ...template,
        sections: updatedSections,
      });
    } catch (error) {
      console.error("Error updating section order:", error);
      setError(
        error instanceof Error ? error.message : "予期せぬエラーが発生しました"
      );
    } finally {
      setIsDragging(false);
      setDraggedSection(null);
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggedSection(null);
  };

  if (isLoading) {
    return <div className="text-center py-8">読み込み中...</div>;
  }

  if (error) {
    return (
      <div className="bg-destructive/10 text-destructive p-4 rounded-md">
        {error}
        <div className="mt-4">
          <Button asChild>
            <Link href="/dashboard/templates">一覧に戻る</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="bg-muted/40 rounded-lg p-6 text-center">
        <p className="mb-4">テンプレートが見つかりませんでした</p>
        <Button asChild>
          <Link href="/dashboard/templates">一覧に戻る</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          {isEditingTemplate ? (
            <div className="flex flex-col gap-2 mb-4">
              <Label htmlFor="name">テンプレート名</Label>
              <Input
                id="name"
                value={editedTemplate.name}
                onChange={(e) =>
                  setEditedTemplate({ ...editedTemplate, name: e.target.value })
                }
                className="text-xl font-bold h-10"
              />
              <Label htmlFor="description">説明</Label>
              <Textarea
                id="description"
                value={editedTemplate.description}
                onChange={(e) =>
                  setEditedTemplate({
                    ...editedTemplate,
                    description: e.target.value,
                  })
                }
                className="min-h-[80px]"
              />
              <div className="flex gap-2 mt-2">
                <Button onClick={handleSaveTemplate}>保存</Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditedTemplate({
                      name: template.name,
                      description: template.description || "",
                    });
                    setIsEditingTemplate(false);
                  }}
                >
                  キャンセル
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-3xl font-bold">{template.name}</h1>
                {template.isDefault && (
                  <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                    デフォルト
                  </span>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                {template.description && <p>{template.description}</p>}
                <p>更新日: {formatJaDate(template.updatedAt)}</p>
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {!isEditingTemplate && (
            <Button
              variant="outline"
              onClick={() => setIsEditingTemplate(true)}
            >
              基本情報を編集
            </Button>
          )}
          <Button onClick={handleAddSection}>セクションを追加</Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/templates">一覧に戻る</Link>
          </Button>
        </div>
      </div>

      {/* セクション一覧 */}
      <div className="mt-2">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">セクション</h2>
          {template.sections.length > 1 && (
            <p className="text-sm text-muted-foreground">
              ドラッグ＆ドロップでセクションの順序を変更できます
            </p>
          )}
        </div>
        <div className="space-y-4">
          {template.sections
            .sort((a, b) => a.order - b.order)
            .map((section) => (
              <div
                key={section.id}
                className="border rounded-lg shadow-sm"
                draggable={template.sections.length > 1}
                onDragStart={() => handleDragStart(section)}
                onDragOver={(e) => handleDragOver(e, section)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, section)}
                onDragEnd={handleDragEnd}
              >
                <div className="p-4 border-b">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      {template.sections.length > 1 && (
                        <div className="cursor-move text-gray-400">
                          ⋮⋮
                        </div>
                      )}
                      <h3 className="text-lg font-semibold">{section.title}</h3>
                      {section.required && (
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                          必須
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditSection(section)}
                      >
                        編集
                      </Button>
                      {template.sections.length > 1 && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteSection(section.id)}
                        >
                          削除
                        </Button>
                      )}
                    </div>
                  </div>
                  {section.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {section.description}
                    </p>
                  )}
                </div>
                <div className="p-4">
                  <h4 className="font-medium mb-2">プロンプトテンプレート</h4>
                  <TextEditor
                    initialContent={section.promptTemplate}
                    onSave={(content) => handleSavePrompt(section.id, content)}
                  />
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* セクション追加・編集ダイアログ */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleSubmitSection}>
            <DialogHeader>
              <DialogTitle>
                {currentSection?.id ? "セクションを編集" : "セクションを追加"}
              </DialogTitle>
              <DialogDescription>
                テンプレートのセクション情報を入力してください
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">タイトル</Label>
                <Input
                  id="title"
                  value={currentSection?.title || ""}
                  onChange={(e) =>
                    setCurrentSection(prev => ({
                      ...prev!,
                      title: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">説明（任意）</Label>
                <Textarea
                  id="description"
                  value={currentSection?.description || ""}
                  onChange={(e) =>
                    setCurrentSection(prev => ({
                      ...prev!,
                      description: e.target.value,
                    }))
                  }
                  rows={2}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="promptTemplate">
                  プロンプトテンプレート（初期値）
                </Label>
                <Textarea
                  id="promptTemplate"
                  value={currentSection?.promptTemplate || ""}
                  onChange={(e) =>
                    setCurrentSection(prev => ({
                      ...prev!,
                      promptTemplate: e.target.value,
                    }))
                  }
                  rows={6}
                  required
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="required"
                  type="checkbox"
                  checked={currentSection?.required || false}
                  onChange={(e) =>
                    setCurrentSection(prev => ({
                      ...prev!,
                      required: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="required">必須項目</Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSubmitting}
              >
                キャンセル
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "保存中..." : "保存"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
