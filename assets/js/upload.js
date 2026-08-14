// Function to generate a client-side fallback Book ID
function generateBookID() {
  const chars = '0123456789ABCDEF';
  let id = 'BK-';
  for (let i = 0; i < 6; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

// On upload form submission:
const { data: { user } } = await supabase.auth.getUser();

const newBookPayload = {
  book_id: generateBookID(), // Unique reference ID (e.g. BK-7E4A12)
  author_id: user.id,        // Stores the publisher/author ID
  title: document.getElementById('bookTitle').value.trim(),
  author: document.getElementById('bookAuthor').value.trim(),
  category: document.getElementById('bookCategory').value,
  language: document.getElementById('bookLanguage').value,
  price: parseFloat(document.getElementById('bookPrice').value) || 0,
  cover_url: uploadedCoverUrl,
  pdf_url: uploadedPdfUrl,
  status: 'Published'
};

const { error } = await supabase.from('books').insert([newBookPayload]);