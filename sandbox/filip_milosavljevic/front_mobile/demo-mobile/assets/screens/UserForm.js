import { useEffect, useState } from 'react';
import { Button, TextInput, View } from 'react-native';
import API from '../../api';

export default function UserForm({ route, navigation }) {
    const [user, setUser] = useState({ name: '', email: '', role: '' });
    const id = route.params?.id;

    useEffect(() => {
        if (id) {
            API.get(`/${id}`).then(res => setUser(res.data));
        }
    }, [id]);

    const handleSubmit = async () => {
        if (id) {
            await API.put('', { ...user, id });
        } else {
            await API.post('', user);
        }
        navigation.goBack();
    };

    return (
        <View style={{ padding: 20 }}>
            <TextInput placeholder="Name" value={user.name} onChangeText={v => setUser({ ...user, name: v })} />
            <TextInput placeholder="Email" value={user.email} onChangeText={v => setUser({ ...user, email: v })} />
            <TextInput placeholder="Role" value={user.role} onChangeText={v => setUser({ ...user, role: v })} />
            <Button title={id ? "Update" : "Create"} onPress={handleSubmit} />
        </View>
    );
}
