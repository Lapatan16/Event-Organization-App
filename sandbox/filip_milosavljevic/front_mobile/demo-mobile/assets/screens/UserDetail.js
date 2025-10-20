import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import API from '../../api';

export default function UserDetail({ route }) {
    const [user, setUser] = useState(null);
    const id = route.params?.id;

    useEffect(() => {
        API.get(`/${id}`).then(res => setUser(res.data));
    }, [id]);

    if (!user) return <Text>Loading...</Text>;

    return (
        <View style={{ padding: 20 }}>
            <Text>Name: {user.name}</Text>
            <Text>Email: {user.email}</Text>
            <Text>Role: {user.role}</Text>
        </View>
    );
}
