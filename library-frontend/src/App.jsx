import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import Loginform from "./components/Loginform";
import { Link, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Notification from "./components/Notification";
import { useApolloClient } from "@apollo/client";
const client = useApolloClient;

const App = () => {
  const [token, setToken] = useState(null);

  const [notifyMessage, setNotifyMessage] = useState({
    message: null,
    messageType: "success",
  });

  const logout = () => {
    setToken(null);
    localStorage.clear();
    client.resetStore();
  };

  if (!token) {
    // Jos ei ole tokenia niin... Login on / path eli index.
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
          <Link className="topMenu" to="/">
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
            path="/"
            element={
              <Loginform
                setToken={setToken}
                setNotifyMessage={setNotifyMessage}
              />
            }
          />
        </Routes>
      </div>
    );
  }

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
        <Link className="topMenu" to="/add">
          add book
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
      </Routes>
    </div>
  );
};

export default App;
