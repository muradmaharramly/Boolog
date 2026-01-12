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

export const fetchRecentComments = createAsyncThunk('admin/fetchRecentComments', async (_, { rejectWithValue }) => {
  // 1. Fetch comments
  const { data: comments, error } = await supabase
    .from('comments')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) return rejectWithValue(error.message);
  
  if (!comments || comments.length === 0) return [];

  // 2. Fetch profiles
  const userIds = [...new Set(comments.map(c => c.user_id).filter(Boolean))];
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, username, avatar_url')
    .in('id', userIds);

  // 3. Fetch blogs
  const blogIds = [...new Set(comments.map(c => c.blog_id).filter(Boolean))];
  const { data: blogs } = await supabase
    .from('blogs')
    .select('id, title')
    .in('id', blogIds);

  // 4. Map data
  const enrichedComments = comments.map(comment => ({
    ...comment,
    profiles: profiles?.find(p => p.id === comment.user_id) || { username: 'Admin', avatar_url: null },
    blogs: blogs?.find(b => b.id === comment.blog_id) || { title: 'Unknown Blog' }
  }));

  return enrichedComments;
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

export const deleteUser = createAsyncThunk('admin/deleteUser', async (userId, { rejectWithValue }) => {
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId);
    
  if (error) return rejectWithValue(error.message);
  return userId;
});

export const updateUser = createAsyncThunk('admin/updateUser', async (userData, { rejectWithValue }) => {
  const { id, ...updates } = userData;
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
    
  if (error) return rejectWithValue(error.message);
  return data;
});

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    users: [],
    recentComments: [],
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
      // Fetch Recent Comments
      .addCase(fetchRecentComments.fulfilled, (state, action) => {
        state.recentComments = action.payload;
      })
      // Add Category
      .addCase(addCategory.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Delete User
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter(user => user.id !== action.payload);
      })
      // Update User
      .addCase(updateUser.fulfilled, (state, action) => {
        const index = state.users.findIndex(user => user.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      });
  },
});

export default adminSlice.reducer;
