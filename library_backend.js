const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const { v1: uuid, v1 } = require("uuid");
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const Book = require("./src/models/bookSchema");
const Author = require("./src/models/AuthorSchema");
const User = require("./src/models/UserSchema");
const { GraphQLError } = require("graphql");
const jwt = require("jsonwebtoken");

//Toimiva vaihe

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
    createUser(
      username: String!
      favoriteGenre: String!
    ): User
    login(
      username: String!
      password: String!
    ): Token
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book]
    allAuthors: [AuthorWCount]
    me: User
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

  type User {
  username: String!
  favoriteGenre: String!
  id: ID!
  }

  type Token {
  value: String!
  }
`;

const getAllAuthors = async () => {
  // Tämä metodi palauttaa tututusti kaikki esiintymät kun ei määritellä mitä etsitään tuolla .find
  const authors = await Author.find({});
  return authors;
};
const getAllBooks = async () => {
  // sama homma kun yllä
  const books = await Book.find({});
  return books;
};

const resolvers = {
  // Resolverit, eli nämä käsittelevät nimensä mukaiset pyynnöt
  Query: {
    me: (root, args, context) => {
      return context.currentUser;
    },

    bookCount: async () => {
      return Book.collection.countDocuments(); // Tuota tällä olisi voinut tehdä vissiin sen kirjojen laskemisen authorille, mutta toteutettu eritavalla myöhemmin...
    },

    authorCount: async () => {
      return Author.collection.countDocuments();
    },

    allBooks: async (root, args) => {
      // Haetaan kirjat
      console.log("Fetching books...");
      let toReturn = await getAllBooks();
      if (args.genre) {
        console.log("On genre");
        toReturn = toReturn.filter((b) => b.genres.includes(args.genre)); // Genren mukaan
      }
      if (args.author) {
        console.log("On Authori");
        toReturn = toReturn.filter((b) => b.author === args.author); // Authorin mukaan
      }
      return toReturn;
    },

    allAuthors: async () => {
      // Haetaan kaikki Autrhorint getAll metodilla ja heidän julkaisujen määrät vertailemalla nimeä julkaisijan nimeen ja ottamalla pituus tuloksista.
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

    me: async () => {
      console.log("Fetching me...");
    },
  },
  Mutation: {
    addBook: async (root, args, context) => {
      // Lisätään kirja
      const currentUser = context.currentUser;

      if (!currentUser) {
        console.log("Väärä token/ ei autentikoitu");
        throw new GraphQLError(
          "not authenticated. Please log in to perform this action.",
          {
            extensions: {
              type: "BAD_USER_INPUT",
            },
          }
        );
      }

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

    editAuthor: async (root, args, context) => {
      // Muokataan kirjailijaa
      const currentUser = context.currentUser;

      if (!currentUser) {
        console.log("Väärä token/ ei autentikoitu");
        throw new GraphQLError("not authenticated", {
          extensions: {
            type: "BAD_USER_INPUT",
          },
        });
      }
      /* TÄÄ TARKISTUS TURHA??
      if (!currentUser.username === args.name) {
        console.log("Väärä henkilö");
        throw new GraphQLError("This is not you", {
          extensions: {
            type: "BAD_USER_INPUT",
          },
        });
      }
      */
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

    createUser: async (root, args) => {
      const user = new User({
        username: args.username,
        favoriteGenre: args.favoriteGenre,
      }); // Tehdään uusi käyttäjä User-scheeman mukaan. Nyt puuttuu salasanahomma tästä niinkuin sai.

      return user.save().catch((error) => {
        throw new GraphQLError("Creating the user has failed", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args.name,
            error,
          },
        });
      });
    },

    login: async (root, args) => {
      //Login kysely. saa args username ja password
      const user = await User.findOne({ username: args.username });

      if (!user || args.password !== "salasana") {
        // Tässä kovakoodattu 'salasana' Jos ei löydy käyttäjää tai salasana on väärä niin..
        throw new GraphQLError("wrong credentials", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }
      const userForToken = {
        username: user.username,
        id: user._id,
      };
      return { value: jwt.sign(userForToken, process.env.JWT_SECRET) };
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

startStandaloneServer(server, {
  listen: { port: 4000 },
  context: async ({ req, res }) => {
    const auth = req ? req.headers.authorization : null;
    if (auth && auth.startsWith("Bearer ")) {
      const decodedToken = jwt.verify(
        auth.substring(7),
        process.env.JWT_SECRET
      );
      const currentUser = await User.findById(decodedToken.id);
      return { currentUser };
    }
  },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
