import React, { useMemo, useState } from 'react';
import { Project, ProjectStage, STAGE_COLORS, User, UserRole } from '../types';
import { List, BarChartHorizontal } from 'lucide-react';

interface GanttChartProps {
  title: string;
  projects: Project[];
  onProjectClick: (project: Project) => void;
  users?: User[];
  currentUser?: User | null;
}

export const GanttChart: React.FC<GanttChartProps> = ({ title, projects, onProjectClick, users, currentUser }) => {
  const [viewMode, setViewMode] = useState<'CHART' | 'LIST'>('CHART');

  // Helper to determine the total date range for the chart
  const { minDate, maxDate, totalDays } = useMemo(() => {
    if (projects.length === 0) {
      const now = new Date();
      return { 
        minDate: now, 
        maxDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), 
        totalDays: 30 
      };
    }

    let min = new Date(projects[0].startDate).getTime();
    let max = new Date(projects[0].endDate).getTime();

    projects.forEach(p => {
      const start = new Date(p.startDate).getTime();
      const end = new Date(p.endDate).getTime();
      if (start < min) min = start;
      if (end > max) max = end;
    });

    // Add some padding
    const minD = new Date(min - 5 * 24 * 60 * 60 * 1000);
    const maxD = new Date(max + 5 * 24 * 60 * 60 * 1000);
    const diffTime = Math.abs(maxD.getTime() - minD.getTime());
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return { minDate: minD, maxDate: maxD, totalDays: days };
  }, [projects]);

  const getPosition = (dateStr: string) => {
    const date = new Date(dateStr);
    const diff = date.getTime() - minDate.getTime();
    const days = diff / (1000 * 60 * 60 * 24);
    return (days / totalDays) * 100;
  };

  const getWidth = (startStr: string, endStr: string) => {
    const start = new Date(startStr);
    const end = new Date(endStr);
    const diff = Math.abs(end.getTime() - start.getTime());
    const days = diff / (1000 * 60 * 60 * 24);
    return Math.max((days / totalDays) * 100, 1);
  };

  const months = useMemo(() => {
    const ms = [];
    const current = new Date(minDate);
    current.setDate(1); 
    
    // Safety break
    let safety = 0;
    while (current <= maxDate && safety < 100) {
      ms.push(new Date(current));
      current.setMonth(current.getMonth() + 1);
      safety++;
    }
    return ms;
  }, [minDate, maxDate]);

  // Today Line Calculation
  const today = new Date();
  const todayLeft = getPosition(today.toISOString());

  // Header Height: h-12 (48px) + mb-4 (16px) = 64px
  // Top Padding for Bars Container: pt-2 (8px)
  // Total Offset for first bar: 72px
  // Row height: h-6 (24px)
  // Row gap: space-y-4 (16px)

  return (
    <div className="flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky left-0 z-20">
        <h2 className="text-xl font-light tracking-wide text-gray-800">{title}</h2>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button 
            onClick={() => setViewMode('CHART')}
            className={`p-2 rounded-md transition-all ${viewMode === 'CHART' ? 'bg-white shadow-sm text-black' : 'text-gray-400'}`}
          >
            <BarChartHorizontal size={18} />
          </button>
          <button 
             onClick={() => setViewMode('LIST')}
             className={`p-2 rounded-md transition-all ${viewMode === 'LIST' ? 'bg-white shadow-sm text-black' : 'text-gray-400'}`}
          >
            <List size={18} />
          </button>
        </div>
      </div>
      
      {viewMode === 'LIST' ? (
        <div className="p-2">
          {projects.map(project => (
            <div 
              key={project.id} 
              onClick={() => onProjectClick(project)}
              className="p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer flex justify-between items-center group"
            >
              <div>
                <h3 className="font-medium text-gray-800">{project.name}</h3>
                <span className={`text-xs px-2 py-1 rounded-full mt-1 inline-block ${STAGE_COLORS[project.stage]}`}>
                  {project.stage}
                </span>
              </div>
              <div className="text-xs text-gray-400 group-hover:text-gray-600">
                {project.startDate} — {project.endDate}
              </div>
            </div>
          ))}
          {projects.length === 0 && <div className="p-8 text-center text-gray-400">Нет проектов</div>}
        </div>
      ) : (
        <div className="overflow-x-auto gantt-scroll relative">
          <div className="min-w-[1200px] p-6 relative flex">
            {/* Left Side Names Column */}
            <div className="w-56 flex-shrink-0 relative z-20 bg-white border-r border-gray-50 pr-4 pl-4 pt-[72px] space-y-4">
                 {projects.map((project) => (
                    <div key={project.id} className="h-6 flex items-center justify-start">
                        <span className="text-xs font-bold text-gray-800 truncate w-full text-left" title={project.name}>
                            {project.name}
                        </span>
                    </div>
                 ))}
            </div>

            {/* Chart Area */}
            <div className="flex-grow relative ml-1"> 
                {/* Header: Months */}
                <div className="flex border-b border-gray-100 mb-4 pb-2 relative h-12 sticky top-0 bg-white z-10">
                    {months.map((month, idx) => {
                        const left = getPosition(month.toISOString());
                        if (left < 0 || left > 100) return null;
                        return (
                        <div key={idx} className="absolute font-bold text-xs text-gray-600 uppercase" style={{ left: `${left}%` }}>
                            {month.toLocaleString('ru-RU', { month: 'long', year: 'numeric' })}
                        </div>
                        );
                    })}
                </div>

                {/* Grid Lines */}
                <div className="absolute inset-0 top-16 pointer-events-none">
                    {/* Today Line */}
                    {todayLeft >= 0 && todayLeft <= 100 && (
                        <div className="absolute top-0 bottom-0 border-l-2 border-red-500 z-30 shadow-[0_0_8px_rgba(239,68,68,0.4)]" style={{ left: `${todayLeft}%` }} title="Сегодня" />
                    )}

                    {months.map((month, idx) => {
                        const left = getPosition(month.toISOString());
                        if (left < 0 || left > 100) return null;
                        return (
                            <div key={idx} className="absolute top-0 bottom-0 border-l border-dashed border-gray-100" style={{ left: `${left}%` }} />
                        );
                    })}
                </div>

                {/* Projects Bars */}
                <div className="space-y-4 relative z-10 pt-2">
                    {projects.map((project) => {
                        const left = getPosition(project.startDate);
                        const width = getWidth(project.startDate, project.endDate);
                        const colorClass = STAGE_COLORS[project.stage] || 'bg-gray-200 text-gray-700';
                        
                        // Determine which name to show inside the bar
                        const designer = users?.find(u => u.id === project.designerId);
                        const architect = users?.find(u => u.id === project.architectId);
                        
                        // If current user is Designer, show Architect name. Otherwise show Designer name.
                        const nameOnBar = currentUser?.role === UserRole.DESIGNER 
                          ? architect?.fullName 
                          : designer?.fullName;

                        return (
                        <div key={project.id} className="relative h-6 group">
                            <div className="h-6 w-full relative bg-gray-50 rounded-full overflow-hidden">
                                <button
                                onClick={() => onProjectClick(project)}
                                className={`absolute h-full top-0 rounded-full shadow-sm hover:shadow-md transition-all duration-300 flex items-center px-2 cursor-pointer ${colorClass} hover:opacity-90 overflow-hidden`}
                                style={{ left: `${left}%`, width: `${width}%` }}
                                >
                                  {nameOnBar && (
                                    <span className="text-[10px] font-medium whitespace-nowrap opacity-60 text-current mr-auto z-10">
                                      {nameOnBar}
                                    </span>
                                  )}
                                <span className="text-[10px] font-semibold whitespace-nowrap overflow-hidden text-ellipsis block w-full text-center opacity-0 group-hover:opacity-100 transition-opacity absolute inset-0 flex items-center justify-center">
                                    {project.stage}
                                </span>
                                </button>
                            </div>
                        </div>
                        );
                    })}
                </div>
            </div>

            {projects.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400 font-light text-sm">
                  Нет проектов.
                </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};