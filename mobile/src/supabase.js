import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const URL = 'https://hdomzphwugxqeeilvydj.supabase.co';
const KEY = 'sb_publishable_Kbi_pJpnse48T4N98qayyQ_it-0iKGT';

export const supabase = createClient(URL, KEY, {
  auth: { storage: AsyncStorage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false },
});