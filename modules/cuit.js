const fs = require("fs");
const { format } = require("path");
const pdf = require("pdf-parse");

async function extractCuit(filepath) {
  try {
    const dataBuffer = fs.readFileSync(filepath);
    const data = await pdf(dataBuffer, { pagerender: renderPage });
    const texto = data.text;

    let cuit;
    if (texto.includes("Doc.:")) {
      cuit = " ";
      return { cuit };
    } else {
      const cuitRegex = /33714336989.*?([\d.,]+)/i.exec(texto);
      cuit = cuitRegex[1];

      cuit = formatCuit(cuit);

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

function formatCuit(cuit) {
  if (cuit.length === 11) {
    return `${cuit.slice(0, 2)}-${cuit.slice(2, 10)}-${cuit.slice(10)}`;
  }
  return cuit;
}

module.exports = { extractCuit };
