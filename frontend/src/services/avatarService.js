import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '';

// Lista de avatares disponíveis
const defaultAvatars = [
  {
    id: 'cat1',
    url: '/assets/avatars/cat1.png',
    name: 'Gato Laranja'
  },
  {
    id: 'cat2',
    url: '/assets/avatars/cat2.png',
    name: 'Gato Preto'
  },
  {
    id: 'cat3',
    url: '/assets/avatars/cat3.png',
    name: 'Gato Malhado'
  },
  {
    id: 'cat4',
    url: '/assets/avatars/cat4.png',
    name: 'Gato Siamês'
  }
];

// Obter lista de avatares disponíveis
export const getAvailableAvatars = async () => {
  try {
    // Primeiro tenta buscar do backend
    const response = await axios.get(`${API_URL}/api/avatars`);
    return response.data;
  } catch (error) {
    // Se falhar, retorna lista padrão
    console.log('Usando lista padrão de avatares');
    return defaultAvatars;
  }
};

// Atualizar avatar do usuário
export const updateUserAvatar = async (avatarId) => {
  const token = localStorage.getItem('token');
  
  const response = await axios.put(
    `${API_URL}/api/users/profile/avatar`,
    { avatarId },
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }
  );
  
  return response.data;
};

export default {
  getAvailableAvatars,
  updateUserAvatar
};
