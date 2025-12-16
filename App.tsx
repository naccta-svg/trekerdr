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

// Гарантированные данные для входа
const INITIAL_USERS: User[] = [
  { id: '1', username: 'admin', password: '123456', role: UserRole.ADMIN, fullName: 'Super Admin' },
];

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentView, setCurrentView] = useState<'DASHBOARD' | 'ARCHITECTS' | 'DESIGNERS' | 'LINKS' | 'FINANCES' | 'PROJECT_CHECKS'>('DASHBOARD');
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | undefined>(undefined);
  const [status, setStatus] = useState<string>('Готов');

  // Безопасная загрузка данных при старте
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed && parsed.username) setCurrentUser(parsed);
      } catch (e) {
        localStorage.removeItem('currentUser');
      }
    }

    const loadData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const firebaseUsers = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as User[];
        
        if (firebaseUsers.length > 0) {
          // Объединяем, проверяя на дубликаты по id
          setUsers(prev => {
            const combined = [...prev, ...firebaseUsers];
            return combined.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
          });
        }
      } catch (e) {
        console.error("Ошибка загрузки данных:", e);
        setStatus('Работа в офлайн режиме');
      }
    };
    loadData();
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
      setStatus('Успешно сохранено');
    } catch (e) {
      console.error(e);
      setStatus('Ошибка Firebase');
    }
  };

  const isAdmin = (user: User | null) => user?.role === UserRole.ADMIN;

  // Если сессия сбилась или юзер не найден — только Login
  if (!currentUser) {
    return <Login onLogin={handleLogin} users={users} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans text-gray-900">
      {/* Sidebar */}
      <aside className="w-full md:w-20 bg-white border-r border-gray-100 flex md:flex-col items-center justify-between p-4 sticky top-0 z-30 shadow-sm">
        <div className="flex md:flex-col gap-6 items-center">
          <button onClick={() => setCurrentView('DASHBOARD')} className="w-10 h-10 bg-brand-600 text-white rounded-xl flex items-center justify-center shadow-lg">
            <Layout size={20} />
          </button>
          <nav className="flex md:flex-col gap-4">
            <button onClick={() => setCurrentView('DASHBOARD')} className={`p-2 rounded-lg ${currentView === 'DASHBOARD' ? 'bg-brand-50 text-brand-600' : 'text-gray-400'}`}>
              <Folder size={20} />
            </button>
            {isAdmin(currentUser) && (
              <>
                <button onClick={() => setCurrentView('ARCHITECTS')} className={`p-2 rounded-lg ${currentView === 'ARCHITECTS' ? 'bg-brand-50 text-brand-600' : 'text-gray-400'}`}>
                  <HardHat size={20} />
                </button>
                <button onClick={() => setCurrentView('DESIGNERS')} className={`p-2 rounded-lg ${currentView === 'DESIGNERS' ? 'bg-brand-50 text-brand-600' : 'text-gray-400'}`}>
                  <Smile size={20} />
                </button>
                <button onClick={() => setCurrentView('FINANCES')} className={`p-2 rounded-lg ${currentView === 'FINANCES' ? 'bg-brand-50 text-brand-600' : 'text-gray-400'}`}>
                  <Receipt size={20} />
                </button>
              </>
            )}
          </nav>
        </div>
        <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
          <LogOut size={20} />
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto min-h-screen">
        <div className="max-w-7xl mx-auto">
          {currentView === 'DASHBOARD' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold">Панель управления</h1>
                  <p className="text-sm text-gray-500">Пользователь: {currentUser.fullName}</p>
                </div>
                {isAdmin(currentUser) && (
                  <div className="flex gap-2">
                    <button onClick={() => setIsUserModalOpen(true)} className="px-4 py-2 border rounded-lg bg-white flex items-center gap-2 text-sm font-medium">
                      <UserPlus size={18}/> Добавить сотрудника
                    </button>
                    <button onClick={() => setIsProjectModalOpen(true)} className="px-4 py-2 bg-brand-600 text-white rounded-lg flex items-center gap-2 text-sm font-medium">
                      <Plus size={18}/> Новый проект
                    </button>
                  </div>
                )}
              </div>
              <GanttChart projects={projects} onProjectClick={(p) => { setSelectedProject(p); setIsProjectModalOpen(true); }} />
              <AllProjectsList projects={projects} />
            </div>
          )}

          {currentView === 'ARCHITECTS' && <ArchitectList users={users} _onUpdateUser={() => {}} _onDeleteUser={() => {}} />}
          {currentView === 'DESIGNERS' && <DesignerList users={users} _onUpdateUser={() => {}} _onDeleteUser={() => {}} />}
          {currentView === 'FINANCES' && <FinancialTable projects={projects} users={users} _onUpdateProject={() => {}} />}
        </div>
      </main>

      {/* Модальные окна */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSave={() => setIsProjectModalOpen(false)}
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

      {/* Статус связи */}
      <div className="fixed bottom-4 right-4 px-3 py-1 bg-white border border-gray-200 rounded-full text-[10px] text-gray-400 shadow-sm z-50">
        Система: {status}
      </div>
    </div>
  );
};

export default App;