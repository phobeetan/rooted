import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://litrqiftnpbujnnfkgoa.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable__uft6g_MkdsMEqxNFzbzmw_jZCheaiS';
const sessionKey = 'rooted-demo-user';

export const supabase = createClient(supabaseUrl, supabaseKey);

function fail(error) {
  if (error?.message?.includes('Could not find the table')) {
    throw new Error('Run supabase/schema.sql in the Supabase SQL Editor first.');
  }
  throw error;
}

function profileRow(email, password, profile = {}) {
  return {
    email,
    password,
    name: profile.name || '',
    birthday: profile.birthday || null,
    occupation: profile.occupation || '',
    salary: Number(profile.salary) || 0,
    monthly_spending: Number(profile.monthlySpending) || 0,
    goals: profile.goals || '',
    financial_knowledge: profile.financialKnowledge || '',
    last_login_at: new Date().toISOString(),
  };
}

function profileFromRow(row = {}) {
  return {
    id: row.id || '',
    uid: row.id || '',
    email: row.email || '',
    name: row.name || '',
    birthday: row.birthday || '',
    occupation: row.occupation || '',
    salary: Number(row.salary) || 0,
    monthlySpending: Number(row.monthly_spending) || 0,
    goals: row.goals || '',
    financialKnowledge: row.financial_knowledge || '',
    createdAt: row.created_at || '',
    lastLoginAt: row.last_login_at || '',
    databaseStatus: `Loaded from Supabase profiles/${row.id || ''}`,
  };
}

function saveSession(profile, notify = true) {
  localStorage.setItem(sessionKey, JSON.stringify(profile));
  if (notify) window.dispatchEvent(new Event('rooted-auth-change'));
}

export function currentUser() {
  try {
    return JSON.parse(localStorage.getItem(sessionKey)) || null;
  } catch {
    return null;
  }
}

export async function createAccount(email, password, profile = {}) {
  const { data, error } = await supabase
    .from('profiles')
    .insert(profileRow(email, password, profile))
    .select()
    .single();

  if (error) fail(error);

  const user = profileFromRow(data);
  saveSession(user);
  return user;
}

export async function signIn(email, password) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email)
    .eq('password', password)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) fail(error);
  const row = data[0];
  if (!row) throw new Error('No demo account found.');

  const lastLoginAt = new Date().toISOString();
  await supabase.from('profiles').update({ last_login_at: lastLoginAt }).eq('id', row.id);

  const user = profileFromRow({ ...row, last_login_at: lastLoginAt });
  saveSession(user);
  return user;
}

export async function signOutUser() {
  localStorage.removeItem(sessionKey);
  window.dispatchEvent(new Event('rooted-auth-change'));
}

export function onAuthChange(callback) {
  const handler = () => callback(currentUser());
  handler();
  window.addEventListener('rooted-auth-change', handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener('rooted-auth-change', handler);
    window.removeEventListener('storage', handler);
  };
}

export async function getUserProfile(user) {
  if (!user?.id) return user;

  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, name, birthday, occupation, salary, monthly_spending, goals, financial_knowledge, created_at, last_login_at')
    .eq('id', user.id)
    .maybeSingle();

  if (error) return user;
  if (!data) return user;

  const profile = profileFromRow(data);
  saveSession(profile, false);
  return profile;
}

export async function syncUserProfile(user) {
  return getUserProfile(user);
}

export async function saveInvestments(portfolio) {
  const user = currentUser();
  if (!user?.id) throw new Error('Log in before saving your Mock Fidelity data.');

  const syncedAt = new Date().toISOString();
  const rows = portfolio.accounts.flatMap((account) =>
    [
      ...account.positions.map((position) => {
        const quantity = Number(position.shares ?? position.quantity) || 0;
        return {
          profile_id: user.id,
          provider: portfolio.provider,
          account_type: account.type,
          symbol: position.symbol,
          name: position.name,
          asset_type: position.type,
          value: position.value,
          allocation_percent: position.allocation,
          quantity,
          price: Number(position.price) || (quantity ? position.value / quantity : 0),
          synced_at: syncedAt,
        };
      }),
      {
        profile_id: user.id,
        provider: portfolio.provider,
        account_type: account.type,
        symbol: 'CASH',
        name: 'Cash',
        asset_type: 'cash',
        value: account.cash,
        allocation_percent: account.value ? (account.cash / account.value) * 100 : 0,
        quantity: 0,
        price: 0,
        synced_at: syncedAt,
      },
    ],
  );

  const removed = await supabase
    .from('investments')
    .delete()
    .eq('profile_id', user.id)
    .eq('provider', portfolio.provider);
  if (removed.error) fail(removed.error);

  const { data, error } = await supabase.from('investments').insert(rows).select();
  if (error) fail(error);
  return data;
}

export async function getInvestments(user = currentUser()) {
  if (!user?.id) return [];

  const { data, error } = await supabase
    .from('investments')
    .select('provider, account_type, symbol, name, asset_type, value, allocation_percent, quantity, price, synced_at')
    .eq('profile_id', user.id)
    .order('account_type')
    .order('value', { ascending: false });

  if (error) fail(error);
  return data;
}

export async function getAssistantContext() {
  const user = currentUser();
  if (!user?.id) return { profile: null, investments: [] };

  const [profile, investments] = await Promise.all([
    getUserProfile(user),
    getInvestments(user),
  ]);
  return { profile, investments };
}
