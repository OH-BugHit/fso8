import { gql, useQuery, useMutation } from "@apollo/client";
import { parse } from "graphql";
import { useState } from "react";

const Authors = () => {
  let authors = [];

  const [name, setName] = useState("");
  const [born, setBorn] = useState("");

  const ALL_AUTHORS = gql`
    query {
      bookCount
      authorCount
      allAuthors {
        name
        born
        bookCount
      }
    }
  `;

  const UPDATE_AUTHOR = gql`
    mutation EditAuthor($name: String!, $setBornTo: Int!) {
      editAuthor(name: $name, setBornTo: $setBornTo) {
        born
        name
      }
    }
  `;

  const [editAuthor] = useMutation(UPDATE_AUTHOR);

  const result = useQuery(ALL_AUTHORS, { pollInterval: 2000 });

  if (result.loading) {
    return <div>loading...</div>;
  }

  authors = result.data.allAuthors;

  const submit = async (event) => {
    event.preventDefault();
    console.log("add book...");
    editAuthor({
      variables: { name, setBornTo: born },
    });
    setName("");
    setBorn("");
  };

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        <h2>Set birthyear</h2>
        <form onSubmit={submit}>
          <div>
            name
            <input
              value={name}
              onChange={({ target }) => setName(target.value)}
            />
          </div>
          <div>
            born
            <input
              value={born}
              onChange={({ target }) => setBorn(parseInt(target.value))}
            />
          </div>
          <button type="submit">update author</button>
        </form>
      </div>
    </div>
  );
};

export default Authors;
