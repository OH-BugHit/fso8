import { gql } from "@apollo/client";
//GraphicQL kysely. Muoto on helppo kopioda ApolloServer-sandboxista.

export const updateCache = (cache, query, addedBook) => {
  // Estää dublikaatit jos lisätään uusi kirja. (Subrcribe lisää cacheen ja NewBook myös)
  const uniqByName = (a) => {
    let seen = new Set();
    return a.filter((item) => {
      let k = item.name;
      return seen.has(k) ? false : seen.add(k);
    });
  };

  cache.updateQuery(query, ({ allBooks }) => {
    return {
      allBooks: uniqByName(allBooks.concat(addedBook)),
    };
  });
};

export const ME = gql`
  query {
    me {
      favoriteGenre
    }
  }
`;

export const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      value
    }
  }
`;

export const ALL_BOOKS = gql`
  query AllBooks($genre: String) {
    allBooks(genre: $genre) {
      author
      genres
      published
      title
      id
    }
  }
`;

export const ALL_AUTHORS = gql`
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

export const UPDATE_AUTHOR = gql`
  mutation EditAuthor($name: String!, $setBornTo: Int!) {
    editAuthor(name: $name, setBornTo: $setBornTo) {
      born
      name
    }
  }
`;

export const BOOK_ADDED = gql`
  subscription {
    bookAdded {
      author
      genres
      published
      title
      id
    }
  }
`;
