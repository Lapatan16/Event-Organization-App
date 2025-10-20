import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '@/contexts/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function KupovinaScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { userInfo, loadingUserInfo } = useAuth();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorPoruka, setErrorPoruka] = useState('');
  
  // Stanja za validnost polja
  const [isTelefonValid, setIsTelefonValid] = useState(true);
  const [isImeValid, setIsImeValid] = useState(true);
  const [isEmailValid, setIsEmailValid] = useState(true);

  if (loadingUserInfo) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#006daa" />
      </View>
    );
  }

  const {
    eventId,
    eventName,
    eventDate,
    eventLocation,
    eventImage,
    ticketType,
    ticketPrice,
    quantity = '1',
    ticketQuantity,
    sold,
    ticketId,
    price,
  } = params;

  const [ime, setIme] = useState(userInfo?.firstName + " " + userInfo?.lastName || '');
  const [email, setEmail] = useState(userInfo?.email || '');
  const [telefon, setTelefon] = useState(userInfo?.phone || '');
  const [brojKarata, setBrojKarata] = useState(
    parseInt(Array.isArray(quantity) ? quantity[0] : quantity || '0')
  );

  const availableTickets = parseInt(Array.isArray(ticketQuantity) ? ticketQuantity[0] : ticketQuantity || '0');

  const increment = () => {
    if (brojKarata < availableTickets) {
      setBrojKarata(brojKarata + 1);
    }
  };
  
  const decrement = () => brojKarata > 1 && setBrojKarata(brojKarata - 1);
  
  // Funkcija za validaciju imena i prezimena
  const validateIme = (name: string) => {
    if (name === '') return true; // Dozvoljava prazan string dok se ne unese
    const regex = /^[A-Z][a-z]+(\s[A-Z][a-z]+)*$/;
    return regex.test(name) && name.length <= 30;
  };

  // Funkcija za validaciju email adrese
  const validateEmail = (mail: string) => {
    if (mail === '') return true;
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(mail);
  };
  
  // Funkcija za validaciju broja telefona
  const validateTelefon = (broj: string) => {
    if (broj === '') return true;
    const regex = /^((\+381|0)6[0-9]{7,8})$/;
    return regex.test(broj);
  };
  
  // Funkcije za rukovanje unosom i validacijom
  const handleImeChange = (text: string) => {
    setIme(text);
    setIsImeValid(validateIme(text));
  };
  
  const handleEmailChange = (text: string) => {
    setEmail(text);
    setIsEmailValid(validateEmail(text));
  };

  const handleTelefonChange = (text: string) => {
    setTelefon(text);
    setIsTelefonValid(validateTelefon(text));
  };

  const handlePress = () => {
    // Provera validnosti svih polja pre nego sto se nastavi
    const isNameValid = validateIme(ime);
    const isMailValid = validateEmail(email);
    const isPhoneValid = validateTelefon(telefon);

    if (!isNameValid || !isMailValid || !isPhoneValid || brojKarata === 0) {
      setErrorPoruka('Molimo proverite unete podatke.');
      setIsImeValid(isNameValid);
      setIsEmailValid(isMailValid);
      setIsTelefonValid(isPhoneValid);
      return;
    }

    setErrorPoruka('');
    setIsProcessing(true);

    setTimeout(() => {
      router.push({
        pathname: '/odabirResursa',
          params: {
            eventId,
            eventName,
            eventDate,
            eventLocation,
            ticketType,
            ticketPrice,
            quantity: brojKarata.toString(),
            ime,
            email,
            telefon,
            eventImage,
            ticketQuantity,
            sold,
            ticketId,
            price,
          }
      });
      setIsProcessing(false);
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="#1c1c1c" />
          </TouchableOpacity>

          <View style={styles.card}>
            <Image
              source={{ uri: Array.isArray(eventImage) ? eventImage[0] : eventImage || 'https://picsum.photos/300/200' }}
              style={styles.image}
            />
            <View style={styles.eventInfo}>
              <Text style={styles.date}>{eventDate}</Text>
              <Text style={styles.name}>{eventName}</Text>
              <Text style={styles.location}>{eventLocation}</Text>
            </View>
          </View>

          <Text style={styles.section}>Karte</Text>
          <View style={styles.ticketRow}>
            <View>
              <Text style={styles.ticketName}>{ticketType}</Text>
              <Text style={styles.ticketPrice}>{ticketPrice} RSD</Text>
            </View>
            <View style={styles.counter}>
              <TouchableOpacity onPress={decrement} style={styles.counterBtn}><Text>-</Text></TouchableOpacity>
              <Text style={styles.counterText}>{brojKarata}</Text>
              <TouchableOpacity onPress={increment} style={styles.counterBtn}><Text>+</Text></TouchableOpacity>
            </View>
          </View>

          <Text style={styles.section}>Informacije</Text>
          
          <Text style={styles.label}>Ime i prezime</Text>
          <TextInput
            style={[styles.input, !isImeValid && styles.inputError]}
            value={ime}
            onChangeText={handleImeChange}
          />
          {!isImeValid && ime !== '' ? (
            <Text style={styles.errorText}>Ime i prezime moraju početi velikim slovom, sadržati samo slova i biti do 30 karaktera.</Text>
          ) : null}
          
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, !isEmailValid && styles.inputError]}
            value={email}
            onChangeText={handleEmailChange}
            keyboardType="email-address"
          />
          {!isEmailValid && email !== '' ? (
            <Text style={styles.errorText}>Molimo unesite ispravan format email adrese.</Text>
          ) : null}

          <Text style={styles.label}>Mobilni</Text>
          <TextInput
            style={[styles.input, !isTelefonValid && styles.inputError]}
            value={telefon}
            onChangeText={handleTelefonChange}
            keyboardType="phone-pad"
          />
          {!isTelefonValid && telefon !== '' ? (
            <Text style={styles.errorText}>Molimo unesite ispravan broj telefona.</Text>
          ) : null}

          <TouchableOpacity
            style={[styles.submitBtn, (isProcessing || brojKarata === 0 || !isImeValid || !isEmailValid || !isTelefonValid) && styles.submitBtnDisabled]}
            onPress={handlePress}
            disabled={isProcessing || brojKarata === 0 || !isImeValid || !isEmailValid || !isTelefonValid}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.submitText}>Nastavi</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    paddingTop: 20,
    flex: 1,
    backgroundColor: '#fff',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    padding: 20,
    paddingBottom: 40,
    paddingTop: Platform.OS === 'android' ? 20 : 0,
  },
  backButton: {
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  image: {
    height: 120,
    width: '100%',
  },
  eventInfo: {
    padding: 12,
  },
  date: {
    fontSize: 12,
    color: '#6B7280',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1c1c1c',
  },
  location: {
    fontSize: 14,
    color: '#6B7280',
  },
  section: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  ticketRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
  },
  ticketName: {
    fontSize: 14,
    marginBottom: 4,
  },
  ticketPrice: {
    fontSize: 14,
    fontWeight: '600',
  },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  counterBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterText: {
    marginHorizontal: 10,
    fontSize: 16,
  },
  label: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 16,
    paddingVertical: 8,
    fontSize: 14,
  },
  inputError: {
    borderBottomColor: 'red',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 12,
  },
  submitBtn: {
    marginTop: 20,
    backgroundColor: '#006daa',
    padding: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  submitBtnDisabled: {
    backgroundColor: '#B0C4DE',
  },
  submitText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
