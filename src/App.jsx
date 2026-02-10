import React, { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, seedData } from './db';
import { CheckCircle2, Clock, BarChart3, X } from 'lucide-react';
import clsx from 'clsx';

function App() {
  const [selectedTask, setSelectedTask] = useState(null);

  const tasks = useLiveQuery(async () => {
    const allTasks = await db.tasks.toArray();
    return allTasks.sort((a, b) => {
      if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
      return b.priority - a.priority;
    });
  });

  useEffect(() => {
    seedData();
  }, []);

  // タスクの進捗を更新する関数
  const toggleItem = async (task, itemId) => {
    const updatedItems = task.items.map(item => 
      item.id === itemId ? { ...item, done: !item.done } : item
    );
    const completedCount = updatedItems.filter(i => i.done).length;
    const isNowCompleted = completedCount === task.totalItems;

    await db.tasks.update(task.id, {
      items: updatedItems,
      completedItems: completedCount,
      isCompleted: isNowCompleted
    });
  };

  if (!tasks) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-20">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">勉強タスク管理</h1>
        <BarChart3 className="text-gray-500" />
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {tasks.map((task) => (
          <div key={task.id} onClick={() => setSelectedTask(task)}>
            <TaskCard task={task} />
          </div>
        ))}
      </div>

      {/* 詳細モーダル */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
          <div className="w-full max-w-lg rounded-t-3xl bg-white p-6 shadow-xl sm:rounded-3xl animate-in slide-in-from-bottom duration-300">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">{selectedTask.title}</h2>
              <button onClick={() => setSelectedTask(null)} className="p-2 text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {selectedTask.items.map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0"
                  onClick={() => toggleItem(selectedTask, item.id)}
                >
                  <div className={clsx(
                    "w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors",
                    item.done ? "bg-blue-500 border-blue-500" : "border-gray-300"
                  )}>
                    {item.done && <CheckCircle2 size={16} className="text-white" />}
                  </div>
                  <span className={clsx("text-sm", item.done ? "text-gray-400 line-through" : "text-gray-700")}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ナビゲーション */}
      <nav className="fixed bottom-0 left-0 right-0 border-t bg-white p-3 flex justify-around text-gray-400">
        <div className="text-blue-500 flex flex-col items-center"><Clock size={20} /><span className="text-xs">タスク</span></div>
        <div className="flex flex-col items-center"><BarChart3 size={20} /><span className="text-xs">統計</span></div>
      </nav>
    </div>
  );
}

function TaskCard({ task }) {
  const progress = Math.round((task.completedItems / task.totalItems) * 100);
  return (
    <div className={clsx(
      "relative overflow-hidden rounded-2xl bg-white p-4 shadow-sm border transition-all hover:border-blue-200 active:scale-[0.98]",
      task.isCompleted ? "bg-gray-50 opacity-80" : "border-gray-100"
    )}>
      <div className="mb-2 flex items-center justify-between">
        <span className="rounded-full bg-blue-100 px-3 py-0.5 text-xs font-medium text-blue-600">{task.category}</span>
        <span className="text-xs text-gray-400 font-mono">{task.deadline}</span>
      </div>
      <h3 className="text-lg font-bold text-gray-800">{task.title}</h3>
      <p className="mb-4 text-sm text-gray-500 leading-tight">{task.subtitle}</p>
      <div className="space-y-1">
        <div className="flex justify-between text-xs font-semibold text-gray-600">
          <span>{progress}%</span>
          <span>{task.completedItems}/{task.totalItems} 完了</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
          <div className={clsx("h-full transition-all duration-500", progress === 100 ? "bg-green-500" : "bg-blue-500")} style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}

export default App;