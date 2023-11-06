import { useQuery } from "@apollo/client";
import { ALL_BOOKS } from "../queries";
import { useState } from "react";

const Books = () => {
  const [selectedGenre, setSelectedGenre] = useState(null);

  const booksToShowResult = useQuery(
    ALL_BOOKS,
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

  const booksForGenre = useQuery(ALL_BOOKS, {
    onError: (e) => {
      const messages = e.graphQLErrors.map((e) => e.message).join("\n");
      console.log(messages);
    },
  });

  if (booksToShowResult.loading || booksForGenre.loading) {
    return <div>loading...</div>;
  }

  const genres = [
    ...new Set(
      booksForGenre.data.allBooks.flatMap((book) => book.genres || [])
    ),
  ]; // Otetaan genret talteen kaikista kirjoista

  const allClickHandler = async () => {
    setSelectedGenre(null);
    await booksToShowResult.refetch(); // päivitetään kaikkien lista
  };

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
          {booksToShowResult.data.allBooks.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="genreRivi">
        <button className="painikkeet" onClick={() => allClickHandler()}>
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
