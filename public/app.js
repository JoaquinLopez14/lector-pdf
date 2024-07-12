document
  .getElementById("uploadForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const formData = new FormData();
    const pdfFiles = document.getElementById("pdf").files;

    for (let i = 0; i < pdfFiles.length; i++) {
      formData.append("pdf", pdfFiles[i]);
    }

    const response = await fetch("/process", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    document.getElementById("result").innerHTML = JSON.stringify(
      result,
      null,
      2
    );
  });
