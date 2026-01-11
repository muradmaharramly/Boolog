import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../../supabaseClient';

export const fetchBlogs = createAsyncThunk('blogs/fetchBlogs', async (_, { rejectWithValue }) => {
  // 1. Fetch blogs
  const { data: blogs, error } = await supabase
    .from('blogs')
    .select(`
      *,
      categories (name),
      likes (user_id),
      comments (id)
    `)
    .order('created_at', { ascending: false });

  if (error) return rejectWithValue(error.message);

  if (!blogs || blogs.length === 0) return [];

  // 2. Fetch profiles for authors
  const authorIds = [...new Set(blogs.map(b => b.author_id).filter(Boolean))];
  
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, username, avatar_url')
    .in('id', authorIds);

  if (profilesError) {
    console.error('Error fetching profiles:', profilesError);
    // Return blogs without profiles if profile fetch fails
    return blogs;
  }

  // 3. Map profiles to blogs
  const blogsWithProfiles = blogs.map(blog => {
    const profile = profiles?.find(p => p.id === blog.author_id);
    return {
      ...blog,
      profiles: profile || { username: 'Admin', avatar_url: null }
    };
  });

  return blogsWithProfiles;
});

export const addBlog = createAsyncThunk('blogs/addBlog', async (blogData, { rejectWithValue }) => {
  // 1. Insert Blog
  const { data: newBlog, error } = await supabase
    .from('blogs')
    .insert([blogData])
    .select()
    .single();

  if (error) return rejectWithValue(error.message);

  // 2. Fetch Author Profile (to display immediately without refresh)
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('username, avatar_url')
    .eq('id', blogData.author_id)
    .single();

  // 3. Attach profile to blog object
  return {
    ...newBlog,
    profiles: profile || { username: 'Admin', avatar_url: null }
  };
});

export const toggleLike = createAsyncThunk('blogs/toggleLike', async ({ blogId, userId }, { rejectWithValue }) => {
  // Check if like exists using maybeSingle logic (fetch array)
  const { data: likes, error: fetchError } = await supabase
    .from('likes')
    .select('*')
    .eq('blog_id', blogId)
    .eq('user_id', userId);

  if (fetchError) return rejectWithValue(fetchError.message);

  const existingLike = likes && likes.length > 0 ? likes[0] : null;

  if (existingLike) {
    // Unlike
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('id', existingLike.id);
    if (error) return rejectWithValue(error.message);
    return { blogId, userId, type: 'unlike' };
  } else {
    // Like
    const { error } = await supabase
      .from('likes')
      .insert([{ blog_id: blogId, user_id: userId }]);
    if (error) return rejectWithValue(error.message);
    return { blogId, userId, type: 'like' };
  }
});

export const addComment = createAsyncThunk('blogs/addComment', async ({ blogId, userId, content }, { rejectWithValue }) => {
  // 1. Insert the comment
  const { data: commentData, error: insertError } = await supabase
    .from('comments')
    .insert([{ blog_id: blogId, user_id: userId, content }])
    .select()
    .single();

  if (insertError) return rejectWithValue(insertError.message);

  // 2. Fetch the user profile details for the UI
  // We use the 'profiles' table directly since we might be in custom auth mode
  // and the join might be failing if permissions/FKs are tricky.
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('username, avatar_url')
    .eq('id', userId)
    .single();
    
  // If profile fetch fails (e.g. Admin not in profiles), just return basic info
  // or default values.
  const profile = profileData || { username: 'Unknown', avatar_url: null };

  return {
    ...commentData,
    profiles: profile
  };
});

export const fetchComments = createAsyncThunk('blogs/fetchComments', async (blogId, { rejectWithValue }) => {
    // 1. Fetch comments without join
    const { data: comments, error } = await supabase
        .from('comments')
        .select('*')
        .eq('blog_id', blogId)
        .order('created_at', { ascending: true });

    if (error) return rejectWithValue(error.message);

    if (!comments || comments.length === 0) return { blogId, comments: [] };

    // 2. Fetch profiles for these comments
    const userIds = [...new Set(comments.map(c => c.user_id))];
    const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', userIds);
        
    // 3. Map profiles to comments
    const commentsWithProfiles = comments.map(comment => {
        const profile = profiles?.find(p => p.id === comment.user_id);
        return {
            ...comment,
            profiles: profile || { username: 'Unknown', avatar_url: null }
        };
    });

    return { blogId, comments: commentsWithProfiles };
});

export const deleteComment = createAsyncThunk('blogs/deleteComment', async ({ commentId, blogId }, { rejectWithValue }) => {
    const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

    if (error) return rejectWithValue(error.message);
    return { commentId, blogId };
});

export const deleteBlog = createAsyncThunk('blogs/deleteBlog', async (blogId, { rejectWithValue }) => {
  const { error } = await supabase
    .from('blogs')
    .delete()
    .eq('id', blogId);

  if (error) return rejectWithValue(error.message);
  return blogId;
});

export const updateBlog = createAsyncThunk('blogs/updateBlog', async ({ id, ...updates }, { rejectWithValue }) => {
  const { data, error } = await supabase
    .from('blogs')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) return rejectWithValue(error.message);
  return data;
});

export const fetchCategories = createAsyncThunk('blogs/fetchCategories', async (_, { rejectWithValue }) => {
  const { data, error } = await supabase
    .from('categories')
    .select('*');
    
  if (error) return rejectWithValue(error.message);
  return data;
});

const blogsSlice = createSlice({
  name: 'blogs',
  initialState: {
    items: [],
    categories: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Blogs
      .addCase(fetchBlogs.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBlogs.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchBlogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add Blog
      .addCase(addBlog.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      // Toggle Like
      .addCase(toggleLike.fulfilled, (state, action) => {
        const { blogId, userId, type } = action.payload;
        const blog = state.items.find(b => b.id === blogId);
        if (blog) {
          if (!blog.likes) blog.likes = []; // Ensure likes array exists
          if (type === 'like') {
            blog.likes.push({ user_id: userId });
          } else {
            blog.likes = blog.likes.filter(l => l.user_id !== userId);
          }
        }
      })
      .addCase(toggleLike.rejected, (state, action) => {
        console.error('Toggle like failed:', action.payload);
        // Optionally store error or show toast via middleware
      })
      // Add Comment
      .addCase(addComment.fulfilled, (state, action) => {
          const { blogId } = action.payload;
          const blog = state.items.find(b => b.id === blogId);
          if (blog) {
              if (!blog.comments) blog.comments = [];
              blog.comments.push(action.payload);
          }
      })
      // Fetch Comments
      .addCase(fetchComments.fulfilled, (state, action) => {
          const { blogId, comments } = action.payload;
          const blog = state.items.find(b => b.id === blogId);
          if (blog) {
              blog.comments = comments;
          }
      })
      // Delete Comment
      .addCase(deleteComment.fulfilled, (state, action) => {
          const { blogId, commentId } = action.payload;
          const blog = state.items.find(b => b.id === blogId);
          if (blog) {
              blog.comments = blog.comments.filter(c => c.id !== commentId);
          }
      })
      // Delete Blog
      .addCase(deleteBlog.fulfilled, (state, action) => {
        state.items = state.items.filter(blog => blog.id !== action.payload);
      })
      // Update Blog
      .addCase(updateBlog.fulfilled, (state, action) => {
        const index = state.items.findIndex(blog => blog.id === action.payload.id);
        if (index !== -1) {
          // Merge existing blog data with updates to preserve relationships if not returned
          state.items[index] = { ...state.items[index], ...action.payload };
        }
      })
      
      // Fetch Categories
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      });
  },
});

export default blogsSlice.reducer;
