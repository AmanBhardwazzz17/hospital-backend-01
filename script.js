const inputs = document.querySelectorAll("input");
const light = document.querySelector(".light");

inputs.forEach(input => {
  input.addEventListener("focus", () => {
    light.style.opacity = "1";
  });

  input.addEventListener("blur", () => {
    light.style.opacity = "0";
  });
});