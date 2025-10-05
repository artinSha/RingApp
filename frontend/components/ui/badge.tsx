import React from 'react';
import { StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'default', 
  style,
  textStyle,
  ...props 
}) => {
  const badgeStyles = [styles.base, styles[variant], style];
  const badgeTextStyles = [styles.text, styles[`${variant}Text`], textStyle];

  return (
    <View style={badgeStyles} {...props}>
      <Text style={badgeTextStyles}>{children}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
  },
  
  // Variants
  default: {
    backgroundColor: '#fb923c',
    borderColor: 'transparent',
  },
  defaultText: {
    color: '#111827',
  },
  
  secondary: {
    backgroundColor: 'rgba(75, 85, 99, 0.6)',
    borderColor: 'transparent',
  },
  secondaryText: {
    color: '#f9fafb',
  },
  
  destructive: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: 'rgba(239, 68, 68, 0.5)',
  },
  destructiveText: {
    color: '#ef4444',
  },
  
  outline: {
    backgroundColor: 'transparent',
    borderColor: 'rgba(75, 85, 99, 0.6)',
  },
  outlineText: {
    color: '#d1d5db',
  },
  
  success: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderColor: 'rgba(34, 197, 94, 0.5)',
  },
  successText: {
    color: '#22c55e',
  },
  
  warning: {
    backgroundColor: 'rgba(251, 146, 60, 0.2)',
    borderColor: 'rgba(251, 146, 60, 0.5)',
  },
  warningText: {
    color: '#fb923c',
  },
});

export { Badge };

