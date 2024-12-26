const dbConnection = require('../dbConnection');

const generateOrderCode = async () => {
    let orderCode;
    let isUnique = false;

    while (!isUnique) {
        orderCode = Math.floor(100000000 + Math.random() * 900000000).toString();

        const [rows] = await dbConnection.execute('SELECT order_code FROM inventory_orders WHERE order_code = ?', [orderCode]);
        if (rows.length === 0) {
            isUnique = true;
        }
    }

    return orderCode;
};

exports.addInventoryOrder = async (req, res) => {
    const { order_valid_until, supplier_category_id, products } = req.body;
  
    if (!order_valid_until || !supplier_category_id || !products || !Array.isArray(products)) {
      return res.status(400).json({ message: "All fields are required, including products array." });
    }
  
    try {
      const [category] = await dbConnection.execute(
        `SELECT * FROM categories WHERE category_id = ?`,
        [supplier_category_id]
      );
  
      if (category.length === 0) {
        return res.status(404).json({ message: "Supplier category not found" });
      }
  
      const order_code = await generateOrderCode();
  
      const [orderResult] = await dbConnection.execute(
        `INSERT INTO inventory_orders (order_code, order_valid_until, supplier_category_id) VALUES (?, ?, ?)`,
        [order_code, order_valid_until, supplier_category_id]
      );
  
      const order_id = orderResult.insertId;
  
      for (const product of products) {
        const { product_category_id, product_name_id, quantity } = product;
  
        if (!product_category_id || !product_name_id || !quantity) {
          return res.status(400).json({ message: "All product fields are required." });
        }
  
        await dbConnection.execute(
          `INSERT INTO inventory_order_products (order_id, category_id, sub_category_id, quantity) VALUES (?, ?, ?, ?)`,
          [order_id, product_category_id, product_name_id, quantity]
        );
      }
  
      res.status(201).json({ message: "Inventory order and products added successfully." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };
  
  exports.updateInventoryOrder = async (req, res) => {
    const { order_code, order_valid_until, products } = req.body;

    if (!order_code || !order_valid_until || !products || !Array.isArray(products)) {
        return res.status(400).json({ message: "All fields are required, including products array." });
    }

    try {
        const [order] = await dbConnection.execute(
            `SELECT order_id, supplier_category_id FROM inventory_orders WHERE order_code = ?`,
            [order_code]
        );

        if (order.length === 0) {
            return res.status(404).json({ message: "Order not found" });
        }

        const order_id = order[0].order_id;
        const existing_supplier_category_id = order[0].supplier_category_id; 

        await dbConnection.execute(
            `UPDATE inventory_orders SET order_valid_until = ? WHERE order_id = ?`,
            [order_valid_until, order_id]
        );

        for (const product of products) {
            const { product_category_id, product_name_id, quantity } = product;

            if (!product_category_id ||!product_name_id || !quantity) {
                return res.status(400).json({ message: "All product fields (category_id, quantity) are required." });
            }

            await dbConnection.execute(
                `INSERT INTO inventory_order_products (order_id, category_id, sub_category_id, quantity) VALUES (?, ?, ?, ?)`,
                [order_id, product_category_id, product_name_id, quantity]  
            );
        }

        res.status(200).json({ message: "Inventory order updated and new products added successfully." });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.getAllInventoryOrders = async (req, res) => {
    try {
        const [results] = await dbConnection.execute(`SELECT 
    iop.id,
    io.order_id,
    io.order_code,
    io.created_at AS order_date,
    io.order_valid_until,
    c.category_name AS supplier_category_name,
    c.category_name as product_category_name,
    sc.sub_category_name AS product_name,
    iop.quantity,
    sc.unit,
    io.status,
    io.updated_at
FROM inventory_orders io
JOIN inventory_order_products iop ON io.order_id = iop.order_id
JOIN sub_category sc ON iop.sub_category_id = sc.sub_category_id
JOIN categories c ON iop.category_id = c.category_id
AND io.supplier_category_id = c.category_id  -- Corrected condition to use the already joined table alias
ORDER BY io.order_id DESC`);

        res.status(200).json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

