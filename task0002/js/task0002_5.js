var dragging = null,
    parent = null,
    firstMove = true,
    diffX = 0,
    diffY = 0,
    z = 1;
var leftBox = $('.left-box'),
    rightBox = $('.right-box'),
    rightX = $('.right-box').offsetLeft;
var containerLeft = $('.container').offsetLeft,
    containerTop = $('.container').offsetTop;


init();
enable();

function init() {
    initialPos(leftBox);
    initialPos(rightBox);
}

function initialPos(box) {
    for (var i = 0; i < box.children.length; i++) {
        box.children[i].style.top = 55 * i + 2 + 'px';
    }
}

function handleEvent(event) {
    event = event || window.event;
    var target = event.target || event.srcElement;

    switch(event.type) {
        case 'mousedown':
            if (target.className.indexOf('draggable') > -1) {
                dragging = target;

                parent = dragging.parentNode;
                firstMove = true;

                dragging.style.opacity = 0.7;
                dragging.style.zIndex = z++;

                diffX = event.clientX - containerLeft - target.offsetLeft;
                diffY = event.clientY - containerTop - target.offsetTop;
            }
            break;

        case 'mousemove':
            if (dragging !== null) {

                if (firstMove) {
                    parent.removeChild(dragging);
                    $('.container').appendChild(dragging);
                }
                firstMove = false;

                if (outOfScreen(event.clientX, event.clientY, event)) {
                    console.log('out of screen');
                    
                    dragging.parentNode.removeChild(dragging);
                    parent.appendChild(dragging);

                    if(parent.className.indexOf('left-box') !== -1) {
                        dragging.style.left = 2 + 'px';
                    }
                    else if (parent.className.indexOf('right-box') !== -1) {
                        dragging.style.left = rightX + 2 + 'px';
                    }
                    initialPos(parent);
                }
                else {
                    dragging.style.left = (event.clientX - containerLeft - diffX) + 'px';
                    dragging.style.top = (event.clientY - containerTop - diffY) + 'px';

                    initialPos(parent);
                }
            }
            break;

            case 'mouseup':
                if (dragging !== null) {
                    console.log(parent.className);
                    console.log(dragging.parentNode.className);

                    dragging.style.opacity = 1;
                    //这里不能再写parent了， 因为在mousemove中firstMove已经remove过一次了
                    dragging.parentNode.removeChild(dragging);


                    if (isInBox(event.clientX, event.clientY, leftBox)) {
                        leftBox.appendChild(dragging);
                        dragging.style.left = 2 + 'px';
                        initialPos(leftBox);
                    }
                    else if (isInBox(event.clientX, event.clientY, rightBox)) {
                        rightBox.appendChild(dragging);
                        dragging.style.left = rightX + 2 + 'px';
                        initialPos(rightBox);
                    }
                    else {
                        parent.appendChild(dragging);
                        if(parent.className.indexOf('left-box') !== -1) {
                            dragging.style.left = 2 + 'px';
                        }
                        else if (parent.className.indexOf('right-box') !== -1) {
                            dragging.style.left = rightX + 2 + 'px';
                        }
                        initialPos(parent);
                    }
                }
                dragging = null;
                break;
    }
}

function outOfScreen(x, y, e) {
    var maxWidth = document.documentElement.clientX;
    var maxHeight = document.documentElement.clientY;
    return e.clientX < 0 || e.clientX > maxWidth || e.clientY < 0 || e.clientY > maxHeight;
}

function isInBox(x, y, box) {
    var x0 = getPosition(box).x;
    var x1 = getPosition(box).x + box.offsetWidth;
    var y0 = getPosition(box).y;
    var y1 = getPosition(box).y + box.offsetHeight;

    return x > x0 && x < x1 && y > y0 && y < y1;
}

function enable() {
    addEvent(document, 'mousedown', handleEvent);
    addEvent(document, 'mousemove', handleEvent);
    addEvent(document, 'mouseup', handleEvent);
}

function disable() {
    removeEvent(document, 'mousedown', handleEvent);
    removeEvent(document, 'mousemove', handleEvent);
    removeEvent(document, 'mouseup', handleEvent);
}
