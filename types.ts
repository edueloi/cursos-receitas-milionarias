export enum UserRole {
  ADMIN = 'ADMIN', // Produtor/Dono
  AFFILIATE = 'AFFILIATE' // Afiliado (apenas assiste)
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface Affiliate {
  id: string;
  name: string;
  email: string;
  totalSales: number;
  commissionRate: number; // Percentage
  status: 'active' | 'pending' | 'blocked';
  joinDate: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  size: string;
  type: 'pdf' | 'archive' | 'image' | 'other';
}

export interface Lesson {
  id: string;
  title: string;
  duration: string; // e.g., "10:30"
  videoUrl?: string; 
  videoType?: 'upload' | 'embed';
  description?: string;
  isFreePreview?: boolean;
  attachments?: Attachment[];
  completed?: boolean;
}

export interface Module {
  id: string;
  title: string;
  description?: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  modules: Module[];
  totalDuration: string;
  progress?: number; // 0-100
  category?: string;
  level?: 'Iniciante' | 'Intermediário' | 'Avançado';
  status: 'draft' | 'published' | 'archived';
  price?: number;
  creatorEmail?: string; // New field for visibility logic
}