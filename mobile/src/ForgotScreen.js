import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from './theme';
import { supabase } from './supabase';

export default function ForgotScreen({ navigation }) {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const confirmRef = useRef(null);

  const verifyUsername = async () => {
    if (!username.trim()) { setErr('Please enter your username.'); return; }
    setLoading(true); setErr('');
    const { data } = await supabase
      .from('profiles').select('username')
      .eq('username', username.trim().toLowerCase()).maybeSingle();
    setLoading(false);
    if (!data) { setErr('Username not found.'); return; }
    setStep(2);
  };

  const resetPassword = async () => {
    if (!newPass || !confirmPass) { setErr('Please fill both fields.'); return; }
    if (newPass.length < 6) { setErr('Password must be at least 6 characters.'); return; }
    if (newPass !== confirmPass) { setErr('Passwords do not match.'); return; }
    setLoading(true); setErr('');

    const { data, error } = await supabase.rpc('reset_password_by_username', {
      p_username: username.trim().toLowerCase(),
      p_new_password: newPass,
    });
    setLoading(false);
    if (error) { setErr(error.message); return; }
    if (!data?.ok) { setErr(data?.msg || 'Could not reset password.'); return; }

    Alert.alert('Password updated', 'You can now log in with your new password.', [
      { text: 'OK', onPress: () => navigation.replace('Login') },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
            <Ionicons name="arrow-back" size={22} color={COLORS.text} />
          </TouchableOpacity>

          <View style={styles.center}>
            <View style={styles.logoBox}>
              <Ionicons name="lock-open-outline" size={34} color={COLORS.primary} />
            </View>
            <Text style={styles.title}>Reset password</Text>
            <Text style={styles.sub}>
              {step === 1 ? 'Enter your username to continue' : 'Set a new password for your account'}
            </Text>

            <View style={styles.form}>
              {step === 1 ? (
                <>
                  <Text style={styles.label}>Username</Text>
                  <View style={styles.inputRow}>
                    <Ionicons name="person-outline" size={18} color={COLORS.muted} />
                    <TextInput
                      style={styles.input} placeholder="Your username"
                      placeholderTextColor={COLORS.muted} autoCapitalize="none"
                      value={username} onChangeText={setUsername}
                      returnKeyType="done" onSubmitEditing={verifyUsername}
                    />
                  </View>

                  {err ? <Text style={styles.err}>{err}</Text> : null}

                  <TouchableOpacity style={styles.button} onPress={verifyUsername} disabled={loading}>
                    <Text style={styles.buttonText}>{loading ? 'Checking…' : 'Continue'}</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <View style={styles.userPill}>
                    <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />
                    <Text style={styles.userPillTxt}>{username}</Text>
                  </View>

                  <Text style={styles.label}>New password</Text>
                  <View style={styles.inputRow}>
                    <Ionicons name="lock-closed-outline" size={18} color={COLORS.muted} />
                    <TextInput
                      style={styles.input} placeholder="At least 6 characters"
                      placeholderTextColor={COLORS.muted} secureTextEntry={!showPass}
                      value={newPass} onChangeText={setNewPass}
                      returnKeyType="next" blurOnSubmit={false}
                      onSubmitEditing={() => confirmRef.current?.focus()}
                    />
                    <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                      <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={20} color={COLORS.muted} />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.label}>Confirm password</Text>
                  <View style={styles.inputRow}>
                    <Ionicons name="lock-closed-outline" size={18} color={COLORS.muted} />
                    <TextInput
                      ref={confirmRef}
                      style={styles.input} placeholder="Re-type password"
                      placeholderTextColor={COLORS.muted} secureTextEntry={!showPass}
                      value={confirmPass} onChangeText={setConfirmPass}
                      returnKeyType="done" onSubmitEditing={resetPassword}
                    />
                  </View>

                  {err ? <Text style={styles.err}>{err}</Text> : null}

                  <TouchableOpacity style={styles.button} onPress={resetPassword} disabled={loading}>
                    <Text style={styles.buttonText}>{loading ? 'Updating…' : 'Update password'}</Text>
                  </TouchableOpacity>
                </>
              )}

              <TouchableOpacity onPress={() => navigation.replace('Login')}>
                <Text style={styles.linkText}>Back to <Text style={styles.linkBold}>Log in</Text></Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flexGrow: 1 },
  back: { padding: 14, paddingLeft: 18 },
  center: { flex: 1, justifyContent: 'center', padding: 26, paddingTop: 0, minHeight: 580 },
  logoBox: { width: 80, height: 80, borderRadius: 20, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 18 },
  title: { fontSize: 24, fontWeight: '700', color: COLORS.text, textAlign: 'center' },
  sub: { fontSize: 14, color: COLORS.muted, textAlign: 'center', marginTop: 4, marginBottom: 22 },
  form: { width: '100%' },
  label: { fontSize: 13, color: COLORS.text, fontWeight: '600', marginBottom: 6, marginTop: 12 },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 11, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 12, paddingVertical: 4 },
  input: { flex: 1, padding: 10, fontSize: 14, color: COLORS.text, marginLeft: 8 },
  err: { color: COLORS.danger, fontSize: 13, marginTop: 10, textAlign: 'center' },
  button: { backgroundColor: COLORS.primary, borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 22 },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  linkText: { textAlign: 'center', color: COLORS.muted, fontSize: 14, marginTop: 22 },
  linkBold: { color: COLORS.primary, fontWeight: '700' },
  userPill: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 6, backgroundColor: COLORS.primaryLight, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, marginBottom: 4 },
  userPillTxt: { color: COLORS.primary, fontSize: 13, fontWeight: '700' },
});