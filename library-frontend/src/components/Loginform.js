import { useMutation } from "@apollo/client";
import { useEffect, useState } from "react";
import DisplayMessage from "./DisplayMessage";
import { LOGIN } from "../queries";

const Login = ({ setNotifyMessage, setToken, setFavoriteGenre }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [login, result] = useMutation(LOGIN, {
    // Kirjaudutaan sisään mutaatiolla LOGIN, joka on siis queriessissa. Virheestä tulee perus virheenkäsittely (notifikaatio)
    onError: (e) => {
      const messages = e.graphQLErrors.map((e) => e.message).join("\n");
      console.log(messages);
      DisplayMessage(setNotifyMessage, {
        message: e.graphQLErrors.map((e) => e.message).join("\n"),
        messageType: "error",
      });
    },
  });

  useEffect(() => {
    // Muutokseen vastataan eli jos vastaus on muuta kuin null käytännössä... Talletetaan vastaukseksi saatu token localStorageen ja tehdään setToken
    if (result.data) {
      const token = result.data.login.value;
      setToken(token);
      localStorage.setItem("user-token", token);
    }
  }, [result.data]);

  const submit = async (event) => {
    event.preventDefault();

    console.log("Login...");
    login({
      variables: { username: username, password: password },
    });
    setUsername("");
    setPassword("");
  };

  return (
    <div>
      <form onSubmit={submit}>
        <div>
          username
          <input
            value={username}
            onChange={({ target }) => setUsername(target.value)}
          />
        </div>
        <div>
          password
          <input
            value={password}
            onChange={({ target }) => setPassword(target.value)}
          />
        </div>
        <button type="submit">login</button>
      </form>
    </div>
  );
};

export default Login;
