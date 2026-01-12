import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../../supabaseClient';
import bcrypt from 'bcryptjs';

export const signUp = createAsyncThunk('auth/signUp', async ({ email, password, username }, { rejectWithValue }) => {
  try {
    // Prevent registering as admin email
    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
    if (adminEmail && email === adminEmail) {
        throw new Error('Cannot register as admin. Please contact support.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const { data, error } = await supabase
      .from('profiles')
      .insert([
        {
          email,
          password: hashedPassword,
          username,
          role: 'user',
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const signIn = createAsyncThunk('auth/signIn', async ({ email, password }, { rejectWithValue }) => {
  try {
    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;

    // 1. Admin Login (Supabase Auth)
    // Only attempt if email matches admin email to avoid unnecessary calls
    if (adminEmail && email === adminEmail) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            // Fallback to check if they are in profiles table? 
            // No, admin MUST be in Supabase Auth per requirements.
            throw error;
        }

        // Ensure Admin has a profile in the public.profiles table
        // This is crucial for blogs/comments to correctly link to the Admin author
        const { error: upsertError } = await supabase
            .from('profiles')
            .upsert({
                id: data.user.id,
                email: data.user.email,
                username: 'Admin',
                role: 'admin',
                avatar_url: null
            });

        if (upsertError) {
            console.error('Failed to ensure admin profile:', upsertError);
        }

        // Return admin session structure
        // We mock a profile for consistency, or we could fetch one if you add admin to profiles too
        return { 
            user: data.user, 
            profile: { 
                id: data.user.id, 
                email: data.user.email, 
                role: 'admin', 
                username: 'Admin' 
            } 
        };
    }

    // 2. Normal User Login (Custom Auth - Profiles Table)
    // Fetch user by email
    const { data: user, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      throw new Error('Invalid email or password');
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    // Store session manually
    localStorage.setItem('boolog_user', JSON.stringify(user));

    return { user: { id: user.id, email: user.email }, profile: user };
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const signOut = createAsyncThunk('auth/signOut', async (_, { rejectWithValue }) => {
  // 1. Admin Sign Out
  await supabase.auth.signOut();
  
  // 2. Custom Auth Sign Out
  localStorage.removeItem('boolog_user');
  
  return null;
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async ({ id, updates }, { rejectWithValue }) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    // Update local storage if using custom auth
    const storedUser = localStorage.getItem('boolog_user');
    if (storedUser) {
        localStorage.setItem('boolog_user', JSON.stringify(data));
    }
    
    return data;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const checkSession = createAsyncThunk('auth/checkSession', async (_, { rejectWithValue }) => {
  // 1. Check Supabase Session (Admin)
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    // Ensure Admin has a profile
    const { error: upsertError } = await supabase
        .from('profiles')
        .upsert({
            id: session.user.id,
            email: session.user.email,
            username: 'Admin',
            role: 'admin',
            avatar_url: null
        });
        
    if (upsertError) console.error('Failed to ensure admin profile in checkSession:', upsertError);

    return { 
        session: { user: session.user }, 
        profile: { 
            id: session.user.id, 
            email: session.user.email, 
            role: 'admin', 
            username: 'Admin' 
        } 
    };
  }

  // 2. Check Local Storage (Custom Auth)
  const storedUser = localStorage.getItem('boolog_user');
  
  if (storedUser) {
    try {
      const profile = JSON.parse(storedUser);
      // Optionally verify with DB again to get latest data
      const { data: latestProfile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profile.id)
        .single();

      if (!error && latestProfile) {
          // Update local storage
          localStorage.setItem('boolog_user', JSON.stringify(latestProfile));
          return { session: { user: { id: latestProfile.id, email: latestProfile.email } }, profile: latestProfile };
      }
      
      // If DB fetch fails but we have local, use local (or logout if critical)
      return { session: { user: { id: profile.id, email: profile.email } }, profile };
    } catch (e) {
      localStorage.removeItem('boolog_user');
      return null;
    }
  }
  return null;
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    profile: null,
    loading: false,
    error: null,
    isAuthenticated: false,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Sign Up
      .addCase(signUp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.loading = false;
        // User needs to confirm email usually, or auto login if disabled
        // For now we assume email confirmation might be needed or handled
      })
      .addCase(signUp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Sign In
      .addCase(signIn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.profile = action.payload.profile;
        state.isAuthenticated = true;
      })
      .addCase(signIn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Sign Out
      .addCase(signOut.fulfilled, (state) => {
        state.user = null;
        state.profile = null;
        state.isAuthenticated = false;
      })
      // Check Session
      .addCase(checkSession.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkSession.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.user = action.payload.session.user;
          state.profile = action.payload.profile;
          state.isAuthenticated = true;
        }
      })
      .addCase(checkSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
