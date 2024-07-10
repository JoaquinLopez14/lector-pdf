const fs = require("fs");
const pdf = require("pdf-parse");

async function readPDF(filepath) {
  const dataBuffer = fs.readFileSync(filepath);

  try {
    const data = await pdf(dataBuffer, { pagerender: renderPage });
    const texto = data.text;

    // Imprimir 100 caracteres antes y después de "Importe Total"
    const contextRegex = /.{0,100}Importe\s+Total.{0,10}/i;
    const contextMatch = contextRegex.exec(texto);

    if (contextMatch) {
      console.log("Contexto alrededor de 'Importe Total':");
      console.log(contextMatch[0]);

      const fragmentos = contextMatch[0].split(" ");
      fragmentos.forEach((fragmento, index) => {
        console.log(`Fragmento ${index}: ${fragmento.trim()}`);
      });
    } else {
      console.log("No se encontró 'Importe Total' en el texto.");
    }

    const importeTotalRegex = /Importe\s+Total:\s*\$?\s*([\d.,]+)/i;
    const match = importeTotalRegex.exec(texto);
  } catch (error) {
    console.error("Error al leer el PDF", error);
    return null;
  }
}

function renderPage(pageData) {
  // Extraer la primera página
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

const filePath = "A-3_547.pdf";
readPDF(filePath).then((importeTotal) => {
  console.log("Importe Total de la primera página del PDF:");
  console.log(importeTotal);
});

/* Facturas A working with
    const contextRegex = /.{0,100}Importe\s+Total.{0,10}/i;
    const contextMatch = contextRegex.exec(texto);
*/
