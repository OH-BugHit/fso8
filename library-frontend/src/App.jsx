import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import { Link, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Notification from "./components/Notification";

const App = () => {
  const [notifyMessage, setNotifyMessage] = useState({
    message: null,
    messageType: "success",
  });

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
          add
        </Link>
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
