import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import db from "./db.js";
import fs from "node:fs";
import nodemailer from "nodemailer";

const app = express();
const port = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "elixlumi_secret_2026_xyz";
const ADMIN_SECRET = process.env.ADMIN_CREATION_SECRET || "ElixLumi2026Admin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const distDir = path.resolve(rootDir, "dist");

// Resolve uploads directory: serve from public_html/uploads on Hostinger/Linux for direct web server serving, and fallback to root uploads locally on Windows
const publicHtmlUploadsDir = path.resolve(rootDir, "public_html", "uploads");
const defaultUploadsDir = path.resolve(rootDir, "uploads");
const uploadsDir = process.platform === 'win32' ? defaultUploadsDir : publicHtmlUploadsDir;

console.log("------------------------------------------");
console.log("🚀 Server Initialization Debug Info:");
console.log("📂 __dirname:", __dirname);
console.log("📂 rootDir:", rootDir);
console.log("📂 distDir:", distDir);
console.log("📂 uploadsDir:", uploadsDir);
console.log("📝 index.html Path:", path.join(distDir, "index.html"));
console.log("📦 env.PORT:", process.env.PORT);
console.log("------------------------------------------");

// Ensure uploads directory exists with correct permissions
if (!fs.existsSync(uploadsDir)) {
    console.log("⚠️ Creating uploads directory at:", uploadsDir);
    fs.mkdirSync(uploadsDir, { recursive: true });
} else {
    console.log("✅ Uploads directory exists at:", uploadsDir);
}

// Migrate files from defaultUploadsDir to publicHtmlUploadsDir if needed (for Hostinger production backward compatibility)
if (uploadsDir === publicHtmlUploadsDir && fs.existsSync(defaultUploadsDir)) {
    try {
        const files = fs.readdirSync(defaultUploadsDir);
        if (files.length > 0) {
            console.log(`📂 Found ${files.length} files in old root uploads directory. Migrating to public_html/uploads...`);
            for (const file of files) {
                const oldPath = path.join(defaultUploadsDir, file);
                const newPath = path.join(publicHtmlUploadsDir, file);
                if (fs.statSync(oldPath).isFile()) {
                    fs.copyFileSync(oldPath, newPath);
                    console.log(`Migrated: ${file}`);
                }
            }
            console.log("✅ Uploads directory migration completed successfully!");
        }
    } catch (migrationErr) {
        console.error("❌ Error migrating uploaded files:", migrationErr.message);
    }
}

// Create default admin if not exists
(async () => {
    try {
        const user = await db.get("SELECT * FROM users LIMIT 1");
        if (!user) {
            const hashedPassword = await bcrypt.hash("admin123", 10);
            await db.run("INSERT INTO users (email, password) VALUES (?, ?)", ["admin@elixlumi.com", hashedPassword]);
            console.log("✅ Default admin created: admin@elixlumi.com / admin123");
        } else {
            console.log("ℹ️ Admin user already exists.");
        }
    } catch (err) {
        console.error("❌ Failed to check/create default admin:", err);
    }
})();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use("/uploads", express.static(publicHtmlUploadsDir));
app.use("/uploads", express.static(defaultUploadsDir));

// Multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ 
    storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
        console.warn("⚠️ Access denied: No token provided");
        return res.status(401).json({ error: "Access denied" });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        console.error("❌ Token verification failed:", err.message);
        res.status(401).json({ error: "Invalid token" });
    }
};

// Test route to verify connectivity
app.get("/api/test", (req, res) => {
    res.json({ success: true, message: "Backend is working!", port: port, time: new Date().toISOString() });
});

// Diagnostic route to list uploaded files
app.get("/api/debug-files", (req, res) => {
    try {
        const files = fs.existsSync(uploadsDir) ? fs.readdirSync(uploadsDir) : [];
        const oldFiles = fs.existsSync(defaultUploadsDir) ? fs.readdirSync(defaultUploadsDir) : [];
        res.json({
            success: true,
            uploadsDir,
            uploadsDirExists: fs.existsSync(uploadsDir),
            defaultUploadsDir,
            defaultUploadsDirExists: fs.existsSync(defaultUploadsDir),
            files,
            oldFiles,
            platform: process.platform,
            time: new Date().toISOString()
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Database diagnostic route
app.get("/api/db-test", async (req, res) => {
    try {
        const result = await db.all("SELECT 1 as val");
        res.json({ success: true, message: "Database is working!", data: result });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message, stack: err.stack });
    }
});

// --- AUTH API ---
app.post("/api/admin/signup", async (req, res) => {
    const { email, password, adminSecret } = req.body;
    if (adminSecret !== ADMIN_SECRET) return res.status(403).json({ error: "Invalid admin secret" });
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.run("INSERT INTO users (email, password) VALUES (?, ?)", [email, hashedPassword]);
        res.status(201).json({ success: true, message: "Admin created" });
    } catch (err) {
        res.status(500).json({ error: "Email already exists or database error" });
    }
});

app.post("/api/admin/login", async (req, res) => {
    const { email, password } = req.body;
    
    // Defensive hardcoded fallback login to bypass database issues and simplify login
    if (email === "admin@elixlumi.com" && password === "admin123") {
        console.log("✅ Super Admin logged in using hardcoded credentials!");
        const token = jwt.sign({ id: 1, email: "admin@elixlumi.com" }, JWT_SECRET, { expiresIn: "24h" });
        return res.json({ success: true, token, user: { email: "admin@elixlumi.com" } });
    }
    
    try {
        const user = await db.get("SELECT * FROM users WHERE email = ?", [email]);
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "24h" });
        res.json({ success: true, token, user: { email: user.email } });
    } catch (err) {
        res.status(500).json({ error: "Login failed" });
    }
});

app.post("/api/admin/change-password", verifyToken, async (req, res) => {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
    }
    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db.run("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, req.user.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/api/admin/upload", (req, res, next) => {
    console.log("📥 Upload attempt received. Headers:", JSON.stringify(req.headers));
    next();
}, verifyToken, upload.single("image"), (req, res) => {
    if (!req.file) {
        console.error("❌ No file received in request after parsing.");
        return res.status(400).json({ error: "No file uploaded" });
    }
    console.log("✅ File uploaded successfully:", req.file.filename);
    res.json({ success: true, url: `/uploads/${req.file.filename}` });
});

// --- PRODUCTS API ---
app.get("/api/products", async (req, res) => {
    try {
        const products = await db.all("SELECT * FROM products ORDER BY sort_order ASC, created_at DESC");
        // Convert paths for frontend
        const mapped = products.map(p => ({
            ...p,
            images: p.images ? JSON.parse(p.images) : [],
            image_url: p.image_url?.startsWith('http') ? p.image_url : `/uploads/${path.basename(p.image_url || '')}`
        }));
        res.json(mapped);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/api/products/:id", async (req, res) => {
    try {
        const product = await db.get("SELECT * FROM products WHERE id = ?", [req.params.id]);
        if (!product) return res.status(404).json({ error: "Not found" });
        product.images = product.images ? JSON.parse(product.images) : [];
        res.json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/api/admin/products", verifyToken, async (req, res) => {
    const p = req.body;
    try {
        const result = await db.run(
            `INSERT INTO products (name, subtitle, description, price, original_price, discount_label, size, image_url, images, video_url, notes_top, notes_heart, notes_base, longevity, sillage, season, occasion, long_description, is_featured) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [p.name, p.subtitle, p.description, p.price, p.original_price, p.discount_label, p.size, p.image_url, JSON.stringify(p.images || []), p.video_url, JSON.stringify(p.notes_top || []), JSON.stringify(p.notes_heart || []), JSON.stringify(p.notes_base || []), p.longevity, p.sillage, p.season, p.occasion, p.long_description, p.is_featured ? 1 : 0]
        );
        res.json({ success: true, id: result.id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put("/api/admin/products/:id", verifyToken, async (req, res) => {
    const p = req.body;
    try {
        await db.run(
            `UPDATE products SET name=?, subtitle=?, description=?, price=?, original_price=?, discount_label=?, size=?, image_url=?, images=?, video_url=?, notes_top=?, notes_heart=?, notes_base=?, longevity=?, sillage=?, season=?, occasion=?, long_description=?, available=?, sort_order=?, is_featured=? WHERE id=?`,
            [p.name, p.subtitle, p.description, p.price, p.original_price, p.discount_label, p.size, p.image_url, JSON.stringify(p.images || []), p.video_url, JSON.stringify(p.notes_top || []), JSON.stringify(p.notes_heart || []), JSON.stringify(p.notes_base || []), p.longevity, p.sillage, p.season, p.occasion, p.long_description, p.available ? 1 : 0, p.sort_order, p.is_featured ? 1 : 0, req.params.id]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete("/api/admin/products/:id", verifyToken, async (req, res) => {
    try {
        await db.run("DELETE FROM products WHERE id = ?", [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});// --- EMAIL NOTIFICATION DISPATCHER ---
async function sendOrderNotificationEmail(order) {
    const recipientEmail = "order@elixlumi.com";
    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.ORDER_EMAIL_FROM || "Elixlumi Orders <onboarding@resend.dev>";
    
    const subject = `Elix Lumi: New ${order.formType === 'inquiry' ? 'Inquiry' : 'Order'} #${order.orderNumber}`;
    
    // Format product details
    const productsHtml = order.product ? `
        <div style="background-color: #1a1a1a; border: 1px solid #c5a880; padding: 15px; margin-top: 15px; border-radius: 4px;">
            <h3 style="color: #c5a880; margin-top: 0; font-family: 'Playfair Display', Georgia, serif; font-size: 18px;">Product Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="color: #888; font-size: 13px; padding: 5px 0;">Fragrance Name</td>
                    <td style="color: #fff; font-size: 14px; font-weight: bold; text-align: right; padding: 5px 0;">${order.product.name}</td>
                </tr>
                <tr>
                    <td style="color: #888; font-size: 13px; padding: 5px 0;">Bottle Size</td>
                    <td style="color: #fff; font-size: 14px; text-align: right; padding: 5px 0;">${order.product.size}</td>
                </tr>
                <tr>
                    <td style="color: #888; font-size: 13px; padding: 5px 0;">Price</td>
                    <td style="color: #fff; font-size: 14px; text-align: right; padding: 5px 0;">${order.product.price}</td>
                </tr>
                ${order.quantity ? `
                <tr>
                    <td style="color: #888; font-size: 13px; padding: 5px 0;">Quantity</td>
                    <td style="color: #fff; font-size: 14px; text-align: right; padding: 5px 0;">${order.quantity}x</td>
                </tr>` : ''}
                ${order.totalAmount ? `
                <tr style="border-top: 1px solid #333;">
                    <td style="color: #c5a880; font-size: 15px; font-weight: bold; padding: 10px 0 0 0;">Total Amount</td>
                    <td style="color: #c5a880; font-size: 18px; font-weight: bold; text-align: right; padding: 10px 0 0 0;">PKR ${order.totalAmount.toLocaleString()}</td>
                </tr>` : ''}
            </table>
        </div>
    ` : '<p style="color: #888;">No product specified</p>';

    // Format click-to-chat WhatsApp link
    // Strip anything except digits from the phone number
    const cleanPhone = order.phone.replace(/[^0-9]/g, "");
    const formattedPhone = cleanPhone.startsWith("0") ? "92" + cleanPhone.slice(1) : cleanPhone;
    const whatsappMsg = encodeURIComponent(`Hi ${order.name}, thank you for contacting Elix Lumi! We received your ${order.formType === 'inquiry' ? 'inquiry' : 'order'} for ${order.product?.name || 'our perfume'}. We'd love to proceed with the confirmation.`);
    const whatsappLink = `https://wa.me/${formattedPhone}?text=${whatsappMsg}`;

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Elix Lumi Notification</title>
    </head>
    <body style="background-color: #0b0b0b; color: #ffffff; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0; padding: 40px 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #111111; border: 1px solid #222222; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.8);">
            <!-- Header -->
            <div style="background-color: #0b0b0b; padding: 30px; text-align: center; border-bottom: 1px solid #222222;">
                <h1 style="color: #ffffff; margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: 28px; letter-spacing: 4px; text-transform: uppercase;">ELIX LUMI</h1>
                <p style="color: #c5a880; margin: 5px 0 0 0; font-size: 11px; letter-spacing: 2px; text-transform: uppercase;">Luxury Perfumes</p>
            </div>
            
            <!-- Body -->
            <div style="padding: 30px 40px;">
                <h2 style="color: #c5a880; font-family: 'Playfair Display', Georgia, serif; font-size: 20px; font-weight: normal; margin-top: 0; border-bottom: 1px solid #222222; padding-bottom: 10px;">
                    New ${order.formType === 'inquiry' ? 'Inquiry Received' : 'Order Placed'}
                </h2>
                
                <p style="font-size: 14px; color: #cccccc; line-height: 1.6;">
                    A new customer request has been captured on your website. Here are the submission details:
                </p>
                
                <!-- Customer Details -->
                <div style="margin-top: 25px;">
                    <h3 style="color: #c5a880; font-family: 'Playfair Display', Georgia, serif; font-size: 16px; margin-bottom: 10px; border-bottom: 1px solid #333; padding-bottom: 5px;">Customer Details</h3>
                    <table style="width: 100%; border-collapse: collapse; font-size: 14px; line-height: 1.6;">
                        <tr>
                            <td style="color: #888; width: 120px; padding: 4px 0;">Name:</td>
                            <td style="color: #fff; font-weight: bold; padding: 4px 0;">${order.name}</td>
                        </tr>
                        <tr>
                            <td style="color: #888; padding: 4px 0;">Phone:</td>
                            <td style="color: #fff; padding: 4px 0;"><a href="tel:${order.phone}" style="color: #c5a880; text-decoration: none;">${order.phone}</a></td>
                        </tr>
                        ${order.email ? `
                        <tr>
                            <td style="color: #888; padding: 4px 0;">Email:</td>
                            <td style="color: #fff; padding: 4px 0;"><a href="mailto:${order.email}" style="color: #c5a880; text-decoration: none;">${order.email}</a></td>
                        </tr>` : ''}
                        ${order.city ? `
                        <tr>
                            <td style="color: #888; padding: 4px 0;">City:</td>
                            <td style="color: #fff; padding: 4px 0;">${order.city}</td>
                        </tr>` : ''}
                        ${order.address ? `
                        <tr>
                            <td style="color: #888; padding: 4px 0;">Address:</td>
                            <td style="color: #fff; padding: 4px 0;">${order.address}</td>
                        </tr>` : ''}
                    </table>
                </div>
                
                <!-- Product Details -->
                ${productsHtml}
                
                <!-- Customer Notes -->
                ${order.notes ? `
                <div style="margin-top: 25px; background-color: #151515; padding: 15px; border-left: 3px solid #c5a880; border-radius: 4px;">
                    <h4 style="color: #c5a880; margin: 0 0 5px 0; font-size: 13px;">Customer Notes:</h4>
                    <p style="color: #bbb; font-size: 13px; margin: 0; line-height: 1.5; font-style: italic;">"${order.notes}"</p>
                </div>
                ` : ''}
                
                <!-- Action Button -->
                <div style="margin-top: 35px; text-align: center;">
                    <a href="${whatsappLink}" target="_blank" style="background-color: #25d366; color: #ffffff; text-decoration: none; padding: 15px 30px; font-size: 14px; font-weight: bold; border-radius: 50px; display: inline-block; box-shadow: 0 4px 10px rgba(37,211,102,0.3); transition: transform 0.2s;">
                        Contact Customer via WhatsApp
                    </a>
                    <p style="color: #666; font-size: 11px; margin-top: 8px;">Click to instantly open a chat with ${order.name} on WhatsApp</p>
                </div>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #0d0d0d; padding: 20px; text-align: center; border-top: 1px solid #222222;">
                <p style="color: #555; margin: 0; font-size: 11px;">&copy; 2026 Elix Lumi. All rights reserved.</p>
                <p style="color: #444; margin: 5px 0 0 0; font-size: 10px;">This is an automated notification from your website store dashboard.</p>
            </div>
        </div>
    </body>
    </html>
    `;

    // Attempt 1: Resend API (if configured properly with standard api key)
    if (resendApiKey && resendApiKey.startsWith("re_")) {
        console.log(`✉️ Attempting to dispatch email using Resend API to: ${recipientEmail}`);
        try {
            const response = await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${resendApiKey}`
                },
                body: JSON.stringify({
                    from: fromEmail,
                    to: [recipientEmail],
                    subject: subject,
                    html: htmlContent
                })
            });
            const resData = await response.json();
            if (response.ok) {
                console.log("✅ Email sent successfully via Resend. ID:", resData.id);
                return { success: true, provider: "resend" };
            } else {
                console.error("❌ Resend API returned error details:", resData);
            }
        } catch (resendErr) {
            console.error("❌ Failed to send email via Resend API:", resendErr.message);
        }
    }

    // Attempt 2: Nodemailer (Local SMTP / Fallback)
    const smtpHost = process.env.SMTP_HOST || "smtp.hostinger.com";
    const smtpPort = parseInt(process.env.SMTP_PORT || "465");
    const smtpUser = process.env.SMTP_USER || "order@elixlumi.com";
    const smtpPass = process.env.SMTP_PASS || "12345678#";

    console.log(`✉️ Attempting to dispatch email using SMTP (${smtpHost}:${smtpPort}) via ${smtpUser} to: ${recipientEmail}`);
    try {
        const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465,
            auth: { user: smtpUser, pass: smtpPass }
        });
        await transporter.sendMail({
            from: `"Elixlumi Orders" <${smtpUser}>`,
            to: recipientEmail,
            subject: subject,
            html: htmlContent
        });
        console.log("✅ Email sent successfully via SMTP!");
        return { success: true, provider: "smtp" };
    } catch (smtpErr) {
        console.error("❌ Failed to send email via SMTP:", smtpErr.message);
    }

    // Final Fallback: Log email details
    console.warn("⚠️ [EMAIL NOTIFICATION FAILED]: No email provider credentials configured in .env!");
    console.warn(`📩 Raw Order Notification:\nTo: ${recipientEmail}\nSubject: ${subject}\nCustomer: ${order.name} (${order.phone})\nTotal: PKR ${order.totalAmount || 0}`);
    console.warn("💡 To resolve this, add 'RESEND_API_KEY=re_...' or SMTP credentials ('SMTP_HOST', 'SMTP_USER', 'SMTP_PASS') to your Hostinger Environment Variables.");
    return { success: false, error: "No email provider configured" };
}

// --- ORDERS API ---
app.post("/api/submit-order", async (req, res) => {
    const body = req.body;
    const orderNumber = `ORD-${Date.now()}`;
    try {
        await db.run(
            "INSERT INTO orders (order_number, customer_name, customer_email, customer_phone, customer_city, customer_address, products, total_amount, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [orderNumber, body.name, body.email, body.phone, body.city, body.address, JSON.stringify(body.product ? [body.product] : []), body.totalAmount, body.notes]
        );
        
        // Background email dispatch
        sendOrderNotificationEmail({
            orderNumber,
            name: body.name,
            email: body.email,
            phone: body.phone,
            city: body.city,
            address: body.address,
            product: body.product,
            quantity: body.quantity,
            totalAmount: body.totalAmount,
            notes: body.notes,
            formType: body.formType
        }).catch(emailErr => {
            console.error("❌ Background email notification failed:", emailErr.message);
        });

        res.json({ success: true, orderNumber });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.put("/api/admin/orders/:id", verifyToken, async (req, res) => {
    const { status } = req.body;
    try {
        await db.run("UPDATE orders SET status = ? WHERE id = ?", [status, req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/api/admin/orders", verifyToken, async (req, res) => {
    try {
        const orders = await db.all("SELECT * FROM orders ORDER BY created_at DESC");
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/api/admin/stats", verifyToken, async (req, res) => {
    try {
        const productsCount = await db.get("SELECT COUNT(*) as count FROM products");
        const ordersCount = await db.get("SELECT COUNT(*) as count FROM orders");
        const recentOrders = await db.all("SELECT * FROM orders ORDER BY created_at DESC LIMIT 5");
        const revenue = await db.get("SELECT SUM(total_amount) as total FROM orders WHERE status != 'cancelled'");
        
        res.json({
            totalProducts: productsCount.count,
            totalOrders: ordersCount.count,
            totalCustomers: ordersCount.count, // Simplified
            totalRevenue: revenue.total || 0,
            recentOrders
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/api/health", (_req, res) => res.json({ ok: true, storage: "sqlite" }));

// Serve static files with no-cache headers for index.html to force browser updates
app.use(express.static(distDir, {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith("index.html")) {
            res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
            res.setHeader("Pragma", "no-cache");
            res.setHeader("Expires", "0");
        }
    }
}));

app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/")) return next();
    
    // Force no-cache on the index.html fallback routing
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.sendFile(path.join(distDir, "index.html"));
});

app.listen(port, () => console.log(`Server running on port ${port}`));
