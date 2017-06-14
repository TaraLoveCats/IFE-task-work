var dragging = null,
    diffX = 0,
    diffY = 0;

function handleMouseDown(e) {
    event = e || window.event;
    var target = event.target || event.srcElement;

    if (target.className.indexOf('draggable') > -1) {
        dragging = target;
        dragging.style.opacity = 0.7;
        diffX = event.clientX - target.offsetLeft;
        diffY = event.clientY - target.offsetTop;
    }
}

function handleMouseMove(e) {
    if (dragging !== null) {
        dragging.style.left = (event.clientX - diffX) + 'px';
        dragging.style.top = (event.clientY - diffY) + 'px';
    }
}

function handleMouseUp(e) {
    dragging.style.opacity = 1;
    dragging = null;
}

function enable() {
    addEvent(document, 'mousedown', handleMouseDown);
    addEvent(document, 'mousemove', handleMouseMove);
    addEvent(document, 'mouseup', handleMouseUp);
}

function disable() {
    removeEvent(document, 'mousedown', handleMouseDown);
    removeEvent(document, 'mousemove', handleMouseMove);
    removeEvent(document, 'mouseup', handleMouseUp);
}

enable();
console.log('rightbox: ' + $('.right-box').offsetLeft);
console.log('leftbox: ' + $('.left-box').offsetLeft);
