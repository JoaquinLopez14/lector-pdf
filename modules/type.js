const fs = require("fs");
const pdf = require("pdf-parse");

async function extractType(filepath) {
  try {
    const dataBuffer = fs.readFileSync(filepath);
    const data = await pdf(dataBuffer, { pagerender: renderPage });
    const texto = data.text;

    if (texto.includes("COD. 006")) {
      const type = "B";
      return { type };
    } else if (texto.includes("COD. 01")) {
      const type = "A";
      return { type };
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

module.exports = { extractType };
