import { useState, useEffect } from 'react';
import BookList from './BookList';
import BookForm from './BookForm';
import "./App.css";

function App() {
  const [books, setBooks] = useState([]);

  const loadBooks = async () => {
    const res = await fetch('http://localhost:7054/api/book');
    const data = await res.json();
    setBooks(data);
  };

  useEffect(() => {
    loadBooks();
  }, []);

  return (
    <>
      <BookForm onBookCreated={loadBooks} />
      <BookList books={books} refresh={loadBooks} />
    </>
  );
}
export default App;
