$("#update").on("click", () => {
  fetch("/lookup/" + $("#email").val())
    .then((response) => response.json())
    .then((data) => {
      $("#name").val(data.name.titleCase());
      $("#handle").val("@" + data.handle);
      $("#admin").val(data.admin ? "admin" : "");
      $("#profile").val(data.profile);
      $("#profile-preview").attr("src", data.profile);
    });
});

$("#email").keypress(function (event) {
  var keycode = event.keyCode ? event.keyCode : event.which;
  if (keycode == "13") {
    $("#update").click();
  }
});

String.prototype.titleCase = function() {
  let str = this.toLowerCase().split(" ");
  for (let i = 0; i < str.length; i++) {
    str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
  }
  return str.join(" ");
};