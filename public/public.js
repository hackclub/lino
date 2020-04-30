$(function () {
  var socket = io();
  socket.on("push", (data) => render(data));

  socket.on("clear", () => render())
});

// all the js animcations, data display, go here
const render = (data) => {
    if (data) {
        console.log(data)
        $("#overlay").html(JSON.stringify(data))
        $("#overlay").show();
    } else {
        $("#overlay").hide();
    }
}