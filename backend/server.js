import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import fetch from "node-fetch";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Route: handles image generation
app.post("/api/generate", async(req, res) => {
    const { model, prompt, width, height } = req.body;

    try {
        const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                inputs: prompt,
                parameters: { width, height },
                "x-use-cache": "false",
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            return res.status(400).json({ error: errorData.error });
        }

        const imageBlob = await response.blob();
        const imageBuffer = Buffer.from(await imageBlob.arrayBuffer());
        const base64Image = imageBuffer.toString("base64");

        res.json({
            imageUrl: `data:image/png;base64,${base64Image}`,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to generate image" });
    }
});

const PORT = 3000;
app.get("/", (req, res) => {
    res.send("✅ Backend server is running successfully!");
});

app.listen(PORT, () => console.log(`✅ Backend running at http://localhost:${PORT}`));