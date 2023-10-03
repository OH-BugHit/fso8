const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const { v1: uuid, v1 } = require("uuid");
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const Book = require("./src/models/bookSchema");
const Author = require("./src/models/AuthorSchema");

require("dotenv").config();

const MONGODB_URI = process.env.MONGODB_URI;

console.log("connecting to", MONGODB_URI);

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.log("error connecting to MongoDB:", error.message);
  });
// let authors = [
//   {
//     name: "Robert Martin",
//     id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
//     born: 1952,
//   },
//   {
//     name: "Martin Fowler",
//     id: "afa5b6f0-344d-11e9-a414-719c6709cf3e",
//     born: 1963,
//   },
//   {
//     name: "Fyodor Dostoevsky",
//     id: "afa5b6f1-344d-11e9-a414-719c6709cf3e",
//     born: 1821,
//   },
//   {
//     name: "Joshua Kerievsky", // birthyear not known
//     id: "afa5b6f2-344d-11e9-a414-719c6709cf3e",
//   },
//   {
//     name: "Sandi Metz", // birthyear not known
//     id: "afa5b6f3-344d-11e9-a414-719c6709cf3e",
//   },
// ];

// /*
//  * Suomi:
//  * Saattaisi olla järkevämpää assosioida kirja ja sen tekijä tallettamalla kirjan yhteyteen tekijän nimen sijaan tekijän id
//  * Yksinkertaisuuden vuoksi tallennamme kuitenkin kirjan yhteyteen tekijän nimen
//  */

// let books = [
//   {
//     title: "Clean Code",
//     published: 2008,
//     author: "Robert Martin",
//     id: "afa5b6f4-344d-11e9-a414-719c6709cf3e",
//     genres: ["refactoring"],
//   },
//   {
//     title: "Agile software development",
//     published: 2002,
//     author: "Robert Martin",
//     id: "afa5b6f5-344d-11e9-a414-719c6709cf3e",
//     genres: ["agile", "patterns", "design"],
//   },
//   {
//     title: "Refactoring, edition 2",
//     published: 2018,
//     author: "Martin Fowler",
//     id: "afa5de00-344d-11e9-a414-719c6709cf3e",
//     genres: ["refactoring"],
//   },
//   {
//     title: "Refactoring to patterns",
//     published: 2008,
//     author: "Joshua Kerievsky",
//     id: "afa5de01-344d-11e9-a414-719c6709cf3e",
//     genres: ["refactoring", "patterns"],
//   },
//   {
//     title: "Practical Object-Oriented Design, An Agile Primer Using Ruby",
//     published: 2012,
//     author: "Sandi Metz",
//     id: "afa5de02-344d-11e9-a414-719c6709cf3e",
//     genres: ["refactoring", "design"],
//   },
//   {
//     title: "Crime and punishment",
//     published: 1866,
//     author: "Fyodor Dostoevsky",
//     id: "afa5de03-344d-11e9-a414-719c6709cf3e",
//     genres: ["classic", "crime"],
//   },
//   {
//     title: "The Demon ",
//     published: 1872,
//     author: "Fyodor Dostoevsky",
//     id: "afa5de04-344d-11e9-a414-719c6709cf3e",
//     genres: ["classic", "revolution"],
//   },
// ];
const typeDefs = `
  type Mutation {
    addBook(
      title: String!
      author: String!
      published: Int!
      genres: [String!]
    ): Book
    editAuthor(
      name: String!
      setBornTo: Int!
    ) : Author
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book]
    allAuthors: [AuthorWCount]
  }

  type AuthorWCount {
    name: String!
    id: ID!
    born: Int
    bookCount: Int!
  }

  type Book {
    title: String!
    published: Int!
    author: Author!
    genres: [String!]
    id: ID!
  }

  type Author {
    name: String!
    id: ID!
    born: Int
  }
`;
const resolvers = {
  Query: {
    bookCount: () => {
      return books.length;
    },

    authorCount: () => {
      return authors.length;
    },

    allBooks: (root, args) => {
      console.log("Fetching books...");
      let toReturn = books;
      if (args.genre) {
        console.log("On genre");
        toReturn = toReturn.filter((b) => b.genres.includes(args.genre));
      }
      if (args.author) {
        console.log("On Authori");
        toReturn = toReturn.filter((b) => b.author === args.author);
      }
      return toReturn;
    },

    allAuthors: () => {
      console.log("Fetching all authors...");
      const authorWithBookCount = authors.map((a) => ({
        name: a.name,
        id: a.id,
        born: a.born,
        bookCount: books.filter((b) => b.author === a.name).length,
      }));
      return authorWithBookCount;
    },
  },
  Mutation: {
    addBook: (root, args) => {
      const book = { ...args, id: uuid() };
      console.log("Adding new book...", book);
      books = books.concat(book);
      if (!authors.includes(args.author)) {
        const author = {
          name: args.author,
          id: uuid(),
        };
        authors = authors.concat(author);
      }
      return book;
    },
    editAuthor: (root, args) => {
      const author = authors.find((p) => p.name === args.name);
      if (author) {
        console.log("Author ennen muutosta");
        console.log(author);
        id = author.id;
        author.born = args.setBornTo;
        console.log("Author muutoksen jälkeen");
        console.log(author);
        authors = authors.map((auth) => (auth.id !== id ? auth : author));
        return author;
      }
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

startStandaloneServer(server, {
  listen: { port: 4000 },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
