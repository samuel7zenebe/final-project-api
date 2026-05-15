import type { Request, Response } from "express";
import express from "express";
import swaggerJSDoc from "swagger-jsdoc";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import cors from "cors";

import { authRouter } from "./routes/auth.js";
import { usersRouter } from "./routes/users.js";
import { blogsRouter } from "./routes/blogs.js";
import { categoriesRouter } from "./routes/categories.js";
import { tagsRouter } from "./routes/tags.js";
import { commentsRouter } from "./routes/comments.js";
import { postsRouter } from "./routes/posts.js";
import { uploadRouter } from "./routes/upload.js";

dotenv.config();

const app = express();
const port: number = Number(process.env["PORT"]) || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Swagger setup
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Blog/CRM API",
      version: "1.0.0",
      description: "API documentation for the Final Project Blog/CRM",
    },
    servers: [
      {
        url: `http://localhost:${port}`,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./src/controllers/*.ts", "./src/routes/*.ts"],
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.get;
// Routes
app.use("/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/blogs", blogsRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/tags", tagsRouter);
app.use("/api/comments", commentsRouter);
app.use("/api/posts", postsRouter);
app.use("/api/upload", uploadRouter);

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is running
 */
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
