"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TextEditor } from "@/components/ui/text-editor";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatJaDate, translateStatus, downloadFile } from "@/lib/utils";

interface JobDescription {
  id: string;
  title: string;
  status: "draft" | "published";
  createdAt: string;
  updatedAt: string;
  jobTemplate: {
    name: string;
  };
  hearingSession?: {
    title: string;
    industry: {
      name: string;
    };
    responses: {
      hearingItem: {
        question: string;
      };
      answer: string;
    }[];
  };
  sections: {
    id: string;
    content: string;
    order: number;
    templateSection: {
      title: string;
      description: string;
    };
  }[];
}

export default function JobDescriptionPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [jobDescription, setJobDescription] = useState<JobDescription | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isRegeneratingSection, setIsRegeneratingSection] = useState<string | null>(null);
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);
  const [selectedAIProvider, setSelectedAIProvider] = useState<string | null>(null);
  const [aiProviders, setAIProviders] = useState<Array<{ id: string; name: string }>>(
    []
  );
  const [currentOperation, setCurrentOperation] = useState<"full" | "section">(
    "full"
  );
  const [currentSectionId, setCurrentSectionId] = useState<string | null>(null);

  // 募集要項詳細を取得
  useEffect(() => {
    const fetchJobDescription = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/job-descriptions/${params.id}`);
        if (!response.ok) {
          throw new Error("募集要項の取得に失敗しました");
        }
        const data = await response.json();
        setJobDescription(data.jobDescription);
      } catch (error) {
        console.error("Error fetching job description:", error);
        setError(
          error instanceof Error ? error.message : "予期せぬエラーが発生しました"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobDescription();
  }, [params.id]);

  // AIプロバイダー一覧を取得
  useEffect(() => {
    const fetchAIProviders = async () => {
      try {
        const response = await fetch("/api/ai-providers");
        if (!response.ok) {
          throw new Error("AIプロバイダーの取得に失敗しました");
        }
        const data = await response.json();
        setAIProviders(
          data.providers.map((p: any) => ({ id: p.id, name: p.name }))
        );
      } catch (error) {
        console.error("Error fetching AI providers:", error);
      }
    };

    fetchAIProviders();
  }, []);

  // セクション内容を更新
  const handleSaveSection = async (sectionId: string, content: string) => {
    try {
      const response = await fetch(
        `/api/job-descriptions/${params.id}/sections/${sectionId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content }),
        }
      );

      if (!response.ok) {
        throw new Error("セクションの更新に失敗しました");
      }

      const data = await response.json();
      
      // 更新が成功したらjobDescriptionを更新
      if (jobDescription) {
        const updatedSections = jobDescription.sections.map((section) =>
          section.id === sectionId ? { ...section, content } : section
        );
        setJobDescription({ ...jobDescription, sections: updatedSections });
      }

      return data.section;
    } catch (error) {
      console.error("Error updating section:", error);
      throw error;
    }
  };

  // 募集要項のステータスを変更
  const handleStatusChange = async (newStatus: "draft" | "published") => {
    if (!jobDescription) return;

    try {
      const response = await fetch(`/api/job-descriptions/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("ステータスの更新に失敗しました");
      }

      const data = await response.json();
      setJobDescription({ ...jobDescription, status: newStatus });
    } catch (error) {
      console.error("Error updating status:", error);
      setError(
        error instanceof Error ? error.message : "予期せぬエラーが発生しました"
      );
    }
  };

  // 募集要項全体を再生成
  const handleRegenerateAll = async () => {
    if (aiProviders.length === 0) {
      setError("AIプロバイダーが設定されていません");
      return;
    }

    setCurrentOperation("full");
    setCurrentSectionId(null);
    setIsAIDialogOpen(true);
  };

  // セクションを再生成
  const handleRegenerateSection = (sectionId: string) => {
    if (aiProviders.length === 0) {
      setError("AIプロバイダーが設定されていません");
      return;
    }

    setCurrentOperation("section");
    setCurrentSectionId(sectionId);
    setIsAIDialogOpen(true);
  };

  // 再生成を実行
  const executeRegeneration = async () => {
    if (!jobDescription) return;

    setIsAIDialogOpen(false);

    try {
      if (currentOperation === "full") {
        // 募集要項全体の再生成
        setIsRegenerating(true);
        const response = await fetch(`/api/job-descriptions/${params.id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            aiProviderId: selectedAIProvider,
          }),
        });

        if (!response.ok) {
          throw new Error("再生成に失敗しました");
        }

        const data = await response.json();
        setJobDescription(data.jobDescription);
      } else if (currentOperation === "section" && currentSectionId) {
        // 特定のセクションの再生成
        setIsRegeneratingSection(currentSectionId);
        const response = await fetch(
          `/api/job-descriptions/${params.id}/sections/${currentSectionId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              aiProviderId: selectedAIProvider,
            }),
          }
        );

        if (!response.ok) {
          throw new Error("セクションの再生成に失敗しました");
        }

        const data = await response.json();
        
        // セクションを更新
        if (jobDescription) {
          const updatedSections = jobDescription.sections.map((section) =>
            section.id === currentSectionId
              ? { ...section, content: data.section.content }
              : section
          );
          setJobDescription({ ...jobDescription, sections: updatedSections });
        }
      }
    } catch (error) {
      console.error("Error regenerating content:", error);
      setError(
        error instanceof Error ? error.message : "予期せぬエラーが発生しました"
      );
    } finally {
      setIsRegenerating(false);
      setIsRegeneratingSection(null);
      setSelectedAIProvider(null);
    }
  };

  // テキスト出力
  const handleExport = () => {
    if (!jobDescription) return;

    // テキスト出力用のフォーマット
    let text = `${jobDescription.title}\n\n`;
    text += `==============================\n\n`;

    // セクションを順番に追加
    jobDescription.sections
      .sort((a, b) => a.order - b.order)
      .forEach((section) => {
        text += `■ ${section.templateSection.title}\n\n`;
        text += `${section.content}\n\n`;
        text += `------------------------------\n\n`;
      });

    // ヒアリング内容を追加
    if (jobDescription.hearingSession?.responses.length) {
      text += `【ヒアリング内容】\n\n`;
      jobDescription.hearingSession.responses.forEach((response) => {
        text += `質問: ${response.hearingItem.question}\n`;
        text += `回答: ${response.answer}\n\n`;
      });
    }

    // メタデータを追加
    text += `==============================\n`;
    text += `作成日: ${formatJaDate(jobDescription.createdAt)}\n`;
    text += `更新日: ${formatJaDate(jobDescription.updatedAt)}\n`;
    text += `テンプレート: ${jobDescription.jobTemplate.name}\n`;
    text += `ステータス: ${translateStatus(jobDescription.status)}\n`;

    // ファイルをダウンロード
    downloadFile(
      text,
      `募集要項_${jobDescription.title}_${new Date().toISOString().slice(0, 10)}.txt`,
      "text/plain"
    );
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
            <Link href="/dashboard/job-descriptions">一覧に戻る</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!jobDescription) {
    return (
      <div className="bg-muted/40 rounded-lg p-6 text-center">
        <p className="mb-4">募集要項が見つかりませんでした</p>
        <Button asChild>
          <Link href="/dashboard/job-descriptions">一覧に戻る</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-bold">{jobDescription.title}</h1>
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                jobDescription.status === "published"
                  ? "bg-green-100 text-green-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {translateStatus(jobDescription.status)}
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            <p>テンプレート: {jobDescription.jobTemplate.name}</p>
            <p>更新日: {formatJaDate(jobDescription.updatedAt)}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleExport}>
            テキスト出力
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              handleStatusChange(
                jobDescription.status === "draft" ? "published" : "draft"
              )
            }
          >
            {jobDescription.status === "draft" ? "公開する" : "下書きに戻す"}
          </Button>
          <Button onClick={handleRegenerateAll} disabled={isRegenerating}>
            {isRegenerating ? "再生成中..." : "すべて再生成"}
          </Button>
          <Button
            variant="outline"
            asChild
          >
            <Link href="/dashboard/job-descriptions">一覧に戻る</Link>
          </Button>
        </div>
      </div>

      {/* ヒアリング情報 */}
      {jobDescription.hearingSession && (
        <div className="bg-muted/30 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">ヒアリング情報</h2>
          <div className="flex flex-col gap-3">
            {jobDescription.hearingSession.responses.map((response, index) => (
              <div key={index} className="bg-card p-3 rounded border">
                <p className="font-medium">{response.hearingItem.question}</p>
                <p className="text-muted-foreground">{response.answer}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 募集要項セクション */}
      <div className="grid gap-6">
        {jobDescription.sections
          .sort((a, b) => a.order - b.order)
          .map((section) => (
            <div key={section.id} className="bg-card rounded-lg border shadow-sm">
              <div className="p-4 border-b">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">
                    {section.templateSection.title}
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRegenerateSection(section.id)}
                    disabled={isRegeneratingSection === section.id}
                  >
                    {isRegeneratingSection === section.id
                      ? "再生成中..."
                      : "このセクションを再生成"}
                  </Button>
                </div>
                {section.templateSection.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {section.templateSection.description}
                  </p>
                )}
              </div>
              <div className="p-4">
                <TextEditor
                  initialContent={section.content}
                  onSave={(content) => handleSaveSection(section.id, content)}
                />
              </div>
            </div>
          ))}
      </div>

      {/* AIプロバイダー選択ダイアログ */}
      <Dialog open={isAIDialogOpen} onOpenChange={setIsAIDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {currentOperation === "full"
                ? "募集要項全体を再生成"
                : "セクションを再生成"}
            </DialogTitle>
            <DialogDescription>
              使用するAIプロバイダーを選択してください
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-2">
              {aiProviders.map((provider) => (
                <div
                  key={provider.id}
                  className={`p-4 border rounded-md cursor-pointer ${
                    selectedAIProvider === provider.id
                      ? "border-primary bg-primary/5"
                      : ""
                  }`}
                  onClick={() => setSelectedAIProvider(provider.id)}
                >
                  <div className="font-medium">{provider.name}</div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAIDialogOpen(false)}
            >
              キャンセル
            </Button>
            <Button
              type="button"
              onClick={executeRegeneration}
              disabled={!selectedAIProvider}
            >
              再生成する
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
