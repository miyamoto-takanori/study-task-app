import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, seedData } from './db';
import { CheckCircle2, Clock, BarChart3, ChevronLeft } from 'lucide-react';
import clsx from 'clsx';

// --- 共通レイアウト（タブバーを固定） ---
function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {children}
      <nav className="fixed bottom-0 left-0 right-0 border-t bg-white p-3 flex justify-around text-gray-400 z-50">
        <Link to="/" className="flex flex-col items-center hover:text-blue-500">
          <Clock size={20} />
          <span className="text-xs">タスク</span>
        </Link>
        <Link to="/stats" className="flex flex-col items-center hover:text-blue-500">
          <BarChart3 size={20} />
          <span className="text-xs">統計</span>
        </Link>
      </nav>
    </div>
  );
}

// --- メイン画面（タスク一覧） ---
function TaskList() {
  const tasks = useLiveQuery(() => db.tasks.toArray());

  useEffect(() => {
    seedData();
  }, []);

  if (!tasks) return null;

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
    return b.priority - a.priority;
  });

  return (
    <div className="p-4">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">勉強タスク管理</h1>
      </header>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {sortedTasks.map((task) => (
          <Link key={task.id} to={`/task/${task.id}`}>
            <TaskCard task={task} />
          </Link>
        ))}
      </div>
    </div>
  );
}

// --- 詳細画面（問題一覧ページ） ---
function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // IDに基づいて特定のタスクを監視
  const task = useLiveQuery(() => db.tasks.get(Number(id)), [id]);

  if (!task) return <div className="p-4 text-center text-gray-500">読み込み中...</div>;

  const toggleItem = async (itemId) => {
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

  return (
    <div className="p-0">
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md p-4 flex items-center gap-4 border-b">
        <button onClick={() => navigate(-1)} className="p-1"><ChevronLeft size={24} /></button>
        <h2 className="text-lg font-bold truncate">{task.title}</h2>
      </div>
      
      <div className="p-4 bg-white border-b">
        <div className="flex justify-between text-sm mb-2 font-bold text-blue-600">
          <span>進捗状況</span>
          <span>{Math.round((task.completedItems / task.totalItems) * 100)}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
          <div 
            className="h-full bg-blue-500 transition-all duration-500" 
            style={{ width: `${(task.completedItems / task.totalItems) * 100}%` }}
          />
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {task.items?.map((item) => (
          <div 
            key={item.id} 
            className="flex items-center gap-4 p-4 bg-white active:bg-gray-50 transition-colors"
            onClick={() => toggleItem(item.id)}
          >
            <div className={clsx(
              "w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all shrink-0",
              item.done ? "bg-blue-500 border-blue-500 shadow-sm shadow-blue-200" : "border-gray-300"
            )}>
              {item.done && <CheckCircle2 size={16} className="text-white" />}
            </div>
            <span className={clsx(
              "text-base transition-all",
              item.done ? "text-gray-400 line-through" : "text-gray-700"
            )}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- カード部品（済スタンプ復活） ---
function TaskCard({ task }) {
  const progress = Math.round((task.completedItems / task.totalItems) * 100);
  return (
    <div className={clsx(
      "relative overflow-hidden rounded-2xl bg-white p-4 shadow-sm border transition-all active:scale-[0.98]",
      task.isCompleted ? "opacity-60 border-gray-200" : "border-gray-100 shadow-md shadow-gray-200/50"
    )}>
      {task.isCompleted && (
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <span className="rotate-[-12deg] border-[3px] border-red-500 px-3 py-0.5 text-xl font-black text-red-500 opacity-70 uppercase tracking-widest">
            済
          </span>
        </div>
      )}
      <div className="mb-2 flex items-center justify-between">
        <span className="rounded-full bg-blue-100 px-3 py-0.5 text-[10px] font-bold text-blue-600 uppercase tracking-wider">{task.category}</span>
        <span className="text-[10px] text-gray-400 font-mono">{task.deadline}</span>
      </div>
      <h3 className="text-lg font-bold text-gray-800 leading-tight mb-1">{task.title}</h3>
      <p className="mb-4 text-xs text-gray-500 line-clamp-1">{task.subtitle}</p>
      <div className="space-y-1.5">
        <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase">
          <span>{progress}%</span>
          <span>{task.completedItems}/{task.totalItems} Items</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div className={clsx("h-full transition-all duration-500", progress === 100 ? "bg-green-500" : "bg-blue-600")} style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}

// --- メインApp ---
export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<TaskList />} />
          <Route path="/task/:id" element={<TaskDetail />} />
          <Route path="/stats" element={<div className="p-8 text-center text-gray-400">統計画面（準備中）</div>} />
        </Routes>
      </Layout>
    </Router>
  );
}