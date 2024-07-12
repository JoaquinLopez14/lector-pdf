const { totalPrice } = require("./totalPrice");
const { extractDay } = require("./day");
const { type } = require("./type");
const { extractRecipe } = require("./recipe");
const { extractCondition } = require("./conditionIva");

const filepaths = [
  "pdf/A-3_550.pdf",
  "pdf/A-3_472.pdf",
  "pdf/A-3_547.pdf",
  "pdf/B-3_5108.pdf",
  "pdf/B-3_5133.pdf",
  "pdf/B-3_5078.pdf",
];

async function main(filepaths) {
  for (const filepath of filepaths) {
    // Extraer el día de emisión
    await extractDay(filepath);
    // Extraer el tipo
    await type([filepath]);
    // Extraer el comprobante
    await extractRecipe([filepath]);
    // Extraer el comprobante
    await extractCondition([filepath]);
    // Extraer el monto total
    await totalPrice([filepath]);
    console.log("-----------------------------------------");
  }
}

main(filepaths);
