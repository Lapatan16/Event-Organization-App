import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface AccordionItem {
  id: string;
  title: string;
  content?: string;
}

interface AccordionProps {
  items: AccordionItem[];
}

export const Accordion: React.FC<AccordionProps> = ({items}) => {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleItem = (itemId: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId],
    );
  };

  return (
    <View style={styles.container}>
      {items.map((item) => {
        const isExpanded = expandedItems.includes(item.id);
        return (
          <View key={item.id} style={styles.item}>
            <TouchableOpacity
              style={styles.header}
              onPress={() => toggleItem(item.id)}>
              <Text style={styles.title}>{item.title}</Text>
              <Icon
                name={isExpanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                size={20}
                color="#1d1d1d80"
              />
            </TouchableOpacity>
            {isExpanded && item.content && (
              <View style={styles.content}>
                <Text style={styles.contentText}>{item.content}</Text>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    overflow: 'hidden',
  },
  item: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  title: {
    fontFamily: 'Manrope',
    fontSize: 14,
    color: '#1c1c1c',
    letterSpacing: -0.28,
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  contentText: {
    fontFamily: 'Manrope',
    fontSize: 12,
    color: '#1d1d1d80',
    letterSpacing: -0.24,
    lineHeight: 18,
  },
});