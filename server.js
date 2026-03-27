import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Serve static files from weatherapp folder
app.use(express.static(path.join(__dirname, "weatherapp")));

// Serve index.html for all other routes
app.use((req, res) => {
    res.sendFile(path.join(__dirname, "weatherapp", "index.html"));
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
