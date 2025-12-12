import React, { useState } from 'react';
import { User, UserRole, Project, ROLE_TRANSLATIONS, STAGE_COLORS, ProjectStage } from '../types';
import { UserPlus, Upload, Trash2, Link as LinkIcon, Copy, FileText, ArrowUpDown, X } from 'lucide-react';

// --- Architect List Page ---
interface ArchitectListProps {
  users: User[];
  onUpdateUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
}

export const ArchitectList: React.FC<ArchitectListProps> = ({ users, onUpdateUser, onDeleteUser }) => {
  const architects = users.filter(u => u.role === UserRole.ARCHITECT);

  const handlePhotoUpload = (userId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      const user = users.find(u => u.id === userId);
      if (user) onUpdateUser({ ...user, photoUrl: url });
    }
  };

  const handleFieldChange = (userId: string, field: keyof User, value: string) => {
      const user = users.find(u => u.id === userId);
      if (user) onUpdateUser({ ...user, [field]: value });
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      {architects.map(arch => (
        <div key={arch.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 items-start relative group">
          
          <button 
             onClick={() => onDeleteUser(arch.id)}
             className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 transition-colors"
             title="Удалить"
          >
             <Trash2 size={20} />
          </button>

          {/* Photo */}
          <div className="flex-shrink-0">
             <div className="relative w-32 h-32 md:w-40 md:h-40">
                {arch.photoUrl ? (
                <img src={arch.photoUrl} alt={arch.username} className="w-full h-full rounded-2xl object-cover shadow-md" />
                ) : (
                <div className="w-full h-full rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400">
                    <UserPlus size={40} />
                </div>
                )}
                <label className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                <Upload size={24} />
                <input type="file" accept="image/jpeg" className="hidden" onChange={(e) => handlePhotoUpload(arch.id, e)} />
                </label>
             </div>
          </div>
          
          {/* Fields */}
          <div className="flex-grow space-y-4 w-full">
             <div className="flex flex-col md:flex-row gap-4">
                 <div className="flex-1">
                     <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">ФИО</label>
                     <input 
                        type="text" 
                        value={arch.fullName || ''} 
                        onChange={e => handleFieldChange(arch.id, 'fullName', e.target.value)}
                        className="w-full p-2 border border-gray-200 rounded-lg text-sm font-semibold"
                     />
                 </div>
                 <div className="w-full md:w-48">
                      <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Дата Рождения</label>
                      <input 
                        type="date" 
                        value={arch.dob || ''} 
                        onChange={e => handleFieldChange(arch.id, 'dob', e.target.value)}
                        className="w-full p-2 border border-gray-200 rounded-lg text-sm"
                     />
                 </div>
                 <div className="w-full md:w-48">
                      <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Роль</label>
                      <select 
                        value={arch.role} 
                        onChange={e => handleFieldChange(arch.id, 'role', e.target.value as UserRole)}
                        className="w-full p-2 border border-gray-200 rounded-lg text-sm"
                     >
                         {Object.values(UserRole).map(r => <option key={r} value={r}>{ROLE_TRANSLATIONS[r]}</option>)}
                     </select>
                 </div>
             </div>

             <div>
                 <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Биография</label>
                 <textarea 
                    className="w-full p-2 border border-gray-200 rounded-lg text-sm h-20 resize-none" 
                    placeholder="Биография..."
                    value={arch.bio || ''}
                    onChange={(e) => handleFieldChange(arch.id, 'bio', e.target.value)}
                 />
             </div>

             <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                 <label className="block text-[10px] uppercase font-bold text-yellow-600 mb-2">Реквизиты для оплаты (Банк, Счет, Имя)</label>
                 <textarea 
                    className="w-full p-2 border border-yellow-200 bg-white rounded-lg text-sm h-20 font-mono" 
                    placeholder="Наименование банка, БИК, Корр.счет, Расч.счет..."
                    value={arch.paymentDetails || ''}
                    onChange={(e) => handleFieldChange(arch.id, 'paymentDetails', e.target.value)}
                 />
             </div>

             <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                 <label className="block text-[10px] uppercase font-bold text-yellow-600 mb-2">Стоимость м2</label>
                 <input
                    type="text"
                    className="w-full p-2 border border-yellow-200 bg-white rounded-lg text-sm" 
                    placeholder="2000 р/м2..."
                    value={arch.costPerM2 || ''}
                    onChange={(e) => handleFieldChange(arch.id, 'costPerM2', e.target.value)}
                 />
             </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// --- Designer List Page ---
interface DesignerListProps {
  users: User[];
  onUpdateUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
}

export const DesignerList: React.FC<DesignerListProps> = ({ users, onUpdateUser, onDeleteUser }) => {
  const designers = users.filter(u => u.role === UserRole.DESIGNER);

  const copyLink = (id: string) => {
      const link = `${window.location.origin}?login_token=${id}`;
      navigator.clipboard.writeText(link);
      alert('Ссылка скопирована: ' + link);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {designers.map(des => (
        <div key={des.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative group">
           <button 
             onClick={() => onDeleteUser(des.id)}
             className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 transition-colors"
             title="Удалить"
          >
             <Trash2 size={18} />
          </button>

          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 overflow-hidden">
                {des.photoUrl ? <img src={des.photoUrl} className="w-full h-full object-cover" /> : "Лого"}
            </div>
            <div>
                <h3 className="font-semibold">{des.fullName || des.username}</h3>
                <select 
                    value={des.role} 
                    onChange={e => {
                        const updated = { ...des, role: e.target.value as UserRole };
                        onUpdateUser(updated);
                    }}
                    className="text-xs border border-gray-200 rounded mt-1 p-1 font-bold text-gray-500"
                >
                    {Object.values(UserRole).map(r => <option key={r} value={r}>{ROLE_TRANSLATIONS[r]}</option>)}
                </select>
            </div>
          </div>

          <button 
            onClick={() => copyLink(des.id)}
            className="w-full py-2 bg-gray-50 text-gray-600 rounded-lg text-sm hover:bg-brand-50 hover:text-brand-600 transition-colors flex items-center justify-center gap-2"
          >
              <LinkIcon size={14} /> Скопировать ссылку
          </button>
        </div>
      ))}
    </div>
  );
};

// --- Client Links Page ---
export const ProjectLinksList: React.FC<{ projects: Project[] }> = ({ projects }) => {
  const handleCopy = (id: string) => {
    const link = `${window.location.origin}?project=${id}`;
    navigator.clipboard.writeText(link);
    alert('Ссылка скопирована!');
  }

  return (
     <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
       <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 font-medium uppercase text-xs">
            <tr>
              <th className="p-4">Проект</th>
              <th className="p-4">Ссылка для заказчика</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
             {projects.map(p => (
               <tr key={p.id}>
                 <td className="p-4 font-medium">{p.name}</td>
                 <td className="p-4 text-brand-500 break-all flex items-center gap-2">
                   <a href={`?project=${p.id}`} target="_blank" rel="noreferrer" className="hover:underline">
                     {window.location.origin}?project={p.id}
                   </a>
                   <button onClick={() => handleCopy(p.id)} className="text-gray-400 hover:text-brand-600">
                     <Copy size={16} />
                   </button>
                 </td>
               </tr>
             ))}
          </tbody>
       </table>
     </div>
  );
};

// --- All Projects List Page (Admin) ---
interface AllProjectsListProps {
  projects: Project[];
  users: User[];
  onUpdateProject: (project: Project) => void;
  onProjectClick: (project: Project) => void;
}

export const AllProjectsList: React.FC<AllProjectsListProps> = ({ projects, users, onUpdateProject, onProjectClick }) => {
  const [sortAsc, setSortAsc] = useState(true);
  const [torProject, setTorProject] = useState<Project | null>(null);

  // Sorting
  const sortedProjects = [...projects].sort((a, b) => {
    if (a.stage === b.stage) return 0;
    const comparison = a.stage.localeCompare(b.stage);
    return sortAsc ? comparison : -comparison;
  });

  const handleNoteChange = (project: Project, newNote: string) => {
    onUpdateProject({ ...project, notes: newNote });
  };

  const handleTorSave = (newTor: string) => {
    if (torProject) {
        onUpdateProject({ ...torProject, technicalTask: newTor });
        setTorProject(null); // Close modal
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-4 w-12 text-center">#</th>
                <th className="p-4">Название</th>
                <th className="p-4">Архитектор</th>
                <th className="p-4">Дизайнер</th>
                <th className="p-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => setSortAsc(!sortAsc)}>
                  <div className="flex items-center gap-1">
                    Стадия <ArrowUpDown size={12} />
                  </div>
                </th>
                <th className="p-4">Даты</th>
                <th className="p-4 text-center">ТЗ</th>
                <th className="p-4 w-64">Примечание</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedProjects.map((p, idx) => {
                const arch = users.find(u => u.id === p.architectId)?.fullName || '—';
                const des = users.find(u => u.id === p.designerId)?.fullName || '—';
                const hasTor = !!p.technicalTask && p.technicalTask.trim().length > 0;
                
                return (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="p-4 text-center text-gray-400">{idx + 1}</td>
                    <td 
                      className="p-4 font-bold text-gray-800 cursor-pointer hover:text-brand-600 hover:underline transition-colors"
                      onClick={() => onProjectClick(p)}
                      title="Открыть карточку проекта"
                    >
                      {p.name}
                    </td>
                    <td className="p-4 text-gray-600">{arch}</td>
                    <td className="p-4 text-gray-600">{des}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-md text-[10px] uppercase font-bold border ${STAGE_COLORS[p.stage]}`}>
                        {p.stage}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-gray-500">
                      <div><span className="text-gray-400">Начало:</span> {p.startDate}</div>
                      <div><span className="text-gray-400">Конец:</span> {p.endDate}</div>
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => setTorProject(p)}
                        className={`p-2 rounded-lg transition-all ${hasTor ? 'bg-gray-100 text-gray-600 hover:bg-brand-50 hover:text-brand-600' : 'bg-red-50 text-red-500 hover:bg-red-100 animate-pulse'}`}
                        title={hasTor ? "Редактировать ТЗ" : "ТЗ не заполнено"}
                      >
                        <FileText size={18} />
                      </button>
                    </td>
                    <td className="p-4">
                      <input 
                        type="text" 
                        value={p.notes || ''}
                        onChange={(e) => handleNoteChange(p, e.target.value)}
                        placeholder="Добавить заметку..."
                        className="w-full bg-transparent border-b border-transparent focus:border-brand-300 focus:outline-none py-1 text-gray-600 placeholder-gray-300 transition-colors"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {sortedProjects.length === 0 && (
            <div className="p-8 text-center text-gray-400">Список проектов пуст.</div>
        )}
      </div>

      {/* Mini TOR Modal */}
      {torProject && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm" onClick={() => setTorProject(null)}>
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">Техническое задание</h3>
                        <p className="text-xs text-gray-400">{torProject.name}</p>
                    </div>
                    <button onClick={() => setTorProject(null)}><X size={24} className="text-gray-400 hover:text-gray-600" /></button>
                </div>
                
                <textarea
                    className="w-full h-64 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none resize-none"
                    placeholder="Введите текст технического задания..."
                    defaultValue={torProject.technicalTask || ''}
                    id="tor-textarea"
                />
                
                <div className="flex justify-end mt-4 gap-2">
                    <button onClick={() => setTorProject(null)} className="px-4 py-2 text-gray-500 hover:bg-gray-50 rounded-lg">
                        Отмена
                    </button>
                    <button 
                        onClick={() => {
                            const val = (document.getElementById('tor-textarea') as HTMLTextAreaElement).value;
                            handleTorSave(val);
                        }} 
                        className="px-6 py-2 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700"
                    >
                        Сохранить
                    </button>
                </div>
            </div>
        </div>
      )}
    </>
  );
};