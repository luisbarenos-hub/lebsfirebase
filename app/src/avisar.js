import { Alert, Platform } from 'react-native';

export default function avisar(titulo, mensaje = '') {
  if (Platform.OS === 'web') window.alert(`${titulo}\n${mensaje}`);
  else Alert.alert(titulo, mensaje);
}