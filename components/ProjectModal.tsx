import React, { useState, useEffect } from 'react';
import { Project, ProjectStage, STAGE_COLORS, UserRole, User } from '../types';
import { X, Receipt, Info, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Trash2, FileText, ExternalLink } from 'lucide-react';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Project) => void;
  onDelete?: (projectId: string) => void;
  initialProject?: Project | null;
  currentUserRole: UserRole;
  users: User[];
}

const emptyProject: Project = {
  id: '',
  name: '',
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  stage: ProjectStage.QUEUE,
  architectId: '',
  designerId: '',
  dates: {
    mounting: '',
    electric: '',
    edit1: '',
    edit2: '',
    edit3: ''
  },
  links: {
    source: '',
    visuals: '',
    tor: '',
    pdf: '',
    dwg: '',
    hvac: ''
  },
  financials: {
    area: 0,
    costPerMeterStudio: 0,
    costPerMeterArch: 0,
    prepaymentDate: '',
    paymentDate: ''
  },
  technicalTask: ''
};

export const ProjectModal: React.FC<ProjectModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  onDelete,
  initialProject,
  currentUserRole,
  users
}) => {
  const [formData, setFormData] = useState<Project>(emptyProject);
  const [showArchInfo, setShowArchInfo] = useState(false);
  const [showFinancials, setShowFinancials] = useState(false);
  const [showTorModal, setShowTorModal] = useState(false);
  
  // Calendar View State
  const [calDate, setCalDate] = useState(new Date());

  useEffect(() => {
    if (isOpen) {
      if (initialProject) {
        setFormData(initialProject);
        if (initialProject.startDate) {
          setCalDate(new Date(initialProject.startDate));
        }
      } else {
        setFormData({ ...emptyProject, id: Math.random().toString(36).substr(2, 9) });
        setCalDate(new Date());
      }
      setShowArchInfo(false);
      setShowFinancials(false);
      setShowTorModal(false);
    }
  }, [isOpen, initialProject]);

  if (!isOpen) return null;

  const isAdmin = currentUserRole === UserRole.ADMIN;
  const isArchitect = currentUserRole === UserRole.ARCHITECT;
  const isDesigner = currentUserRole === UserRole.DESIGNER;

  // Permissions
  const canEditDatesAndStage = isAdmin || isArchitect;
  const canEditLinks = isAdmin || isArchitect || isDesigner; 
  const canEditUsers = isAdmin;

  const architects = users.filter(u => u.role === UserRole.ARCHITECT);
  const designers = users.filter(u => u.role === UserRole.DESIGNER);
  const currentArchitect = users.find(u => u.id === formData.architectId);

  const clientLink = `${window.location.origin}?project=${formData.id}`;

  const handleChange = (field: keyof Project, value: any) => {
    if (!isAdmin && field !== 'links' && field !== 'technicalTask' && !isArchitect) return; 
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (dateField: keyof typeof formData.dates, value: string) => {
    if (!canEditDatesAndStage) return;
    setFormData(prev => ({
      ...prev,
      dates: { ...prev.dates, [dateField]: value }
    }));
  };

  const handleLinkChange = (linkField: keyof typeof formData.links, value: string) => {
    if (!canEditLinks) return;
    setFormData(prev => ({
      ...prev,
      links: { ...prev.links, [linkField]: value }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  // --- Calendar Helpers ---
  const changeMonth = (offset: number) => {
      const newDate = new Date(calDate);
      newDate.setMonth(newDate.getMonth() + offset);
      setCalDate(newDate);
  }
  
  const daysInMonth = new Date(calDate.getFullYear(), calDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(calDate.getFullYear(), calDate.getMonth(), 1).getDay(); // 0 is Sunday
  // Adjust so 0 is Monday for Russian calendar style usually, but lets stick to standard 0=Sunday or adjust if needed.
  // Let's make Monday first (1) -> 0.
  const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; 

  const monthName = calDate.toLocaleString('ru-RU', { month: 'long', year: 'numeric' });
  const today = new Date();
  const isCurrentMonth = today.getMonth() === calDate.getMonth() && today.getFullYear() === calDate.getFullYear();

  const renderCalendarDays = () => {
      const days = [];
      // Empty cells
      for(let i = 0; i < startDay; i++) {
          days.push(<div key={`empty-${i}`} className="h-8 md:h-10"></div>);
      }

      const pStart = new Date(formData.startDate).getTime();
      const pEnd = new Date(formData.endDate).getTime();

      for(let d = 1; d <= daysInMonth; d++) {
          const currentDayStr = `${calDate.getFullYear()}-${String(calDate.getMonth()+1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          const currentDayTs = new Date(currentDayStr).getTime();
          const isToday = isCurrentMonth && today.getDate() === d;

          let bgClass = '';
          // Check if in range
          if (pStart && pEnd && currentDayTs >= pStart && currentDayTs <= pEnd) {
              bgClass = 'bg-gray-200 text-gray-800';
          }
          
          // Check specific milestones
          let borderClass = '';
          let dotColor = '';

          // Milestones
          if (formData.dates.mounting === currentDayStr) { borderClass = 'ring-2 ring-yellow-400'; dotColor = 'bg-yellow-400'; }
          else if (formData.dates.electric === currentDayStr) { borderClass = 'ring-2 ring-orange-400'; dotColor = 'bg-orange-400'; }
          else if (formData.dates.edit1 === currentDayStr) { borderClass = 'ring-2 ring-purple-400'; dotColor = 'bg-purple-400'; }
          else if (formData.dates.edit2 === currentDayStr) { borderClass = 'ring-2 ring-purple-400'; dotColor = 'bg-purple-400'; }
          else if (formData.dates.edit3 === currentDayStr) { borderClass = 'ring-2 ring-purple-400'; dotColor = 'bg-purple-400'; }
          
          if (currentDayStr === formData.startDate) { borderClass = 'ring-2 ring-blue-400'; dotColor = 'bg-blue-400'; }
          if (currentDayStr === formData.endDate) { borderClass = 'ring-2 ring-blue-400'; dotColor = 'bg-blue-400'; }

          if (isToday) {
             borderClass = 'ring-2 ring-red-500 text-red-600 font-bold z-10'; 
          }

          days.push(
              <div key={d} className={`h-8 md:h-10 flex items-center justify-center rounded-lg text-xs font-medium relative ${bgClass} ${borderClass}`}>
                  {d}
                  {dotColor && <div className={`absolute bottom-1 w-1 h-1 rounded-full ${dotColor}`}></div>}
              </div>
          );
      }
      return days;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-y-auto">
        <div className="p-8 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-20">
          <div>
              <h2 className="text-3xl font-light text-gray-800 tracking-tight">
                {initialProject ? formData.name : 'Новый проект'}
              </h2>
              <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">Редактирование</p>
          </div>
          <div className="flex items-center gap-2">
            
            {/* TOR Button (Opens Modal) */}
             <button
                type="button" 
                onClick={() => setShowTorModal(true)}
                className={`p-3 rounded-full transition-colors mr-2 flex items-center gap-2 ${
                    !formData.technicalTask ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-brand-50 text-brand-600 hover:bg-brand-100'
                }`}
                title="ТЕХНИЧЕСКОЕ ЗАДАНИЕ (Текст)"
              >
                <FileText size={20} />
                <span className="hidden md:inline text-xs font-bold uppercase">ТЗ</span>
            </button>

            {isAdmin && initialProject && (
              <button 
                onClick={() => setShowFinancials(!showFinancials)}
                className="p-3 bg-yellow-50 hover:bg-yellow-100 text-yellow-600 rounded-full transition-colors mr-2"
                title="Финансы"
              >
                <Receipt size={20} />
              </button>
            )}
            
            {isAdmin && initialProject && onDelete && (
               <button 
                onClick={() => onDelete(initialProject.id)}
                className="p-3 bg-red-50 hover:bg-red-100 text-red-500 rounded-full transition-colors mr-2"
                title="Удалить проект"
              >
                <Trash2 size={20} />
              </button>
            )}

            <button onClick={onClose} className="p-3 hover:bg-gray-100 rounded-full transition-colors">
              <X size={24} className="text-gray-500" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-10">
          
          {/* Financials Dropdown Section (Admin) */}
          {showFinancials && isAdmin && (
            <div className="bg-[#FFFCE8] p-6 rounded-2xl border border-yellow-100 mb-6 animate-fade-in">
              <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
                <Receipt size={20} /> Финансовые данные
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                 <div>
                   <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">Площадь</label>
                   <div className="font-bold text-lg">{formData.financials.area} м²</div>
                 </div>
                 <div>
                   <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">Студия</label>
                   <div className="font-medium">{(formData.financials.area * formData.financials.costPerMeterStudio).toLocaleString()} ₽</div>
                 </div>
                 <div>
                   <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">Арх</label>
                   <div className="font-medium">{(formData.financials.area * formData.financials.costPerMeterArch).toLocaleString()} ₽</div>
                 </div>
                 <div>
                   <label className="block text-[10px] text-gray-500 uppercase tracking-wider mb-1">Предоплата</label>
                   <div className="font-medium">{(formData.financials.area * formData.financials.costPerMeterStudio * 0.3).toLocaleString()} ₽</div>
                 </div>
              </div>
            </div>
          )}

          {/* Top Row: Dates & Name */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             <div className="lg:col-span-1 space-y-4">
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Название проекта</label>
                    <input
                        type="text"
                        required
                        disabled={!isAdmin}
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black/5 focus:outline-none disabled:opacity-60 text-lg font-medium"
                    />
                </div>
                {/* Users Selection */}
                 <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex justify-between">
                        Архитектор
                        {isDesigner && currentArchitect && (
                        <button type="button" onClick={() => setShowArchInfo(!showArchInfo)} className="text-brand-500 text-xs flex items-center gap-1 hover:underline group">
                            <Info size={12} />
                            <span className="hidden group-hover:inline ml-1">Инфо</span>
                        </button>
                        )}
                    </label>
                    <div className="relative">
                      {canEditUsers ? (
                          <select
                          value={formData.architectId}
                          onChange={(e) => handleChange('architectId', e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black/5 focus:outline-none"
                          >
                          <option value="">Выберите архитектора</option>
                          {architects.map(u => <option key={u.id} value={u.id}>{u.fullName || u.username}</option>)}
                          </select>
                      ) : (
                          <div 
                            className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-medium ${isDesigner && currentArchitect ? 'cursor-pointer hover:bg-gray-100 hover:text-brand-600 transition-colors' : ''}`}
                            onClick={() => {
                              if (isDesigner && currentArchitect) setShowArchInfo(!showArchInfo);
                            }}
                            title={isDesigner ? "Нажмите для информации" : ""}
                          >
                          {currentArchitect?.fullName || currentArchitect?.username || 'Не назначен'}
                          </div>
                      )}
                       {/* Architect Info Popup - Wider & Compact */}
                      {showArchInfo && currentArchitect && (
                          <div className="absolute top-full left-0 mt-2 w-96 bg-white shadow-2xl rounded-2xl border border-gray-100 p-6 z-30 animate-in fade-in zoom-in-95">
                          <div className="flex flex-col items-center text-center">
                              {currentArchitect.photoUrl ? (
                              <img src={currentArchitect.photoUrl} alt="Architect" className="w-20 h-20 rounded-full object-cover mb-2 shadow-md" />
                              ) : (
                              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mb-2 text-xs">Нет фото</div>
                              )}
                              <h4 className="font-bold text-lg leading-tight">{currentArchitect.fullName}</h4>
                              <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1 mb-2">{currentArchitect.dob || 'Дата рождения не указана'}</p>
                              
                              {currentArchitect.bio && (
                                <p className="text-xs text-gray-600 leading-relaxed mb-3 line-clamp-3">{currentArchitect.bio}</p>
                              )}
                              
                              <div className="bg-gray-50 p-3 rounded-lg w-full text-left">
                                  <p className="text-[10px] text-gray-400 uppercase font-bold">Реквизиты</p>
                                  <p className="text-xs font-mono text-gray-600 mt-1 break-words">{currentArchitect.paymentDetails || 'Нет данных'}</p>
                              </div>
                          </div>
                          </div>
                      )}
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Дизайнер</label>
                    {canEditUsers ? (
                        <select
                        value={formData.designerId}
                        onChange={(e) => handleChange('designerId', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black/5 focus:outline-none"
                        >
                        <option value="">Выберите дизайнера</option>
                        {designers.map(u => <option key={u.id} value={u.id}>{u.fullName || u.username}</option>)}
                        </select>
                    ) : (
                        <input
                        type="text"
                        disabled
                        value={designers.find(d => d.id === formData.designerId)?.fullName || 'Не назначен'}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl disabled:opacity-60 font-medium"
                        />
                    )}
                </div>
             </div>
             
             {/* Calendar Visualizer & Dates */}
             <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                     <div className="flex items-center gap-3">
                         <h3 className="text-lg font-light flex items-center gap-2">
                             <CalendarIcon size={20} className="text-gray-400"/> Календарь проекта
                         </h3>
                     </div>
                     
                     {/* Stage Selector */}
                     {canEditDatesAndStage ? (
                        <select 
                            value={formData.stage}
                            onChange={(e) => handleChange('stage', e.target.value)}
                            className={`px-3 py-1 rounded-lg border text-xs font-bold uppercase tracking-wider ${STAGE_COLORS[formData.stage]}`}
                        >
                            {Object.values(ProjectStage).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                     ) : (
                         <div className={`px-3 py-1 rounded-lg border text-xs font-bold uppercase tracking-wider ${STAGE_COLORS[formData.stage]}`}>
                             {formData.stage}
                         </div>
                     )}
                </div>

                {/* Calendar Grid View */}
                <div className="bg-gray-50 rounded-2xl p-4 mb-8">
                   <div className="flex justify-between items-center mb-4 px-2">
                      <button type="button" onClick={() => changeMonth(-1)} className="p-1 hover:bg-gray-200 rounded text-gray-500"><ChevronLeft size={20}/></button>
                      <div className="font-semibold text-gray-700 capitalize">{monthName}</div>
                      <button type="button" onClick={() => changeMonth(1)} className="p-1 hover:bg-gray-200 rounded text-gray-500"><ChevronRight size={20}/></button>
                   </div>
                   <div className="grid grid-cols-7 gap-1 text-center mb-2">
                       {['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map(d => <div key={d} className="text-[10px] text-gray-400 font-bold uppercase">{d}</div>)}
                   </div>
                   <div className="grid grid-cols-7 gap-1">
                      {renderCalendarDays()}
                   </div>
                </div>

                {/* Date Inputs Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     <div className="col-span-2 md:col-span-1">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Начало</label>
                        <input type="date" disabled={!canEditDatesAndStage} value={formData.startDate} onChange={e => handleChange('startDate', e.target.value)} className="w-full px-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs" />
                     </div>
                     <div className="col-span-2 md:col-span-1">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Конец</label>
                        <input type="date" disabled={!canEditDatesAndStage} value={formData.endDate} onChange={e => handleChange('endDate', e.target.value)} className="w-full px-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs" />
                     </div>
                     {Object.keys(formData.dates).map((key) => (
                         <div key={key} className="col-span-1">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 truncate">{key.replace('edit', 'правки ').replace('mounting', 'монтаж').replace('electric', 'электрика')}</label>
                            <input
                                type="date"
                                disabled={!canEditDatesAndStage}
                                value={(formData.dates as any)[key]}
                                onChange={(e) => handleDateChange(key as any, e.target.value)}
                                className={`w-full px-2 py-2 bg-gray-50 border rounded-lg text-xs ${
                                    key.includes('mounting') ? 'border-yellow-200 focus:ring-yellow-200' :
                                    key.includes('electric') ? 'border-orange-200 focus:ring-orange-200' :
                                    key.includes('edit') ? 'border-purple-200 focus:ring-purple-200' : 'border-gray-200'
                                }`}
                            />
                         </div>
                     ))}
                </div>
             </div>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <h3 className="text-xl font-light text-gray-800 mb-6">Ссылки и Ресурсы</h3>
            
            {(isAdmin || isArchitect) && (
              <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Ссылка для Заказчика</label>
                    <code className="text-xs text-brand-600 bg-white px-2 py-1 rounded border border-gray-200 select-all">{clientLink}</code>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.keys(formData.links).map((key) => (
                <div key={key} className="relative">
                   <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                        {key === 'tor' ? 'Техническое задание' :
                        key === 'source' ? 'Исходные данные' :
                        key === 'visuals' ? 'Визуализации' :
                        key === 'hvac' ? 'Проект ОВиК' :
                        key.toUpperCase()}
                   </label>
                   <div className="relative">
                       <input
                            type="text"
                            disabled={!canEditLinks}
                            value={(formData.links as any)[key]}
                            onChange={(e) => handleLinkChange(key as any, e.target.value)}
                            className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-black/5 focus:outline-none disabled:opacity-60 transition-all"
                       />
                       {/* Clickable Link Icon if value exists */}
                       {(formData.links as any)[key] && (
                           <a 
                              href={(formData.links as any)[key]} 
                              target="_blank" 
                              rel="noreferrer"
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-600 transition-colors p-1"
                              title="Перейти по ссылке"
                           >
                               <ExternalLink size={16} />
                           </a>
                       )}
                   </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end sticky bottom-0 bg-white p-4 -mx-8 -mb-8 rounded-b-3xl">
            <button
              type="submit"
              className="px-10 py-4 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-all shadow-xl font-bold uppercase tracking-wider text-sm"
            >
              Сохранить
            </button>
          </div>
        </form>
      </div>

      {/* Technical Task (ТЗ) Modal */}
      {showTorModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setShowTorModal(false)}>
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800">Техническое задание</h3>
                    <button onClick={() => setShowTorModal(false)}><X size={24} className="text-gray-400" /></button>
                </div>
                {isAdmin ? (
                    <textarea
                        className="w-full h-64 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none resize-none"
                        placeholder="Введите текст технического задания..."
                        value={formData.technicalTask || ''}
                        onChange={(e) => handleChange('technicalTask', e.target.value)}
                    />
                ) : (
                    <div className="w-full h-64 p-4 border border-gray-100 rounded-xl bg-gray-50 overflow-y-auto whitespace-pre-wrap text-sm text-gray-700">
                        {formData.technicalTask || 'Техническое задание еще не заполнено.'}
                    </div>
                )}
                <div className="flex justify-end mt-4">
                    <button onClick={() => setShowTorModal(false)} className="px-6 py-2 bg-brand-600 text-white rounded-lg font-medium">
                        {isAdmin ? 'Готово' : 'Закрыть'}
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};