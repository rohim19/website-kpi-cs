import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ngacgyonpywwnavuqduh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5nYWNneW9ucHl3d25hdnVxZHVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5NjU3ODAsImV4cCI6MjA5NTU0MTc4MH0.OVHSY_zoWBRUOeSsX_-4Y59-dU4Wgn1NQfaX26-rXm4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);