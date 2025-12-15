import React, { useState } from 'react';
import { Project, UserRole, User } from '../types';
import { Info, X } from 'lucide-react';

interface ProjectChecksProps {
  projects: Project[];
  users: User[];
  role: UserRole;
  startIndex?: number;
}

export const ProjectChecks: React.FC<ProjectChecksProps> = ({ projects, users, role, startIndex = 150 }) => {
  const [selectedArchitect, setSelectedArchitect] = useState<User | null>(null);

  return (
    <div className="mt-8 relative">
      <h2 className="text-2xl font-light text-gray-800 mb-6">Финансовые чеки</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-6">
        {projects.map((project, idx) => {
          const { 
            area, 
            costPerMeterStudio, 
            costPerMeterArch, 
            prepaymentDate, 
            paymentDate,
            prepaymentArchitectId,
            paymentArchitectId
          } = project.financials;

          const architect = users.find(u => u.id === project.architectId);
          const architectName = architect?.fullName || 'Не назначен';
          const designerName = users.find(u => u.id === project.designerId)?.fullName || 'Не назначен';

          // Specific payment recipients
          const prepayArchitect = users.find(u => u.id === prepaymentArchitectId);
          const payArchitect = users.find(u => u.id === paymentArchitectId);

          // Calculations
          const totalStudio = area * costPerMeterStudio;
          const totalArch = area * costPerMeterArch;
          const prepaymentStudio = totalStudio * 0.3; // 30% of Studio Total
          const postpaymentArch = totalArch - prepaymentStudio;
          
          // Balance
          const balanceStudio = totalStudio - prepaymentStudio;
          const balanceArch = totalArch - prepaymentStudio;
          
          const projectNumber = startIndex + idx;
          const isPaid = !!paymentDate;

          return (
            <div key={project.id} className="bg-[#FFFCE8] border border-yellow-100 rounded-3xl p-4 shadow-sm relative flex flex-col hover:shadow-md transition-shadow overflow-hidden">
              
              {/* PAID Stamp */}
              {isPaid && (
                  <div className="absolute top-10 -right-2 transform rotate-12 z-10 pointer-events-none">
                      <div className="border-2 border-red-500 text-red-500 font-bold text-xs px-2 py-0.5 rounded uppercase opacity-60 tracking-widest">
                          Оплачено
                      </div>
                  </div>
              )}

              {/* Header */}
              <div className="flex justify-between items-start mb-4 relative z-0">
                <div className="min-w-0 pr-2">
                  <h3 className="text-sm font-bold text-gray-800 leading-tight mb-0.5 truncate" title={project.name}>{project.name}</h3>
                  <p className="text-[10px] uppercase tracking-widest text-gray-400">#{projectNumber}</p>
                </div>
                <div className="text-yellow-600 bg-yellow-100 p-1.5 rounded-lg font-bold text-xs flex-shrink-0">
                  ₽
                </div>
              </div>

              {/* Data Blocks */}
              <div className="space-y-3 mb-6">
                {/* Area */}
                <div>
                  <label className="block text-[8px] uppercase font-bold text-yellow-600 mb-1 ml-1">ПЛОЩАДЬ (М²)</label>
                  <div className="bg-white border border-yellow-200 rounded-lg px-3 py-1.5 text-gray-800 font-bold text-sm shadow-sm">
                    {area}
                  </div>
                </div>

                {/* Rates Row */}
                <div className="flex gap-2">
                  {(role === UserRole.DESIGNER || role === UserRole.ADMIN) && (
                    <div className="flex-1 min-w-0">
                      <label className="block text-[8px] uppercase font-bold text-yellow-600 mb-1 ml-1 truncate">Р/М² СТУД</label>
                      <div className="bg-white border border-yellow-200 rounded-lg px-3 py-1.5 text-gray-800 font-bold text-sm shadow-sm truncate">
                        {costPerMeterStudio}
                      </div>
                    </div>
                  )}
                  
                  {(role === UserRole.ARCHITECT || role === UserRole.ADMIN) && (
                    <div className="flex-1 min-w-0">
                      <label className="block text-[8px] uppercase font-bold text-yellow-600 mb-1 ml-1 truncate">Р/М² АРХ</label>
                      <div className="bg-white border border-yellow-200 rounded-lg px-3 py-1.5 text-gray-800 font-bold text-sm shadow-sm truncate">
                        {costPerMeterArch}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Totals Section */}
              <div className="bg-[#FFF9C4]/30 -mx-4 px-4 py-4 mt-auto space-y-2 border-t border-yellow-100/50">
                
                {/* Total Lines First */}
                {(role === UserRole.DESIGNER || role === UserRole.ADMIN) && (
                    <div className="flex justify-between items-baseline text-xs">
                      <span className="text-gray-600 font-medium truncate mr-1">Итого Студия:</span>
                      <span className="text-gray-900 font-bold truncate">{totalStudio.toLocaleString()} ₽</span>
                    </div>
                )}
                {(role === UserRole.ARCHITECT || role === UserRole.ADMIN) && (
                    <div className="flex justify-between items-baseline text-xs">
                      <span className="text-gray-600 font-medium truncate mr-1">Итого Арх:</span>
                      <span className="text-gray-900 font-bold truncate">{totalArch.toLocaleString()} ₽</span>
                    </div>
                )}

                {/* Prepayment Second */}
                <div className="border-t border-yellow-200/50 pt-1.5">
                    <div className="flex justify-between items-baseline text-xs">
                        <span className="text-gray-600 font-medium truncate mr-1">Предоплата (30%):</span>
                        <span className="text-gray-900 font-medium truncate">{prepaymentStudio.toLocaleString()} ₽</span>
                    </div>
                    {/* Prepayment Architect Link - Hide if role is Architect */}
                    {prepayArchitect && role !== UserRole.ARCHITECT && (
                        <div 
                            className="text-[9px] text-right text-brand-600 cursor-pointer hover:underline mt-0.5"
                            onClick={() => {
                                if (role === UserRole.DESIGNER) setSelectedArchitect(prepayArchitect);
                            }}
                        >
                            {prepayArchitect.fullName}
                        </div>
                    )}
                </div>

                {/* Balance Lines Third */}
                {(role === UserRole.DESIGNER || role === UserRole.ADMIN) && (
                    <div className="border-t border-yellow-200/50 pt-1.5">
                         <div className="flex justify-between items-baseline text-xs">
                            <span className="text-gray-600 font-medium truncate mr-1">Остаток Студия:</span>
                            <span className="text-gray-900 font-bold truncate">{balanceStudio.toLocaleString()} ₽</span>
                        </div>
                         {/* Payment Architect Link - Hide if role is Architect */}
                        {payArchitect && role !== UserRole.ARCHITECT && (
                            <div 
                                className="text-[9px] text-right text-brand-600 cursor-pointer hover:underline mt-0.5"
                                onClick={() => {
                                    if (role === UserRole.DESIGNER) setSelectedArchitect(payArchitect);
                                }}
                            >
                                {payArchitect.fullName}
                            </div>
                        )}
                    </div>
                )}
                {(role === UserRole.ARCHITECT || role === UserRole.ADMIN) && (
                    <div className="flex justify-between items-baseline text-xs pt-0.5">
                      <span className="text-gray-600 font-medium truncate mr-1">Остаток Арх:</span>
                      <span className="text-gray-900 font-bold truncate">{balanceArch.toLocaleString()} ₽</span>
                    </div>
                )}

                {role === UserRole.DESIGNER && (
                    <div className="pt-1.5 flex justify-between text-[8px] text-gray-400 border-t border-yellow-200/30 mt-1">
                      <span>Дата: {prepaymentDate || '—'}</span>
                      <span>Оплата: {paymentDate || '—'}</span>
                    </div>
                )}
              </div>

              {/* Footer */}
              <div className="mt-4 pt-3 border-t border-yellow-200/50 text-[10px] text-gray-500 space-y-1">
                <div className="flex gap-2 items-center">
                  <span className="text-gray-400 w-16 flex-shrink-0">Архитектор:</span>
                  <span 
                    className={`font-medium truncate ${role === UserRole.DESIGNER && architect ? 'text-brand-600 cursor-pointer hover:underline' : 'text-gray-700'}`}
                    onClick={() => {
                        if (role === UserRole.DESIGNER && architect) {
                            setSelectedArchitect(architect);
                        }
                    }}
                  >
                      {architectName}
                  </span>
                </div>
                <div className="flex gap-2 items-center">
                   <span className="text-gray-400 w-16 flex-shrink-0">Дизайнер:</span>
                   <span className="font-medium text-gray-700 truncate">{designerName}</span>
                </div>
              </div>

            </div>
          );
        })}
      </div>

       {/* Architect Info Modal */}
       {selectedArchitect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm" onClick={() => setSelectedArchitect(null)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm relative" onClick={e => e.stopPropagation()}>
            <button 
                onClick={() => setSelectedArchitect(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
                <X size={20} />
            </button>
            <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-gray-100 mb-4 overflow-hidden">
                    {selectedArchitect.photoUrl ? (
                        <img src={selectedArchitect.photoUrl} alt="Arch" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold">No Photo</div>
                    )}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{selectedArchitect.fullName}</h3>
                <p className="text-xs text-gray-500 mb-4">{selectedArchitect.dob}</p>
                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 w-full text-left">
                    <p className="text-[10px] uppercase font-bold text-yellow-600 mb-2">Реквизиты для оплаты</p>
                    <p className="text-sm font-mono text-gray-800 whitespace-pre-wrap">{selectedArchitect.paymentDetails || 'Реквизиты не указаны'}</p>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};