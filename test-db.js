
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    console.log('--- Supabase Diagnostic ---');
    console.log('Connecting to:', supabaseUrl);

    const { data: leads, error: leadError } = await supabase
        .from('leads')
        .select('count', { count: 'exact', head: true });

    if (leadError) {
        console.error('❌ Database Connection Failed:', leadError.message);
        console.error('Tip: Make sure you have run the schema.sql in the Supabase SQL Editor.');
    } else {
        console.log('✅ Database Connection: SUCCESS');
        console.log('📊 Current Lead Count:', leads.length || 0);
    }
}

testConnection();
