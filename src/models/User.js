import mongoose from "mongoose";
import { hash, genSalt, compare } from "bcryptjs";

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide name"],
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    required: [true, "Please provide email"],
    minlength: 3,
    maxlength: 50,
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Please provide a valid email",
    ],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please provide password"],
    minlength: 3,
  },
  resetOTP: String,
  resetOTPExpiry: Date,
  created_time: {
    type: Date,
    default: Date.now,
  },
  isOtpVerified: { type: Boolean, default: false },
});

const ProductSchema = new mongoose.Schema({
  productName: String,
  price: Number,
  quantity: Number,
  threshold: Number,
  existing_date: Date,
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

const InvoiceSchema = new mongoose.Schema({
  invoiceId: String,
  refernce_number: String,
  amount: Number,
  status: String,
  due_date: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});
const SalesSchema = new mongoose.Schema(
  {
    totalSales: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    totalCost: { type: Number, default: 0 },
    totalProfit: { type: Number, default: 0 },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);
const PurchaseSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  totalPurchases: { type: Number, default: 0 }, // total purchased units
  totalCost: { type: Number, default: 0 }, // purchase cost
  cancelledOrders: { type: Number, default: 0 }, // cancelled units
  returnedOrders: { type: Number, default: 0 }, // returned units
  currentQuantity: { type: Number, default: 0 }, // stock left
  orderQuantity: { type: Number, default: 0 }, // ordered units
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});
const topproductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 0,
    max: 5, // assuming 5-star rating system
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});
const ChartSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  sales: {
    type: Number,
    required: true,
  },
  purchase: {
    type: Number,
    required: true,
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});
UserSchema.pre("save", async function () {
  const salt = await genSalt(10);
  this.password = await hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
  const isMatch = await compare(candidatePassword, this.password);
  return isMatch;
};

const User = mongoose.model("User", UserSchema);
const Product = mongoose.model("Product", ProductSchema);
const Invoice = mongoose.model("Invoice", InvoiceSchema);
const Sales = mongoose.model("Sales", SalesSchema);
const Purchase = mongoose.model("Purchase", PurchaseSchema);
const TopProduct = mongoose.model("TopProduct", topproductSchema);
const Chart = mongoose.model("Chart", ChartSchema);
export { User, Product, Invoice, Sales, Purchase, TopProduct, Chart };
