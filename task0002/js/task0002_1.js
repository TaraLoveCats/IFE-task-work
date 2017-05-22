(function HobbyOpt() {
    var input = document.getElementById('input');
    var button = document.getElementById('button');
    var p = document.getElementById('response');

    function getUserInput() {
        return input.value.split(',');
    }

    function addEvent(element, event, listener) {
        event = event.replace(/^on/i, '').toLowerCase();
        if (element.addEventListener) {
            element.addEventListener(event, listener, false);
        }
        else if (element.attachEvent) {
            element.attachEvent("on" + event, listener);
        }
        else {
            element["on" + event] = listener;
        }
    }

    function uniqArray(arr) {
        arr.sort(function(a, b) {
            if (a === b) {
                return 0;
            }
            if (typeof a === typeof b) {
                return a < b ? -1 : 1;
            }
            return typeof a < typeof b ? -1 : 1;
         });
        for (var i = 0; i < arr.length; i++) {
            while (arr[i] === arr[i + 1]) {
                arr.splice(i + 1, 1);
            }
        }
        //排序后为空的在第一个，去除（不考虑有多个空格的情况）
        return arr[0] !== '' ? arr : arr.slice(1);
    }

    function onclick() {
        p.innerHTML = uniqArray(getUserInput());
    }

    addEvent(button, 'click', onclick);
})();
