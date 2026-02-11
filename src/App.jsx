import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db';
import { TaskCard } from './components/TaskCard';
import { TaskDetail } from './components/TaskDetail';
import { AddTask } from './components/AddTask';
import { EditTaskModal } from './components/EditTaskModal';
import { LayoutDashboard, CalendarRange, Plus } from 'lucide-react';
import './App.css';

function Layout({ children, activeTab, setActiveTab, isDetailPage, clearTask }) {
  const [headerOffset, setHeaderOffset] = React.useState(0);
  const [lastScrollY, setLastScrollY] = React.useState(0);

  const handleScroll = (e) => {
    const currentScrollY = e.currentTarget.scrollTop;
    const scrollHeight = e.currentTarget.scrollHeight;
    const clientHeight = e.currentTarget.clientHeight;

    if (currentScrollY <= 0) {
      setHeaderOffset(0);
      setLastScrollY(0);
      return;
    }
    if (currentScrollY + clientHeight >= scrollHeight - 5) return;

    const diff = currentScrollY - lastScrollY;
    
    setHeaderOffset((prev) => {
      const nextOffset = prev + diff;
      return Math.min(Math.max(nextOffset, 0), 90); 
    });

    setLastScrollY(currentScrollY);
  };

  const headerStyle = {
    transform: `translateY(-${isDetailPage ? 0 : headerOffset}px)`,
    opacity: isDetailPage ? 1 : 1 - (headerOffset / 90),
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    transition: 'none'
  };

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
          overscrollBehaviorY: 'none',
          position: 'relative'
        }}
      >
        <div style={{ paddingTop: isDetailPage ? '0' : '85px' }}>
          {children}
        </div>
      </main>

      <nav className="bottom-nav">
        <div 
          onClick={() => { clearTask(); setActiveTab('add'); }} 
          className={`nav-item ${activeTab === 'add' && !isDetailPage ? 'nav-item--active' : ''}`}
        >
          <Plus size={24} strokeWidth={2.5} />
          <span className="text-xs">追加</span>
        </div>
        <div 
          onClick={() => { clearTask(); setActiveTab('dashboard'); }} 
          className={`nav-item ${activeTab === 'dashboard' && !isDetailPage ? 'nav-item--active' : ''}`}
        >
          <LayoutDashboard size={24} strokeWidth={2.5} />
          <span className="text-xs">ダッシュボード</span>
        </div>
        <div 
          onClick={() => { clearTask(); setActiveTab('stats'); }} 
          className={`nav-item ${activeTab === 'stats' && !isDetailPage ? 'nav-item--active' : ''}`}
        >
          <CalendarRange size={24} strokeWidth={2.5} />
          <span className="text-xs">学習記録</span>
        </div>
      </nav>
    </div>
  );
}

function TaskList({ onSelectTask }) {
  const tasks = useLiveQuery(() => db.tasks.toArray());
  const categories = useLiveQuery(() => db.categories.toArray());
  
  // 現在メニューを表示しているタスクID
  const [activeCardId, setActiveCardId] = React.useState(null);
  // 編集モーダルに渡すタスク
  const [editingTask, setEditingTask] = React.useState(null);
  const timerRef = React.useRef(null);

  const handleTouchStart = (task) => {
    // すでにメニューが開いている場合は何もしない
    if (activeCardId) return;

    timerRef.current = setTimeout(() => {
      setActiveCardId(task.id); // カードをメニュー状態にする
      if (window.navigator.vibrate) window.navigator.vibrate(50);
    }, 600);
  };

  const handleTouchEnd = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const handleTouchMove = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };
  
  if (!tasks || !categories) return null;
  
  const sortedTasks = [...tasks].sort((a, b) => 
    (a.isCompleted === b.isCompleted) ? b.priority - a.priority : (a.isCompleted ? 1 : -1)
  );

  return (
    <div className="page-container" onClick={() => setActiveCardId(null)}>
      <div className="grid grid-cols-1 gap-4 sm-grid-cols-2">
        {sortedTasks.map((task) => {
          const category = categories.find(c => c.id === task.categoryId);
          const isMenuOpen = activeCardId === task.id;
          
          return (
            <div 
              key={task.id} 
              className="task-card-wrapper"
              style={{ position: 'relative' }}
              onTouchStart={() => handleTouchStart(task)}
              onTouchEnd={handleTouchEnd}
              onTouchMove={handleTouchMove}
            >
              {/* 通常のカード表示 */}
              <div 
                onClick={() => !isMenuOpen && onSelectTask(task.id)}
                className="clickable-card"
                style={{ 
                  opacity: isMenuOpen ? 0.3 : 1, // メニュー時は薄くする
                  transition: 'opacity 0.2s ease',
                  WebkitTouchCallout: 'none'
                }}
              >
                <TaskCard task={task} category={category} />
              </div>

              {/* カードの上に重なる編集・削除メニュー */}
              {isMenuOpen && (
                <div className="card-quick-menu">
                  <div 
                    className="menu-item edit" 
                    onClick={(e) => { e.stopPropagation(); setEditingTask(task); setActiveCardId(null); }}
                  >
                    編集
                  </div>
                  <div 
                    className="menu-item delete" 
                    onClick={(e) => { e.stopPropagation(); /* 削除モーダルへ */ setEditingTask({...task, forceDelete: true}); setActiveCardId(null); }}
                  >
                    削除
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {editingTask && (
        <EditTaskModal 
          task={editingTask} 
          initialDeleteMode={editingTask.forceDelete}
          onClose={() => setEditingTask(null)} 
        />
      )}
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const [selectedTaskId, setSelectedTaskId] = React.useState(null);

  // コンテンツの出し分けロジック
  const renderContent = () => {
    if (selectedTaskId) {
      return <TaskDetail taskId={selectedTaskId} onBack={() => setSelectedTaskId(null)} />;
    }
    switch (activeTab) {
      case 'add': return <AddTask onSave={() => setActiveTab('dashboard')} />;
      case 'stats': return <div className="page-container text-center text-gray-400">統計画面（準備中）</div>;
      default: return <TaskList onSelectTask={(id) => setSelectedTaskId(id)} />;
    }
  };

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      isDetailPage={!!selectedTaskId}
      clearTask={() => setSelectedTaskId(null)}
    >
      {renderContent()}
    </Layout>
  );
}