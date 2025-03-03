"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface HearingSession {
  id: string;
  title: string;
  industry: {
    id: string;
    name: string;
  };
  responses: {
    answer: string;
    hearingItem: {
      question: string;
    };
  }[];
}

interface JobTemplate {
  id: string;
  name: string;
  description: string | null;
  isDefault: boolean;
}

interface AIProvider {
  id: string;
  name: string;
}

export default function GenerateJobDescriptionPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [hearingSession, setHearingSession] = useState<HearingSession | null>(
    null
  );
  const [templates, setTemplates] = useState<JobTemplate[]>([]);
  const [aiProviders, setAIProviders] = useState<AIProvider[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [selectedAIProvider, setSelectedAIProvider] = useState<string | null>(
    null
  );
  const [title, setTitle] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);

  // ヒアリングセッション詳細と関連データを取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // ヒアリングセッション詳細
        const sessionResponse = await fetch(`/api/hearings/${params.id}`);
        if (!sessionResponse.ok) {
          throw new Error("ヒアリングセッションの取得に失敗しました");
        }
        const sessionData = await sessionResponse.json();
        setHearingSession(sessionData.hearingSession);
        
        // タイトルのデフォルト値を設定
        setTitle(
          sessionData.hearingSession.title ||
            `${sessionData.hearingSession.industry.name}の募集要項`
        );

        // テンプレート一覧
        const templatesResponse = await fetch(
          `/api/job-templates?industryId=${sessionData.hearingSession.industry.id}`
        );
        if (!templatesResponse.ok) {
          throw new Error("テンプレートの取得に失敗しました");
        }
        const templatesData = await templatesResponse.json();
        setTemplates(templatesData.templates);
        
        // デフォルトテンプレートを選択
        const defaultTemplate = templatesData.templates.find(
          (t: JobTemplate) => t.isDefault
        );
        if (defaultTemplate) {
          setSelectedTemplate(defaultTemplate.id);
        } else if (templatesData.templates.length > 0) {
          setSelectedTemplate(templatesData.templates[0].id);
        }

        // AIプロバイダー一覧
        const providersResponse = await fetch("/api/ai-providers");
        if (providersResponse.ok) {
          const providersData = await providersResponse.json();
          setAIProviders(providersData.providers);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(
          error instanceof Error ? error.message : "予期せぬエラーが発生しました"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  // 募集要項生成開始
  const handleGenerateStart = () => {
    if (!selectedTemplate) {
      setError("テンプレートを選択してください");
      return;
    }

    if (!title) {
      setError("タイトルを入力してください");
      return;
    }

    if (aiProviders.length > 0) {
      setIsAIDialogOpen(true);
    } else {
      // AIプロバイダーが設定されていない場合は直接生成
      handleGenerate(null);
    }
  };

  // 募集要項を生成
  const handleGenerate = async (aiProviderId: string | null) => {
    if (!hearingSession) return;

    setIsAIDialogOpen(false);
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/job-descriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: hearingSession.id,
          jobTemplateId: selectedTemplate,
          title,
          aiProviderId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "募集要項の生成に失敗しました");
      }

      const data = await response.json();
      
      // 生成された募集要項の詳細ページに遷移
      router.push(`/dashboard/job-descriptions/${data.jobDescription.id}`);
    } catch (error) {
      console.error("Error generating job description:", error);
      setError(
        error instanceof Error ? error.message : "予期せぬエラーが発生しました"
      );
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">読み込み中...</div>;
  }

  if (error && !hearingSession) {
    return (
      <div className="bg-destructive/10 text-destructive p-4 rounded-md">
        {error}
        <div className="mt-4">
          <Button asChild>
            <Link href="/dashboard/hearings">一覧に戻る</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!hearingSession) {
    return (
      <div className="bg-muted/40 rounded-lg p-6 text-center">
        <p className="mb-4">ヒアリングセッションが見つかりませんでした</p>
        <Button asChild>
          <Link href="/dashboard/hearings">一覧に戻る</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">募集要項の生成</h1>
        <Button variant="outline" asChild>
          <Link href="/dashboard/hearings">ヒアリング一覧へ戻る</Link>
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          {error}
        </div>
      )}

      <div className="bg-card border rounded-lg shadow-sm p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">ヒアリング情報</h2>
          <div className="text-sm text-muted-foreground mb-4">
            <p>
              <span className="font-medium">業種:</span> {hearingSession.industry.name}
            </p>
            {hearingSession.title && (
              <p>
                <span className="font-medium">タイトル:</span> {hearingSession.title}
              </p>
            )}
            <p>
              <span className="font-medium">回答数:</span> {hearingSession.responses.length}
            </p>
          </div>

          <div className="space-y-3 mt-4">
            {hearingSession.responses.map((response, index) => (
              <div key={index} className="bg-muted/30 p-3 rounded">
                <p className="font-medium">{response.hearingItem.question}</p>
                <p className="text-muted-foreground mt-1">{response.answer}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t pt-6">
          <h2 className="text-xl font-semibold mb-4">募集要項設定</h2>

          <div className="space-y-4">
            <div>
              <Label htmlFor="title">募集要項タイトル</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="募集要項のタイトルを入力"
                required
              />
            </div>

            <div>
              <Label htmlFor="template">テンプレート</Label>
              {templates.length === 0 ? (
                <p className="text-destructive mt-1">
                  この業種のテンプレートがありません。先にテンプレートを作成してください。
                </p>
              ) : (
                <select
                  id="template"
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="" disabled>
                    テンプレートを選択
                  </option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                      {template.isDefault ? " (デフォルト)" : ""}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="pt-4">
              <Button
                onClick={handleGenerateStart}
                disabled={
                  isGenerating ||
                  !selectedTemplate ||
                  !title ||
                  templates.length === 0
                }
                className="w-full"
              >
                {isGenerating ? "生成中..." : "募集要項を生成"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* AIプロバイダー選択ダイアログ */}
      <Dialog open={isAIDialogOpen} onOpenChange={setIsAIDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>AIプロバイダーの選択</DialogTitle>
            <DialogDescription>
              募集要項の生成に使用するAIプロバイダーを選択してください
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
              <div
                className={`p-4 border rounded-md cursor-pointer ${
                  selectedAIProvider === null
                    ? "border-primary bg-primary/5"
                    : ""
                }`}
                onClick={() => setSelectedAIProvider(null)}
              >
                <div className="font-medium">デフォルトを使用</div>
              </div>
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
              onClick={() => handleGenerate(selectedAIProvider)}
            >
              生成する
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
