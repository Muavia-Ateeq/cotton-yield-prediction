import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Modal, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { COLORS, API_URL } from './theme';
import { supabase } from './supabase';

const LOCATIONS = ['Multan', 'Faisalabad', 'Khanpur', 'Rajanpur'];
const VARIETIES = ['CIM-663', 'CKC-6', 'NIAB-878', 'MNH-1020', 'BS-15'];
const IRRIGATION = [
  { code: 'B1', label: 'Full water', pct: 100 },
  { code: 'B2', label: 'Mild deficit', pct: 75 },
  { code: 'B3', label: 'Mod. deficit', pct: 50 },
  { code: 'B4', label: 'Sev. deficit', pct: 25 },
];
const NITROGEN = [{ code: 'N1', kg: 190 }, { code: 'N2', kg: 240 }, { code: 'N3', kg: 290 }];
const SOILS = ['Loamy', 'Loam with Silt', 'Sodic-Saline'];

function getGrade(y) {
  if (y >= 850) return { label: 'Excellent', color: COLORS.success, bg: COLORS.successBg };
  if (y >= 650) return { label: 'Good', color: COLORS.primary, bg: COLORS.primaryLight };
  if (y >= 450) return { label: 'Moderate', color: COLORS.warning, bg: COLORS.warningBg };
  return { label: 'Low', color: COLORS.danger, bg: '#FCEBEB' };
}

function gradeColor(g) {
  if (g === 'Excellent') return COLORS.success;
  if (g === 'Good') return COLORS.primary;
  if (g === 'Moderate') return COLORS.warning;
  return COLORS.danger;
}

export default function PredictScreen() {
  const [loc, setLoc] = useState(null);
  const [vari, setVari] = useState(null);
  const [irr, setIrr] = useState(null);
  const [nit, setNit] = useState(null);
  const [soil, setSoil] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [histLoading, setHistLoading] = useState(false);

  const allSelected = loc && vari && irr && nit && soil;

  const predict = async () => {
    setLoading(true); setError(null); setResult(null); setSaved(false);
    try {
      const res = await axios.post(`${API_URL}/predict`, {
        location: loc, genotype: vari,
        water_supply_pct: irr.pct, n_rate_kg_ha: nit.kg, soil_type: soil,
      }, { timeout: 20000, headers: { 'Content-Type': 'application/json' } });
      setResult(res.data);
    } catch (e) {
      if (e.response?.data?.detail) setError(JSON.stringify(e.response.data.detail));
      else if (e.message === 'Network Error') setError(`Network Error: Phone cannot reach ${API_URL}`);
      else setError(e.message || 'Could not reach the server.');
    }
    setLoading(false);
  };

  const save = async () => {
    if (!result || saved) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); setError('Please log in to save.'); return; }
    const y = result.predicted_fiber_yield_kg_ha;
    const grade = getGrade(y).label;
    const { error: err } = await supabase.from('predictions').insert({
      user_id: user.id, location: loc, genotype: vari,
      water_supply_pct: irr.pct, n_rate_kg_ha: nit.kg, soil_type: soil,
      predicted_yield: y, grade, summary: result.summary,
      reasons: result.top_reasons, advice: result.advice,
    });
    setSaving(false);
    if (!err) setSaved(true); else setError('Could not save: ' + err.message);
  };

  const reset = () => {
    setLoc(null); setVari(null); setIrr(null); setNit(null); setSoil(null);
    setResult(null); setError(null); setSaved(false);
  };

  const openHistory = async () => {
    setShowHistory(true); setHistLoading(true);
    const { data, error: err } = await supabase
      .from('predictions').select('*')
      .order('created_at', { ascending: false });
    if (!err && data) setHistory(data);
    setHistLoading(false);
  };

  const removeHistory = (id) => {
    Alert.alert('Delete', 'Remove this prediction?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        const { error: err } = await supabase
          .from('predictions').delete().eq('id', id);
        if (err) { Alert.alert('Error', err.message); return; }
        setHistory(prev => prev.filter(x => x.id !== id));
      }},
    ]);
  };

  function StepCard({ n, title, value, children }) {
    const active = !!value;
    return (
      <View style={styles.stepCard}>
        <View style={styles.stepHeader}>
          <View style={[styles.stepNum, active && { backgroundColor: COLORS.primary }]}>
            <Text style={[styles.stepNumTxt, active && { color: '#fff' }]}>{n}</Text>
          </View>
          <Text style={styles.stepTitle}>{title}</Text>
          {value ? <View style={styles.stepPill}><Text style={styles.stepPillTxt}>{value}</Text></View> : null}
        </View>
        {children}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.subLabel}>ENTER FIELD PARAMETERS</Text>
            <Text style={styles.pageTitle}>Yield prediction</Text>
          </View>
          <TouchableOpacity style={styles.histBtn} onPress={openHistory} activeOpacity={0.8}>
            <Ionicons name="time-outline" size={18} color={COLORS.primary} />
            <Text style={styles.histBtnTxt}>History</Text>
          </TouchableOpacity>
        </View>

        <StepCard n={1} title="Location" value={loc}>
          <View style={styles.grid2}>
            {LOCATIONS.map(o => (
              <TouchableOpacity key={o} style={[styles.gridBtn, loc === o && styles.gridBtnSel]} onPress={() => setLoc(o)}>
                <Text style={[styles.gridBtnTxt, loc === o && styles.gridBtnTxtSel]}>{o}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </StepCard>

        <StepCard n={2} title="Variety" value={vari}>
          <View style={styles.pillWrap}>
            {VARIETIES.map(o => (
              <TouchableOpacity key={o} style={[styles.pill, vari === o && styles.pillSel]} onPress={() => setVari(o)}>
                <Text style={[styles.pillTxt, vari === o && styles.pillTxtSel]}>{o}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </StepCard>

        <StepCard n={3} title="Irrigation level" value={irr?.code}>
          <View style={styles.grid2}>
            {IRRIGATION.map(o => (
              <TouchableOpacity key={o.code} style={[styles.gridBtn, irr?.code === o.code && styles.gridBtnSel]} onPress={() => setIrr(o)}>
                <Text style={[styles.bigCode, irr?.code === o.code && { color: COLORS.primary }]}>{o.code}</Text>
                <Text style={[styles.gridBtnTxt, irr?.code === o.code && styles.gridBtnTxtSel]}>{o.label}</Text>
                <Text style={styles.gridSmall}>{o.pct}%</Text>
              </TouchableOpacity>
            ))}
          </View>
        </StepCard>

        <StepCard n={4} title="Nitrogen dose" value={nit?.code}>
          <View style={styles.grid3}>
            {NITROGEN.map(o => (
              <TouchableOpacity key={o.code} style={[styles.gridBtn3, nit?.code === o.code && styles.gridBtnSel]} onPress={() => setNit(o)}>
                <Text style={[styles.bigCode, nit?.code === o.code && { color: COLORS.primary }]}>{o.code}</Text>
                <Text style={styles.gridSmall}>{o.kg} kg/ha</Text>
              </TouchableOpacity>
            ))}
          </View>
        </StepCard>

        <StepCard n={5} title="Soil type" value={soil}>
          <View style={styles.pillWrap}>
            {SOILS.map(o => (
              <TouchableOpacity key={o} style={[styles.pill, soil === o && styles.pillSel]} onPress={() => setSoil(o)}>
                <Text style={[styles.pillTxt, soil === o && styles.pillTxtSel]}>{o}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </StepCard>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.predictBtn, !allSelected && styles.predictBtnDisabled]}
          onPress={predict} disabled={!allSelected || loading}>
          {loading ? <ActivityIndicator color="#fff" /> : (
            <View style={styles.predictInner}>
              <Ionicons name="sparkles" size={16} color={allSelected ? '#fff' : COLORS.muted} />
              <Text style={[styles.predictBtnTxt, !allSelected && { color: COLORS.muted }]}>
                {allSelected ? 'Predict yield' : 'Select all 5 parameters'}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {result && (() => {
          const y = result.predicted_fiber_yield_kg_ha;
          const grade = getGrade(y);
          const fillPct = Math.min(100, Math.max(0, (y / 1200) * 100));
          return (
            <View style={[styles.resultCard, { borderColor: grade.color }]}>
              <View style={styles.resTopRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.resLabel}>Predicted fiber yield</Text>
                  <Text style={styles.resBig}>{y}</Text>
                  <Text style={styles.resUnit}>kg / hectare</Text>
                </View>
                <View style={[styles.gradeBadge, { backgroundColor: grade.bg }]}>
                  <Text style={[styles.gradeTxt, { color: grade.color }]}>{grade.label}</Text>
                </View>
              </View>

              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${fillPct}%`, backgroundColor: grade.color }]} />
              </View>

              <Text style={styles.resSummary}>{result.summary}</Text>

              <Text style={styles.resSection}>Your selections</Text>
              <View style={styles.selPillWrap}>
                {[loc, vari, irr.code, nit.code, soil].map((s, i) => (
                  <View key={i} style={styles.selPill}><Text style={styles.selPillTxt}>{s}</Text></View>
                ))}
              </View>

              <Text style={styles.resSection}>Why this result?</Text>
              {result.top_reasons?.map((r, i) => (
                <View key={i} style={styles.reason}>
                  <View style={styles.reasonTop}>
                    <Text style={styles.rFeat}>{r.feature}</Text>
                    <Text style={[styles.rAmt, { color: r.effect === 'increased' ? COLORS.success : COLORS.danger }]}>
                      {r.effect === 'increased' ? '+' : '−'}{r.amount_kg_ha}
                    </Text>
                  </View>
                  {r.text ? <Text style={styles.rText}>{r.text}</Text> : null}
                </View>
              ))}

              {result.advice?.length > 0 && (
                <>
                  <Text style={styles.resSection}>Advice</Text>
                  {result.advice.map((a, i) => (
                    <View key={i} style={styles.advice}>
                      <Ionicons name="bulb-outline" size={16} color={COLORS.warning} />
                      <Text style={styles.adviceTxt}>{a}</Text>
                    </View>
                  ))}
                </>
              )}

              <TouchableOpacity
                style={[styles.saveBtn, saved && styles.saveBtnDone]}
                onPress={save} disabled={saved || saving}>
                <Ionicons name={saved ? 'checkmark-circle' : 'bookmark-outline'} size={16}
                  color={saved ? '#fff' : COLORS.primary} />
                <Text style={[styles.saveTxt, saved && { color: '#fff' }]}>
                  {saving ? 'Saving…' : saved ? 'Saved to history' : 'Save to history'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.resetBtn} onPress={reset}>
                <Text style={styles.resetTxt}>Reset & predict again</Text>
              </TouchableOpacity>
            </View>
          );
        })()}

        <View style={{ height: 130 }} />
      </ScrollView>

      {/* History Modal */}
      <Modal visible={showHistory} animationType="slide" onRequestClose={() => setShowHistory(false)}>
        <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
          <View style={styles.modalHead}>
            <View>
              <Text style={styles.subLabel}>YOUR PREDICTIONS</Text>
              <Text style={styles.modalTitle}>History</Text>
            </View>
            <TouchableOpacity onPress={() => setShowHistory(false)} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
            {histLoading && <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} />}

            {!histLoading && history.length === 0 && (
              <View style={styles.empty}>
                <Ionicons name="bookmark-outline" size={50} color={COLORS.muted} />
                <Text style={styles.emptyTxt}>No predictions yet</Text>
                <Text style={styles.emptySub}>Save a prediction to see it here</Text>
              </View>
            )}

            {!histLoading && history.map(item => {
              const date = new Date(item.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
              const gc = gradeColor(item.grade);
              return (
                <View key={item.id} style={styles.histCard}>
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
                      <Text style={[styles.gradePillTxt, { color: gc }]}>{item.grade}</Text>
                    </View>
                    <View style={styles.tagsRow}>
                      <Text style={styles.tag}>Water {item.water_supply_pct}%</Text>
                      <Text style={styles.tag}>N {item.n_rate_kg_ha}</Text>
                      <Text style={styles.tag}>{item.soil_type}</Text>
                    </View>
                  </View>

                  {item.summary ? <Text style={styles.histSummary}>{item.summary}</Text> : null}

                  <TouchableOpacity style={styles.delBtn} onPress={() => removeHistory(item.id)}>
                    <Ionicons name="trash-outline" size={14} color={COLORS.danger} />
                    <Text style={styles.delTxt}>Delete</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 130 },

  headerRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 16 },
  subLabel: { color: COLORS.muted, fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  pageTitle: { color: COLORS.text, fontSize: 24, fontWeight: '700', marginTop: 8 },
  histBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: COLORS.primaryLight, borderWidth: 1, borderColor: COLORS.primary, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999 },
  histBtnTxt: { color: COLORS.primary, fontSize: 12, fontWeight: '700' },

  stepCard: { backgroundColor: COLORS.white, borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 0.5, borderColor: COLORS.border },
  stepHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  stepNum: { width: 26, height: 26, borderRadius: 13, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' },
  stepNumTxt: { fontSize: 13, fontWeight: '700', color: COLORS.primary },
  stepTitle: { flex: 1, fontSize: 14, fontWeight: '700', color: COLORS.text, marginLeft: 10 },
  stepPill: { backgroundColor: COLORS.primaryLight, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  stepPillTxt: { color: COLORS.primary, fontSize: 11, fontWeight: '700' },
  grid2: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  grid3: { flexDirection: 'row', gap: 8 },
  gridBtn: { width: '48%', borderWidth: 1, borderColor: COLORS.border, borderRadius: 11, padding: 12, alignItems: 'center', backgroundColor: COLORS.white },
  gridBtn3: { flex: 1, borderWidth: 1, borderColor: COLORS.border, borderRadius: 11, padding: 12, alignItems: 'center', backgroundColor: COLORS.white },
  gridBtnSel: { borderColor: COLORS.primary, borderWidth: 1.5, backgroundColor: COLORS.primaryLight },
  gridBtnTxt: { fontSize: 13, color: COLORS.text, fontWeight: '600' },
  gridBtnTxtSel: { color: COLORS.primary, fontWeight: '700' },
  bigCode: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  gridSmall: { fontSize: 11, color: COLORS.muted, marginTop: 2 },
  pillWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.white },
  pillSel: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  pillTxt: { fontSize: 13, color: COLORS.text, fontWeight: '600' },
  pillTxtSel: { color: '#fff' },
  error: { color: COLORS.danger, fontSize: 13, marginVertical: 10, textAlign: 'center' },
  predictBtn: { backgroundColor: COLORS.primary, borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 6 },
  predictBtnDisabled: { backgroundColor: '#E0E0DD' },
  predictInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  predictBtnTxt: { color: '#fff', fontSize: 15, fontWeight: '700' },
  resultCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: 16, marginTop: 18, borderWidth: 2 },
  resTopRow: { flexDirection: 'row', alignItems: 'flex-start' },
  resLabel: { fontSize: 11, color: COLORS.muted, fontWeight: '600' },
  resBig: { fontSize: 38, fontWeight: '700', color: COLORS.text, marginTop: 2 },
  resUnit: { fontSize: 12, color: COLORS.muted },
  gradeBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999 },
  gradeTxt: { fontSize: 12, fontWeight: '700' },
  progressTrack: { height: 7, backgroundColor: COLORS.primaryLight, borderRadius: 4, marginTop: 12, overflow: 'hidden' },
  progressFill: { height: 7, borderRadius: 4 },
  resSummary: { fontSize: 13, color: COLORS.text, marginTop: 10, lineHeight: 19 },
  resSection: { fontSize: 13, color: COLORS.muted, fontWeight: '700', marginTop: 14, marginBottom: 8 },
  selPillWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  selPill: { backgroundColor: COLORS.primaryLight, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  selPillTxt: { color: COLORS.primary, fontSize: 11, fontWeight: '700' },
  reason: { backgroundColor: COLORS.background, borderRadius: 10, padding: 12, marginBottom: 6 },
  reasonTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  rFeat: { fontSize: 13, fontWeight: '700', color: COLORS.text, flex: 1 },
  rAmt: { fontSize: 13, fontWeight: '700' },
  rText: { fontSize: 12, color: COLORS.muted, lineHeight: 17 },
  advice: { backgroundColor: COLORS.warningBg, borderRadius: 10, padding: 12, marginBottom: 6, flexDirection: 'row', gap: 8 },
  adviceTxt: { fontSize: 12, color: COLORS.warning, lineHeight: 18, flex: 1 },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.primaryLight, borderWidth: 1, borderColor: COLORS.primary, borderRadius: 12, padding: 12, marginTop: 14 },
  saveBtnDone: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  saveTxt: { color: COLORS.primary, fontSize: 13, fontWeight: '700' },
  resetBtn: { backgroundColor: COLORS.background, borderRadius: 12, padding: 12, alignItems: 'center', marginTop: 10 },
  resetTxt: { color: COLORS.muted, fontSize: 13, fontWeight: '700' },

  // Modal
  modalHead: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 14, paddingBottom: 14, borderBottomWidth: 0.5, borderBottomColor: COLORS.border, backgroundColor: COLORS.white },
  modalTitle: { fontSize: 22, fontWeight: '700', color: COLORS.text, marginTop: 4 },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyTxt: { color: COLORS.text, fontSize: 16, fontWeight: '700', marginTop: 12 },
  emptySub: { color: COLORS.muted, fontSize: 13, marginTop: 4 },
  histCard: { backgroundColor: COLORS.white, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 0.5, borderColor: COLORS.border },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  cardDate: { fontSize: 11, color: COLORS.muted, marginTop: 2 },
  yieldVal: { fontSize: 20, fontWeight: '700', color: COLORS.primary },
  yieldUnit: { fontSize: 10, color: COLORS.muted },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, flexWrap: 'wrap', gap: 6 },
  gradePill: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999 },
  gradePillTxt: { fontSize: 11, fontWeight: '700' },
  tagsRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  tag: { backgroundColor: COLORS.background, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, fontSize: 11, color: COLORS.muted, fontWeight: '600' },
  histSummary: { fontSize: 12, color: COLORS.muted, marginTop: 8, lineHeight: 17 },
  delBtn: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', gap: 4, marginTop: 8, padding: 6 },
  delTxt: { color: COLORS.danger, fontSize: 12, fontWeight: '700' },
});