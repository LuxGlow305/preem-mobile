import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// API Routes
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// AI Cost Optimization Endpoint for Apple Store Inventory
app.post("/api/ai/analyze-costs", async (req, res) => {
  try {
    const { inventory, metrics, selectedStore } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is not configured in server environment.",
      });
    }

    const prompt = `
You are Apple Retail Supply Chain & Inventory Cost Optimisation Intelligence.
Analyze the following store inventory data and metrics to identify costly bottlenecks, overstocked devices, stockout risks, and holding cost savings.

Current Store Scope: ${selectedStore ? selectedStore : "All Global Apple Stores"}
Inventory Items Overview: ${JSON.stringify(inventory.map((i: any) => ({
      sku: i.sku,
      title: i.title,
      category: i.category,
      stockQty: i.stockQty,
      srp: i.srp,
      costPrice: i.costPrice,
      holdingCostPerUnitMonth: i.holdingCostPerUnitMonth,
      daysInVault: i.daysInVault,
      status: i.status
    })), null, 2)}

Summary Metrics: ${JSON.stringify(metrics)}

Generate 3 to 4 actionable, high-precision recommendations tailored to Apple Store operations.
Return your response STRICTLY as valid JSON adhering to this schema:
[
  {
    "title": "Clear concise heading describing the cost issue",
    "category": "Holding Cost" | "Stockout Risk" | "Inter-Store Transfer" | "Dead Stock",
    "impactAmount": estimated dollar cost impact as integer,
    "impactType": "savings" | "revenue_risk" | "margin_boost",
    "urgency": "high" | "medium" | "low",
    "description": "Detailed analysis of why this inventory state is costly or risky for Apple retail",
    "actionItem": "Specific recommended step for store managers",
    "relatedSku": "Exact SKU string if applicable"
  }
]
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              category: { type: Type.STRING },
              impactAmount: { type: Type.NUMBER },
              impactType: { type: Type.STRING },
              urgency: { type: Type.STRING },
              description: { type: Type.STRING },
              actionItem: { type: Type.STRING },
              relatedSku: { type: Type.STRING },
            },
            required: ["title", "category", "impactAmount", "impactType", "urgency", "description", "actionItem"],
          },
        },
      },
    });

    const text = response.text || "[]";
    const recommendations = JSON.parse(text);

    return res.json({ recommendations });
  } catch (error: any) {
    console.error("Error generating Gemini cost analysis:", error);
    return res.status(500).json({
      error: "Failed to perform AI inventory cost analysis",
      details: error.message,
    });
  }
});

// Vite Middleware for Dev, Static serving for Prod
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Apple Store Inventory Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
