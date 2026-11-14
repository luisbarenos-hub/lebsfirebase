import { useState } from 'react';
import { Text, TextInput, Button, StyleSheet, ScrollView, View } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';
import avisar from '../avisar';

export default function Registro({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [fecha, setFecha] = useState('');
  const [telefono, setTelefono] = useState('');

  const registrar = async () => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, correo.trim(), contrasena);
      await setDoc(doc(db, 'usuarios', user.uid), {
        nombre,
        correo: correo.trim(),
        fecha,
        telefono,
        ganados: 0,
        perdidos: 0,
      });
    } catch (error) {
      avisar('Error al registrarse', error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.contenedor}>
      <Text style={styles.titulo}>Registro de Entrenador</Text>
      <TextInput style={styles.input} placeholder="Nombre" value={nombre} onChangeText={setNombre} />
      <TextInput
        style={styles.input}
        placeholder="Correo"
        value={correo}
        onChangeText={setCorreo}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña (mínimo 6)"
        value={contrasena}
        onChangeText={setContrasena}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Fecha de nacimiento (AAAA-MM-DD)"
        value={fecha}
        onChangeText={setFecha}
      />
      <TextInput
        style={styles.input}
        placeholder="Teléfono"
        value={telefono}
        onChangeText={setTelefono}
        keyboardType="phone-pad"
      />
      <Button title="Registrarme" onPress={registrar} color="#dc2626" />
      <View style={{ marginTop: 10 }}>
        <Button title="Ya tengo cuenta" onPress={() => navigation.navigate('Login')} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flexGrow: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  titulo: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#1e293b' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, marginBottom: 12, borderRadius: 6 },
});