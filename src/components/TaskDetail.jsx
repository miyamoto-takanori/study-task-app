import React, { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { CheckCircle2, ChevronLeft, Minus, Edit3, Check } from 'lucide-react';
import clsx from 'clsx';
import './TaskDetail.css';

export function TaskDetail({ taskId, onBack }) {
  const task = useLiveQuery(() => db.tasks.get(Number(taskId)), [taskId]);
  const categories = useLiveQuery(() => db.categories.toArray());
  const category = categories?.find(c => c.id === task?.categoryId);

  // 編集モードの状態管理
  const [isEditing, setIsEditing] = useState(false);
  const [editItems, setEditItems] = useState([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // 編集開始時の初期化
  const handleStartEdit = () => {
    setEditItems([...task.items]);
    setIsEditing(true);
  };

  // 編集内容の保存
  const handleSaveEdit = async () => {
    const completedCount = editItems.filter(i => i.done).length;
    await db.tasks.update(task.id, {
      items: editItems,
      totalItems: editItems.length,
      completedItems: completedCount,
      isCompleted: editItems.length > 0 && completedCount === editItems.length
    });
    setIsEditing(false);
    setDeleteConfirmId(null);
  };

  // アイテム名の変更反映
  const handleItemNameChange = (id, newLabel) => {
    setEditItems(prev => prev.map(item => 
      item.id === id ? { ...item, label: newLabel } : item
    ));
  };

  // アイテム削除
  const handleDeleteItem = (id) => {
    if (deleteConfirmId === id) {
      setEditItems(prev => prev.filter(item => item.id !== id));
      setDeleteConfirmId(null);
    } else {
      setDeleteConfirmId(id);
    }
  };

  // 通常モードのチェック操作
  const toggleItem = async (itemId) => {
    if (isEditing) return; // 編集モード中はチェック不可
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

  const sortedItems = useMemo(() => {
    if (isEditing) return editItems; // 編集モード時はソートせず、今のリストを表示
    if (!task?.items) return [];
    return [...task.items].sort((a, b) => {
      if (a.done === b.done) return a.id - b.id;
      return a.done ? 1 : -1;
    });
  }, [task, isEditing, editItems]);

  if (!task) return <div className="loading-state">読み込み中...</div>;

  const progress = Math.round((task.completedItems / task.totalItems) * 100);
  const themeColor = category?.color || '#3b82f6';

  return (
    <div className="detail-page" style={{ '--theme-color': themeColor }}>
      <div className="detail-header-fixed">
        <button onClick={onBack} className="back-button">
          <ChevronLeft size={28} strokeWidth={2.5} />
        </button>
        <div className="header-text-group">
          <p className="header-category-name">{category?.name}</p>
          <h2 className="detail-title">{task.title}</h2>
        </div>
        
        {/* 右端の編集/完了ボタン */}
        <button 
          className={clsx("edit-toggle-btn", isEditing && "edit-toggle-btn--active")}
          onClick={isEditing ? handleSaveEdit : handleStartEdit}
        >
          {isEditing ? <><Check size={18} />完了</> : <><Edit3 size={18} />編集</>}
        </button>
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
            <div key={item.id} className={clsx("item-row", isEditing && "item-row--editing")}>
              {isEditing ? (
                <>
                  <button 
                    className={clsx("delete-btn", deleteConfirmId === item.id && "delete-btn--confirm")}
                    onClick={() => handleDeleteItem(item.id)}
                  >
                    <Minus size={16} strokeWidth={3} className="text-white" />
                  </button>
                  <input 
                    className="item-edit-input"
                    value={item.label}
                    onChange={(e) => handleItemNameChange(item.id, e.target.value)}
                    autoFocus={deleteConfirmId === null}
                  />
                </>
              ) : (
                <div className="item-click-area" onClick={() => toggleItem(item.id)}>
                  <div className={clsx("check-box", item.done && "check-box--active")}>
                    {item.done && <CheckCircle2 size={18} className="text-white" />}
                  </div>
                  <span className={clsx("item-text", item.done && "item-text--done")}>
                    {item.label}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}