import { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, Alert } from 'react-native';
import axios from 'axios';

const API = "http://192.168.1.13:7054/api/book";

export default function App() {
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState({ id: null, title: "", author: "", year: "" });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = () => {
    axios.get(API).then(res => setBooks(res.data)).catch(error => console.error("Error fetching books:", error));
  };

  const handleSubmit = () => {
    if (editingId) {
      axios.put(`${API}/${editingId}`, form).then(() => {
        setForm({ id: null, title: "", author: "", year: "" });
        setEditingId(null);
        fetchBooks();
      }).catch(error => console.error("Error updating book:", error));
    } else {
      const { id, ...postForm } = form;
      axios.post(API, postForm).then(() => {
        setForm({ id: null, title: "", author: "", year: "" });
        fetchBooks();
      }).catch(error => console.error("Error adding book:", error));
    }
  };

  const handleEdit = (book) => {
    setForm({ id: book.id, title: book.title, author: book.author, year: book.year.toString() });
    setEditingId(book.id);
  };

  const handleDelete = (id) => {
    Alert.alert(
      "Delete Book",
      "Are you sure you want to delete this book?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          onPress: () => {
            axios.delete(`${API}/${id}`).then(() => {
              fetchBooks();
            }).catch(error => console.error("Error deleting book:", error));
          }
        }
      ]
    );
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ marginTop: 30, fontSize: 24, fontWeight: 'bold' }}>{editingId ? "Edit Book" : "Add Book"}</Text>
      <TextInput
        style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10, paddingHorizontal: 10 }}
        placeholder="Title"
        value={form.title}
        onChangeText={t => setForm({ ...form, title: t })}
      />
      <TextInput
        style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10, paddingHorizontal: 10 }}
        placeholder="Author"
        value={form.author}
        onChangeText={t => setForm({ ...form, author: t })}
      />
      <TextInput
        style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10, paddingHorizontal: 10 }}
        placeholder="Year"
        value={form.year}
        keyboardType="numeric"
        onChangeText={t => setForm({ ...form, year: t })}
      />
      <Button title={editingId ? "Update Book" : "Add Book"} onPress={handleSubmit} />

      <Text style={{ marginTop: 30, fontSize: 20, fontWeight: 'bold' }}>My Books</Text>
      <FlatList
        data={books}
        keyExtractor={b => b.id.toString()}
        renderItem={({ item }) => (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
            <Text style={{ flex: 1 }}>{item.title} - {item.author} ({item.year})</Text>
            <Button title="Edit" onPress={() => handleEdit(item)} />
            <Button title="Delete" onPress={() => handleDelete(item.id)} color="red" />
          </View>
        )}
      />
    </View>
  );
}