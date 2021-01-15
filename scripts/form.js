$(".ui.dropdown").dropdown();
$(".ui.dropdown").dropdown("set selected", "USA");

function autocomplete(inp, arr) {
  /*the autocomplete function takes two arguments,
  the text field element and an array of possible autocompleted values:*/
  var currentFocus;
  /*execute a function when someone writes in the text field:*/
  inp.addEventListener("input", function (e) {
    var a,
      b,
      i,
      val = this.value;
    /*close any already open lists of autocompleted values*/
    closeAllLists();
    if (!val) {
      return false;
    }
    currentFocus = -1;
    console.log(this.id);
    /*create a DIV element that will contain the items (values):*/
    a = document.createElement("DIV");
    a.setAttribute("id", "autocomplete-list");
    a.setAttribute("class", "autocomplete-items");
    /*append the DIV element as a child of the autocomplete container:*/
    this.parentNode.appendChild(a);
    /*for each item in the array...*/
    for (i = 0; i < arr.length; i++) {
      /*check if the item starts with the same letters as the text field value:*/

      /*create a DIV element for each matching element:*/
      b = document.createElement("DIV");
      /*make the matching letters bold:*/
      b.innerHTML =
        "<strong>" + arr[i].label.substr(0, val.length) + "</strong>";
      b.innerHTML += arr[i].label.substr(val.length);
      /*insert a input field that will hold the current array item's value:*/
      b.innerHTML +=
        "<input type='hidden' value='" + JSON.stringify(arr[i]) + "'>";
      /*execute a function when someone clicks on the item value (DIV element):*/
      b.addEventListener("click", function (e) {
        /*insert the value for the autocomplete text field:*/
        let dets = JSON.parse(this.getElementsByTagName("input")[0].value);

        if (dets.match) {
          inp.value = dets.details.houseNumber + " " + dets.details.street;
          $("input[name=state]")[0].value = dets.details.state;
          $("input[name=postalCode]")[0].value = dets.details.postalCode;
          $(".ui.dropdown").dropdown("set selected", dets.details.countryCode);
        } else {
          inp.setCustomValidity("Please enter a valid home address");
        }

        /*close the list of autocompleted values,
              (or any other open lists of autocompleted values:*/
        closeAllLists();
      });
      a.appendChild(b);
    }
  });
  inp.addEventListener("keydown", function (e) {
    var x = document.getElementById(this.id + "autocomplete-list");
    if (x) x = x.getElementsByTagName("div");
    if (e.keyCode == 40) {
      currentFocus++;

      addActive(x);
    } else if (e.keyCode == 38) {
      currentFocus--;

      addActive(x);
    } else if (e.keyCode == 13) {
      e.preventDefault();
      if (currentFocus > -1) {
        if (x) x[currentFocus].click();
      }
    }
  });
  function addActive(x) {
    if (!x) return false;
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = x.length - 1;
    /*add class "autocomplete-active":*/
    x[currentFocus].classList.add("autocomplete-active");
  }
  function removeActive(x) {
    /*a function to remove the "active" class from all autocomplete items:*/
    for (var i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
  }
  function closeAllLists(elmnt) {
    var x = document.getElementsByClassName("autocomplete-items");
    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }
  /*execute a function when someone clicks in the document:*/
  document.addEventListener("click", function (e) {
    closeAllLists(e.target);
  });
}

var AUTOCOMPLETION_URL =
    "https://autocomplete.geocoder.ls.hereapi.com/6.2/suggest.json",
  ajaxRequest = new XMLHttpRequest(),
  query = "";

/**
 * If the text in the text box  has changed, and is not empty,
 * send a geocoding auto-completion request to the server.
 *
 * @param {Object} textBox the textBox DOM object linked to this event
 * @param {Object} event the DOM event which fired this listener
 */
function autoCompleteListener(textBox, event) {
  if (query != textBox.value) {
    if (textBox.value.length >= 1) {
      /**
       * A full list of available request parameters can be found in the Geocoder Autocompletion
       * API documentation.
       *
       */
      var params =
        "?" +
        "query=" +
        encodeURIComponent(textBox.value) + // The search text which is the basis of the query
        "&maxresults=5" + // The upper limit the for number of suggestions to be included
        // in the response.  Default is set to 5.
        "&apikey=" +
        "QvaMnQZF7tcc68Fn9Gm9jBk3oZUPbd2_iePMz9PeUkc";
      ajaxRequest.open("GET", AUTOCOMPLETION_URL + params);
      ajaxRequest.send();
    }
  }
  query = textBox.value;
}

function onAutoCompleteSuccess() {
  addSuggestionsToPanel(this.response); // In this context, 'this' means the XMLHttpRequest itself.
}

/**
 * This function will be called if a communication error occurs during the XMLHttpRequest
 */
function onAutoCompleteFailed() {
  autocomplete(
    document.getElementById("auto-complete"),
    "Auto complete error please enter details manually."
  );
}

// Attach the event listeners to the XMLHttpRequest object
ajaxRequest.addEventListener("load", onAutoCompleteSuccess);
ajaxRequest.addEventListener("error", onAutoCompleteFailed);
ajaxRequest.responseType = "json";

function addSuggestionsToPanel(response) {
  console.log(response);
  let arr = [];

  response.suggestions.map((x) => {
    arr.push({
      label: x.label,
      details: x.address,
      match: x.matchLevel === "houseNumber",
    });
  });
  autocomplete(document.getElementById("auto-complete"), arr);
}
