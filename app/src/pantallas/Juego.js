import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';
import avisar from '../avisar';

const IMG = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/';

export default function Juego() {
  const isFocused = useIsFocused();
  const [capturados, setCapturados] = useState([]);
  const [elegidoId, setElegidoId] = useState('');
  const [batalla, setBatalla] = useState(null);
  const [ganados, setGanados] = useState(0);
  const [perdidos, setPerdidos] = useState(0);
  const [peleando, setPeleando] = useState(false);

  const uid = auth.currentUser.uid;
  const refUsuario = doc(db, 'usuarios', uid);

  const cargarDatos = async () => {
    const snapUser = await getDoc(refUsuario);
    if (snapUser.exists()) {
      setGanados(snapUser.data().ganados || 0);
      setPerdidos(snapUser.data().perdidos || 0);
    }
    const q = query(collection(db, 'capturados'), where('uid', '==', uid));
    const snapCap = await getDocs(q);
    const lista = snapCap.docs.map((d) => ({ docId: d.id, ...d.data() }));
    setCapturados(lista);
    if (lista.length > 0 && !lista.some((x) => x.docId === elegidoId)) {
      setElegidoId(lista[0].docId);
    }
  };

  useEffect(() => {
    if (isFocused) cargarDatos();
  }, [isFocused]);

  const liberar = async (docId) => {
    await deleteDoc(doc(db, 'capturados', docId));
    cargarDatos();
  };

  const pelear = async () => {
    if (capturados.length === 0) {
      avisar('Sin equipo', 'Primero captura al menos un Pokémon en la pestaña Inicio.');
      return;
    }
    setPeleando(true);
    try {
      const mio = capturados.find((c) => c.docId === elegidoId) || capturados[0];
      const rivalId = Math.floor(Math.random() * 151) + 1;
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${rivalId}`);
      const data = await res.json();

      const poderMio = mio.hp + mio.attack * 1.4 + mio.defense;
      const poderRival = data.stats[0].base_stat + data.stats[1].base_stat * 1.4 + data.stats[2].base_stat;
      const gano = poderMio >= poderRival;

      await updateDoc(refUsuario, gano ? { ganados: increment(1) } : { perdidos: increment(1) });
      await addDoc(collection(db, 'batallas'), {
        uid,
        miPokemon: mio.nombre,
        rival: data.name,
        gano,
        fecha: new Date().toISOString(),
      });

      if (gano) setGanados((g) => g + 1);
      else setPerdidos((p) => p + 1);

      setBatalla({
        miNombre: mio.nombre,
        miImg: mio.imagen,
        miPoder: Math.round(poderMio),
        rivalNombre: data.name,
        rivalImg: `${IMG}${rivalId}.png`,
        rivalPoder: Math.round(poderRival),
        gano,
      });
    } catch (e) {
      avisar('Error en batalla', e.message);
    }
    setPeleando(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.contenedor}>
      <Text style={styles.titulo}>Arena de Batalla PokéNoSQL</Text>
      <Text style={styles.marcador}>Ganados: {ganados}  |  Perdidos: {perdidos}</Text>

      <Text style={styles.subtitulo}>1. Tu equipo guardado en Firestore ({capturados.length}):</Text>
      {capturados.length === 0 ? (
        <Text style={styles.vacio}>Ve a Inicio y captura Pokémon para combatir.</Text>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
          {capturados.map((c) => (
            <View key={c.docId} style={[styles.chipCard, elegidoId === c.docId && styles.chipActivo]}>
              <TouchableOpacity onPress={() => setElegidoId(c.docId)} style={{ alignItems: 'center' }}>
                <Image source={{ uri: c.imagen }} style={styles.miniImg} />
                <Text style={styles.chipTexto}>{c.nombre}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => liberar(c.docId)}>
                <Text style={styles.liberar}>Liberar</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      <TouchableOpacity style={styles.btnPelear} onPress={pelear} disabled={peleando}>
        <Text style={styles.btnTexto}>{peleando ? 'Buscando rival...' : '⚔️ ¡Iniciar Batalla!'}</Text>
      </TouchableOpacity>

      {peleando && <ActivityIndicator size="large" color="#dc2626" style={{ marginTop: 15 }} />}

      {batalla && (
        <View style={styles.resultadoBox}>
          <Text style={[styles.banner, { color: batalla.gano ? '#16a34a' : '#dc2626' }]}>
            {batalla.gano ? '¡VICTORIA!' : '¡DERROTA!'}
          </Text>
          <View style={styles.versus}>
            <View style={{ alignItems: 'center' }}>
              <Image source={{ uri: batalla.miImg }} style={styles.pokeImg} />
              <Text style={styles.pokeNombre}>{batalla.miNombre}</Text>
              <Text>Poder: {batalla.miPoder}</Text>
            </View>
            <Text style={styles.vs}>VS</Text>
            <View style={{ alignItems: 'center' }}>
              <Image source={{ uri: batalla.rivalImg }} style={styles.pokeImg} />
              <Text style={styles.pokeNombre}>{batalla.rivalNombre}</Text>
              <Text>Poder: {batalla.rivalPoder}</Text>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: { padding: 16, backgroundColor: '#f8fafc', flexGrow: 1 },
  titulo: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', color: '#0f172a' },
  marcador: { textAlign: 'center', fontWeight: 'bold', color: '#2563eb', marginVertical: 8 },
  subtitulo: { fontWeight: 'bold', marginTop: 10, marginBottom: 8, color: '#334155' },
  vacio: { color: '#64748b', fontStyle: 'italic', marginBottom: 14 },
  chipCard: { backgroundColor: '#fff', padding: 10, borderRadius: 10, marginRight: 10, alignItems: 'center', borderWidth: 2, borderColor: '#e2e8f0' },
  chipActivo: { borderColor: '#dc2626', backgroundColor: '#fef2f2' },
  miniImg: { width: 60, height: 60 },
  chipTexto: { fontWeight: 'bold', textTransform: 'capitalize', fontSize: 12 },
  liberar: { color: '#ef4444', fontSize: 11, marginTop: 4, fontWeight: '600' },
  btnPelear: { backgroundColor: '#dc2626', padding: 14, borderRadius: 10, alignItems: 'center' },
  btnTexto: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  resultadoBox: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginTop: 18, borderWidth: 1, borderColor: '#cbd5e1' },
  banner: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  versus: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  pokeImg: { width: 90, height: 90 },
  pokeNombre: { fontWeight: 'bold', textTransform: 'capitalize', marginTop: 4 },
  vs: { fontSize: 20, fontWeight: '900', color: '#dc2626' },
});