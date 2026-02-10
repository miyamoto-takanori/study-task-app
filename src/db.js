import Dexie from 'dexie';

export const db = new Dexie('StudyAppDB');

db.version(1).stores({
  tasks: '++id, categoryId, title, deadline, priority, isCompleted',
  categories: '++id, name, color',
  logs: '++id, taskId, date'
});

export const seedData = async () => {
  const catCount = await db.categories.count();
  if (catCount === 0) {
    await db.categories.bulkAdd([
      { id: 1, name: '院試対策', color: '#3b82f6' },
      { id: 2, name: '専門科目', color: '#f97316' },
      { id: 3, name: '英語', color: '#10b981' }
    ]);
  }

  const taskCount = await db.tasks.count();
  if (taskCount === 0) {
    // 初期データ（既存の構造を新しいcategoryId形式に合わせたもの）
    await db.tasks.add({
      categoryId: 1,
      title: '入門コンピュータ科学',
      subtitle: '第1章 練習問題',
      totalItems: 53,
      completedItems: 0,
      items: Array.from({ length: 53 }, (_, i) => ({ id: i + 1, label: `問題 ${i + 1}`, done: false })),
      deadline: '2026-03-01',
      priority: 5,
      isCompleted: false
    });
  }
};