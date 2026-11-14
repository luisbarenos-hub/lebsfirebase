import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/config';

import Login from './src/pantallas/Login';
import Registro from './src/pantallas/Registro';
import Home from './src/pantallas/Home';
import Juego from './src/pantallas/Juego';
import Perfil from './src/pantallas/Perfil';
import Salir from './src/pantallas/Salir';

const Tab = createBottomTabNavigator();

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const dejarDeEscuchar = onAuthStateChanged(auth, (user) => {
      setUsuario(user);
      setCargando(false);
    });
    return dejarDeEscuchar;
  }, []);

  if (cargando) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#dc2626" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={{ tabBarActiveTintColor: '#dc2626' }}>
        {usuario ? (
          <>
            <Tab.Screen name="Inicio" component={Home} />
            <Tab.Screen name="Juego" component={Juego} />
            <Tab.Screen name="Perfil" component={Perfil} />
            <Tab.Screen name="Salir" component={Salir} />
          </>
        ) : (
          <>
            <Tab.Screen name="Login" component={Login} />
            <Tab.Screen name="Registro" component={Registro} />
          </>
        )}
      </Tab.Navigator>
    </NavigationContainer>
  );
}