const fs = require("fs");
const pdf = require("pdf-parse");

async function extractCondition(filepath) {
  try {
    const dataBuffer = fs.readFileSync(filepath);
    const data = await pdf(dataBuffer, { pagerender: renderPage });
    const texto = data.text;

    if (texto.includes("Consumidor Final")) {
      const condition = "Consumidor Final";
      return { condition };
    } else if (texto.includes("Exento")) {
      const condition = "Exento";
      return { condition };
    } else {
      const condition = "IVA Responsable Inscripto";
      return { condition };
    }
  } catch (error) {
    return { error: `Error al leer el archivos ${error.message}` };
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

module.exports = { extractCondition };
