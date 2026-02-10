import Dexie from 'dexie';

export const db = new Dexie('StudyAppDB');

// ストア（テーブル）の定義
db.version(1).stores({
  // ++id: 自動採番
  // インデックスを貼る項目（検索やソートに使うもの）をカンマ区切りで指定
  tasks: '++id, category, title, deadline, priority, isCompleted',
  logs: '++id, taskId, date'
});

// 初期データ（動作確認用）を入れる関数（任意）
export const seedData = async () => {
  const count = await db.tasks.count();
  if (count === 0) {
    await db.tasks.bulkAdd([
      {
        category: '院試対策',
        title: '入門コンピュータ科学',
        subtitle: '第1章 データストレージ 練習問題',
        totalItems: 53,
        completedItems: 20,
        deadline: '2026-03-01',
        priority: 5,
        isCompleted: false
      },
      {
        category: '専門科目',
        title: '離散数学',
        subtitle: 'グラフ理論 基礎',
        totalItems: 30,
        completedItems: 30,
        deadline: '2026-02-15',
        priority: 3,
        isCompleted: true
      }
    ]);
  }
};