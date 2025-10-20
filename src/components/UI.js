import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../theme';

export const colors = theme.palette;

const baseButton = {
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: theme.radius.md,
  paddingVertical: 14,
  paddingHorizontal: 20,
  flexDirection: 'row',
  gap: 8,
  color: '#FFFFFF', // ✅ updated text color to white
};


const buttonVariants = {
  primary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    borderWidth: 1
  },
  secondary: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.outline,
    borderWidth: 1
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: colors.primary,
    borderWidth: 1.5
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderWidth: 0
  },
  danger: {
    backgroundColor: colors.danger,
    borderColor: colors.danger,
    borderWidth: 1
  }
};

export function Screen({ children, style, inset = true }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true
      }),
      Animated.spring(translateY, {
        toValue: 0,
        damping: 14,
        stiffness: 140,
        mass: 0.6,
        useNativeDriver: true
      })
    ]).start();
  }, [opacity, translateY]);

  return (
    <Animated.View
      style={[
        styles.screen,
        inset === false && { paddingHorizontal: 0, paddingTop: 0 },
        { opacity, transform: [{ translateY }] },
        style
      ]}
    >
      {children}
    </Animated.View>
  );
}

const buttonTextVariants = {
  primary: colors.primaryText,
  secondary: colors.primaryText,
  outline: colors.primary,
  ghost: colors.primary,
  danger: colors.primaryText
};

export function Button({
  title,
  onPress,
  style,
  textStyle,
  variant = 'primary',
  icon,
  iconPosition = 'left',
  disabled
}) {
  const appliedVariant = buttonVariants[variant] || buttonVariants.primary;
  const textColor = buttonTextVariants[variant] || buttonTextVariants.primary;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.88}
      style={[
        baseButton,
        appliedVariant,
        disabled && { opacity: 0.4 },
        style
      ]}
    >
      {icon && iconPosition === 'left' ? icon : null}
      <Text style={[styles.buttonText, { color: textColor }, textStyle]}>{title}</Text>
      {icon && iconPosition === 'right' ? icon : null}
    </TouchableOpacity>
  );
}

export function IconButton({ name, size = 20, color = colors.primary, style, onPress, variant = 'ghost' }) {
  const appliedVariant = buttonVariants[variant] || buttonVariants.ghost;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={[baseButton, { paddingHorizontal: 12, paddingVertical: 10 }, appliedVariant, style]}
    >
      <Ionicons name={name} size={size} color={color} />
    </TouchableOpacity>
  );
}

export function Input({ label, error, style, ...props }) {
  return (
    <View style={{ marginBottom: theme.spacing.lg }}>
      {label ? (
        <Text style={[styles.label, error && { color: colors.danger }]}>{label}</Text>
      ) : null}
      <TextInput
        {...props}
        placeholderTextColor={colors.mutedAlt}
        style={[
          styles.input,
          error && { borderColor: colors.danger },
          style
        ]}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

export function Card({ children, style }) {
  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
}

export function SectionHeader({ title, actionLabel, onActionPress, style }) {
  return (
    <View style={[styles.sectionHeader, style]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {actionLabel ? (
        <TouchableOpacity onPress={onActionPress}>
          <Text style={styles.sectionAction}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const toastVariants = {
  success: colors.success,
  danger: colors.danger,
  warning: colors.warning,
  info: colors.info
};

export function Toast({ visible, text, onClose, variant = 'success' }) {
  if (!visible) return null;
  const backgroundColor = toastVariants[variant] || colors.surfaceAlt;
  return (
    <View pointerEvents="box-none" style={styles.toastWrapper}>
      <View pointerEvents="auto" style={[styles.toastContainer, { backgroundColor }]}>
        <Text style={styles.toastText}>{text}</Text>
      </View>
    </View>
  );
}

export function Divider({ style }) {
  return <View style={[styles.divider, style]} />;
}

export function ListRow({ label, helper, onPress, rightIcon = 'chevron-forward', style, labelStyle, helperStyle }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={onPress ? 0.75 : 1} style={[styles.listRow, style]}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.listLabel, labelStyle]}>{label}</Text>
        {helper ? <Text style={[styles.listHelper, helperStyle]}>{helper}</Text> : null}
      </View>
      {rightIcon ? <Ionicons name={rightIcon} size={18} color={colors.subtleText} /> : null}
    </TouchableOpacity>
  );
}

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xxl
  },
  buttonText: {
    fontWeight: '700',
    fontSize: 16
  },
  label: {
    color: colors.subtleText,
    marginBottom: theme.spacing.sm,
    fontWeight: '600',
    letterSpacing: 0.3
  },
  error: {
    color: colors.danger,
    marginTop: theme.spacing.xs,
    fontSize: 13
  },
  
   input: {
    backgroundColor: '#E9E8E8',
    borderRadius: 10,
    borderWidth: 1.2,
    borderColor: '#0F3E48',
    fontFamily: 'serif',
    fontWeight: 400,
    paddingHorizontal: 10,
    paddingVertical: 15,
     marginLeft: 10,
    marginRight: 10,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: colors.outline,
    ...theme.shadows.card
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md
  },
  sectionTitle: {
    color: colors.subtleText,
    fontSize: 18,
    fontWeight: '700'
  },
  sectionAction: {
    color: colors.accent,
    fontWeight: '600'
  },
  toastWrapper: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    zIndex: 2000,
    elevation: 2000
  },
  toastContainer: {
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    maxWidth: '86%'
  },
  toastText: {
    color: '#fff',
    fontWeight: '700'
  },
  divider: {
    height: 1,
    backgroundColor: colors.outline,
    opacity: 0.5
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md
  },
  listLabel: {
    color: colors.subtleText,
    fontWeight: '600',
    fontSize: 16
  },
  listHelper: {
    color: colors.mutedAlt,
    fontSize: 14,
    marginTop: 2
  }
});

export default {
  colors,
  Screen,
  Button,
  IconButton,
  Input,
  Card,
  Toast,
  Divider,
  SectionHeader,
  ListRow,
  styles
};



















