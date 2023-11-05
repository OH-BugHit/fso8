import { gql, useQuery, useMutation } from "@apollo/client";
import Select from "react-select";
import { useState } from "react";
import DisplayMessage from "./DisplayMessage";

const Authors = ({ setNotifyMessage }) => {
  let authors = [];

  //GraphicQL kysely. Muoto on helppo kopioda ApolloServer-sandboxista.
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

  //Mutaation editAuthor toteutus.
  const UPDATE_AUTHOR = gql`
    mutation EditAuthor($name: String!, $setBornTo: Int!) {
      editAuthor(name: $name, setBornTo: $setBornTo) {
        born
        name
      }
    }
  `;

  const [born, setBorn] = useState("");
  // onError on graphQL virheenkäsittely
  const [editAuthor] = useMutation(UPDATE_AUTHOR, {
    onError: (e) => {
      const messages = e.graphQLErrors.map((e) => e.message).join("\n");
      console.log(messages);
      DisplayMessage(setNotifyMessage, {
        message: e.graphQLErrors.map((e) => e.message).join("\n"),
        messageType: "error",
      });
    },
  });
  const [selectedOption, setSelectedOption] = useState(null);

  //pollIntervall kyselee kun komponentti(nimenomainen sivu) on "aktiivinen"
  const result = useQuery(ALL_AUTHORS, { pollInterval: 2000 });

  //Kun lataa vielä tulosta
  if (result.loading) {
    return <div>loading...</div>;
  }

  //Ja kun ladattu niin asetetaan muuttujaan
  authors = result.data.allAuthors;

  //Perus onSubmit
  const submit = async (event) => {
    event.preventDefault();
    console.log("setting birth year...");
    editAuthor({
      variables: { name: selectedOption, setBornTo: born },
    });

    setBorn("");
  };

  //Perus handleri
  const handleBornChange = (event) => {
    setSelectedOption(event.value);
  };

  // Tekijän nimilistan muodostus Selectille
  var names = authors.map((a) => (a = { value: a.name, label: a.name }));

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th className="trHead">Name</th>
            <th className="trHead">Born</th>
            <th className="trHead">Books</th>
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
            <Select
              defaultValue={selectedOption}
              onChange={handleBornChange}
              options={names}
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
