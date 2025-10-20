import { useRouter } from 'expo-router';
import { EventTicket, type Event } from '../../types/Event';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import { useAuth } from '../../contexts/AuthContext'
import Constants from 'expo-constants';
const API_URL =
  Constants.expoConfig?.extra?.apiUrl;

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  TextInput,
  StatusBar,
  Dimensions,
  Modal,
  ActivityIndicator, // Dodato
} from 'react-native';
import { Search, MapPin, Calendar, ArrowDownNarrowWide, Filter  } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const cardWidth = (width - 60) / 2; // 2 columns with padding

interface EventPreview {
  id: string;
  title: string;
  date: string;
  time: string;
  locationName: string;
  locationLng: number;
  locationLat: number;
  description: string;
  category: string;
  image: string;
  price: string;
  tickets: EventTicket[];
  isFavorite: false;
}

interface EventsScreenProps {
  onNavigateToLogin: () => void;
}

export default function EventsScreen({ onNavigateToLogin }: EventsScreenProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Sve');
  const [events, setEvents] = useState<Event[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(4);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const { accessToken } = useAuth()
  

  const formatRSD = (value: number) => new Intl.NumberFormat('sr-RS').format(value);

  const mappedDogadjaji: EventPreview[] = events.map((event) => ({
    time: event.startTime,
    locationName: event.location.city,
    locationLat: event.location.lat,
    locationLng: event.location.lng,
    description: event.description,
    category: event.type,
    isFavorite: false,
    id: event.id,
    image: event.poster,
    title: event.title,
    date: event.startDate,
    tickets: event.tickets,
    price:
      event.tickets.length === 0
        ? 'Free'
        : event.tickets.length === 1
        ? `${formatRSD(event.tickets[0].price)} RSD`
        : `${formatRSD(Math.min(...event.tickets.map((t) => t.price)))} - ${formatRSD(
              Math.max(...event.tickets.map((t) => t.price))
            )} RSD`,
  }));

  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  const uniqueCities = Array.from(
    new Set(mappedDogadjaji.map((e) => e.locationName))
  );



  const loadEvents = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/Event/public?pageNumber=${pageNumber}&pageSize=${pageSize}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
          }
        }
      );
      const data = await response.json();

      if (data && data.items) {
        const newEvents = data.items.map((item: any) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          type: item.type,
          contact: item.contact,
          visibility: item.visibility,
          poster: item.poster,
          startDate: item.startDate,
          endDate: item.endDate,
          startTime: item.startTime,
          location: item.location,
          tickets: item.tickets,
          status: item.status,
        }));

        setEvents((prevEvents) => {
          const existingIds = new Set(prevEvents.map((e) => e.id));
          const uniqueNewEvents = newEvents.filter((e: Event) => !existingIds.has(e.id));
          return [...prevEvents, ...uniqueNewEvents];
        });

        setHasMore(pageNumber * pageSize < data.totalItems);
        setPageNumber((prev) => prev + 1);
      }
    } catch (err) {
      console.error('Error loading events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const categories = ['Sve', 'Filmsko veče', 'Koncert', 'Radionica', 'Drugo'];

  const [sortOption, setSortOption] = useState<'price' | 'date' | 'alphabetical' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (option: 'price' | 'date' | 'alphabetical') => {
    if (sortOption === option) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortOption(option);
      setSortDirection('asc');
    }
  };

  // NOVO: Funkcija za poništavanje sortiranja
  const handleResetSort = () => {
    setSortOption(null);
    setSortDirection('asc');
  };

  const direction = sortDirection === 'asc' ? 1 : -1;

  const sortedEvents = [...mappedDogadjaji].sort((a, b) => {
    if (sortOption === 'price') {
      const priceA = parseInt(a.price.replace(/\D/g, ''), 10);
      const priceB = parseInt(b.price.replace(/\D/g, ''), 10);
      return (priceA - priceB) * direction;
    } else if (sortOption === 'date') {
      return (new Date(a.date).getTime() - new Date(b.date).getTime()) * direction;
    } else if (sortOption === 'alphabetical') {
      return a.title.localeCompare(b.title) * direction;
    }
    return 0;
  });

  const filteredEvents = sortedEvents.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.locationName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Sve' || item.category === selectedCategory;
    const matchesCity =
    !selectedCity || item.locationName === selectedCity;

  return matchesSearch && matchesCategory && matchesCity;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString('sr-Latn-RS', { month: 'short' });
    return { day: day.toString(), month };
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Koncert': '#10B981',
      'Drugo': '#EF4444',
      'Radionica': '#A855F7',
      'Filmsko veče': '#F59E0B',
    };
    return colors[category] || '#6B7280';
  };

  const renderEventItem = ({ item, index }: { item: EventPreview; index: number }) => {
    const dateInfo = formatDate(item.date);

    return (
      <TouchableOpacity
        onPress={() => {
          router.push({
            pathname: '/festivals/arsenal' as any,
            params: {
              eventId: item.id,
              eventName: item.title,
              eventDate: item.date,
              eventTime: item.time,
              eventLocation: item.locationName,
              eventLng: item.locationLng,
              eventLat: item.locationLat,
              eventDescription: item.description,
              eventImage: item.image,
              eventPrice: item.price,
              eventCategory: item.category,
              tickets: JSON.stringify(item.tickets),
              //eventLocationImage: item.locationImage
              returnTo: 'events',
            },
          });
        }}
        style={[styles.eventCard, { marginRight: index % 2 === 0 ? 10 : 0, marginLeft: index % 2 === 1 ? 10 : 0 }]}
      >
        <View style={styles.eventImageContainer}>
          <Image source={{ uri: item.image }} style={styles.eventImage} />
          <View style={styles.dateContainer}>
            <Text style={styles.dateDay}>{dateInfo.day}</Text>
            <Text style={styles.dateMonth}>{dateInfo.month}</Text>
          </View>
        </View>
        <View style={styles.eventContent}>
          <Text style={styles.eventName} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.eventDetails}>
            <View style={styles.detailRow}>
              <MapPin size={12} color="#6B7280" />
              <Text style={styles.detailText} numberOfLines={1}>
                {item.locationName}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Calendar size={12} color="#6B7280" />
              <Text style={styles.detailText}>{item.time}</Text>
            </View>
          </View>
          <View style={styles.eventFooter}>
            <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.category) }]}>
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>
          </View>
          <Text style={styles.priceText}>
            {item.price === '0 RSD' ? 'Besplatan ulaz' : `${item.price}`}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderCategoryItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[styles.categoryChip, selectedCategory === item && styles.categoryChipActive]}
      onPress={() => setSelectedCategory(item)}
    >
      <Text
        style={[styles.categoryChipText, selectedCategory === item && styles.categoryChipTextActive]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  );

  if (loading && events.length === 0) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#006daa" />
      </SafeAreaView>
    );
  }

  // NOVO: Prikazivanje poruke ako nema događaja
  if (filteredEvents.length === 0 && !loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        {/* Header */}
      <View style={styles.header}>
      {/* Logo levo */}
      <Image
        source={require('../../assets/logo/logo_1.png')}
        style={styles.logo}
      />

      {/* Dugmad desno */}
      <View style={styles.headerButtons}>
        {/* Sort Menu */}
        <Menu>
          <MenuTrigger
            customStyles={{
              TriggerTouchableComponent: TouchableOpacity,
              triggerWrapper: styles.filterButton,
            }}
          >
            <ArrowDownNarrowWide size={20} color="#6B7280" />
          </MenuTrigger>
          <MenuOptions
            customStyles={{
              optionsContainer: styles.menuOptionsContainer,
              optionWrapper: styles.menuOptionWrapper,
              optionText: styles.menuOptionText,
            }}
          >
            <MenuOption
              onSelect={() => handleSort('price')}
              text={`Ceni ${sortOption === 'price' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}`}
            />
            <MenuOption
              onSelect={() => handleSort('date')}
              text={`Datumu ${sortOption === 'date' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}`}
            />
            <MenuOption
              onSelect={() => handleSort('alphabetical')}
              text={`Nazivu ${sortOption === 'alphabetical' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}`}
            />
            {sortOption !== null && (
              <MenuOption onSelect={handleResetSort} text="Poništi sortiranje" />
            )}
          </MenuOptions>
        </Menu>

        {/* Filter Menu */}
        <Menu>
          <MenuTrigger
            customStyles={{
              TriggerTouchableComponent: TouchableOpacity,
              triggerWrapper: styles.filterButton,
            }}
          >
            <Filter size={20} color="#6B7280" />
          </MenuTrigger>
          <MenuOptions
            customStyles={{
              optionsContainer: styles.menuOptionsContainer,
              optionWrapper: styles.menuOptionWrapper,
              optionText: styles.menuOptionText,
            }}
          >
            <MenuOption onSelect={() => setSelectedCity(null)} text="Svi gradovi" />
            {uniqueCities.map((city) => (
              <MenuOption
                key={city}
                onSelect={() => setSelectedCity(city)}
                text={city}
              />
            ))}
          </MenuOptions>
        </Menu>
      </View>
    </View>
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color="#6B7280" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Pretraga po nazivu ili mestu..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>
        <View style={styles.categoriesContainer}>
          <FlatList
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>
        <View style={styles.noEventsContainer}>
          <Text style={styles.noEventsText}>Trenutno ne postoji ni jedan planiran događaj.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
      {/* Logo levo */}
      <Image
        source={require('../../assets/logo/logo_1.png')}
        style={styles.logo}
      />

      {/* Dugmad desno */}
      <View style={styles.headerButtons}>
        {/* Sort Menu */}
        <Menu>
          <MenuTrigger
            customStyles={{
              TriggerTouchableComponent: TouchableOpacity,
              triggerWrapper: styles.filterButton,
            }}
          >
            <ArrowDownNarrowWide size={20} color="#6B7280" />
          </MenuTrigger>
          <MenuOptions
            customStyles={{
              optionsContainer: styles.menuOptionsContainer,
              optionWrapper: styles.menuOptionWrapper,
              optionText: styles.menuOptionText,
            }}
          >
            <MenuOption
              onSelect={() => handleSort('price')}
              text={`Ceni ${sortOption === 'price' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}`}
            />
            <MenuOption
              onSelect={() => handleSort('date')}
              text={`Datumu ${sortOption === 'date' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}`}
            />
            <MenuOption
              onSelect={() => handleSort('alphabetical')}
              text={`Nazivu ${sortOption === 'alphabetical' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}`}
            />
            {sortOption !== null && (
              <MenuOption onSelect={handleResetSort} text="Poništi sortiranje" />
            )}
          </MenuOptions>
        </Menu>

        {/* Filter Menu */}
        <Menu>
          <MenuTrigger
            customStyles={{
              TriggerTouchableComponent: TouchableOpacity,
              triggerWrapper: styles.filterButton,
            }}
          >
            <Filter size={20} color="#6B7280" />
          </MenuTrigger>
          <MenuOptions
            customStyles={{
              optionsContainer: styles.menuOptionsContainer,
              optionWrapper: styles.menuOptionWrapper,
              optionText: styles.menuOptionText,
            }}
          >
            <MenuOption onSelect={() => setSelectedCity(null)} text="Svi gradovi" />
            {uniqueCities.map((city) => (
              <MenuOption
                key={city}
                onSelect={() => setSelectedCity(city)}
                text={city}
              />
            ))}
          </MenuOptions>
        </Menu>
      </View>
    </View>


      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#6B7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Pretraga po nazivu ili mestu..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      {/* Events Grid */}
      <View style={styles.content}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Svi događaji</Text>
          <Text style={styles.eventCount}>
            {filteredEvents.length} {filteredEvents.length === 1 ? 'događaj' : 'događaja'}
          </Text>
        </View>

        <FlatList
          data={filteredEvents}
          renderItem={renderEventItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          columnWrapperStyle={styles.row}
          onEndReached={() => loadEvents()}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loading && hasMore ? (
              <ActivityIndicator size="small" color="#006daa" style={{ marginVertical: 16 }} />
            ) : null
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    backgroundColor: '#FFFFFF',
  },
  logo: {
    width: 160,
    height: 50,
    resizeMode: 'contain',
  },

  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12, // radi u RN 0.71+, ako ne radi koristi marginRight
  },

  filterButton: {
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    marginLeft: 8, // razmak između dugmadi
  },

  greeting: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    color: '#111827',
    letterSpacing: -0.5,
  },
  searchContainer: {
  paddingHorizontal: 20,
  paddingBottom: 20,
  backgroundColor: '#FFFFFF',
},
searchBar: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#F3F4F6',
  borderRadius: 16,
  paddingHorizontal: 16,
},
searchIcon: {
  marginRight: 12,
},
searchInput: {
  flex: 1,
  fontSize: 16,
  color: '#111827',
  paddingVertical: 10, // Dodajte ovu liniju
},
  categoriesContainer: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 20,
  },
  categoriesList: {
    paddingHorizontal: 20,
  },
  categoryChip: {
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 12,
  },
  categoryChipActive: {
    backgroundColor: '#006daa',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#6B7280',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#111827',
    letterSpacing: -0.3,
  },
  eventCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  listContainer: {
    paddingBottom: 100,
  },
  row: {
    justifyContent: 'space-between',
  },
  separator: {
    height: 20,
  },
  eventCard: {
    width: cardWidth,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
    marginBottom: 20,
  },
  eventImageContainer: {
    position: 'relative',
    height: 140,
  },
  eventImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  dateContainer: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dateDay: {
    fontSize: 16,
    color: '#111827',
    lineHeight: 18,
  },
  dateMonth: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 14,
  },
  eventContent: {
    padding: 16,
  },
  eventName: {
    fontSize: 16,
    color: '#111827',
    lineHeight: 22,
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  eventDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 6,
    flex: 1,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 14,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  priceText: {
    fontWeight: '500',
    marginTop: 10,
    marginLeft: 2,
    fontSize: 14,
    color: '#006daa',
  },
  // NOVO: Stilovi za poruku o nedostatku događaja
  noEventsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  noEventsText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  // Dodati stilovi za MenuOptions kako bi izbegli ponavljanje koda
  menuOptionsContainer: {
    width: 105,
    marginTop: 45,
    marginLeft: 10,
    borderRadius: 10,
    backgroundColor: '#fff',
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  menuOptionWrapper: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  menuOptionText: {
    fontSize: 14,
    color: '#111827',
    flexWrap: 'wrap',  
    lineHeight: 20,
  },
});