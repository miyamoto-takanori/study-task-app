import Dexie from 'dexie';

export const db = new Dexie('StudyAppDB');

db.version(1).stores({
  tasks: '++id, category, title, deadline, priority, isCompleted',
  logs: '++id, taskId, date'
});

export const seedData = async () => {
  const count = await db.tasks.count();
  if (count === 0) {
    await db.tasks.bulkAdd([
      {
        category: '院試対策',
        title: '入門コンピュータ科学',
        subtitle: '第1章 練習問題',
        color: '#3b82f6', // 青 (blue-500)
        totalItems: 53,
        completedItems: 0,
        // 53個の問題リストを自動生成
        items: Array.from({ length: 53 }, (_, i) => ({
          id: i + 1,
          label: `問題 ${i + 1}`,
          done: false
        })),
        deadline: '2026-03-01',
        priority: 5,
        isCompleted: false
      },
      {
        category: '専門科目',
        title: '離散数学',
        subtitle: 'グラフ理論 基礎',
        color: '#f97316', // オレンジ (orange-500)
        totalItems: 10,
        completedItems: 10,
        // 10個すべて完了済みのリスト
        items: Array.from({ length: 10 }, (_, i) => ({
          id: i + 1,
          label: `例題 ${i + 1}`,
          done: true
        })),
        deadline: '2026-02-15',
        priority: 3,
        isCompleted: true
      }
    ]);
  }
};