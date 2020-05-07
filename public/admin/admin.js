$("#lookup").keypress(function (event) {
  var keycode = event.keyCode ? event.keyCode : event.which;
  if (keycode == "13") {
    $(".suggestion").first().click();
    $("#role").focus();
  }
});

$("#clear").on("click", () => {
  fetch("/clear");
  togglePushButton(true);
});

String.prototype.titleCase = function () {
  let str = this.toLowerCase().split(" ");
  for (let i = 0; i < str.length; i++) {
    str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
  }
  return str.join(" ");
};

let PUSHLOCK = false;

window.addEventListener("load", function () {
  $("#lookup").val("");

  $("#pushdata").submit(function () {
    if (!PUSHLOCK) {
      var formdata = $(this).serialize();

      // failsafe
      PUSHLOCK = true;
      $.ajax({
        type: "POST",
        url: "/push",
        data: formdata,
      });

      let cd = 10;

      $("#push").text(`Hiding in 10...`);
      togglePushButton(false);
      let timer = setInterval(() => {
        cd--;
        $("#push").text(`Hiding in ${cd}...`);

        if (cd <= 0) {
          clearInterval(timer);
          PUSHLOCK = false;
          togglePushButton(true);
        }
      }, 1000);

      return false;
    }
  });

  // Add a keyup event listener to our input element
  var name_input = document.getElementById("lookup");
  name_input.addEventListener("keyup", function (event) {
    hinter(event);
  });

  // create one global XHR object
  // so we can abort old requests when a new one is make
  window.hinterXHR = new XMLHttpRequest();
});

// Autocomplete for form
function hinter(event) {
  // retireve the input element
  var input = event.target;

  // retrieve the datalist element
  var huge_list = document.getElementById("prefill");

  // minimum number of characters before we start to generate suggestions
  var min_characters = 2;

  if (input.value.length < min_characters) {
    return;
  } else {
    // abort any pending requests
    window.hinterXHR.abort();

    window.hinterXHR.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        // We're expecting a json response so we convert it to an object
        var response = JSON.parse(this.responseText);

        // clear any previously loaded options in the datalist
        huge_list.innerHTML = "";

        for (var item in response.records) {
          // Create a new <option> element.
          var option = document.createElement("a");
          option.setAttribute("class", "suggestion");
          option.setAttribute(
            "onclick",
            `fill("${response.records[item].fields.Name}", "${response.records[item].fields.Role}", "${response.records[item].fields["Slack Handle"]}")`
          );
          option.innerHTML = response.records[item].fields.Name;

          // attach the option to the datalist element
          huge_list.appendChild(option);
        }
      }
    };

    window.hinterXHR.open("GET", "/lookup/" + input.value, true);
    window.hinterXHR.send();
  }
}

let fill = (name, role, handle) => {
  $("#name").val(name);
  $("#role").val(role);
  $("#handle").val(handle);
  $("#prefill").html("Start typing. Suggestions will appear here.");
};

let togglePushButton = (enable) => {
  if (enable) {
    $("#push").text(`Push!`);
    $("#push").addClass("red");
    $("#push").attr("disabled", false);
    $("#push").css("cursor", "pointer");
  } else {
    $("#push").removeClass("red");
    $("#push").attr("disabled", true);
    $("#push").css("cursor", "not-allowed");
  }
};
