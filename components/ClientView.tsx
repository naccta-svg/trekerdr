import React, { useState } from 'react';
import { Project } from '../types';
import { FileText, Image, Fan, Upload } from 'lucide-react';

export const ClientView: React.FC<{ project: Project; onUpdate?: (p: Project) => void }> = ({ project, onUpdate }) => {
  
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && onUpdate) {
      const url = URL.createObjectURL(e.target.files[0]);
      onUpdate({ ...project, coverPhotoUrl: url });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Cover Photo */}
      <div className="w-full h-64 md:h-96 bg-gray-100 relative group overflow-hidden">
        {project.coverPhotoUrl ? (
          <img src={project.coverPhotoUrl} alt="Cover" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 flex-col">
            <Image size={48} className="mb-2 opacity-20" />
            <span className="text-sm font-light uppercase tracking-widest">Заглавное фото</span>
          </div>
        )}
        <label className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
          <div className="bg-white/20 backdrop-blur-md p-4 rounded-full">
            <Upload size={24} />
          </div>
          <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
        </label>
      </div>

      <div className="max-w-4xl mx-auto p-8 -mt-20 relative z-10">
        <div className="bg-white p-8 rounded-3xl shadow-xl text-center mb-12">
           <h1 className="text-3xl md:text-4xl font-light text-gray-900 mb-2">{project.name}</h1>
           <div className="h-1 w-20 bg-brand-400 mx-auto rounded-full mb-4"></div>
           <p className="text-gray-400 uppercase tracking-widest text-xs">Статус: {project.stage}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <a href={project.links.visuals || '#'} target="_blank" rel="noreferrer" className="group bg-gray-50 p-8 rounded-2xl flex flex-col items-center text-center transition-all hover:shadow-lg hover:bg-white border border-gray-100">
            <div className="w-16 h-16 bg-brand-100 text-brand-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Image size={32} />
            </div>
            <h2 className="text-lg font-medium mb-2">Визуализации</h2>
            <span className="text-xs text-gray-400 uppercase tracking-wider group-hover:text-brand-500">
              {project.links.visuals ? 'Смотреть' : 'Недоступно'}
            </span>
          </a>

          <a href={project.links.pdf || '#'} target="_blank" rel="noreferrer" className="group bg-gray-50 p-8 rounded-2xl flex flex-col items-center text-center transition-all hover:shadow-lg hover:bg-white border border-gray-100">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <FileText size={32} />
            </div>
            <h2 className="text-lg font-medium mb-2">PDF Проекта</h2>
            <span className="text-xs text-gray-400 uppercase tracking-wider group-hover:text-red-500">
              {project.links.pdf ? 'Скачать' : 'Недоступно'}
            </span>
          </a>

          <a href={project.links.hvac || '#'} target="_blank" rel="noreferrer" className="group bg-gray-50 p-8 rounded-2xl flex flex-col items-center text-center transition-all hover:shadow-lg hover:bg-white border border-gray-100">
            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Fan size={32} />
            </div>
            <h2 className="text-lg font-medium mb-2">Проект ОВиК</h2>
            <span className="text-xs text-gray-400 uppercase tracking-wider group-hover:text-blue-500">
               {project.links.hvac ? 'Смотреть' : 'Недоступно'}
            </span>
          </a>
        </div>
      </div>
    </div>
  );
};