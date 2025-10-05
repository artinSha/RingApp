import React from 'react';
import { StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';

type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

interface ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'default', 
  size = 'default',
  onPress,
  disabled = false,
  style,
  textStyle,
  ...props 
}) => {
  const buttonStyles = [
    styles.base, 
    styles[variant], 
    styles[`${size}Size`],
    disabled && styles.disabled,
    style
  ];
  const buttonTextStyles = [
    styles.text, 
    styles[`${variant}Text`], 
    styles[`${size}SizeText`],
    disabled && styles.disabledText,
    textStyle
  ];

  return (
    <TouchableOpacity 
      style={buttonStyles} 
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      {...props}
    >
      <Text style={buttonTextStyles}>{children}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  
  // Variants
  default: {
    backgroundColor: '#fb923c',
    borderColor: 'transparent',
  },
  defaultText: {
    color: '#f9fafb',
  },
  
  destructive: {
    backgroundColor: '#ef4444',
    borderColor: 'transparent',
  },
  destructiveText: {
    color: '#ffffff',
  },
  
  outline: {
    backgroundColor: 'transparent',
    borderColor: 'rgba(75, 85, 99, 0.6)',
  },
  outlineText: {
    color: '#d1d5db',
  },
  
  secondary: {
    backgroundColor: 'rgba(75, 85, 99, 0.6)',
    borderColor: 'transparent',
  },
  secondaryText: {
    color: '#f9fafb',
  },
  
  ghost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  ghostText: {
    color: '#d1d5db',
  },
  
  link: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  linkText: {
    color: '#fb923c',
    textDecorationLine: 'underline',
  },
  
  // Sizes
  defaultSize: {
    height: 36,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  defaultSizeText: {},
  
  sm: {
    height: 32,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  smText: {
    fontSize: 12,
  },
  smSize: {
    height: 32,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  smSizeText: {
    fontSize: 12,
  },
  
  lg: {
    height: 40,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  lgText: {
    fontSize: 16,
  },
  lgSize: {
    height: 40,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  lgSizeText: {
    fontSize: 16,
  },
  
  icon: {
    width: 36,
    height: 36,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  iconText: {},
  iconSize: {
    width: 36,
    height: 36,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  iconSizeText: {},
  
  // Disabled
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.5,
  },
});

export { Button };

