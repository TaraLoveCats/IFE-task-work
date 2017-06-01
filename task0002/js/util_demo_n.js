/**
 * 对数组进行去重操作，只考虑数组中元素为数字或字符串，返回一个去重后的数组
 *
 * @param  {Array} source 需要过滤相同项的数组
 * @return {Array}        过滤后的新数组
 */
function uniqArray(source) {
    var len = source.length,
        result = source.slice(0),
        i, datum;


    // 从后往前双重循环比较
    // 如果两个元素相同，删除后一个
    while (--len > 0) {
        datum = result[len];
        i = len;
        while (i--) {
            if (datum === result[i]) {
                result.splice(len, 1);
                break;
            }
        }
    }

    return result;
}

function each(arr, fn) {
    for (var i = 0, l = arr.length; i < l; i++) {
        fn(arr[i], i);
    }
}
/**
* 判断是否有某个className
* @param {HTMLElement} element 元素
* @param {string} className className
* @return {boolean}
*/
function hasClass(element, className) {
    var classNames = element.className;
    if (!classNames) {
        return false;
    }
    classNames = classNames.split(/\s+/);
    for (var i = 0, len = classNames.length; i < len; i++) {
        if (classNames[i] === className) {
            return true;
        }
    }
    return false;
}
/**
 * 很多同学肯定对于上面的代码看不下去，接下来，我们真正实现一个trim
 * 对字符串头尾进行空格字符的去除、包括全角半角空格、Tab等，返回一个字符串
 * 尝试使用一行简洁的正则表达式完成该题目
 *
 * @param  {string} source 目标字符串
 * @return {string} 删除两端空白字符后的字符串
 */
function trim(str) {

    var trimer = new RegExp("(^[\\s\\t\\xa0\\u3000]+)|([\\u3000\\xa0\\s\\t]+\x24)", "g");

    return String(str).replace(trimer, "");

}

function $(selector) {
    console.log("hello JS");
    var idReg = /^#([\w_\-]+)/;
    var classReg = /^\.([\w_\-]+)/;
    var tagReg = /^\w+$/i;
    // [data-log]
    // [data-log="test"]
    // [data-log=test]
    // [data-log='test']
    var attrReg = /(\w+)?\[([^=\]]+)(?:=(["'])?([^\]"']+)\3?)?\]/;

    // 不考虑'>' 、`~`等嵌套关系
    // 父子选择器之间用空格相隔54
    var context = document;

    function blank() {}

    function direct(part, actions) {
        actions = actions || {
            id: blank,
            className: blank,
            tag: blank,
            attribute: blank
        };
        var fn;
        var params = [].slice.call(arguments, 2);
        // id
        if (result = part.match(idReg)) {
            fn = 'id';
            params.push(result[1]);
        }
        // class
        else if (result = part.match(classReg)) {
            fn = 'className';
            params.push(result[1]);
        }
        // tag
        else if (result = part.match(tagReg)) {
            fn = 'tag';
            params.push(result[0]);
        }
        // attribute
        else if (result = part.match(attrReg)) {
            fn = 'attribute';
            var tag = result[1];
            var key = result[2];
            var value = result[4];
            params.push(tag, key, value);
        }
        return actions[fn].apply(null, params);
    }

    function find(parts, context) {
        var part = parts.pop();

        var actions = {
            id: function (id) {
                return [
                    document.getElementById(id)
                ];
            },
            className: function (className) {
                var result = [];
                if (context.getElementsByClassName) {
                    result = context.getElementsByClassName(className)
                }
                else {
                    var temp = context.getElementsByTagName('*');
                    for (var i = 0, len = temp.length; i < len; i++) {
                        var node = temp[i];
                        if (hasClass(node, className)) {
                            result.push(node);
                        }
                    }
                }
                return result;
            },
            tag: function (tag) {
                return context.getElementsByTagName(tag);
            },
            attribute: function (tag, key, value) {
                var result = [];
                var temp = context.getElementsByTagName(tag || '*');

                for (var i = 0, len = temp.length; i < len; i++) {
                    var node = temp[i];
                    if (value) {
                        var v = node.getAttribute(key);
                        (v === value) && result.push(node);
                    }
                    else if (node.hasAttribute(key)) {
                        result.push(node);
                    }
                }
                return result;
            }
        };

        var ret = direct(part, actions);

        // to array
        ret = [].slice.call(ret);

        return parts[0] && ret[0] ? filterParents(parts, ret) : ret;
    }

    function filterParents(parts, ret) {
        var parentPart = parts.pop();
        var result = [];

        for (var i = 0, len = ret.length; i < len; i++) {
            var node = ret[i];
            var p = node;

            while (p = p.parentNode) {
                var actions = {
                    id: function (el, id) {
                        return (el.id === id);
                    },
                    className: function (el, className) {
                         return hasClass(el, className);
                    },
                    tag: function (el, tag) {
                        return (el.tagName.toLowerCase() === tag);
                    },
                    attribute: function (el, tag, key, value) {
                        var valid = true;
                        if (tag) {
                            valid = actions.tag(el, tag);
                        }
                        valid = valid && el.hasAttribute(key);
                        if (value) {
                            valid = valid && (value === el.getAttribute(key))
                        }
                        return valid;
                    }
                };
                var matches = direct(parentPart, actions, p);

                if (matches) {
                    break;
                }
            }

            if (matches) {
                result.push(node);
            }
        }

        return parts[0] && result[0] ? filterParents(parts, result) : result;
    }

    var result = find(selector.split(/\s+/), context);
    console.log(result.tagName);
    return result;
}
// mini selector
function $(selector) {
    return document.querySelector(selector);
}
$.event = {
    listeners: []
};

$.event.addEvent = function(element, type, listener) {
    type = type.replace(/^on/i, '').toLowerCase();

    var lis = $.event.listeners;

    var realListener = function (e) {
        if (typeof listener === 'function') {
            listener.call(element, e);
        }
    };

    if (element.addEventListener) {
        element.addEventListener(type, realListener, false);
    }
    else if (element.attachEvent) {
        element.attachEvent('on' + type, realListener);
    }

    lis[lis.length] = [element, type, listener, realListener];

    return element;
};

$.on = function (selector, event, listener) {
    return $.event.addEvent($(selector), event, listener);
};
