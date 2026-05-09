import express from "express";
import swaggerJSDoc from "swagger-jsdoc";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import { router as postsRouter } from "./routes/posts.js";
import { helloLogger } from "./middleware/auth.js";

dotenv.config();

const app = express();
// eslint-disable-next-line no-undef
const port = process.env.PORT || 5000;

// Swagger setup
const swaggerOptions = {
  swaggerDefinition: {
    myapi: "3.0.0",
    info: {
      title: "My API",
      version: "1.0.0",
      description: "API documentation",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
  },
  apis: ["./routes/*.js"], // files containing annotations as above
};

// Serve static files (HTML, CSS, JS)
app.use(express.static("public"));

app.get("/", (req, res) => {
  console.log(" HomePage ");
  return res.send("<h1> Basic Express App </h1>");
});

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 */
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

const swaggerDocs = swaggerJSDoc(swaggerOptions);

const isSwaggerEnabled =
  process.env.SWAGGER_ENABLED === "true" ||
  process.env.NODE_ENV !== "production";

if (isSwaggerEnabled) {
  console.log(" Env", process.env.HELLO_ENV);
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
}

// Sample route
app.get("/api/hello", (req, res) => {
  res.send("Hello World!");
});

app.use(helloLogger);

app.use("/api/posts", postsRouter);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
