import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from './theme';

const SHAP_FEATURES = [
  { name: 'Water supply',   value: 0.38 },
  { name: 'GDD total',      value: 0.31 },
  { name: 'Boll weight',    value: 0.28 },
  { name: 'Heat stress',    value: 0.24 },
  { name: 'N rate',         value: 0.22 },
  { name: 'NDVI Aug',       value: 0.19 },
];

const FEATURE_GROUPS = [
  { name: 'Management (irrigation & N)', pct: 46, color: COLORS.primary },
  { name: 'Genetic (QTL & SNP)',         pct: 28, color: COLORS.teal },
  { name: 'Climate & weather',           pct: 17, color: COLORS.primaryMid },
  { name: 'Soil & NDVI',                 pct:  9, color: COLORS.muted },
];

const MODELS = [
  { name: 'EXGEP Ensemble',    r2: 0.685, best: true },
  { name: 'Gradient Boosting', r2: 0.714 },
  { name: 'Random Forest',     r2: 0.698 },
  { name: 'XGBoost',           r2: 0.698 },
  { name: 'LightGBM',          r2: 0.688 },
  { name: 'Linear Regression', r2: 0.303 },
];

export default function AnalyticsScreen() {
  const maxShap = Math.max(...SHAP_FEATURES.map(f => f.value));

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.subLabel}>OVERALL MODEL PERFORMANCE</Text>
        <Text style={styles.pageTitle}>Analytics</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>What affects yield most?</Text>
          <Text style={styles.cardSub}>Mean |SHAP| value from the ensemble model</Text>
          {SHAP_FEATURES.map((f, i) => {
            const pct = (f.value / maxShap) * 100;
            return (
              <View key={i} style={styles.barRow}>
                <Text style={styles.barLabel}>{f.name}</Text>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: `${pct}%` }]} />
                </View>
                <Text style={styles.barVal}>{f.value.toFixed(2)}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Feature group contribution</Text>
          <Text style={styles.cardSub}>Where the predictive power comes from</Text>
          {FEATURE_GROUPS.map((g, i) => (
            <View key={i} style={{ marginTop: 10 }}>
              <View style={styles.groupRow}>
                <Text style={styles.groupName}>{g.name}</Text>
                <Text style={styles.groupPct}>{g.pct}%</Text>
              </View>
              <View style={styles.groupTrack}>
                <View style={[styles.groupFill, { width: `${g.pct}%`, backgroundColor: g.color }]} />
              </View>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Model leaderboard</Text>
          <Text style={styles.cardSub}>R² on unseen 2023 test data</Text>
          {MODELS.map((m, i, arr) => (
            <View key={i} style={[styles.modelRow, i === arr.length - 1 && styles.modelRowLast]}>
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={[styles.modelName, m.best && { color: COLORS.primary, fontWeight: '700' }]}>{m.name}</Text>
                {m.best && (
                  <View style={styles.bestBadge}><Text style={styles.bestTxt}>Best</Text></View>
                )}
              </View>
              <Text style={[styles.modelR2, m.best && { color: COLORS.primary }]}>{m.r2.toFixed(3)}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.card, styles.infoCard]}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle" size={18} color={COLORS.primary} />
            <Text style={styles.infoTitle}>About these numbers</Text>
          </View>
          <Text style={styles.infoText}>
            These stats come from the trained ensemble model evaluated on 480 real field plots from 4 locations and 2 seasons. They show overall model accuracy, not your individual prediction.
          </Text>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: {
    padding: 16,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 16 : 12,
  },
  subLabel: { color: COLORS.muted, fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  pageTitle: { color: COLORS.text, fontSize: 24, fontWeight: '700', marginTop: 4, marginBottom: 14 },

  card: { backgroundColor: COLORS.white, borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 0.5, borderColor: COLORS.border },
  cardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  cardSub: { fontSize: 12, color: COLORS.muted, marginTop: 2, marginBottom: 4 },

  barRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  barLabel: { width: 95, fontSize: 12, color: COLORS.text, fontWeight: '600' },
  barTrack: { flex: 1, height: 14, backgroundColor: COLORS.primaryLight, borderRadius: 7, overflow: 'hidden', marginHorizontal: 8 },
  barFill: { height: 14, backgroundColor: COLORS.primary, borderRadius: 7 },
  barVal: { width: 36, fontSize: 12, color: COLORS.text, fontWeight: '700', textAlign: 'right' },

  groupRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  groupName: { fontSize: 12, color: COLORS.text, fontWeight: '600' },
  groupPct: { fontSize: 12, color: COLORS.text, fontWeight: '700' },
  groupTrack: { height: 8, backgroundColor: COLORS.primaryLight, borderRadius: 4, overflow: 'hidden' },
  groupFill: { height: 8, borderRadius: 4 },

  modelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: COLORS.border },
  modelRowLast: { borderBottomWidth: 0 },
  modelName: { fontSize: 13, color: COLORS.text },
  bestBadge: { backgroundColor: COLORS.primaryLight, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  bestTxt: { color: COLORS.primary, fontSize: 10, fontWeight: '700' },
  modelR2: { fontSize: 13, color: COLORS.text, fontWeight: '700' },

  infoCard: { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary },
  infoHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoTitle: { color: COLORS.primary, fontSize: 13, fontWeight: '700', marginLeft: 6 },
  infoText: { color: COLORS.primary, fontSize: 12, marginTop: 6, lineHeight: 17 },
});