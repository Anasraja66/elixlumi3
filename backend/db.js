import mysql from 'mysql2/promise';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, 'database.sqlite');

// Determine if we should use MySQL
const useMySQL = !!(process.env.DB_HOST || process.env.DB_USER);

console.log("🗄️ Database Debug Info:");
console.log("📂 Storage Mode:", useMySQL ? "MySQL" : "SQLite");
if (useMySQL) {
    console.log("📂 DB Host:", process.env.DB_HOST || 'localhost');
    console.log("📂 DB Name:", process.env.DB_NAME || 'u842406445_elixlumi');
} else {
    console.log("📂 DB Path:", dbPath);
}

let mysqlPool;
let sqliteDb;

const getMySQLPool = () => {
    if (!mysqlPool) {
        mysqlPool = mysql.createPool({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'u842406445_elixlumi_user',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'u842406445_elixlumi',
            port: parseInt(process.env.DB_PORT || '3306'),
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            charset: 'utf8mb4'
        });
    }
    return mysqlPool;
};

const getSQLiteDb = async () => {
    if (!sqliteDb) {
        // Dynamically import sqlite3 ONLY when needed to avoid compilation/runtime crashes on Hostinger production
        const sqlite3Module = await import('sqlite3');
        const sqlite3 = sqlite3Module.default;
        sqliteDb = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error("❌ Failed to connect to SQLite database:", err.message);
            } else {
                console.log("✅ Connected to local SQLite database at:", dbPath);
            }
        });
    }
    return sqliteDb;
};

// Initialize tables
const initDb = async () => {
    if (useMySQL) {
        const connection = await getMySQLPool().getConnection();
        try {
            await connection.execute(`CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) UNIQUE,
                password TEXT,
                role VARCHAR(50) DEFAULT 'admin',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);

            await connection.execute(`CREATE TABLE IF NOT EXISTS products (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                subtitle TEXT,
                description TEXT,
                price DECIMAL(10,2) NOT NULL,
                original_price DECIMAL(10,2),
                discount_label VARCHAR(100),
                size VARCHAR(50) DEFAULT '100ml',
                image_url TEXT,
                images TEXT,
                video_url TEXT,
                notes_top TEXT,
                notes_heart TEXT,
                notes_base TEXT,
                longevity VARCHAR(100),
                sillage VARCHAR(100),
                season VARCHAR(100),
                occasion VARCHAR(100),
                long_description TEXT,
                available TINYINT(1) DEFAULT 1,
                sort_order INT DEFAULT 0,
                is_featured TINYINT(1) DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);

            await connection.execute(`CREATE TABLE IF NOT EXISTS orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_number VARCHAR(100) UNIQUE,
                customer_name VARCHAR(255),
                customer_email VARCHAR(255),
                customer_phone VARCHAR(50),
                customer_city VARCHAR(100),
                customer_address TEXT,
                products TEXT,
                total_amount DECIMAL(10,2),
                status VARCHAR(50) DEFAULT 'pending',
                notes TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);

            console.log('✅ MySQL tables initialized successfully');
        } catch (err) {
            console.error('❌ Failed to initialize MySQL tables:', err.message);
            throw err;
        } finally {
            connection.release();
        }
    } else {
        const db = await getSQLiteDb();
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.run(`CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    email TEXT UNIQUE,
                    password TEXT,
                    role TEXT DEFAULT 'admin',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )`);

                db.run(`CREATE TABLE IF NOT EXISTS products (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    subtitle TEXT,
                    description TEXT,
                    price REAL NOT NULL,
                    original_price REAL,
                    discount_label TEXT,
                    size TEXT DEFAULT '100ml',
                    image_url TEXT,
                    images TEXT,
                    video_url TEXT,
                    notes_top TEXT,
                    notes_heart TEXT,
                    notes_base TEXT,
                    longevity TEXT,
                    sillage TEXT,
                    season TEXT,
                    occasion TEXT,
                    long_description TEXT,
                    available INTEGER DEFAULT 1,
                    sort_order INTEGER DEFAULT 0,
                    is_featured INTEGER DEFAULT 0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )`);

                db.run(`CREATE TABLE IF NOT EXISTS orders (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    order_number TEXT UNIQUE,
                    customer_name TEXT,
                    customer_email TEXT,
                    customer_phone TEXT,
                    customer_city TEXT,
                    customer_address TEXT,
                    products TEXT,
                    total_amount REAL,
                    status TEXT DEFAULT 'pending',
                    notes TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )`, (err) => {
                    if (err) {
                        console.error('❌ Failed to initialize SQLite tables:', err.message);
                        reject(err);
                    } else {
                        console.log('✅ SQLite tables initialized successfully');
                        resolve();
                    }
                });
            });
        });
    }
};

const run = async (sql, params = []) => {
    if (useMySQL) {
        const [result] = await getMySQLPool().execute(sql, params);
        return { id: result.insertId, changes: result.affectedRows };
    } else {
        const db = await getSQLiteDb();
        return new Promise((resolve, reject) => {
            db.run(sql, params, function (err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, changes: this.changes });
            });
        });
    }
};

const all = async (sql, params = []) => {
    if (useMySQL) {
        const [rows] = await getMySQLPool().execute(sql, params);
        return rows;
    } else {
        const db = await getSQLiteDb();
        return new Promise((resolve, reject) => {
            db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }
};

const get = async (sql, params = []) => {
    if (useMySQL) {
        const [rows] = await getMySQLPool().execute(sql, params);
        return rows[0] || null;
    } else {
        const db = await getSQLiteDb();
        return new Promise((resolve, reject) => {
            db.get(sql, params, (err, row) => {
                if (err) reject(err);
                else resolve(row || null);
            });
        });
    }
};

// Initialize DB on startup
initDb().catch(err => {
    console.error('❌ Database initialization failed:', err.message);
});

export default { run, all, get, initDb };
