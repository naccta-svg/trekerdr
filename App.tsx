import React, { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { GanttChart } from './components/GanttChart';
import { ProjectModal } from './components/ProjectModal';
import { UserModal } from './components/UserModal';
import { FinancialTable } from './components/FinancialTable';
import { ArchitectList, DesignerList, ProjectLinksList, AllProjectsList } from './components/UserPages';
import { ClientView } from './components/ClientView';
import { ProjectChecks } from './components/ProjectChecks';
import { User, Project, UserRole, ProjectStage } from './types';
import { LogOut, UserPlus, Plus, HardHat, Folder, Smile, Receipt, Layout, List } from 'lucide-react';
import { db } from './firebaseConfig';
import { collection, addDoc, getDocs } from 'firebase/firestore';

// Начальные данные (чтобы сайт работал, даже если интернет пропал)
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
  const [status, setStatus] = useState<string>('Готов');

  // Загрузка данных
  useEffect(() => {
    // Восстанавливаем вход
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        try {
            setCurrentUser(JSON.parse(savedUser));
        } catch (e) {
            console.error("Ошибка парсинга юзера");
        }
    }

    // Загружаем людей из базы
    const fetchUsers = async () => {
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
        console.error("Firebase не доступен, работаем на локальных данных", e);
      }
    };
    fetchUsers();
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
      setStatus('Пользователь в базе!');
    } catch (e) {
      // Если база упала, всё равно добавим локально, чтобы работало
      const newUser = { id: Math.random().toString(), ...userData } as User;
      setUsers([...users, newUser]);
      setIsUserModalOpen(false);
      setStatus('Ошибка Firebase, сохранено локально');
    }
  };

  const handleAddProject = async () => {
    try {
      setStatus('Тест...');
      await addDoc(collection(db, "test_projects"), { date: new Date() });
      setStatus('Тест Firebase: ОК');
    } catch (e) {
      setStatus('Тест Firebase: ОШИБКА');
    }
  };

  const handleCreateProject = (p: Partial<Project>) => {
    setProjects([...projects, { ...p, id: Math.random().toString() } as Project]);
    setIsProjectModalOpen(false);
  };

  const handleUpdateProject = (p: Partial<Project>) => {
    setProjects(projects.map(item => item.id === p.id ? { ...item, ...p } : item));
    setIsProjectModalOpen(false);
  };

  const handleDeleteProject = (id: string) => {
    setProjects(projects.filter(p => p.id !== id));
    setIsProjectModalOpen(false);
  };

  const isAdmin = (user: User | null) => user?.role === UserRole.ADMIN;

  // Если не залогинен — показываем Login
  if (!currentUser) {
    return <Login onLogin={handleLogin} users={users} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
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
                <button onClick={() => setCurrentView('LINKS')} className={`p-2 rounded-lg ${currentView === 'LINKS' ? 'bg-brand-50 text-brand-600' : 'text-gray-400'}`}>
                  <List size={20} />
                </button>
              </>
            )}
          </nav>
        </div>
        <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
          <LogOut size={20} />
        </button>
      </aside>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {currentView === 'DASHBOARD' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Проекты студии</h1>
                {isAdmin(currentUser) && (
                  <div className="flex gap-2">
                    <button onClick={() => setIsUserModalOpen(true)} className="px-4 py-2 border rounded-lg flex items-center gap-2 bg-white"><UserPlus size={18}/> Юзер</button>
                    <button onClick={() => { setSelectedProject(undefined); setIsProjectModalOpen(true); }} className="px-4 py-2 bg-brand-600 text-white rounded-lg flex items-center gap-2"><Plus size={18}/> Проект</button>
                  </div>
                )}
              </div>
              <GanttChart projects={projects} onProjectClick={(p) => { setSelectedProject(p); setIsProjectModalOpen(true); }} />
              <AllProjectsList projects={projects} />
            </div>
          )}

          {currentView === 'ARCHITECTS' && <ArchitectList users={users} _onUpdateUser={() => {}} _onDeleteUser={() => {}} />}
          {currentView === 'DESIGNERS' && <DesignerList users={users} _onUpdateUser={() => {}} _onDeleteUser={() => {}} />}
          {currentView === 'FINANCES' && <FinancialTable projects={projects} users={users} _onUpdateProject={handleUpdateProject} />}
          {currentView === 'LINKS' && <ProjectLinksList projects={projects} />}
        </div>

        {/* Индикатор статуса */}
        <div style={{ position: 'fixed', bottom: 10, right: 10, padding: '10px', background: '#fff9c4', border: '1px solid #fbc02d', borderRadius: '8px', fontSize: '12px', zIndex: 1000 }}>
          <button onClick={handleAddProject} className="text-xs text-blue-600 underline mb-1 block">Тест связи</button>
          Статус: {status}
        </div>
      </main>

      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSave={selectedProject ? handleUpdateProject : handleCreateProject}
        onDelete={handleDeleteProject}
        initialProject={selectedProject}
        currentUserRole={currentUser.role}
        users={users}
      />

      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        onSave={handleCreateUser}
      />
    </div>
  );
};

export default App;