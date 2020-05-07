$(function () {
  var socket = io();
  socket.on("push", (data) => render(data));

  socket.on("clear", () => render());
});

// all the js animcations, data display, go here
const render = (data) => {
  $("body").hide("slide", {direction: "down"});
  console.log(data)

  if (!$.isEmptyObject(data)) {
      $("#name").text(data.name);
      $("#handle").text(data.handle);
      $("#role").text(data.role);
      //$("#profile").attr("src", data.profile || "/logo.svg");
      $("body").show("slide", {direction: "down"}, 500).hide();
      $("body").fadeIn(500).dequeue(); 

      setTimeout(() => {
        $("body").hide("slide", {direction: "down"});
      }, 10000)
  }
};
