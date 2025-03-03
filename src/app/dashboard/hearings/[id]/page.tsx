"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatJaDate } from "@/lib/utils";

interface HearingSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  industry: {
    name: string;
  };
  responses: {
    id: string;
    answer: string;
    hearingItem: {
      id: string;
      question: string;
      description: string | null;
    };
  }[];
}

export default function HearingDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [hearingSession, setHearingSession] = useState<HearingSession | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ヒアリングセッション詳細を取得
  useEffect(() => {
    const fetchHearingSession = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/hearings/${params.id}`);
        if (!response.ok) {
          throw new Error("ヒアリングセッションの取得に失敗しました");
        }
        const data = await response.json();
        setHearingSession(data.hearingSession);
      } catch (error) {
        console.error("Error fetching hearing session:", error);
        setError(
          error instanceof Error ? error.message : "予期せぬエラーが発生しました"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchHearingSession();
  }, [params.id]);

  if (isLoading) {
    return <div className="text-center py-8">読み込み中...</div>;
  }

  if (error) {
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-bold">
              {hearingSession.title || hearingSession.industry.name}
            </h1>
          </div>
          <div className="text-sm text-muted-foreground">
            <p>業種: {hearingSession.industry.name}</p>
            <p>作成日: {formatJaDate(hearingSession.createdAt)}</p>
            <p>更新日: {formatJaDate(hearingSession.updatedAt)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href={`/dashboard/hearings/${params.id}/generate`}>
              募集要項作成
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/hearings">一覧に戻る</Link>
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold">ヒアリング内容</h2>
        <div className="space-y-4">
          {hearingSession.responses.map((response) => (
            <div
              key={response.id}
              className="bg-card p-4 rounded-lg border shadow-sm"
            >
              <h3 className="font-medium text-lg mb-2">
                {response.hearingItem.question}
              </h3>
              {response.hearingItem.description && (
                <p className="text-sm text-muted-foreground mb-3">
                  {response.hearingItem.description}
                </p>
              )}
              <div className="bg-muted/30 p-3 rounded-md whitespace-pre-wrap">
                {response.answer}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
