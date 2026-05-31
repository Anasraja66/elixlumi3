import mysql from 'mysql2/promise';

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'u842406445_elixlumi_user',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'u842406445_elixlumi',
    port: parseInt(process.env.DB_PORT || '3306'),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4'
};

console.log("🗄️ Database Debug Info:");
console.log("📂 DB Host:", dbConfig.host);
console.log("📂 DB Name:", dbConfig.database);
console.log("📂 DB User:", dbConfig.user);

let pool;

const getPool = () => {
    if (!pool) {
        pool = mysql.createPool(dbConfig);
    }
    return pool;
};

// Initialize tables
const initDb = async () => {
    const connection = await getPool().getConnection();
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
        console.error('❌ Failed to initialize tables:', err.message);
        throw err;
    } finally {
        connection.release();
    }
};

const run = async (sql, params = []) => {
    const [result] = await getPool().execute(sql, params);
    return { id: result.insertId, changes: result.affectedRows };
};

const all = async (sql, params = []) => {
    const [rows] = await getPool().execute(sql, params);
    return rows;
};

const get = async (sql, params = []) => {
    const [rows] = await getPool().execute(sql, params);
    return rows[0] || null;
};

// Initialize DB on startup
initDb().catch(err => {
    console.error('❌ Database initialization failed:', err.message);
});

export default { run, all, get, initDb };
