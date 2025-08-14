// bacbo-frontend/src/config/supabaseClient.ts

import { createClient } from '@supabase/supabase-js';

// Use as credenciais da API pública (anon public) do seu projeto Supabase
const SUPABASE_URL = 'https://kgzkryxxosqmndhagjup.supabase.co'; // Pegue no painel do Supabase -> Settings -> API
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtnemtyeXh4b3NxbW5kaGFnanVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNzQyNDIsImV4cCI6MjA2OTc1MDI0Mn0.CU1x0XrgjwDUytrt-2zIuBceOBU2PIiK1RHkl0xGpF8'; // A chave 'anon public'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);