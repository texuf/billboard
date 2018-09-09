//Make the DIV element draggagle:

function dragElement(elmnt, onDrag) {

  function initialize(el) {
    elmnt.onmousedown = dragMouseDown;
    el.addEventListener("touchstart", handleStart, false);
    el.addEventListener("touchend", handleEnd, false);
    el.addEventListener("touchcancel", handleCancel, false);
    el.addEventListener("touchmove", handleMove, false);
  
  }

  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0, top = 0, left = 0;
  var touchId = null;
  if (document.getElementById(elmnt.id + "header")) {
    /* if present, the header is where you move the DIV from:*/
    initialize(document.getElementById(elmnt.id + "header"))
  } else {
    /* otherwise, move the DIV from anywhere inside the DIV:*/
    initialize(elmnt)
  }

  function start(clientX, clientY) {
    //console.log("touch start start", clientX, clientY)
    pos3 = clientX;
    pos4 = clientY;
  }

  function drag(clientX, clientY) {
    // calculate the new cursor position:
    //console.log("touch drag drag", clientX, clientY)
    pos1 = pos3 - clientX;
    pos2 = pos4 - clientY;
    pos3 = clientX;
    pos4 = clientY;
    top = elmnt.offsetTop - pos2
    left = elmnt.offsetLeft - pos1
    // set the element's new position:
    elmnt.style.top = top + "px";
    elmnt.style.left = left + "px";
    onDrag(top, left)
  }

  function handleStart(evt) {
    evt.preventDefault();
    var touches = evt.changedTouches;
    //console.log("handle start", touches.length, touchId, touches)
    if (touches.length > 0 && touchId == null) {
      touchId = touches[0].identifier;
      //console.log("touch start", touches[0].identifier, touches[0].pageX, touches[0].pageY)
      start(touches[0].pageX, touches[0].pageY)
    }
  }

  function handleCancel(evt) {
    evt.preventDefault();
    var touches = evt.changedTouches;
    for (var i = 0; i < touches.length; i++) {
      if (touches[i].identifier == touchId) {
        //console.log("touch cancel");
        touchId = null;
      }
    }
  }

  function handleEnd(evt) {
    evt.preventDefault();
    var touches = evt.changedTouches;
    for (var i = 0; i < touches.length; i++) {
      if (touches[i].identifier == touchId) {
        //console.log("touch end");
        touchId = null;
      }
    }
  }

  function handleMove(evt) {
    evt.preventDefault();
    var touches = evt.changedTouches;
    for (var i = 0; i < touches.length; i++) {
      if (touches[i].identifier == touchId) {
        //console.log("touch move", touches[i].identifier, touches[i].pageX, touches[i].pageY)
        drag(touches[i].pageX, touches[i].pageY)
      }
    }
  }

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    //console.log("drag mouse down")
    // get the mouse cursor position at startup:
    start(e.clientX, e.clientY);
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    //console.log("element drag")
    drag(e.clientX, e.clientY)
  }

  function closeDragElement() {
    /* stop moving when mouse button is released:*/
    document.onmouseup = null;
    document.onmousemove = null;
  }
}