document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("uploadForm");
  const tableContainer = document.getElementById("table-container");
  const sortButton = document.getElementById("sortButton");
  const selectAllButton = document.getElementById("selectAll");
  const apply21Button = document.getElementById("apply21");
  const apply105Button = document.getElementById("apply105");

  let results = []; // Guardar los resultados globalmente

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
      return dayA - dayB;
    });
    const htmlTable = buildHtmlTable(results);
    tableContainer.innerHTML = htmlTable;
  });

  apply21Button.addEventListener("click", () => {
    // Obtener las facturas seleccionadas
    const selectedRows = document.querySelectorAll(
      'input[type="checkbox"]:checked'
    );

    if (selectedRows.length === 0) {
      alert("Selecciona al menos una factura para aplicar el 21%");
      return;
    }

    // Iterar sobre las facturas seleccionadas y aplicar el 21%
    selectedRows.forEach((checkbox) => {
      const rowIndex = checkbox.getAttribute("data-index");
      const selectedResult = results[rowIndex];

      if (!selectedResult) {
        console.error(
          "Error: No se encontró la factura seleccionada en los resultados."
        );
        return;
      }

      // Realizar operaciones para aplicar el 21%
      if (selectedResult.totalPrice) {
        const totalPrice = parseFloat(
          selectedResult.totalPrice.replace(",", ".")
        ); // Convertir a número

        if (!isNaN(totalPrice)) {
          const netoGravado21 = totalPrice / 1.21;
          const iva21 = netoGravado21 * 0.21;

          // Actualizar la tabla con los resultados
          selectedResult.netoGravado21 = netoGravado21.toFixed(2); // Redondear a 2 decimales
          selectedResult.iva21 = iva21.toFixed(2); // Redondear a 2 decimales

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
    const selectRows = document.querySelectorAll(
      'input[type="checkbox"]:checked'
    );

    if (selectRows.length === 0) {
      alert("Selecciona al menos una factura para aplicar");
      return;
    }

    selectRows.forEach((checkbox) => {
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

          // Actualizar la tabla con los resultados
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
                      <th>Total Price</th>
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
