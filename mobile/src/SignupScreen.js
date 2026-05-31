import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from './theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from './supabase';

export default function SignupScreen({ navigation }) {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const usernameRef = useRef(null);
  const passRef = useRef(null);

  const signup = async () => {
    if (!name.trim() || !username.trim() || !pass.trim()) { setErr('Please fill all fields.'); return; }
    if (pass.length < 6) { setErr('Password must be at least 6 characters.'); return; }
    setLoading(true); setErr('');
    const email = `${username.trim().toLowerCase()}@cottonyield.app`;

    const { data, error } = await supabase.auth.signUp({
      email, password: pass,
      options: { data: { full_name: name, username: username.trim().toLowerCase() } },
    });
    if (error) { setLoading(false); setErr(error.message); return; }

    if (data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        username: username.trim().toLowerCase(),
        full_name: name,
      });
    }

    await supabase.auth.signOut();

    // Go to Login FIRST, then show alert (no Home flash)
    navigation.replace('Login');
    setLoading(false);
    setTimeout(() => {
      Alert.alert('Account created', 'Your account is ready. Please log in.');
    }, 300);
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
              <Ionicons name="leaf" size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.title}>Create account</Text>
            <Text style={styles.sub}>Join CottonYield AI</Text>

            <View style={styles.form}>
              <Text style={styles.label}>Full name</Text>
              <View style={styles.inputRow}>
                <Ionicons name="person-circle-outline" size={20} color={COLORS.muted} />
                <TextInput
                  style={styles.input} placeholder="Your name"
                  placeholderTextColor={COLORS.muted}
                  value={name} onChangeText={setName}
                  returnKeyType="next"
                  onSubmitEditing={() => usernameRef.current?.focus()}
                  blurOnSubmit={false}
                />
              </View>

              <Text style={styles.label}>Username</Text>
              <View style={styles.inputRow}>
                <Ionicons name="at-outline" size={18} color={COLORS.muted} />
                <TextInput
                  ref={usernameRef}
                  style={styles.input} placeholder="Choose a username"
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
                  onSubmitEditing={signup}
                />
                <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                  <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={20} color={COLORS.muted} />
                </TouchableOpacity>
              </View>

              {err ? <Text style={styles.err}>{err}</Text> : null}

              <TouchableOpacity style={styles.button} onPress={signup} disabled={loading}>
                <Text style={styles.buttonText}>{loading ? 'Creating…' : 'Create account'}</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.linkText}>Already have an account? <Text style={styles.linkBold}>Log in</Text></Text>
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
  logoBox: { width: 76, height: 76, borderRadius: 18, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 16 },
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
});