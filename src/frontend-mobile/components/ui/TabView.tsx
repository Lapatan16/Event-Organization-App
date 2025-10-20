import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';

interface Tab {
  key: string;
  title: string;
}

interface TabViewProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabKey: string) => void;
  children: React.ReactNode;
}

export const TabView: React.FC<TabViewProps> = ({
  tabs,
  activeTab,
  onTabChange,
  children,
}) => {
  return (
    <View style={styles.container}>
      {/* Tab Headers */}
      <View style={styles.tabHeader}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && styles.activeTab,
            ]}
            onPress={() => onTabChange(tab.key)}>
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && styles.activeTabText,
              ]}>
              {tab.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      <View style={styles.tabContent}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 24,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 24,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#655cba',
  },
  tabText: {
    fontFamily: 'Manrope',
    fontSize: 14,
    color: '#1d1d1d80',
    letterSpacing: -0.28,
  },
  activeTabText: {
    color: '#655cba',
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
  },
});