let marker;
let results = []; // Array to store search results
let titikTujuan;
let titikAwal;
let routingLayer;
let searchLayer;
let point;
let url = "http://demo.inovamap.com/nominatim/";
// let url = "https://nominatim.openstreetmap.org/";

//search
let searchInput = document.getElementById("search-input");
searchInput.addEventListener("keyup", function (event) {
     if (event.keyCode === 13) {
          event.preventDefault();
          search();
     }
});

//nominatim
function search() {
     // map.removeLayer(titikAwal);
     // map.removeLayer(titikTujuan);
     let searchInput = document.getElementById("search-input").value;

     if (!searchInput || searchInput.trim() === "") {
          // Clear previous results
          clearResultsList();
          return; // Exit the function early
     }

     // Clear previous results
     document.getElementById("results-list").innerHTML = "";
     results = [];

     $.ajax({
          url: url + "search.php",
          data: "q=" + searchInput + "&format=jsonv2&polygon_geojson=1",
          dataType: "JSON",
          success: function (data) {
               results = data; // Store the search results in the array
               console.log(results);

               document.getElementById("geojson").innerHTML = JSON.stringify(results, null, 4);

               if (results.length > 0) {
                    for (var i = 0; i < results.length; i++) {
                         var htmlData = "";
                         var result = results[i];
                         let lat = result.lat;
                         let lon = result.lon;
                         let gjson = result.geojson;
                         let bb = result.boundingbox;
                         // Create a list item for each search result
                         let listItem = document.createElement("li");
                         listItem.classList.add("list-item");

                         htmlData += "<span>" + result["display_name"] + "</span><span>" + result["category"] + "</span>";
                         listItem.innerHTML = htmlData;

                         // Add the list item to the results list
                         document.getElementById("results-list").appendChild(listItem);

                         listItem.onclick = function () {
                              map.setView([lat, lon], 17);
                              // map.fitBounds(bb);

                              if (marker) {
                                   map.removeLayer(marker);
                              }
                              marker = L.marker([lat, lon]).addTo(map);
                              console.log(gjson);

                              if (searchLayer) {
                                   map.removeLayer(searchLayer);
                              }
                              searchLayer = L.geoJson(gjson);
                              searchLayer.addTo(map);
                         };

                         // console.log(result.geojson);
                    }
               } else {
                    document.getElementById("results-list").innerHTML = "Kosong";
               }
          },
          error: function (xhr, status, error) {
               var err = eval("(" + xhr.responseText + ")");
               alert(err.Message);
          },
     });

     //json
     $.ajax({
          url: url + "search.php",
          data: "format=jsonv2&q=" + searchInput,
          dataType: "JSON",
          success: function (data) {
               console.log(data);

               document.getElementById("json").innerHTML = JSON.stringify(data, null, 4);
          },
          error: function (xhr, status, error) {
               var err = eval("(" + xhr.responseText + ")");
               alert(err.Message);
          },
     });
}

function clearResultsList() {
     let resultsList = document.getElementById("results-list");
     while (resultsList.firstChild) {
          resultsList.removeChild(resultsList.firstChild);
     }
}

function createListItemOnClickHandler(lat, lon) {
     return function () {
          // Center the map on the selected result
          map.setView([lat, lon], 13);

          // Add a marker at the selected location
          if (marker) {
               map.removeLayer(marker);
          }
          marker = L.marker([lat, lon]).addTo(map);
     };
}

function disableMapClick() {
     map.dragging.disable();
     map.off("click");
}

function getUserLocation() {
     // if (map.hasLayer(marker)) {
     //      map.removeLayer(marker);
     // }

     if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(function (position) {
               let latitude = position.coords.latitude;
               let longitude = position.coords.longitude;

               if (marker) {
                    map.removeLayer(marker);
               }

               if (titikAwal) {
                    map.removeLayer(titikAwal);
               }

               $.ajax({
                    url: url + "reverse.php",
                    data: "lat=" + latitude + "&lon=" + longitude + "&format=json",
                    dataType: "JSON",
                    success: function (data) {
                         console.log(data);

                         let locationInput = document.getElementById("locationInput");
                         locationInput.value = data.display_name;
                    },
                    error: function (textStatus, errorThrown) {
                         callbackfn("Error getting the data");
                    },
               });

               titikAwal = L.marker([latitude, longitude], {
                    draggable: true,
               }).addTo(map);

               titikAwal.on("dragend", function (event) {
                    let markerLatLng = titikAwal.getLatLng();
                    $.ajax({
                         url: url + "reverse.php",
                         data: "lat=" + markerLatLng.lat + "&lon=" + markerLatLng.lng + "&format=json",
                         dataType: "JSON",
                         success: function (data) {
                              console.log(data);

                              let locationInput = document.getElementById("locationInput");
                              locationInput.value = data.display_name;
                         },
                         error: function (textStatus, errorThrown) {
                              callbackfn("Error getting the data");
                         },
                    });
               });
          });
     } else {
          alert("Geolocation is not supported by your browser.");
     }
}

//openrouteservice
function getRoute() {
     let start = titikAwal.getLatLng();
     let end = titikTujuan.getLatLng();

     console.log(start, end);

     $.ajax({
          url: "http://demo.inovamap.com:8080/ors/v2/directions/driving-car",
          data: "start=" + start.lng + "," + start.lat + "&end=" + end.lng + "," + end.lat,
          dataType: "JSON",
          success: function (data) {
               console.log(data);

               routingLayer = L.geoJson(data);
               routingLayer.addTo(map);
          },
          error: function (textStatus, errorThrown) {},
     });
}

// reverse
function reverse() {
     let markerReverse;
     let lat = document.getElementById("reverseLat").value;
     let lon = document.getElementById("reverseLon").value;

     $.ajax({
          url: url + "reverse.php",
          data: "lat=" + lat + "&lon=" + lon + "&format=jsonv2",
          dataType: "JSON",
          success: function (data) {
               console.log(data);

               document.getElementById("json").innerHTML = JSON.stringify(data, null, 4);

               if (marker) {
                    map.removeLayer(marker);
               }

               marker = L.marker([lat, lon]).addTo(map);
          },
          error: function (xhr, status, error) {
               var err = eval("(" + xhr.responseText + ")");
               alert(err.Message);
          },
     });

     // document.getElementById("linkApi").innerHTML = url + "reverse.php?lat=" + lat + "&lon=" + lon + "&format=jsonv2";
     // document.getElementById("linkApi").innerHTML = url + "reverse.php?lat=" + lat + "&lon=" + lon + "&format=geojson";
}
//reverse
function enableMapClick() {
     let mapClickable = true;
     map.dragging.enable();

     map.on("click", function (e) {
          let lat1 = e.latlng.lat;
          let lng1 = e.latlng.lng;
          if (mapClickable) {
               if (marker) {
                    map.removeLayer(marker);
               }
               if (point) {
                    map.removeLayer(point);
               }

               $.ajax({
                    url: url + "reverse.php",
                    data: "lat=" + lat1 + "&lon=" + lng1 + "&format=jsonv2",
                    dataType: "JSON",
                    success: function (data) {
                         console.log(data);

                         let reverseLat = document.getElementById("reverseLat");
                         let reverseLon = document.getElementById("reverseLon");

                         // inputElement.placeholder = data.display_name;
                         reverseLat.value = data.lat;
                         reverseLon.value = data.lon;

                         document.getElementById("json").innerHTML = JSON.stringify(data, null, 4);

                         var htmlData = "";
                         var result = data;
                         let lat = result.lat;
                         let lon = result.lon;
                         // Create a list item for each search result

                         $(".list-item").remove();

                         let listItem = document.createElement("li");
                         listItem.classList.add("list-item");

                         htmlData += "<span>" + result["display_name"] + "</span><span>" + result["category"] + "</span>";
                         listItem.innerHTML = htmlData;

                         // Add the list item to the results list

                         document.getElementById("results-list").appendChild(listItem);

                         //Hasil reverse osm
                         if (point) {
                              map.removeLayer(point);
                         }
                         point = L.circle([result.lat, result.lon]).addTo(map);
                         point.bindPopup("Hasil Reverse");
                         point.on("mouseover", function (e) {
                              this.openPopup();
                         });
                         point.on("mouseout", function (e) {
                              this.closePopup();
                         });
                         //Hasil reverse osm

                         listItem.onclick = function () {
                              map.setView([lat, lon], 17);

                              if (marker) {
                                   map.removeLayer(marker);
                              }
                              marker = L.marker([lat, lon]).addTo(map);
                         };
                    },
                    error: function (xhr, status, error) {
                         var err = eval("(" + xhr.responseText + ")");
                         alert(err.Message);
                    },
               });

               $.ajax({
                    url: url + "reverse.php",
                    data: "lat=" + lat1 + "&lon=" + lng1 + "&format=geojson&polygon_geojson=1",
                    dataType: "JSON",
                    success: function (data) {
                         console.log(data);

                         document.getElementById("geojson").innerHTML = JSON.stringify(data, null, 4);
                    },
                    error: function (xhr, status, error) {
                         var err = eval("(" + xhr.responseText + ")");
                         alert(err.Message);
                    },
               });

               marker = L.marker(e.latlng).addTo(map);

               // marker.on("dragend", function (event) {
               //      let markerLatLng = marker.getLatLng();
               //      $.ajax({
               //           url: url + "reverse.php",
               //           data: "lat=" + markerLatLng.lat + "&lon=" + markerLatLng.lng + "&format=jsonv2",
               //           dataType: "JSON",
               //           success: function (data) {
               //                console.log(data);

               //                reverseLat.value = data.lat;
               //                reverseLon.value = data.lon;

               //                document.getElementById("json").innerHTML = JSON.stringify(data, null, 4);
               //           },
               //           error: function (xhr, status, error) {
               //                var err = eval("(" + xhr.responseText + ")");
               //                alert(err.Message);
               //           },
               //      });
               // });
          }
     });
}
