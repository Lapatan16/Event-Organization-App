import React, { useState } from 'react';
import Constants from 'expo-constants';
const API_URL = 
  Constants.expoConfig?.extra?.apiUrl;
import { useAuth } from '../contexts/AuthContext';
import Toast from 'react-native-toast-message';

import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Image,
  KeyboardAvoidingView, // Import KeyboardAvoidingView
  Platform, // Import Platform to check for iOS/Android
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Checkbox,
  Divider,
  Card,
} from 'react-native-paper';
import { Stack, useRouter } from 'expo-router';

const { height } = Dimensions.get('window');


const LoginScreen = () => {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validate = () =>
  {
    if(email === '' || password === '')
      return false;
    return true;
  }

  const handleLogin = async () => {

    if(!validate())
    {
      Toast.show({
        type: 'error', // 'success' | 'error' | 'info'
        text1: 'Neuspešna prijava',
        text2: 'Nisu sva polja popunjena',
        position: 'top', // or 'bottom'
        visibilityTime: 3000,
      });
      return;
    }

  try {
    const response = await fetch(`${API_URL}/api/Auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      Toast.show({
        type: 'error',
        text1: 'Neuspešna prijava',
        text2: 'Korisnik sa datim kredencijalima ne postoji',
        position: 'top',
        visibilityTime: 3000,
      });
      console.log('Login failed');
      return;
    }

    const data = await response.json();
    const parsedToken = JSON.parse(atob(data.accessToken.split('.')[1]));
    const role = parsedToken.role || parsedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || null;
    await login({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      userId: data.userId,
      role: role,
    });

    router.replace('/(tabs)/events');

  } catch (error) {
    console.error('Network error:', error);
  }
};

  const handleGoToRegister = () => {
    router.push('/register'); // vodi u register stranicu
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerStyle: {
            backgroundColor: '#006daa',
          },
          headerShadowVisible: false,
          headerTitleAlign: 'left',
        }}
      />
      {/* Wrap the content with KeyboardAvoidingView to prevent the keyboard from 
        covering the text inputs. The behavior prop is set based on the platform.
      */}
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="light-content" backgroundColor="#006daa" />
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.headerSection}>
              <Image
                source={require('../assets/logo/colored-logo (1).png')}
                style={styles.logo} // Use a style from the stylesheet
              />
            </View>

            <Card style={styles.loginCard}>
              <Card.Content>
                <View style={styles.dividerWrapper}>
                  <Divider style={styles.dividerLine} />
                  <Text style={styles.dividerText}>Prijava</Text>
                  <Divider style={styles.dividerLine} />
                </View>

                <TextInput
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  mode="outlined"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={styles.input}
                    theme={{
                  colors: {
                  primary: '#006daa', 
                  text: '#000000', 
                  placeholder: '#888888', 
                  background: '#FFFFFF', 
                  outline: '#888888' 
                  },
                }}
                />

                <TextInput
                  label="Lozinka"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  mode="outlined"
                  style={styles.input}
                  theme={{
                  colors: {
                  primary: '#006daa', 
                  text: '#000000', 
                  placeholder: '#888888', 
                  background: '#FFFFFF', 
                  outline: '#888888' 
                  },
                }}
                  right={
                    <TextInput.Icon
                      icon={showPassword ? 'eye-off' : 'eye'}
                      onPress={() => setShowPassword(!showPassword)}
                    />
                  }
                />

                <Button
                  mode="contained"
                  onPress={handleLogin}
                  style={styles.loginButton}
                >
                  Prijavi se
                </Button>

                <View style={styles.signUpContainer}>
                  <Text>Nemate nalog? </Text>
                  <Button onPress={handleGoToRegister} compact textColor={'#006daa'}>Napravi nalog</Button>
                </View>
              </Card.Content>
            </Card>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 0,
  },
  logo: {
    width: 300, 
    height: 200, 
    resizeMode: 'contain',
    marginBottom: 100, 
  },
  headerSection: {
    backgroundColor: '#006daa',
    height: height * 0.45,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  headerTitle: {
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 200,
  },
  headerSubtitle: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 14,
  },
  loginCard: {
    marginHorizontal: 24,
    marginTop: -150,
    borderRadius: 12,
    elevation: 4,
  },
  googleButton: {
    color: '#006daa',
    marginBottom: 24,
  },
  dividerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E5E5',
  },
  dividerText: {
    marginHorizontal: 12,
    color: '#6C7278',
  },
  input: {
    marginBottom: 16,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rememberText: {
    fontSize: 14,
  },
  loginButton: {
    marginBottom: 24,
    borderRadius: 50,
    backgroundColor: '#006daa',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LoginScreen;

export const options = {
  href: null,
};
