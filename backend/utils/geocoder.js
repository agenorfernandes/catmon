const axios = require('axios');

/**
 * Serviço de geocodificação para converter endereços em coordenadas
 * e vice-versa.
 */
const geocoder = {
  /**
   * Converte um endereço textual em coordenadas geográficas
   * @param {string} address - Endereço a ser geocodificado
   * @returns {Promise<Array>} - Array de resultados com informações de localização
   */
  geocode: async (address) => {
    try {
      // Usar API do OpenStreetMap/Nominatim para geocodificação
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: address,
          format: 'json',
          limit: 1
        },
        headers: {
          'User-Agent': 'KatMon App/1.0'
        }
      });
      
      if (!response.data || response.data.length === 0) {
        return null;
      }
      
      // Formatar resultado para o formato esperado
      return response.data.map(result => ({
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        formattedAddress: result.display_name,
        city: result.address?.city || result.address?.town,
        state: result.address?.state,
        country: result.address?.country,
        zipcode: result.address?.postcode
      }));
    } catch (error) {
      console.error('Erro ao geocodificar endereço:', error);
      throw error;
    }
  },
  
  /**
   * Converte coordenadas geográficas em um endereço textual (geocodificação reversa)
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @returns {Promise<Object>} - Objeto com informações do endereço
   */
  reverseGeocode: async (lat, lng) => {
    try {
      // Usar API do OpenStreetMap/Nominatim para geocodificação reversa
      const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
        params: {
          lat,
          lon: lng,
          format: 'json'
        },
        headers: {
          'User-Agent': 'KatMon App/1.0'
        }
      });
      
      if (!response.data) {
        return null;
      }
      
      // Formatar resultado
      return {
        formattedAddress: response.data.display_name,
        streetName: response.data.address?.road,
        city: response.data.address?.city || response.data.address?.town,
        state: response.data.address?.state,
        country: response.data.address?.country,
        zipcode: response.data.address?.postcode
      };
    } catch (error) {
      console.error('Erro na geocodificação reversa:', error);
      throw error;
    }
  }
};

module.exports = geocoder;
