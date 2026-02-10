import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, seedData } from './db';
import { TaskCard } from './components/TaskCard';
import { TaskDetail } from './components/TaskDetail';
import { AddTask } from './components/AddTask';
import { LayoutDashboard, CalendarRange, Plus } from 'lucide-react';
import './App.css';

function Layout({ children }) {
  const location = useLocation();
  const [headerOffset, setHeaderOffset] = React.useState(0);
  const [lastScrollY, setLastScrollY] = React.useState(0);

  const handleScroll = (e) => {
    const currentScrollY = e.currentTarget.scrollTop;
    const scrollHeight = e.currentTarget.scrollHeight;
    const clientHeight = e.currentTarget.clientHeight;

    // バウンド時のガード
    if (currentScrollY <= 0) {
      setHeaderOffset(0);
      setLastScrollY(0);
      return;
    }
    if (currentScrollY + clientHeight >= scrollHeight - 5) return;

    const diff = currentScrollY - lastScrollY;
    
    // ヘッダーの高さ（約80px）に合わせて隠す量を調整
    setHeaderOffset((prev) => {
      const nextOffset = prev + diff;
      return Math.min(Math.max(nextOffset, 0), 90); 
    });

    setLastScrollY(currentScrollY);
  };

  const headerStyle = {
    transform: `translateY(-${headerOffset}px)`,
    opacity: 1 - (headerOffset / 90),
    position: 'absolute', // 固定ではなく絶対配置に
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    transition: 'none'
  };

  const isDetailPage = location.pathname.startsWith('/task/');
  
  return (
    <div className="app-layout" style={{ height: '100dvh', display: 'flex', flexDirection: 'column' }}>
    {!isDetailPage && (
      <header className="page-header" style={headerStyle}>
        <span className="header-badge">Study Optimizer</span>
        <h1 className="header-title">勉強タスク管理</h1>
      </header>
    )}

      <main 
        onScroll={handleScroll} 
        style={{ 
          height: '100%', 
          overflowY: 'auto', 
          WebkitOverflowScrolling: 'touch',
          overscrollBehaviorY: 'contain'
        }}
      >
        {/* ヘッダーの初期高さ分だけ内側に余白を持たせる */}
        <div style={{ paddingTop: '85px' }}>
          {children}
        </div>
      </main>
      <nav className="bottom-nav">
        <Link to="/add" className={`nav-item ${location.pathname === '/add' ? 'nav-item--active' : ''}`}>
          <Plus size={24} strokeWidth={2.5} />
          <span className="text-xs" style={{ fontWeight: 600 }}>追加</span>
        </Link>
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
  const categories = useLiveQuery(() => db.categories.toArray());
  useEffect(() => { seedData(); }, []);

  if (!tasks || !categories) return null;
  
  const sortedTasks = [...tasks].sort((a, b) => 
    (a.isCompleted === b.isCompleted) ? b.priority - a.priority : (a.isCompleted ? 1 : -1)
  );

  return (
    <div className="page-container">
      <div className="grid grid-cols-1 gap-4 sm-grid-cols-2">
        {sortedTasks.map((task) => {
          const category = categories.find(c => c.id === task.categoryId);
          
          return (
          <Link key={task.id} to={`/task/${task.id}`}>
            <TaskCard task={task} category={category} />
          </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/add" element={<AddTask />} />
          <Route path="/" element={<TaskList />} />
          <Route path="/task/:id" element={<TaskDetail />} />
          <Route path="/stats" element={<div className="page-container text-center text-gray-400">統計画面（準備中）</div>} />
        </Routes>
      </Layout>
    </Router>
  );
}