import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from './theme';

// Real numbers from v7 dataset (fiber yield kg/ha)
const VARIETIES = [
  { name: 'CKC-6',    avg: 668, b1: 928, b2: 790, b3: 595, b4: 359, note: 'Best fiber yielder' },
  { name: 'NIAB-878', avg: 593, b1: 825, b2: 700, b3: 530, b4: 320, note: 'Strong performer' },
  { name: 'CIM-663',  avg: 582, b1: 810, b2: 685, b3: 520, b4: 313, note: 'Top seed yielder' },
  { name: 'MNH-1020', avg: 546, b1: 760, b2: 645, b3: 488, b4: 294, note: 'Moderate yield' },
  { name: 'BS-15',    avg: 520, b1: 725, b2: 615, b3: 465, b4: 280, note: 'Lower fiber yield' },
];

const ranked = [...VARIETIES].sort((a, b) => b.avg - a.avg);
const maxAvg = ranked[0].avg;

export default function VarietiesScreen() {
  const [selected, setSelected] = useState('CKC-6');
  const v = VARIETIES.find(x => x.name === selected);
  const dropPct = Math.round(((v.b1 - v.b4) / v.b1) * 100);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.subLabel}>COMPARE VARIETIES</Text>
        <Text style={styles.pageTitle}>Varieties</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', gap: 8, paddingRight: 16 }}>
            {VARIETIES.map(x => (
              <TouchableOpacity key={x.name}
                style={[styles.pill, selected === x.name && styles.pillSel]}
                onPress={() => setSelected(x.name)}>
                <Text style={[styles.pillTxt, selected === x.name && styles.pillTxtSel]}>{x.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <View style={[styles.card, styles.cardHero]}>
          <View style={styles.headRow}>
            <View>
              <Text style={styles.vName}>{v.name}</Text>
              <Text style={styles.vTag}>{v.note}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.vAvg}>{v.avg}</Text>
              <Text style={styles.unit}>kg/ha · mean</Text>
            </View>
          </View>

          <Text style={styles.subTitle}>Yield by irrigation level</Text>
          <View style={styles.grid2}>
            {[
              { code: 'B1', label: 'Full water (100%)', val: v.b1, accent: true },
              { code: 'B2', label: '75% water',         val: v.b2 },
              { code: 'B3', label: '50% water',         val: v.b3 },
              { code: 'B4', label: '25% water',         val: v.b4 },
            ].map((g, i) => (
              <View key={i} style={[styles.gridBox, g.accent && styles.gridBoxAccent]}>
                <Text style={styles.gridCode}>{g.code}</Text>
                <Text style={styles.gridLbl}>{g.label}</Text>
                <Text style={styles.gridVal}>{g.val}</Text>
                <Text style={styles.gridUnit}>kg/ha</Text>
              </View>
            ))}
          </View>

          <View style={styles.insightBox}>
            <Ionicons name="water" size={16} color={COLORS.primary} />
            <Text style={styles.insightTxt}>
              Water stress can drop {v.name} yield by {dropPct}% (B1 → B4).
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ranking by average yield</Text>
          <Text style={styles.cardSub}>Across all 5 cotton varieties</Text>
          {ranked.map((x, i) => (
            <View key={x.name} style={styles.rankRow}>
              <View style={[styles.rankNum, i === 0 && { backgroundColor: COLORS.primary }]}>
                <Text style={[styles.rankNumTxt, i === 0 && { color: '#fff' }]}>{i + 1}</Text>
              </View>
              <Text style={[styles.rankName, x.name === selected && { color: COLORS.primary, fontWeight: '700' }]}>
                {x.name}
              </Text>
              <View style={styles.rankBar}>
                <View style={[styles.rankFill, { width: `${(x.avg / maxAvg) * 100}%` }]} />
              </View>
              <Text style={styles.rankVal}>{x.avg}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>How the model uses varieties</Text>
          <Text style={styles.cardSub}>From SHAP analysis of the trained ensemble</Text>
          <View style={styles.factRow}>
            <Ionicons name="git-branch-outline" size={18} color={COLORS.primary} />
            <Text style={styles.factTxt}>Variety + SNP markers contribute about <Text style={styles.bold}>28%</Text> of the predictive power.</Text>
          </View>
          <View style={styles.factRow}>
            <Ionicons name="trophy-outline" size={18} color={COLORS.primary} />
            <Text style={styles.factTxt}><Text style={styles.bold}>CKC-6</Text> is the top fiber yielder due to high lint percentage, even when seed yield is lower.</Text>
          </View>
          <View style={[styles.factRow, styles.factRowLast]}>
            <Ionicons name="leaf-outline" size={18} color={COLORS.primary} />
            <Text style={styles.factTxt}>All 5 varieties were grown across 4 locations × 2 seasons × 4 irrigation × 3 nitrogen treatments.</Text>
          </View>
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

  pill: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 999, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.white },
  pillSel: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  pillTxt: { fontSize: 13, color: COLORS.text, fontWeight: '600' },
  pillTxtSel: { color: '#fff' },

  card: { backgroundColor: COLORS.white, borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 0.5, borderColor: COLORS.border },
  cardHero: { borderColor: COLORS.primary, borderWidth: 1.5 },
  headRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  vName: { fontSize: 22, fontWeight: '700', color: COLORS.primary },
  vTag: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  vAvg: { fontSize: 28, fontWeight: '700', color: COLORS.text },
  unit: { fontSize: 11, color: COLORS.muted, marginTop: -2 },

  subTitle: { fontSize: 13, color: COLORS.muted, fontWeight: '700', marginTop: 16, marginBottom: 10 },
  grid2: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  gridBox: { width: '48%', borderWidth: 0.5, borderColor: COLORS.border, borderRadius: 11, padding: 12, backgroundColor: COLORS.white },
  gridBoxAccent: { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary },
  gridCode: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  gridLbl: { fontSize: 11, color: COLORS.muted, marginTop: 2 },
  gridVal: { fontSize: 22, fontWeight: '700', color: COLORS.text, marginTop: 8 },
  gridUnit: { fontSize: 10, color: COLORS.muted },

  insightBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primaryLight, borderRadius: 10, padding: 12, marginTop: 14, gap: 8 },
  insightTxt: { flex: 1, fontSize: 12, color: COLORS.primary, fontWeight: '600', lineHeight: 17 },

  cardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  cardSub: { fontSize: 12, color: COLORS.muted, marginTop: 2, marginBottom: 4 },

  rankRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  rankNum: { width: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.border, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  rankNumTxt: { fontSize: 12, fontWeight: '700', color: COLORS.text },
  rankName: { width: 80, fontSize: 12, color: COLORS.text, fontWeight: '600' },
  rankBar: { flex: 1, height: 10, backgroundColor: COLORS.primaryLight, borderRadius: 5, overflow: 'hidden', marginHorizontal: 8 },
  rankFill: { height: 10, backgroundColor: COLORS.primary, borderRadius: 5 },
  rankVal: { width: 42, fontSize: 12, color: COLORS.text, fontWeight: '700', textAlign: 'right' },

  factRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: COLORS.border },
  factRowLast: { borderBottomWidth: 0 },
  factTxt: { flex: 1, fontSize: 12, color: COLORS.text, lineHeight: 18 },
  bold: { fontWeight: '700', color: COLORS.primary },
});