import { Slot } from 'expo-router';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { Alert, View, Dimensions } from 'react-native';
import Toast from 'react-native-toast-message';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

function ProtectedLayout() {
  const { accessToken, role, loadingTokens, logout } = useAuth();

  useEffect(() => {
    if (loadingTokens) return;

    if (!accessToken) logout();

    if (accessToken && role !== 'User') {
      Alert.alert(
        "Pristup onemogućen",
        "Samo korisnik koji nije admin ili organizator može da koristi mobilnu aplikaciju",
        [{ text: "OK", onPress: logout }]
      );
    }
  }, [accessToken, role, loadingTokens]);

  if (loadingTokens) return null;

  return <Slot />;
}

function LockedLayout({ children }: { children: React.ReactNode }) {
  const [windowHeight, setWindowHeight] = useState<number | null>(null);

  useEffect(() => {
    const { height } = Dimensions.get('window');
    setWindowHeight(height);

    // New subscription API
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setWindowHeight(window.height);
    });

    return () => {
      subscription.remove(); // cleanup
    };
  }, []);

  if (!windowHeight) return null; // wait until we know the height

  return (
    <View style={{ height: windowHeight, flex: 1, backgroundColor: '#fff' }}>
      <StatusBar style="dark" />
      {children}
    </View>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <SafeAreaProvider>
        <LockedLayout>
          <ProtectedLayout />
          <Toast />
        </LockedLayout>
      </SafeAreaProvider>
    </AuthProvider>
  );
}