import express from "express";
import {
  login,
  register,
  forgotPassword,
  resetPassword,
  updateUser,
  getUser,
  verifyOtp,
} from "../controllers/user.js";
import authenticationMiddleware from "../middleware/auth.js";
import {
  products,
  createProduct,
  getInvoices,
  deleteInvoices,
  createInvoice,
  createsales,
  getSales,
  getpurchase,
  createpurchase,
  getTop,
  createTop,
  getchart,
  createchart,
} from "../controllers/products.js";
import { User } from "../models/User.js";

const router = express.Router();

router.post("/login", login);
router.post("/signup", register);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);
router.get("/me", authenticationMiddleware, (req, res) => {
  res.status(200).json({ user: req.user });
});
router.get("/products", authenticationMiddleware, products);
router.post("/product", authenticationMiddleware, createProduct);
router.get("/invoice", authenticationMiddleware, getInvoices);
router.delete("/invoice/:id", authenticationMiddleware, deleteInvoices);
router.get("/:id", authenticationMiddleware, getUser);
router.patch("/:id", authenticationMiddleware, updateUser);
router.post("/invoice", authenticationMiddleware, createInvoice);
router.post("/sale", authenticationMiddleware, createsales);
router.get("/all/sales", authenticationMiddleware, getSales);
router.get("/all/purchases", authenticationMiddleware, getpurchase);
router.post("/purchase", authenticationMiddleware, createpurchase);
router.get("/all/tops", authenticationMiddleware, getTop);
router.post("/all/top", authenticationMiddleware, createTop);
router.get("/all/charts", authenticationMiddleware, getchart);
router.post("/all/chart", authenticationMiddleware, createchart);
export default router;
