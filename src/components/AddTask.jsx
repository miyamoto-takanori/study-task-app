import React, { useState } from 'react';
import { db } from '../db';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import './AddTask.css';

export function AddTask() {
  const navigate = useNavigate();
  const categories = useLiveQuery(() => db.categories.toArray());
  
  const [mode, setMode] = useState('auto'); // 'auto' or 'manual'
  const [formData, setFormData] = useState({
    categoryId: '',
    title: '',
    subtitle: '',
    deadline: new Date().toISOString().split('T')[0],
    priority: 3,
    // 一括生成用
    itemPrefix: '第',
    itemSuffix: '回',
    startNum: 1,
    endNum: 10,
    // 手動登録用
    manualItems: ['']
  });

  const handleAddManualItem = () => {
    setFormData({ ...formData, manualItems: [...formData.manualItems, ''] });
  };

  const handleManualItemChange = (index, value) => {
    const newItems = [...formData.manualItems];
    newItems[index] = value;
    setFormData({ ...formData, manualItems: newItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let finalItems = [];

    if (mode === 'auto') {
      const count = formData.endNum - formData.startNum + 1;
      finalItems = Array.from({ length: count }, (_, i) => ({
        id: i + 1,
        label: `${formData.itemPrefix}${formData.startNum + i}${formData.itemSuffix}`,
        done: false
      }));
    } else {
      finalItems = formData.manualItems
        .filter(label => label.trim() !== '')
        .map((label, i) => ({ id: i + 1, label, done: false }));
    }

    if (!formData.categoryId) return alert("カテゴリを選択してください");

    const selectedCategory = categories.find(c => c.id === parseInt(formData.categoryId));

    await db.tasks.add({
      categoryId: selectedCategory.id,
      categoryName: selectedCategory.name, // 名前も持たせておくと表示が楽です
      categoryColor: selectedCategory.color, // カラーもカテゴリから引用
      title: formData.title,
      subtitle: formData.subtitle,
      deadline: formData.deadline,
      priority: formData.priority,
      totalItems: finalItems.length,
      completedItems: 0,
      items: finalItems,
      isCompleted: false
    });
    navigate('/');
  };

  return (
    <div className="page-container">
      <form onSubmit={handleSubmit} className="add-task-container">
        <h2 className="header-title">タスク作成</h2>

        <div className="form-section">
          <label className="form-label">カテゴリ</label>
          <select 
            className="input-field" required
            value={formData.categoryId}
            onChange={e => setFormData({...formData, categoryId: e.target.value})}
          >
            <option value="">選択してください</option>
            {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className="form-section">
          <label className="form-label">タイトル</label>
          <input className="input-field" type="text" required placeholder="例: 数学演習"
            value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
        </div>

        <div className="form-section">
          <label className="form-label">サブタイトル</label>
          <input className="input-field" type="text" placeholder="例: 微分積分"
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

        <div className="item-generator-box">
          <div className="mode-switcher">
            <button type="button" className={`mode-btn ${mode === 'auto' ? 'mode-btn--active' : ''}`} onClick={() => setMode('auto')}>一括生成</button>
            <button type="button" className={`mode-btn ${mode === 'manual' ? 'mode-btn--active' : ''}`} onClick={() => setMode('manual')}>手動追加</button>
          </div>

          {mode === 'auto' ? (
            <div className="generator-container">
              <div className="generator-grid">
                <input className="input-field" style={{textAlign: 'center'}} value={formData.itemPrefix} onChange={e => setFormData({...formData, itemPrefix: e.target.value})} />
                <div className="number-badge">数</div>
                <input className="input-field" style={{textAlign: 'center'}} value={formData.itemSuffix} onChange={e => setFormData({...formData, itemSuffix: e.target.value})} />
              </div>
              <div className="generator-grid">
                <input className="input-field" type="number" style={{textAlign: 'center'}} value={formData.startNum} onChange={e => setFormData({...formData, startNum: parseInt(e.target.value)})} />
                <span className="wave-separator">~</span>
                <input className="input-field" type="number" style={{textAlign: 'center'}} value={formData.endNum} onChange={e => setFormData({...formData, endNum: parseInt(e.target.value)})} />
              </div>
            </div>
            ) : (
            <div className="space-y-2">
              {formData.manualItems.map((item, idx) => (
                <input key={idx} className="input-field" style={{ padding: '0.75rem', fontSize: '1rem' }} placeholder={`アイテム ${idx + 1}`}
                  value={item} onChange={e => handleManualItemChange(idx, e.target.value)} />
              ))}
              <button type="button" onClick={handleAddManualItem} className="form-label" style={{ background: 'none', border: 'none', cursor: 'pointer', marginTop: '0.5rem' }}>+ 項目を追加</button>
            </div>
          )}
        </div>

        <div className="form-section">
          <label className="form-label">期限</label>
          <input className="input-field" type="date" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} />
        </div>

        <button type="submit" className="submit-btn">
          タスクを登録する
        </button>
      </form>
    </div>
  );
}