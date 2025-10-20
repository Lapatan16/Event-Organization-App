import { Ticket } from '@/types/Ticket';
import { Location } from '@/types/Location';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { EventDisplayData } from '@/types/EventDisplayData';

const screenWidth = Dimensions.get('window').width;
const dayCellWidth = (screenWidth - 40) / 7;

interface MonthCalendarProps {
  month: string;
  year: number;
  monthIndex: number;
  events: Record<string, EventDisplayData[]>;
  onEventPress: (event: EventDisplayData) => void;
  selectedDate?: Date;
}

export function MonthCalendar({
  month,
  year,
  monthIndex,
  events,
  onEventPress,
  selectedDate
}: MonthCalendarProps) {

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    const firstDayJs = new Date(year, month, 1).getDay();
    return (firstDayJs + 6) % 7;
  };

  const formatDate = (year: number, month: number, day: number) => {
    const monthStr = (month + 1).toString().padStart(2, '0');
    const dayStr = day.toString().padStart(2, '0');
    return `${year}-${monthStr}-${dayStr}`;
  };

  const getEventRows = (eventsForMonth: Record<string, EventDisplayData[]>) => {
    const rows: EventDisplayData[][] = [];
    const occupiedCells: { [date: string]: number[] } = {};

    const allEventsInMonth: EventDisplayData[] = [];
    for (const date in eventsForMonth) {
      if (date.startsWith(`${year}-${String(monthIndex + 1).padStart(2, '0')}`)) {
        allEventsInMonth.push(...eventsForMonth[date]);
      }
    }

    allEventsInMonth.sort((a, b) => {
      const startA = new Date(a.startDate).getTime();
      const startB = new Date(b.startDate).getTime();
      if (startA !== startB) return startA - startB;

      const durationA = (new Date(a.endDate).getTime() - startA);
      const durationB = (new Date(b.endDate).getTime() - startB);
      return durationB - durationA;
    });

    const uniqueEventsMap = new Map<string, EventDisplayData>();
    allEventsInMonth.forEach(event => {
      uniqueEventsMap.set(event.id, event);
    });
    const uniqueEvents = Array.from(uniqueEventsMap.values());

    uniqueEvents.forEach(event => {
      const startDate = new Date(event.startDate);
      const endDate = new Date(event.endDate);

      let placed = false;
      for (let rowIndex = 0; rowIndex < rows.length + 1; rowIndex++) {
        if (!rows[rowIndex]) {
          rows[rowIndex] = [];
        }

        let canPlaceInRow = true;
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
          const dateKey = d.toISOString().split('T')[0];
          const monthOfEvent = d.getMonth();
          const eventYear = d.getFullYear();

          if (monthOfEvent === monthIndex && eventYear === year) {
            if (occupiedCells[dateKey] && occupiedCells[dateKey].includes(rowIndex)) {
              canPlaceInRow = false;
              break;
            }
          }
        }

        if (canPlaceInRow) {
          rows[rowIndex].push(event);
          for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dateKey = d.toISOString().split('T')[0];
            const monthOfEvent = d.getMonth();
            const eventYear = d.getFullYear();

            if (monthOfEvent === monthIndex && eventYear === year) {
              if (!occupiedCells[dateKey]) {
                occupiedCells[dateKey] = [];
              }
              occupiedCells[dateKey].push(rowIndex);
            }
          }
          placed = true;
          break;
        }
      }
    });
    return rows;
  };

  const eventRows = getEventRows(events);

  const renderMonthGrid = () => {
    const daysInMonth = getDaysInMonth(year, monthIndex);
    const firstDay = getFirstDayOfMonth(year, monthIndex);

    const totalDaysInGrid = Math.ceil((daysInMonth + firstDay) / 7) * 7;

    const today = selectedDate?.getDate();
    const isCurrentMonth = selectedDate && selectedDate.getMonth() === monthIndex && selectedDate.getFullYear() === year;

    const gridCells = [];
    for (let i = 0; i < totalDaysInGrid; i++) {
      const dayOffset = i - firstDay + 1;
      const currentDay = dayOffset > 0 && dayOffset <= daysInMonth ? dayOffset : null;

      const isToday = isCurrentMonth && currentDay === today;

      gridCells.push(
        <View
          key={`cell-${monthIndex}-${i}`}
          style={[
            styles.dayCell,
            { width: dayCellWidth },
            currentDay && styles.dayCellWithNumber,
          ]}
        >
          {currentDay !== null && (
            <View style={[styles.dayNumberContainer, isToday && styles.todayContainer]}>
              <Text style={[styles.dayNumberText, isToday && styles.todayText]}>
                {currentDay}
              </Text>
            </View>
          )}
        </View>
      );
    }
    return gridCells;
  };

  return (
    <View style={styles.monthContainer}>
      <Text style={styles.monthTitle}>{month}</Text>
      <View style={styles.weekdaysHeader}>
        {['Pon', 'Uto', 'Sre', 'Čet', 'Pet', 'Sub', 'Ned'].map((dayName) => (
          <Text key={dayName} style={styles.weekdayText}>{dayName}</Text>
        ))}
      </View>
      <View style={styles.daysGrid}>
        {renderMonthGrid()}
        {eventRows.map((row, rowIndex) => (
          row.map(event => {
            const startDate = new Date(event.startDate);
            const endDate = new Date(event.endDate);

            const eventStartMonth = startDate.getMonth();
            const eventEndMonth = endDate.getMonth();
            const eventStartYear = startDate.getFullYear();
            const eventEndYear = endDate.getFullYear();

            if (eventStartYear > year || eventEndYear < year ||
              (eventStartYear === year && eventStartMonth > monthIndex) ||
              (eventEndYear === year && eventEndMonth < monthIndex)) {
              return null;
            }

            const currentMonthFirstDay = getFirstDayOfMonth(year, monthIndex);

            let displayStartDate = new Date(Math.max(startDate.getTime(), new Date(year, monthIndex, 1).getTime()));
            let displayEndDate = new Date(Math.min(endDate.getTime(), new Date(year, monthIndex + 1, 0).getTime()));

            if (displayStartDate.getMonth() !== monthIndex || displayStartDate.getFullYear() !== year) {
              displayStartDate = new Date(year, monthIndex, 1);
            }
            if (displayEndDate.getMonth() !== monthIndex || displayEndDate.getFullYear() !== year) {
              displayEndDate = new Date(year, monthIndex + 1, 0);
            }

            const segments = [];
            let segmentStart = new Date(displayStartDate);

            while (segmentStart <= displayEndDate) {
              const dayOfWeekOfSegmentStart = segmentStart.getDay();
              const adjustedDayOfWeek = (dayOfWeekOfSegmentStart + 6) % 7;
              const daysInCurrentWeek = 7 - adjustedDayOfWeek;
              const remainingDaysOfEvent = (displayEndDate.getTime() - segmentStart.getTime()) / (1000 * 60 * 60 * 24) + 1;
              const segmentLength = Math.min(daysInCurrentWeek, remainingDaysOfEvent);

              const segmentWidth = segmentLength * dayCellWidth;
              const segmentLeft = adjustedDayOfWeek * dayCellWidth;

              const startDayOfMonth = segmentStart.getDate();
              const startRow = Math.floor((startDayOfMonth - 1 + currentMonthFirstDay) / 7);

              const EVENT_BAR_HEIGHT = 20;
              const EVENT_BAR_SPACING = 2;
              const dayNumberContainerHeight = styles.dayNumberContainer.height as number;
              const segmentTop = (startRow * (styles.dayCell.minHeight as number)) + dayNumberContainerHeight + (rowIndex * (EVENT_BAR_HEIGHT + EVENT_BAR_SPACING));

              if (segmentStart.getMonth() === monthIndex && segmentStart.getFullYear() === year) {
                segments.push(
                  <TouchableOpacity
                    key={`event-bar-${event.id}-${rowIndex}-${segmentStart.getTime()}`}
                    style={[
                      styles.eventBar,
                      {
                        backgroundColor: event.color,
                        left: segmentLeft,
                        top: segmentTop,
                        width: segmentWidth,
                      },
                    ]}
                    onPress={() => onEventPress(event)}
                  >
                    <Text style={styles.eventBarText} numberOfLines={1} ellipsizeMode="tail">
                      {event.title}
                    </Text>
                  </TouchableOpacity>
                );
              }
              segmentStart.setDate(segmentStart.getDate() + segmentLength);
            }
            return segments;
          })
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  monthContainer: {
    flex: 1,
    paddingVertical: 20,
    minHeight: 600,
    position: 'relative',
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#006daa',
    marginBottom: 16,
    textAlign: 'center',
  },
  weekdaysHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  weekdayText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#888',
    width: dayCellWidth,
    textAlign: 'center',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
    position: 'relative',
  },
  dayCell: {
    minHeight: 100,
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'relative',
  },
  dayCellWithNumber: {},
  emptyDay: {
    width: dayCellWidth,
    minHeight: 80,
  },
  dayNumberContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginTop: 5,
  },
  dayNumberText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  eventBar: {
    position: 'absolute',
    height: 20,
    borderRadius: 5,
    justifyContent: 'center',
    paddingHorizontal: 5,
    overflow: 'hidden',
    zIndex: 1,
  },
  eventBarText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  todayContainer: {
    backgroundColor: '#006daa',
  },
  todayText: {
    color: '#ffffff',
  },
});
