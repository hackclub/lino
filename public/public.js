$(function () {
  var socket = io();
  socket.on("push", (data) => render(data));

  socket.on("clear", () => render());
});

// all the js animcations, data display, go here
const render = (data) => {
  $("body").fadeOut();
  console.log(data)

  if (!$.isEmptyObject(data)) {
    setTimeout(() => {
      $("#name").text(data.name);
      $("#handle").text(data.handle);
      $("#admin").css("display", data.admin ? "inline" : "none");
      $("#profile").attr("src", data.profile || "/logo.svg");
      $("body").fadeIn();
    }, 1000);
  }
};
