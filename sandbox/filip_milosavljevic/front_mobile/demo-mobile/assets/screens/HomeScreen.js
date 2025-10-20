import { useIsFocused } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { Button, FlatList, Text, View } from 'react-native';
import API from '../../api';

export default function HomeScreen({ navigation }) {
    const [users, setUsers] = useState([]);
    const isFocused = useIsFocused();

    useEffect(() => {
        load();
    }, [isFocused]);

    const load = async () => {
        try {
            const res = await API.get('/');
            setUsers(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    const remove = async (id) => {
        await API.delete(`/${id}`);
        load();
    };

    return (
        <View style={{ padding: 20 }}>
            <Button title="Add User" onPress={() => navigation.navigate('UserForm')} />
            <FlatList
                data={users}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <View style={{ marginVertical: 10 }}>
                        <Text>Name: {item.name}</Text>
                        <Text>Email: {item.email}</Text>
                        <Text>Role: {item.role}</Text>
                        <Button title="Details" onPress={() => navigation.navigate('UserDetail', { id: item.id })} />
                        <Button title="Edit" onPress={() => navigation.navigate('UserForm', { id: item.id })} />
                        <Button title="Delete" onPress={() => remove(item.id)} />
                    </View>
                )}
            />
        </View>
    );
}
