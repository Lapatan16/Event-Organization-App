import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, Button, FlatList, TouchableOpacity, Alert, SafeAreaView
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';


const API_URL = 'http://192.168.1.103:5285/api';

const Stack = createStackNavigator();


function StudentList({ navigation }) {
  const [studenti, setstudenti] = useState([]);

  const fetchstudenti = async () => {
    try {
      const response = await fetch(`${API_URL}/studenti`);
      const data = await response.json();
      setstudenti(data);
    } catch (error) {
      console.error('Greška pri dohvatanju:', error);
      Alert.alert('Greška pri dohvaćanju', error.message);
    }
  };

  const handleDelete = async (id) => {
    
          await fetch(`${API_URL}/studenti/${id}`, { method: 'DELETE' });
          fetchstudenti();
      
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchstudenti);
    return unsubscribe;
  }, [navigation]);

  return (
    <SafeAreaView style={{ flex: 1, padding: 20 }}>
      <Button title=" Dodaj Studenta" onPress={() => navigation.navigate('AddStudent')} />
      <FlatList
        data={studenti}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={{ padding: 10, marginVertical: 5, borderWidth: 1 }}>
            <Text>Ime: {item.name}  {item.surname}</Text>
            <Text>Indeks: {item.index}</Text>
            <View style={{ flexDirection: 'row', marginTop: 10 }}>
              <Button
                title="Izmeni"
                onPress={() => navigation.navigate('EditStudent', { student: item })}
              />
              <View style={{ width: 10 }} />
              <Button title="Obriši" color="red" onPress={() => handleDelete(item.id)} />
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}


function AddStudent({ navigation }) {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [index, setIndex] = useState('');


  const handleSubmit = async () => {
    if (!name || !index) return Alert.alert('Greška', 'Popuni sva polja');
    await fetch(`${API_URL}/studenti`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, surname, index }),
    });
    navigation.goBack();
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput placeholder="Ime" value={name} onChangeText={setName}
        style={{ borderBottomWidth: 1, marginBottom: 10 }} />
         <TextInput placeholder="Prezime" value={surname} onChangeText={setSurname}
        style={{ borderBottomWidth: 1, marginBottom: 10 }} />
      <TextInput placeholder="Indeks" value={index} onChangeText={setIndex}
        keyboardType="numeric" style={{ borderBottomWidth: 1, marginBottom: 10 }} />
      <Button title="Sačuvaj" onPress={handleSubmit} />
    </View>
  );
}


function EditStudent({ route, navigation }) {
  const { student } = route.params;
  const [name, setName] = useState(student.name);
  const [surname, setSurname] = useState(student.surname);
  const [index, setIndex] = useState(String(student.index));

  const handleSubmit = async () => {
    await fetch(`${API_URL}/studenti/${student.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name,surname, index }),
    });
    navigation.goBack();
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput value={name} onChangeText={setName}
        style={{ borderBottomWidth: 1, marginBottom: 10 }} />
        <TextInput value={surname} onChangeText={setSurname}
        style={{ borderBottomWidth: 1, marginBottom: 10 }} />
      <TextInput value={index} onChangeText={setIndex}
        keyboardType="numeric" style={{ borderBottomWidth: 1, marginBottom: 10 }} />
      <Button title="Izmeni" onPress={handleSubmit} />
    </View>
  );
}


export default function App() {
  return (
   /* <NavigationContainer>
      <Stack.Navigator initialRouteName="StudentList">
        <Stack.Screen name="StudentList" component={StudentList} options={{ title: 'Studenti' }} />
        <Stack.Screen name="AddStudent" component={AddStudent} options={{ title: 'Dodaj Studenta' }} />
        <Stack.Screen name="EditStudent" component={EditStudent} options={{ title: 'Izmeni Studenta' }} />
      </Stack.Navigator>
    </NavigationContainer>*/
    <SafeAreaView style={{ flex: 1, padding: 20 }}>
      <Text>Test – prikazuje li se ovo?</Text>
      <Button title="Idi na Dodaj" onPress={() => navigation.navigate('AddStudent')} />
    </SafeAreaView>
  );
}
