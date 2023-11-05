import { gql } from "@apollo/client";
//GraphicQL kysely. Muoto on helppo kopioda ApolloServer-sandboxista.
export const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      value
    }
  }
`;

export const ALL_BOOKS = gql`
  query {
    allBooks {
      author
      published
      title
      genres
    }
  }
`;

export const BOOKS_BY_GENRE = gql`
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
