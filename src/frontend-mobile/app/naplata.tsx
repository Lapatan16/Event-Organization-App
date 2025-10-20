import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Modal, Pressable } from 'react-native';
import Constants from 'expo-constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/contexts/AuthContext';

const API_URL = 
  Constants.expoConfig?.extra?.apiUrl;

export default function NaplataScreen() {
  const { accessToken } = useAuth();
  const router = useRouter();
  const {
    eventId,
    eventName,
    eventDate,
    ticketType,
    ticketPrice,
    quantity,
    ime,
    email,
    telefon,
    eventImage,
    ticketQuantity,
    sold,
    ticketId,
  } = useLocalSearchParams();
  
  const [selectedOption, setSelectedOption] = useState('credit');
  const [modalVisible, setModalVisible] = useState(false);
  const [isPaying, setIsPaying] = useState(false); // Dodato stanje za plaćanje
  const { userInfo, loadingUserInfo } = useAuth();
  const { resources } = useLocalSearchParams();
  const parsedResources = resources ? JSON.parse(resources as string) : [];

  // Dodato: Prikazuje spinner dok se učitavaju korisnički podaci
  if (loadingUserInfo) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  const createTicket = async () => {
    try {
      for (let i = 0; i < Number(quantity); i++) {
        const response = await fetch(`${API_URL}/api/Ticket`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            name: ticketType,
            price: Number(ticketPrice),
            quantity: 1, // Always 1 per ticket
            date: new Date().toISOString(),
            QRCode: null,
            userId: userId,
            eventId: eventId,
            services: parsedResources.map((res: any) => ({
              id: res.id ?? res.Id ?? "",
              name: res.name ?? res.title ?? "",
              quantity: 1,
              price: String(res.price ? res.price * res.quantity : "0"),
            })),
          }),
        });

        if (!response.ok) {
          throw new Error('Greška pri slanju karte');
        }
      }

      Alert.alert("Uspešno kreirane karte!");
    } catch (error) {
      console.error('Greška prilikom kreiranja karte:', error);
      Alert.alert('Došlo je do greške prilikom plaćanja.');
    }
  };


  const updateTicket = async () => {
    try {
      console.log(Number(sold) + Number(quantity));
      
      const response = await fetch(`${API_URL}/api/Event/${eventId}/tickets/${ticketId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          eventId: eventId,
          Id: ticketId,
          name: ticketType,
          price: ticketPrice,
          quantity: Number(ticketQuantity) - Number(quantity),
          sold: Number(sold) + Number(quantity),
        })
      });

          if (!response.ok) {
            throw new Error('Greška prilikom transakcije');
          }

          
        } catch (error) {
          console.error('Greška prilikom plaćanja:', error);
          alert('Došlo je do greške prilikom plaćanja.');
        }
  }

  const updateResources = async () => {
    try {
      for (const r of parsedResources) {
        const response = await fetch(`${API_URL}/api/Event/${eventId}/resources/${r.id}/reserve`, {
          method: 'PUT',
          headers:  {   'Content-Type': 'application/json',
                        "Authorization": `Bearer ${accessToken}` 
                    },
          body: JSON.stringify(r.quantity), // only send how many reserved
        
        });

        if (!response.ok) {
          throw new Error(`Greška pri ažuriranju resursa ${r.name}`);
        }
      }
    } catch (err) {
      console.error("Error updating resources:", err);
      alert("Došlo je do greške sa resursima.");
    }
  };

  // TODO - ne radi kreiranje karte i dodati da se resurs cuva na karti, takodje resurs treba da ima svoju


  const handleBuy = async () =>
  {
    await createTicket();
    await updateTicket();
    await updateResources();

    setModalVisible(true);
  }

  const userId = userInfo?.id;
  const total = Number(ticketPrice) * Number(quantity);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#1c1c1c" />
        </TouchableOpacity>

        <View style={styles.card}>
          <Image source={{ uri: Array.isArray(eventImage) ? eventImage[0] : eventImage }} style={styles.image} />
          <View style={styles.eventInfo}>
            <Text style={styles.date}>{eventDate}</Text>
            <Text style={styles.name}>{eventName}</Text>
            <Text style={styles.ticket}>{ticketType} (x{quantity})</Text>
            <Text style={styles.price}>{total} RSD</Text>
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>📄 Informacije</Text>
          <Text>{ime}</Text>
          <Text>{email} - {telefon}</Text>
        </View>

        <Text style={styles.section}>Metod plaćanja</Text>
        <View>
          <TouchableOpacity
            style={[
              styles.paymentOption,
              selectedOption === 'credit' && styles.selectedOption,
            ]}
            onPress={() => setSelectedOption('credit')}
          >
            <Text>💳 Credit Card</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              selectedOption === 'paypal' && styles.selectedOption,
            ]}
            onPress={() => setSelectedOption('paypal')}
          >
            <Text>💲 Paypal</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              selectedOption === 'bank' && styles.selectedOption,
            ]}
            onPress={() => setSelectedOption('bank')}
          >
            <Text>🏦 Bank Transfer</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.section}>Rezime</Text>
        <Text>{ticketType} (x{quantity}) – {total} RSD</Text>

        {parsedResources.length > 0 && (
          <>
            <Text style={{ marginTop: 8, fontWeight: 'bold' }}>Dodatne usluge:</Text>
            {parsedResources.map((r: any) => (
              <Text key={r.id}>
                {r.name} (x{r.quantity}) – {r.price * r.quantity} RSD
              </Text>
            ))}
          </>
        )}

        <Text style={styles.subtotal}>
          Total – {total + parsedResources.reduce((sum: number, r: any) => sum + r.price * r.quantity, 0)} RSD
        </Text>

        <TouchableOpacity
          style={styles.payButton}
          onPress={handleBuy}
          disabled={isPaying} // Onemogućava dugme dok je transakcija u toku
        >
          {/* Uslovno renderovanje: prikazuje spinner ili tekst */}
          {isPaying ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.payButtonText}>Plati</Text>
          )}
        </TouchableOpacity>
        
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Icon name="check-circle" size={64} color="green" />
              <Text style={styles.modalText}>Uspešno ste platili kartu!</Text>
              <Pressable style={styles.modalButton} onPress={() => router.push('/tickets')}>
                <Text style={styles.modalButtonText}>Prikaži mi sve moje ulaznice</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  // Dodato: stil za centriranje spinnera
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  backButton: {
    marginBottom: 16,
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
  },
  ticket: {
    fontSize: 14,
  },
  price: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  infoLabel: {
    color: '#006daa',
    marginBottom: 4,
    fontWeight: '600',
  },
  section: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
  },
  paymentOption: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  subtotal: {
    marginTop: 10,
    fontWeight: 'bold',
  },
  payButton: {
    marginTop: 20,
    backgroundColor: '#006daa',
    padding: 16,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center', // Dodato za centriranje spinnera
  },
  payButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginTop: 10,
    fontSize: 18,
    textAlign: 'center',
  },
  modalButton: {
    marginTop: 20,
    backgroundColor: '#1c1c1c',
    borderRadius: 10,
    padding: 10,
    paddingHorizontal: 20,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  selectedOption: {
    borderColor: '#006daa',
    backgroundColor: '#e0f0ff',
  },
});