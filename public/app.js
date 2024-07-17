document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("uploadForm");
  const tableContainer = document.getElementById("table-container");
  const sortButton = document.getElementById("sortButton");
  const selectAllButton = document.getElementById("selectAll");
  const apply21Button = document.getElementById("apply21");
  const apply105Button = document.getElementById("apply105");
  const exportButton = document.getElementById("exportButton");

  let results = [];

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form);

    try {
      const response = await fetch("/process", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Error en la solicitud");
      }

      results = await response.json();
      const htmlTable = buildHtmlTable(results);
      tableContainer.innerHTML = htmlTable;
    } catch (error) {
      console.error("Error:", error);
    }
  });

  // Función para exportar la tabla a Excel
  function exportToExcel() {
    // Crear un nuevo libro de Excel
    const wb = XLSX.utils.book_new();

    // Obtener la tabla HTML
    const htmlTable = document.querySelector("#table-container table");

    // Crear una copia de la tabla sin la columna "Seleccionar"
    const clonedTable = htmlTable.cloneNode(true);

    // Remover la columna "Seleccionar" de la copia
    for (let row of clonedTable.rows) {
      row.deleteCell(0);
    }

    // Convertir la tabla clonada a una hoja de Excel
    const ws = XLSX.utils.table_to_sheet(clonedTable);

    // Añadir la hoja al libro de Excel
    XLSX.utils.book_append_sheet(wb, ws, "Facturas");

    // Guardar el libro como archivo Excel
    XLSX.writeFile(wb, "facturas.xlsx");
  }

  exportButton.addEventListener("click", exportToExcel);

  selectAllButton.addEventListener("click", () => {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach((checkbox) => {
      checkbox.checked = true;
    });
  });

  sortButton.addEventListener("click", () => {
    results.sort((a, b) => {
      const dayA = parseInt(a.day) || 0;
      const dayB = parseInt(b.day) || 0;

      if (dayA !== dayB) return dayA - dayB;

      const typeA = a.type === "A" ? 1 : 0;
      const typeB = b.type === "A" ? 1 : 0;
      if (typeA !== typeB) return typeA - typeB;

      const numA = parseInt(a.recipe.replace(/[^0-9]/g, ""));
      const numB = parseInt(b.recipe.replace(/[^0-9]/g, ""));
      return numA - numB;
    });

    const htmlTable = buildHtmlTable(results);
    tableContainer.innerHTML = htmlTable;
  });

  apply21Button.addEventListener("click", () => {
    const selectedRows = document.querySelectorAll(
      'input[type="checkbox"]:checked'
    );

    if (selectedRows.length === 0) {
      alert("Selecciona al menos una factura para aplicar el 21%");
      return;
    }

    selectedRows.forEach((checkbox) => {
      const rowIndex = checkbox.getAttribute("data-index");
      const selectedResult = results[rowIndex];

      if (!selectedResult) {
        console.error(
          "Error: No se encontró la factura seleccionada en los resultados."
        );
        return;
      }

      if (selectedResult.totalPrice) {
        const totalPrice = parseFloat(
          selectedResult.totalPrice.replace(",", ".")
        );

        if (!isNaN(totalPrice)) {
          const netoGravado21 = totalPrice / 1.21;
          const iva21 = netoGravado21 * 0.21;

          selectedResult.netoGravado21 = netoGravado21.toFixed(2);
          selectedResult.iva21 = iva21.toFixed(2);

          const htmlTable = buildHtmlTable(results);
          tableContainer.innerHTML = htmlTable;
        } else {
          console.error("Error: El precio total no es válido.");
        }
      } else {
        console.error(
          "Error: No se encontró el precio total para la factura seleccionada."
        );
      }
    });
  });

  apply105Button.addEventListener("click", () => {
    const selectedRows = document.querySelectorAll(
      'input[type="checkbox"]:checked'
    );

    if (selectedRows.length === 0) {
      alert("Selecciona al menos una factura para aplicar");
      return;
    }

    selectedRows.forEach((checkbox) => {
      const rowIndex = checkbox.getAttribute("data-index");
      const selectedResult = results[rowIndex];

      if (!selectedResult) {
        console.error("Error: No se encontro la factura solicitada.");
        return;
      }
      if (selectedResult.totalPrice) {
        const totalPrice = parseFloat(
          selectedResult.totalPrice.replace(",", ".")
        );

        if (!isNaN(totalPrice)) {
          const netoGravado105 = totalPrice / 1.105;
          const iva105 = netoGravado105 * 0.105;

          selectedResult.netoGravado105 = netoGravado105.toFixed(2);
          selectedResult.iva105 = iva105.toFixed(2);

          const htmlTable = buildHtmlTable(results);
          tableContainer.innerHTML = htmlTable;
        } else {
          console.error("Error: El precio total no es válido.");
        }
      } else {
        console.error(
          "Error: No se encontró el precio total para la factura seleccionada."
        );
      }
    });
  });

  function buildHtmlTable(results) {
    let htmlTable = `
      <table>
        <thead>
          <tr>
            <th>Seleccionar</th>
            <th>Día</th>
            <th>Tipo</th>
            <th>Recibo</th>
            <th>Condición</th>
            <th>CUIT</th>
            <th>Neto Gravado 21</th>
            <th>Neto Gravado 10,5</th>
            <th>IVA 21</th>
            <th>IVA 10,5</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
    `;

    results.forEach((result, index) => {
      htmlTable += `
        <tr>
          <td><input type="checkbox" data-index="${index}" /></td>
          <td>${result.day || "-"}</td>
          <td>${result.type || "-"}</td>
          <td>${result.recipe || "-"}</td>
          <td>${result.condition || "-"}</td>
          <td>${result.cuit || "-"}</td>
          <td>${result.netoGravado21 || "-"}</td>
          <td>${result.netoGravado105 || "-"}</td>
          <td>${result.iva21 || "-"}</td>
          <td>${result.iva105 || "-"}</td>
          <td>${result.totalPrice || "-"}</td>
        </tr>
      `;
    });

    htmlTable += `
        </tbody>
      </table>
    `;

    return htmlTable;
  }
});
