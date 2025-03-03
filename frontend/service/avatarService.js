// Array de avatares de gatos
const catAvatars = [
    {
      id: 1,
      url: '/assets/avatars/cat-avatar-1.png',
      name: 'Gato laranja com óculos'
    },
    {
      id: 2,
      url: '/assets/avatars/cat-avatar-2.png',
      name: 'Gato preto com gravata'
    },
    {
      id: 3,
      url: '/assets/avatars/cat-avatar-3.png',
      name: 'Gato listrado com capacete'
    },
    {
      id: 4,
      url: '/assets/avatars/cat-avatar-4.png',
      name: 'Gato siamês com chapéu'
    },
    {
      id: 5,
      url: '/assets/avatars/cat-avatar-5.png',
      name: 'Gato branco com bandana'
    },
    {
      id: 6,
      url: '/assets/avatars/cat-avatar-6.png',
      name: 'Gato cinza dormindo'
    },
    {
      id: 7,
      url: '/assets/avatars/cat-avatar-7.png',
      name: 'Gato persa com coroa'
    },
    {
      id: 8,
      url: '/assets/avatars/cat-avatar-8.png',
      name: 'Gato rajado com lenço'
    },
    {
      id: 9,
      url: '/assets/avatars/cat-avatar-9.png',
      name: 'Gato tricolor com boné'
    },
    {
      id: 10,
      url: '/assets/avatars/cat-avatar-10.png',
      name: 'Gato peludo com óculos de sol'
    }
  ];
  
  /**
   * Retorna um avatar aleatório da coleção
   * @returns {Object} avatar contendo id, url e name
   */
  export const getRandomAvatar = () => {
    const randomIndex = Math.floor(Math.random() * catAvatars.length);
    return catAvatars[randomIndex];
  };
  
  /**
   * Retorna um avatar específico pelo ID
   * @param {number} id ID do avatar
   * @returns {Object|null} avatar ou null se não encontrado
   */
  export const getAvatarById = (id) => {
    return catAvatars.find(avatar => avatar.id === id) || null;
  };
  
  /**
   * Retorna todos os avatares disponíveis
   * @returns {Array} lista de todos os avatares
   */
  export const getAllAvatars = () => {
    return [...catAvatars];
  }; 
  
  export default {
    getRandomAvatar,
    getAvatarById,
    getAllAvatars
  };