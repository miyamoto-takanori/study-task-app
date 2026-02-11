import React, { useState } from 'react';
import { db } from '../db';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus, Trash2, Save, X, ChevronDown } from 'lucide-react'; // ChevronDownを追加
import './Settings.css';

const PRESET_COLORS = [
  { name: 'レッド', value: '#ef4444' },
  { name: 'ブルー', value: '#3b82f6' },
  { name: 'グリーン', value: '#10b981' },
  { name: 'アンバー', value: '#f59e0b' },
  { name: 'パープル', value: '#8b5cf6' },
  { name: 'ピンク', value: '#ec4899' },
  { name: 'グレー', value: '#6b7280' },
];

export function Settings() {
  const categories = useLiveQuery(() => db.categories.toArray());
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState(PRESET_COLORS[0].value);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    await db.categories.add({
      name: newCategoryName,
      color: newCategoryColor
    });
    setNewCategoryName('');
  };

  const startEdit = (cat) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditColor(cat.color);
  };

  const handleUpdate = async (id) => {
    await db.categories.update(id, { name: editName, color: editColor });
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    if (confirm('このカテゴリを削除しますか？紐付いているタスクの表示に影響が出る場合があります。')) {
      await db.categories.delete(id);
    }
  };

  return (
    <div className="settings-container">
      <section className="settings-section">
        <h2 className="section-title">カテゴリ管理</h2>
        
        {/* 新規追加フォーム */}
        <form className="category-add-form" onSubmit={handleAdd}>
          <div className="input-group">
            <input 
              type="text" 
              className="settings-input" 
              placeholder="カテゴリ名"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              required
            />
            <div className="color-select-wrapper">
              <div className="color-dot" style={{ backgroundColor: newCategoryColor }} />
              <select 
                className="settings-select"
                value={newCategoryColor}
                onChange={(e) => setNewCategoryColor(e.target.value)}
              >
                {PRESET_COLORS.map(c => <option key={c.value} value={c.value}>{c.name}</option>)}
              </select>
              <ChevronDown size={16} className="select-arrow" />
            </div>
            <button type="submit" className="add-btn-circle"><Plus size={20} /></button>
          </div>
        </form>

        {/* カテゴリ一覧 */}
        <div className="category-list">
          {categories?.map(cat => (
            <div key={cat.id} className="category-item">
              {editingId === cat.id ? (
                <div className="input-group">
                  <input 
                    type="text" 
                    className="settings-input"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                  <div className="color-select-wrapper">
                    <div className="color-dot" style={{ backgroundColor: editColor }} />
                    <select 
                      className="settings-select"
                      value={editColor}
                      onChange={(e) => setEditColor(e.target.value)}
                    >
                      {PRESET_COLORS.map(c => <option key={c.value} value={c.value}>{c.name}</option>)}
                    </select>
                    <ChevronDown size={16} className="select-arrow" />
                  </div>
                  <button onClick={() => handleUpdate(cat.id)} className="icon-btn save"><Save size={18} /></button>
                  <button onClick={() => setEditingId(null)} className="icon-btn cancel"><X size={18} /></button>
                </div>
              ) : (
                <>
                  <div className="category-info">
                    <div className="color-dot" style={{ backgroundColor: cat.color }} />
                    <span className="category-name">{cat.name}</span>
                  </div>
                  <div className="item-actions">
                    <button onClick={() => startEdit(cat)} className="edit-text-btn">編集</button>
                    <button onClick={() => handleDelete(cat.id)} className="delete-icon-btn"><Trash2 size={18} /></button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}