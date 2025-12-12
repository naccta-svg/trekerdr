import React, { useState } from 'react';

interface LoginProps {
  onLogin: (username: string, password: string) => void;
  error?: string;
}

export const Login: React.FC<LoginProps> = ({ onLogin, error }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-800 font-sans">
      <div className="w-full max-w-md p-10 bg-white shadow-2xl rounded-3xl">
        
        <div className="flex flex-col items-center mb-10">
          <h1 className="text-2xl font-bold tracking-widest uppercase mb-2 text-center">DesignRVT</h1>
          <p className="text-xs font-medium text-gray-400 tracking-widest text-center uppercase">
            ДОБРО ПОЖАЛОВАТЬ<br/>в трекер проектов
          </p>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-500 text-sm rounded-xl text-center border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-wider mb-2">Логин</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
              placeholder="введите ваш логин"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-wider mb-2">Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
              placeholder="введите ваш пароль"
            />
          </div>
          <button
            type="submit"
            className="w-full py-4 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-all transform hover:scale-[1.02] shadow-xl shadow-brand-200 tracking-wider uppercase text-sm mt-4"
          >
            Войти
          </button>
        </form>
      </div>
    </div>
  );
};