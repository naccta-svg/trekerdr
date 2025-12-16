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
// Импорт Firebase
import { db } from './firebaseConfig';
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc, onSnapshot } from 'firebase/firestore';

const INITIAL_USERS: User[] = [
  { id: '1', username: 'admin', password: '123456', role: UserRole.ADMIN, fullName: 'Super Admin' },
];

type ViewState = 'DASHBOARD' | 'ARCHITECTS' | 'DESIGNERS' | 'LINKS' | 'FINANCES' | 'ALL_PROJECTS';

const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>('DASHBOARD');
  const [clientProject, setClientProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. Загрузка данных из Firebase при старте
  useEffect(() => {
    // Слушатель пользователей
    const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      const fbUsers = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as User[];
      setUsers([...INITIAL_USERS, ...fbUsers]);
    });

    // Слушатель проектов
    const unsubProjects = onSnapshot(collection(db, "projects"), (snapshot) => {
      const fbProjects = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Project[];
      setProjects(fbProjects);
      setLoading(false);
    });

    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) setCurrentUser(JSON.parse(savedUser));

    return () => { unsubUsers(); unsubProjects(); };
  }, []);

  // Обработка параметров URL (Client View)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get('project');
    if (projectId && projects.length > 0) {
      const p = projects.find(proj => proj.id === projectId);
      if (p) setClientProject(p);
    }
  }, [projects]);
  
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loginError, setLoginError] = useState('');

  const handleLogin = (u: string, p: string) => {
    const user = users.find(usr => usr.username === u && usr.password === p);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      setLoginError('');
      setCurrentView('DASHBOARD');
    } else {
      setLoginError('Неверный логин или пароль');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    setSelectedProject(null);
    setIsProjectModalOpen(false);
    setCurrentView('DASHBOARD');
    setClientProject(null);
  };

  // --- ФУНКЦИИ FIREBASE (Вместо локальных) ---

  const handleCreateProject = async (newProject: Project) => {
    try {
      await addDoc(collection(db, "projects"), newProject);
    } catch (e) { console.error("Error adding project: ", e); }
  };

  const handleUpdateProject = async (updatedProject: Project) => {
    try {
      const projectRef = doc(db, "projects", updatedProject.id);
      await updateDoc(projectRef, { ...updatedProject });
    } catch (e) { console.error("Error updating project: ", e); }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот проект?')) {
      try {
        await deleteDoc(doc(db, "projects", projectId));
        setIsProjectModalOpen(false);
        setSelectedProject(null);
      } catch (e) { console.error(e); }
    }
  };

  const handleCreateUser = async (newUser: Omit<User, 'id'>) => {
    try {
      await addDoc(collection(db, "users"), newUser);
    } catch (e) { console.error(e); }
  };

  const handleUpdateUser = async (updatedUser: User) => {
    try {
      const userRef = doc(db, "users", updatedUser.id);
      await updateDoc(userRef, { ...updatedUser });
    } catch (e) { console.error(e); }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этого пользователя?')) {
      try {
        await deleteDoc(doc(db, "users", userId));
      } catch (e) { console.error(e); }
    }
  };

  // --- ОСТАЛЬНАЯ ВАША ЛОГИКА БЕЗ ИЗМЕНЕНИЙ ---

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setIsProjectModalOpen(true);
  };

  const handleOpenCreateProject = () => {
    setSelectedProject(null);
    setIsProjectModalOpen(true);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (currentUser && e.target.files && e.target.files[0]) {
          const url = URL.createObjectURL(e.target.files[0]);
          const updated = { ...currentUser, photoUrl: url };
          handleUpdateUser(updated);
          setCurrentUser(updated);
      }
  };

  const getVisibleProjects = () => {
    if (!currentUser) return [];
    if (currentUser.role === UserRole.ADMIN) return projects;
    if (currentUser.role === UserRole.ARCHITECT) return projects.filter(p => p.architectId === currentUser.id);
    if (currentUser.role === UserRole.DESIGNER) return projects.filter(p => p.designerId === currentUser.id);
    return [];
  };

  const visibleProjects = getVisibleProjects();
  const activeProjects = visibleProjects.filter(p => p.stage !== ProjectStage.QUEUE && p.stage !== ProjectStage.COMPLETED);
  const queueProjects = visibleProjects.filter(p => p.stage === ProjectStage.QUEUE);
  const completedProjects = visibleProjects.filter(p => p.stage === ProjectStage.COMPLETED);

  if (clientProject) return <ClientView project={clientProject} onUpdate={handleUpdateProject} />;
  if (!currentUser) return <Login onLogin={handleLogin} error={loginError} />;
  if (loading) return <div className="min-h-screen flex items-center justify-center">Загрузка данных...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
      <aside className="w-full md:w-20 bg-white border-r border-gray-100 flex md:flex-col items-center justify-between p-4 sticky top-0 z-30 shadow-sm">
        <div className="flex md:flex-col gap-6 items-center">
          <button onClick={() => setCurrentView('DASHBOARD')} className="w-10 h-10 bg-brand-600 text-white rounded-xl flex items-center justify-center font-bold text-xl hover:bg-brand-700 transition-colors shadow-lg shadow-brand-100">
            <Layout size={20} />
          </button>
          
          {currentUser.role === UserRole.ADMIN && (
            <>
              <button onClick={() => setCurrentView('ALL_PROJECTS')} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${currentView === 'ALL_PROJECTS' ? 'bg-brand-50 text-brand-600' : 'text-gray-400 hover:bg-brand-50'}`} title="Все проекты"><List size={24} /></button>
              <button onClick={() => setCurrentView('ARCHITECTS')} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${currentView === 'ARCHITECTS' ? 'bg-brand-50 text-brand-600' : 'text-gray-400 hover:bg-brand-50'}`} title="Архитекторы"><HardHat size={24} /></button>
              <button onClick={() => setCurrentView('DESIGNERS')} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${currentView === 'DESIGNERS' ? 'bg-brand-50 text-brand-600' : 'text-gray-400 hover:bg-brand-50'}`} title="Дизайнеры"><Folder size={24} /></button>
              <button onClick={() => setCurrentView('LINKS')} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${currentView === 'LINKS' ? 'bg-brand-50 text-brand-600' : 'text-gray-400 hover:bg-brand-50'}`} title="Проекты и Ссылки"><Smile size={24} /></button>
              <button onClick={() => setCurrentView('FINANCES')} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${currentView === 'FINANCES' ? 'bg-yellow-50 text-yellow-600' : 'text-gray-400 hover:bg-yellow-50'}`} title="Финансы"><Receipt size={24} /></button>
              <button onClick={() => setIsUserModalOpen(true)} className="w-10 h-10 text-brand-500 hover:bg-brand-50 rounded-xl flex items-center justify-center transition-all" title="Добавить пользователя"><UserPlus size={24} /></button>
              <button onClick={handleOpenCreateProject} className="w-10 h-10 text-brand-500 hover:bg-brand-50 rounded-xl flex items-center justify-center transition-all" title="Новый проект"><Plus size={24} /></button>
            </>
          )}
        </div>
        <button onClick={handleLogout} className="w-10 h-10 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl flex items-center justify-center transition-all" title="Выход"><LogOut size={24} /></button>
      </aside>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen">
        <header className="mb-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
             {currentUser.role === UserRole.DESIGNER && (
                <div className="relative group w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
                    {currentUser.photoUrl ? <img src={currentUser.photoUrl} alt="Logo" className="w-full h-full object-cover" /> : <UserIcon size={24} className="text-gray-400" />}
                    <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                        <Upload size={20} /><input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                    </label>
                </div>
             )}
             <div>
                <h1 className="text-3xl font-light text-gray-800 uppercase tracking-tight">
                {(currentUser.role === UserRole.ARCHITECT || currentUser.role === UserRole.DESIGNER) ? `Привет, ${currentUser.fullName || currentUser.username}` : 'Панель управления'}
                </h1>
                <p className="text-sm text-gray-400 mt-1 capitalize">{ROLE_TRANSLATIONS[currentUser.role]}</p>
             </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all font-medium text-sm"><LogOut size={16} /> Выйти</button>
          </div>
        </header>

        {currentView === 'DASHBOARD' && (
          <>
            {currentUser.role === UserRole.ARCHITECT && (
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-6 items-center md:items-start">
                    <div className="w-32 h-32 flex-shrink-0">
                         {currentUser.photoUrl ? <img src={currentUser.photoUrl} alt="Me" className="w-full h-full object-cover rounded-2xl" /> : <div className="w-full h-full bg-gray-100 rounded-2xl flex items-center justify-center text-gray-300"><UserIcon size={40}/></div>}
                    </div>
                    <div className="flex-grow text-center md:text-left">
                        <h2 className="text-2xl font-bold mb-2">{currentUser.fullName}</h2>
                        <p className="text-gray-600 mb-4">{currentUser.bio || 'Биография не заполнена'}</p>
                        <div className="flex flex-col md:flex-row gap-4">
                          <div className="bg-yellow-50 p-4 rounded-xl inline-block text-left"><p className="text-[10px] uppercase font-bold text-yellow-600 mb-1">Мои Реквизиты</p><p className="text-xs font-mono text-gray-700 whitespace-pre-wrap">{currentUser.paymentDetails || 'Не заполнены'}</p></div>
                          <div className="bg-yellow-50 p-4 rounded-xl inline-block text-left"><p className="text-[10px] uppercase font-bold text-yellow-600 mb-1">Стоимость м2</p><p className="text-xs font-mono text-gray-700 whitespace-pre-wrap">{currentUser.costPerM2 || '—'}</p></div>
                        </div>
                    </div>
                </div>
            )}
            <GanttChart title="Активные проекты" projects={activeProjects} onProjectClick={handleProjectClick} users={users} currentUser={currentUser} />
            {(currentUser.role === UserRole.ARCHITECT || currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.DESIGNER) && (
                 <GanttChart title="Завершенные проекты" projects={completedProjects} onProjectClick={handleProjectClick} users={users} currentUser={currentUser} />
            )}
            {(currentUser.role === UserRole.ADMIN) && (
              <><GanttChart title="Проекты в очереди" projects={queueProjects} onProjectClick={handleProjectClick} users={users} currentUser={currentUser} /><div className="mb-6"><ProjectChecks projects={visibleProjects} users={users} role={UserRole.ADMIN} startIndex={150} /></div></>
            )}
            {(currentUser.role === UserRole.ARCHITECT || currentUser.role === UserRole.DESIGNER) && <ProjectChecks projects={visibleProjects} users={users} role={currentUser.role} />}
          </>
        )}

        {currentView === 'ALL_PROJECTS' && isAdmin(currentUser) && <AllProjectsList projects={projects} users={users} onUpdateProject={handleUpdateProject} onProjectClick={handleProjectClick} />}
        {currentView === 'ARCHITECTS' && isAdmin(currentUser) && <ArchitectList users={users} onUpdateUser={handleUpdateUser} onDeleteUser={handleDeleteUser} />}
        {currentView === 'DESIGNERS' && isAdmin(currentUser) && <DesignerList users={users} onUpdateUser={handleUpdateUser} onDeleteUser={handleDeleteUser} />}
        {currentView === 'LINKS' && isAdmin(currentUser) && <ProjectLinksList projects={projects} />}
        {currentView === 'FINANCES' && isAdmin(currentUser) && <FinancialTable projects={projects} users={users} onUpdateProject={handleUpdateProject} />}
      </main>

      <ProjectModal isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} onSave={selectedProject ? handleUpdateProject : handleCreateProject} onDelete={handleDeleteProject} initialProject={selectedProject || undefined} currentUserRole={currentUser.role} users={users} />
      <UserModal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} onSave={handleCreateUser} />
    </div>
  );
};

function isAdmin(user: User) { return user.role === UserRole.ADMIN; }

export default App;