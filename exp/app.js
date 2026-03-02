const express = require("express");
const cors = require("cors");
const { nanoid } = require("nanoid");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

const app = express();
const PORT = 3000;

app.use(express.json());

app.use(cors());
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
    rating: 4.82
  },
  {
    id: nanoid(6),
    name: "Helldivers 2",
    category: "Shooter",
    description: "Кооперативный шутер",
    price: 1799,
    stock: 26,
    rating: 4.9
  }
];

const findProduct = (id) => products.find(p => p.id === id);

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Video Games Store API",
      version: "1.0.0",
      description: "API для управления магазином видеоигр"
    },
    servers: [
      {
        url: "http://localhost:3000"
      }
    ],
    components: {
      schemas: {
        Product: {
          type: "object",
          required: ["name", "category", "description"],
          properties: {
            id: { type: "string", example: "abc123" },
            name: { type: "string", example: "The Witcher 3" },
            category: { type: "string", example: "RPG" },
            description: { type: "string", example: "Открытый мир, фэнтези" },
            price: { type: "number", example: 1999 },
            stock: { type: "number", example: 10 },
            rating: { type: "number", example: 4.8 }
          }
        }
      }
    }
  },
  apis: ["./*.js"]
};

const swaggerSpec = swaggerJsdoc(options);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Получить список товаров
 *     responses:
 *       200:
 *         description: Список товаров
 */
app.get("/api/products", (req, res) => {
  res.json(products);
});

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Получить товар по ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Найденный товар
 *       404:
 *         description: Не найден
 */
app.get("/api/products/:id", (req, res) => {
  const product = findProduct(req.params.id);
  if (!product) return res.status(404).json({ error: "Not found" });
  res.json(product);
});

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Создать новый товар
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Товар создан
 *       400:
 *         description: Ошибка данных
 */
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

/**
 * @swagger
 * /api/products/{id}:
 *   patch:
 *     summary: Обновить товар
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Обновленный товар
 *       404:
 *         description: Не найден
 */
app.patch("/api/products/:id", (req, res) => {
  const product = findProduct(req.params.id);
  if (!product) return res.status(404).json({ error: "Not found" });

  Object.assign(product, req.body);
  res.json(product);
});

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Удалить товар
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Удалено
 */
app.delete("/api/products/:id", (req, res) => {
  products = products.filter(p => p.id !== req.params.id);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Swagger docs: http://localhost:${PORT}/api-docs`);
});