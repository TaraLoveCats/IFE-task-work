// 判断arr是否为一个数组，返回一个bool值
function isArray(arr) {
    return Object.prototype.toString.call(arg) === "[Object Array]";
}

// 判断fn是否为一个函数，返回一个bool值
function isFunction(fn) {
    return typeof fn === "function";
}

// 使用递归来实现一个深度克隆，可以复制一个目标对象，返回一个完整拷贝
// 被复制的对象类型会被限制为数字、字符串、布尔、日期、数组、Object对象。不会包含函数、正则对象等
/*
*这个
*函数
*还有
*问题
*/
function isPlain(obj) {
    var hasOwnProperty = Object.prototype.hasOwnProperty,
        key;
    if (!obj
        || Object.prototype.toString.call(obj) !== "[Object Object]"
        || !('isPrototypeOf' in obj)
        ) {
        return false;
    }

    // 下面两个 暂时还没看懂

    if (obj.constructor
        && !hasOwnProperty.call(obj, "constructor"))
        && !hasOwnProperty.call(obj.constructor.prototype, "isPrototypeOf")) {
        return false;
    }
    //空循环，目的是使key到最后一项，如果有继承属性，这一项一定是继承属性
    for ( key in obj) {}
    return key === undefined || hasOwnProperty.call(obj, key);

}

function cloneObject(src) {
    var result = src,
        i,
        len;
    if (!src
        || src instanceof Number
        || src instanceof String
        || src instanceof Boolean) {
        return result;
    } else if (isArray(src)) {
        result = [];
        var resultLen = 0;
        for (i = 0, len = src.length; i < len; i++) {
            result[resultLen++] = cloneObject(src[i]);
        }
    } else if (isPlain(src)) {
        result = {};
        for (i in src) {
            if (src.hasOwnProperty(i)){
                result[i] = cloneObject(src[i]);
            }
        }
    }
    return result;
}

// 对数组进行去重操作，只考虑数组中元素为数字或字符串，返回一个去重后的数组
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
    return arr;
}

// 实现一个简单的trim函数，用于去除一个字符串，头部和尾部的空白字符,假定空白字符只有半角空格、Tab
// 练习通过循环，以及字符串的一些基本方法，分别扫描字符串str头部和尾部是否有连续的空白字符，并且删掉他们，最后返回一个完成去除的字符串
function simpleTrim(str) {
    var i = 0,
        j = str.length - 1;
    while (str[i] === ' ') {
        i++;
    }
    var str_s = i;
    while (str[j] === ' ') {
        j--;
    }
    var str_e = j;
    return str.slice(str_s, str_e + 1);
 }

// 对字符串头尾进行空格字符的去除、包括全角半角空格、Tab等，返回一个字符串
// 尝试使用一行简洁的正则表达式完成该题目
function trim(str) {
    return str.match(/\S\w*(?:\s\w*)*\S/);
}

// 实现一个遍历数组的方法，针对数组中每一个元素执行fn函数，并将数组索引和元素作为参数传递
// 其中fn函数可以接受两个参数：item和index
function each(arr, fn) {
    for (var i = 0; i < arr.length; i++) {
        fn(arr[i], i);
    }
}

// 获取一个对象里面第一层元素的数量，返回一个整数
function getObjectLength(obj) {
    var count = 0;
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            count++;
        }
    }
    return count;
}

// 判断是否为邮箱地址(并不是很完全的答案)
function isEmail(emailStr) {
    var pattern = /^([\w\.\-\+])+\@([\w\-]+\.)+([\w]{2,10})+$/;
    return pattern.test(emailStr);
}

// 判断是否为手机号
function isMobilePhone(phone) {
    return /^1\d{10}$/.test(phone);
}

// 为element增加一个样式名为newClassName的新样式
function hasClass(element, className) {
    var name = element.className.match(/\S+/g) || [];
    if (name.indexOf(className) !== -1) {
        return true;
    }
    return false;
}

function addClass(element, newClassName) {
    if (!hasClass(element, newClassName)) {
        element.className = trim(element.className + " " + newClassName);
    }
}

// 移除element中的样式oldClassName
function removeClass(element, oldClassName) {
    if (hasClass(element, oldClassName)) {
        element.className = trim(element.className.repalce(oldClassName, " "));
    }
}

// 判断siblingNode和element是否为同一个父元素下的同一级的元素，返回bool值
function isSiblingNode(element, siblingNode) {
    return element.parentNode === siblingNode.parentNode;
}

// 获取element相对于浏览器窗口的位置，返回一个对象{x, y} (我没有考虑滚动条)
function getPosition(element) {
    var x = 0;
    var y = 0;
    var current = element;

    while (current !== null) {
        x += current.offsetLeft;
        y += current.offsetTop;
        current = current.offsetParent;
    }
    return {
        x: x,
        y: y
    };
}

// 实现一个简单的Query
/*
*这个方法只能处理一个selector
*/
function singleQuery(selector) {
    var selector = trim(selector);
    var element = null;
    var symbol = selector[i].match(/\W/);

    switch (symbol) {
        case "#":
            element = document.getElementById(selector.slice(1));
            break;
        case ".":
            element = document.getElementsByClassName(selector.slice(1))[0];
            break;
        case "[":
            var index = slector.indexOf("=");
            var allElements = document.getElementsByTagName("*");
            if (index !== -1) {
                var key = selector.slice(1, index);
                var value = selector.slice(index + 1);
                for (var j = 0; j < allElements.length; j++) {
                    if (allElements[j].getAttribute(key) === value) {
                        element = allElements[j];
                        break;
                    }
                }
            } else if {
                var key = selector.slice(1);
                for (var j = 0; j < allElements.length; j++) {
                    if (allElements.[j]) {
                        element = allElements[j];
                        break;
                    }
                }
            }
            break;
            default:
                element = document.getElementsByTagName(selector)[0];
                break;
        }
    return element;
}

// 给一个element绑定一个针对event事件的响应，响应函数为listener
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

// 移除element对象对于event事件发生时执行listener的响应
function removeEvent(element, event, listener) {
    event = event.replace(/^on/i, '').toLowerCase();
    if (element.removeEventListener) {
        element.removeEventListener(event, listener, false);
    }
    else if (element.detachEvent) {
        element.detachEvent("on" + event, listener);
    }
    else {
        element["on" + type] = null;
    }
}

// 实现对click事件的绑定
function addClickEvent(element, listener) {
    addEvent(element, "click", listener);
}

// 实现对于按Enter键时的事件绑定
function addEnterEvent(element, listener) {
    addEvent(element, "keydown", function(e) {
        if (e.keyCode === 13) {
            listener.call(element, event);
        }
    })
}

//事件代理 (element代理tag)
function delegateEvent(element, tag, eventName, listener) {
    addEvent(element, eventName, function(e) {
        var event = e || window.event;
        var target = e.target || e.srcElement;
        if (target && target.tagName === tag.toUpperCase()) {
            listener.call(target, event);
        }
    });
}

//估计有同学已经开始吐槽了，函数里面一堆$看着晕啊，那么接下来把我们的事件函数做如下封装改变：
$.on(selector, event, listener) {
    addEvent($(selector), event, listener);
}

$.click(selector, listener) {
    addClickEvent($(selector), listener);
}

$.un(selector, event, listener) {
    removeEventListener($(selector), event, listener);
}

$.delegate(selector, tag, event, listener) {
    delegateEvent($(selector), tag, eventName, listener);
}
