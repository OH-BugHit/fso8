import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import { Link, Routes, Route } from "react-router-dom";

const App = () => {
  return (
    <div>
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
        <Route path="/authors" element={<Authors />} />
        <Route path="/books" element={<Books />} />
        <Route path="/add" element={<NewBook />} />
      </Routes>
    </div>
  );
};

export default App;
