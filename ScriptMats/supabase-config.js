// Supabase Configuration for Car Guesser
export const supabaseConfig = {
  url: "https://qauvcttdkbdpnhpcjdog.supabase.co",
  anon_key: "sb_publishable_BAliVVfUjkf3zZarqfRTPA_eSRTnEFk"
};

// Initialize Supabase Client
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.38.5/+esm';

export const supabase = createClient(supabaseConfig.url, supabaseConfig.anon_key);

// Auth helper functions
export async function signInWithEmail(email) {
  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.href
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
    const { data, error } = await supabase
      .from('users')
      .upsert({ 
        id: userId, 
        email: profile.email,
        name: profile.name,
        photo_url: profile.photo_url
      }, { onConflict: 'id' });
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Update profile error:', error.message);
    return { success: false, error: error.message };
  }
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
    const gameCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const { data, error } = await supabase
      .from('multiplayer_games')
      .insert({
        game_code: gameCode,
        player_1_id: player1Id,
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
    const { data, error } = await supabase
      .from('multiplayer_games')
      .update({ 
        player_2_id: player2Id,
        status: 'active'
      })
      .eq('game_code', gameCode)
      .select();
    
    if (error) throw error;
    return { success: true, data: data[0] };
  } catch (error) {
    console.error('Join game error:', error.message);
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

export async function subscribeToGameUpdates(gameId, callback) {
  return supabase
    .from(`multiplayer_games:id=eq.${gameId}`)
    .on('*', payload => callback(payload))
    .subscribe();
}
