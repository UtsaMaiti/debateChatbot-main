const express = require("express");
const path = require("path");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/database");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB()
    .then(() => console.log("✅ MongoDB Connected Successfully"))
    .catch((err) => console.error("❌ MongoDB Connection Failed:", err));

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors({ origin: "*" })); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Use Routes
const debateRoutes = require("./routes/index"); 
app.use("/api", debateRoutes); 


app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "templates", "index.html"));
});

// Start the server
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});
