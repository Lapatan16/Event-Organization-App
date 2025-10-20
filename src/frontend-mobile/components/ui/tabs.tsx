import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';

export interface Tab {
  key: string;
  title: string;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabKey: string) => void;
  children?: React.ReactNode;
  style?: any;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  children,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && styles.activeTab,
              tab.disabled && styles.disabledTab,
            ]}
            onPress={() => !tab.disabled && onTabChange(tab.key)}
            disabled={tab.disabled}>
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && styles.activeTabText,
                tab.disabled && styles.disabledTabText,
              ]}>
              {tab.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      {children && (
        <View style={styles.content}>
          {children}
        </View>
      )}
    </View>
  );
};

export interface TabsContentProps {
  value: string;
  activeTab: string;
  children: React.ReactNode;
  style?: any;
}

export const TabsContent: React.FC<TabsContentProps> = ({
  value,
  activeTab,
  children,
  style,
}) => {
  if (value !== activeTab) {
    return null;
  }

  return <View style={[styles.tabContent, style]}>{children}</View>;
};

export interface TabsListProps {
  children: React.ReactNode;
  style?: any;
}

export const TabsList: React.FC<TabsListProps> = ({children, style}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={[styles.tabsList, style]}
      contentContainerStyle={styles.tabsListContent}>
      {children}
    </ScrollView>
  );
};

export interface TabsTriggerProps {
  value: string;
  activeTab: string;
  onTabChange: (value: string) => void;
  children: React.ReactNode;
  disabled?: boolean;
  style?: any;
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({
  value,
  activeTab,
  onTabChange,
  children,
  disabled,
  style,
}) => {
  const isActive = activeTab === value;

  return (
    <TouchableOpacity
      style={[
        styles.trigger,
        isActive && styles.activeTrigger,
        disabled && styles.disabledTrigger,
        style,
      ]}
      onPress={() => !disabled && onTabChange(value)}
      disabled={disabled}>
      <Text
        style={[
          styles.triggerText,
          isActive && styles.activeTriggerText,
          disabled && styles.disabledTriggerText,
        ]}>
        {children}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabsContainer: {
    flexGrow: 0,
  },
  tabsContent: {
    paddingHorizontal: 4,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 2,
    borderRadius: 6,
    backgroundColor: 'transparent',
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#655cba',
  },
  disabledTab: {
    opacity: 0.5,
  },
  tabText: {
    fontFamily: 'Manrope',
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    textAlign: 'center',
  },
  activeTabText: {
    color: '#ffffff',
  },
  disabledTabText: {
    color: '#9ca3af',
  },
  content: {
    flex: 1,
    marginTop: 16,
  },
  tabContent: {
    flex: 1,
  },
  tabsList: {
    flexGrow: 0,
  },
  tabsListContent: {
    paddingHorizontal: 4,
  },
  trigger: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 2,
    borderRadius: 6,
    backgroundColor: 'transparent',
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTrigger: {
    backgroundColor: '#655cba',
  },
  disabledTrigger: {
    opacity: 0.5,
  },
  triggerText: {
    fontFamily: 'Manrope',
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    textAlign: 'center',
  },
  activeTriggerText: {
    color: '#ffffff',
  },
  disabledTriggerText: {
    color: '#9ca3af',
  },
});