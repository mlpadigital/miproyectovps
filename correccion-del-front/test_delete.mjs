import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);
const userId = 'f8caac59-b655-422e-b544-e91ffdb3bbaa';

async function testDelete() {
    console.log('Fetching user...');
    const { data: user, error: userError } = await supabase.auth.admin.getUserById(userId);
    console.log('User:', user, 'Error:', userError);

    // Let's try to delete just from profiles to see if it cascades or if it errors
    // console.log('Deleting from profiles...');
    // const { error: profileError } = await supabase.from('profiles').delete().eq('id', userId);
    // console.log('Profile delete error:', profileError);

    console.log('Attempting auth.users deletion...');
    const { data, error } = await supabase.auth.admin.deleteUser(userId);
    console.log('Result:', data, 'Error:', error);
}

testDelete();
