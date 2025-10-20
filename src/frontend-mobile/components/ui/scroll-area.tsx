import React from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  ScrollViewProps,
  ViewStyle,
} from 'react-native';

export interface ScrollAreaProps extends ScrollViewProps {
  children: React.ReactNode;
  className?: string;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  horizontal?: boolean;
  showsVerticalScrollIndicator?: boolean;
  showsHorizontalScrollIndicator?: boolean;
}

export const ScrollArea: React.FC<ScrollAreaProps> = ({
  children,
  className,
  style,
  contentContainerStyle,
  horizontal = false,
  showsVerticalScrollIndicator = true,
  showsHorizontalScrollIndicator = true,
  ...props
}) => {
  return (
    <View style={[styles.container, style]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, contentContainerStyle]}
        horizontal={horizontal}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
        bounces={true}
        scrollEventThrottle={16}
        {...props}>
        {children}
      </ScrollView>
    </View>
  );
};

export interface ScrollBarProps {
  orientation?: 'vertical' | 'horizontal';
  style?: ViewStyle;
}

export const ScrollBar: React.FC<ScrollBarProps> = ({
  orientation = 'vertical',
  style,
}) => {
  // In React Native, scroll bars are handled automatically by ScrollView
  // This component exists for API compatibility but doesn't render anything
  return null;
};

export interface ScrollAreaViewportProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const ScrollAreaViewport: React.FC<ScrollAreaViewportProps> = ({
  children,
  style,
}) => {
  return <View style={[styles.viewport, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  viewport: {
    flex: 1,
  },
});

// Export additional utility components for compatibility
export const ScrollAreaScrollbar = ScrollBar;
export const ScrollAreaThumb = View;
export const ScrollAreaCorner = View;