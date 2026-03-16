/**
 * Netlify Scheduled Function (Cron Job)
 * Runs every 6 hours to prevent Supabase from pausing due to inactivity.
 */
export default async (req, context) => {
  // Use environment variables from Netlify
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Keep-alive: Missing Supabase environment variables (VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY)');
    return new Response('Configuration Error', { status: 500 });
  }

  // Direct REST API request for maximum reliability and minimal footprint
  // We use the 'blogs' table as a target for a lightweight SELECT 1
  const url = `${supabaseUrl}/rest/v1/blogs?select=id&limit=1`;

  try {
    console.log(`Keep-alive: Sending request to ${url}...`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorBody}`);
    }

    console.log('Keep-alive: Successfully pinged Supabase REST API.');
    return new Response('Success: Supabase activity generated', { status: 200 });
  } catch (err) {
    console.error('Keep-alive Error:', err.message);
    return new Response(`Error: Failed to ping Supabase - ${err.message}`, { status: 500 });
  }
};

export const config = {
  // Every 6 hours to ensure database stays active
  schedule: "0 */6 * * *"
};
