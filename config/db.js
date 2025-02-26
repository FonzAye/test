const { Pool } = require('pg');

// Configure AWS SDK
const { SecretsManagerClient, GetSecretValueCommand } = require("@aws-sdk/client-secrets-manager");

const secret_name = "test";

const client = new SecretsManagerClient({
  region: "eu-central-1",
});

const fetchSecret = async () => {
  try {
    const response = await client.send(
      new GetSecretValueCommand({
        SecretId: secret_name,
        VersionStage: "AWSCURRENT", // VersionStage defaults to AWSCURRENT if unspecified
      })
    );

    return response.SecretString;
  } catch (error) {
    console.error("Error fetching secret:", error);
    throw error; // Re-throw the error if needed
  }
};

async function initializeDb() {
  const dbConfig = await fetchSecret();

  const pool = new Pool({
    user: dbConfig.DB_USER,
    host: dbConfig.DB_HOST,
    database: dbConfig.DB_NAME,
    password: dbConfig.DB_PASS,
    port: dbConfig.DB_PORT,
    ssl: { rejectUnauthorized: false },
  });

  console.log(dbConfig);
  return pool;
}

// Function to create tables if they don't exist
const createTables = async (pool) => {
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS Users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) NOT NULL,
      email VARCHAR(100) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL
    );
  `;

  const createExpensesTable = `
    CREATE TABLE IF NOT EXISTS Expenses (
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES Users(id) ON DELETE CASCADE,
      amount DECIMAL(10, 2) NOT NULL,
      category VARCHAR(50) NOT NULL,
      date DATE NOT NULL,
      description TEXT
    );
  `;

  try {
    await pool.query(createUsersTable);
    await pool.query(createExpensesTable);
    console.log("Tables created successfully (if they did not exist).");
  } catch (err) {
    console.error("Error creating tables:", err);
  }
};

// Function to add a new user
const addUser = async (pool, username, email, passwordHash) => {
  const insertUserQuery = `
    INSERT INTO Users (username, email, password_hash)
    VALUES ($1, $2, $3) RETURNING *;
  `;

  try {
    const res = await pool.query(insertUserQuery, [username, email, passwordHash]);
    console.log("User added:", res.rows[0]);
    return res.rows[0]; // Return the newly created user
  } catch (err) {
    console.error("Error adding user:", err);
  }
};

// Function to add an expense for a user
const addExpense = async (pool, userId, amount, category, date, description) => {
  const insertExpenseQuery = `
    INSERT INTO Expenses (user_id, amount, category, date, description)
    VALUES ($1, $2, $3, $4, $5) RETURNING *;
  `;

  try {
    const res = await pool.query(insertExpenseQuery, [userId, amount, category, date, description]);
    console.log("Expense added:", res.rows[0]);
    return res.rows[0]; // Return the newly created expense
  } catch (err) {
    console.error("Error adding expense:", err);
  }
};

// Initialize DB and run setup
(async () => {
  const pool = await initializeDb();

  try {
    // Check connection
    const res = await pool.query('SELECT NOW()');
    console.log("Database connected successfully at:", res.rows[0].now);

    // Create tables
    await createTables(pool);

    // Example usage (for testing)
    const newUser = await addUser(pool, "john_doe", "john@example.com", "hashedpassword123");
    if (newUser) {
      await addExpense(pool, newUser.id, 100.50, "Food", "2025-02-20", "Dinner at a restaurant");
    }
  } catch (err) {
    console.error("Error during database initialization:", err);
  }
})();

module.exports = { initializeDb, addUser, addExpense };