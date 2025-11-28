import { createClient } from '@supabase/supabase-js';

const PROJECT_URL = 'https://mgrrjmbjxxlrmkqwkmvf.supabase.co';
const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_KEY || '';

export const supabase = createClient(PROJECT_URL, SUPABASE_KEY);
