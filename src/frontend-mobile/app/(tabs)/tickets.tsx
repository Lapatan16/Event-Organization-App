import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, MapPin, Clock, QrCode } from 'lucide-react-native';
import Constants from 'expo-constants';
import { useAuth } from '@/contexts/AuthContext';
import { UserTicket } from '@/types/UserTicket';
import { Ticket } from '@/types/Ticket';

const API_URL = Constants.expoConfig?.extra?.apiUrl;

type DisplayTicket = UserTicket & {
  eventName: string;
  location: string;
  image: string;
  ticketType: string;
};

export default function TicketsScreen() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const { userInfo, loadingUserInfo } = useAuth();
  const [tickets, setTickets] = useState<DisplayTicket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      if (!userInfo?.id) return;

      try {
        const response = await fetch(`${API_URL}/api/ticket/by-user/${userInfo.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        });
        if (!response.ok) throw new Error('Failed to fetch tickets');
        const data = await response.json();

        const eventCache: { [key: string]: any } = {};
        const ticketsWithEvent: DisplayTicket[] = await Promise.all(
          data.map(async (ticket: Ticket) => {
            let event;
            if (eventCache[ticket.eventId]) event = eventCache[ticket.eventId];
            else {
              const eventResponse = await fetch(`${API_URL}/api/event/${ticket.eventId}`, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${accessToken}`,
                },
              });
              if (!eventResponse.ok)
                throw new Error(`Failed to fetch event for ticket ${ticket.id}`);
              event = await eventResponse.json();
              eventCache[ticket.eventId] = event;
            }

            return {
              ...ticket,
              status: ticket.isScanned ? 'notActive' : 'active',
              time: new Date(ticket.date).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              }),
              eventName: event.title,
              location: `${event.location?.city || 'Nepoznato'}, ${event.location?.country || ''}`,
              image: event.poster || 'https://via.placeholder.com/150',
              ticketType: 'Standard',
            };
          })
        );

        setTickets(ticketsWithEvent);
      } catch (err) {
        console.error('Error fetching tickets or events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [userInfo]);

  const activeTickets = tickets.filter((ticket) => ticket.status === 'active');
  const pastTickets = tickets.filter((ticket) => ticket.status !== 'active');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('sr-RS', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#4CAF50';
      case 'used':
        return '#6C7278';
      default:
        return '#6C7278';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Aktivna';
      case 'used':
        return 'Iskorišćena';
      default:
        return 'Nepoznata';
    }
  };

  const renderTicketItem = ({ item }: { item: DisplayTicket }) => (
    <TouchableOpacity
      style={[styles.ticketCard, item.status !== 'active' && styles.ticketCardInactive]}
      onPress={() => router.push({ pathname: '../ticketsDetailsScreen', params: { id: item.id } })}
    >
      <View style={styles.ticketHeader}>
        <Image source={{ uri: item.image }} style={styles.ticketImage} />
        <View style={styles.ticketInfo}>
          <Text style={styles.eventName}>{item.eventName}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.ticketDetails}>
        <View style={styles.detailRow}>
          <Calendar size={16} color="#6C7278" />
          <Text style={styles.detailText}>{formatDate(item.date)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Clock size={16} color="#6C7278" />
          <Text style={styles.detailText}>{item.time}</Text>
        </View>
        <View style={styles.detailRow}>
          <MapPin size={16} color="#6C7278" />
          <Text style={styles.detailText}>{item.location}</Text>
        </View>
      </View>

      {item.status === 'active' && (
        <View style={styles.qrSection}>
          <QrCode size={40} color="#006daa" />
          <Text style={styles.qrText}>Tapni da prikažeš QR kod</Text>
        </View>
      )}

      <View style={styles.ticketFooter}>
        <Text style={styles.ticketId}>ID karte: {item.id}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading || loadingUserInfo) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#006daa" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Moje Karte</Text>
      </View>

      <FlatList
        data={[]}
        renderItem={() => null}
        ListHeaderComponent={() => (
          <View>
            {activeTickets.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Aktivne karte ({activeTickets.length})</Text>
                {activeTickets.map((ticket) => (
                  <View key={ticket.id} style={styles.ticketWrapper}>
                    {renderTicketItem({ item: ticket })}
                  </View>
                ))}
              </View>
            )}
            {pastTickets.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Iskorišćene karte ({pastTickets.length})</Text>
                {pastTickets.map((ticket) => (
                  <View key={ticket.id} style={styles.ticketWrapper}>
                    {renderTicketItem({ item: ticket })}
                  </View>
                ))}
              </View>
            )}
            {tickets.length === 0 && (
              <View style={styles.emptyState}>
                <QrCode size={64} color="#6C7278" />
                <Text style={styles.emptyTitle}>Nema karata</Text>
                <Text style={styles.emptyDescription}>
                  Karte će se pojaviti kada učestvujete na događajima.
                </Text>
              </View>
            )}
          </View>
        )}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
  },
  headerTitle: { fontSize: 24, color: '#1E1E1E', letterSpacing: -0.5 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, color: '#1E1E1E', paddingHorizontal: 20, marginBottom: 16 },
  ticketWrapper: { paddingHorizontal: 20, marginBottom: 16 },
  ticketCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  ticketCardInactive: { opacity: 0.6 },
  ticketHeader: { flexDirection: 'row', marginBottom: 16 },
  ticketImage: { width: 60, height: 60, borderRadius: 8, marginRight: 12 },
  ticketInfo: { flex: 1 },
  eventName: { fontSize: 16, color: '#1E1E1E', marginBottom: 4 },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 10, color: '#ffffff' },
  ticketDetails: { marginBottom: 16 },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  detailText: { fontSize: 14, color: '#6C7278', marginLeft: 8 },
  qrSection: {
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  qrText: { fontSize: 12, color: '#006daa', marginTop: 8 },
  ticketFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ticketId: { fontSize: 12, color: '#6C7278' },
  emptyState: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 20, color: '#1E1E1E', marginTop: 16, marginBottom: 8 },
  emptyDescription: { fontSize: 14, color: '#6C7278', textAlign: 'center', lineHeight: 20 },
  listContainer: { paddingBottom: 20 },
});
