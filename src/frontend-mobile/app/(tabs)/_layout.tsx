import { Tabs } from "expo-router";
import { NotebookText, User, Ticket } from "lucide-react-native";
import { MenuProvider } from "react-native-popup-menu";
import Icon from "react-native-vector-icons/Ionicons";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const BAR_HEIGHT = 60; // base bar height

  return (
    <MenuProvider>
      <View style={{ flex: 1, backgroundColor: "#fff" }}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: "#006daa",
            tabBarInactiveTintColor: "#9CA3AF",
            tabBarShowLabel: false,
            // main tab bar styling
            tabBarStyle: {
              backgroundColor: "#fff",
              borderTopWidth: 1,
              borderTopColor: "#E5E7EB",
              height: BAR_HEIGHT + insets.bottom,     // include safe area
              paddingBottom: insets.bottom || 8,      // keep some bottom padding if no inset
              paddingTop: 6,                          // small top padding to balance vertical centering
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 8,
            },
            // try to remove per-item internal padding
            tabBarItemStyle: {
              paddingTop: 0,
              paddingBottom: 0,
              alignItems: "center",
              justifyContent: "center",
            },
            // ensure the icon itself has no added margin
            tabBarIconStyle: {
              marginTop: 0,
              marginBottom: 0,
            },
          }}
        >
          <Tabs.Screen
            name="events"
            options={{
              tabBarIcon: ({ focused }) => (
                // fixed-height wrapper (no flex:1) ensures perfect vertical centering
                <View style={{ height: BAR_HEIGHT, justifyContent: "center", alignItems: "center" }}>
                  <NotebookText size={24} color={focused ? "#006daa" : "#9CA3AF"} />
                </View>
              ),
            }}
          />
          <Tabs.Screen
            name="kalendar"
            options={{
              tabBarIcon: ({ color }) => (
                <View style={{ height: BAR_HEIGHT, justifyContent: "center", alignItems: "center" }}>
                  <Icon name="calendar-outline" color={color} size={24} />
                </View>
              ),
            }}
          />
          <Tabs.Screen
            name="tickets"
            options={{
              tabBarIcon: ({ focused }) => (
                <View style={{ height: BAR_HEIGHT, justifyContent: "center", alignItems: "center" }}>
                  <Ticket size={24} color={focused ? "#006daa" : "#9CA3AF"} />
                </View>
              ),
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              tabBarIcon: ({ focused }) => (
                <View style={{ height: BAR_HEIGHT, justifyContent: "center", alignItems: "center" }}>
                  <User size={24} color={focused ? "#006daa" : "#9CA3AF"} />
                </View>
              ),
            }}
          />
        </Tabs>
      </View>
    </MenuProvider>
  );
}
