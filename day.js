const fs = require("fs");
const pdf = require("pdf-parse");

async function extractDay(filepath) {
  try {
    const dataBuffer = fs.readFileSync(filepath);
    const data = await pdf(dataBuffer, { pagerender: renderPage });
    const texto = data.text;

    if (texto.includes("Fecha de Emisión:")) {
      const fechaMatch = /\s*(\d{2})\/\d{2}\/\d{4}/i.exec(texto);
      if (fechaMatch) {
        const dia = fechaMatch[1]; // Captura solo el día
        console.log(`Día de emisión de la factura ${filepath}:`, dia);
      } else {
        console.log(`No se encontró el día de emisión en ${filepath}`);
      }
    } else {
      console.log(`No se encontró la frase 'Fecha de Emisión:' en ${filepath}`);
    }
  } catch (error) {
    console.error(`Error al leer el archivo ${filepath}`, error);
  }
}

function renderPage(pageData) {
  if (pageData.pageIndex === 0) {
    return pageData.getTextContent().then((textContent) => {
      let text = "";
      textContent.items.forEach((item) => {
        text += item.str + " ";
      });
      return text;
    });
  }
  return "";
}

module.exports = { extractDay };
