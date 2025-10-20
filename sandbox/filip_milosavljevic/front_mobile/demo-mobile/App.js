import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider } from 'react-native-paper';
import HomeScreen from './assets/screens/HomeScreen';
import UserDetail from './assets/screens/UserDetail';
import UserForm from './assets/screens/UserForm';

const Stack = createNativeStackNavigator();

export default function App() {
    return (
        <PaperProvider>
            <NavigationContainer>
                <Stack.Navigator>
                    <Stack.Screen name="Users" component={HomeScreen} />
                    <Stack.Screen name="UserForm" component={UserForm} />
                    <Stack.Screen name="UserDetail" component={UserDetail} />
                </Stack.Navigator>
            </NavigationContainer>
        </PaperProvider>
    );
}
