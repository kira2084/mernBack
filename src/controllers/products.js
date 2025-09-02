import {
  Product,
  Invoice,
  Sales,
  Purchase,
  TopProduct,
  Chart,
} from "../models/User.js";

const products = async (req, res) => {
  try {
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    //console.log("hi", req.user.id);
    const products = await Product.find({ user: req.user.id })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Product.countDocuments({ user: req.user.id });
    const formatted = products.map((p) => ({
      _id: p._id,
      name: p.productName,
      price: p.price,
      quantity: p.quantity,
      threshold: p.threshold,
      expiryDate: p.existing_date,
    }));
    res.json({
      total,
      page,
      totalPages: Math.ceil(total / limit),
      products: formatted,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const createProduct = async (req, res) => {
  try {
    const { productName, price, quantity, threshold, existing_date } = req.body;
    const user = req.user.id;
    // Insert into DB
    const product = await Product.create({
      productName,
      price,
      quantity,
      threshold,
      existing_date,
      user,
    });

    res.status(201).json({ msg: "Product created successfully", product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const getInvoices = async (req, res) => {
  try {
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const invoices = await Invoice.find({ user: req.user.id })
      .skip((page - 1) * limit) // skip previous pages
      .limit(limit); // limit per page

    const total = await Invoice.countDocuments({ user: req.user.id });

    const formatted = invoices.map((inv) => ({
      _id: inv._id,
      invoiceId: inv.invoiceId,
      referenceNumber: inv.refernce_number,
      amount: inv.amount,
      status: inv.status,
      dueDate: inv.due_date,
    }));

    res.json({
      total,
      page,
      totalPages: Math.ceil(total / limit),
      invoices: formatted,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createInvoice = async (req, res) => {
  try {
    let { invoiceId, refernce_number, amount, status, due_date } = req.body;
    const user = req.user.id;
    if (!invoiceId.startsWith("INV-")) {
      invoiceId = `INV-${invoiceId}`;
    }
    if (!refernce_number.startsWith("INV-")) {
      refernce_number = `INV-${refernce_number}`;
    }
    // Insert into DB
    const newInvoice = new Invoice({
      invoiceId,
      refernce_number,
      amount,
      status,
      due_date,
      user,
    });
    await newInvoice.save();
    res.status(201).json({ message: "Invoice created", invoice: newInvoice });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const deleteInvoices = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Invoice.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    res.json({ message: "Invoice deleted successfully", deleted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const createsales = async (req, res) => {
  try {
    const { totalSales, totalRevenue, totalCost } = req.body;
    const totalProfit = totalRevenue - totalCost;
    const user = req.user.id;
    const sale = await Sales.create({
      totalSales,
      totalRevenue,
      totalCost,
      totalProfit,
      user,
    });

    res.json(sale);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const getSales = async (req, res) => {
  try {
    const sale = await Sales.findOne({ user: req.user.id }).sort({
      createdAt: -1,
    });

    if (!sale) {
      return res.json({
        totalSales: 0,
        totalRevenue: 0,
        totalCost: 0,
        totalProfit: 0,
      });
    }

    res.json(sale);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const createpurchase = async (req, res) => {
  try {
    const {
      totalPurchases,
      totalCost,
      cancelledOrders,
      returnedOrders,
      currentQuantity,
      orderQuantity,
    } = req.body;
    const user = req.user.id;
    const purchase = await Purchase.create({
      totalPurchases,
      totalCost,
      cancelledOrders,
      returnedOrders,
      currentQuantity,
      orderQuantity,
      user,
    });
    res.json(purchase);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const getpurchase = async (req, res) => {
  try {
    const purchase = await Purchase.findOne({ user: req.user.id }).sort({
      createdAt: -1,
    });

    if (!purchase) {
      return res.json({
        totalPurchases: 0,
        totalCost: 0,
        cancelledOrders: 0,
        returnedOrders: 0,
        currentQuantity: 0,
        orderQuantity: 0,
      });
    }

    res.json(purchase);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const getTop = async (req, res) => {
  try {
    const products = await TopProduct.find({ user: req.user.id })
      .sort({ rating: -1 })
      .limit(5);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const createTop = async (req, res) => {
  try {
    const { name, rating } = req.body;
    const user = req.user.id;
    // Insert into DB
    const top = await TopProduct.create({
      name,
      rating,
      user,
    });
    res.status(201).json({ msg: "Top Product created successfully", top });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const getchart = async (req, res) => {
  try {
    const products = await Chart.find({ user: req.user.id }).limit(6);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const createchart = async (req, res) => {
  try {
    const { name, sales, purchase } = req.body;
    const user = req.user.id;
    // Insert into DB
    const top = await Chart.create({
      name,
      sales,
      purchase,
      user,
    });
    res.status(201).json({ msg: "created successfully", top });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export {
  products,
  createProduct,
  deleteInvoices,
  getInvoices,
  createInvoice,
  createsales,
  getSales,
  getpurchase,
  createpurchase,
  getTop,
  createTop,
  getchart,
  createchart,
};
