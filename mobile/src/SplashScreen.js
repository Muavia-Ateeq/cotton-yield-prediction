import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from './theme';

export default function SplashScreen({ navigation }) {
  const scale = useRef(new Animated.Value(0.7)).current;
  const fade = useRef(new Animated.Value(0)).current;
  const floatY = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 5, tension: 70, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatY, { toValue: -10, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(floatY, { toValue: 0, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(rotateAnim, { toValue: 1, duration: 1100, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(rotateAnim, { toValue: 0, duration: 1100, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.06, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    const timer = setTimeout(() => navigation.replace('Login'), 3000);
    return () => clearTimeout(timer);
  }, []);

  const rotate = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['-8deg', '8deg'] });

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View
        style={[styles.logoBox, { opacity: fade, transform: [{ scale }, { translateY: floatY }] }]}
      >
        {/* Cotton boll — overlapping puffy circles */}
        <Animated.View style={[styles.cottonWrap, { transform: [{ scale: pulse }] }]}>
          <View style={[styles.puff, styles.puffTL]} />
          <View style={[styles.puff, styles.puffTR]} />
          <View style={[styles.puff, styles.puffBL]} />
          <View style={[styles.puff, styles.puffBR]} />
          <View style={styles.puffCenter}>
            <View style={styles.cottonSeed} />
          </View>
        </Animated.View>

        {/* Green leaf accent badge */}
        <Animated.View style={[styles.leafBadge, { transform: [{ rotate }] }]}>
          <Ionicons name="leaf" size={22} color="#fff" />
        </Animated.View>
      </Animated.View>

      <Animated.Text style={[styles.title, { opacity: fade }]}>CottonYield AI</Animated.Text>
      <Animated.Text style={[styles.subtitle, { opacity: fade }]}>Predict smarter. Grow better.</Animated.Text>

      <Animated.View style={[styles.dotsWrap, { opacity: fade }]}>
        <View style={styles.dot} />
        <View style={[styles.dot, styles.dotActive]} />
        <View style={styles.dot} />
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  logoBox: {
    width: 150, height: 150, borderRadius: 40, backgroundColor: COLORS.white,
    alignItems: 'center', justifyContent: 'center', marginBottom: 30,
    shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 18, shadowOffset: { width: 0, height: 10 }, elevation: 10,
  },

  cottonWrap: { width: 104, height: 104, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  puff: {
    position: 'absolute', width: 42, height: 42, borderRadius: 21,
    backgroundColor: '#FAFCF5', borderWidth: 2, borderColor: '#D8E5BA',
  },
  puffTL: { top: 2, left: 4 },
  puffTR: { top: 2, right: 4 },
  puffBL: { bottom: 2, left: 4 },
  puffBR: { bottom: 2, right: 4 },
  puffCenter: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: '#FFFFFF',
    borderWidth: 2.5, borderColor: '#B8C892', alignItems: 'center', justifyContent: 'center',
  },
  cottonSeed: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#8A6D3F' },

  leafBadge: {
    position: 'absolute', right: -8, top: -8, width: 48, height: 48, borderRadius: 24,
    backgroundColor: COLORS.success || '#22A45D',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 4, borderColor: COLORS.primary,
  },

  title: { color: '#fff', fontSize: 31, fontWeight: '800', letterSpacing: 0.4 },
  subtitle: { color: COLORS.primaryLight, fontSize: 15, marginTop: 8, fontWeight: '500' },
  dotsWrap: { flexDirection: 'row', gap: 8, marginTop: 34 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primaryLight, opacity: 0.55 },
  dotActive: { width: 24, opacity: 1 },
});