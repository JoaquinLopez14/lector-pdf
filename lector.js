const fs = require("fs");
const pdf = require("pdf-parse");

const filepaths = [
  "A-3_550.pdf",
  "A-3_472.pdf",
  "A-3_547.pdf",
  "B-3_5108.pdf",
  "B-3_5133.pdf",
  "B-3_5078.pdf",
];

async function totalPrice(filepaths) {
  for (const filepath of filepaths) {
    const dataBuffer = fs.readFileSync(filepath);

    try {
      const data = await pdf(dataBuffer, { pagerender: renderPage });
      const texto = data.text;

      if (texto.includes("COD. 01") && texto.includes("Importe Total")) {
        const numberMatch = /Importe\s+Total.*?([\d.,]+)/i.exec(texto);
        if (numberMatch) {
          const importeTotal = numberMatch[1];
          console.log(`Importe Total de la factura ${filepath}:`, importeTotal);
        } else {
          console.log(
            `No se encontró el número al lado de 'Importe Total' en el archivo ${filepath}`
          );
        }
      } else if (
        texto.includes("COD. 006") &&
        texto.includes("Importe Total")
      ) {
        const contextRegex = /.{0,70}Importe\s+Total.{0,4}/i;
        const contextMatch = contextRegex.exec(texto);

        if (contextMatch) {
          const context = contextMatch[0];
          const numbers = context.match(/[\d.,]+/g);

          if (numbers) {
            const maxNumber = numbers.reduce((max, num) => {
              return num.length > max.length ? num : max;
            }, "");
            console.log(`Importe Total de la factura ${filepath}:`, maxNumber);
          } else {
            console.log(
              `No se encontraron números en el archivo ${filepath} (Factura B)`
            );
          }
        }
      } else {
        console.log(
          `El archivo ${filepath} no incluye el código esperado o 'Importe Total'`
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

totalPrice(filepaths);
