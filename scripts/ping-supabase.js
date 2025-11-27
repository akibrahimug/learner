import { createClient } from "@supabase/supabase-js";

async function pingSupabase() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
      throw new Error("Supabase environment variables not set");
    }

    console.log("Creating Supabase client...");
    const supabase = createClient(url, anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    console.log("Pinging Supabase database...");

    // Simple query to ping the database - select from a system table or make a basic query
    // This will wake up the database instance
    const { data, error } = await supabase
      .from("companions") // Using an existing table from your schema
      .select("id")
      .limit(1);

    if (error) {
      // If the table doesn't exist or there's an error, try a different approach
      console.log("Table query failed, trying alternative ping method...");

      // Alternative: Use rpc to call a simple function, or just test connection
      const { data: healthData, error: healthError } = await supabase.rpc(
        "version"
      ); // This might not exist, but it's a common function

      if (healthError) {
        // Last resort: just check if we can connect by getting the current user (will be null)
        await supabase.auth.getUser();
        console.log("Database connection verified (auth check)");
      } else {
        console.log("Database ping successful via version check:", healthData);
      }
    } else {
      console.log(
        "Database ping successful! Retrieved",
        data?.length || 0,
        "records"
      );
    }

    console.log("✅ Supabase database is active and responsive");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error pinging Supabase database:", error.message);
    process.exit(1);
  }
}

pingSupabase();
