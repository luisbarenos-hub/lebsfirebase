import { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';
import avisar from '../avisar';

export default function Perfil() {
  const [nombre, setNombre] = useState('');
  const [fecha, setFecha] = useState('');
  const [telefono, setTelefono] = useState('');
  const [stats, setStats] = useState({ ganados: 0, perdidos: 0 });
  const [cargando, setCargando] = useState(true);

  const uid = auth.currentUser.uid;
  const ref = doc(db, 'usuarios', uid);

  useEffect(() => {
    const traer = async () => {
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const d = snap.data();
        setNombre(d.nombre || '');
        setFecha(d.fecha || '');
        setTelefono(d.telefono || '');
        setStats({ ganados: d.ganados || 0, perdidos: d.perdidos || 0 });
      }
      setCargando(false);
    };
    traer();
  }, []);

  const guardar = async () => {
    try {
      await updateDoc(ref, { nombre, fecha, telefono });
      avisar('Listo', 'Datos actualizados en Firestore');
    } catch (error) {
      avisar('Error al actualizar', error.message);
    }
  };

  if (cargando) return <Text style={{ marginTop: 50, textAlign: 'center' }}>Cargando...</Text>;

  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>Mi perfil de Entrenador</Text>
      <Text style={styles.correo}>{auth.currentUser.email}</Text>
      <Text style={styles.record}>Victorias: {stats.ganados}  |  Derrotas: {stats.perdidos}</Text>

      <TextInput style={styles.input} placeholder="Nombre" value={nombre} onChangeText={setNombre} />
      <TextInput style={styles.input} placeholder="Fecha (AAAA-MM-DD)" value={fecha} onChangeText={setFecha} />
      <TextInput
        style={styles.input}
        placeholder="Teléfono"
        value={telefono}
        onChangeText={setTelefono}
        keyboardType="phone-pad"
      />
      <Button title="Guardar cambios" onPress={guardar} color="#dc2626" />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, padding: 20, backgroundColor: '#fff' },
  titulo: { fontSize: 20, fontWeight: 'bold', marginBottom: 4, color: '#0f172a' },
  correo: { color: '#64748b', marginBottom: 8 },
  record: { fontWeight: 'bold', color: '#16a34a', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 15, borderRadius: 10 },
});