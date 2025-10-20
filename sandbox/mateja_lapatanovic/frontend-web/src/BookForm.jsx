import { useState } from 'react';

function BookForm({ onBookCreated }) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [year, setYear] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !author.trim()) {
      alert('Please fill in both the title and author.');
      return;
    }

    const book = {
      title,
      author,
      year: year,
    };

    try {
      const response = await fetch('http://localhost:7054/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(book),
      });

      if (!response.ok) {
        throw new Error('Failed to create book');
      }

      const newBook = await response.json();
      onBookCreated(newBook);

      setTitle('');
      setAuthor('');
      setYear('');
    } catch (error) {
      console.error('Error creating book:', error);
      alert('There was a problem creating the book.');
    }
  };

  return (
    <>
    <h2>Books</h2>
    <form onSubmit={handleSubmit}>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Book title" />
      <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Book author" />
      <input type='number' value={year} onChange={(e) => setYear(e.target.value)} placeholder="Release year" />
      <button type="submit">Add Book</button>
    </form>
    </>
  );
}

export default BookForm;
