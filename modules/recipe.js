const fs = require("fs");
const pdf = require("pdf-parse");

async function extractRecipe(filepath) {
  try {
    const dataBuffer = fs.readFileSync(filepath);
    const data = await pdf(dataBuffer, { pagerender: renderPage });
    const texto = data.text;

    if (texto.includes("Comp. Nro:")) {
      const comprobanteRegex = /00003\s+(\d{8})/i;
      const match = comprobanteRegex.exec(texto);

      if (match) {
        let comp = `00003 ${match[1]}`;
        comp = formatComp(comp);
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

function formatComp(comp) {
  const parts = comp.split(" ");
  if (parts.length === 2) {
    const firstPart = parseInt(parts[0], 10).toString(); // Elimina ceros a la izquierda
    const secondPart = parts[1].slice(-4); // Toma los últimos 4 dígitos

    return `${firstPart}--${secondPart}`;
  }
  return comp;
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
