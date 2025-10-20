import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Avatar, Divider, Button, TextInput, IconButton, Portal, Dialog, List, DefaultTheme, Provider as PaperProvider } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import Constants from 'expo-constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

const API_URL =
  Constants.expoConfig?.extra?.apiUrl;
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#000',
    text: '#000',
    placeholder: '#888',
    onSurface: '#000',
  },
};

export default function ProfileScreen() {
  const router = useRouter();
  const { logout, userInfo, loadingUserInfo, accessToken, refreshUserInfo } = useAuth();
  const insets = useSafeAreaInsets();

  const [firstName, setFirstName] = useState(userInfo?.firstName);
  const [lastName, setLastName] = useState(userInfo?.lastName);
  const [email, setEmail] = useState(userInfo?.email);
  // const [avatarUrl, setAvatarUrl] = useState(userInfo?.avatar || 'https://i.pravatar.cc/150?img=5');
  const [editMode, setEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  // const [isUploading, setIsUploading] = useState(false);
  // const [isPhotoModalVisible, setPhotoModalVisible] = useState(false);

  if (loadingUserInfo) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#006daa" />
      </View>
    );
  }

  const user = {
    name: userInfo?.firstName + " " + userInfo?.lastName,
    email: userInfo?.email,
    avatar: userInfo?.avatar,
  };

  const isEmailValid = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.toLowerCase());
  };

  const isFirstNameValid = (name: string) => {
    const re = /^[A-ZŠĐŽČĆ][a-zšđžčć]{1,19}$/;
    return re.test(name);
  };

  const isLastNameValid = (name: string) => {
    const re = /^[A-ZŠĐŽČĆ][a-zšđžčć]{1,29}$/;
    return re.test(name);
  };

  const handleSave = async () => {
    if (!firstName || !lastName || !email) {
      Toast.show({
              type: 'error', // 'success' | 'error' | 'info'
              text1: 'Neuspešna promena profila',
              text2: 'Nisu sva polja popunjena',
              position: 'top', // or 'bottom'
              visibilityTime: 3000,
            });
            return;
     
    }

    if (!isEmailValid(email)) {
      Toast.show({
              type: 'error', // 'success' | 'error' | 'info'
              text1: 'Greška',
              text2: 'Email nije validan',
              position: 'top', // or 'bottom'
              visibilityTime: 3000,
            });
            return;
    }

    if (!isFirstNameValid(firstName)) {
      Toast.show({
              type: 'error', // 'success' | 'error' | 'info'
              text1: 'Greška',
              text2: 'Ime nije validno',
              position: 'top', // or 'bottom'
              visibilityTime: 3000,
            });
            return;
    }

    if (!isLastNameValid(lastName)) {
      Toast.show({
              type: 'error', // 'success' | 'error' | 'info'
              text1: 'Greška',
              text2: 'Prezime nije validno',
              position: 'top', // or 'bottom'
              visibilityTime: 3000,
            });
            return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`${API_URL}/api/User`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          id: userInfo?.id,
          firstName,
          lastName,
          email,
        }),
      });

      if (response.status === 409) {
        Toast.show({
              type: 'error', // 'success' | 'error' | 'info'
              text1: 'Greška',
              text2: 'Korisnik sa datom email adresom već postoji',
              position: 'top', // or 'bottom'
              visibilityTime: 3000,
            });
            return;
      }

      if (!response.ok) {
        Alert.alert('Greška', 'Došlo je do greške pri čuvanju podataka.');
        return;
      }

      const emailChanged = email.toLowerCase() !== userInfo?.email.toLowerCase();

      await refreshUserInfo();

      if (emailChanged) {
        Alert.alert('Email promenjen', 'Email je uspešno promenjen. Bićete odjavljeni.');
        await logout();
        return;
      }

      
      Toast.show({
              type: 'success', // 'success' | 'error' | 'info'
              text1: 'Uspeh',
              text2: 'Promene su uspešno sačuvane',
              position: 'top', // or 'bottom'
              visibilityTime: 3000,
            });
    
      setEditMode(false);
    } catch (error) {
      console.error('Greška prilikom ažuriranja korisnika:', error);
      Alert.alert('Greška', 'Došlo je do greške pri komunikaciji sa serverom.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };


  return (
    <PaperProvider>
      <ScrollView style={[styles.container, { paddingTop: insets.top }]}>
        {/* Profil sekcija */}
        <View style={styles.container}>
      <View style={styles.profileContainer}>
        {userInfo?.firstName ? (
          <Avatar.Text
            size={90}
            label={userInfo.firstName[0].toUpperCase()}
            style={styles.avatarFallback}
            color="#0353a4"
          />
        ) : (
          <Avatar.Text
            size={90}
            label="?"
            style={styles.avatarFallback}
            color="#0353a4"
          />
        )}
        <Text style={styles.nameText}>
          {userInfo?.firstName} {userInfo?.lastName}
        </Text>
      </View>
    </View>

        <Divider />

        {/* Lični podaci sekcija */}
        <View style={styles.personalInfoSection}>
          <View style={styles.personalInfoHeader}>
            <Text style={styles.personalInfoTitle}>Lični podaci</Text>
            <IconButton
              icon={editMode ? "close" : "pencil"}
              size={24}
              onPress={() => {
                setEditMode(!editMode);
                if (editMode) {
                  setFirstName(userInfo?.firstName);
                  setLastName(userInfo?.lastName);
                  setEmail(userInfo?.email);
                }
              }}
              style={styles.editButton}
            />
          </View>

          {editMode ? (
            <View style={styles.editForm}>
              <TextInput
                label="Ime"
                value={firstName}
                onChangeText={setFirstName}
                style={styles.input}
                mode="flat"
                underlineColor="transparent"
                theme={theme}
              />
              {firstName && !isFirstNameValid(firstName) && firstName.length > 0 && (
                <Text style={styles.errorText}>Ime nije validano</Text>
              )}
              <TextInput
                label="Prezime"
                value={lastName}
                onChangeText={setLastName}
                style={styles.input}
                mode="flat"
                underlineColor="transparent"
                theme={theme}
              />
              {lastName && !isLastNameValid(lastName) && lastName.length > 0 && (
                <Text style={styles.errorText}>Prezime nije validno</Text>
              )}
              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                mode="flat"
                underlineColor="transparent"
                theme={theme}
              />
              {email && !isEmailValid(email) && email.length > 0 && (
                <Text style={styles.errorText}>Email nije validan</Text>
              )}
              <Button
                mode="contained"
                onPress={handleSave}
                style={styles.saveButton}
                labelStyle={styles.saveButtonText}
                loading={isSaving}
                disabled={isSaving}
              >
                Sačuvaj izmene
              </Button>
            </View>
          ) : (
            <View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Ime i prezime:</Text>
                <Text style={styles.infoValue}>{user.name}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email:</Text>
                <Text style={styles.infoValue}>{user.email}</Text>
              </View>
            </View>
          )}
        </View>

        <Divider />

        <View style={styles.logoutSection}>
  <Button
      mode="contained"
  onPress={handleLogout}
  style={styles.logoutButton}
  labelStyle={styles.logoutLabel}
  buttonColor="#D32F2F"
  rippleColor="#B71C1C"  // boja pri pritisku
  >
    Odjava
  </Button>
</View>
      </ScrollView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
    container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingText: {
    padding: 20,
    textAlign: 'center',
  },
  profileContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 8,
  },
  email: {
    fontSize: 14,
    color: '#666',
  },
  changePhotoButton: {
    marginTop: 12,
    borderColor: '#006daa',
    borderWidth: 1,
  },
  changePhotoButtonText: {
    color: '#006daa',
  },
  personalInfoSection: {
    padding: 20,
  },
  personalInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  personalInfoTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  editButton: {
    margin: 0,
    padding: 0,
  },
  editForm: {
    paddingBottom: 24,
  },
  input: {
    marginBottom: 12,
    backgroundColor: 'white',
    paddingHorizontal: 0,
  },
  saveButton: {
    borderColor: '#006daa',
    borderWidth: 1,
    backgroundColor: 'white',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#006daa',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginRight: 8,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: -8,
    marginBottom: 8,
    marginLeft: 4,
  },
  logoutSection: {
    padding: 24,
    alignItems: 'center',
  },
  /*logoutButton: {
    borderColor: '#D32F2F',
    borderWidth: 1,
    width: '80%',
  },*/
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  centeredDialog: {
    alignItems: 'center',
  },
  dialogText: {
    marginTop: 15,
    fontSize: 16,
    color: '#000',
  },
  logoutButton: {
  backgroundColor: '#D32F2F', // crvena pozadina
  borderRadius: 32,          // zaobljene ivice
  
  paddingVertical: 8,   // uvećava visinu dugmeta
  paddingHorizontal: 64, // širi dugme levo/desno
},
logoutLabel: {
  color: '#fff',             // bela slova
  fontSize: 16,
  fontWeight: 'bold',
},

  avatarFallback: {
    backgroundColor: '#e7e6e6',
    borderWidth: 2,
    borderColor: '#0353a4',
  },
  nameText: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
});