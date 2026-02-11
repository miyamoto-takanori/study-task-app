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
};