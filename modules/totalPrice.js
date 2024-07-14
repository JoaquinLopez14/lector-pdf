const fs = require("fs");
const pdf = require("pdf-parse");

async function totalPrice(filepath) {
  try {
    const dataBuffer = fs.readFileSync(filepath);
    const data = await pdf(dataBuffer, { pagerender: renderPage });
    const texto = data.text;

    if (texto.includes("COD. 01") && texto.includes("Importe Total")) {
      const numberMatch = /Importe\s+Total.*?([\d.,]+)/i.exec(texto);
      if (numberMatch) {
        let importeTotal = numberMatch[1];
        importeTotal = importeTotal.replace(",", ".");
        return { importeTotal };
      } else {
        return { error: `Error al obtener el Importe Total ${error.message}` };
      }
    } else if (texto.includes("COD. 006") && texto.includes("Importe Total")) {
      const contextRegex = /.{0,70}Importe\s+Total.{0,4}/i;
      const contextMatch = contextRegex.exec(texto);

      if (contextMatch) {
        const context = contextMatch[0];
        const numbers = context.match(/[\d.,]+/g);

        if (numbers) {
          const maxNumber = numbers.reduce((max, num) => {
            return num.length > max.length ? num : max;
          }, "");
          const importeTotal = maxNumber.replace(",", ".");
          return { importeTotal };
        } else {
          return { error: `Error al obtener numeros ${error.message}` };
        }
      }
    } else {
      return { error: `Error al obtener el Importe Total ${error.message}` };
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

module.exports = { totalPrice };
