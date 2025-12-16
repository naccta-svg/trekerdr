import React, { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { GanttChart } from './components/GanttChart';
import { ProjectModal } from './components/ProjectModal';
import { UserModal } from './components/UserModal';
import { FinancialTable } from './components/FinancialTable';
import { ArchitectList, DesignerList, ProjectLinksList, AllProjectsList } from './components/UserPages';
import { ClientView } from './components/ClientView';
import { ProjectChecks } from './components/ProjectChecks';
import { User, Project, UserRole, ProjectStage, ROLE_TRANSLATIONS } from './types';
import { LogOut, UserPlus, Plus, HardHat, Folder, Smile, Receipt, User as UserIcon, Layout, Upload, List } from 'lucide-react';
import { db } from './firebaseConfig';
import { collection, addDoc, getDocs } from 'firebase/firestore';

const INITIAL_USERS: User[] = [
  { id: '1', username: 'admin', password: '123456', role: UserRole.ADMIN, fullName: 'Super Admin' },
];

const INITIAL_PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'Реновация Лофта',
    startDate: '2023-11-01',
    endDate: '2024-02-15',
    stage: ProjectStage.START,
    architectId: '2',
    designerId: '7',
    dates: {
      mounting: '2023-11-05', measurement: '2023-11-10', electric: '2023-11-20',
      plumbing: '2023-11-25', walls: '2023-12-05', floor: '2023-12-15',
      ceiling: '2023-12-25', furniture: '2024-01-20', cleaning: '2024-02-10'
    },
    clientName: 'Иван Иванов',
    clientPhone: '+7 900 123 45 67',
    totalBudget: 5000000,
    paidAmount: 2000000,
    contractNumber: 'Д-2023-001'
  }
];

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [currentView, setCurrentView] = useState<'DASHBOARD' | 'ARCHITECTS' | 'DESIGNERS' | 'LINKS' | 'FINANCES' | 'PROJECT_CHECKS'>('DASHBOARD');
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | undefined>(undefined);
  const [status, setStatus] = useState<string>('Ожидание...');

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  const handleAddProject = async () => {
    try {
      setStatus('Отправка в Firebase...');
      const docRef = await addDoc(collection(db, "test_projects"), {
        name: "Тестовый проект " + new Date().toLocaleTimeString(),
        createdAt: new Date()
      });
      setStatus('Успешно! ID: ' + docRef.id);
    } catch (e) {
      setStatus('Ошибка: ' + (e as Error).message);
    }
  };

  const handleCreateProject = (projectData: Partial<Project>) => {
    const newProject = { ...projectData, id: Math.random().toString(36).substr(2, 9) } as Project;
    setProjects([...projects, newProject]);
    setIsProjectModalOpen(false);
  };

  const handleUpdateProject = (projectData: Partial<Project>) => {
    setProjects(projects.map(p => p.id === projectData.id ? { ...p, ...projectData } : p));
    setIsProjectModalOpen(false);
    setSelectedProject(undefined);
  };

  const handleDeleteProject = (id: string) => {
    setProjects(projects.filter(p => p.id !== id));
    setIsProjectModalOpen(false);
    setSelectedProject(undefined);
  };

  const handleCreateUser = (userData: Partial<User>) => {
    const newUser = { ...userData, id: Math.random().toString(36).substr(2, 9) } as User;
    setUsers([...users, newUser]);
    setIsUserModalOpen(false);
  };

  const handleUpdateUser = (userData: Partial<User>) => {
    setUsers(users.map(u => u.id === userData.id ? { ...u, ...userData } : u));
  };

  const handleDeleteUser = (id: string) => {
    setUsers(users.filter(u => u.id !== id));
  };

  const isAdmin = (user: User | null) => user?.role === UserRole.ADMIN;

  if (!currentUser) return <Login onLogin={handleLogin} users={users} />;

  if (currentUser.role === UserRole.CLIENT) {
    const clientProject = projects.find(p => p.clientPhone === currentUser.username);
    return <ClientView project={clientProject || null} currentUser={currentUser} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
      <aside className="w-full md:w-20 bg-white border-r border-gray-100 flex md:flex-col items-center justify-between p-4 sticky top-0 z-30 shadow-sm">
        <div className="flex md:flex-col gap-6 items-center">
          <button onClick={() => setCurrentView('DASHBOARD')} className="w-10 h-10 bg-brand-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-brand-100">
            <Layout size={20} />
          </button>
          <nav className="flex md:flex-col gap-4">
            <button onClick={() => setCurrentView('DASHBOARD')} title="Все проекты" className={`p-2 rounded-lg ${currentView === 'DASHBOARD' ? 'bg-brand-50 text-brand-600' : 'text-gray-400'}`}><Folder size={20} /></button>
            {isAdmin(currentUser) && (
              <>
                <button onClick={() => setCurrentView('ARCHITECTS')} className={`p-2 rounded-lg ${currentView === 'ARCHITECTS' ? 'bg-brand-50 text-brand-600' : 'text-gray-400'}`}><HardHat size={20} /></button>
                <button onClick={() => setCurrentView('DESIGNERS')} className={`p-2 rounded-lg ${currentView === 'DESIGNERS' ? 'bg-brand-50 text-brand-600' : 'text-gray-400'}`}><Smile size={20} /></button>
                <button onClick={() => setCurrentView('FINANCES')} className={`p-2 rounded-lg ${currentView === 'FINANCES' ? 'bg-brand-50 text-brand-600' : 'text-gray-400'}`}><Receipt size={20} /></button>
                <button onClick={() => setCurrentView('LINKS')} className={`p-2 rounded-lg ${currentView === 'LINKS' ? 'bg-brand-50 text-brand-600' : 'text-gray-400'}`}><List size={20} /></button>
              </>
            )}
          </nav>
        </div>
        <div className="flex md:flex-col gap-4 items-center">
          <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500 rounded-lg"><LogOut size={20} /></button>
          <div className="w-8 h-8 bg-brand-100 text-brand-700 rounded-full flex items-center justify-center font-medium text-xs border-2 border-white shadow-sm">
            {currentUser.fullName[0]}
          </div>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen">
        <div className="max-w-7xl mx-auto">
          {currentView === 'DASHBOARD' && (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Проекты студии</h1>
                  <p className="text-gray-500 mt-1">Добро пожаловать, {currentUser.fullName}</p>
                </div>
                {isAdmin(currentUser) && (
                  <div className="flex gap-3">
                    <button onClick={() => setIsUserModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg text-sm font-medium"><UserPlus size={18} /> Сотрудник</button>
                    <button onClick={() => { setSelectedProject(undefined); setIsProjectModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium shadow-md"><Plus size={18} /> Новый проект</button>
                  </div>
                )}
              </div>
              <GanttChart projects={projects} onProjectClick={(p) => { setSelectedProject(p); setIsProjectModalOpen(true); }} />
              <AllProjectsList projects={projects} />
            </div>
          )}

          {currentView === 'ARCHITECTS' && isAdmin(currentUser) && <ArchitectList users={users} _onUpdateUser={handleUpdateUser} _onDeleteUser={handleDeleteUser} />}
          {currentView === 'DESIGNERS' && isAdmin(currentUser) && <DesignerList users={users} _onUpdateUser={handleUpdateUser} _onDeleteUser={handleDeleteUser} />}
          {currentView === 'LINKS' && isAdmin(currentUser) && <ProjectLinksList projects={projects} />}
          {currentView === 'FINANCES' && isAdmin(currentUser) && <FinancialTable projects={projects} users={users} _onUpdateProject={handleUpdateProject} />}
        </div>

        {/* Тестовый блок Firebase */}
        <div style={{ position: 'fixed', bottom: 0, right: 0, padding: '10px', backgroundColor: 'yellow', border: '2px solid red', zIndex: 999 }}>
          <h3>TECT FIREBASE</h3>
          <button onClick={handleAddProject} style={{ padding: '5px', backgroundColor: 'red', color: 'white' }}>Добавить проект</button>
          <p>Статус: {status}</p>
        </div>
      </main>

      <ProjectModal isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} onSave={selectedProject ? handleUpdateProject : handleCreateProject} onDelete={handleDeleteProject} initialProject={selectedProject} currentUserRole={currentUser.role} users={users} />
      <UserModal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} onSave={handleCreateUser} />
    </div>
  );
};