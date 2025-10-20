import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, ActivityIndicator, Image } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Text, Card, Avatar, Button, Divider, IconButton, PaperProvider, DefaultTheme } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Constants from 'expo-constants';
import { useAuth } from '@/contexts/AuthContext';
import { Ticket, Usluge } from '@/types/Ticket';

const API_URL = Constants.expoConfig?.extra?.apiUrl;

const lightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#fff',
    surface: '#fff',
    text: '#000',
  },
};

const TicketDetailsScreen = () => {
  const router = useRouter();
  const { accessToken } = useAuth();
  const { id } = useLocalSearchParams();
  const { userInfo } = useAuth();
  const [ticket, setTicket] = useState<Ticket>();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!userInfo?.id) return;

      try {
        const response = await fetch(`${API_URL}/api/ticket/by-user/${userInfo.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        });
        if (!response.ok) throw new Error('Greška pri dohvatanju karata');
        const ticketsData = await response.json();

        const foundTicket = ticketsData.find((t: any) => t.id === id);
        if (!foundTicket) throw new Error('Karta nije pronađena');
        setTicket(foundTicket);

        const eventResponse = await fetch(`${API_URL}/api/event/${foundTicket.eventId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        });
        if (!eventResponse.ok) throw new Error('Greška pri dohvatanju događaja');
        const eventData = await eventResponse.json();
        setEvent(eventData);
      } catch (error) {
        console.error(error);
        Alert.alert('Greška', 'Ne mogu da učitam podatke.');
      } finally {
        setLoading(false);
      }
    };

    if (id && userInfo?.id) fetchData();
  }, [id, userInfo]);

  const copyToClipboard = async () => {
    if (!ticket?.qrCode) return;
    await Clipboard.setStringAsync(ticket.qrCode);
    Alert.alert('Kopirano', 'Kod karte je kopiran.');
  };

  const downloadPDF = async () => {
    if (!ticket || !event) return;

    const htmlContent = `
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; }
            .section { margin-bottom: 12px; }
            .label { font-weight: bold; }
            .qr { margin-top: 10px; }
          </style>
        </head>
        <body>
          <h1>Karta za događaj</h1>
          <div class="section"><span class="label">Naziv događaja:</span> ${event.title}</div>
          <div class="section"><span class="label">Lokacija:</span> ${event.location?.city ?? 'Nepoznata'}</div>
          <div class="section"><span class="label">Datum:</span> ${ticket.date}</div>
          <div class="section"><span class="label">Vreme:</span> ${ticket.time}</div>
          <div class="section"><span class="label">Ime:</span> ${ticket.name}</div>
          <div class="section"><span class="label">Cena:</span> ${ticket.price} RSD</div>
          <div class="section"><span class="label">Količina:</span> ${ticket.quantity}</div>

          ${ticket.qrCode ? `<div class="section qr"><img src="data:image/png;base64,${ticket.qrCode}" width="140" height="140" /></div>` : ''}

          <p style="margin-top: 30px;">Molimo vas da pokažete ovu kartu na ulazu.</p>
        </body>
      </html>
    `;


    try {
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri);
    } catch (error) {
      console.error(error);
      Alert.alert('Greška', 'Ne mogu da generišem PDF.');
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!ticket || !event) {
    return (
      <View style={styles.centered}>
        <Text>Karta ili događaj nisu pronađeni.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.topRow}>
        <IconButton icon="arrow-left" onPress={() => router.push('../tickets')} />
        <Text style={styles.title}>Detalji karte</Text>
        <IconButton icon="printer" onPress={downloadPDF} />
      </View>

      <Card style={[styles.card, { borderRadius: 12, overflow: 'hidden', backgroundColor: '#caf0f8' }]} elevation={4}>
        <View style={styles.eventRow}>
          <Avatar.Image size={50} source={{ uri: event.poster }} />
          <View style={styles.eventInfo}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <Text style={styles.location}>{event.location?.city ?? 'Nepoznata lokacija'}</Text>
          </View>
          <View
  style={[
    styles.badgeContainer,
    { backgroundColor: ticket.isScanned === false ? '#90e1fe' : '#d3d3d3' },
  ]}
>
  <Text style={styles.badgeText}>
    {ticket.isScanned === false ? 'Aktivna' : 'Iskorišćena'}
  </Text>
</View>

        </View>

        <Divider style={{ marginVertical: 12, backgroundColor: '#006caa41' }} />

        <View style={styles.infoRow}>
          <Text style={styles.label}>Naziv</Text>
          <Text style={styles.value}>{ticket.name}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Cena</Text>
          <Text style={styles.value}>{ticket.price} RSD</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Kupljena</Text>
          <Text style={styles.value}>
            {new Date(ticket.date).toLocaleString('sr-Latn-RS', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            })}
          </Text>
        </View>

        <View style={styles.qrContainer}>
          {ticket?.qrCode && (
            <Image source={{ uri: `data:image/png;base64,${ticket.qrCode}` }} style={{ width: 140, height: 140 }} />
          )}
        </View>

        {ticket.services && ticket.services.length > 0 && (
          <View style={styles.servicesContainer}>
            <Text style={styles.servicesTitle}>Usluge</Text>
            {ticket.services.map((service: Usluge) => (
              <View key={service.id} style={styles.serviceRow}>
                <Text style={styles.serviceName}>{service.name}</Text>
                <View style={styles.serviceRight}>
                  <Text style={styles.serviceQty}>x{service.quantity}</Text>
                  <Text style={styles.servicePrice}>{service.price} RSD</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </Card>

      <View style={styles.terms}>
        <Text style={styles.termsTitle}>Uslovi i odredbe</Text>
        <Text style={styles.term}>• Ulaznice se ne mogu refundirati osim ako događaj nije otkazan.</Text>
        <Text style={styles.term}>• Svaka karta važi samo za jednu osobu.</Text>
        <Text style={styles.term}>• Molimo vas da na ulazu pokažete važeći QR kod.</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  servicesContainer: { marginTop: 20 },
  servicesTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  serviceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  serviceName: { fontSize: 15, flex: 1 },
  serviceRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  serviceQty: { fontSize: 14, color: 'gray' },
  servicePrice: { fontSize: 14, fontWeight: 'bold' },
  container: { flex: 1, padding: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 20, fontWeight: 'bold' },
  card: {
    marginTop: 12,
    borderRadius: 12,
    backgroundColor: '#caf0f8', // main color
    overflow: 'hidden', // ensures children are clipped
    elevation: 4, // shadow for Android
    padding: 16,
  },  
  eventRow: { flexDirection: 'row', alignItems: 'center' },
  eventInfo: { flex: 1, marginLeft: 12 },
  eventTitle: { fontSize: 16, fontWeight: 'bold' },
  location: { color: 'gray' },
  badgeContainer: {
    minWidth: 100,
    height: 32,
    borderRadius: 16, // half of height for pill shape
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },

  badgeText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: 'black',
  },
  infoRow: { marginVertical: 6 },
  label: { fontSize: 16, color: 'black', fontWeight: 'bold' },
  value: { fontSize: 14 },
  qrContainer: { alignItems: 'center', marginTop: 16 },
  terms: { marginTop: 24 },
  termsTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  term: { fontSize: 14, marginBottom: 4, color: '#555' },
});

export default function TicketDetailsScreenWrapper() {
  return (
    <PaperProvider theme={lightTheme}>
      <TicketDetailsScreen />
    </PaperProvider>
  );
}
