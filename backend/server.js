const express = require('express');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const app = express();
const JWT_SECRET = process.env.JWT_SECRET;
const multer = require('multer');
const multerS3 = require('multer-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const path = require("path");
app.use(express.json());
app.use(bodyParser.json());

const _dirname = path.dirname("");
const buildpath = path.join(_dirname,"../frontend/build");
app.use(express.static(buildpath));
app.use(cors({"origin":"*"}));


// MySQL database connection pool
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+05:30'
});

db.query("SET time_zone = '+05:30';");

const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const accessKey = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;

// Initialize S3 client
const s3 = new S3Client({
  region: bucketRegion,
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretAccessKey,
  },
});
console.log('Connected to MySQL database');


// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(403).json({ error: 'Access forbidden: No token provided' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

// Generate a presigned URL for each image
// Generate a presigned URL for each image
const generatePresignedUrl = async (key) => {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });
  
  try {
    // Generate a presigned URL with 1-hour expiration time
    const url = await getSignedUrl(s3, command, { expiresIn: 3600 }); // Change s3Client to s3
    return url;
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    throw new Error("Failed to generate presigned URL");
  }
};

// Get user data endpoint
app.get('/api/user', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const [result] = await db.query('SELECT id, Name, Phone, Section, Roll_Number, Hostel, email, isAdmin, superAdmin, userType FROM users WHERE id = ?', [userId]);
    if (result.length === 0) return res.status(404).json({ error: 'User not found' });
    res.status(200).json(result[0]);
  } catch (err) {
    console.error('Error fetching user data:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Register user
app.post('/api/register', async (req, res) => {
  const { Name, Phone, Section, Roll_Number, Hostel, email, password, userType } = req.body;

  try {
    // Check if email or roll number is already registered
    const [checkResult] = await db.query('SELECT * FROM users WHERE email = ? OR Roll_Number = ?', [email, Roll_Number]);

    if (checkResult.length > 0) {
      return res.status(409).json({ error: 'Email or Roll Number already registered' });
    }

    // Insert the new user into the database, including userType
    await db.query(
      'INSERT INTO users (Name, Phone, Section, Roll_Number, Hostel, email, password, userType) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
      [Name, Phone, Section, Roll_Number, Hostel, email, password, userType]
    );
    
    res.status(200).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).json({ error: 'Error registering user', details: err.message });
  }
});

// Login endpoint with JWT token generation
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    // Find user with matching email and password
    const [result] = await db.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);
    if (result.length === 0) return res.status(401).json({ error: 'Invalid email or password' });

    const user = result[0];

    // Generate JWT token with user ID, email, and userType
    const token = jwt.sign(
      { id: user.id, email: user.email, userType: user.userType }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );

    // Log and update last_login timestamp
    console.log(`Updating last_login for user ID: ${user.id}`);
    const [updateResult] = await db.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

    // Log if the last_login update was successful
    if (updateResult.affectedRows === 0) {
      console.log('Update failed: No rows affected');
    } else {
      console.log('last_login updated successfully');
    }

    res.status(200).json({ message: 'Login successful', token });
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ error: 'Login error' });
  }
});

// Update product status endpoint
app.patch('/api/admin/products/:id/status', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['live', 'hidden'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
  }

  try {
      const [result] = await db.query('UPDATE products SET status = ? WHERE id = ?', [status, id]);
      if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Product not found' });
      }
      res.status(200).json({ message: 'Product status updated successfully' });
  } catch (error) {
      console.error('Error updating product status:', error);
      res.status(500).json({ error: 'Failed to update product status' });
  }
});

// Get user orders
app.get('/api/user/orders', authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const [orders] = await db.query('SELECT * FROM orders WHERE user_id = ?', [userId]);

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: 'No orders found for this user' });
    }

    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        try {
          const [items] = await db.query(
            `SELECT oi.id AS item_id, oi.product_id, oi.quantity, oi.size_id, oi.color_id, oi.price, 
                    s.size AS size, c.color AS color, p.name AS product_name
             FROM order_items oi
             LEFT JOIN sizes s ON oi.size_id = s.id
             LEFT JOIN colors c ON oi.color_id = c.id
             LEFT JOIN products p ON oi.product_id = p.id
             WHERE oi.order_id = ?`,
            [order.id]
          );

          // Fetch available sizes and colors for each item
          const itemsWithAvailableOptions = await Promise.all(items.map(async (item) => {
            const [availableSizes] = await db.query(
              `SELECT s.size 
               FROM product_sizes ps
               JOIN sizes s ON ps.size_id = s.id
               WHERE ps.product_id = ?`,
              [item.product_id]
            );

            const [availableColors] = await db.query(
              `SELECT c.color 
               FROM product_colors pc
               JOIN colors c ON pc.color_id = c.id
               WHERE pc.product_id = ?`,
              [item.product_id]
            );

            return {
              ...item,
              available_sizes: availableSizes.map(row => row.size),
              available_colors: availableColors.map(row => row.color),
            };
          }));

          return { ...order, items: itemsWithAvailableOptions };
        } catch (itemError) {
          console.error(`Error fetching items for order ID ${order.id}:`, itemError);
          throw itemError;
        }
      })
    );

    res.status(200).json({ orders: ordersWithItems });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ error: 'Failed to fetch user orders' });
  }
});

app.get('/api/admin/my-payments', authenticateToken, async (req, res) => {
  const adminId = req.query.adminId; // Get the admin ID from query params

  // Map admin IDs to their names
  const adminMap = {
    6: 'Mrigankar',
    14: 'Venkat',
    15: 'Unnati',
    16: 'Pragya',
    17: 'Sanat',
    18: 'Suraj',
  };

  const paidToName = adminMap[adminId];
  if (!paidToName) {
    return res.status(403).json({ error: 'Unauthorized access' });
  }

  try {
    const [results] = await db.query(
      `SELECT o.id, o.total_price, o.screenshot_url, o.transaction_id, o.payment_status, u.name AS buyer_name 
       FROM orders o
       JOIN users u ON o.user_id = u.id
       WHERE o.paid_to = ? AND o.payment_status IN ('Verification Pending', 'Failed')`,
      [paidToName]
    );

    res.status(200).json(results);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

app.post('/api/admin/verify-payment', authenticateToken, async (req, res) => {
  const { orderId } = req.body;

  try {
    // Update payment status to Completed
    const [result] = await db.query(
      'UPDATE orders SET payment_status = ? WHERE id = ?',
      ['Successful', orderId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({ message: 'Payment verified successfully' });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ message: 'Failed to verify payment' });
  }
});

app.post('/api/admin/decline-payment', authenticateToken, async (req, res) => {
  const { orderId } = req.body;

  try {
    const [result] = await db.query(
      'UPDATE orders SET payment_status = ? WHERE id = ?',
      ['Failed', orderId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({ message: 'Payment declined successfully' });
  } catch (error) {
    console.error('Error declining payment:', error);
    res.status(500).json({ message: 'Failed to decline payment' });
  }
});

// Endpoint to update the size of an order item
app.put('/api/order/:orderId/item/:itemId', authenticateToken, async (req, res) => {
  const { orderId, itemId } = req.params;
  const { size, color } = req.body;

  try {
    let sizeId = null;
    let colorId = null;

    // Check and get size ID if provided
    if (size) {
      const [sizeResult] = await db.query('SELECT id FROM sizes WHERE size = ?', [size]);
      if (sizeResult.length === 0) {
        return res.status(400).json({ error: 'Invalid size' });
      }
      sizeId = sizeResult[0].id;
    }

    // Check and get color ID if provided
    if (color) {
      const [colorResult] = await db.query('SELECT id FROM colors WHERE color = ?', [color]);
      if (colorResult.length === 0) {
        return res.status(400).json({ error: 'Invalid color' });
      }
      colorId = colorResult[0].id;
    }

    // Update the order item with size and/or color if they are provided
    const [updateResult] = await db.query(
      'UPDATE order_items SET size_id = COALESCE(?, size_id), color_id = COALESCE(?, color_id) WHERE order_id = ? AND id = ?',
      [sizeId, colorId, orderId, itemId]
    );

    if (updateResult.affectedRows === 0) {
      return res.status(404).json({ error: 'Order item not found' });
    }

    res.status(200).json({ message: 'Options updated successfully' });
  } catch (error) {
    console.error('Error updating options:', error);
    res.status(500).json({ error: 'Failed to update options' });
  }
});

app.get('/api/admin/dashboard-stats', authenticateToken, async (req, res) => {
  try {
    // Calculate total sales and revenue for live items only
    const [salesData] = await db.query(`
      SELECT 
        IFNULL(SUM(order_items.quantity), 0) AS total_sales,
        IFNULL(SUM(order_items.price * order_items.quantity), 0) AS total_revenue
      FROM order_items
      JOIN products ON order_items.product_id = products.id
      WHERE products.status = 'live'
    `);

    // Calculate today's sales in IST
    const [todaySalesData] = await db.query(`
      SELECT 
          IFNULL(SUM(order_items.price * order_items.quantity), 0) AS today_sales
      FROM order_items
      JOIN orders ON order_items.order_id = orders.id
      JOIN products ON order_items.product_id = products.id
      WHERE products.status = 'live'
      AND DATE(CONVERT_TZ(orders.created_at, '+00:00', '+05:30')) = DATE(CONVERT_TZ(NOW(), '+00:00', '+05:30'));
    `);

    // Fetch total user count
    const [userCount] = await db.query(`
      SELECT COUNT(*) AS userCount FROM users
    `);

    // Fetch recent orders (limit to latest 5)
    const [recentOrders] = await db.query(`
      SELECT orders.id, users.name, orders.total_price, orders.payment_status 
      FROM orders
      JOIN users ON orders.user_id = users.id
      ORDER BY orders.created_at DESC
      LIMIT 5
    `);

    // Fetch sales by product for live products only
    const [salesByProduct] = await db.query(`
      SELECT 
        products.id AS product_id, 
        products.name, 
        SUM(order_items.quantity) AS quantity_sold,
        SUM(order_items.price * order_items.quantity) AS revenue
      FROM order_items
      JOIN products ON order_items.product_id = products.id
      WHERE products.status = 'live'
      GROUP BY products.id
    `);

    res.json({
      totalSales: salesData[0].total_sales || 0,
      totalRevenue: salesData[0].total_revenue || 0,
      todaySales: todaySalesData[0].today_sales || 0,
      userCount: userCount[0].userCount,
      recentOrders,
      salesByProduct,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// Manage Users(Admin Panel)
app.get('/api/admin/users', authenticateToken, async (req, res) => {
  try {
    const [users] = await db.query('SELECT * FROM users');
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.get('/api/admin/user/:id/details', authenticateToken, async (req, res) => {
  const userId = req.params.id;
  try {
    // Fetch user details, including password
    const [userResult] = await db.query(
      `SELECT id, name, phone, section, roll_number, hostel, email, password, status, last_login, isAdmin 
       FROM users 
       WHERE id = ?`,
      [userId]
    );

    // Check if the user exists
    if (userResult.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userDetails = userResult[0];

    // Fetch orders for the user, including product names
    const [orders] = await db.query(
      `SELECT o.id AS order_id, o.total_price, o.transaction_id, o.payment_status, o.created_at,
              oi.quantity, oi.size_id, oi.color_id, oi.custom_name, oi.price, p.name AS product_name
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE o.user_id = ?
       ORDER BY o.created_at DESC`,
      [userId]
    );

    // Group items by order_id to structure the response
    const groupedOrders = orders.reduce((acc, order) => {
      const {
        order_id,
        product_name,
        quantity,
        size_id,
        color_id,
        custom_name,
        price,
        total_price,
        transaction_id,
        payment_status,
        created_at
      } = order;

      // If the order_id is not in the accumulator, add it with order details
      if (!acc[order_id]) {
        acc[order_id] = {
          order_id,
          total_price,
          transaction_id,
          payment_status,
          created_at,
          items: []
        };
      }

      // Add the current item to the items array for this order
      acc[order_id].items.push({
        product_name,
        quantity,
        size_id: size_id || 'N/A', // Set default value if size_id is null
        color_id: color_id || 'N/A', // Set default value if color_id is null
        custom_name: custom_name || 'N/A', // Set default value if custom_name is null
        price
      });

      return acc;
    }, {});

    // Respond with user details and structured orders
    const responseData = {
      userDetails,
      orders: Object.values(groupedOrders) // Convert groupedOrders object to an array of orders
    }
    res.json(responseData);
  } catch (error) {
    console.error('Error fetching user details and orders:', error);
    res.status(500).json({ error: 'Failed to fetch user details and orders' });
  }
});


// Middleware for handling screenshot uploads
const screenshotUpload = multer({ storage: multer.memoryStorage() });

// Endpoint to upload payment screenshot
app.post('/api/upload-screenshot', authenticateToken, screenshotUpload.single('file'), async (req, res) => {
  try {
    const uniqueKey = `screenshots/${Date.now()}_${req.file.originalname}`;
    const uploadParams = {
      Bucket: bucketName,
      Key: uniqueKey,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };

    await s3.send(new PutObjectCommand(uploadParams));
    const screenshotUrl = `https://${bucketName}.s3.${bucketRegion}.amazonaws.com/${uniqueKey}`;

    res.status(200).json({ message: 'Screenshot uploaded successfully', screenshotUrl });
  } catch (error) {
    console.error('Error uploading screenshot:', error);
    res.status(500).json({ error: 'Failed to upload screenshot' });
  }
});



app.get('/api/admin/products-with-images', authenticateToken, async (req, res) => {
  try {
    const [products] = await db.query(`
      SELECT p.id, p.name, p.category, p.description, p.price, p.customizable_name, p.status,
             p.created_at, p.updated_at, p.size_available, p.color_available, p.available_for,
             GROUP_CONCAT(pi.url) AS image_urls
      FROM products p
      LEFT JOIN product_images pi ON p.id = pi.product_id
      GROUP BY p.id
    `);

    const productsWithImages = products.map((product) => {
      // Construct public S3 URLs for images directly
      const imageUrls = product.image_urls
        ? product.image_urls.split(',').map(url => `${url}`)
        : [];

      // Handle available_for as a comma-separated string instead of JSON
      const availableForArray = product.available_for 
        ? product.available_for.split(',') 
        : [];

      return { 
        ...product, 
        image_urls: imageUrls, 
        available_for: availableForArray, // Store as array on frontend
        customizable_name: product.customizable_name ? 'Customizable' : 'Not Customizable',
        size_available: product.size_available ? 'Yes' : 'No',
        color_available: product.color_available ? 'Yes' : 'No'
      };
    });

    res.status(200).json({ products: productsWithImages });
  } catch (error) {
    console.error('Error fetching products with images:', error);
    res.status(500).json({ error: 'Failed to fetch products with images' });
  }
});

app.post('/api/order', authenticateToken, async (req, res) => {
  const { total_price, transaction_id, order_items, screenshot_url, paid_to } = req.body;
  const userId = req.user.id;

  try {
      const [orderResult] = await db.query(
          'INSERT INTO orders (user_id, total_price, transaction_id, screenshot_url, paid_to) VALUES (?, ?, ?, ?, ?)',
          [userId, total_price, transaction_id, screenshot_url, paid_to]
      );

      const orderId = orderResult.insertId;

      await Promise.all(order_items.map(async (item) => {
          const { product_id, quantity, size, color, price, custom_name } = item;
          let sizeRow = null;
          let colorRow = null;

          if (size) {
              const [sizeResult] = await db.query('SELECT id FROM sizes WHERE size = ?', [size]);
              sizeRow = sizeResult && sizeResult[0] ? sizeResult[0] : null;
          }

          if (color) {
              const [colorResult] = await db.query('SELECT id FROM colors WHERE color = ?', [color]);
              colorRow = colorResult && colorResult[0] ? colorResult[0] : null;
          }

          await db.query(
              'INSERT INTO order_items (order_id, product_id, quantity, size_id, color_id, custom_name, price) VALUES (?, ?, ?, ?, ?, ?, ?)',
              [orderId, product_id, quantity, sizeRow ? sizeRow.id : null, colorRow ? colorRow.id : null, custom_name, price]
          );
      }));

      res.status(201).json({ message: 'Order created successfully', orderId });
  } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({ error: 'Failed to create order' });
  }
});

const upload = multer({ storage: multer.memoryStorage() });

// Image Upload Endpoint for individual files
app.post('/api/upload', authenticateToken, upload.array('file', 5), async (req, res) => {
  try {
    const imageUrls = await Promise.all(
      req.files.map(async (file) => {
        const uniqueKey = `uploads/${Date.now()}_${file.originalname}`;
        const uploadParams = {
          Bucket: bucketName,
          Key: uniqueKey,
          Body: file.buffer,
          ContentType: file.mimetype,
        };

        await s3.send(new PutObjectCommand(uploadParams));
        const imageUrl = `https://${bucketName}.s3.${bucketRegion}.amazonaws.com/${uniqueKey}`;
        return imageUrl;
      })
    );

    res.status(200).json({ message: 'Files uploaded successfully', imageUrls });
  } catch (error) {
    console.error('Error uploading files:', error);
    res.status(500).json({ error: 'Failed to upload files' });
  }
});

// Endpoint to add a product with optional image uploads
app.post('/api/admin/products', authenticateToken, upload.array('images', 5), async (req, res) => {
  const { name, description, price, category, customizable_name, size_available, color_available, available_for } = req.body;

  try {
    // Convert available_for array to a comma-separated string if it exists
    const availableForString = available_for ? JSON.parse(available_for).join(',') : '';

    // Insert product data into MySQL, including `available_for`
    const [result] = await db.query(
      'INSERT INTO products (name, description, price, category, customizable_name, size_available, color_available, available_for) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        name,
        description,
        price,
        category,
        customizable_name === 'true',
        size_available === 'true',
        color_available === 'true',
        availableForString, // Store as comma-separated string
      ]
    );

    const productId = result.insertId;

    // Upload images to S3 and store URLs
    const imageUrls = await Promise.all(
      req.files.map(async (file) => {
        const uniqueKey = `products/${productId}/${Date.now()}_${file.originalname}`;
        const s3Params = {
          Bucket: bucketName,
          Key: uniqueKey,
          Body: file.buffer,
          ContentType: file.mimetype,
        };

        await s3.send(new PutObjectCommand(s3Params));
        const imageUrl = `https://${bucketName}.s3.${bucketRegion}.amazonaws.com/${uniqueKey}`;
        await db.query('INSERT INTO product_images (product_id, url) VALUES (?, ?)', [productId, imageUrl]);
        return imageUrl;
      })
    );

    res.status(201).json({ message: 'Product added successfully', productId, imageUrls });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ error: 'Failed to add product' });
  }
});

// Endpoint to add sizes to a product
app.post('/api/admin/products/:productId/sizes', authenticateToken, async (req, res) => {
  const { productId } = req.params;
  const { sizes } = req.body;

  try {
    const sizeIds = await Promise.all(
      sizes.map(async (size) => {
        const [result] = await db.query('INSERT INTO sizes (size) VALUES (?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)', [size]);
        return result.insertId;
      })
    );

    await Promise.all(
      sizeIds.map((sizeId) => db.query('INSERT INTO product_sizes (product_id, size_id) VALUES (?, ?)', [productId, sizeId]))
    );

    res.status(201).json({ message: 'Sizes added to product successfully' });
  } catch (error) {
    console.error('Error adding sizes:', error);
    res.status(500).json({ error: 'Failed to add sizes' });
  }
});

// Endpoint to add colors to a product
app.post('/api/admin/products/:productId/colors', authenticateToken, async (req, res) => {
  const { productId } = req.params;
  const { colors } = req.body;

  try {
    const colorIds = await Promise.all(
      colors.map(async (color) => {
        const [result] = await db.query('INSERT INTO colors (color) VALUES (?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)', [color]);
        return result.insertId;
      })
    );

    await Promise.all(
      colorIds.map((colorId) => db.query('INSERT INTO product_colors (product_id, color_id) VALUES (?, ?)', [productId, colorId]))
    );

    res.status(201).json({ message: 'Colors added to product successfully' });
  } catch (error) {
    console.error('Error adding colors:', error);
    res.status(500).json({ error: 'Failed to add colors' });
  }
});

// Get colors for a specific product
app.get('/api/admin/products/:productId/colors', authenticateToken, async (req, res) => {
  const productId = req.params.productId;

  try {
      const [colors] = await db.query(`
          SELECT c.color 
          FROM colors c
          INNER JOIN product_colors pc ON c.id = pc.color_id
          WHERE pc.product_id = ?
      `, [productId]);

      res.status(200).json({ colors: colors.map(color => color.color) });
  } catch (error) {
      console.error('Error fetching colors for product:', error);
      res.status(500).json({ error: 'Failed to fetch colors for the product' });
  }
});

// Get sizes for a specific product
app.get('/api/admin/products/:productId/sizes', authenticateToken, async (req, res) => {
  const productId = req.params.productId;

  try {
      const [sizes] = await db.query(`
          SELECT s.size 
          FROM sizes s
          INNER JOIN product_sizes ps ON s.id = ps.size_id
          WHERE ps.product_id = ?
      `, [productId]);

      res.status(200).json({ sizes: sizes.map(size => size.size) });
  } catch (error) {
      console.error('Error fetching sizes for product:', error);
      res.status(500).json({ error: 'Failed to fetch sizes for the product' });
  }
});

// Delete product endpoint with super admin check
app.delete('/api/admin/products/:id', authenticateToken,async (req, res) => {
  try {
    const productId = req.params.id;
    const deleteQuery = 'DELETE FROM products WHERE id = ?';
    await db.query(deleteQuery, [productId]);

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Protected route
app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({ message: 'This is a protected route, accessible only with a valid token' });
});

app.get('*', (req, res) => {
  res.sendFile(path.resolve(buildpath, 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});