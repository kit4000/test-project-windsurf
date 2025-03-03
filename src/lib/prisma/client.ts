import { PrismaClient } from '@prisma/client';

// PrismaClientのグローバル変数の型を拡張
declare global {
  var prisma: PrismaClient | undefined;
}

// 開発環境での不要な複数のPrismaClientインスタンス生成を防ぐ
export const prisma =
  global.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

// 開発環境でのみグローバル変数にPrismaClientを割り当て
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}
