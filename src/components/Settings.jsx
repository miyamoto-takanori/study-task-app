import React, { useState } from 'react';
import { db } from '../db';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus, Trash2, Save, X, ChevronDown, Palette, Type } from 'lucide-react';
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
    if (confirm('このカテゴリを削除しますか？')) {
      await db.categories.delete(id);
    }
  };

  return (
    <div className="settings-container">
      <section className="settings-section">
        <h2 className="section-title">カテゴリ管理</h2>
        
        {/* 新規追加フォーム: 縦並び構成 */}
        <form className="category-add-card" onSubmit={handleAdd}>
          <div className="vertical-form">
            <div className="form-field">
              <label className="field-label"><Type size={14} /> カテゴリ名</label>
              <input 
                type="text" 
                className="settings-input-large" 
                placeholder="例: 物理、世界史など"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                required
              />
            </div>
            <div className="form-field">
              <label className="field-label"><Palette size={14} /> 表示カラー</label>
              <div className="color-select-wrapper-large">
                <div className="color-dot-large" style={{ backgroundColor: newCategoryColor }} />
                <select 
                  className="settings-select-large"
                  value={newCategoryColor}
                  onChange={(e) => setNewCategoryColor(e.target.value)}
                >
                  {PRESET_COLORS.map(c => <option key={c.value} value={c.value}>{c.name}</option>)}
                </select>
                <ChevronDown size={20} className="select-arrow-large" />
              </div>
            </div>
            <button type="submit" className="add-submit-btn">
              <Plus size={20} /> カテゴリを追加
            </button>
          </div>
        </form>

        <div className="category-list">
          {categories?.map(cat => (
            <div key={cat.id} className={`category-item-wrapper ${editingId === cat.id ? 'is-editing' : ''}`}>
              {editingId === cat.id ? (
                <div className="edit-panel">
                  <div className="vertical-form">
                    <input 
                      type="text" 
                      className="settings-input-large"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                    <div className="color-select-wrapper-large">
                      <div className="color-dot-large" style={{ backgroundColor: editColor }} />
                      <select 
                        className="settings-select-large"
                        value={editColor}
                        onChange={(e) => setEditColor(e.target.value)}
                      >
                        {PRESET_COLORS.map(c => <option key={c.value} value={c.value}>{c.name}</option>)}
                      </select>
                      <ChevronDown size={20} className="select-arrow-large" />
                    </div>
                    <div className="edit-actions-row">
                      <button onClick={() => setEditingId(null)} className="edit-cancel-btn">
                        キャンセル
                      </button>
                      <button onClick={() => handleUpdate(cat.id)} className="edit-save-btn">
                        <Save size={18} /> 保存
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="category-row">
                  <div className="category-main-info">
                    <div className="color-dot-fixed" style={{ backgroundColor: cat.color }} />
                    <span className="category-name-text">{cat.name}</span>
                  </div>
                  <div className="category-row-btns">
                    <button onClick={() => startEdit(cat)} className="row-edit-btn">編集</button>
                    <button onClick={() => handleDelete(cat.id)} className="row-delete-btn"><Trash2 size={18} /></button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}