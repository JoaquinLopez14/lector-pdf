const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { totalPrice } = require("./modules/totalPrice");
const { extractDay } = require("./modules/day");
const { extractType } = require("./modules/type");
const { extractRecipe } = require("./modules/recipe");
const { extractCondition } = require("./modules/conditionIva");
const { extractCuit } = require("./modules/cuit.js");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Configuración de multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Procesar los PDF subidos
app.post("/", upload.array("pdf", 62), async (req, res) => {
  const files = req.files;
  const results = [];

  console.log("Archivos subidos:", files);

  for (const file of files) {
    const filepath = path.join(__dirname, "uploads", file.filename);

    try {
      console.log(`Processing file: ${filepath}`);
      const dayResult = await extractDay(filepath);
      const typeResult = await extractType(filepath);
      const priceResult = await totalPrice(filepath);
      const recipeResult = await extractRecipe(filepath);
      const conditionResult = await extractCondition(filepath);
      const cuitResult = await extractCuit(filepath);

      if (
        dayResult.error ||
        typeResult.error ||
        priceResult.error ||
        recipeResult.error ||
        conditionResult.error ||
        cuitResult.error
      ) {
        console.error("Error in data extraction", {
          dayResult,
          typeResult,
          priceResult,
          recipeResult,
          conditionResult,
          cuitResult,
        });
        results.push({
          filepath: file.originalname,
          error: "Error en la extracción de datos",
        });
      } else {
        results.push({
          filepath: file.originalname,
          day: dayResult.dia,
          type: typeResult.type,
          recipe: recipeResult.comp,
          condition: conditionResult.condition,
          cuit: cuitResult.cuit,
          totalPrice: priceResult.importeTotal,
        });
      }
    } catch (error) {
      console.error(`Error processing file: ${file.originalname}`, error);
      results.push({ filepath: file.originalname, error: error.message });
    }
  }

  res.json(results);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
