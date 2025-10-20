import { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, Alert } from 'react-native';
import axios from 'axios';
import Constants from 'expo-constants';
export const API_URL = Constants.expoConfig?.extra?.apiUrl;

export default function App() {
  const [Festivali, setFestivali] = useState([]);
  const [form, setForm] = useState({ id: null, naziv: "", lokacija: "" });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchFestivali();
  }, []);

  const fetchFestivali = () => {
    axios.get(API_URL).then(res => setFestivali(res.data)).catch(error => console.error("Error fetching Festivali:", error));
  };

  const handleSubmit = () => {
    if (editingId) {
      axios.put(`${API_URL}/${editingId}`, form).then(() => {
        setForm({ id: null, naziv: "", lokacija: ""});
        setEditingId(null);
        fetchFestivali();
      }).catch(error => console.error("Error updating festival:", error));
    } else {
      const { id, ...postForm } = form;
      axios.post(API_URL, postForm).then(() => {
        setForm({ id: null, naziv: "", lokacija: ""});
        fetchFestivali();
      }).catch(error => console.error("Error adding festival:", error));
    }
  };

  const handleEdit = (festival) => {
    setForm({ id: festival.id, naziv: festival.naziv, lokacija: festival.lokacija});
    setEditingId(festival.id);
  };

  const handleDelete = (id) => {
    Alert.alert(
      "Delete festival",
      "Are you sure you want to delete this festival?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          onPress: () => {
            axios.delete(`${API_URL}/${id}`).then(() => {
              fetchFestivali();
            }).catch(error => console.error("Error deleting festival:", error));
          }
        }
      ]
    );
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ marginTop: 30, fontSize: 24, fontWeight: 'bold' }}>{editingId ? "Edit festival" : "Add festival"}</Text>
      <TextInput
        style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10, paddingHorizontal: 10 }}
        placeholder="Naziv"
        value={form.naziv}
        onChangeText={t => setForm({ ...form, naziv: t })}
      />
      <TextInput
        style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10, paddingHorizontal: 10 }}
        placeholder="Lokacija"
        value={form.lokacija}
        onChangeText={t => setForm({ ...form, lokacija: t })}
      />
      <Button title={editingId ? "Update festival" : "Add festival"} onPress={handleSubmit} />

      <Text style={{ marginTop: 30, fontSize: 20, fontWeight: 'bold' }}>My Festivali</Text>
      <FlatList
        data={Festivali}
        keyExtractor={b => b.id.toString()}
        renderItem={({ item }) => (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
            <Text style={{ flex: 1 }}>{item.naziv} - {item.lokacija}</Text>
            <Button title="Edit" onPress={() => handleEdit(item)} />
            <Button title="Delete" onPress={() => handleDelete(item.id)} color="red" />
          </View>
        )}
      />
    </View>
  );
}