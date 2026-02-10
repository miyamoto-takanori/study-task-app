import React, { useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, seedData } from './db';
import { CheckCircle2, Clock, BarChart3 } from 'lucide-react';
import clsx from 'clsx';

function App() {
  // DBからタスクを取得（完了/未完了と重み付けでソートすることを想定）
  const tasks = useLiveQuery(async () => {
    const allTasks = await db.tasks.toArray();
    return allTasks.sort((a, b) => {
      if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
      // 簡易的な重み計算（優先度が高い順）
      return b.priority - a.priority;
    });
  });

  // 初回起動時にサンプルデータを入れる
  useEffect(() => {
    seedData();
  }, []);

  if (!tasks) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-20">
      {/* ヘッダー */}
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">勉強タスク管理</h1>
        <BarChart3 className="text-gray-500" />
      </header>

      {/* カードグリッド */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>

      {/* 下部ナビ（PWAっぽく） */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-white p-3 flex justify-around text-gray-400">
        <div className="text-blue-500 flex flex-col items-center">
          <Clock size={20} />
          <span className="text-xs">タスク</span>
        </div>
        <div className="flex flex-col items-center">
          <BarChart3 size={20} />
          <span className="text-xs">統計</span>
        </div>
      </div>
    </div>
  );
}

// カードコンポーネント
function TaskCard({ task }) {
  const progress = Math.round((task.completedItems / task.totalItems) * 100);

  return (
    <div className={clsx(
      "relative overflow-hidden rounded-2xl bg-white p-4 shadow-sm border transition-all active:scale-95",
      task.isCompleted ? "opacity-60" : "border-gray-100"
    )}>
      {/* 完了スタンプ */}
      {task.isCompleted && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/40 backdrop-blur-[1px]">
          <span className="rotate-[-12deg] border-4 border-red-500 px-4 py-1 text-2xl font-black text-red-500 opacity-80 uppercase">
            済
          </span>
        </div>
      )}

      <div className="mb-2 flex items-center justify-between">
        <span className="rounded-full bg-blue-100 px-3 py-0.5 text-xs font-medium text-blue-600">
          {task.category}
        </span>
        <span className="text-xs text-gray-400 font-mono">{task.deadline}</span>
      </div>

      <h3 className="text-lg font-bold text-gray-800">{task.title}</h3>
      <p className="mb-4 text-sm text-gray-500 leading-tight">{task.subtitle}</p>

      {/* プログレスバー */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs font-semibold text-gray-600">
          <span>{progress}%</span>
          <span>{task.completedItems}/{task.totalItems} 問題</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className={clsx(
              "h-full transition-all duration-500",
              progress === 100 ? "bg-green-500" : "bg-blue-500"
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default App;