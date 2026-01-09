import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../../supabaseClient';

export const fetchUsers = createAsyncThunk('admin/fetchUsers', async (_, { rejectWithValue }) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*');
    
  if (error) return rejectWithValue(error.message);
  return data;
});

export const fetchStats = createAsyncThunk('admin/fetchStats', async (_, { rejectWithValue }) => {
  const { count: usersCount, error: usersError } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });
    
  const { count: blogsCount, error: blogsError } = await supabase
    .from('blogs')
    .select('*', { count: 'exact', head: true });

  const { count: commentsCount, error: commentsError } = await supabase
    .from('comments')
    .select('*', { count: 'exact', head: true });
    
  if (usersError || blogsError || commentsError) return rejectWithValue('Error fetching stats');
  
  return { usersCount, blogsCount, commentsCount };
});

export const addCategory = createAsyncThunk('admin/addCategory', async (name, { rejectWithValue }) => {
  const { data, error } = await supabase
    .from('categories')
    .insert([{ name }])
    .select()
    .single();
    
  if (error) return rejectWithValue(error.message);
  return data;
});

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    users: [],
    stats: { usersCount: 0, blogsCount: 0, commentsCount: 0 },
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Stats
      .addCase(fetchStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      // Add Category
      .addCase(addCategory.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export default adminSlice.reducer;
