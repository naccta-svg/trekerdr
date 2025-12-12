import React from 'react';
import { Project, User, UserRole } from '../types';
import { BadgeDollarSign } from 'lucide-react';

interface FinancialTableProps {
  projects: Project[];
  users: User[];
  onUpdateProject: (project: Project) => void;
}

export const FinancialTable: React.FC<FinancialTableProps> = ({ projects, users, onUpdateProject }) => {
  const architects = users.filter(u => u.role === UserRole.ARCHITECT);
  
  const handleFinancialChange = (project: Project, field: keyof typeof project.financials, value: string) => {
    const numValue = field.includes('Date') || field.includes('Id') ? value : parseFloat(value) || 0;
    const updatedProject = {
      ...project,
      financials: {
        ...project.financials,
        [field]: numValue
      }
    };
    onUpdateProject(updatedProject);
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-light text-gray-800 mb-6">Финансы</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
          
          // Architect Payment Info for Admin visibility (Main Project Architect)
          const mainArchitect = users.find(u => u.id === project.architectId);
          const architectName = mainArchitect?.fullName || 'Не назначен';
          const architectPayment = mainArchitect?.paymentDetails || 'Реквизиты не заполнены';

          // Calculations
          const totalStudio = area * costPerMeterStudio;
          const totalArch = area * costPerMeterArch;
          const prepaymentStudio = totalStudio * 0.3; 
          const balanceStudio = totalStudio - prepaymentStudio;
          const balanceArch = totalArch - prepaymentStudio;

          const projectNumber = 150 + idx;

          return (
            <div key={project.id} className="bg-[#FFFCE8] border border-yellow-100 rounded-[2rem] p-6 shadow-sm relative flex flex-col hover:shadow-md transition-shadow">
              
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div className="truncate pr-2">
                  <h3 className="text-lg font-bold text-gray-800 leading-tight mb-1 truncate">{project.name}</h3>
                  <p className="text-[10px] uppercase tracking-widest text-gray-400">#{projectNumber}</p>
                </div>
                {/* Architect Info Tooltip for Admin */}
                <div className="group relative">
                    <div className="text-yellow-600 bg-yellow-100 p-2 rounded-lg cursor-help font-bold">
                        ₽
                    </div>
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-yellow-200 p-4 rounded-xl shadow-xl z-50 hidden group-hover:block">
                        <h4 className="font-bold text-sm mb-1">{architectName}</h4>
                        <p className="text-xs text-gray-600 whitespace-pre-wrap">{architectPayment}</p>
                    </div>
                </div>
              </div>

              {/* Data Blocks */}
              <div className="space-y-3 mb-6">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-yellow-600 mb-1 ml-1">ПЛОЩАДЬ (М²)</label>
                  <input
                    type="number"
                    value={area}
                    onChange={(e) => handleFinancialChange(project, 'area', e.target.value)}
                    className="w-full bg-white border border-yellow-200 rounded-xl px-4 py-2 text-gray-800 font-bold text-lg shadow-sm focus:ring-2 focus:ring-yellow-400 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>

                <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-[10px] uppercase font-bold text-yellow-600 mb-1 ml-1">Р/М² СТУД</label>
                      <input
                        type="number"
                        value={costPerMeterStudio}
                        onChange={(e) => handleFinancialChange(project, 'costPerMeterStudio', e.target.value)}
                        className="w-full bg-white border border-yellow-200 rounded-xl px-3 py-2 text-gray-800 font-bold text-sm shadow-sm focus:ring-2 focus:ring-yellow-400 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[10px] uppercase font-bold text-yellow-600 mb-1 ml-1">Р/М² АРХ</label>
                      <input
                        type="number"
                        value={costPerMeterArch}
                        onChange={(e) => handleFinancialChange(project, 'costPerMeterArch', e.target.value)}
                        className="w-full bg-white border border-yellow-200 rounded-xl px-3 py-2 text-gray-800 font-bold text-sm shadow-sm focus:ring-2 focus:ring-yellow-400 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                </div>
              </div>

              {/* Totals Section */}
              <div className="bg-[#FFF9C4]/30 -mx-6 px-6 py-4 mt-auto space-y-2 border-t border-yellow-100/50 text-sm">
                 <div className="flex justify-between items-baseline">
                      <span className="text-gray-600 font-medium">Итого Студия:</span>
                      <span className="text-gray-900 font-bold">{totalStudio.toLocaleString()} ₽</span>
                  </div>
                   <div className="flex justify-between items-baseline">
                      <span className="text-gray-600 font-medium">Остаток Студия:</span>
                      <span className="text-gray-900 font-bold">{balanceStudio.toLocaleString()} ₽</span>
                  </div>
                  <div className="border-t border-yellow-200/30 my-1"></div>
                  <div className="flex justify-between items-baseline">
                      <span className="text-gray-600 font-medium">Итого Арх:</span>
                      <span className="text-gray-900 font-bold">{totalArch.toLocaleString()} ₽</span>
                  </div>
                   <div className="flex justify-between items-baseline">
                      <span className="text-gray-600 font-medium">Остаток Арх:</span>
                      <span className="text-gray-900 font-bold">{balanceArch.toLocaleString()} ₽</span>
                  </div>
                  <div className="border-t border-yellow-200/30 my-1"></div>
                  
                  {/* Prepayment Section */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-baseline">
                        <span className="text-gray-600 font-medium">Предоплата 30%:</span>
                        <span className="text-brand-600 font-bold">{prepaymentStudio.toLocaleString()} ₽</span>
                    </div>
                    
                    <div className="bg-white/50 p-2 rounded-lg border border-yellow-200/50">
                         <label className="text-[10px] text-gray-500 block mb-1">Перевести предоплату:</label>
                         <select 
                            value={prepaymentArchitectId || ''} 
                            onChange={(e) => handleFinancialChange(project, 'prepaymentArchitectId', e.target.value)}
                            className="w-full text-xs bg-white border border-yellow-200 rounded px-2 py-1 focus:outline-none"
                         >
                             <option value="">Не выбрано</option>
                             {architects.map(arch => (
                                 <option key={arch.id} value={arch.id}>{arch.fullName}</option>
                             ))}
                         </select>
                    </div>
                  </div>

                  {/* Payment Section */}
                  <div className="space-y-2 mt-2">
                    <div className="bg-white/50 p-2 rounded-lg border border-yellow-200/50">
                         <label className="text-[10px] text-gray-500 block mb-1">Перевести оплату:</label>
                         <select 
                            value={paymentArchitectId || ''} 
                            onChange={(e) => handleFinancialChange(project, 'paymentArchitectId', e.target.value)}
                            className="w-full text-xs bg-white border border-yellow-200 rounded px-2 py-1 focus:outline-none"
                         >
                             <option value="">Не выбрано</option>
                             {architects.map(arch => (
                                 <option key={arch.id} value={arch.id}>{arch.fullName}</option>
                             ))}
                         </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-yellow-200/30">
                     <div>
                        <label className="text-[10px] text-gray-400 block mb-1">Дата предоплаты</label>
                        <input 
                            type="date" 
                            value={prepaymentDate}
                            onChange={(e) => handleFinancialChange(project, 'prepaymentDate', e.target.value)}
                            className="w-full text-xs bg-white/50 border border-yellow-100 rounded px-1 py-1"
                        />
                     </div>
                     <div>
                        <label className="text-[10px] text-gray-400 block mb-1">Дата оплаты</label>
                        <input 
                            type="date" 
                            value={paymentDate}
                            onChange={(e) => handleFinancialChange(project, 'paymentDate', e.target.value)}
                            className="w-full text-xs bg-white/50 border border-yellow-100 rounded px-1 py-1"
                        />
                     </div>
                  </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};