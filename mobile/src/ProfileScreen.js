import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from './theme';
import { supabase } from './supabase';

export default function ProfileScreen({ navigation, route }) {
  const user = route?.params?.user || 'Guest';
  const initials = user.slice(0, 2).toUpperCase();

  const logout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut();
          navigation.getParent()?.replace('Login');
        }
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.subLabel}>ACCOUNT</Text>
        <Text style={styles.pageTitle}>Profile</Text>

        <View style={styles.profCard}>
          <View style={styles.avatar}><Text style={styles.avatarTxt}>{initials}</Text></View>
          <Text style={styles.name}>{user}</Text>
          <Text style={styles.subtitle}>{user.toLowerCase()}@cottonyield.app</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Research summary</Text>
          {[
            ['Dataset',      '480 records'],
            ['Varieties',    '5 genotypes'],
            ['Locations',    '4 cities'],
            ['Years',        '2022 – 2023'],
            ['Target',       'Fiber yield (kg/ha)'],
            ['Best variety', 'CKC-6 (668 kg/ha avg)'],
          ].map(([k, v], i, arr) => (
            <View key={i} style={[styles.kvRow, i === arr.length - 1 && styles.kvRowLast]}>
              <Text style={styles.kvK}>{k}</Text>
              <Text style={styles.kvV}>{v}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <View style={styles.modelHeader}>
            <Ionicons name="cube-outline" size={20} color={COLORS.primary} />
            <Text style={styles.cardTitle}>Model details</Text>
          </View>
          {[
            ['Best model',      'EXGEP Ensemble'],
            ['Test R²',         '0.685'],
            ['Test RMSE',       '111.4 kg/ha'],
            ['Pearson r (PCC)', '0.916'],
            ['Generalization',  '−0.023 gap (best)'],
            ['Base models',     'RF · XGBoost · LightGBM · GBDT'],
            ['Meta-model',      'LARS regression'],
            ['Explainability',  'SHAP (TreeExplainer)'],
          ].map(([k, v], i, arr) => (
            <View key={i} style={[styles.kvRow, i === arr.length - 1 && styles.kvRowLast]}>
              <Text style={styles.kvK}>{k}</Text>
              <Text style={styles.kvV}>{v}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Top yield drivers</Text>
          <Text style={styles.cardSub}>From SHAP analysis</Text>
          {[
            { icon: 'water-outline',       label: 'Water supply',       val: '174 kg/ha' },
            { icon: 'flask-outline',       label: 'Nitrogen rate',      val: 'management' },
            { icon: 'git-branch-outline',  label: 'SNP D05 marker',     val: 'genetic' },
            { icon: 'leaf-outline',        label: 'Genotype CKC-6',     val: 'variety' },
          ].map((d, i, arr) => (
            <View key={i} style={[styles.driverRow, i === arr.length - 1 && styles.driverRowLast]}>
              <Ionicons name={d.icon} size={18} color={COLORS.primary} />
              <Text style={styles.driverLbl}>{d.label}</Text>
              <Text style={styles.driverVal}>{d.val}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          {[
            { icon: 'settings-outline',           label: 'Settings' },
            { icon: 'download-outline',           label: 'Export results' },
            { icon: 'help-circle-outline',        label: 'Help' },
            { icon: 'information-circle-outline', label: 'About the app' },
          ].map((m, i) => (
            <TouchableOpacity key={i} style={styles.menuRow} activeOpacity={0.7}>
              <Ionicons name={m.icon} size={20} color={COLORS.text} />
              <Text style={styles.menuTxt}>{m.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={COLORS.muted} />
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={[styles.menuRow, styles.menuRowLast]} onPress={logout} activeOpacity={0.7}>
            <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
            <Text style={[styles.menuTxt, { color: COLORS.danger }]}>Log out</Text>
            <View style={{ width: 18 }} />
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>CottonYield AI · v1.0.0</Text>
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: 16, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 16 : 12 },
  subLabel: { color: COLORS.muted, fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  pageTitle: { color: COLORS.text, fontSize: 24, fontWeight: '700', marginTop: 4, marginBottom: 14 },
  profCard: { backgroundColor: COLORS.white, borderRadius: 14, padding: 20, alignItems: 'center', borderWidth: 0.5, borderColor: COLORS.border, marginBottom: 12 },
  avatar: { width: 76, height: 76, borderRadius: 38, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarTxt: { color: '#fff', fontSize: 28, fontWeight: '700' },
  name: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  subtitle: { fontSize: 12, color: COLORS.muted, marginTop: 4 },
  card: { backgroundColor: COLORS.white, borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 0.5, borderColor: COLORS.border },
  modelHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 6 },
  cardSub: { fontSize: 12, color: COLORS.muted, marginTop: -2, marginBottom: 4 },
  kvRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: COLORS.border },
  kvRowLast: { borderBottomWidth: 0 },
  kvK: { fontSize: 13, color: COLORS.muted },
  kvV: { fontSize: 13, color: COLORS.text, fontWeight: '600', textAlign: 'right', flex: 1, marginLeft: 12 },
  driverRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 11, borderBottomWidth: 0.5, borderBottomColor: COLORS.border, gap: 10 },
  driverRowLast: { borderBottomWidth: 0 },
  driverLbl: { flex: 1, fontSize: 13, color: COLORS.text, fontWeight: '600' },
  driverVal: { fontSize: 12, color: COLORS.primary, fontWeight: '700' },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: COLORS.border },
  menuRowLast: { borderBottomWidth: 0 },
  menuTxt: { flex: 1, fontSize: 14, color: COLORS.text, fontWeight: '600', marginLeft: 12 },
  footer: { textAlign: 'center', fontSize: 11, color: COLORS.muted, marginTop: 6 },
});