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
    answer: string;
    hearingItem: {
      question: string;
    };
  }[];
}

export default function HearingsPage() {
  const [hearingSessions, setHearingSessions] = useState<HearingSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ヒアリングセッション一覧を取得
  useEffect(() => {
    const fetchHearingSessions = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/hearings");
        if (!response.ok) {
          throw new Error("ヒアリングセッションの取得に失敗しました");
        }
        const data = await response.json();
        setHearingSessions(data.hearingSessions);
      } catch (error) {
        console.error("Error fetching hearing sessions:", error);
        setError(
          error instanceof Error ? error.message : "予期せぬエラーが発生しました"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchHearingSessions();
  }, []);

  // 回答内容の一部を表示（最初の100文字だけ）
  const truncateAnswer = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) {
      return text;
    }
    return text.slice(0, maxLength) + "...";
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">ヒアリング管理</h1>
        <Button asChild>
          <Link href="/dashboard/hearings/new">新規ヒアリング</Link>
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-8">読み込み中...</div>
      ) : hearingSessions.length === 0 ? (
        <div className="bg-muted/40 rounded-lg p-6 text-center">
          <p className="mb-4">ヒアリングセッションがまだ作成されていません</p>
          <Button asChild>
            <Link href="/dashboard/hearings/new">ヒアリングを作成する</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {hearingSessions.map((session) => (
            <div
              key={session.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-card rounded-lg border shadow-sm"
            >
              <div className="flex-1 mb-4 sm:mb-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-semibold">
                    {session.title || session.industry.name}
                  </h3>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>業種: {session.industry.name}</p>
                  <p>回答数: {session.responses.length}</p>
                  {session.responses.length > 0 && (
                    <p className="mt-2">
                      {truncateAnswer(session.responses[0].answer)}
                    </p>
                  )}
                  <p className="mt-1">更新日: {formatJaDate(session.updatedAt)}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" asChild>
                  <Link href={`/dashboard/hearings/${session.id}`}>
                    ヒアリング詳細
                  </Link>
                </Button>
                <Button asChild>
                  <Link href={`/dashboard/hearings/${session.id}/generate`}>
                    募集要項作成
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
