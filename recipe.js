const fs = require("fs");
const pdf = require("pdf-parse");

async function extractRecipe(filepaths) {
  for (const filepath of filepaths) {
    const dataBuffer = fs.readFileSync(filepath);

    try {
      const data = await pdf(dataBuffer, { pagerender: renderPage });
      const texto = data.text;

      if (texto.includes("Comp. Nro:")) {
        const comprobante = /00003.*?([\d.,]+)/i.exec(texto);

        if (comprobante) {
          const comp = comprobante[0];
          console.log(`El comprobante de la factura ${filepath} es:`, comp);
        } else {
          console.log("No se encontro un comprobante");
        }
      } else {
        console.log("No puedo leer el numero de comprobante");
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

module.exports = { extractRecipe };
