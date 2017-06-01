function $(selector) {
    var idReg = /^#([\w_\-]+)/;
    var classReg = /^\.([\w_\-]+)/;
    var tagReg = /^\w+$/i;
    //看不懂下面这个
    var attrReg = /(\w+)?\[([^=\]]+)(?:=(["'])?([^\]"']+)\3?)?\]/;

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
        //convert to array
        var params = [].slice.call(arguments, 2);
        //id
        if (result = part.match(idReg)) {
            fn = 'id';
            //捕获分组下标从1开始
            params.push(result[1]);
        }
        //class
        else if (result = part.match(classReg)) {
            fn = 'className';
            params.push(result[1]);
        }
        //tag
        else if (result = part.match(tagReg)) {
            fn = 'tag';
            params.push(result[0]);
        }
        //attribute
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
        // part 是 selector 中的最后一个
        var part = parts.pop();
        //这些函数返回的都是 array []
        var actions = {
            id: function (id) {
                return [
                    document.getElementById(id)
                ];
            },
            className: function (className) {
                var result = [];
                if (context.getElementsByClassName) {
                    result = context.getElementsByClassName(className);
                }
                //IE 9 之前的版本不支持 getElementsByClassName 方法
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
                        //这是个什么语法? if 代替语句？
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
        //convert to array
        ret = [].slice.call(ret);
        // if (parts[0] && ret[0]) {
        //
        //     var r_ele = filterParents(parts, ret);
        //     alert('this is 1 ' + r_ele.tagName);
        //     return r_ele;
        // } else {
        //     var r_ele = ret[0];
        //     alert('this is 2 ' + r_ele.tagName);
        //     return r_ele;
        // }
        return parts[0] && ret[0] ? filterParents(parts, ret) : ret;
    }

    function filterParents(parts, ret) {
        var parentPart = parts.pop();
        var result = [];

        for (var i = 0, len = ret.length; i < len; i++) {
            var node = ret[i];
            var p = node;
            //向上遍历
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
            //while 循环结束
            if (matches) {
                result.push(node);
            }
        }
        //for 循环结束
        return parts[0] && result[0] ? filterParents(parts, result) : result;
    }

    var result = find(selector.split(/\s+/), context);
    return result;
}
