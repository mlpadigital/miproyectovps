import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import WebSocket from 'ws';
global.WebSocket = WebSocket;
dotenv.config();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const userId = '0985f42f-5a53-4c09-ab7a-5ac44b2bcf4f';
  
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
  console.log('Profile:', profile);

  const { data: subs } = await supabase.from('subscriptions').select('*').eq('client_id', userId);
  console.log('Subscriptions:', subs);

  // If subscription doesn't exist, maybe create it or if it does, set to active.
  // We can also set profile status to active
  const { error: err1 } = await supabase.from('profiles').update({ status: 'active' }).eq('id', userId);
  console.log('Update profile status:', err1);

  if (!subs || subs.length === 0) {
     // Create a subscription
     const startDate = new Date();
     const endDate = new Date();
     endDate.setMonth(endDate.getMonth() + 1); // +1 month
     
     // Need a plan_id. Let's get the first plan.
     const { data: plans } = await supabase.from('membership_plans').select('*').limit(1);
     const planId = plans[0].id;
     
     const { error: err2 } = await supabase.from('subscriptions').insert({
        client_id: userId,
        plan_id: planId,
        status: 'active',
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
     });
     console.log('Insert subscription:', err2);
  } else {
     const { error: err3 } = await supabase.from('subscriptions').update({ status: 'active' }).eq('client_id', userId);
     console.log('Update subscription:', err3);
  }

  const { data: profileAfter } = await supabase.from('profiles').select('*').eq('id', userId).single();
  console.log('Profile after:', profileAfter);
  const { data: subsAfter } = await supabase.from('subscriptions').select('*').eq('client_id', userId);
  console.log('Subscriptions after:', subsAfter);
}
run();
