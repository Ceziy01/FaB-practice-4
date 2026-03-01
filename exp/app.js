const express = require("express");
const cors = require("cors");
const { nanoid } = require("nanoid");

const app = express();
const PORT = 3000;

app.use(express.json());

app.use(cors({
  origin: "http://localhost:3001",
  methods: ["GET", "POST", "PATCH", "DELETE"],
}));

app.use((req, res, next) => {
  res.on("finish", () => {
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.path} → ${res.statusCode}`
    );
  });
  next();
});

let products = [
  {
    id: nanoid(6),
    name: "The Witcher 3",
    category: "RPG",
    description: "Открытый мир, фэнтези",
    price: 1999,
    stock: 10,
    rating: 4.9,
    image: "https://via.placeholder.com/150"
  },
  {
    id: nanoid(6),
    name: "Cyberpunk 2077",
    category: "RPG",
    description: "Футуристический экшен",
    price: 2499,
    stock: 5,
    rating: 4.2,
    image: "https://via.placeholder.com/150"
  },
  {
    id: nanoid(6),
    name: "GTA V",
    category: "Action",
    description: "Криминальный открытый мир",
    price: 1499,
    stock: 20,
    rating: 4.8,
    image: "https://via.placeholder.com/150"
  }
];

const findProduct = (id) => products.find(p => p.id === id);

app.get("/api/products", (req, res) => {
  res.json(products);
});

app.get("/api/products/:id", (req, res) => {
  const product = findProduct(req.params.id);
  if (!product) return res.status(404).json({ error: "Not found" });
  res.json(product);
});

app.post("/api/products", (req, res) => {
  const { name, category, description, price, stock, rating, image } = req.body;

  if (!name || !category || !description) {
    return res.status(400).json({ error: "Invalid data" });
  }

  const newProduct = {
    id: nanoid(6),
    name,
    category,
    description,
    price: Number(price),
    stock: Number(stock),
    rating: Number(rating) || 0,
    image: image || "https://via.placeholder.com/150"
  };

  products.push(newProduct);
  res.status(201).json(newProduct);
});

app.patch("/api/products/:id", (req, res) => {
  const product = findProduct(req.params.id);
  if (!product) return res.status(404).json({ error: "Not found" });

  Object.assign(product, req.body);
  res.json(product);
});

app.delete("/api/products/:id", (req, res) => {
  products = products.filter(p => p.id !== req.params.id);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});