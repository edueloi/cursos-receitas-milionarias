import { User, UserRole } from '../types';

const API_URL = 'https://api.receitasmilionarias.com.br';

export const api = {
  login: async (email: string, senha: string) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
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
      const response = await fetch(`${API_URL}/api/users/me`, {
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
  }
};