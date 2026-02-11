import React, { useState, useEffect } from 'react';
import { db } from '../db';
import { useLiveQuery } from 'dexie-react-hooks';
import { Trash2, X } from 'lucide-react';
import './EditTaskModal.css';

export function EditTaskModal({ task, onClose }) {
  const categories = useLiveQuery(() => db.categories.toArray());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState({
    categoryId: task.categoryId,
    title: task.title,
    subtitle: task.subtitle,
    deadline: task.deadline,
    priority: task.priority
  });

  // モーダル表示時に背景スクロールを固定
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    const selectedCategory = categories?.find(c => c.id === parseInt(formData.categoryId));
    
    await db.tasks.update(task.id, {
      ...formData,
      categoryId: selectedCategory.id,
      categoryName: selectedCategory.name,
      categoryColor: selectedCategory.color,
      priority: parseInt(formData.priority)
    });
    onClose();
  };

  const handleDelete = async () => {
    await db.tasks.delete(task.id);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>タスクを編集</h3>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        {!showDeleteConfirm ? (
          <form onSubmit={handleUpdate} className="edit-form">
            <div className="form-section">
              <label className="form-label">カテゴリ</label>
              <select 
                className="input-field" required
                value={formData.categoryId}
                onChange={e => setFormData({...formData, categoryId: e.target.value})}
              >
                {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="form-section">
              <label className="form-label">タイトル</label>
              <input className="input-field" type="text" required
                value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
            </div>

            <div className="form-section">
              <label className="form-label">サブタイトル</label>
              <input className="input-field" type="text" required
                value={formData.subtitle} onChange={e => setFormData({...formData, subtitle: e.target.value})} />
            </div>

            <div className="form-section">
              <label className="form-label">優先度</label>
              <div className="priority-selector">
                {[1, 2, 3, 4, 5].map(num => (
                  <button key={num} type="button" 
                    className={`priority-btn ${formData.priority === num ? 'priority-btn--active' : ''}`}
                    onClick={() => setFormData({...formData, priority: num})}>
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-section">
              <label className="form-label">期限</label>
              <input className="input-field" type="date" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} />
            </div>

            <div className="modal-actions">
              <button type="button" className="delete-trigger-btn" onClick={() => setShowDeleteConfirm(true)}>
                <Trash2 size={18} /> 削除
              </button>
              <div className="right-actions">
                <button type="button" className="cancel-btn" onClick={onClose}>キャンセル</button>
                <button type="submit" className="save-btn">保存</button>
              </div>
            </div>
          </form>
        ) : (
          <div className="delete-confirm-view">
            <div className="warning-icon"><Trash2 size={48} /></div>
            <p>このタスクを完全に削除しますか？<br/>この操作は取り消せません。</p>
            <div className="confirm-actions">
              <button className="cancel-btn" onClick={() => setShowDeleteConfirm(false)}>キャンセル</button>
              <button className="delete-exec-btn" onClick={handleDelete}>削除を実行</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}