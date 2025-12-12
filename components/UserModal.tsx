import React, { useState } from 'react';
import { User, UserRole, ROLE_TRANSLATIONS } from '../types';
import { X } from 'lucide-react';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: Omit<User, 'id'>) => void;
}

export const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: UserRole.CLIENT,
    fullName: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
    setFormData({ username: '', password: '', role: UserRole.CLIENT, fullName: '' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
         <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-light text-gray-800">Добавить пользователя</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
           <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">ФИО / Имя</label>
            <input
              type="text"
              required
              placeholder="Иван Иванов"
              value={formData.fullName}
              onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-200 focus:outline-none"
            />
          </div>
           <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Логин</label>
            <input
              type="text"
              required
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-200 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Пароль</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-200 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Роль</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as UserRole }))}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-200 focus:outline-none"
            >
              {Object.values(UserRole).map(role => (
                <option key={role} value={role}>{ROLE_TRANSLATIONS[role]}</option>
              ))}
            </select>
          </div>
          
           <button
            type="submit"
            className="w-full py-3 mt-4 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors shadow-md font-medium"
          >
            Создать пользователя
          </button>
        </form>
      </div>
    </div>
  );
};