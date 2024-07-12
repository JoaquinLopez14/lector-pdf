const fs = require("fs");
const pdf = require("pdf-parse");

async function extractCondition(filepaths) {
  for (const filepath of filepaths) {
    const dataBuffer = fs.readFileSync(filepath);

    try {
      const data = await pdf(dataBuffer, { pagerender: renderPage });
      const texto = data.text;

      if (texto.includes("Consumidor Final")) {
        console.log(
          `La condicion frente al IVA de la factura ${filepath} es Consumidor Final`
        );
      } else if (texto.includes("Exento")) {
        console.log(
          `La condicion frente al IVA de la factura ${filepath} es Exento`
        );
      } else {
        console.log(
          `La condicion frente al IVA de la factura ${filepath} es IVA Responsable Inscripto`
        );
      }
    } catch (error) {
      console.error(`Error al leer el archivo ${filepath}`, error);
    }
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
