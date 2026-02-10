import React from 'react';
import clsx from 'clsx';
import './TaskCard.css';

export function TaskCard({ task }) {
  const progress = Math.round((task.completedItems / task.totalItems) * 100);
  
  return (
    <div className={clsx(
      "task-card",
      task.isCompleted ? "task-card--completed" : "task-card--active"
    )}>
      {task.isCompleted && (
        <div className="stamp-container">
          <span className="stamp-text">済</span>
        </div>
      )}
      <div className="card-header">
        <span className="category-tag">{task.category}</span>
        <span className="deadline-text">{task.deadline}</span>
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
            className={clsx("progress-bar-fill", progress === 100 ? "bg-green-500" : "bg-blue-600")} 
            style={{ width: `${progress}%` }} 
          />
        </div>
      </div>
    </div>
  );
}