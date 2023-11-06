import { gql, useMutation } from "@apollo/client";
import { useState } from "react";
import DisplayMessage from "./DisplayMessage";
import { ALL_BOOKS } from "../queries";

const NEW_BOOK = gql`
  mutation AddBook(
    $title: String!
    $author: String!
    $published: Int!
    $genres: [String!]
  ) {
    addBook(
      title: $title
      author: $author
      published: $published
      genres: $genres
    ) {
      author
      genres
      title
      published
    }
  }
`;

const NewBook = ({ setNotifyMessage }) => {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [published, setPublished] = useState("");
  const [genre, setGenre] = useState("");
  const [genres, setGenres] = useState([]);

  const [createBook] = useMutation(NEW_BOOK, {
    update: (cache, { data: { addBook } }) => {
      // Update the cache for the ALL_BOOKS query
      genres.forEach((element) => {
        const { allBooks } = cache.readQuery({ query: ALL_BOOKS }); // Tää toimii muuten hyvin, mutta muista että ID puuttuu kun liitetään tolla concatilla vaan. Id:hän tulisi MongoDB:stä
        cache.writeQuery({
          // Mutta näin siis päivittää forEach genre mitä laitettu niin kaikki genrekohtaiset kyselyt sit kun niitä haluttaisiin näyttää.
          query: ALL_BOOKS,
          variables: { genre: element },
          data: {
            allBooks: allBooks.concat(addBook),
          },
        });
      });
      const { allBooks } = cache.readQuery({ query: ALL_BOOKS }); // Päivitetään genrejen saantia varten. Oikeasti tehtäisiin backendiin oma kysely tälle josta saisi pelkät genret.
      cache.writeQuery({
        query: ALL_BOOKS,
        data: {
          allBooks: allBooks.concat(addBook),
        },
      });
    },
    onError: (e) => {
      const messages = e.graphQLErrors.map((e) => e.message).join("\n");
      console.log(messages);
      DisplayMessage(setNotifyMessage, {
        message: e.graphQLErrors.map((e) => e.message).join("\n"),
        messageType: "error",
      });
    },
  });

  const submit = async (event) => {
    event.preventDefault();
    console.log("add book...");
    createBook({
      variables: { title, author, published, genres },
    });

    setTitle("");
    setPublished("");
    setAuthor("");
    setGenres([]);
    setGenre("");
  };

  const addGenre = () => {
    setGenres(genres.concat(genre));
    setGenre("");
  };

  return (
    <div>
      <form onSubmit={submit}>
        <div>
          title
          <input
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>
        <div>
          author
          <input
            value={author}
            onChange={({ target }) => setAuthor(target.value)}
          />
        </div>
        <div>
          published
          <input
            type="number"
            value={published}
            onChange={({ target }) => setPublished(parseInt(target.value))}
          />
        </div>
        <div>
          <input
            value={genre}
            onChange={({ target }) => setGenre(target.value)}
          />
          <button onClick={addGenre} type="button">
            add genre
          </button>
        </div>
        <div>genres: {genres.join(" ")}</div>
        <button type="submit">create book</button>
      </form>
    </div>
  );
};

export default NewBook;
