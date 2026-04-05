const path = require("path");
const mongoose = require("mongoose");

require("dotenv").config({
  path: path.resolve(__dirname, "../../.env"),
});

const Author = require("../../src/models/Author");
const Genre = require("../../src/models/Genre");
const Book = require("../../src/models/Book");

const CODE_WIDTH = 3;

const normalizeList = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const nextCode = (prefix, usedCodes) => {
  let maxOrder = 0;

  for (const code of usedCodes) {
    const normalized = String(code || "")
      .trim()
      .toUpperCase();
    const regex = new RegExp(`^${prefix}\\d+$`, "i");
    if (!regex.test(normalized)) continue;

    const order = Number.parseInt(
      normalized.replace(new RegExp(`^${prefix}`, "i"), ""),
      10,
    );
    if (!Number.isNaN(order)) {
      maxOrder = Math.max(maxOrder, order);
    }
  }

  let candidate = maxOrder + 1;
  while (
    usedCodes.has(`${prefix}${String(candidate).padStart(CODE_WIDTH, "0")}`)
  ) {
    candidate += 1;
  }

  return `${prefix}${String(candidate).padStart(CODE_WIDTH, "0")}`;
};

const normalizeKey = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

async function fillMissingCodes() {
  const authors = await Author.find({}).sort({ created_at: 1, _id: 1 });
  const authorCodeSet = new Set(
    authors
      .map((item) =>
        String(item.MATG || "")
          .trim()
          .toUpperCase(),
      )
      .filter(Boolean),
  );

  let filledAuthors = 0;
  for (const author of authors) {
    const current = String(author.MATG || "")
      .trim()
      .toUpperCase();
    if (current) continue;

    const generated = nextCode("TG", authorCodeSet);
    author.MATG = generated;
    await author.save();
    authorCodeSet.add(generated);
    filledAuthors += 1;
  }

  const genres = await Genre.find({}).sort({ created_at: 1, _id: 1 });
  const genreCodeSet = new Set(
    genres
      .map((item) =>
        String(item.MATL || "")
          .trim()
          .toUpperCase(),
      )
      .filter(Boolean),
  );

  let filledGenres = 0;
  for (const genre of genres) {
    const current = String(genre.MATL || "")
      .trim()
      .toUpperCase();
    if (current) continue;

    const generated = nextCode("TL", genreCodeSet);
    genre.MATL = generated;
    await genre.save();
    genreCodeSet.add(generated);
    filledGenres += 1;
  }

  return {
    filledAuthors,
    filledGenres,
  };
}

async function migrateBookReferences() {
  const authors = await Author.find({}).select("MATG Hoten").lean();
  const genres = await Genre.find({}).select("MATL name").lean();

  const authorByCode = new Map();
  const authorByName = new Map();
  const usedAuthorCodes = new Set();

  for (const author of authors) {
    const code = String(author.MATG || "")
      .trim()
      .toUpperCase();
    if (!code) continue;

    authorByCode.set(code, code);
    usedAuthorCodes.add(code);

    const nameKey = normalizeKey(author.Hoten);
    if (nameKey && !authorByName.has(nameKey)) {
      authorByName.set(nameKey, code);
    }
  }

  const genreByCode = new Map();
  const genreByName = new Map();
  const usedGenreCodes = new Set();

  for (const genre of genres) {
    const code = String(genre.MATL || "")
      .trim()
      .toUpperCase();
    if (!code) continue;

    genreByCode.set(code, code);
    usedGenreCodes.add(code);

    const nameKey = normalizeKey(genre.name);
    if (nameKey && !genreByName.has(nameKey)) {
      genreByName.set(nameKey, code);
    }
  }

  const books = await Book.find({}).select("_id TACGIA THELOAI");

  let migratedBooks = 0;
  let createdAuthors = 0;
  let createdGenres = 0;

  for (const book of books) {
    const sourceAuthors = normalizeList(book.TACGIA);
    const sourceGenres = normalizeList(book.THELOAI);

    const targetAuthors = [];
    for (const value of sourceAuthors) {
      const asCode = String(value || "")
        .trim()
        .toUpperCase();
      if (authorByCode.has(asCode)) {
        targetAuthors.push(asCode);
        continue;
      }

      const byName = authorByName.get(normalizeKey(value));
      if (byName) {
        targetAuthors.push(byName);
        continue;
      }

      const generated = nextCode("TG", usedAuthorCodes);
      const created = await Author.create({
        MATG: generated,
        Hoten: String(value || "").trim(),
      });

      usedAuthorCodes.add(generated);
      authorByCode.set(generated, generated);
      authorByName.set(normalizeKey(created.Hoten), generated);
      targetAuthors.push(generated);
      createdAuthors += 1;
    }

    const targetGenres = [];
    for (const value of sourceGenres) {
      const asCode = String(value || "")
        .trim()
        .toUpperCase();
      if (genreByCode.has(asCode)) {
        targetGenres.push(asCode);
        continue;
      }

      const byName = genreByName.get(normalizeKey(value));
      if (byName) {
        targetGenres.push(byName);
        continue;
      }

      const generated = nextCode("TL", usedGenreCodes);
      const created = await Genre.create({
        MATL: generated,
        name: String(value || "").trim(),
      });

      usedGenreCodes.add(generated);
      genreByCode.set(generated, generated);
      genreByName.set(normalizeKey(created.name), generated);
      targetGenres.push(generated);
      createdGenres += 1;
    }

    const dedupAuthors = [...new Set(targetAuthors)];
    const dedupGenres = [...new Set(targetGenres)];

    const changedAuthors =
      JSON.stringify(dedupAuthors) !== JSON.stringify(sourceAuthors);
    const changedGenres =
      JSON.stringify(dedupGenres) !== JSON.stringify(sourceGenres);

    if (!changedAuthors && !changedGenres) {
      continue;
    }

    await Book.updateOne(
      { _id: book._id },
      {
        $set: {
          TACGIA: dedupAuthors,
          THELOAI: dedupGenres,
        },
      },
    );

    migratedBooks += 1;
  }

  return {
    migratedBooks,
    createdAuthors,
    createdGenres,
  };
}

async function run() {
  if (!process.env.MONGO_URI) {
    throw new Error("Missing MONGO_URI in .env file");
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected");

  const fillStats = await fillMissingCodes();
  const migrateStats = await migrateBookReferences();

  console.log("Done migration", {
    ...fillStats,
    ...migrateStats,
  });
}

run()
  .catch((error) => {
    console.error("Migration failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  });
