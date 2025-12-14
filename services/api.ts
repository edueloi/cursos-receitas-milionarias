import { User, UserRole, Course, Module, Lesson, Attachment } from '../types';

const API_URL = 'https://api.receitasmilionarias.com.br';
const COURSE_API_URL = 'https://cursos-api.receitasmilionarias.com.br';

export const api = {
  // --- Auth & User (Existing) ---
  login: async (email: string, senha: string) => {
    try {
      const response = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Erro ao fazer login');
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
      if (!response.ok) throw new Error(data.message || 'Erro ao buscar perfil');
      
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

  // --- Course Management (New Backend) ---

  // List all courses
  getCourses: async (): Promise<Course[]> => {
    try {
      const response = await fetch(`${COURSE_API_URL}/cursos`);
      const data = await response.json();
      
      // Map Backend (Portuguese) to Frontend (Typescript Interface)
      return (data.cursos || []).map((c: any) => ({
        id: c.id,
        title: c.titulo,
        description: c.descricao,
        thumbnailUrl: c.imagemCapa ? `${COURSE_API_URL}/videos/${c.imagemCapa}` : '',
        category: c.categoria,
        level: c.nivel,
        price: c.preco,
        status: c.rascunho ? 'draft' : 'published',
        totalDuration: '0h 0m', // Calculate based on modules if needed
        progress: 0, // Logic for user progress would be separate
        modules: (c.modulos || []).map((m: any, mIdx: number) => ({
          id: `mod-${mIdx}`,
          title: m.titulo,
          lessons: (m.conteudos || []).map((l: any, lIdx: number) => ({
             id: `les-${mIdx}-${lIdx}`,
             title: l.tituloAula,
             duration: l.duracao,
             videoType: l.video?.filename ? 'upload' : 'embed',
             videoUrl: l.video?.filename ? `${COURSE_API_URL}/videos/${l.video.filename}` : (l.video?.url || ''),
             isFreePreview: l.gratuita,
             attachments: (l.materiais || []).map((mat: any, matIdx: number) => ({
                id: `att-${matIdx}`,
                name: mat.originalname || mat.filename,
                url: `${COURSE_API_URL}/materiais/${mat.filename}`,
                type: 'pdf',
                size: 'Unknown'
             }))
          }))
        }))
      }));
    } catch (error) {
      console.error("Erro ao buscar cursos:", error);
      return [];
    }
  },

  // Create/Upload Course (Multipart)
  createCourse: async (course: Course, files: { [key: string]: File }, user: User): Promise<any> => {
    const formData = new FormData();

    // 1. Basic Fields
    if (course.id) formData.append('id', course.id); // Send ID if editing
    formData.append('email', user.email);
    formData.append('titulo', course.title);
    formData.append('descricao', course.description);
    formData.append('categoria', course.category || 'Geral');
    formData.append('nivel', course.level || 'Iniciante');
    formData.append('preco', String(course.price || 0));
    formData.append('rascunho', String(course.status === 'draft'));

    // 2. Cover Image
    if (files['cover']) {
      formData.append('imagemCapa', files['cover']);
    }

    // 3. Map Modules & Files
    // The backend expects a specific JSON structure for modules where filenames match uploaded files
    const backendModules = course.modules.map(mod => ({
      titulo: mod.title,
      conteudos: mod.lessons.map(lesson => {
        // Handle Video File
        let videoData = {};
        const videoFile = files[`video_${lesson.id}`];
        
        if (videoFile) {
          // Append to formData (multer handles array)
          formData.append('videos', videoFile);
          // Backend reference by filename
          videoData = { filename: videoFile.name };
        } else if (lesson.videoUrl && lesson.videoType === 'embed') {
          videoData = { url: lesson.videoUrl };
        } else if (lesson.videoUrl && lesson.videoType === 'upload') {
            // Case where it's an existing file from edit mode (not fully implemented in this create flow)
            // Extract filename from URL if possible
            const parts = lesson.videoUrl.split('/');
            videoData = { filename: parts[parts.length - 1] };
        }

        // Handle Attachments
        const materiaisData = (lesson.attachments || []).map(att => {
           const attFile = files[`attachment_${att.id}`];
           if (attFile) {
             formData.append('materiais', attFile);
             return { filename: attFile.name, originalname: attFile.name };
           }
           // Existing attachment
           return { filename: att.name }; // Simplified
        });

        return {
          tituloAula: lesson.title,
          duracao: lesson.duration,
          gratuita: lesson.isFreePreview,
          video: videoData,
          materiais: materiaisData
        };
      })
    }));

    formData.append('modulos', JSON.stringify(backendModules));

    // 4. Send Request
    try {
      const response = await fetch(`${COURSE_API_URL}/upload-curso`, {
        method: 'POST',
        body: formData, // No Content-Type header (browser sets boundary)
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erro ao criar curso');
      return data;
    } catch (error) {
      console.error("Create Course Error:", error);
      throw error;
    }
  },

  deleteCourse: async (id: string): Promise<void> => {
     await fetch(`${COURSE_API_URL}/cursos/${id}`, { method: 'DELETE' });
  },

  // Helper for single file upload (kept for other uses if needed, but CreateCourse uses bulk)
  uploadMedia: async (file: File, userId: string, type: 'image' | 'video' | 'document'): Promise<string> => {
    // Legacy support or direct upload if needed
    return URL.createObjectURL(file); 
  }
};