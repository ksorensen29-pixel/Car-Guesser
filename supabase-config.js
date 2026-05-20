// Supabase Configuration for Car Guesser
export const supabaseConfig = {
  url: "https://qauvcttdkbdpnhpcjdog.supabase.co",
  anon_key: "sb_publishable_BAliVVfUjkf3zZarqfRTPA_eSRTnEFk"
};

// Initialize Supabase Client
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.38.5/+esm';

export const supabase = createClient(supabaseConfig.url, supabaseConfig.anon_key);

function getAppRootPath() {
  const { pathname } = window.location;
  const scriptMatsIndex = pathname.indexOf('/ScriptMats/');
  if (scriptMatsIndex !== -1) {
    return pathname.slice(0, scriptMatsIndex + 1);
  }
  if (pathname.endsWith('.html')) {
    return pathname.slice(0, pathname.lastIndexOf('/') + 1);
  }
  return pathname.endsWith('/') ? pathname : `${pathname}/`;
}

// Auth helper functions
export async function signInWithEmail(email) {
  try {
    const dashboardUrl = new URL('dashboard.html', new URL(getAppRootPath(), window.location.origin)).href;
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: dashboardUrl
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
