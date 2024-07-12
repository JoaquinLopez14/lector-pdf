const fs = require("fs");
const pdf = require("pdf-parse");

async function extractRecipe(filepath) {
  try {
    const dataBuffer = fs.readFileSync(filepath);
    const data = await pdf(dataBuffer, { pagerender: renderPage });
    const texto = data.text;

    if (texto.includes("Comp. Nro:")) {
      const comprobante = /00003.*?([\d.,]+)/i.exec(texto);

      if (comprobante) {
        const comp = comprobante[0];
        return { comp };
      } else {
        return {
          error: `No se encontro el numero del comprobante ${error.message}`,
        };
      }
    } else {
      return { error: `No se pudo leer el comprobante ${error.message}` };
    }
  } catch (error) {
    return { error: `No se pudo leer el archivo${error.message}` };
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

module.exports = { extractRecipe };
