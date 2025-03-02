import React, { createContext, useState, useEffect } from 'react';

export const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const getUserLocation = () => {
      if (navigator.geolocation) {
        setLoading(true);
        setError(null);
        
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy
            });
            setLoading(false);
          },
          (error) => {
            console.error('Erro ao obter localização:', error);
            setError({
              code: error.code,
              message: getLocationErrorMessage(error.code)
            });
            setLoading(false);
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 10000
          }
        );
      } else {
        setError({
          code: 0,
          message: 'Geolocalização não é suportada por este navegador.'
        });
        setLoading(false);
      }
    };
    
    getUserLocation();
    
    // Configurar monitoramento contínuo da localização
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
        setLoading(false);
        setError(null);
      },
      (error) => {
        console.error('Erro ao monitorar localização:', error);
        setError({
          code: error.code,
          message: getLocationErrorMessage(error.code)
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000
      }
    );
    
    // Limpar monitoramento ao desmontar
    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);
  
  // Função para obter mensagem de erro
  const getLocationErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 1:
        return 'Permissão de localização negada. Por favor, permita o acesso à sua localização para usar todas as funcionalidades do aplicativo.';
      case 2:
        return 'Localização indisponível no momento. Verifique se o GPS está ativado e tente novamente.';
      case 3:
        return 'Tempo esgotado ao obter localização. Tente novamente.';
      default:
        return 'Erro desconhecido ao obter localização.';
    }
  };
  
  // Função para solicitar localização novamente
  const refreshLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
          setLoading(false);
          setError(null);
        },
        (error) => {
          console.error('Erro ao obter localização:', error);
          setError({
            code: error.code,
            message: getLocationErrorMessage(error.code)
          });
          setLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0 // Sempre obter nova localização
        }
      );
    }
  };
  
  return (
    <LocationContext.Provider
      value={{
        userLocation,
        loading,
        error,
        refreshLocation
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};
