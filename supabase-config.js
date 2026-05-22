// Supabase Configuration for Car Guesser
export const supabaseConfig = {
  url: "https://qauvcttdkbdpnhpcjdog.supabase.co",
  anon_key: "sb_publishable_BAliVVfUjkf3zZarqfRTPA_eSRTnEFk"
};

// Initialize Supabase Client
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.38.5/+esm';

export const supabase = createClient(supabaseConfig.url, supabaseConfig.anon_key);

// Optional override: set this to your deployed site origin (e.g. "https://your-site.example.com")
// If empty, the app will compute the redirect target from the current window location.
// Set this to your running site's base path so magic links point to the correct host.
// Example for your local dev: 'http://localhost:56785/dashboard/'
// Set this to your running site's base path so magic links point to the correct host.
// Example for your local dev: 'http://localhost:56785/dashboard/'
// Updated to user-provided local server:
export const MAGIC_LINK_REDIRECT_BASE = 'http://localhost:57015/dashboard/';

function getAppRootPath() {
  const { pathname } = window.location;
  const scriptMatsIndex = pathname.indexOf('/ScriptMats/');
  if (scriptMatsIndex !== -1) {
    // If the app is deployed under /ScriptMats/, include that segment
    return pathname.slice(0, scriptMatsIndex + '/ScriptMats/'.length);
  }
  if (pathname.endsWith('.html')) {
    return pathname.slice(0, pathname.lastIndexOf('/') + 1);
  }
  return pathname.endsWith('/') ? pathname : `${pathname}/`;
}

// Auth helper functions
export async function signInWithEmail(email) {
  try {
    // Runtime override (localStorage) can be used to force links without editing code.
    let runtimeOverride = null;
    try {
      runtimeOverride = window.localStorage.getItem('magicLinkRedirectBase');
    } catch (e) {
      runtimeOverride = null;
    }
    // Prefer runtime override, then compiled constant, then computed origin
    const base = (runtimeOverride && runtimeOverride.trim()) ? runtimeOverride.trim() : (MAGIC_LINK_REDIRECT_BASE && MAGIC_LINK_REDIRECT_BASE.trim() ? MAGIC_LINK_REDIRECT_BASE.trim() : `${window.location.origin}${getAppRootPath()}`);
    const gameUrl = new URL('cargamehtml.html', base).href;
    console.log('Magic link redirect target:', gameUrl, '(computed from base:', base, ')');
    if (!MAGIC_LINK_REDIRECT_BASE && window.location.hostname && window.location.hostname.includes('github.dev')) {
      console.warn('You are generating a magic link from a github.dev host; the emailed link will point to that host unless you set MAGIC_LINK_REDIRECT_BASE to your deployed origin.');
    }
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: gameUrl
      }
    });
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Sign in error:', error.message);
    return { success: false, error: error.message };
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Sign out error:', error.message);
    return { success: false, error: error.message };
  }
}

export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error) {
    console.error('Get user error:', error.message);
    return null;
  }
}

// Database helper functions
export async function updateUserProfile(userId, profile) {
  try {
    if (!userId) {
      throw new Error('User ID is required.');
    }

    const payload = { id: userId };
    if (profile?.email) payload.email = profile.email;
    if (profile?.name) payload.name = profile.name;
    if (profile?.photo_url) payload.photo_url = profile.photo_url;

    const { data, error } = await supabase
      .from('users')
      .upsert(payload, { onConflict: 'id' });
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Update profile error:', error.message);
    return { success: false, error: error.message };
  }
}

async function ensureUserRecord() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!user) throw new Error('Not signed in.');

  const profile = {
    email: user.email,
    name: user.user_metadata?.full_name || user.user_metadata?.name || null,
    photo_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null
  };

  const profileResult = await updateUserProfile(user.id, profile);
  if (!profileResult.success) {
    throw new Error(profileResult.error || 'Unable to sync user profile.');
  }

  return user;
}

export async function saveGameScore(userId, score, carsGuessed, gameType = 'single') {
  try {
    const { data, error } = await supabase
      .from('game_scores')
      .insert({
        user_id: userId,
        score: score,
        cars_guessed: carsGuessed,
        game_type: gameType
      });
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Save score error:', error.message);
    return { success: false, error: error.message };
  }
}

export async function getLeaderboard(limit = 10) {
  try {
    const { data, error } = await supabase
      .from('game_scores')
      .select('user_id, score, users(name, photo_url)')
      .order('score', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Leaderboard error:', error.message);
    return { success: false, error: error.message };
  }
}

export async function createMultiplayerGame(player1Id) {
  try {
    const user = await ensureUserRecord();
    const gameCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const { data, error } = await supabase
      .from('multiplayer_games')
      .insert({
        game_code: gameCode,
        player_1_id: user.id,
        status: 'waiting'
      })
      .select();
    
    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    console.error('Create game error:', error.message);
    return { success: false, error: error.message };
  }
}

export async function joinMultiplayerGame(gameCode, player2Id) {
  try {
    const normalizedCode = gameCode.trim().toUpperCase();
    const user = await ensureUserRecord();
    if (player2Id && player2Id !== user.id) {
      console.warn('Provided player ID does not match signed-in user.');
    }

    const { data, error } = await supabase
      .from('multiplayer_games')
      .update({ 
        player_2_id: user.id,
        status: 'active'
      })
      .eq('game_code', normalizedCode)
      .eq('status', 'waiting')
      .is('player_2_id', null)
      .select()
      .maybeSingle();
    
    if (error) throw error;
    if (!data) {
      return {
        success: false,
        error: 'Game not found or already joined. If this keeps happening, update your Supabase multiplayer RLS policy to allow joining waiting games.'
      };
    }
    return { success: true, data };
  } catch (error) {
    console.error('Join game error:', error.message);
    return { success: false, error: error.message };
  }
}

export async function getMultiplayerGame(gameId) {
  try {
    if (!gameId) {
      throw new Error('Game ID is required.');
    }

    const { data, error } = await supabase
      .from('multiplayer_games')
      .select('*')
      .eq('id', gameId)
      .maybeSingle();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Get game error:', error.message);
    return { success: false, error: error.message };
  }
}

export async function getMultiplayerGameByCode(gameCode) {
  try {
    if (!gameCode) {
      throw new Error('Game code is required.');
    }
    const normalizedCode = gameCode.trim().toUpperCase();

    const { data, error } = await supabase
      .from('multiplayer_games')
      .select('*')
      .eq('game_code', normalizedCode)
      .maybeSingle();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Get game by code error:', error.message);
    return { success: false, error: error.message };
  }
}

export async function updateGameScore(gameId, player, newScore) {
  try {
    const updateData = player === 1 ? { player_1_score: newScore } : { player_2_score: newScore };
    
    const { data, error } = await supabase
      .from('multiplayer_games')
      .update(updateData)
      .eq('id', gameId)
      .select();
    
    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    console.error('Update score error:', error.message);
    return { success: false, error: error.message };
  }
}

export async function finishMultiplayerGame(gameId, winnerId) {
  try {
    const { data, error } = await supabase
      .from('multiplayer_games')
      .update({ 
        status: 'finished',
        winner_id: winnerId,
        finished_at: new Date().toISOString()
      })
      .eq('id', gameId)
      .select();
    
    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    console.error('Finish game error:', error.message);
    return { success: false, error: error.message };
  }
}

export function subscribeToGameUpdates(gameId, callback) {
  return supabase
    .channel(`multiplayer-games-${gameId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'multiplayer_games',
        filter: `id=eq.${gameId}`
      },
      payload => callback(payload)
    )
    .subscribe();
}
3
// ---- Local guest helpers (device-only guest identity)
const GUEST_KEY = 'carGuesserGuest';

export function ensureGuest() {
  try {
    const raw = localStorage.getItem(GUEST_KEY);
    if (raw) return JSON.parse(raw);
    const deviceId = 'guest_' + Math.random().toString(36).substring(2, 10);
    const guest = { deviceId, name: 'Guest ' + deviceId.slice(-4), createdAt: new Date().toISOString() };
    localStorage.setItem(GUEST_KEY, JSON.stringify(guest));
    return guest;
  } catch (e) {
    console.warn('ensureGuest error', e?.message || e);
    return null;
  }
}

export function getGuest() {
  try {
    const raw = localStorage.getItem(GUEST_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.warn('getGuest error', e?.message || e);
    return null;
  }
}

export function saveGuestScoreLocally(mode, score, carsGuessed) {
  try {
    const key = 'carGuesser_guest_scores';
    const list = JSON.parse(localStorage.getItem(key) || '[]');
    const guest = getGuest() || ensureGuest();
    list.push({ id: Date.now(), guest_device_id: guest?.deviceId || null, guest_name: guest?.name || null, mode, score, carsGuessed, created_at: new Date().toISOString() });
    localStorage.setItem(key, JSON.stringify(list));
    return { success: true, data: list };
  } catch (e) {
    console.warn('saveGuestScoreLocally error', e?.message || e);
    return { success: false, error: e?.message || e };
  }
}

export function getGuestScores() {
  try {
    const key = 'carGuesser_guest_scores';
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch (e) {
    console.warn('getGuestScores error', e?.message || e);
    return [];
  }
}

// Attempt to upload local guest scores to Supabase.
// This will try to insert rows into `game_scores` with guest metadata fields.
export async function uploadGuestScoresToSupabase() {
  try {
    const scores = getGuestScores();
    if (!scores || scores.length === 0) return { success: true, inserted: 0, message: 'No guest scores to upload.' };

    // Map local items into DB rows. We include guest_device_id and guest_name fields
    // If your `game_scores` table does not accept these columns, the insert may fail.
    const rows = scores.map(s => ({
      user_id: null,
      guest_device_id: s.guest_device_id || null,
      guest_name: s.guest_name || null,
      score: s.score,
      cars_guessed: s.carsGuessed || s.cars_guessed || 0,
      game_type: s.mode || s.game_type || 'single',
      created_at: s.created_at || new Date().toISOString()
    }));

    const { data, error } = await supabase.from('game_scores').insert(rows).select();
    if (error) {
      console.warn('uploadGuestScoresToSupabase insert error', error.message || error);
      return { success: false, error: error.message || error };
    }

    // On success, clear the local guest scores that were uploaded.
    localStorage.removeItem('carGuesser_guest_scores');
    return { success: true, inserted: (data || []).length, data };
  } catch (e) {
    console.warn('uploadGuestScoresToSupabase error', e?.message || e);
    return { success: false, error: e?.message || e };
  }
}
