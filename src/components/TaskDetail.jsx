import React, { useMemo } from 'react';
// useParams, useNavigate は使わないのでインポートを削除
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { CheckCircle2, ChevronLeft } from 'lucide-react';
import clsx from 'clsx';
import './TaskDetail.css';

// Props として taskId と onBack を受け取る
export function TaskDetail({ taskId, onBack }) {
  
  // URLのパラメータ (id) の代わりに props の taskId を使用
  const task = useLiveQuery(() => db.tasks.get(Number(taskId)), [taskId]);
  const categories = useLiveQuery(() => db.categories.toArray());
  const category = categories?.find(c => c.id === task?.categoryId);

  const sortedItems = useMemo(() => {
    if (!task?.items) return [];
    return [...task.items].sort((a, b) => {
      if (a.done === b.done) return a.id - b.id;
      return a.done ? 1 : -1;
    });
  }, [task]);

  if (!task) return <div className="loading-state">読み込み中...</div>;

  const toggleItem = async (itemId) => {
    const updatedItems = task.items.map(item => 
      item.id === itemId ? { ...item, done: !item.done } : item
    );
    const completedCount = updatedItems.filter(i => i.done).length;
    await db.tasks.update(task.id, {
      items: updatedItems,
      completedItems: completedCount,
      isCompleted: completedCount === task.totalItems
    });
  };

  const progress = Math.round((task.completedItems / task.totalItems) * 100);
  const themeColor = category?.color || '#3b82f6';

  return (
    <div className="detail-page" style={{ '--theme-color': themeColor }}>
      <div className="detail-header-fixed">
        {/* navigate(-1) の代わりに props の onBack を実行 */}
        <button onClick={onBack} className="back-button">
          <ChevronLeft size={28} strokeWidth={2.5} />
        </button>
        <div className="header-text-group">
          <p className="header-category-name">{category?.name}</p>
          <h2 className="detail-title">{task.title}</h2>
        </div>
      </div>
      
      <div className="detail-content">
        <div className="detail-info-card">
          <p className="detail-subtitle">{task.subtitle}</p>
          <div className="detail-progress-section">
            <div className="progress-label">
              <span>進捗状況</span>
              <span>{progress}%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        <div className="item-list">
          {sortedItems.map((item) => (
            <div key={item.id} className="item-row" onClick={() => toggleItem(item.id)}>
              <div className={clsx("check-box", item.done && "check-box--active")}>
                {item.done && <CheckCircle2 size={18} className="text-white" />}
              </div>
              <span className={clsx("item-text", item.done && "item-text--done")}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}