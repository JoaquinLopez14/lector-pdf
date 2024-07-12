const fs = require("fs");
const pdf = require("pdf-parse");

async function type(filepaths) {
  for (const filepath of filepaths) {
    const dataBuffer = fs.readFileSync(filepath);

    try {
      const data = await pdf(dataBuffer, { pagerender: renderPage });
      const texto = data.text;

      if (texto.includes("COD. 006")) {
        const type = "B";
        console.log(`La factura ${filepath} es tipo`, type);
      } else if (texto.includes("COD. 01")) {
        const type = "A";
        console.log(`La factura ${filepath} es tipo`, type);
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

module.exports = { type };
