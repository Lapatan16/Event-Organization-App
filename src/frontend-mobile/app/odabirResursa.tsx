import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Resource } from '@/types/Event';
import Constants from 'expo-constants';
import { useAuth } from '@/contexts/AuthContext';
const API_URL = 
  Constants.expoConfig?.extra?.apiUrl;

export default function OdabirResursaScreen() {
  const params = useLocalSearchParams();
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
      eventLocation,
      ticketQuantity,
      sold,
      ticketId,
      price,
    } = useLocalSearchParams();

  const [resources, setResources] = useState<Resource[]>([]);
  const [selected, setSelected] = useState<{ [id: string]: number }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const res = await fetch(`${API_URL}/api/Event/${eventId}/public-resources`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
          }
        });
        const data = await res.json();
        setResources(data);
      } catch (err) {
        console.error("Error fetching resources:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, []);

  const increment = (id: string, quantity: number, reserved: number) => {
    setSelected(prev => {
      const current = prev[id] || 0;
      const limit = quantity - reserved;

      if (current < limit) {
        return { ...prev, [id]: current + 1 };
      }

      return prev;
    });
  };

  const decrement = (id: string) => {
    setSelected(prev => {
      const current = prev[id] || 0;
      if (current <= 1) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: current - 1 };
    });
  };

  const handleNext = () => {
    const chosenResources = resources
      .filter(r => selected[r.id])
      .map(r => ({
        ...r,
        quantity: selected[r.id],
      }));

    router.push({
      pathname: '/naplata',
      params: {
        ...params, // keep old ticket + user info
        resources: JSON.stringify(chosenResources), // pass chosen resources
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#1c1c1c" />
        </TouchableOpacity>

        <Text style={styles.title}>Dodatne ponude</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#006daa" style={{ marginTop: 20 }} />
        ) : resources.length === 0 ? (
          <Text>Nema dostupnih ponuda za ovaj događaj.</Text>
        ) : (
          resources.map((resource) => (
            <View key={resource.id} style={styles.resourceCard}>
              
              <View style={styles.resourceInfo}>
                <Text style={styles.resourceName}>{resource.name}</Text>
                {resource.name ? (
                  <Text style={styles.resourceDesc}>{resource.quantity - resource.reserved}</Text>
                ) : null}
                <Text style={styles.resourcePrice}>{resource.price} RSD</Text>
              </View>
              <View style={styles.counter}>
                <TouchableOpacity onPress={() => decrement(resource.id)} style={styles.counterBtn}>
                  <Text>-</Text>
                </TouchableOpacity>
                <Text style={styles.counterText}>{selected[resource.id] || 0}</Text>
                <TouchableOpacity onPress={() => increment(resource.id, resource.quantity, resource.reserved)} style={styles.counterBtn}>
                  <Text>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        <TouchableOpacity style={styles.submitBtn} onPress={handleNext}>
          <Text style={styles.submitText}>Nastavi</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  backButton: {
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  image: {
    width: 80,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  resourceInfo: {
    flex: 1,
  },
  resourceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1c1c1c',
  },
  resourceDesc: {
    fontSize: 12,
    color: '#6B7280',
    marginVertical: 2,
  },
  resourcePrice: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 4,
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
    marginHorizontal: 8,
    fontSize: 16,
  },
  submitBtn: {
    marginTop: 20,
    backgroundColor: '#006daa',
    padding: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  submitText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
