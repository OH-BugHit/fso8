import { gql, useQuery } from "@apollo/client";
import { ALL_BOOKS, BOOKS_BY_GENRE } from "../queries";
import { useState } from "react";

const Books = () => {
  const [selectedGenre, setSelectedGenre] = useState(null);

  let books = [];
  let booksByGenre = [];

  const booksToShowResult = useQuery(
    gql`
      query AllBooks($genre: String) {
        allBooks(genre: $genre) {
          author
          genres
          published
          title
          id
        }
      }
    `,
    {
      variables: { genre: selectedGenre },
    },
    {
      onError: (e) => {
        const messages = e.graphQLErrors.map((e) => e.message).join("\n");
        console.log(messages);
      },
    }
  );

  const booksForGenre = useQuery(
    ALL_BOOKS,
    {
      pollInterval: 2000,
    },
    {
      onError: (e) => {
        const messages = e.graphQLErrors.map((e) => e.message).join("\n");
        console.log(messages);
      },
    }
  );

  if (booksToShowResult.loading || booksForGenre.loading) {
    return <div>loading...</div>;
  }

  books = booksForGenre.data.allBooks;
  const genres = [...new Set(books.flatMap((book) => book.genres || []))]; // Otetaan genret talteen kaikista kirjoista

  booksByGenre = booksToShowResult.data.allBooks;

  return (
    <div>
      <h2>Books</h2>
      <h4>{selectedGenre ? `In ${selectedGenre} genre` : "In all genres"}</h4>
      <table className="kirjalista">
        <tbody>
          <tr>
            <th className="trHead">Title</th>
            <th className="trHead">Author</th>
            <th className="trHead">Published</th>
          </tr>
          {booksByGenre.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="genreRivi">
        <button className="painikkeet" onClick={() => setSelectedGenre(null)}>
          All genres
        </button>
        {genres.map((genre) => (
          <button
            key={genre}
            className="painikkeet"
            onClick={() => setSelectedGenre(genre)}
          >
            {genre}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Books;
