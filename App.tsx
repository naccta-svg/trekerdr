import React, { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { GanttChart } from './components/GanttChart';
import { ProjectModal } from './components/ProjectModal';
import { UserModal } from './components/UserModal';
import { FinancialTable } from './components/FinancialTable';
import { ArchitectList, DesignerList, ProjectLinksList, AllProjectsList } from './components/UserPages';
import { User, Project, UserRole, ProjectStage } from './types';
import { LogOut, UserPlus, Plus, HardHat, Folder, Smile, Receipt, Layout, List } from 'lucide-react';
import { db } from './firebaseConfig';
import { collection, addDoc, getDocs } from 'firebase/firestore';

const INITIAL_USERS: User[] = [
  { id: '1', username: 'admin', password: '123456', role: UserRole.ADMIN, fullName: 'Super Admin' },
];

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentView, setCurrentView] = useState<'DASHBOARD' | 'ARCHITECTS' | 'DESIGNERS' | 'LINKS' | 'FINANCES'>('DASHBOARD');
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | undefined>(undefined);
  const [status, setStatus] = useState<string>('Готов');

  // Загрузка данных
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed) setCurrentUser(parsed);
      } catch (e) {
        localStorage.removeItem('currentUser');
      }
    }

    const loadUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const firebaseUsers = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as User[];
        if (firebaseUsers.length > 0) {
          setUsers([...INITIAL_USERS, ...firebaseUsers]);
        }
      } catch (e) {
        console.error("Firebase load error", e);
      }
    };
    loadUsers();
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  const handleCreateUser = async (userData: Partial<User>) => {
    try {
      setStatus('Сохранение...');
      const docRef = await addDoc(collection(db, "users"), userData);
      const newUser = { id: docRef.id, ...userData } as User;
      setUsers(prev => [...prev, newUser]);
      setIsUserModalOpen(false);
      setStatus('Готов');
    } catch (e) {
      setStatus('Ошибка сохранения');
    }
  };

  const handleCreateProject = (p: Partial<Project>) => {
    const newProject = { ...p, id: Math.random().toString(36).substr(2, 9) } as Project;
    setProjects([...projects, newProject]);
    setIsProjectModalOpen(false);
  };

  const handleUpdateProject = (p: Partial<Project>) => {
    setProjects(projects.map(item => item.id === p.id ? { ...item, ...p } : item));
    setIsProjectModalOpen(false);
  };

  const isAdmin = (user: User | null) => user?.role === UserRole.ADMIN;

  if (!currentUser) {
    return <Login onLogin={handleLogin} users={users} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans text-gray-900">
      {/* Sidebar - Восстановлен полный функционал */}
      <aside className="w-full md:w-20 bg-white border-r border-gray-100 flex md:flex-col items-center justify-between p-4 sticky top-0 z-30 shadow-sm">
        <div className="flex md:flex-col gap-6 items-center">
          <button onClick={() => setCurrentView('DASHBOARD')} className="w-10 h-10 bg-brand-600 text-white rounded-xl flex items-center justify-center shadow-lg hover:bg-brand-700 transition-all">
            <Layout size={20} />
          </button>
          
          <nav className="flex md:flex-col gap-4">
            <button onClick={() => setCurrentView('DASHBOARD')} title="Проекты" className={`p-2 rounded-lg transition-colors ${currentView === 'DASHBOARD' ? 'bg-brand-50 text-brand-600' : 'text-gray-400 hover:bg-gray-50'}`}>
              <Folder size={20} />
            </button>
            {isAdmin(currentUser) && (
              <>
                <button onClick={() => setCurrentView('ARCHITECTS')} title="Архитекторы" className={`p-2 rounded-lg transition-colors ${currentView === 'ARCHITECTS' ? 'bg-brand-50 text-brand-600' : 'text-gray-400 hover:bg-gray-50'}`}>
                  <HardHat size={20} />
                </button>
                <button onClick={() => setCurrentView('DESIGNERS')} title="Дизайнеры" className={`p-2 rounded-lg transition-colors ${currentView === 'DESIGNERS' ? 'bg-brand-50 text-brand-600' : 'text-gray-400 hover:bg-gray-50'}`}>
                  <Smile size={20} />
                </button>
                <button onClick={() => setCurrentView('FINANCES')} title="Финансы" className={`p-2 rounded-lg transition-colors ${currentView === 'FINANCES' ? 'bg-brand-50 text-brand-600' : 'text-gray-400 hover:bg-gray-50'}`}>
                  <Receipt size={20} />
                </button>
                <button onClick={() => setCurrentView('LINKS')} title="Ссылки" className={`p-2 rounded-lg transition-colors ${currentView === 'LINKS' ? 'bg-brand-50 text-brand-600' : 'text-gray-400 hover:bg-gray-50'}`}>
                  <List size={20} />
                </button>
              </>
            )}
          </nav>
        </div>

        <button onClick={handleLogout} title="Выход" className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
          <LogOut size={20} />
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen">
        <div className="max-w-7xl mx-auto">
          {currentView === 'DASHBOARD' && (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Проекты студии</h1>
                  <p className="text-gray-500 mt-1 italic">Администратор: {currentUser.fullName}</p>
                </div>
                {isAdmin(currentUser) && (
                  <div className="flex gap-3">
                    <button onClick={() => setIsUserModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium shadow-sm">
                      <UserPlus size={18} />
                      Сотрудник
                    </button>
                    <button onClick={() => { setSelectedProject(undefined); setIsProjectModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-all font-medium shadow-md">
                      <Plus size={18} />
                      Новый проект
                    </button>
                  </div>
                )}
              </div>
              
              <GanttChart projects={projects} onProjectClick={(p) => { setSelectedProject(p); setIsProjectModalOpen(true); }} />
              <div className="mt-8">
                 <h2 className="text-xl font-semibold mb-4">Список всех объектов</h2>
                 <AllProjectsList projects={projects} />
              </div>
            </div>
          )}

          {currentView === 'ARCHITECTS' && <ArchitectList users={users} _onUpdateUser={() => {}} _onDeleteUser={() => {}} />}
          {currentView === 'DESIGNERS' && <DesignerList users={users} _onUpdateUser={() => {}} _onDeleteUser={() => {}} />}
          {currentView === 'FINANCES' && <FinancialTable projects={projects} users={users} _onUpdateProject={handleUpdateProject} />}
          {currentView === 'LINKS' && <ProjectLinksList projects={projects} />}
        </div>
      </main>

      {/* Modals */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSave={selectedProject ? handleUpdateProject : handleCreateProject}
        onDelete={() => {}}
        initialProject={selectedProject}
        currentUserRole={currentUser.role}
        users={users}
      />

      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        onSave={handleCreateUser}
      />

      {/* Индикатор статуса */}
      <div className="fixed bottom-4 right-4 bg-white border px-3 py-1 rounded-full shadow-sm text-[10px] text-gray-400 z-50">
        Система: {status}
      </div>
    </div>
  );
};

export default App;