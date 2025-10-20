// CalendarHeader.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface CalendarHeaderProps {
  year: number;
  onPrevYear: () => void;
  onNextYear: () => void;
  // Dodajemo novi prop
  renderRightContent?: () => React.ReactNode; 
}

export function CalendarHeader({ year, onPrevYear, onNextYear, renderRightContent }: CalendarHeaderProps) {
  return (
    <View style={headerStyles.headerContainer}>
      <TouchableOpacity onPress={onPrevYear} style={headerStyles.arrowButton}>
        <Text style={headerStyles.arrowText}>{'<'}</Text>
      </TouchableOpacity>
      <Text style={headerStyles.yearText}>{year}</Text>
      <TouchableOpacity onPress={onNextYear} style={headerStyles.arrowButton}>
        <Text style={headerStyles.arrowText}>{'>'}</Text>
      </TouchableOpacity>

      <View style={headerStyles.rightContentContainer}>
        {renderRightContent ? renderRightContent() : (
          // Opcionalno: ovde su bile vaše originalne ikonice ako ih CalendarHeader renderuje
          // Sada ih uklanjamo ili ih zamenjuje renderRightContent
          // <TouchableOpacity><Text>Ikonica 1</Text></TouchableOpacity>
          // <TouchableOpacity><Text>Ikonica 2</Text></TouchableOpacity>
          // <TouchableOpacity><Text>Ikonica 3</Text></TouchableOpacity>
          <View /> // Prazan View ako nema custom sadržaja
        )}
      </View>
    </View>
  );
}

const headerStyles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Ovo bi trebalo da razmakne strelice i desni sadržaj
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  arrowButton: {
    padding: 10,
  },
  arrowText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#006daa',
  },
  yearText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#006daa',
  },
  rightContentContainer: {
    flexDirection: 'row', // Ako treba da poravna stavke legende desno
    // Dodajte stilove da se pozicionira gde želite
  }
});