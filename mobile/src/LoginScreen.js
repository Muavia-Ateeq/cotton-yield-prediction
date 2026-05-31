import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from './theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from './supabase';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const passRef = useRef(null);

  const login = async () => {
    if (!username.trim() || !pass.trim()) { setErr('Please enter username and password.'); return; }
    setLoading(true); setErr('');
    const email = `${username.trim().toLowerCase()}@cottonyield.app`;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
    setLoading(false);
    if (error) { setErr(error.message); return; }
    navigation.replace('Main', { user: data.user.user_metadata?.full_name || username });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.center}>
            <View style={styles.logoBox}>
              <Ionicons name="leaf" size={36} color={COLORS.primary} />
            </View>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.sub}>Sign in to your account</Text>

            <View style={styles.form}>
              <Text style={styles.label}>Username</Text>
              <View style={styles.inputRow}>
                <Ionicons name="person-outline" size={18} color={COLORS.muted} />
                <TextInput
                  style={styles.input} placeholder="Your username"
                  placeholderTextColor={COLORS.muted} autoCapitalize="none"
                  value={username} onChangeText={setUsername}
                  returnKeyType="next"
                  onSubmitEditing={() => passRef.current?.focus()}
                  blurOnSubmit={false}
                />
              </View>

              <Text style={styles.label}>Password</Text>
              <View style={styles.inputRow}>
                <Ionicons name="lock-closed-outline" size={18} color={COLORS.muted} />
                <TextInput
                  ref={passRef}
                  style={styles.input} placeholder="••••••••"
                  placeholderTextColor={COLORS.muted} secureTextEntry={!showPass}
                  value={pass} onChangeText={setPass}
                  returnKeyType="done"
                  onSubmitEditing={login}
                />
                <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                  <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={20} color={COLORS.muted} />
                </TouchableOpacity>
              </View>

             <TouchableOpacity onPress={() => navigation.navigate('Forgot')}>
                  <Text style={styles.forgot}>Forgot password?</Text>
              </TouchableOpacity>

              {err ? <Text style={styles.err}>{err}</Text> : null}

              <TouchableOpacity style={styles.button} onPress={login} disabled={loading}>
                <Text style={styles.buttonText}>{loading ? 'Signing in…' : 'Log in'}</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                <Text style={styles.linkText}>No account? <Text style={styles.linkBold}>Sign up</Text></Text>
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
  center: { flex: 1, justifyContent: 'center', padding: 26, minHeight: 620 },
  logoBox: { width: 84, height: 84, borderRadius: 20, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 20 },
  title: { fontSize: 26, fontWeight: '700', color: COLORS.text, textAlign: 'center' },
  sub: { fontSize: 14, color: COLORS.muted, textAlign: 'center', marginTop: 4, marginBottom: 28 },
  form: { width: '100%' },
  label: { fontSize: 13, color: COLORS.text, fontWeight: '600', marginBottom: 6, marginTop: 12 },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 11, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 12, paddingVertical: 4 },
  input: { flex: 1, padding: 10, fontSize: 14, color: COLORS.text, marginLeft: 8 },
  forgot: { color: COLORS.primary, fontSize: 13, fontWeight: '600', textAlign: 'right', marginTop: 8 },
  err: { color: COLORS.danger, fontSize: 13, marginTop: 10, textAlign: 'center' },
  button: { backgroundColor: COLORS.primary, borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 22 },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  linkText: { textAlign: 'center', color: COLORS.muted, fontSize: 14, marginTop: 22 },
  linkBold: { color: COLORS.primary, fontWeight: '700' },
});