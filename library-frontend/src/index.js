import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  createHttpLink,
} from "@apollo/client";
import { BrowserRouter as Router } from "react-router-dom";
import { setContext } from "@apollo/client/link/context";

const authLink = setContext((_, { headers }) => {
  // asetetaan headereihin token joka tallennettu localStorage 'user-token'
  const token = localStorage.getItem("user-token");
  return {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : null, //muista ihan normaalisti käyttää oikeita pilkkuja....
    },
  };
});

const httpLink = createHttpLink({
  // Tää on sen normi uri: "http... tilalla"
  uri: "http://localhost:4000",
});

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: authLink.concat(httpLink), // eli tää sen sijaan että uri: http://...
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <ApolloProvider client={client}>
    <Router>
      <App />
    </Router>
  </ApolloProvider>
);
