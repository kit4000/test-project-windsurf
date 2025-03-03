"use client";

import { useState, useEffect } from "react";
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
import { AIProvider } from "@/types/job-description";
import { formatJaDate } from "@/lib/utils";

export default function AISettingsPage() {
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentProvider, setCurrentProvider] = useState<Partial<AIProvider> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // AIプロバイダー一覧を取得
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/ai-providers");
        if (!response.ok) {
          throw new Error("AIプロバイダーの取得に失敗しました");
        }
        const data = await response.json();
        setProviders(data.providers);
      } catch (error) {
        console.error("Error fetching AI providers:", error);
        setError(
          error instanceof Error ? error.message : "予期せぬエラーが発生しました"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchProviders();
  }, []);

  // 新規AIプロバイダー作成ダイアログを開く
  const handleAddProvider = () => {
    setCurrentProvider({
      name: "",
      provider: "openai",
      modelName: "",
      apiKey: "",
      baseUrl: "",
      isDefault: providers.length === 0,
      temperature: 0.7,
      maxTokens: 4000,
    });
    setIsDialogOpen(true);
  };

  // AIプロバイダー編集ダイアログを開く
  const handleEditProvider = (provider: AIProvider) => {
    // APIキーはマスクして表示
    setCurrentProvider({
      ...provider,
      apiKey: "********",
    });
    setIsDialogOpen(true);
  };

  // AIプロバイダーを削除
  const handleDeleteProvider = async (id: string) => {
    if (!confirm("このAIプロバイダーを削除してもよろしいですか？")) {
      return;
    }

    try {
      const response = await fetch(`/api/ai-providers/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("AIプロバイダーの削除に失敗しました");
      }

      // 削除後に一覧を更新
      setProviders((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Error deleting AI provider:", error);
      setError(
        error instanceof Error ? error.message : "予期せぬエラーが発生しました"
      );
    }
  };

  // フォーム送信処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProvider) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // 新規作成または更新
      const method = currentProvider.id ? "PUT" : "POST";
      const url = currentProvider.id
        ? `/api/ai-providers/${currentProvider.id}`
        : "/api/ai-providers";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(currentProvider),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "操作に失敗しました");
      }

      const data = await response.json();

      // 一覧を更新
      if (currentProvider.id) {
        setProviders((prev) =>
          prev.map((p) => (p.id === data.provider.id ? data.provider : p))
        );
      } else {
        setProviders((prev) => [...prev, data.provider]);
      }

      // ダイアログを閉じる
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving AI provider:", error);
      setError(
        error instanceof Error ? error.message : "予期せぬエラーが発生しました"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // フィールド変更処理
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    setCurrentProvider((prev) => {
      if (!prev) return prev;

      if (type === "checkbox") {
        return {
          ...prev,
          [name]: (e.target as HTMLInputElement).checked,
        };
      } else if (name === "temperature" || name === "maxTokens") {
        return {
          ...prev,
          [name]: parseFloat(value),
        };
      }

      return {
        ...prev,
        [name]: value,
      };
    });
  };

  // デフォルトプロバイダー設定
  const handleSetDefault = async (id: string) => {
    try {
      const response = await fetch(`/api/ai-providers/${id}`, {
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
      setProviders((prev) =>
        prev.map((p) => ({
          ...p,
          isDefault: p.id === id,
        }))
      );
    } catch (error) {
      console.error("Error setting default provider:", error);
      setError(
        error instanceof Error ? error.message : "予期せぬエラーが発生しました"
      );
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">AI設定</h1>
        <Button onClick={handleAddProvider}>新規追加</Button>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-8">読み込み中...</div>
      ) : providers.length === 0 ? (
        <div className="bg-muted/40 rounded-lg p-6 text-center">
          <p className="mb-4">AIプロバイダーが設定されていません</p>
          <Button onClick={handleAddProvider}>AIプロバイダーを追加</Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {providers.map((provider) => (
            <div
              key={provider.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-card rounded-lg border shadow-sm"
            >
              <div className="flex-1 mb-4 sm:mb-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-semibold">{provider.name}</h3>
                  {provider.isDefault && (
                    <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                      デフォルト
                    </span>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>プロバイダー: {provider.provider}</p>
                  <p>モデル: {provider.modelName}</p>
                  <p>作成日: {formatJaDate(provider.createdAt)}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {!provider.isDefault && (
                  <Button
                    variant="outline"
                    onClick={() => handleSetDefault(provider.id)}
                  >
                    デフォルトに設定
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => handleEditProvider(provider)}
                >
                  編集
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteProvider(provider.id)}
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
                {currentProvider?.id ? "AIプロバイダーを編集" : "AIプロバイダーを追加"}
              </DialogTitle>
              <DialogDescription>
                生成AIのプロバイダー情報を設定してください
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">プロバイダー名</Label>
                <Input
                  id="name"
                  name="name"
                  value={currentProvider?.name || ""}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="provider">プロバイダータイプ</Label>
                <select
                  id="provider"
                  name="provider"
                  value={currentProvider?.provider || "openai"}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic</option>
                  <option value="gemini">Google Gemini</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="modelName">モデル名</Label>
                <Input
                  id="modelName"
                  name="modelName"
                  value={currentProvider?.modelName || ""}
                  onChange={handleChange}
                  placeholder="gpt-4-turbo, claude-3-opus-20240229 など"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="apiKey">APIキー</Label>
                <Input
                  id="apiKey"
                  name="apiKey"
                  type="password"
                  value={currentProvider?.apiKey || ""}
                  onChange={handleChange}
                  required={!currentProvider?.id}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="baseUrl">API URL（オプション）</Label>
                <Input
                  id="baseUrl"
                  name="baseUrl"
                  value={currentProvider?.baseUrl || ""}
                  onChange={handleChange}
                  placeholder="デフォルトのAPIエンドポイントと異なる場合に指定"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="temperature">Temperature</Label>
                  <Input
                    id="temperature"
                    name="temperature"
                    type="number"
                    min="0"
                    max="2"
                    step="0.1"
                    value={currentProvider?.temperature || 0.7}
                    onChange={handleChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="maxTokens">最大トークン数</Label>
                  <Input
                    id="maxTokens"
                    name="maxTokens"
                    type="number"
                    min="1"
                    step="1"
                    value={currentProvider?.maxTokens || 4000}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="isDefault"
                  name="isDefault"
                  type="checkbox"
                  checked={currentProvider?.isDefault || false}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="isDefault">デフォルトに設定する</Label>
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
                {isSubmitting
                  ? "保存中..."
                  : currentProvider?.id
                  ? "更新"
                  : "作成"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
