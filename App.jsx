import React, {useEffect, useState, useRef} from 'react';
import {
  StyleSheet,
  View,
  Platform,
  PermissionsAndroid,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Text,
} from 'react-native';
import MapView, {Marker} from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';

export default function App() {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false); // Estado de conexão
  const [deliveryTime, setDeliveryTime] = useState(0); // Tempo estimado para terminar a corrida
  const mapRef = useRef(null);

  // Definir coordenadas para Mogi das Cruzes
  const mogiLocation = {
    latitude: -23.1857, // Latitude de Mogi das Cruzes
    longitude: -46.8978, // Longitude de Mogi das Cruzes
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  // Exemplo de lista de entregas com títulos
  const deliveryList = [
    {
      id: 1,
      latitude: -23.1885,
      longitude: -46.8975,
      title: 'Entrega #1 - Rua A',
      estimatedTime: 15,
    },
    {
      id: 2,
      latitude: -23.187,
      longitude: -46.899,
      title: 'Entrega #2 - Rua B',
      estimatedTime: 20,
    },
    {
      id: 3,
      latitude: -23.1895,
      longitude: -46.9,
      title: 'Entrega #3 - Rua C',
      estimatedTime: 25,
    },
    // Adicione mais entregas conforme necessário
  ];

  // Função para pegar a localização atual
  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        setLoading(false);
      },
      error => {
        Alert.alert(
          'Error',
          `Failed to get your location: ${error.message}` +
            ' Make sure your location is enabled.',
        );
        setLocation(mogiLocation); // Usar Mogi como fallback
        setLoading(false);
      },
    );
  };

  useEffect(() => {
    const requestLocationPermission = async () => {
      if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            getCurrentLocation();
          } else {
            Alert.alert(
              'Permission Denied',
              'Location permission is required to show your current location on the map.',
            );
            setLocation(mogiLocation); // Usar Mogi como fallback
            setLoading(false);
          }
        } catch (err) {
          console.warn(err);
          setLocation(mogiLocation); // Usar Mogi como fallback
          setLoading(false);
        }
      } else {
        getCurrentLocation();
      }
    };

    requestLocationPermission();
  }, []);

  const zoomToMarker = marker => {
    if (mapRef.current && marker) {
      mapRef.current.animateToRegion({
        latitude: marker.latitude,
        longitude: marker.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    }
  };

  // Função para formatar o tempo de entrega
  const formatTime = minutes => {
    const mins = minutes % 60;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${mins}m`;
  };

  const toggleConnection = () => {
    setIsConnected(prevState => !prevState);
    // Quando desconectar, você pode resetar o tempo de entrega ou qualquer outra lógica
    if (isConnected) {
      setDeliveryTime(0); // Resetando o tempo de entrega ao desconectar
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <>
          {/* Card de Tempo de Entrega (Topo) */}
          <View style={styles.cardTop}>
            <Text style={styles.cardTitle}>Tempo para Terminar a Corrida</Text>
            <Text style={styles.cardText}>
              {deliveryTime > 0
                ? formatTime(deliveryTime)
                : 'Nenhuma entrega em andamento'}
            </Text>
          </View>

          {/* Mapa */}
          <MapView
            ref={mapRef}
            style={styles.map}
            showsUserLocation={true}
            region={location}>
            {/* Render marcadores para a localização atual */}
            <Marker coordinate={location} title="Sua Localização" />

            {/* Renderar os marcadores das entregas */}
            {deliveryList.map(delivery => (
              <Marker
                key={delivery.id}
                coordinate={{
                  latitude: delivery.latitude,
                  longitude: delivery.longitude,
                }}
                title={delivery.title}
                description={`Entrega ${delivery.id}`}
                pinColor={'red'}
                onPress={() => zoomToMarker(delivery)}
              />
            ))}
          </MapView>

          {/* Card de Conectar/Desconectar (Rodapé) */}
          <View style={styles.cardBottom}>
            <TouchableOpacity
              style={[
                styles.button,
                {backgroundColor: isConnected ? 'red' : 'green'},
              ]}
              onPress={toggleConnection}>
              <Text style={styles.buttonText}>
                {isConnected ? 'Desconectar' : 'Conectar'}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end', // Posiciona os cards no topo e rodapé
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  cardTop: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 5,
    width: '80%',
    marginTop: 20,
    position: 'absolute',
    top: 0,
    zIndex: 1, // Garante que o card fique acima do mapa
  },
  cardBottom: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 5,
    width: '80%',
    marginBottom: 20,
    position: 'absolute',
    bottom: 0,
    zIndex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  cardText: {
    fontSize: 16,
  },
  button: {
    padding: 15,
    alignItems: 'center',
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
