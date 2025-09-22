// Importing required packages using ES module syntax
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import fetch from "node-fetch"; // Use node-fetch for fetch in Node.js
import dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env

const API_KEY = process.env.API_KEY;
const app = express();

// CORS Configuration
const corsOptions = {
  origin: process.env.CLIENT_DOMAIN, // Allow only the trusted client domain
  methods: ["GET", "POST", "PUT", "DELETE"], // Specify allowed HTTP methods
  allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
};

// Apply CORS middleware with the configured options
app.use(cors(corsOptions));

// Set up Rate Limiting - 100 requests per IP within a 15-minute window
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});

// Apply rate limiting to all API requests
app.use(limiter);

// Example route to demonstrate external API request
app.get("/api/games", async (req, res) => {
  const { search: searchQuery } = req.query;
  // Ensure API_KEY is available
  if (!API_KEY) {
    return res
      .status(500)
      .json({ error: "API key not found in environment variables" });
  }

  try {
    // Make a request to the external API using fetch
    const response = await fetch(
      `https://api.rawg.io/api/games?key=${API_KEY}&search=${searchQuery}`,
      {
        method: "GET",
        headers: {
          //Authorization: `Bearer ${API_KEY}`, some APIs requires using the authorization header but not this one
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch data from external API");
    }

    const data = await response.json(); // Parse the JSON response

    // Send back the data received from the external API
    return res.json(data);
  } catch (error) {
    console.error("Error fetching data from API:", error);
    return res
      .status(500)
      .json({ error: "Failed to fetch data from external API" });
  }
});

app.get("/api/game", async (req, res) => {
  const { gameSlug } = req.query;

  // Ensure API_KEY is available
  if (!API_KEY) {
    return res
      .status(500)
      .json({ error: "API key not found in environment variables" });
  }

  try {
    // Make a request to the external API using fetch
    const response = await fetch(
      `https://api.rawg.io/api/games/${gameSlug}?key=${API_KEY}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch data from external API");
    }

    const data = await response.json(); // Parse the JSON response

    // Send back the data received from the external API
    return res.json(data);
  } catch (error) {
    console.error("Error fetching data from API:", error);
    return res
      .status(500)
      .json({ error: "Failed to fetch data from external API" });
  }
});

// Basic route
app.get("/", (req, res) => {
  res.send(
    "Welcome to the Express App with CORS, Rate Limiting, and API Integration!"
  );
});

// Set up the server to listen on a port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});