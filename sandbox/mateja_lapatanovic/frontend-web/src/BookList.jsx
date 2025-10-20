function BookList({ books, refresh }) {
  const handleDelete = async (id) => {
    await fetch(`http://localhost:7054/api/book/${id}`, { method: 'DELETE' });
    refresh();
  };

  const handleUpdate = async (book) => {
    const updatedTitle = prompt('New title:', book.title);
    if (updatedTitle === null) return;

    const updatedAuthor = prompt('New author:', book.author);
    if (updatedAuthor === null) return;

    const updatedYear = prompt('New year:', book.year);
    if (updatedYear === null) return;

    await fetch(`http://localhost:7054/api/book/${book.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...book,
        title: updatedTitle,
        author: updatedAuthor,
        year: updatedYear
      }),
    });

    refresh();
  };

  return (
    <div id="bookList">
      <ul>
      {books.map(book => (
        <li key={book.id}>
          <div className="list-wrapper">
            <span>
              {book.title} - {book.author} ({book.year}) 
            </span>
            <span>
              <button className="list-button" onClick={() => handleUpdate(book)}>Edit</button>
              <button className="list-button delete-button" onClick={() => handleDelete(book.id)}>Delete</button>
            </span>
          </div>
        </li>
      ))}
      </ul>
    </div>
  );
}

export default BookList;