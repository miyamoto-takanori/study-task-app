import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { CheckCircle2, ChevronLeft } from 'lucide-react';
import clsx from 'clsx';

export function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const task = useLiveQuery(() => db.tasks.get(Number(id)), [id]);

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
  const themeColor = task.color || '#3b82f6';

return (
    <div className="detail-page" style={{ '--theme-color': themeColor }}>
      <div className="detail-header">
        <button onClick={() => navigate(-1)} className="back-button">
          <ChevronLeft size={24} />
        </button>
        <h2 className="detail-title">{task.title}</h2>
      </div>
      
      <div className="detail-progress-section">
        <div className="progress-label">
          <span>進捗状況</span>
          <span>{progress}%</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="item-list">
        {task.items?.map((item) => (
          <div key={item.id} className="item-row" onClick={() => toggleItem(item.id)}>
            <div className={clsx("check-box", item.done && "check-box--active")}>
              {item.done && <CheckCircle2 size={16} className="text-white" />}
            </div>
            <span className={clsx("item-text", item.done && "item-text--done")}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}