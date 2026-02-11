import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import './Stats.css';

export function Stats() {
  const categories = useLiveQuery(() => db.categories.toArray());
  const tasks = useLiveQuery(() => db.tasks.toArray());

  // カテゴリごとの統計データを算出
  const statsData = categories?.map(cat => {
    const catTasks = tasks?.filter(t => t.categoryId === cat.id) || [];
    const totalItems = catTasks.reduce((sum, t) => sum + t.totalItems, 0);
    const completedItems = catTasks.reduce((sum, t) => sum + t.completedItems, 0);
    const completedTasks = catTasks.filter(t => t.isCompleted).length;
    
    const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    
    return {
      ...cat,
      progress,
      totalTasks: catTasks.length,
      completedTasks,
      remainingItems: totalItems - completedItems
    };
  });

  if (!statsData) return null;

  return (
    <div className="page-container stats-container">
      <div className="stats-grid">
        {statsData.map(stat => (
          <div key={stat.id} className="stats-card">
            <div className="stats-card-header">
              <span className="stats-cat-name" style={{ color: stat.color }}>{stat.name}</span>
            </div>
            
            <div className="chart-container">
              {/* SVGによるドーナツグラフ */}
              <svg viewBox="0 0 36 36" className="circular-chart">
                <path className="circle-bg"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path className="circle"
                  strokeDasharray={`${stat.progress}, 100`}
                  style={{ stroke: stat.color }}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <text x="18" y="20.35" className="percentage" style={{ fill: stat.color }}>{stat.progress}%</text>
              </svg>
            </div>

            <div className="stats-info">
              <div className="info-row">
                <span className="info-label">タスク完了</span>
                <span className="info-value">{stat.completedTasks} / {stat.totalTasks}</span>
              </div>
              <div className="info-row">
                <span className="info-label">残り項目</span>
                <span className="info-value">{stat.remainingItems}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="settings-bottom-spacer" />
    </div>
  );
}