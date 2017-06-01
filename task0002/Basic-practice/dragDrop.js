var dragDrop = function () {
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
            addEvent(document, 'mousedown', handleEvent);
            addEvent(document, 'mousemove', handleEvent);
            addEvent(document, 'mouseup', handleEvent);
        },

        disable: function () {
            removeEvent(document, 'mousedown', handleEvent);
            removeEvent(document, 'mousemove', handleEvent);
            removeEvent(document, 'mouseup', handleEvent);
        }
    }
} ();
