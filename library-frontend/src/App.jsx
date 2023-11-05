import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import Loginform from "./components/Loginform";
import { Link, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import Notification from "./components/Notification";
import Recommendations from "./components/Recommendations";
import { useApolloClient } from "@apollo/client";

const App = () => {
  const client = useApolloClient();
  const [token, setToken] = useState(localStorage.getItem("user-token"));
  const [favoriteGenre, setFavoriteGenre] = useState(null);
  const [notifyMessage, setNotifyMessage] = useState({
    message: null,
    messageType: "success",
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
