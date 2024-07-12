const fs = require("fs");
const pdf = require("pdf-parse");

async function extractCuit(filepath) {
  try {
    const dataBuffer = fs.readFileSync(filepath);
    const data = await pdf(dataBuffer, { pagerender: renderPage });
    const texto = data.text;

    if (texto.includes("Doc.:")) {
      const cuit = " ";
      return { cuit };
    } else {
      const cuitRegex = /33714336989.*?([\d.,]+)/i.exec(texto);
      const cuit = cuitRegex[1];

      return { cuit };
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

module.exports = { extractCuit };
