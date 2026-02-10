import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, seedData } from './db';
import { Clock, BarChart3 } from 'lucide-react';
import { TaskCard } from './components/TaskCard';
import { TaskDetail } from './components/TaskDetail';
import { LayoutDashboard, CalendarRange } from 'lucide-react';
import './App.css';

function Layout({ children }) {
  const location = useLocation();
  return (
    <div className="app-layout" style={{ height: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <header className="page-header">
        <span className="header-badge">Study Optimizer</span>
        <h1 className="header-title">勉強タスク管理</h1>
      </header>
      {/* children（TaskListなど）自体にヘッダーが含まれるため、mainをスクロール可能にする */}
      <main style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', overscrollBehaviorY: 'contain' }}>
        {children}
      </main>
      <nav className="bottom-nav">
        <Link to="/" className={`nav-item ${location.pathname === '/' ? 'nav-item--active' : ''}`}>
          <LayoutDashboard size={24} strokeWidth={2.5} />
          <span className="text-xs" style={{ fontWeight: 600 }}>ダッシュボード</span>
        </Link>
        <Link to="/stats" className={`nav-item ${location.pathname === '/stats' ? 'nav-item--active' : ''}`}>
          <CalendarRange size={24} strokeWidth={2.5} />
          <span className="text-xs" style={{ fontWeight: 600 }}>学習記録</span>
        </Link>
      </nav>
    </div>
  );
}

function TaskList() {
  const tasks = useLiveQuery(() => db.tasks.toArray());
  useEffect(() => { seedData(); }, []);

  if (!tasks) return null;
  const sortedTasks = [...tasks].sort((a, b) => 
    (a.isCompleted === b.isCompleted) ? b.priority - a.priority : (a.isCompleted ? 1 : -1)
  );

  return (
    <div className="page-container">
      <div className="grid grid-cols-1 gap-4 sm-grid-cols-2">
        {sortedTasks.map((task) => (
          <Link key={task.id} to={`/task/${task.id}`}>
            <TaskCard task={task} />
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<TaskList />} />
          <Route path="/task/:id" element={<TaskDetail />} />
          <Route path="/stats" element={<div className="page-container text-center text-gray-400">統計画面（準備中）</div>} />
        </Routes>
      </Layout>
    </Router>
  );
}