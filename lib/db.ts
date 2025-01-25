import { Pool } from 'pg';

// Create a new pool with the database connection details
const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Helper function to query the database
export const query = async (text: string, params: any[]) => {
  try {
    const res = await pool.query(text, params);
    return res;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

// Export pool for other database-related operations if needed
export default pool;