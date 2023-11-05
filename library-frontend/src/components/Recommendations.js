import { gql, useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { ME } from "../queries";

const Recommendations = () => {
  let booksByGenre = [];
  const [selectedGenre, setSelectedGenre] = useState(null);
  const result = useQuery(ME);

  useEffect(() => {
    if (!result.loading) {
      setSelectedGenre(result.data.me.favoriteGenre);
    }
  }, [result]);

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
      variables: { genre: selectedGenre }, // TÄÄ TOIMII ELI SE ME KYSELY TOIMIMAAN VIELÄ!!!!!!!!!!!!!!
    },
    {
      onError: (e) => {
        const messages = e.graphQLErrors.map((e) => e.message).join("\n");
        console.log(messages);
      },
    }
  );

  if (booksToShowResult.loading) {
    return <div>loading...</div>;
  }

  booksByGenre = booksToShowResult.data.allBooks;

  return (
    <div>
      <h2>Recommendations</h2>
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
    </div>
  );
};

export default Recommendations;
