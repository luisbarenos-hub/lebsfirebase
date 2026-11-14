import { useEffect, useState } from 'react';
import { FlatList, Text, View, Image, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { collection, addDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';
import avisar from '../avisar';

const IMG = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/';

export default function Home() {
  const [pokemones, setPokemones] = useState([]);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    const traer = async () => {
      const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1025');
      const json = await res.json();
      setPokemones(json.results.map((p) => ({ ...p, id: p.url.split('/')[6] })));
    };
    traer();
  }, []);

  const capturar = async (item) => {
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${item.id}`);
      const data = await res.json();
      await addDoc(collection(db, 'capturados'), {
        uid: auth.currentUser.uid,
        pokemonId: Number(item.id),
        nombre: item.name,
        imagen: `${IMG}${item.id}.png`,
        hp: data.stats[0].base_stat,
        attack: data.stats[1].base_stat,
        defense: data.stats[2].base_stat,
        fecha: new Date().toISOString(),
      });
      avisar('¡Capturado!', `${item.name.toUpperCase()} se guardó en tu equipo en Firestore.`);
    } catch (error) {
      avisar('Error al capturar', error.message);
    }
  };

  const filtrados = pokemones.filter(
    (p) => p.name.toLowerCase().includes(busqueda.trim().toLowerCase()) || p.id === busqueda.trim()
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <TextInput
        style={styles.buscador}
        placeholder="Buscar Pokémon por nombre o número..."
        value={busqueda}
        onChangeText={setBusqueda}
      />
      <FlatList
        data={filtrados}
        keyExtractor={(p) => p.id}
        numColumns={2}
        contentContainerStyle={{ padding: 8 }}
        renderItem={({ item }) => (
          <View style={styles.tarjeta}>
            <Image source={{ uri: `${IMG}${item.id}.png` }} style={styles.imagen} />
            <Text style={styles.nombre}>#{item.id} {item.name}</Text>
            <TouchableOpacity style={styles.boton} onPress={() => capturar(item)}>
              <Text style={styles.botonTexto}>+ Capturar</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  buscador: { backgroundColor: '#fff', margin: 10, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#cbd5e1' },
  tarjeta: { flex: 1, margin: 4, padding: 10, alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  imagen: { width: 95, height: 95, resizeMode: 'contain' },
  nombre: { fontWeight: 'bold', textTransform: 'capitalize', marginVertical: 4, color: '#0f172a' },
  boton: { backgroundColor: '#16a34a', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, marginTop: 4 },
  botonTexto: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
});