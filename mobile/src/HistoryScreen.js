import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from './theme';
import { supabase } from './supabase';

function gradeColor(g) {
  if (g === 'Excellent') return COLORS.success;
  if (g === 'Good') return COLORS.primary;
  if (g === 'Moderate') return COLORS.warning;
  return COLORS.danger;
}

export default function HistoryScreen() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('predictions').select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setItems(data);
    setLoading(false);
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const remove = (id) => {
    Alert.alert('Delete', 'Remove this prediction?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await supabase.from('predictions').delete().eq('id', id);
        setItems(items.filter(x => x.id !== id));
      }},
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.subLabel}>YOUR PREDICTIONS</Text>
        <View style={styles.headerRow}>
          <Text style={styles.pageTitle}>History</Text>
          <TouchableOpacity onPress={load} style={styles.refresh}>
            <Ionicons name="refresh" size={18} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {loading && <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} />}

        {!loading && items.length === 0 && (
          <View style={styles.empty}>
            <Ionicons name="bookmark-outline" size={50} color={COLORS.muted} />
            <Text style={styles.emptyTxt}>No predictions yet</Text>
            <Text style={styles.emptySub}>Predictions you save will appear here</Text>
          </View>
        )}

        {!loading && items.map(item => {
          const open = expanded === item.id;
          const date = new Date(item.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
          const gc = gradeColor(item.grade);
          return (
            <TouchableOpacity key={item.id} style={styles.card} onPress={() => setExpanded(open ? null : item.id)} activeOpacity={0.85}>
              <View style={styles.cardTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{item.genotype} · {item.location}</Text>
                  <Text style={styles.cardDate}>{date}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.yieldVal}>{item.predicted_yield}</Text>
                  <Text style={styles.yieldUnit}>kg/ha</Text>
                </View>
              </View>

              <View style={styles.row}>
                <View style={[styles.gradePill, { backgroundColor: gc + '22' }]}>
                  <Text style={[styles.gradeTxt, { color: gc }]}>{item.grade}</Text>
                </View>
                <View style={styles.tagsRow}>
                  <Text style={styles.tag}>Water {item.water_supply_pct}%</Text>
                  <Text style={styles.tag}>N {item.n_rate_kg_ha}</Text>
                </View>
              </View>

              {open && (
                <View style={styles.details}>
                  <Text style={styles.summary}>{item.summary}</Text>
                  <View style={styles.detRow}><Text style={styles.detK}>Soil</Text><Text style={styles.detV}>{item.soil_type}</Text></View>

                  {item.reasons?.length > 0 && (
                    <>
                      <Text style={styles.detSection}>Top reasons</Text>
                      {item.reasons.slice(0, 3).map((r, i) => (
                        <View key={i} style={styles.reasonRow}>
                          <Text style={styles.reasonFeat}>{r.feature}</Text>
                          <Text style={[styles.reasonAmt, { color: r.effect === 'increased' ? COLORS.success : COLORS.danger }]}>
                            {r.effect === 'increased' ? '+' : '−'}{r.amount_kg_ha}
                          </Text>
                        </View>
                      ))}
                    </>
                  )}

                  <TouchableOpacity style={styles.deleteBtn} onPress={() => remove(item.id)}>
                    <Ionicons name="trash-outline" size={14} color={COLORS.danger} />
                    <Text style={styles.deleteTxt}>Delete</Text>
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: 16, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 16 : 12 },
  subLabel: { color: COLORS.muted, fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, marginBottom: 14 },
  pageTitle: { color: COLORS.text, fontSize: 24, fontWeight: '700' },
  refresh: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' },

  empty: { alignItems: 'center', marginTop: 60 },
  emptyTxt: { color: COLORS.text, fontSize: 16, fontWeight: '700', marginTop: 12 },
  emptySub: { color: COLORS.muted, fontSize: 13, marginTop: 4 },

  card: { backgroundColor: COLORS.white, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 0.5, borderColor: COLORS.border },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  cardDate: { fontSize: 11, color: COLORS.muted, marginTop: 2 },
  yieldVal: { fontSize: 20, fontWeight: '700', color: COLORS.primary },
  yieldUnit: { fontSize: 10, color: COLORS.muted },

  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  gradePill: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999 },
  gradeTxt: { fontSize: 11, fontWeight: '700' },
  tagsRow: { flexDirection: 'row', gap: 6 },
  tag: { backgroundColor: COLORS.background, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, fontSize: 11, color: COLORS.muted, fontWeight: '600' },

  details: { marginTop: 12, paddingTop: 12, borderTopWidth: 0.5, borderTopColor: COLORS.border },
  summary: { fontSize: 12, color: COLORS.text, lineHeight: 17, marginBottom: 8 },
  detRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  detK: { fontSize: 12, color: COLORS.muted },
  detV: { fontSize: 12, color: COLORS.text, fontWeight: '600' },
  detSection: { fontSize: 11, color: COLORS.muted, fontWeight: '700', marginTop: 10, marginBottom: 6, letterSpacing: 0.5 },
  reasonRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  reasonFeat: { fontSize: 12, color: COLORS.text, flex: 1 },
  reasonAmt: { fontSize: 12, fontWeight: '700' },

  deleteBtn: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', gap: 4, marginTop: 10, padding: 6 },
  deleteTxt: { color: COLORS.danger, fontSize: 12, fontWeight: '700' },
});