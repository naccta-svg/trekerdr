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

// --- MOCK DATA ---
const INITIAL_USERS: User[] = [
  { id: '1', username: 'admin', password: '123456', role: UserRole.ADMIN, fullName: 'Super Admin' },
  // Architects
  // Designers
  // Clients
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
      mounting: '2023-11-15',
      electric: '2023-12-01',
      edit1: '2023-12-10',
      edit2: '2024-01-05',
      edit3: '2024-01-20'
    },
    links: { source: '', visuals: '', tor: '', pdf: '', dwg: '', hvac: '' },
    financials: { area: 100, costPerMeterStudio: 5000, costPerMeterArch: 2000, prepaymentDate: '', paymentDate: '' }
  }
];

type ViewState = 'DASHBOARD' | 'ARCHITECTS' | 'DESIGNERS' | 'LINKS' | 'FINANCES' | 'ALL_PROJECTS';

const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>('DASHBOARD');

  
// Client Direct Link simulation
  const [clientProject, setClientProject] = useState<Project | null>(null);

  // ОБЪЕДИНЕННЫЙ БЛОК ПРОВЕРКИ ССЫЛОК
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    // 1. Ссылка для клиента
    const projectId = params.get('project');
    if (projectId) {
      const p = projects.find(proj => proj.id === projectId);
      if (p) setClientProject(p);
    }

    // 2. Ссылка для автоматического входа (login_token)
    const loginToken = params.get('login_token');
    if (loginToken) {
      const user = users.find(u => u.id === loginToken);
      if (user) {
        setCurrentUser(user);
        window.history.replaceState({}, document.title, "/");
      }
    }
  }, [projects, users]); // Строка 75 теперь будет закрыта корректно

  // UI State
  
  // UI State
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loginError, setLoginError] = useState('');

  const handleLogin = (u: string, p: string) => {
    const user = users.find(usr => usr.username === u && usr.password === p);
    if (user) {
      setCurrentUser(user);
      setLoginError('');
      setCurrentView('DASHBOARD');
    } else {
      setLoginError('Неверный логин или пароль');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setSelectedProject(null);
    setIsProjectModalOpen(false);
    setCurrentView('DASHBOARD');
    setClientProject(null); // Reset client view if they logout (though client view usually doesn't have logout button if accessed via link)
  };

  const handleCreateProject = (newProject: Project) => {
    setProjects(prev => [...prev, newProject]);
  };

  const handleUpdateProject = (updatedProject: Project) => {
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
  };

  const handleDeleteProject = (projectId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот проект?')) {
        setProjects(prev => prev.filter(p => p.id !== projectId));
        setIsProjectModalOpen(false);
        setSelectedProject(null);
    }
  };

const handleCreateUser = async (newUser: any) => {
  try {
    // 1. Готовим данные так, чтобы логин точно попал в поле username
    const dataToSave = {
      fullName: newUser.fullName,
      role: newUser.role,
      password: newUser.password,
      username: newUser.login || newUser.username // это решит проблему с входом
    };

    // 2. Отправляем в Firebase
    const docRef = await addDoc(collection(db, "users"), dataToSave);
    
    // 3. Обновляем список на экране
    const userWithId = { ...dataToSave, id: docRef.id };
    setUsers(prev => [...prev, userWithId as User]);
    
    // 4. Закрываем форму
    setIsUserModalOpen(false);
    
    alert("Пользователь успешно создан в базе данных!");
  } catch (error) {
    console.error("Ошибка сохранения:", error);
    alert("Произошла ошибка при сохранении в Firebase.");
  }
};

  const handleUpdateUser = (updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

  const handleDeleteUser = (userId: string) => {
      if (window.confirm('Вы уверены, что хотите удалить этого пользователя?')) {
          setUsers(prev => prev.filter(u => u.id !== userId));
      }
  };

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
          setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
          setCurrentUser(updated);
      }
const fetchUsers = async () => {
        try {
            // Предполагаем, что коллекция пользователей называется "users"
            const querySnapshot = await getDocs(collection(db, "users")); 
            const userList = [];
            querySnapshot.forEach((doc) => {
                // Преобразование данных из Firestore в формат вашего приложения
                userList.push({ id: doc.id, ...doc.data() });
            });

            // Обновляем состояние (предполагая, что у вас есть setUsers)
            setUsers(userList); 
            console.log("Пользователи успешно загружены.");

        } catch (error) {
            console.error("Ошибка при загрузке пользователей:", error);
        }
    };

useEffect(() => {
  fetchUsers(); // Вызываем скачивание из Firebase
}, []); // [] — значит "выполнить один раз при старте"

useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    
    // Ссылка для клиента
    const projectId = params.get('project');
    if (projectId) {
      const p = projects.find(proj => proj.id === projectId);
      if (p) setClientProject(p);
    }

    // Ссылка для автоматического входа
    const loginToken = params.get('login_token');
    if (loginToken) {
      const user = users.find(u => u.id === loginToken);
      if (user) {
        setCurrentUser(user);
        window.history.replaceState({}, document.title, "/");
      }
    }
  }, [projects, users]);

  // Logic to filter projects
const getVisibleProjects = () => {
    if (!currentUser) return [];
    if (currentUser.role === UserRole.ADMIN) return projects;
    if (currentUser.role === UserRole.ARCHITECT) {
      return projects.filter(p => p.architectId === currentUser.id);
    }
    if (currentUser.role === UserRole.DESIGNER) {
      return projects.filter(p => p.designerId === currentUser.id);
    }
    return [];
  };

  const visibleProjects = getVisibleProjects();
  
  // Separate projects by stage
  const activeProjects = visibleProjects.filter(p => p.stage !== ProjectStage.QUEUE && p.stage !== ProjectStage.COMPLETED);
  const queueProjects = visibleProjects.filter(p => p.stage === ProjectStage.QUEUE);
  const completedProjects = visibleProjects.filter(p => p.stage === ProjectStage.COMPLETED);

  // If entering via link, show client view immediately
  if (clientProject) {
    return <ClientView project={clientProject} onUpdate={handleUpdateProject} />;
  }

  if (!currentUser) {
    return <Login onLogin={handleLogin} error={loginError} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-20 bg-white border-r border-gray-100 flex md:flex-col items-center justify-between p-4 sticky top-0 z-30 shadow-sm">
        <div className="flex md:flex-col gap-6 items-center">
          <button onClick={() => setCurrentView('DASHBOARD')} className="w-10 h-10 bg-brand-600 text-white rounded-xl flex items-center justify-center font-bold text-xl hover:bg-brand-700 transition-colors shadow-lg shadow-brand-100">
            <Layout size={20} />
          </button>
<div style={{ padding: '20px' }}>

    </div>
  );
          
          {currentUser.role === UserRole.ADMIN && (
            <>
              <button 
                onClick={() => setCurrentView('ALL_PROJECTS')}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all tooltip ${currentView === 'ALL_PROJECTS' ? 'bg-brand-50 text-brand-600' : 'text-gray-400 hover:text-brand-600 hover:bg-brand-50'}`}
                title="Все проекты (Список)"
              >
                <List size={24} />
              </button>

              <button 
                onClick={() => setCurrentView('ARCHITECTS')}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all tooltip ${currentView === 'ARCHITECTS' ? 'bg-brand-50 text-brand-600' : 'text-gray-400 hover:text-brand-600 hover:bg-brand-50'}`}
                title="Архитекторы"
              >
                <HardHat size={24} />
              </button>

              <button 
                onClick={() => setCurrentView('DESIGNERS')}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all tooltip ${currentView === 'DESIGNERS' ? 'bg-brand-50 text-brand-600' : 'text-gray-400 hover:text-brand-600 hover:bg-brand-50'}`}
                title="Дизайнеры"
              >
                <Folder size={24} />
              </button>

              <button 
                onClick={() => setCurrentView('LINKS')}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all tooltip ${currentView === 'LINKS' ? 'bg-brand-50 text-brand-600' : 'text-gray-400 hover:text-brand-600 hover:bg-brand-50'}`}
                title="Проекты и Ссылки"
              >
                <Smile size={24} />
              </button>

              <button 
                onClick={() => setCurrentView('FINANCES')}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all tooltip ${currentView === 'FINANCES' ? 'bg-yellow-50 text-yellow-600' : 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50'}`}
                title="Финансы"
              >
                <Receipt size={24} />
              </button>

               <button 
                onClick={() => setIsUserModalOpen(true)}
                className="w-10 h-10 text-brand-500 hover:text-brand-600 hover:bg-brand-50 rounded-xl flex items-center justify-center transition-all"
                title="Добавить пользователя"
              >
                <UserPlus size={24} />
              </button>
              
              <button 
                onClick={handleOpenCreateProject}
                className="w-10 h-10 text-brand-500 hover:text-brand-600 hover:bg-brand-50 rounded-xl flex items-center justify-center transition-all"
                title="Новый проект"
              >
                <Plus size={24} />
              </button>
            </>
          )}
        </div>

        <button 
          onClick={handleLogout}
          className="w-10 h-10 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl flex items-center justify-center transition-all"
          title="Выход"
        >
          <LogOut size={24} />
        </button>
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen">
        <header className="mb-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
             {/* Designer Logo in Header */}
             {currentUser.role === UserRole.DESIGNER && (
                <div className="relative group w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
                    {currentUser.photoUrl ? (
                        <img src={currentUser.photoUrl} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                        <UserIcon size={24} className="text-gray-400" />
                    )}
                    <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                        <Upload size={20} />
                        <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                    </label>
                </div>
             )}

             <div>
                <h1 className="text-3xl font-light text-gray-800 uppercase tracking-tight">
                {(currentUser.role === UserRole.ARCHITECT || currentUser.role === UserRole.DESIGNER) 
                    ? `Привет, ${currentUser.fullName || currentUser.username}` 
                    : 'Панель управления'
                }
                </h1>
                <p className="text-sm text-gray-400 mt-1 capitalize">
                {ROLE_TRANSLATIONS[currentUser.role]}
                </p>
             </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Architect Header Info */}
            {currentUser.role === UserRole.ARCHITECT && (
                <div className="text-right hidden md:block">
                    <p className="text-sm text-gray-600 font-medium">{currentUser.dob ? `Дата рождения: ${currentUser.dob}` : ''}</p>
                </div>
            )}
             
            {/* Top Right Exit Button */}
            <button 
              onClick={handleLogout}
              className="w-10 h-10 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl flex items-center justify-center transition-all md:hidden"
              title="Выход"
            >
              <LogOut size={24} />
            </button>
             <button 
              onClick={handleLogout}
              className="hidden md:flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all font-medium text-sm"
              title="Выход"
            >
              <LogOut size={16} /> Выйти
            </button>
          </div>
        </header>

        {currentView === 'DASHBOARD' && (
          <>
            {/* Architect Profile Block on Dashboard */}
            {currentUser.role === UserRole.ARCHITECT && (
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-6 items-center md:items-start">
                    <div className="w-32 h-32 flex-shrink-0">
                         {currentUser.photoUrl ? (
                             <img src={currentUser.photoUrl} alt="Me" className="w-full h-full object-cover rounded-2xl" />
                         ) : (
                             <div className="w-full h-full bg-gray-100 rounded-2xl flex items-center justify-center text-gray-300"><UserIcon size={40}/></div>
                         )}
                    </div>
                    <div className="flex-grow text-center md:text-left">
                        <h2 className="text-2xl font-bold mb-2">{currentUser.fullName}</h2>
                        <p className="text-gray-600 mb-4">{currentUser.bio || 'Биография не заполнена'}</p>
                        <div className="flex flex-col md:flex-row gap-4">
                          <div className="bg-yellow-50 p-4 rounded-xl inline-block text-left">
                              <p className="text-[10px] uppercase font-bold text-yellow-600 mb-1">Мои Реквизиты</p>
                              <p className="text-xs font-mono text-gray-700 whitespace-pre-wrap">{currentUser.paymentDetails || 'Не заполнены'}</p>
                          </div>
                          <div className="bg-yellow-50 p-4 rounded-xl inline-block text-left">
                              <p className="text-[10px] uppercase font-bold text-yellow-600 mb-1">Стоимость м2</p>
                              <p className="text-xs font-mono text-gray-700 whitespace-pre-wrap">{currentUser.costPerM2 || '—'}</p>
                          </div>
                        </div>
                    </div>
                </div>
            )}

            <GanttChart 
              title="Активные проекты"
              projects={activeProjects} 
              onProjectClick={handleProjectClick}
              users={users}
              currentUser={currentUser}
            />

             {/* Completed Projects for Architect, Admin, AND Designer */}
            {(currentUser.role === UserRole.ARCHITECT || currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.DESIGNER) && (
                 <GanttChart 
                    title="Завершенные проекты"
                    projects={completedProjects} 
                    onProjectClick={handleProjectClick}
                    users={users}
                    currentUser={currentUser}
                 />
            )}

            {(currentUser.role === UserRole.ADMIN) && (
              <>
                <GanttChart 
                  title="Проекты в очереди"
                  projects={queueProjects} 
                  onProjectClick={handleProjectClick}
                  users={users}
                  currentUser={currentUser}
                />

                <div className="mb-6">
                   {/* Display ALL Projects Checks for Admin as requested */}
                   <ProjectChecks projects={visibleProjects} users={users} role={UserRole.ADMIN} startIndex={150} />
                </div>
              </>
            )}

            {(currentUser.role === UserRole.ARCHITECT || currentUser.role === UserRole.DESIGNER) && (
               <ProjectChecks projects={visibleProjects} users={users} role={currentUser.role} />
            )}
          </>
        )}

        {currentView === 'ALL_PROJECTS' && isAdmin(currentUser) && (
          <AllProjectsList 
            projects={projects} 
            users={users} 
            onUpdateProject={handleUpdateProject}
            onProjectClick={handleProjectClick}
          />
        )}

        {currentView === 'ARCHITECTS' && isAdmin(currentUser) && (
          <ArchitectList users={users} onUpdateUser={handleUpdateUser} onDeleteUser={handleDeleteUser} />
        )}

        {currentView === 'DESIGNERS' && isAdmin(currentUser) && (
          <DesignerList users={users} onUpdateUser={handleUpdateUser} onDeleteUser={handleDeleteUser} />
        )}

        {currentView === 'LINKS' && isAdmin(currentUser) && (
          <ProjectLinksList projects={projects} />
        )}

        {currentView === 'FINANCES' && isAdmin(currentUser) && (
          <FinancialTable projects={projects} users={users} onUpdateProject={handleUpdateProject} />
        )}

      </main>

      {/* Modals */}
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
{/* Тестовый блок Firebase, который видно только админам */}
<div style={{ position: 'fixed', bottom: 0, right: 0, padding: '10px', backgroundColor: 'yellow', border: '2px solid red', zIndex: 999 }}>
        <h3>ТЕСТ FIREBASE</h3>
        <button onClick={handleAddProject} style={{ padding: '5px', backgroundColor: 'red', color: 'white' }}>
            Добавить тестовый проект
        </button>
        <p style={{ margin: '5px 0' }}>Статус: {status}</p>
</div>
    ); // Конец return
}; //

function isAdmin(user: User) {
  return user.role === UserRole.ADMIN;
}

export default App;