import mysql from "mysql2/promise";
import { unstable_noStore as noStore } from "next/cache";

// connect to the database
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_SCHEMA,
  waitForConnections: true,
});

const fetchFilms = async () => {
  // Add noStore() here to prevent the response from being cached.
  // This is equivalent to in fetch(..., {cache: 'no-store'}).
  noStore();
  try {
    const db = await pool.getConnection();
    const query = "select * from films";
    const [rows] = await db.execute(query);
    db.release();
    return rows;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch data.");
  }
};

const fetchLatestFilms = async () => {
  try {
    const db = await pool.getConnection();
    const query = "SELECT * FROM films ORDER BY film_release_date DESC LIMIT 6";
    const [rows] = await db.execute(query);
    db.release();
    return rows;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch latest data.");
  }
};

const fetchFilm = async (film_id) => {
  // Prevent the response from being cached.
  noStore();
  let db;
  try {
    // Fetch the film data by film_id
    db = await pool.getConnection();
    const query = `SELECT * FROM films WHERE film_id = ?`;
    const [rows] = await db.execute(query, [film_id]);
    if (rows.length === 0) {
      throw new Error("Film not found");
    }
    return rows[0]; // Return the first (and only) result
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch film data.");
  } finally {
    if (db) {
      db.release(); // Ensure the connection is released
    }
  }
};

const searchFilms = async (searchTerm) => {
  noStore();
  let db;
  try {
    const searchPattern = `%${searchTerm}%`;
    db = await pool.getConnection();
    const query = `
      SELECT * FROM films
      WHERE film_title LIKE ?
         OR film_certificate LIKE ?
         OR film_description LIKE ?
      ORDER BY film_release_date DESC
    `;
    const [rows] = await db.execute(query, [
      searchPattern,
      searchPattern,
      searchPattern,
    ]);

    return rows; // ✅ Can safely be an empty array
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch film data."); // only real DB errors
  } finally {
    if (db) {
      db.release();
    }
  }
};

const randomFilm = async () => {
  try {
    // const data = await sql`SELECT * FROM films ORDER BY RANDOM() LIMIT 1`;
    const db = await pool.getConnection();
    const query = "SELECT * FROM films ORDER BY RAND() LIMIT 1";
    const [rows] = await db.execute(query);
    return rows[0];
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch random films.");
  }
};

export { fetchFilms, fetchLatestFilms, fetchFilm, searchFilms, randomFilm };
