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
  const [headerOffset, setHeaderOffset] = React.useState(0); // 0(表示) 〜 100(隠れる)
  const [lastScrollY, setLastScrollY] = React.useState(0);

  const handleScroll = (e) => {
    const currentScrollY = e.currentTarget.scrollTop;
    const scrollHeight = e.currentTarget.scrollHeight;
    const clientHeight = e.currentTarget.clientHeight;

    // 下端のバウンド（オーバースクロール）での振動を防止
    if (currentScrollY + clientHeight >= scrollHeight - 10) return;
    // 上端のバウンド（オーバースクロール）での振動を防止
    if (currentScrollY <= 0) {
      setHeaderOffset(0);
      setLastScrollY(0);
      return;
    }

    const diff = currentScrollY - lastScrollY;
    
    // スクロールした分だけヘッダーの位置を動かす
    // 0(完全に表示) から 80(ヘッダーの高さ分) の間でクランプ
    setHeaderOffset((prev) => {
      const nextOffset = prev + diff;
      return Math.min(Math.max(nextOffset, 0), 80);
    });

    setLastScrollY(currentScrollY);
  };

  // オフセットに基づいてスタイルを計算
  const headerStyle = {
    transform: `translateY(-${headerOffset}px)`,
    opacity: 1 - headerOffset / 80,
    transition: 'none' // スワイプに同期させるため、移動中のアニメーションはオフ
  };

  return (
    <div className="app-layout" style={{ height: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <header className="page-header" style={headerStyle}>
        <span className="header-badge">Study Optimizer</span>
        <h1 className="header-title">勉強タスク管理</h1>
      </header>

      <main 
        onScroll={handleScroll} 
        style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', overscrollBehaviorY: 'contain' }}
      >
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