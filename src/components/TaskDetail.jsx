import React, { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { CheckCircle2, ChevronLeft, Minus, Edit3, Check, Plus } from 'lucide-react';
import clsx from 'clsx';
import './TaskDetail.css';

export function TaskDetail({ taskId, onBack }) {
  const task = useLiveQuery(() => db.tasks.get(Number(taskId)), [taskId]);
  const categories = useLiveQuery(() => db.categories.toArray());
  const category = categories?.find(c => c.id === task?.categoryId);

  const [isEditing, setIsEditing] = useState(false);
  const [editItems, setEditItems] = useState([]);
  const [newItemLabel, setNewItemLabel] = useState('');

  const handleStartEdit = () => {
    setEditItems([...task.items]);
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    let finalItems = [...editItems];
    
    // 入力途中の新しい項目があれば追加してから保存
    if (newItemLabel.trim()) {
      finalItems.push({
        id: Date.now(),
        label: newItemLabel.trim(),
        done: false
      });
      setNewItemLabel('');
    }

    const completedCount = finalItems.filter(i => i.done).length;
    await db.tasks.update(task.id, {
      items: finalItems,
      totalItems: finalItems.length,
      completedItems: completedCount,
      isCompleted: finalItems.length > 0 && completedCount === finalItems.length
    });
    setIsEditing(false);
  };

  const handleItemNameChange = (id, newLabel) => {
    setEditItems(prev => prev.map(item => 
      item.id === id ? { ...item, label: newLabel } : item
    ));
  };

  const handleDeleteItem = (id) => {
    if (window.confirm('この項目を削除してもよろしいですか？')) {
      setEditItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleAddNewItem = () => {
    if (!newItemLabel.trim()) return;
    const newItem = {
      id: Date.now(),
      label: newItemLabel.trim(),
      done: false
    };
    setEditItems(prev => [...prev, newItem]);
    setNewItemLabel('');
  };

  const toggleItem = async (itemId) => {
    if (isEditing) return;
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
    if (isEditing) return editItems;
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
                  <button className="delete-btn" onClick={() => handleDeleteItem(item.id)}>
                    <Minus size={16} strokeWidth={4} color="white" />
                  </button>
                  <input 
                    className="item-edit-input"
                    value={item.label}
                    onChange={(e) => handleItemNameChange(item.id, e.target.value)}
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

          {isEditing && (
            <div className="item-row item-row--add">
              <div className="add-icon-placeholder">
                <Plus size={18} className="text-gray-400" />
              </div>
              <input 
                className="item-edit-input item-edit-input--new"
                placeholder="新しい項目を追加..."
                value={newItemLabel}
                onChange={(e) => setNewItemLabel(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddNewItem()}
                onBlur={handleAddNewItem}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}