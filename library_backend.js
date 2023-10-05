const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const { v1: uuid, v1 } = require("uuid");
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const Book = require("./src/models/bookSchema");
const Author = require("./src/models/AuthorSchema");
const { GraphQLError } = require("graphql");

//Toimiva vaihe. Ei talleta tosin vielä bookiin Author ia eli siinä menossa.

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
    author: String!
    genres: [String!]
    id: ID!
  }

  type Author {
    name: String!
    id: ID!
    born: Int
  }
`;

const getAllAuthors = async () => {
  const authors = await Author.find({});
  return authors;
};
const getAllBooks = async () => {
  const books = await Book.find({});
  return books;
};

const resolvers = {
  Query: {
    bookCount: async () => {
      return Book.collection.countDocuments();
    },

    authorCount: async () => {
      return Author.collection.countDocuments();
    },

    allBooks: async (root, args) => {
      console.log("Fetching books...");
      let toReturn = await getAllBooks();
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

    allAuthors: async () => {
      console.log("Fetching all authors...");
      const authorList = await getAllAuthors();
      const bookList = await getAllBooks();
      const authorWithBookCount = authorList.map((a) => ({
        name: a.name,
        id: a.id,
        born: a.born,
        bookCount: bookList.filter((b) => b.author === a.name).length,
      }));
      authorWithBookCount;

      return authorWithBookCount;
    },
  },
  Mutation: {
    addBook: async (root, args) => {
      let authorList = await getAllAuthors();
      authorList = authorList.map((e) => (e = e.name));
      if (!authorList.includes(args.author)) {
        console.log("Author is new author. Adding new author...");
        const author = new Author({
          name: args.author,
        });
        try {
          await author.save();
        } catch (e) {
          console.log("addBook catch tehty");
          throw new GraphQLError("Adding book failed", {
            extensions: {
              code: "BAD_USER_INPUT",
              invalidArgs: args.name,
              e,
            },
          });
        }
      }
      const book = new Book({ ...args, author: args.author });
      console.log("Adding new book...", book);
      try {
        await book.save();
      } catch (e) {
        console.log("addBook catch tehty bookissa");
        throw new GraphQLError("Adding book failed", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args.name,
            e,
          },
        });
      }

      return book;
    },

    editAuthor: async (root, args) => {
      let authorList = await getAllAuthors();
      const author = authorList.find((p) => p.name === args.name);
      if (author) {
        console.log("Author ennen muutosta");
        console.log(author);
        id = author.id;
        author.born = args.setBornTo;
        console.log("Author muutoksen jälkeen");
        console.log(author);
        authorList = authorList.map((auth) => (auth.id !== id ? auth : author));
        try {
          await author.save();
        } catch (e) {
          console.log("editAuth catch tehty");
          throw new GraphQLError("Editing author failed", {
            extensions: {
              code: "BAD_USER_INPUT",
              invalidArgs: args.name,
              e,
            },
          });
        }
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
