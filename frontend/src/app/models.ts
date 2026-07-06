export type UserRole = 'admin' | 'member';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
}

export interface ProjectMember {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  createdAt: string;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  ownerId: number;
  ownerName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  members?: ProjectMember[];
  cardCount: number;
}

export type CardStatus = 'backlog' | 'todo' | 'in_progress' | 'in_review' | 'done' | 'cancelled';

export interface Attachment {
  id: number;
  cardId: number;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedBy: number;
  createdAt: string;
}

export interface Comment {
  id: number;
  cardId: number;
  content: string;
  createdBy: number;
  createdAt: string;
  author?: User;
}

export interface Card {
  id: number;
  projectId: number;
  title: string;
  description: string;
  status: CardStatus;
  statusChangedAt?: string | null;
  assigneeId?: number | null;
  assigneeName: string;
  assignee?: User | null;
  justification?: string | null;
  createdById?: number | null;
  createdByName: string;
  createdBy?: User;
  createdAt: string;
  updatedAt: string;
  parentId?: number | null;
  isSubtask: boolean;
  subtasks?: Card[];
  comments?: Comment[];
  attachments?: Attachment[];
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface DashboardStatusCount {
  status: CardStatus;
  count: number;
}

export interface DashboardUserProductivity {
  userId: number;
  userName: string;
  inProgressCount: number;
  doneCount: number;
}

export interface DashboardSummary {
  from: string;
  to: string;
  statusCounts: DashboardStatusCount[];
  userProductivity: DashboardUserProductivity[];
}
