import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * テールウィンドCSSのクラスをマージする関数
 * @param inputs 結合するクラス名
 * @returns マージされたクラス名
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 日付を日本語形式でフォーマットする関数
 * @param date フォーマットする日付
 * @returns 日本語形式の日付文字列
 */
export function formatJaDate(date: Date | string | null | undefined): string {
  if (!date) return "-";
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}年${month}月${day}日`;
}

/**
 * APIエラーをハンドリングする関数
 * @param error エラーオブジェクト
 * @returns エラーメッセージ
 */
export function handleApiError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "予期せぬエラーが発生しました";
}

/**
 * 指定した長さで文字列を切り詰める関数
 * @param text 切り詰める文字列
 * @param maxLength 最大長さ
 * @returns 切り詰めた文字列
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength)}...`;
}

/**
 * ステータスを日本語に変換する関数
 * @param status ステータス文字列
 * @returns 日本語に変換されたステータス
 */
export function translateStatus(status: string): string {
  const statusMap: Record<string, string> = {
    draft: "下書き",
    published: "公開",
  };
  return statusMap[status] || status;
}

/**
 * ファイルをダウンロードする関数
 * @param content コンテンツ
 * @param fileName ファイル名
 * @param contentType コンテンツタイプ
 */
export function downloadFile(
  content: string,
  fileName: string,
  contentType: string
) {
  const a = document.createElement("a");
  const file = new Blob([content], { type: contentType });
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(a.href);
}

/**
 * 配列をソートする関数
 * @param array ソートする配列
 * @param key ソートするキー
 * @param order ソート順（昇順または降順）
 * @returns ソートされた配列
 */
export function sortArrayByKey<T>(
  array: T[],
  key: keyof T,
  order: "asc" | "desc" = "asc"
): T[] {
  return [...array].sort((a, b) => {
    const valueA = a[key];
    const valueB = b[key];

    if (valueA === valueB) return 0;

    const comparison = valueA < valueB ? -1 : 1;
    return order === "asc" ? comparison : -comparison;
  });
}
