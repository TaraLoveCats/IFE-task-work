function dragDrop() {
    var dragging = null,
        diffX = 0,
        diffY = 0;

    function handleEvent(event) {
        event = event || window.event;
        var target = event.target || event.srcElement;

        switch(event.type) {
            case 'mousedown':
                if (target.className.indexOf('draggable') > -1) {
                    dragging = target;
                    diffX = event.clientX - target.offsetLeft;
                    diffY = event.clientY - target.offsetTop;
                }
                break;

            case 'mousemove':
                if (dragging !== null) {
                    dragging.style.left = (event.clientX - diffX) + 'px';
                    dragging.style.top = (event.clientY - diffY) + 'px';
                }
                break;

            case 'mouseup':
                dragging = null;
                break;
        }
    }

    return {
        enable: function () {
            addEvent($('.left-box'), 'mousedown', handleEvent);
            addEvent($('.left-box'), 'mousemove', handleEvent);
            addEvent($('.left-box'), 'mouseup', handleEvent);

            addEvent($('.right-box'), 'mousedown', handleEvent);
            addEvent($('.right-box'), 'mousemove', handleEvent);
            addEvent($('.right-box'), 'mouseup', handleEvent);
        },

        disable: function () {
            removeEvent($('.left-box'), 'mousedown', handleEvent);
            removeEvent($('.left-box'), 'mousemove', handleEvent);
            removeEvent($('.left-box'), 'mouseup', handleEvent);

            removeEvent($('.right-box'), 'mousedown', handleEvent);
            removeEvent($('.right-box'), 'mousemove', handleEvent);
            removeEvent($('.right-box'), 'mouseup', handleEvent);
        }
    }
}

var result = dragDrop();
result.enable();
