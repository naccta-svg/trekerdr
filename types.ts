
export enum UserRole {
  ADMIN = 'ADMIN',
  ARCHITECT = 'ARCHITECT',
  DESIGNER = 'DESIGNER',
  CLIENT = 'CLIENT'
}

export const ROLE_TRANSLATIONS: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Администратор',
  [UserRole.ARCHITECT]: 'Архитектор',
  [UserRole.DESIGNER]: 'Дизайнер',
  [UserRole.CLIENT]: 'Заказчик',
};

export interface User {
  id: string;
  username: string;
  password?: string;
  role: UserRole;
  fullName?: string;
  photoUrl?: string; // For Architect photo or Designer logo
  bio?: string; // For Architect
  dob?: string; // Date of Birth
  paymentDetails?: string; // Bank details, Account number, etc.
  costPerM2?: string; // Cost per square meter
}

export enum ProjectStage {
  QUEUE = 'В очереди',
  START = 'Начало',
  MOUNTING = 'Монтаж',
  ELECTRICS = 'Электрика',
  EDITS_1 = 'Первый круг правок',
  EDITS_2 = 'Второй круг правок',
  EDITS_3 = 'Третий круг правок',
  FINISH = 'Финиш',
  COMPLETED = 'Завершено',
  WAITING = 'Ждет информации'
}

export interface ProjectDates {
  mounting: string;
  electric: string;
  edit1: string;
  edit2: string;
  edit3: string;
}

export interface ProjectLinks {
  source: string; // Исходные данные
  visuals: string; // Визуализации
  tor: string; // Техническое задание (URL - kept for backward compatibility if needed, but we use technicalTask text now)
  pdf: string; // PDF проекта
  dwg: string; // DWG проекта
  hvac: string; // ОВиК
}

export interface ProjectFinancials {
  area: number;
  costPerMeterStudio: number;
  costPerMeterArch: number;
  prepaymentDate: string;
  paymentDate: string;
  prepaymentArchitectId?: string; // Architect receiving prepayment
  paymentArchitectId?: string;    // Architect receiving rest payment
}

export interface Project {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  stage: ProjectStage;
  architectId: string; 
  designerId: string;  
  dates: ProjectDates;
  links: ProjectLinks;
  financials: ProjectFinancials;
  coverPhotoUrl?: string; // Cover photo for Client view
  technicalTask?: string; // New field for text content
  notes?: string; // Admin notes for the project
}

export const STAGE_COLORS: Record<ProjectStage, string> = {
  [ProjectStage.QUEUE]: 'bg-gray-100 text-gray-500 border border-gray-200',
  [ProjectStage.START]: 'bg-blue-50 text-blue-700',
  [ProjectStage.MOUNTING]: 'bg-yellow-100 text-yellow-700',
  [ProjectStage.ELECTRICS]: 'bg-orange-100 text-orange-700',
  [ProjectStage.EDITS_1]: 'bg-purple-100 text-purple-700',
  [ProjectStage.EDITS_2]: 'bg-purple-200 text-purple-800',
  [ProjectStage.EDITS_3]: 'bg-purple-300 text-purple-900',
  [ProjectStage.FINISH]: 'bg-teal-100 text-teal-700',
  [ProjectStage.COMPLETED]: 'bg-green-100 text-green-700',
  [ProjectStage.WAITING]: 'bg-red-50 text-red-600',
};
