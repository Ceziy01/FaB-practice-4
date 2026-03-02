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
          required: ["id", "name", "category", "description"],
          properties: {
            id: {
              type: "string",
              example: "abc123"
            },
            name: {
              type: "string",
              example: "The Witcher 3"
            },
            category: {
              type: "string",
              example: "RPG"
            },
            description: {
              type: "string",
              example: "Открытый мир, фэнтези"
            },
            price: {
              type: "number",
              example: 1999
            },
            stock: {
              type: "number",
              example: 10
            },
            rating: {
              type: "number",
              example: 4.8
            }
          }
        },
      
        ProductInput: {
          type: "object",
          required: ["name", "category", "description"],
          properties: {
            name: { type: "string" },
            category: { type: "string" },
            description: { type: "string" },
            price: { type: "number" },
            stock: { type: "number" },
            rating: { type: "number" },
            image: { type: "string" }
          }
        },
      
        ErrorResponse: {
          type: "object",
          properties: {
            error: {
              type: "string",
              example: "Not found"
            }
          }
        }
      }
    }
  },
  apis: ["./app.js"]
};

const swaggerSpec = swaggerJsdoc(options);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Получить список всех товаров
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Список товаров успешно получен
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
app.get("/api/products", (req, res) => {
  res.json(products);
});

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Получить товар по ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID товара
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Товар найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Товар не найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       description: Данные нового товара
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductInput'
 *     responses:
 *       201:
 *         description: Товар успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Некорректные данные
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
 *     summary: Обновить существующий товар
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID товара
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       description: Поля для обновления
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductInput'
 *     responses:
 *       200:
 *         description: Товар успешно обновлен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Товар не найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
 *     summary: Удалить товар по ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID товара
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Товар успешно удалён
 *       404:
 *         description: Товар не найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
app.delete("/api/products/:id", (req, res) => {
  products = products.filter(p => p.id !== req.params.id);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Swagger docs: http://localhost:${PORT}/api-docs`);
});