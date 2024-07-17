const express = require("express");
const fileUpload = require("express-fileupload");
const path = require("path");
const fs = require("fs");
const os = require("os");
const { totalPrice } = require("./modules/totalPrice");
const { extractDay } = require("./modules/day");
const { extractType } = require("./modules/type");
const { extractRecipe } = require("./modules/recipe");
const { extractCondition } = require("./modules/conditionIva");
const { extractCuit } = require("./modules/cuit.js");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));
app.use(fileUpload());

// Ruta para servir el archivo HTML
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Procesar los PDF subidos
app.post("/process", async (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send("No files were uploaded.");
  }

  const files = req.files.pdf; // 'pdf' es el nombre del input en tu formulario
  const results = [];

  console.log("Archivos subidos:", files);

  const processFile = async (file) => {
    const buffer = file.data;
    const filepath = path.join(os.tmpdir(), `${Date.now()}-${file.name}`);

    try {
      // Guarda el archivo temporalmente en el directorio temporal
      fs.writeFileSync(filepath, buffer);

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
          filepath: file.name,
          error: "Error en la extracción de datos",
        });
      } else {
        results.push({
          filepath: file.name,
          day: dayResult.dia,
          type: typeResult.type,
          recipe: recipeResult.comp,
          condition: conditionResult.condition,
          cuit: cuitResult.cuit,
          totalPrice: priceResult.importeTotal,
        });
      }

      fs.unlinkSync(filepath); // Eliminar el archivo después de procesarlo
    } catch (error) {
      console.error(`Error processing file: ${file.name}`, error);
      results.push({ filepath: file.name, error: error.message });
    }
  };

  if (Array.isArray(files)) {
    for (const file of files) {
      await processFile(file);
    }
  } else {
    await processFile(files);
  }

  res.json(results);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
