const { data: { user } } = await supabase.auth.getUser();

// Fetch the author's Unique User ID from profiles
const { data: profile } = await supabase
  .from('profiles')
  .select('user_uid, full_name, first_name')
  .eq('id', user.id)
  .maybeSingle();

const userUid = profile?.user_uid || `SDL-${user.id.substring(0, 6).toUpperCase()}`;
const bookRefId = 'BK-' + Math.random().toString(36).substring(2, 8).toUpperCase();

const newBookPayload = {
  book_id: bookRefId,          // Unique Book Reference ID (e.g. BK-A1B2C3)
  user_uid: userUid,           // Author's Unique User ID (e.g. SDL-4369E5)
  author_id: user.id,          // Supabase Auth UUID
  title: document.getElementById('bookTitle').value.trim(),
  author: profile?.full_name || document.getElementById('bookAuthor').value.trim(),
  category: document.getElementById('bookCategory').value,
  language: document.getElementById('bookLanguage').value,
  price: parseFloat(document.getElementById('bookPrice').value) || 0,
  cover_url: uploadedCoverUrl,
  pdf_url: uploadedPdfUrl,
  status: 'Published'
};

const { error } = await supabase.from('books').insert([newBookPayload]);