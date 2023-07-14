// Get references to the buttons and element
const showRoute = document.getElementById("showRoute");
const hideRoute = document.getElementById("hideRoute");
const canvasRoute = document.getElementById("canvasRoute");
const canvasSearch = document.getElementById("widget-search");

// Add a click event listener to the show button
showRoute.addEventListener("click", function () {
     canvasRoute.classList.remove("d-none");
     canvasSearch.classList.add("d-none");
});
hideRoute.addEventListener("click", function () {
     canvasRoute.classList.add("d-none");
     canvasSearch.classList.remove("d-none");
});
