import React, { useState, useEffect } from 'react';
import { FolderKanban, Plus, Trash2, Loader2, Tag } from 'lucide-react';
import { categoriesAPI } from '../../api';
import { useToast } from '../../contexts/ToastContext';

interface Category {
  _id: string;
  name: string;
  icon: string;
  createdAt: string;
}

const Categories: React.FC = () => {
  const { addToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('');

  const fetchCategories = async () => {
    try {
      const data = await categoriesAPI.getAll();
      setCategories(data);
    } catch (err: any) {
      addToast('error', 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setAdding(true);
    try {
      const newCat = await categoriesAPI.create(newCatName.trim(), newCatIcon.trim());
      setCategories(prev => [...prev, newCat].sort((a, b) => a.name.localeCompare(b.name)));
      setNewCatName('');
      setNewCatIcon('');
      addToast('success', 'Category added successfully');
    } catch (err: any) {
      addToast('error', err.response?.data?.message || 'Failed to add category');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the category "${name}"? Auctions using this category will be reassigned to "Other".`)) return;
    
    try {
      await categoriesAPI.delete(id);
      setCategories(prev => prev.filter(c => c._id !== id));
      addToast('success', 'Category deleted successfully');
    } catch (err: any) {
      addToast('error', 'Failed to delete category');
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex sm:flex-row flex-col sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Categories</h1>
          <p className="text-sm text-slate-500">Edit or define new auction categories used across the platform.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* ADD CATEGORY FORM */}
        <div className="md:col-span-1 h-fit bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Plus size={18} className="text-primary" /> Add New Category
          </h3>
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category Name</label>
              <input
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="e.g. Digital Assets"
                className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category Icon (Emoji)</label>
              <input
                type="text"
                value={newCatIcon}
                onChange={(e) => setNewCatIcon(e.target.value)}
                placeholder="e.g. 📱, 🚗, 🎨"
                className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={adding || !newCatName.trim()}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors disabled:opacity-70"
            >
              {adding ? <Loader2 size={16} className="animate-spin" /> : <FolderKanban size={16} />}
              {adding ? 'Adding...' : 'Create Category'}
            </button>
          </form>
        </div>

        {/* CATEGORY LIST */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 px-6 py-4 bg-slate-50 flex items-center justify-between">
            <h3 className="font-bold text-slate-800">Active Categories ({categories.length})</h3>
          </div>
          
          {loading ? (
            <div className="p-12 flex justify-center text-primary">
              <Loader2 size={32} className="animate-spin" />
            </div>
          ) : categories.length === 0 ? (
             <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                <FolderKanban size={48} className="text-slate-300 mb-4" />
                <p>No categories found.</p>
                <p className="text-sm">Create one from the panel to start.</p>
             </div>
          ) : (
            <ul className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
              {categories.map((cat) => (
                <li key={cat._id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 text-primary flex items-center justify-center text-lg">
                      {cat.icon ? <span>{cat.icon}</span> : <Tag size={18} />}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800">{cat.name}</h4>
                      <p className="text-xs text-slate-400">ID: {cat._id}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleDelete(cat._id, cat.name)}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="Delete Category"
                  >
                    <Trash2 size={18} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </div>
  );
};

export default Categories;
