import React, { useState } from 'react';
import { db } from '../db';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, ListChecks } from 'lucide-react';

export function AddTask() {
  const navigate = useNavigate();
  const categories = useLiveQuery(() => db.categories.toArray());
  
  const [formData, setFormData] = useState({
    categoryId: '',
    title: '',
    subtitle: '',
    deadline: new Date().toISOString().split('T')[0],
    priority: 3,
    itemPrefix: '第',
    itemSuffix: '回',
    startNum: 1,
    endNum: 10
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const count = formData.endNum - formData.startNum + 1;
    const items = Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      label: `${formData.itemPrefix}${formData.startNum + i}${formData.itemSuffix}`,
      done: false
    }));

    await db.tasks.add({
      categoryId: parseInt(formData.categoryId),
      title: formData.title,
      subtitle: formData.subtitle,
      deadline: formData.deadline,
      priority: parseInt(formData.priority),
      totalItems: items.length,
      completedItems: 0,
      items: items,
      isCompleted: false
    });
    navigate('/');
  };

  return (
    <div className="page-container">
      <h2 className="header-title" style={{ marginBottom: '1.5rem' }}>タスク作成</h2>
      <form onSubmit={handleSubmit} className="space-y-4" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        <div className="form-group">
          <label className="header-badge">カテゴリ</label>
          <select 
            required
            className="w-full p-3 rounded-xl border"
            value={formData.categoryId}
            onChange={e => setFormData({...formData, categoryId: e.target.value})}
          >
            <option value="">選択してください</option>
            {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label className="header-badge">タイトル</label>
          <input type="text" required className="w-full p-3 rounded-xl border" placeholder="例: 入門コンピュータ科学"
            value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
        </div>

        <div className="form-group">
          <label className="header-badge">サブタイトル</label>
          <input type="text" className="w-full p-3 rounded-xl border" placeholder="例: 第1章 練習問題"
            value={formData.subtitle} onChange={e => setFormData({...formData, subtitle: e.target.value})} />
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <label className="header-badge">期限</label>
            <input type="date" className="w-full p-3 rounded-xl border"
              value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} />
          </div>
          <div style={{ flex: 1 }}>
            <label className="header-badge">優先度 (1-5)</label>
            <input type="number" min="1" max="5" className="w-full p-3 rounded-xl border"
              value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-gray-100 space-y-3">
          <label className="header-badge" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ListChecks size={14} /> アイテム一括生成
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input type="text" className="p-2 rounded-lg border w-16" placeholder="第"
              value={formData.itemPrefix} onChange={e => setFormData({...formData, itemPrefix: e.target.value})} />
            <span>[数値]</span>
            <input type="text" className="p-2 rounded-lg border w-16" placeholder="回"
              value={formData.itemSuffix} onChange={e => setFormData({...formData, itemSuffix: e.target.value})} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
            <input type="number" className="p-2 rounded-lg border w-20" value={formData.startNum}
              onChange={e => setFormData({...formData, startNum: parseInt(e.target.value)})} />
            <span>〜</span>
            <input type="number" className="p-2 rounded-lg border w-20" value={formData.endNum}
              onChange={e => setFormData({...formData, endNum: parseInt(e.target.value)})} />
            <span className="text-xs font-bold text-gray-500">
              計 {formData.endNum - formData.startNum + 1}個
            </span>
          </div>
        </div>

        <button type="submit" className="w-full p-4 bg-blue-500 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 active:scale-95 transition-transform">
          タスクを登録する
        </button>
      </form>
    </div>
  );
}