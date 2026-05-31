import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BarChart } from 'react-native-chart-kit';
import { COLORS } from './theme';
import { supabase } from './supabase';

const LOC_YIELDS = {
  labels: ['Faisalabad', 'Multan', 'Rajanpur', 'Khanpur'],
  datasets: [{ data: [612, 583, 573, 558] }],
};

export default function HomeScreen({ navigation, route }) {
  const user = route?.params?.user || 'Researcher';
  const W = Dimensions.get('window').width - 32;
  const [bestPred, setBestPred] = useState(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('predictions')
        .select('predicted_yield, genotype, location, water_supply_pct, n_rate_kg_ha')
        .order('predicted_yield', { ascending: false })
        .limit(1);
      if (data && data.length > 0) setBestPred(data[0]);
    })();
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <View>
            <Text style={styles.welcome}>Welcome back</Text>
            <Text style={styles.userName}>{user}</Text>
          </View>
          <TouchableOpacity style={styles.bellBox} activeOpacity={0.7}>
            <Ionicons name="notifications-outline" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.hero}>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroLabel}>
              {bestPred ? 'Your best predicted fiber yield' : 'Top variety avg fiber yield'}
            </Text>
            <Text style={styles.heroBig}>
              {bestPred ? Math.round(bestPred.predicted_yield) : 668}
              <Text style={styles.heroUnit}> kg/ha</Text>
            </Text>
            <View style={styles.heroPill}>
              <Text style={styles.heroPillTxt}>
                {bestPred
                  ? `${bestPred.genotype} · ${bestPred.location} · ${bestPred.water_supply_pct}% · ${bestPred.n_rate_kg_ha}N`
                  : 'CKC-6 · highest avg yield variety'}
              </Text>
            </View>
          </View>
          <Ionicons name="leaf" size={86} color="#ffffff22" />
        </View>

        <View style={styles.statRow}>
          <View style={styles.statCard}>
            <View style={styles.statTop}>
              <Ionicons name="location-outline" size={18} color={COLORS.primary} />
              <Text style={styles.statBig}>4</Text>
            </View>
            <Text style={styles.statLabel}>Locations</Text>
          </View>
          <View style={[styles.statCard, styles.statAccent]}>
            <View style={styles.statTop}>
              <Ionicons name="git-branch-outline" size={18} color={COLORS.primary} />
              <Text style={styles.statBig}>5</Text>
            </View>
            <Text style={styles.statLabel}>Varieties</Text>
          </View>
        </View>
        <View style={styles.statRow}>
          <View style={styles.statCard}>
            <View style={styles.statTop}>
              <Ionicons name="water-outline" size={18} color={COLORS.primary} />
              <Text style={styles.statBig}>480</Text>
            </View>
            <Text style={styles.statLabel}>Field plots</Text>
          </View>
          <View style={[styles.statCard, styles.statAccent]}>
            <View style={styles.statTop}>
              <Ionicons name="bar-chart-outline" size={18} color={COLORS.primary} />
              <Text style={styles.statBig}>0.685</Text>
            </View>
            <Text style={styles.statLabel}>R² accuracy</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Yield by location</Text>
          <Text style={styles.cardSub}>Average fiber yield, kg/ha</Text>
          <BarChart
            data={LOC_YIELDS} width={W - 28} height={180} fromZero
            yAxisSuffix=""
            chartConfig={{
              backgroundGradientFrom: '#fff', backgroundGradientTo: '#fff',
              decimalPlaces: 0,
              color: () => COLORS.primary,
              labelColor: () => COLORS.muted,
              barPercentage: 0.55,
              propsForBackgroundLines: { stroke: COLORS.border },
            }}
            style={{ marginLeft: -14, marginTop: 4 }}
            withInnerLines={false}
            showValuesOnTopOfBars
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Recent activity</Text>
          {[
            { icon: 'checkmark-circle', color: COLORS.success, t: 'Model training complete', s: 'Ensemble R² = 0.685, PCC = 0.916' },
            { icon: 'sparkles',         color: COLORS.warning, t: 'SHAP analysis done',       s: 'Top: Water supply (174 kg/ha)' },
            { icon: 'cloud-upload-outline', color: COLORS.primary, t: 'Dataset prepared',     s: '480 plots · 4 cities · 2 years' },
          ].map((a, i, arr) => (
            <View key={i} style={[styles.actRow, i === arr.length - 1 && styles.actRowLast]}>
              <Ionicons name={a.icon} size={20} color={a.color} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.actTitle}>{a.t}</Text>
                <Text style={styles.actSub}>{a.s}</Text>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.shortcut} onPress={() => navigation.navigate('Predict')} activeOpacity={0.85}>
          <Ionicons name="sparkles" size={18} color={COLORS.primary} />
          <Text style={styles.shortcutTxt}>Go to yield prediction</Text>
          <Ionicons name="chevron-forward" size={18} color={COLORS.primary} />
        </TouchableOpacity>
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: 16, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 16 : 12 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  welcome: { color: COLORS.muted, fontSize: 12 },
  userName: { color: COLORS.text, fontSize: 20, fontWeight: '700', marginTop: 2 },
  bellBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' },
  hero: { backgroundColor: COLORS.primary, borderRadius: 18, padding: 18, flexDirection: 'row', alignItems: 'center', marginBottom: 14, overflow: 'hidden' },
  heroLabel: { color: '#fff', fontSize: 12, opacity: 0.85 },
  heroBig: { color: '#fff', fontSize: 34, fontWeight: '700', marginTop: 4 },
  heroUnit: { fontSize: 14, fontWeight: '500' },
  heroPill: { backgroundColor: '#ffffff25', alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, marginTop: 8 },
  heroPillTxt: { color: '#fff', fontSize: 11, fontWeight: '600' },
  statRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  statCard: { flex: 1, backgroundColor: COLORS.white, borderRadius: 14, padding: 14, borderWidth: 0.5, borderColor: COLORS.border },
  statAccent: { backgroundColor: COLORS.primaryLight },
  statTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statBig: { fontSize: 22, fontWeight: '700', color: COLORS.text },
  statLabel: { fontSize: 12, color: COLORS.muted, marginTop: 4 },
  card: { backgroundColor: COLORS.white, borderRadius: 14, padding: 14, marginTop: 14, borderWidth: 0.5, borderColor: COLORS.border },
  cardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  cardSub: { fontSize: 12, color: COLORS.muted, marginTop: 2, marginBottom: 8 },
  actRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: COLORS.border },
  actRowLast: { borderBottomWidth: 0 },
  actTitle: { fontSize: 13, color: COLORS.text, fontWeight: '600' },
  actSub: { fontSize: 11, color: COLORS.muted, marginTop: 2 },
  shortcut: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.primaryLight, borderWidth: 1, borderColor: COLORS.primary, borderRadius: 12, padding: 14, marginTop: 14 },
  shortcutTxt: { color: COLORS.primary, fontSize: 14, fontWeight: '700' },
});