import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator } from 'react-native';
import { useState, useRef, useEffect, useMemo } from 'react';
import { CalendarHeader } from '@/components/CalendarHeader';
import { MonthCalendar } from '@/components/MonthCalendar';
import Constants from 'expo-constants';
import { useAuth } from '@/contexts/AuthContext';
import { Event } from '../../types/Event';
import { EventDisplayData } from '../../types/EventDisplayData';
import { Ticket } from '../../types/Ticket';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const API_URL =
  Constants.expoConfig?.extra?.apiUrl;

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const getEventColor = (() => {
  const colorMap: { [eventId: string]: string } = {};
  const colors = [
    '#FF6347', '#4682B4', '#32CD32', '#FFD700', '#DA70D6', '#20B2AA',
    '#FF69B4', '#8A2BE2', '#00CED1', '#F4A460', '#BA55D3', '#7B68EE',
    '#ADFF2F', '#DC143C', '#00BFFF', '#9932CC', '#6B8E23', '#FF4500'
  ];
  let colorIndex = 0;

  return (eventId: string) => {
    if (!colorMap[eventId]) {
      colorMap[eventId] = colors[colorIndex % colors.length];
      colorIndex++;
    }
    return colorMap[eventId];
  };
})();

type PagedResult<T> = {
  items: T[];
  totalItems: number;
  pageNumber: number;
  pageSize: number;
};

export default function CalendarScreen() {
  const { userInfo, loadingUserInfo } = useAuth();
  const { accessToken } = useAuth();
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const scrollViewRef = useRef<ScrollView>(null);

  const [allRawEvents, setAllRawEvents] = useState<Event[]>([]);
  const [allRawTickets, setAllRawTickets] = useState<Ticket[]>([]);
  const [filterMode, setFilterMode] = useState<'all' | 'myTickets'>('all');

  const [loadedPages, setLoadedPages] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);


  const router = useRouter();
  const [today] = useState(new Date());
  const insets = useSafeAreaInsets();
  const [monthHeight, setMonthHeight] = useState(600);

  const fetchEventsPage = async (month: number, year: number): Promise<Event[]> => {
    try {
      const response = await fetch(`${API_URL}/api/Event/public?month=${month + 1}&year=${year}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
          }
        }
      );
      if (!response.ok) throw new Error("Failed to fetch events");
      const data: PagedResult<Event> = await response.json();
      return data.items;
    } catch (err) {
      console.error("Fetch events error:", err);
      return [];
    }
  };

  const loadEventsForMonth = async (monthIndex: number, year: number) => {
    if (monthIndex < 0) {
      monthIndex = 11;
      year -= 1;
    }
    if (monthIndex > 11) {
      monthIndex = 0;
      year += 1;
    }

    const cacheKey = `${year}-${monthIndex}`;
    if (loadedPages.has(cacheKey)) return;

    setIsLoading(true);
    try {
      const events = await fetchEventsPage(monthIndex, year);
      setAllRawEvents(prev => [...prev, ...events]);
      setLoadedPages(prev => new Set(prev).add(cacheKey));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchTickets = async () => {
      if (loadingUserInfo || !userInfo) return;
      try {
        const ticketsResponse = await fetch(`${API_URL}/api/Ticket`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${accessToken}`
            }
          }
        );
        const tickets: Ticket[] = await ticketsResponse.json();
        setAllRawTickets(tickets);
      } catch (error) {
        console.error("Error fetching tickets:", error);
      }
    };
    fetchTickets();
  }, [userInfo, loadingUserInfo]);

  useEffect(() => {
    const currentMonth = today.getMonth();
    loadEventsForMonth(currentMonth - 1, today.getFullYear());
    loadEventsForMonth(currentMonth, today.getFullYear());
    loadEventsForMonth(currentMonth + 1, today.getFullYear());
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (scrollViewRef.current) {
        const scrollPosition = today.getMonth() * monthHeight;
        scrollViewRef.current.scrollTo({
          y: scrollPosition,
          animated: true,
        });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [monthHeight]);

  const handleScrollEnd = (e: any) => {
    const offsetY = e.nativeEvent.contentOffset.y;
    const monthIndex = Math.round(offsetY / monthHeight);
    loadEventsForMonth(monthIndex - 1, currentYear);
    loadEventsForMonth(monthIndex + 1, currentYear);
  };

  const eventsData = useMemo(() => {
    const newEventsMap: { [key: string]: EventDisplayData[] } = {};
    const userTicketEventIds = new Set<string>();

    if (userInfo?.id) {
      allRawTickets.forEach(ticket => {
        if (ticket.userId === userInfo.id && ticket.eventId) {
          userTicketEventIds.add(ticket.eventId);
        }
      });
    }

    allRawEvents.forEach(event => {
      const hasTicketForEvent = userTicketEventIds.has(event.id);
      if (filterMode === 'myTickets' && !hasTicketForEvent) return;

      const eventColor = getEventColor(event.id);
      const startDate = new Date(event.startDate);
      const endDate = new Date(event.endDate);

      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateKey = d.toISOString().split('T')[0];
        if (!newEventsMap[dateKey]) newEventsMap[dateKey] = [];
        
        // **ISPRAVLJEN KOD ZA KREIRANJE OBJEKTA**
        const eventDisplayData: EventDisplayData = {
          id: event.id,
          title: event.title,
          description: event.description,
          type: event.type,
          location: event.location,
          poster: event.poster,
          contact: event.contact,
          visibility: event.visibility,
          startDate: event.startDate,
          endDate: event.endDate,
          startTime: event.startTime,
          endTime: event.endTime,
          status: event.status,
          hasTicket: hasTicketForEvent,
          color: eventColor,
          category: (event as any).category || 'Nekategorizovano',
          price: (event as any).price || 'Besplatno',
          // Ručno mapiramo tickets kako bi se poklopili tipovi
          tickets: event.tickets,
          // tickets: event.tickets.map(ticket => ({
          //   id: ticket.id,
          //   eventId: event.id,
          //   userId: userInfo?.id || 'unknown', // Dodajemo userId
          //   date: event.startDate, // Dodajemo date
          //   // Možda i ostala svojstva koja nedostaju u EventTicket, a potrebna su u Ticket
          // })) as Ticket[],
        };
        newEventsMap[dateKey].push(eventDisplayData);
      }
    });

    Object.keys(newEventsMap).forEach(dateKey => {
      newEventsMap[dateKey].sort((a, b) => {
        if (a.hasTicket && !b.hasTicket) return -1;
        if (!a.hasTicket && b.hasTicket) return 1;
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      });
    });

    return newEventsMap;
  }, [filterMode, allRawEvents, allRawTickets, userInfo?.id]);

  const handlePrevYear = () => setCurrentYear(prev => prev - 1);
  const handleNextYear = () => setCurrentYear(prev => prev + 1);
  

  const navigateToEventDetails = (event: EventDisplayData) => {
    console.log(event.tickets);
    
    const displayLocation = event.location.city;
    const imageUrl = event.poster || 'https://picsum.photos/364/197?random=festival';
    router.push({
      pathname: '/festivals/arsenal' as any,
      params: {
        eventId: event.id,
        eventName: event.title,
        eventDate: event.startDate,
        eventTime: event.startTime,
        eventLocation: displayLocation,
        eventLng: event.location.lng,
        eventLat: event.location.lat,
        eventDescription: event.description,
        eventImage: imageUrl,
        eventPrice: event.price,
        eventCategory: event.category,
        tickets: JSON.stringify(event.tickets),
        returnTo: "calendar",
      }
    });
  };

  const renderAllMonths = () =>
    MONTHS.map((month, index) => (
      <View
        key={`${currentYear}-${index}`}
        onLayout={e => setMonthHeight(e.nativeEvent.layout.height)}
      >
        <MonthCalendar
          month={month}
          year={currentYear}
          monthIndex={index}
          events={eventsData}
          onEventPress={navigateToEventDetails}
          selectedDate={currentYear === today.getFullYear() ? today : undefined}
        />
      </View>
    ));
    
  if (loadingUserInfo) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#006daa" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <CalendarHeader
        year={currentYear}
        onPrevYear={handlePrevYear}
        onNextYear={handleNextYear}
        renderRightContent={() => (
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.filterButton, filterMode === 'all' && styles.filterButtonActive]}
              onPress={() => setFilterMode('all')}
            >
              <Text style={[styles.filterButtonText, filterMode === 'all' && styles.filterButtonTextActive]}>Svi događaji</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, filterMode === 'myTickets' && styles.filterButtonActive]}
              onPress={() => setFilterMode('myTickets')}
            >
              <Text style={[styles.filterButtonText, filterMode === 'myTickets' && styles.filterButtonTextActive]}>Moji događaji</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onMomentumScrollEnd={handleScrollEnd}
      >
        <View style={styles.monthsContainer}>
          {renderAllMonths()}
        </View>
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#006daa" />
            <Text style={styles.loadingText}>Učitavanje...</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  scrollView: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  monthsContainer: { paddingHorizontal: 20, flex: 1 },
  buttonGroup: { flexDirection: 'row', alignItems: 'center' },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#006daa',
    marginLeft: 10,
  },
  filterButtonActive: { backgroundColor: '#006daa' },
  filterButtonText: { color: '#006daa', fontSize: 12, fontWeight: 'bold' },
  filterButtonTextActive: { color: '#ffffff' },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#333',
  },
});