const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { totalPrice } = require("./totalPrice");
const { extractDay } = require("./day");
const { extractType } = require("./type");
const { extractRecipe } = require("./recipe");
const { extractCondition } = require("./conditionIva");

const app = express();
const PORT = 3000;

// Configuración de multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

//----------------------------------------------------------------------------------

app.use(express.static("public"));

// Procesar los PDF subidos --------------------------------------------------------
app.post("/process", upload.array("pdf", 12), async (req, res) => {
  const files = req.files;

  const results = [];

  for (const file of files) {
    const filepath = path.join(__dirname, file.path);

    try {
      const dayResult = await extractDay(filepath);
      const typeResult = await extractType(filepath);
      const priceResult = await totalPrice(filepath);
      const recipeResult = await extractRecipe(filepath);
      const conditionResult = await extractCondition(filepath);

      if (
        dayResult.error ||
        typeResult.error ||
        priceResult.error ||
        recipeResult.error ||
        conditionResult.error
      ) {
        results.push({
          filepath: file.originalname,
          error: "Error en la extracción de datos",
        });
      } else {
        results.push({
          filepath: file.originalname,
          type: typeResult.type,
          day: dayResult.dia,
          price: priceResult.importeTotal,
          recipe: recipeResult.comp,
          condition: conditionResult.condition,
        });
      }

      fs.unlinkSync(filepath);
    } catch (error) {
      results.push({ filepath: file.originalname, error: error.message });
    }
  }
  res.json(results);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
