"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatJaDate } from "@/lib/utils";

interface Industry {
  id: string;
  name: string;
}

interface JobTemplateSection {
  id: string;
  title: string;
  description: string;
  promptTemplate: string;
  order: number;
  required: boolean;
}

interface JobTemplate {
  id: string;
  name: string;
  description: string;
  industryId: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  sections: JobTemplateSection[];
}

export default function TemplatesPage() {
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [templates, setTemplates] = useState<JobTemplate[]>([]);
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState<{
    name: string;
    description: string;
    industryId: string;
    isDefault: boolean;
    cloneFromId?: string;
  }>({
    name: "",
    description: "",
    industryId: "",
    isDefault: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 業種一覧を取得
  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/industries");
        if (!response.ok) {
          throw new Error("業種の取得に失敗しました");
        }
        const data = await response.json();
        setIndustries(data.industries);

        if (data.industries.length > 0) {
          setSelectedIndustry(data.industries[0].id);
          setNewTemplate((prev) => ({
            ...prev,
            industryId: data.industries[0].id,
          }));
        }
      } catch (error) {
        console.error("Error fetching industries:", error);
        setError(
          error instanceof Error ? error.message : "予期せぬエラーが発生しました"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchIndustries();
  }, []);

  // 選択された業種のテンプレート一覧を取得
  useEffect(() => {
    if (!selectedIndustry) return;

    const fetchTemplates = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `/api/job-templates?industryId=${selectedIndustry}`
        );
        if (!response.ok) {
          throw new Error("テンプレートの取得に失敗しました");
        }
        const data = await response.json();
        setTemplates(data.templates);
      } catch (error) {
        console.error("Error fetching templates:", error);
        setError(
          error instanceof Error ? error.message : "予期せぬエラーが発生しました"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, [selectedIndustry]);

  // 業種選択を変更
  const handleIndustryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedIndustry(e.target.value);
  };

  // 新規テンプレート作成ダイアログを開く
  const handleAddTemplate = () => {
    setNewTemplate({
      name: "",
      description: "",
      industryId: selectedIndustry || "",
      isDefault: templates.length === 0,
    });
    setIsDialogOpen(true);
  };

  // テンプレートを複製
  const handleCloneTemplate = (template: JobTemplate) => {
    setNewTemplate({
      name: `${template.name} (コピー)`,
      description: template.description,
      industryId: template.industryId,
      isDefault: false,
      cloneFromId: template.id,
    });
    setIsDialogOpen(true);
  };

  // テンプレートを削除
  const handleDeleteTemplate = async (id: string) => {
    if (!confirm("このテンプレートを削除してもよろしいですか？")) {
      return;
    }

    try {
      const response = await fetch(`/api/job-templates/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("テンプレートの削除に失敗しました");
      }

      // 削除後に一覧を更新
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    } catch (error) {
      console.error("Error deleting template:", error);
      setError(
        error instanceof Error ? error.message : "予期せぬエラーが発生しました"
      );
    }
  };

  // フォーム送信処理（新規作成・複製）
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (newTemplate.cloneFromId) {
        // 複製の場合
        const response = await fetch(
          `/api/job-templates/${newTemplate.cloneFromId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ newName: newTemplate.name }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "テンプレートの複製に失敗しました");
        }

        const data = await response.json();
        setTemplates((prev) => [...prev, data.template]);
      } else {
        // 新規作成
        // 注: 実際のAPI実装では、セクションの作成も必要
        setError("この機能は現段階では実装されていません");
        return;
      }

      // ダイアログを閉じる
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving template:", error);
      setError(
        error instanceof Error ? error.message : "予期せぬエラーが発生しました"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // デフォルトテンプレート設定
  const handleSetDefault = async (id: string) => {
    try {
      const response = await fetch(`/api/job-templates/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isDefault: true }),
      });

      if (!response.ok) {
        throw new Error("デフォルト設定に失敗しました");
      }

      const data = await response.json();

      // 一覧を更新
      setTemplates((prev) =>
        prev.map((t) => ({
          ...t,
          isDefault: t.id === id,
        }))
      );
    } catch (error) {
      console.error("Error setting default template:", error);
      setError(
        error instanceof Error ? error.message : "予期せぬエラーが発生しました"
      );
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">テンプレート管理</h1>
        <Button onClick={handleAddTemplate}>新規テンプレート</Button>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          {error}
        </div>
      )}

      <div className="flex items-center">
        <div className="w-64">
          <Label htmlFor="industry">業種</Label>
          <select
            id="industry"
            value={selectedIndustry || ""}
            onChange={handleIndustryChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {industries.map((industry) => (
              <option key={industry.id} value={industry.id}>
                {industry.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">読み込み中...</div>
      ) : templates.length === 0 ? (
        <div className="bg-muted/40 rounded-lg p-6 text-center">
          <p className="mb-4">テンプレートがまだ作成されていません</p>
          <Button onClick={handleAddTemplate}>テンプレートを追加</Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-card rounded-lg border shadow-sm"
            >
              <div className="flex-1 mb-4 sm:mb-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-semibold">{template.name}</h3>
                  {template.isDefault && (
                    <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                      デフォルト
                    </span>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>{template.description || "説明なし"}</p>
                  <p>セクション数: {template.sections.length}</p>
                  <p>更新日: {formatJaDate(template.updatedAt)}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {!template.isDefault && (
                  <Button
                    variant="outline"
                    onClick={() => handleSetDefault(template.id)}
                  >
                    デフォルトに設定
                  </Button>
                )}
                <Button
                  variant="outline"
                  asChild
                >
                  <Link href={`/dashboard/templates/${template.id}`}>
                    編集
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleCloneTemplate(template)}
                >
                  複製
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteTemplate(template.id)}
                >
                  削除
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {newTemplate.cloneFromId
                  ? "テンプレートを複製"
                  : "新規テンプレート作成"}
              </DialogTitle>
              <DialogDescription>
                {newTemplate.cloneFromId
                  ? "既存のテンプレートを元に新しいテンプレートを作成します"
                  : "新しいテンプレートの基本情報を入力してください"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">テンプレート名</Label>
                <Input
                  id="name"
                  value={newTemplate.name}
                  onChange={(e) =>
                    setNewTemplate({ ...newTemplate, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">説明</Label>
                <Textarea
                  id="description"
                  value={newTemplate.description}
                  onChange={(e) =>
                    setNewTemplate({
                      ...newTemplate,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="industry">業種</Label>
                <select
                  id="industry"
                  value={newTemplate.industryId}
                  onChange={(e) =>
                    setNewTemplate({
                      ...newTemplate,
                      industryId: e.target.value,
                    })
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  {industries.map((industry) => (
                    <option key={industry.id} value={industry.id}>
                      {industry.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="isDefault"
                  type="checkbox"
                  checked={newTemplate.isDefault}
                  onChange={(e) =>
                    setNewTemplate({
                      ...newTemplate,
                      isDefault: e.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="isDefault">デフォルトテンプレートに設定</Label>
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
