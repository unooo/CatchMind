var clickFlag = false;
var startX = 0, startY = 0; // 드래깅동안, 처음 마우스가 눌러진 좌표

function draw(startX, startY, curX, curY) {
    context.beginPath();
    context.moveTo(startX, startY);
    context.lineTo(curX, curY);
    context.stroke();
    let color = document.getElementById('color').value;//colorForTouch(touches[i]);
    context.strokeStyle=color;
    drawSocekt.emit("sendDraw", { startX, startY, curX, curY })
}
function onMove(e) {
   // console.log(canvas.width, canvas.height);

    if (clickFlag == false)
        return;
    var curX = e.offsetX, curY = e.offsetY;
    draw(startX, startY, curX, curY);
    startX = curX; startY = curY;
}

function onDown(e) {
    let color = document.getElementById('color').value;
    drawSocekt.emit('setColor',color);
    startX = e.offsetX; startY = e.offsetY;
    console.log(startX, startY);
    clickFlag = true;
}

function onUp(e) {
    clickFlag = false;
}
var ongoingTouches = [];
function startup() {
    var el = document.getElementById('mainCanvas');
    el.addEventListener("touchstart", handleStart, false);
    el.addEventListener("touchend", handleEnd, false);
    el.addEventListener("touchcancel", handleCancel, false);
    el.addEventListener("touchmove", handleMove, false);
    log("initialized.");
}
function handleStart(evt) {
    evt.preventDefault();
    log("touchstart.");
    var el = document.getElementById('mainCanvas');
    var ctx = el.getContext("2d");
    var touches = evt.changedTouches;

    for (var i = 0; i < touches.length; i++) {
        log("touchstart:" + i + "...");
        ongoingTouches.push(copyTouch(touches[i]));
        let color = document.getElementById('color').value;//colorForTouch(touches[i]);
        ctx.beginPath();
        ctx.arc(touches[i].pageX, touches[i].pageY, 4, 0, 2 * Math.PI, false);  // a circle at the start
        ctx.fillStyle = color;
        ctx.fill();
        drawSocekt.emit('setColor',color);
        log("touchstart:" + i + ".");
    }
}
function handleMove(evt) {
    evt.preventDefault();
    var el = document.getElementById('mainCanvas');
    var ctx = el.getContext("2d");
    var touches = evt.changedTouches;

    for (var i = 0; i < touches.length + 10; i++) {

        let color = document.getElementById('color').value;//colorForTouch(touches[i]);
        var idx = ongoingTouchIndexById(touches[i].identifier);

        if (idx >= 0) {

            log("continuing touch " + idx);
            ctx.beginPath();
            log("ctx.moveTo(" + (ongoingTouches[idx].pageX - el.offsetLeft) + ", " + (ongoingTouches[idx].pageY - el.offsetTop) + ");");
            ctx.moveTo(ongoingTouches[idx].pageX - el.offsetLeft, ongoingTouches[idx].pageY - el.offsetTop);
            log("ctx.lineTo(" + (touches[i].pageX - el.offsetLeft) + ", " + (touches[i].pageY - el.offsetTop) + ");");
            ctx.lineTo(touches[i].pageX - el.offsetLeft, touches[i].pageY - el.offsetTop);
            ctx.lineWidth = 4;
            ctx.strokeStyle = color;
            ctx.stroke();
            draw(ongoingTouches[idx].pageX - el.offsetLeft, ongoingTouches[idx].pageY - el.offsetTop, touches[i].pageX - el.offsetLeft, touches[i].pageY - el.offsetTop);
            ongoingTouches.splice(idx, 1, copyTouch(touches[i]));  // swap in the new touch record
            log(".");
        } else {
            log("can't figure out which touch to continue");
        }
    }
}
function handleEnd(evt) {
    evt.preventDefault();
    log("touchend");
    var el = document.getElementById('mainCanvas');
    var ctx = el.getContext("2d");
    var touches = evt.changedTouches;
    for (var i = 0; i < touches.length; i++) {
        let color = document.getElementById('color').value;//colorForTouch(touches[i]);
        console.log('color'+color);
        var idx = ongoingTouchIndexById(touches[i].identifier);
        if (idx >= 0) {
            ctx.lineWidth = 4;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(ongoingTouches[idx].pageX - el.offsetLeft, ongoingTouches[idx].pageY - el.offsetTop);
            ctx.lineTo(touches[i].pageX - el.offsetLeft, touches[i].pageY - el.offsetTop);
            ctx.fillRect(touches[i].pageX - el.offsetLeft - 4, touches[i].pageY - el.offsetTop - 4, 8, 8);  // and a square at the end
            ongoingTouches.splice(idx, 1);  // remove it; we're done
        } else {
            log("can't figure out which touch to end");
        }
    }
}

function handleCancel(evt) {
    evt.preventDefault();
    log("touchcancel.");
    var touches = evt.changedTouches;
    for (var i = 0; i < touches.length; i++) {
        var idx = ongoingTouchIndexById(touches[i].identifier);
        ongoingTouches.splice(idx, 1);  // remove it; we're done
    }
}
function clearCanvasFunc() {
    var ctx = canvas.getContext('2d');
    // 픽셀 정리
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // 컨텍스트 리셋
    ctx.beginPath();
  }
function colorForTouch(touch) {
    var r = touch.identifier % 16;
    var g = Math.floor(touch.identifier / 3) % 16;
    var b = Math.floor(touch.identifier / 7) % 16;
    r = r.toString(16); // make it a hex digit
    g = g.toString(16); // make it a hex digit
    b = b.toString(16); // make it a hex digit
    var color = "#" + r + g + b;
    log("color for touch with identifier " + touch.identifier + " = " + color);
    return color;
}
function copyTouch(touch) {
    return { identifier: touch.identifier, pageX: touch.pageX, pageY: touch.pageY };
}
function ongoingTouchIndexById(idToFind) {
    for (var i = 0; i < ongoingTouches.length; i++) {
        var id = ongoingTouches[i].identifier;
        if (id == idToFind) {
            return i;
        }
    }
    return -1;    // not found
}
function log(msg) {
    var p = document.getElementById('log');
    p.innerHTML = msg + "\n" + p.innerHTML;
}