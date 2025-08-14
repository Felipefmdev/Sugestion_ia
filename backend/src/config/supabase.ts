import { createClient } from '@supabase/supabase-js';

// Coloque suas credenciais do Supabase aqui
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://kgzkryxxosqmndhagjup.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtnemtyeXh4b3NxbW5kaGFnanVwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDE3NDI0MiwiZXhwIjoyMDY5NzUwMjQyfQ.3zpAmxzZeHn2F7im-rZzMuAX0EGJmO6KnNoIFZx9eWY';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('Supabase URL e Chave de Serviço devem ser definidos.');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default supabase;