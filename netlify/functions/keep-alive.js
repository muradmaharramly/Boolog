import { createClient } from '@supabase/supabase-js';

/**
 * Netlify Scheduled Function (Cron Job)
 * Runs every 6 hours to prevent Supabase from pausing due to inactivity.
 */
export default async (req, context) => {
  // Use environment variables from Netlify
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables');
    return new Response('Configuration Error', { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    console.log('Keep-alive: Sending request to Supabase...');
    
    // Execute a minimal query to generate activity
    const { data, error } = await supabase.from('blogs').select('id').limit(1);

    if (error) {
      throw error;
    }

    console.log('Keep-alive: Successfully pinged Supabase.');
    return new Response('Success: Supabase activity generated', { status: 200 });
  } catch (err) {
    console.error('Keep-alive Error:', err.message);
    return new Response('Error: Failed to ping Supabase', { status: 500 });
  }
};

export const config = {
  // Every day at 00:00
  schedule: "0 0 * * *"
};
