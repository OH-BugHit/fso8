const Book = require("./models/bookSchema");
const Author = require("./models/AuthorSchema");
const User = require("./models/UserSchema");
const { PubSub } = require("graphql-subscriptions");
const pubsub = new PubSub();
const jwt = require("jsonwebtoken");

const getAllAuthors = async () => {
  // Tämä metodi palauttaa tututusti kaikki esiintymät kun ei määritellä mitä etsitään tuolla .find
  console.log("haetaan kaikki authorit tietokannasta");
  const authors = await Author.find({});
  return authors;
};
const getAllBooks = async () => {
  // sama homma kun yllä
  console.log("haetaan kaikki kirjat tietokannasta");
  const books = await Book.find({});
  return books;
};

// Yllä olleet oli kans erikseen aiemmin
const resolvers = {
  // Resolverit, eli nämä käsittelevät nimensä mukaiset pyynnöt
  Query: {
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
        console.log("Haetaan genren mukaan...");
        toReturn = toReturn.filter((b) => b.genres.includes(args.genre)); // Genren mukaan
      }
      if (args.author) {
        console.log("Haetaan authorin mukaan...");
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

    me: async (root, args, context) => {
      console.log("Fetching me...");
      return context.currentUser;
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
      pubsub.publish("BOOK_ADDED", { bookAdded: book }); // Tekee julkaisun uudelle kirjalle kaikille jotka tilanneet
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
  Subscription: {
    // Resolveri tilaukselle
    bookAdded: {
      subscribe: () => pubsub.asyncIterator("BOOK_ADDED"),
    },
  },
};

module.exports = resolvers;
