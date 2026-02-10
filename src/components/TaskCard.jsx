import React from 'react';
import clsx from 'clsx';
import './TaskCard.css';

export function TaskCard({ task }) {
  const progress = Math.round((task.completedItems / task.totalItems) * 100);
  const themeColor = task.color || '#3b82f6';

  // 期限が近いか判定（1週間以内）
  const isUrgent = React.useMemo(() => {
    if (!task.deadline || task.isCompleted) return false;
    const today = new Date();
    const deadline = new Date(task.deadline);
    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  }, [task.deadline, task.isCompleted]);
  
  return (
    <div 
      className={clsx("task-card", task.isCompleted ? "task-card--completed" : "task-card--active")}
      style={{ '--theme-color': themeColor }}
    >
      {task.isCompleted && (
        <div className="stamp-container">
          <span className="stamp-text">済</span>
        </div>
      )}
      <div className="card-header">
        <span className="category-tag">{task.category}</span>
        <span className={clsx("deadline-text", isUrgent && "deadline-text--urgent")}>
          {task.deadline}
        </span>
      </div>
      <h3 className="card-title">{task.title}</h3>
      <p className="card-subtitle">{task.subtitle}</p>
      
      <div className="progress-container">
        <div className="progress-info">
          <span>{progress}%</span>
          <span>{task.completedItems}/{task.totalItems} Items</span>
        </div>
        <div className="progress-bar-bg">
          <div 
            className={clsx("progress-bar-fill", task.isCompleted && "bg-green-500")} 
            style={{ width: `${progress}%` }} 
          />
        </div>
      </div>
    </div>
  );
}