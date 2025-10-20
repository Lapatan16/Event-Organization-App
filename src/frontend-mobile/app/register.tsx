import React, { useState } from 'react';
import {
  Image,
  View,
  ScrollView,
  Dimensions,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from 'react-native';
import Constants from 'expo-constants';
const API_URL = Constants.expoConfig?.extra?.apiUrl;

import {
  Text,
  TextInput,
  Button,
  Divider,
  Card,
  HelperText,
  Checkbox,
} from 'react-native-paper';
import { useRouter, Stack } from 'expo-router';
import Toast from 'react-native-toast-message';

const { height } = Dimensions.get('window');

const COLORS = {
  primary: '#006daa',
  accent: '#006daa',
  text: '#000000',
  link: '#006daa',
  background: '#F9F9F9',
};

const RegisterScreen = () => {
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [phone, setPhone] = useState('');

  // Enhanced validation regex
  const isEmailValid = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.toLowerCase());
  };

  const isPasswordStrong = (password: string) => {
    return /^(?=.*[A-ZŠĐŽČĆ])(?=.*\d)[A-Za-zŠĐŽČĆšđžčć\d]{8,}$/.test(password);
  };

  const isNameValid = (name: string) => {
    return /^[A-ZŠĐŽČĆ][a-zšđžčć]{1,19}$/.test(name);
  };

  const isLastNameValid = (name: string) => {
    return /^[A-ZŠĐŽČĆ][a-zšđžčć]{1,29}$/.test(name);
  };

  const handleRegister = async () => {
    if (!isNameValid(firstName)) {
      Toast.show({
        type: 'error',
        text1: 'Neuspešna registracija',
        text2: 'Ime nije validno.',
        position: 'top',
        visibilityTime: 3000,
      });
      return;
    }
    if (!isLastNameValid(lastName)) {
      Toast.show({
        type: 'error',
        text1: 'Neuspešna registracija',
        text2: 'Prezime nije validno.',
        position: 'top',
        visibilityTime: 3000,
      });
      return;
    }
    if (!isEmailValid(email)) {
      Toast.show({
        type: 'error',
        text1: 'Neuspešna registracija',
        text2: 'Email adresa nije validna.',
        position: 'top',
        visibilityTime: 3000,
      });
      return;
    }
    if (!isPasswordStrong(password)) {
      Toast.show({
        type: 'error',
        text1: 'Neuspešna registracija',
        text2: 'Lozinka nije validna.',
        position: 'top',
        visibilityTime: 3000,
      });
      return;
    }
    if (password !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Neuspešna registracija',
        text2: 'Lozinke se ne poklapaju.',
        position: 'top',
        visibilityTime: 3000,
      });
      return;
    }
    if (!agreeToTerms) {
      Toast.show({
        type: 'error',
        text1: 'Neuspešna registracija',
        text2: 'Morate prihvatiti uslove korišćenja.',
        position: 'top',
        visibilityTime: 3000,
      });
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/Auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          phone: phone === '' ? null : phone,
          role: "User",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        Toast.show({
          type: 'error',
          text1: 'Greška pri registraciji',
          text2: errorData.message || 'Nepoznata greška.',
          position: 'top',
          visibilityTime: 3000,
        });
        return;
      }

      router.replace('/login');
    } catch (error) {
      console.error('Network error:', error);
      Toast.show({
        type: 'error',
        text1: 'Greška',
        text2: 'Greška pri povezivanju sa serverom.',
        position: 'top',
        visibilityTime: 3000,
      });
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: COLORS.background }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

          <View style={styles.headerSection}>
            <Image
              source={require('../assets/logo/colored-logo (1).png')}
              style={styles.logo}
            />
            <Text variant="headlineSmall" style={styles.subtitle}>
              Napravi svoj nalog
            </Text>
          </View>

          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.dividerContainer}>
                <Divider style={{ flex: 1 }} />
                <Text style={{ marginHorizontal: 12, color: '#6C7278' }}>
                  Registracija
                </Text>
                <Divider style={{ flex: 1 }} />
              </View>

              <View style={styles.inputGroup}>
                <TextInput
                  label="Ime"
                  value={firstName}
                  onChangeText={setFirstName}
                  mode="outlined"
                  error={firstName.length > 0 && !isNameValid(firstName)}
                />
                {firstName.length > 0 && !isNameValid(firstName) && (
                  <HelperText type="error">
                    Ime mora početi velikim slovom i ne sme sadržati brojeve.
                  </HelperText>
                )}
              </View>
              
              <View style={styles.inputGroup}>
                <TextInput
                  label="Prezime"
                  value={lastName}
                  onChangeText={setLastName}
                  mode="outlined"
                  error={lastName.length > 0 && !isLastNameValid(lastName)}
                />
                {lastName.length > 0 && !isLastNameValid(lastName) && (
                  <HelperText type="error">
                    Prezime mora početi velikim slovom i ne sme sadržati brojeve.
                  </HelperText>
                )}
              </View>

              <View style={styles.inputGroup}>
                <TextInput
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  mode="outlined"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={email.length > 0 && !isEmailValid(email)}
                />
                {email.length > 0 && !isEmailValid(email) && (
                  <HelperText type="error">
                    Unesite pravilnu Email adresu.
                  </HelperText>
                )}
              </View>

              <View style={styles.inputGroup}>
                <TextInput
                  label="Lozinka"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  right={
                    <TextInput.Icon
                      icon={showPassword ? 'eye' : 'eye-off'}
                      onPress={() => setShowPassword(!showPassword)}
                    />
                  }
                  mode="outlined"
                  error={password.length > 0 && !isPasswordStrong(password)}
                />
                {password.length > 0 && !isPasswordStrong(password) && (
                  <HelperText
                    type="error"
                  >
                    Lozinka mora imati najmanje 8 karaktera, veliko slovo i broj.
                  </HelperText>
                )}
              </View>

              <View style={styles.inputGroup}>
                <TextInput
                  label="Potvrdi Lozinku"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  right={
                    <TextInput.Icon
                      icon={showConfirmPassword ? 'eye' : 'eye-off'}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    />
                  }
                  mode="outlined"
                  error={confirmPassword.length > 0 && confirmPassword !== password}
                />
                {confirmPassword.length > 0 && confirmPassword !== password && (
                  <HelperText
                    type="error"
                  >
                    Lozinke se ne poklapaju.
                  </HelperText>
                )}
              </View>

              <View style={styles.checkboxContainer}>
                <Checkbox.Android
                  status={agreeToTerms ? 'checked' : 'unchecked'}
                  onPress={() => setAgreeToTerms(!agreeToTerms)}
                  color={COLORS.primary}
                />
                <Text style={styles.checkboxLabel}>
                  Prihvatam Uslove korišćenja.
                </Text>
              </View>

              <Button
                mode="contained"
                onPress={handleRegister}
                style={styles.registerButton}
                labelStyle={{ color: '#ffff' }}
                disabled={!agreeToTerms || !firstName || !lastName || !email || !password || !confirmPassword}
              >
                Napravi Nalog
              </Button>

              <View style={styles.signInContainer}>
                <Text>Imate nalog? </Text>
                <Button onPress={() => router.push('/login')} compact textColor={COLORS.link}>
                  Prijavi se
                </Button>
              </View>
            </Card.Content>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: COLORS.background,
  },
  headerSection: {
    backgroundColor: COLORS.accent,
    height: height * 0.35,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 50,
  },
  logo: {
    width: 300,
    height: 200,
    resizeMode: 'contain',
    marginBottom: 100,
  },
  title: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: '#FFFFFF',
    textAlign: 'center',
  },
  card: {
    marginHorizontal: 24,
    marginTop: -100,
    borderRadius: 12,
    elevation: 4,
  },
  inputGroup: {
    marginBottom: 16,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  registerButton: {
    marginTop: 8,
    marginBottom: 16,
    backgroundColor: COLORS.accent,
    borderRadius: 24,
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkboxLabel: {
    flex: 1,
  },
});

export default RegisterScreen;

export const options = {
  href: null,
};
