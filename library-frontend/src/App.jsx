import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import Loginform from "./components/Loginform";
import { Link, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Notification from "./components/Notification";
import Recommendations from "./components/Recommendations";
import { useApolloClient, useSubscription } from "@apollo/client";
import { ALL_BOOKS, BOOK_ADDED } from "./queries";

const App = () => {
  const client = useApolloClient();
  const [token, setToken] = useState(localStorage.getItem("user-token"));
  const [favoriteGenre, setFavoriteGenre] = useState(null);
  const [notifyMessage, setNotifyMessage] = useState({
    message: null,
    messageType: "success",
  });

  useSubscription(BOOK_ADDED, {
    onData: ({ data }) => {
      const addedBook = data.data.bookAdded;
      console.log(addedBook.genres);
      addedBook.genres.forEach((element) => {
        try {
          const { allBooks } = client.cache.readQuery({
            query: ALL_BOOKS,
            variables: { genre: element },
          });
          client.cache.writeQuery({
            query: ALL_BOOKS,
            variables: { genre: element },
            data: {
              allBooks: allBooks.concat(addedBook),
            },
          });
        } catch {
          client.refetchQueries({ include: [ALL_BOOKS] }); // lisättiin uusi genre, haetaan kaikki kirjat koska tää meni vaikeaksi päivittää genreluettelo ja kaikki kirjat...
        } // nyt tosin genrekohtaiset haut säilyy ennalla, eikä niitä tehdä uudestaan. Ja toimii tolla päivityksellä // All genres päivittyy viimeistään kun painetaan sitä uudestaan
      });
      window.alert(
        `New book by ${addedBook.author} has been added with title '${addedBook.title}'`
      );
    },
  });

  const logout = () => {
    setToken(null);
    setFavoriteGenre(null);
    localStorage.clear();
    client.resetStore();
  };

  if (!token) {
    // Jos ei ole tokenia niin... Login on / path eli index. Eli ei kirjautuneen käyttäjän näkymä
    return (
      <div>
        <div>
          <Notification message={notifyMessage}></Notification>
        </div>
        <div className="topMenu">
          <Link className="topMenu" to="/authors">
            authors
          </Link>
          <Link className="topMenu" to="/books">
            books
          </Link>
          <Link className="topMenu" to="/login">
            login
          </Link>
        </div>
        <Routes>
          <Route
            path="/authors"
            element={<Authors setNotifyMessage={setNotifyMessage} />}
          />
          <Route path="/books" element={<Books />} />
          <Route
            path="/login"
            element={
              <Loginform
                setToken={setToken}
                setNotifyMessage={setNotifyMessage}
                setFavoriteGenre={setFavoriteGenre}
              />
            }
          />
          <Route
            path="/"
            element={
              <Loginform
                setToken={setToken}
                setNotifyMessage={setNotifyMessage}
                setFavoriteGenre={setFavoriteGenre}
              />
            }
          ></Route>
        </Routes>
      </div>
    );
  }

  return (
    // kirjautuneen käyttäjän näkymä
    <div>
      <div>
        <Notification message={notifyMessage}></Notification>
      </div>
      <div className="topMenu">
        <Link className="topMenu" to="/authors">
          authors
        </Link>
        <Link className="topMenu" to="/books">
          books
        </Link>
        <Link className="topMenu" to="/add">
          add book
        </Link>
        <Link className="topMenu" to="/recommendations">
          recommendations
        </Link>
        <button onClick={logout}>logout</button>
      </div>
      <Routes>
        <Route
          path="/authors"
          element={<Authors setNotifyMessage={setNotifyMessage} />}
        />
        <Route path="/books" element={<Books />} />
        <Route
          path="/add"
          element={<NewBook setNotifyMessage={setNotifyMessage} />}
        />
        <Route
          path="/recommendations"
          element={
            <Recommendations
              setNotifyMessage={setNotifyMessage}
              favoriteGenre={favoriteGenre}
            />
          }
        />
      </Routes>
    </div>
  );
};

export default App;
