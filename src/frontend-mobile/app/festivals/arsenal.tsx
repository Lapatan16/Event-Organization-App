import React, { useState, useEffect } from 'react';
import OpenStreetMapView from '@/utils/OpenStreetMapView';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Card } from '../../components/ui/card';
import { EventTicket } from '@/types/Event';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/contexts/AuthContext';

const API_URL = 
  Constants.expoConfig?.extra?.apiUrl;

const { width } = Dimensions.get('window');

interface ProgramItem {
  id: string;
  name: string;
  description: string;
  startTime: string;
  endTime: string;
}

export default function ArsenalScreen() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const params = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState('details');
  const [programData, setProgramData] = useState<ProgramItem[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    eventId,
    eventName,
    eventDate,
    eventLocation,
    eventLng,
    eventLat,
    eventDescription,
    eventImage,
    tickets,
    returnTo,
  } = params;

  useEffect(() => {
    if (activeTab === 'program' && eventId) {
      fetchProgramData();
    }
  }, [activeTab, eventId]);

  const fetchProgramData = async () => {
    if (!eventId) return;
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/api/Event/${eventId}/programs`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
          }
        }
      );
      if (!response.ok) {
        throw new Error('Failed to fetch program data');
      }
      const data = await response.json();
      setProgramData(data);
    } catch (err) {
      console.error(err);
      setError('Neuspelo učitavanje programa. Pokušajte ponovo.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string | Date): { day: string; month: string } => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString('sr-RS', { month: 'short' });
    return { day: day.toString(), month };
  };

  const dateInfo = eventDate
    ? formatDate(Array.isArray(eventDate) ? eventDate[0] : eventDate)
    : { day: '27', month: 'Jun' };

  const ticketOptions: EventTicket[] = tickets
    ? JSON.parse(Array.isArray(tickets) ? tickets[0] : tickets)
    : [];
  
  const handleBuyTicket = (ticketName: string, ticketPrice: string, soldTickets: number, option: EventTicket) => {
    console.log(option.sold);
    router.push({
      pathname: '/kupovina',
      params: {
        eventId,
        eventName,
        eventDate,
        eventLocation,
        ticketType: ticketName,
        ticketPrice,
        ticketQuantity: option.quantity,
        quantity: '1',
        sold: option.sold,
        eventImage,
        ticketId: option.id,
        price: option.price,
      },
    });
  };

  const renderProgram = () => {
    if (isLoading) {
      return <ActivityIndicator size="large" color="#006daa" />;
    }
    if (error) {
      return <Text style={styles.errorText}>{error}</Text>;
    }
    if (!programData || programData.length === 0) {
      return <Text style={styles.noDataText}>Program nije dostupan.</Text>;
    }
    return (
      <View>
        {programData.map((item) => {
          // Funkcija za formatiranje datuma i vremena
          const formatTime = (isoString: string) => {
            const date = new Date(isoString);
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            return `${hours}:${minutes}`;
          };

          const startDate = new Date(item.startTime);
          const day = startDate.getDate().toString().padStart(2, '0');
          const month = startDate.toLocaleDateString('sr-RS', { month: 'long' });
          const year = startDate.getFullYear();

          const formattedStartTime = formatTime(item.startTime);
          const formattedEndTime = formatTime(item.endTime);

          return (
            <View key={item.id} style={styles.programItem}>
              <Text style={styles.programDate}>{day}. {month} {year}.</Text>
              <Text style={styles.programTime}>
                Počinje u: {formattedStartTime}h
              </Text>
              <Text style={styles.programTime}>
                Završava se u: {formattedEndTime}h
              </Text>
              <Text style={styles.programName}>{item.name}</Text>
              <Text style={styles.programDescription}>{item.description}</Text>
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => {
            if (returnTo === 'calendar') {
              router.push('/kalendar');
            } else if (returnTo === 'events') {
              router.push('/events');
            }
            else router.back();

          }}
        >
          <Icon name="arrow-back" size={26} color="#1c1c1c" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalji događaja</Text>
        <Image
          source={require('../../assets/logo/icon_black.png')}
          style={{ width: 37, height: 37, resizeMode: 'contain' }}
        />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.contentContainer}>
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: Array.isArray(eventImage) ? eventImage[0] : eventImage || 'https://picsum.photos/364/197?random=festival' }}
              style={styles.eventImage}
            />
            <Card style={styles.dateBadge}>
              <Text style={styles.dateNumber}>{dateInfo.day}</Text>
              <Text style={styles.dateMonth}>{dateInfo.month}</Text>
            </Card>
          </View>

          <View style={styles.eventInfo}>
            <Text style={styles.eventTitle}>{eventName || 'Arsenal Fest'}</Text>
            <View style={styles.locationContainer}>
              <Icon name="location-on" size={16} color="#1d1d1d80" />
              <Text style={styles.locationText}>{eventLocation || 'Kragujevac'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'details' && styles.activeTabButton]}
            onPress={() => setActiveTab('details')}
          >
            <Text style={[styles.tabText, activeTab === 'details' && styles.activeTabText]}>Detalji</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'prices' && styles.activeTabButton]}
            onPress={() => setActiveTab('prices')}
          >
            <Text style={[styles.tabText, activeTab === 'prices' && styles.activeTabText]}>Ulaznice</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'program' && styles.activeTabButton]}
            onPress={() => setActiveTab('program')}
          >
            <Text style={[styles.tabText, activeTab === 'program' && styles.activeTabText]}>Program</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabContent}>
          {activeTab === 'details' && (
            <>
              <Text style={styles.descriptionText}>{eventDescription || 'Opis događaja nije dostupan.'}</Text>
              <View style={styles.locationTitleContainer}>
                <Icon name="location-on" size={16} color="#1c1c1c" />
                <Text style={styles.locationTitle}>Lokacija</Text>
              </View>
              <OpenStreetMapView latitude={Number(eventLat)} longitude={Number(eventLng)} />
            </>
          )}

          {activeTab === 'prices' && (
          <View style={{ paddingVertical: 16 }}>
            {ticketOptions.filter(option => option.quantity > 0).length > 0 ? (
              ticketOptions
                .filter(option => option.quantity > 0)
                .map((option) => (
                  <View key={option.id} style={styles.ticketRow}>
                    <View>
                      <Text style={styles.ticketName}>{option.name}</Text>
                      <Text style={styles.ticketPrice}>{option.price} RSD</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.buyButton}
                      onPress={() => handleBuyTicket(option.name, option.price.toString(), option.sold, option)}
                    >
                      <Text style={styles.buyButtonText}>Kupi kartu</Text>
                    </TouchableOpacity>
                  </View>
                ))
            ) : (
              <Text style={styles.noDataText}>Nije dostupan ni jedan tip ulaznice.</Text>
            )}
          </View>
        )}

          {activeTab === 'program' && (
            <View style={{ paddingVertical: 16 }}>
              {renderProgram()}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerButton: {
    //backgroundColor: '#f9f9f9',
    borderRadius: 50,
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1c1c1c',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  eventImage: {
    width: '100%',
    height: 197,
    borderRadius: 12,
  },
  dateBadge: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dateNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1c1c1c',
  },
  dateMonth: {
    fontSize: 14,
    fontWeight: '500',
    color: '#999',
  },
  eventInfo: {
    marginBottom: 16,
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1c1c1c',
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 16,
    color: '#888',
    marginLeft: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginHorizontal: 20,
    marginBottom: 10,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: '#006daa',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#888',
  },
  activeTabText: {
    color: '#006daa',
  },
  tabContent: {
    paddingHorizontal: 20,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 24,
  },
  locationTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1c1c1c',
    marginLeft: 8,
  },
  ticketRow: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  ticketName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  ticketPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  buyButton: {
    backgroundColor: '#006daa',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
  buyButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingVertical: 20,
  },
  programItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  programName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1c1c1c',
    marginBottom: 4,
  },
  programDescription: {
    fontSize: 14,
    color: '#555',
  },
  errorText: {
    color: 'red',
    paddingVertical: 20,
  },
  programDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  programTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
});