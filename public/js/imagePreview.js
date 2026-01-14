const input = document.getElementById("imagesInput");
const preview = document.getElementById("preview");

if (input && preview) {
  input.addEventListener("change", () => {
    preview.innerHTML = "";

    Array.from(input.files).forEach(file => {
      const reader = new FileReader();

      reader.onload = e => {
        const img = document.createElement("img");
        img.src = e.target.result;
        img.style.width = "150px";
        img.style.height = "100px";
        img.style.objectFit = "cover";
        img.style.borderRadius = "8px";
        img.style.border = "1px solid #ddd";

        preview.appendChild(img);
      };

      reader.readAsDataURL(file);
    });
  });
}
