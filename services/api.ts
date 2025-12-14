import { User, UserRole } from '../types';

const API_URL = 'https://api.receitasmilionarias.com.br';

export const api = {
  login: async (email: string, senha: string) => {
    try {
      const response = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, senha }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao fazer login');
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  getMe: async (token: string): Promise<User> => {
    try {
      const response = await fetch(`${API_URL}/users/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao buscar perfil');
      }

      // Map backend fields to frontend User interface
      // Backend Role: 1 = Admin, 6 = Affiliate
      const role = data.id_permissao === 1 ? UserRole.ADMIN : UserRole.AFFILIATE;

      return {
        id: data.id.toString(),
        name: `${data.nome} ${data.sobrenome}`,
        email: data.email,
        role: role,
        avatarUrl: data.foto_perfil_url ? `${API_URL}/${data.foto_perfil_url}` : undefined
      };
    } catch (error) {
      throw error;
    }
  },

  uploadMedia: async (file: File, userId: string, type: 'image' | 'video' | 'document'): Promise<string> => {
    const token = localStorage.getItem('rm_token') || sessionStorage.getItem('rm_token');
    if (!token) throw new Error("Usuário não autenticado");

    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);
    formData.append('type', type);

    try {
      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Note: Do NOT set Content-Type header manually for FormData, browser does it with boundary
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao fazer upload');
      }

      // Return the full URL provided by the backend
      return data.url; 
    } catch (error) {
      console.error("Upload Error:", error);
      throw error;
    }
  }
};