"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatJaDate, translateStatus } from "@/lib/utils";

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
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function JobDescriptionsPage() {
  const [jobDescriptions, setJobDescriptions] = useState<JobDescription[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 募集要項一覧を取得
  useEffect(() => {
    const fetchJobDescriptions = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `/api/job-descriptions?page=${pagination.page}&limit=${pagination.limit}`
        );
        if (!response.ok) {
          throw new Error("募集要項の取得に失敗しました");
        }
        const data = await response.json();
        setJobDescriptions(data.jobDescriptions);
        setPagination(data.pagination);
      } catch (error) {
        console.error("Error fetching job descriptions:", error);
        setError(
          error instanceof Error ? error.message : "予期せぬエラーが発生しました"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobDescriptions();
  }, [pagination.page, pagination.limit]);

  // 募集要項を削除
  const handleDelete = async (id: string) => {
    if (!confirm("この募集要項を削除してもよろしいですか？")) {
      return;
    }

    try {
      const response = await fetch(`/api/job-descriptions/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("募集要項の削除に失敗しました");
      }

      // 削除後に一覧を更新
      setJobDescriptions((prev) => prev.filter((item) => item.id !== id));
      setPagination((prev) => ({
        ...prev,
        total: prev.total - 1,
        totalPages: Math.ceil((prev.total - 1) / prev.limit),
      }));
    } catch (error) {
      console.error("Error deleting job description:", error);
      setError(
        error instanceof Error ? error.message : "予期せぬエラーが発生しました"
      );
    }
  };

  // ページネーション処理
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">募集要項</h1>
        <Button asChild>
          <Link href="/dashboard/hearings">ヒアリングから作成</Link>
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-8">読み込み中...</div>
      ) : jobDescriptions.length === 0 ? (
        <div className="bg-muted/40 rounded-lg p-6 text-center">
          <p className="mb-4">募集要項がまだ作成されていません</p>
          <Button asChild>
            <Link href="/dashboard/hearings">ヒアリングから作成する</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="grid gap-4">
            {jobDescriptions.map((jobDescription) => (
              <div
                key={jobDescription.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-card rounded-lg border shadow-sm"
              >
                <div className="flex-1 mb-4 sm:mb-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-semibold">
                      {jobDescription.title}
                    </h3>
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
                    {jobDescription.hearingSession && (
                      <p>
                        ヒアリング:{" "}
                        {jobDescription.hearingSession.title ||
                          jobDescription.hearingSession.industry.name}
                      </p>
                    )}
                    <p>更新日: {formatJaDate(jobDescription.updatedAt)}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" asChild>
                    <Link href={`/dashboard/job-descriptions/${jobDescription.id}`}>
                      詳細を見る
                    </Link>
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(jobDescription.id)}
                  >
                    削除
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* ページネーション */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                前へ
              </Button>
              <span className="mx-2">
                {pagination.page} / {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
              >
                次へ
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
