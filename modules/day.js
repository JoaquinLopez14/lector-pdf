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
        const dia = fechaMatch[1];
        return { dia };
      } else {
        return { error: `No se encontró el dia` };
      }
    } else {
      return { error: `No se encontró la frase 'Fecha de Emisión:'` };
    }
  } catch (error) {
    return { error: `Error al leer el archivo: ${error.message}` };
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
