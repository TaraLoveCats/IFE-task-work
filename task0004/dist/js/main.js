define('util', [], function () {
    var $ = function (selector) {
        var idReg = /^#([\w_\-]+)/;
        var classReg = /^\.([\w_\-]+)/;
        var tagReg = /^\w+$/i;
        var attrReg = /(\w+)?\[([^=\]]+)(?:=(["'])?([^\]"']+)\3?)?\]/;
        var context = document;
        function blank() {
        }
        function direct(part, actions) {
            actions = actions || {
                id: blank,
                className: blank,
                tag: blank,
                attribute: blank
            };
            var fn;
            var params = [].slice.call(arguments, 2);
            if (result = part.match(idReg)) {
                fn = 'id';
                params.push(result[1]);
            } else if (result = part.match(classReg)) {
                fn = 'className';
                params.push(result[1]);
            } else if (result = part.match(tagReg)) {
                fn = 'tag';
                params.push(result[0]);
            } else if (result = part.match(attrReg)) {
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
                    return [document.getElementById(id)];
                },
                className: function (className) {
                    var result = [];
                    if (context.getElementsByClassName) {
                        result = context.getElementsByClassName(className);
                    } else {
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
                            v === value && result.push(node);
                        } else if (node.hasAttribute(key)) {
                            result.push(node);
                        }
                    }
                    return result;
                }
            };
            var ret = direct(part, actions);
            ret = [].slice.call(ret);
            return parts[0] && ret[0] ? filterParents(parts, ret) : ret[0];
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
                            return el.id === id;
                        },
                        className: function (el, className) {
                            return hasClass(el, className);
                        },
                        tag: function (el, tag) {
                            return el.tagName.toLowerCase() === tag;
                        },
                        attribute: function (el, tag, key, value) {
                            var valid = true;
                            if (tag) {
                                valid = actions.tag(el, tag);
                            }
                            valid = valid && el.hasAttribute(key);
                            if (value) {
                                valid = valid && value === el.getAttribute(key);
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
            return parts[0] && result[0] ? filterParents(parts, result) : result[0];
        }
        var result = find(selector.split(/\s+/), context);
        return result;
    };
    var isArray = function (arr) {
        return Object.prototype.toString.call(arr) === '[object Array]';
    };
    var isFunction = function (fn) {
        return Object.prototype.toString.call(fn) === '[object Function]';
    };
    var isPlain = function (obj) {
        var hasOwnProperty = Object.prototype.hasOwnProperty, key;
        if (!obj || Object.prototype.toString.call(obj) !== '[object Object]' || !('isPrototypeOf' in obj)) {
            return false;
        }
        if (obj.constructor && !hasOwnProperty.call(obj, 'constructor') && !hasOwnProperty.call(obj.constructor.prototype, 'isPrototypeOf')) {
            return false;
        }
        for (key in obj) {
        }
        return key === undefined || hasOwnProperty.call(obj, key);
    };
    var cloneObject = function (src) {
        var result = src, i, len;
        if (!src || src instanceof Number || src instanceof String || src instanceof Boolean) {
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
                if (src.hasOwnProperty(i)) {
                    result[i] = cloneObject(src[i]);
                }
            }
        }
        return result;
    };
    var uniqArray = function (arr) {
        arr.sort(function (a, b) {
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
    };
    var uniqArray1 = function (arr) {
        var obj = {}, result = [];
        for (var i = 0, len = arr.length; i < len; i++) {
            var key = arr[i];
            if (!obj[key]) {
                result.push(key);
                obj[key] = true;
            }
        }
        return result;
    };
    var uniqArray2 = function (arr) {
        var obj = {};
        for (var i = 0, len = arr.length; i < len; i++) {
            obj[arr[i]] = true;
        }
        return Object.keys(obj);
    };
    var simpleTrim = function (str) {
        var i = 0, j = str.length - 1;
        while (str[i] === ' ') {
            i++;
        }
        while (str[j] === ' ') {
            j--;
        }
        if (i > j) {
            return '';
        }
        return str.slice(i, j + 1);
    };
    var trim = function (str) {
        return str.match(/\S+.+\S/);
    };
    var trim1 = function (str) {
        var trimer = new RegExp('(^[\\s\\t\\xa0\\u3000]+)|([\\u3000\\xa0\\s\\t]+$)', 'g');
        return String(str).replace(trimer, '');
    };
    var each = function (arr, fn) {
        for (var i = 0, len = arr.length; i < len; i++) {
            fn(arr[i], i);
        }
    };
    var getObjectLength = function (obj) {
        var count = 0;
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                count++;
            }
        }
        return count;
    };
    var isEmail = function (emailStr) {
        var pattern = /^([\w\.\-\+])+\@([\w\-]+\.)+([\w]{2,10})+$/;
        return pattern.test(emailStr);
    };
    var isMobilePhone = function (phone) {
        return /^1[3|5|8]\d{10}$/.test(phone);
    };
    var hasClass = function (element, className) {
        var names = element.className;
        if (!names) {
            return false;
        }
        names = names.split(/\s+/);
        for (var i = 0, len = names.length; i < len; i++) {
            if (names[i] === className) {
                return true;
            }
        }
        return false;
    };
    var addClass = function (element, newClassName) {
        if (!hasClass(element, newClassName)) {
            element.className = trim(element.className + ' ' + newClassName);
        }
    };
    var removeClass = function (element, oldClassName) {
        if (hasClass(element, oldClassName)) {
            element.className = trim(element.className.replace(oldClassName, ' '));
        }
    };
    var isSiblingNode = function (element, siblingNode) {
        return element.parentNode === siblingNode.parentNode;
    };
    var getPosition = function (element) {
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
    };
    var addEvent = function (element, event, listener) {
        event = event.replace(/^on/i, '').toLowerCase();
        if (element.addEventListener) {
            element.addEventListener(event, listener, false);
        } else if (element.attachEvent) {
            element.attachEvent('on' + event, listener);
        } else {
            element['on' + event] = listener;
        }
    };
    var removeEvent = function (element, event, listener) {
        event = event.replace(/^on/i, '').toLowerCase();
        if (element.removeEventListener) {
            element.removeEventListener(event, listener, false);
        } else if (element.detachEvent) {
            element.detachEvent('on' + event, listener);
        } else {
            element['on' + type] = null;
        }
    };
    var addClickEvent = function (element, listener) {
        addEvent(element, 'click', listener);
    };
    var addEnterEvent = function (element, listener) {
        addEvent(element, 'keydown', function (e) {
            if (e.keyCode === 13) {
                listener.call(element, event);
            }
        });
    };
    var delegateEvent = function (element, tag, eventName, listener) {
        console.log('in delegateEvent');
        addEvent(element, eventName, function (e) {
            var event = e || window.event;
            var target = e.target || e.srcElement;
            if (target && target.tagName === tag.toUpperCase()) {
                console.log('if matched');
                listener.call(target, event);
            }
        });
    };
    var delegateDelEvent = function (element, aClassName, eventName, listener) {
        addEvent(element, eventName, function (e) {
            var event = e || window.event;
            var target = e.target || e.srcElement;
            if (target && target.className.indexOf(aClassName) !== -1) {
                listener.call(target, event);
            }
        });
    };
    console.log(typeof delegateDelEvent);
    $.on = function (selector, event, listener) {
        addEvent($(selector), event, listener);
    };
    $.click = function (selector, listener) {
        addClickEvent($(selector), listener);
    };
    $.un = function (selector, event, listener) {
        removeEventListener($(selector), event, listener);
    };
    $.delegate = function (selector, tag, event, listener) {
        delegateEvent($(selector), tag, event, listener);
    };
    var isIE = function () {
        return /MSIE ([^;]+)/.test(navigator.userAgent) ? parseFloat(RegExp.$1) || document.documentMode : -1;
    };
    var setCookie = function (cookieName, cookieValue, expiredays) {
        var expires = new Date();
        if (typeof expiredays === 'number') {
            expires.setTime(expires.getTime() + expiredays * 24 * 60 * 60 * 1000);
            expires = expires.toGMTString();
        }
        document.cookie = encodeURIComponent(cookieName) + '=' + encodeURIComponent(cookieValue) + '; expires=' + expires + '; path=/';
    };
    var getCookie = function (cookieName) {
        var name = cookieName + '=';
        var decodedCookie = decodeURIComponent(document.cookie);
        var parts = decodedCookie.split(';');
        for (var i = 0, len = parts.length; i < len; i++) {
            var part = trim(parts[i]);
            if (part.indexOf(name) === 0) {
                return part.slice(name.length, part.length);
            }
        }
        return '';
    };
    var ajax = function (url, options) {
        var options = options || {};
        var data = stringifyData(options.data || {});
        var type = (options.type || 'GET').toUpperCase();
        var xhr;
        try {
            if (type === 'GET' && data) {
                url += (url.indexof('?') === -1 ? '?' : '&') + data;
                data = null;
            }
            xhr = createXHR();
            xhr.open(type, url, true);
            xhr.onreadystatechange = stateChangeHandler;
            if (type === 'POST') {
                xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            }
            xhr.setRequestHeader('X-Request-With', 'XMLHttpRequest');
            xhr.send(data);
        } catch (ex) {
            fire('fail');
        }
        return xhr;
        function stringifyData(data) {
            var param = [];
            for (var key in data) {
                if (data.hasOwnProperty(key)) {
                    param.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
                }
            }
            return param.join('&');
        }
        function createXHR() {
            if (window.XMLHttpRequest) {
                return new XMLHttpRequest();
            } else {
                return new ActiveXObject('Microsoft.XMLHTTP');
            }
        }
        function stateChangeHandler() {
            var stat;
            if (xhr.readyState === 4) {
                try {
                    stat = xhr.status;
                } catch (ex) {
                    fire('fail');
                    return;
                }
                fire(stat);
                if (stat >= 200 && stat < 300 || stat === 304 || stat === 1223) {
                    fire('success');
                } else {
                    fire('fail');
                }
                window.setTimeOut(function () {
                    xhr.onreadystatechange = new Function();
                    xhr = null;
                }, 0);
            }
        }
        function fire(type) {
            type = 'on' + type;
            var handler = options[type];
            if (!isFunction(handler)) {
                return;
            }
            if (type === 'onfail') {
                handler(xhr);
            } else {
                try {
                    xhr.responseText;
                } catch (e) {
                    return handler(xhr);
                }
                handler(xhr, xhr.responseText);
            }
        }
    };
    var escape = function (str) {
        str = str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/`/g, '&#x60;').replace(/\//g, '&#x2f;');
        return str;
    };
    return {
        $: $,
        isArray: isArray,
        isFunction: isFunction,
        cloneObject: cloneObject,
        uniqArray: uniqArray,
        trim: trim,
        each: each,
        getObjectLength: getObjectLength,
        isEmail: isEmail,
        isMobilePhone: isMobilePhone,
        hasClass: hasClass,
        addClass: addClass,
        removeClass: removeClass,
        isSiblingNode: isSiblingNode,
        getPosition: getPosition,
        addEvent: addEvent,
        removeEvent: removeEvent,
        addClickEvent: addClickEvent,
        addEnterEvent: addEnterEvent,
        delegateEvent: delegateEvent,
        delegateDelEvent: delegateDelEvent,
        isIE: isIE,
        setCookie: setCookie,
        getCookie: getCookie,
        ajax: ajax,
        escape: escape
    };
});
define('data', ['util'], function (util) {
    var initDataBase = function () {
        if (!localStorage.cate || !localStorage.childCate || !localStorage.task) {
            var cate = [{
                    'id': 0,
                    'name': '默认分类',
                    'child': [0]
                }];
            var childCate = [{
                    'id': 0,
                    'parent': 0,
                    'name': '默认子分类',
                    'child': [-1]
                }];
            var task = [{
                    'id': -1,
                    'parent': 0,
                    'done': true,
                    'name': '介绍',
                    'date': '2017-7-30',
                    'content': '这是一个个人任务管理系统\uFF0C为离线应用\uFF0C数据保存在本地硬盘\u3002<br>'
                }];
            localStorage.cate = JSON.stringify(cate);
            localStorage.childCate = JSON.stringify(childCate);
            localStorage.task = JSON.stringify(task);
        }
    };
    console.log(localStorage.cate);
    var queryCates = function () {
        return JSON.parse(localStorage.cate);
    };
    var queryCateById = function (id) {
        var cate = JSON.parse(localStorage.cate), len = cate.length;
        for (var i = 0; i < len; i++) {
            if (cate[i].id == id) {
                return cate[i];
            }
        }
    };
    var queryTasksNumByCateId = function (id) {
        var cate = queryCateById(id), result = 0, len = cate.child.length;
        for (var i = 0; i < len; i++) {
            var childCate = queryChildCateById(cate.chlid[i]);
            result += childCate.child.length;
        }
        return result;
    };
    var queryTasksNumByCate = function (cateObj) {
        var result = 0, len = cateObj.child.length;
        for (var i = 0; i < len; i++) {
            var childCate = queryChildCateById(cateObj.child[i]);
            result += childCate.child.length;
        }
        return result;
    };
    var queryAllChildCates = function () {
        return JSON.parse(localStorage.childCate);
    };
    var queryChildCateById = function (id) {
        var childCate = JSON.parse(localStorage.childCate), len = childCate.length;
        for (var i = 0; i < len; i++) {
            if (childCate[i].id == id) {
                return childCate[i];
            }
        }
    };
    var queryChildCateByIdArr = function (idArr) {
        console.log('in queryChildCateByIdArr');
        if (util.isArray(idArr)) {
            var cateArr = [], len = idArr.length;
            for (var i = 0; i < len; i++) {
                cateArr.push(queryChildCateById(idArr[i]));
            }
            console.log(cateArr);
            return cateArr;
        }
    };
    var queryAllTasks = function (status) {
        var task = JSON.parse(localStorage.task), result = [], len = task.length;
        if (typeof status !== 'boolean') {
            return task;
        }
        for (var i = 0; i < len; i++) {
            if (status && task[i].done) {
                result.push(task[i]);
            } else if (!status && !task[i].done) {
                result.push(task[i]);
            }
        }
        return result;
    };
    var queryTasksByDateInTaskArr = function (date, taskArr) {
        var task = [], len = taskArr.length;
        for (var i = 0; i < len; i++) {
            if (taskArr[i].date === date) {
                task.push(taskArr[i]);
            }
        }
        return task;
    };
    var queryTaskById = function (id) {
        var allTasks = queryAllTasks(), len = allTasks.length;
        for (var i = 0; i < len; i++) {
            if (allTasks[i].id == id) {
                return allTasks[i];
            }
        }
    };
    var queryTasksByChildCateId = function (id, status) {
        var result = [], arr = queryChildCateById(id).child, len = arr.length;
        console.log(JSON.stringify(queryChildCateById(id)));
        console.log('arr: ' + arr);
        for (var i = 0; i < len; i++) {
            var task = queryTaskById(arr[i]);
            if (typeof status !== 'boolean') {
                result.push(task);
            } else {
                if (status && task.done) {
                    result.push(task);
                } else if (!status && !task.done) {
                    result.push(task);
                }
            }
        }
        return result;
    };
    var queryTasksByCateId = function (id, status) {
        console.log('in queryTasksByCateId');
        var result = [], cateChild = queryCateById(id).child, len = cateChild.length;
        for (var i = 0; i < len; i++) {
            if (typeof status !== 'boolean') {
                result = result.concat(queryTasksByChildCateId(cateChild[i]));
            } else {
                result = result.concat(queryTasksByChildCateId(cateChild[i], status));
            }
        }
        return result;
    };
    var addCate = function (name) {
        var cate = JSON.parse(localStorage.cate), newCate = {};
        newCate.id = cate[cate.length - 1].id + 1;
        newCate.name = name;
        newCate.child = [];
        cate.push(newCate);
        localStorage.cate = JSON.stringify(cate);
    };
    var addChildCate = function (parent, name) {
        var childCate = JSON.parse(localStorage.childCate), newChildCate = {};
        newChildCate.id = childCate[childCate.length - 1].id + 1;
        newChildCate.parent = parent;
        newChildCate.name = name;
        newChildCate.child = [];
        console.log(newChildCate);
        childCate.push(newChildCate);
        console.log(childCate);
        localStorage.childCate = JSON.stringify(childCate);
        updateCateChildByAdd(parent, newChildCate.id);
        console.log('after updateCateChildByAdd: ' + localStorage.cate);
    };
    var addTask = function (obj) {
        var allTasks = queryAllTasks();
        obj.id = allTasks[allTasks.length - 1].id + 1;
        allTasks.push(obj);
        updateChildCateChildByAdd(obj.parent, obj.id);
        localStorage.task = JSON.stringify(allTasks);
        console.log('in addTask, allTasks: ' + localStorage.task);
        return obj.id;
    };
    var updateCateChildByAdd = function (id, childId) {
        console.log('in updateCateChildByAdd');
        console.log(localStorage.cate);
        var cate = JSON.parse(localStorage.cate), len = cate.length;
        for (var i = 0; i < len; i++) {
            if (cate[i].id == id) {
                cate[i].child.push(childId);
                break;
            }
        }
        localStorage.cate = JSON.stringify(cate);
    };
    var updateCateChildByDel = function (id, childId) {
        var cate = JSON.parse(localStorage.cate), len = cate.length;
        for (var i = 0; i < len; i++) {
            var item = cate[i];
            if (item.id == id) {
                for (var j = 0; j < item.child.length; j++) {
                    if (item.child[j] === childId) {
                        item.child.splice(j, 1);
                        break;
                    }
                }
            }
        }
        localStorage.cate = JSON.stringify(cate);
    };
    var updateChildCateChildByAdd = function (id, childId) {
        var childCate = queryAllChildCates(), len = childCate.length;
        for (var i = 0; i < len; i++) {
            if (childCate[i].id == id) {
                childCate[i].child.push(childId);
                break;
            }
        }
        localStorage.childCate = JSON.stringify(childCate);
    };
    var updateChildCateChildByDel = function (id, childId) {
        console.log('in updateChildCateChildByDel');
        var childCate = queryAllChildCates(), len = childCate.length;
        for (var i = 0; i < len; i++) {
            var item = childCate[i];
            if (item.id == id) {
                console.log(JSON.stringify(item.child));
                for (var j = 0; j < item.child.length; j++) {
                    if (item.child[j] == childId) {
                        item.child.splice(j, 1);
                        break;
                    }
                }
                console.log(JSON.stringify(item.child));
            }
        }
        localStorage.childCate = JSON.stringify(childCate);
    };
    var updateTaskStatusById = function (taskId) {
        var allTasks = queryAllTasks(), len = allTasks.length;
        for (var i = 0; i < len; i++) {
            if (allTasks[i].id == taskId) {
                allTasks[i].done = true;
                break;
            }
        }
        localStorage.task = JSON.stringify(allTasks);
        console.log('after updateTaskStatusById, task: ' + localStorage.task);
    };
    var updateTaskById = function (id, name, date, content) {
        var allTasks = queryAllTasks(), len = allTasks.length;
        for (var i = 0; i < len; i++) {
            var task = allTasks[i];
            if (task.id == id) {
                task.name = name;
                task.date = date;
                task.content = content;
                break;
            }
        }
        localStorage.task = JSON.stringify(allTasks);
    };
    var deleteCate = function (id) {
        var cate = queryCates();
        console.log('id: ' + id);
        for (var i = 0; i < cate.length; i++) {
            var item = cate[i];
            console.log('in for');
            if (item.id == id) {
                cate.splice(i, 1);
                console.log('cate spliced: ' + cate);
                for (var j = 0, l = item.child.length; j < l; j++) {
                    deleteChildCate(item.child[j]);
                }
            }
        }
        localStorage.cate = JSON.stringify(cate);
    };
    var deleteChildCate = function (id) {
        console.log('in deleteChildCate');
        var childCate = queryAllChildCates();
        for (var i = 0; i < childCate.length; i++) {
            var item = childCate[i];
            if (item.id == id) {
                childCate.splice(i, 1);
                console.log(item.child);
                for (var j = 0, l = item.child.length; j < l; j++) {
                    console.log(l);
                    deleteTaskById(item.child[j]);
                }
                updateCateChildByDel(item.parent, item.id);
            }
        }
        localStorage.childCate = JSON.stringify(childCate);
    };
    var deleteTaskById = function (id) {
        console.log('in deleteTaskById');
        var allTasks = queryAllTasks();
        for (var i = 0; i < allTasks.length; i++) {
            var item = allTasks[i];
            if (item.id == id) {
                allTasks.splice(i, 1);
                updateChildCateChildByDel(item.parent, item.id);
                break;
            }
        }
        localStorage.task = JSON.stringify(allTasks);
    };
    return {
        initDataBase: initDataBase,
        queryCates: queryCates,
        queryCateById: queryCateById,
        queryTasksNumByCateId: queryTasksNumByCateId,
        queryTasksNumByCate: queryTasksNumByCate,
        queryAllChildCates: queryAllChildCates,
        queryChildCateById: queryChildCateById,
        queryChildCateByIdArr: queryChildCateByIdArr,
        queryAllTasks: queryAllTasks,
        queryTasksByDateInTaskArr: queryTasksByDateInTaskArr,
        queryTaskById: queryTaskById,
        queryTasksByChildCateId: queryTasksByChildCateId,
        queryTasksByCateId: queryTasksByCateId,
        addCate: addCate,
        addChildCate: addChildCate,
        addTask: addTask,
        updateCateChildByAdd: updateCateChildByAdd,
        updateCateChildByDel: updateCateChildByDel,
        updateChildCateChildByAdd: updateChildCateChildByAdd,
        updateChildCateChildByDel: updateChildCateChildByDel,
        updateTaskStatusById: updateTaskStatusById,
        updateTaskById: updateTaskById,
        deleteCate: deleteCate,
        deleteChildCate: deleteChildCate,
        deleteTaskById: deleteTaskById
    };
});
define('control', [
    'util',
    'data'
], function (util, data) {
    var currentCateId = -1, currentCateTable = 'allCate', currentTaskId = -1, currentPage = 1, editSave = false;
    var initAll = function () {
        data.initDataBase();
        initCates();
        initPopUp();
        util.$('#task-list').innerHTML = createTaskList(data.queryAllTasks());
        createStatusTaskList();
        util.addClass(util.$('[taskid]'), 'selected');
        showTaskContentById(util.$('[taskid]').getAttribute('taskid'));
        optTouchDevice();
        document.ontouchmove = function (e) {
            e.preventDefault();
        };
        util.addClickEvent(util.$('.category .add'), clickAddCate);
        util.addClickEvent(util.$('.list-all .add'), clickAddTask);
        util.addClickEvent(util.$('#all-tasks'), function () {
            clickOnCate(this);
        });
        util.addClickEvent(util.$('#backto'), clickBackTo);
        util.addClickEvent(util.$('.save'), save);
        util.addClickEvent(util.$('.cancel-save'), cancelSave);
        util.addClickEvent(util.$('.ok'), ok);
        util.addClickEvent(util.$('.cancel-ok'), cancel);
        util.delegateEvent(util.$('#list-content'), 'p', 'click', function () {
            clickOnCate(this);
        });
        util.delegateEvent(util.$('#task-list'), 'li', 'click', function () {
            clickOnTask(this);
        });
        util.delegateDelEvent(util.$('#list-content'), 'fa-trash-o', 'click', function () {
            del(event, this);
        });
        util.delegateDelEvent(util.$('#task-list'), 'fa-trash-o', 'click', function () {
            del(event, this);
        });
        util.addEvent(window, 'resize', function () {
            if (window.innerWidth > 760) {
                util.$('#backto').style.display = 'none';
            } else if (!is_touch_device()) {
                console.log('in window.onresize');
                showBackTo(currentPage);
            }
        });
    };
    var initCates = function () {
        console.log('in initCates');
        var cate = data.queryCates(), defaultChildCate = data.queryChildCateById(0), str = '<ul class="folder-wrap">';
        for (var i = 0; i < cate.length; i++) {
            var liStr = '';
            if (cate[i].child.length === 0) {
                liStr = '<li><p class="folder no-default" cateid=' + cate[i].id + '><i class="fa fa-folder-open folder-icon" style="padding-right: 5px;" aria-hidden="true"></i>' + cate[i].name + '(' + data.queryTasksNumByCate(cate[i]) + ')<i class="fa fa-trash-o del" style="color: #b00d07;"></i></p></li>';
            } else {
                if (cate[i].id === 0) {
                    liStr = '<li><p class="folder" cateid=' + cate[i].id + '><i class="fa fa-folder-open folder-icon" style="padding-right: 5px;" aria-hidden="true"></i>' + cate[i].name + '(1)</p><ul class="file-wrap">';
                    liStr += '<li><p class="file" cateid=' + defaultChildCate.id + '><i class="fa fa-file-o file-icon" style="padding-right: 5px;" aria-hidden="true"></i>' + defaultChildCate.name + '(1)</li>';
                } else {
                    liStr = '<li><p class="folder no-default" cateid=' + cate[i].id + '><i class="fa fa-folder-open folder-icon" style="padding-right: 5px;" aria-hidden="true"></i>' + cate[i].name + '(' + data.queryTasksNumByCate(cate[i]) + ')<i class="fa fa-trash-o del" style="color: #b00d07;"></i></p><ul class="file-wrap">';
                    console.log(cate[i].child);
                    var childCate = data.queryChildCateByIdArr(cate[i].child);
                    for (var j = 0; j < childCate.length; j++) {
                        var childLiStr = '';
                        childLiStr = '<li><p class="file no-default" cateid=' + childCate[j].id + '><i class="fa fa-file-o file-icon" style="padding-right: 5px;" aria-hidden="true"></i>' + childCate[j].name + '(' + childCate[j].child.length + ')' + '<i class="fa fa-trash-o del" style="color: #b00d07;"></i></p><li>';
                        liStr += childLiStr;
                    }
                }
                liStr += '</ul></li>';
            }
            str += liStr;
        }
        str += '</ul>';
        util.$('#list-content').innerHTML = str;
        util.$('#all-tasks span').innerHTML = data.queryAllTasks().length;
    };
    var initPopUp = function () {
        var cate = data.queryCates(), options = '<option value="-1">新增主分类</option>';
        for (var i = 0; i < cate.length; i++) {
            if (cate[i].id !== 0) {
                options += '<option value="' + cate[i].id + '">' + cate[i].name + '</option>';
            }
        }
        util.$('#select-cate').innerHTML = options;
        util.$('#input-cate').innerHTML = '';
    };
    var clickAddCate = function () {
        var cover = util.$('.cover');
        cover.style.display = 'block';
    };
    var del = function (e, ele) {
        console.log(ele);
        var clickedEle = ele.parentNode;
        console.log(clickedEle);
        if (/folder/.test(clickedEle.className)) {
            if (confirm('是否确定删除分类\uFF1F')) {
                data.deleteCate(clickedEle.getAttribute('cateid'));
            }
        } else if (/file/.test(clickedEle.className)) {
            if (confirm('是否确定删除子分类\uFF1F')) {
                data.deleteChildCate(clickedEle.getAttribute('cateid'));
            }
        } else if (/task-self/.test(clickedEle.className)) {
            if (confirm('是否确定删除此任务')) {
                data.deleteTaskById(clickedEle.getAttribute('taskid'));
            }
        }
        initCates();
        util.$('#task-list').innerHTML = createTaskList(data.queryAllTasks());
        if (window.innerWidth > 760) {
            clickOnCate(util.$('#all-tasks'));
        }
    };
    var ok = function () {
        var optionValue = util.$('#select-cate').value, inputCate = util.$('#input-cate').value;
        if (inputCate === '') {
            alert('请输入新分类名称');
            return;
        }
        console.log(typeof optionValue);
        console.log(inputCate);
        if (optionValue == -1) {
            console.log('about going in addCate');
            data.addCate(inputCate);
        } else {
            console.log('about going in addChildCate');
            data.addChildCate(optionValue, inputCate);
        }
        console.log(localStorage.cate);
        initCates();
        util.$('.cover').style.display = 'none';
        initPopUp();
    };
    var cancel = function () {
        util.$('.cover').style.display = 'none';
    };
    var clickOnCate = function (ele) {
        console.log('in clickOnCate');
        cleanAllSelected();
        util.addClass(ele, 'selected');
        var taskList = util.$('#task-list'), cateId = ele.getAttribute('cateid');
        console.log('cateid:' + cateId);
        if (ele.getAttribute('id') === 'all-tasks') {
            taskList.innerHTML = createTaskList(data.queryAllTasks());
            currentCateId = -1;
            currentCateTable = 'allCate';
        } else if (/folder/.test(ele.className)) {
            taskList.innerHTML = createTaskList(data.queryTasksByCateId(cateId));
            currentCateId = cateId;
            currentCateTable = 'cate';
        } else if (/file/.test(ele.className)) {
            taskList.innerHTML = createTaskList(data.queryTasksByChildCateId(cateId));
            currentCateId = cateId;
            currentCateTable = 'childCate';
        }
        cleanStatusSelected();
        util.addClass(util.$('#all'), 'selected');
        if (util.$('[taskid]')) {
            util.addClass(util.$('[taskid]'), 'selected');
        }
        showTaskContentById(currentTaskId);
        setCurr2();
    };
    var cleanAllSelected = function () {
        var folderEle = document.getElementsByClassName('folder'), fileEle = document.getElementsByClassName('file');
        for (var i = 0, l = folderEle.length; i < l; i++) {
            util.removeClass(folderEle[i], 'selected');
        }
        for (var j = 0, len = fileEle.length; j < len; j++) {
            util.removeClass(fileEle[j], 'selected');
        }
        util.removeClass(util.$('#all-tasks'), 'selected');
    };
    var createDateSortedData = function (task) {
        var dateArr = [], sortedTask = [];
        for (var i = 0; i < task.length; i++) {
            if (dateArr.indexOf(task[i].date) === -1) {
                dateArr.push(task[i].date);
            }
        }
        console.log('dateArr:    ' + dateArr);
        dateArr = dateArr.sort();
        console.log('dateArr:    ' + dateArr);
        for (var j = 0; j < dateArr.length; j++) {
            var obj = {};
            obj.date = dateArr[j];
            obj.task = data.queryTasksByDateInTaskArr(dateArr[j], task);
            sortedTask.push(obj);
        }
        console.log('sortedTask: ' + JSON.stringify(sortedTask));
        currentTaskId = sortedTask[0].task[0].id;
        return sortedTask;
    };
    var createTaskList = function (task) {
        console.log('in createTaskList, task: ' + JSON.stringify(task));
        var str = '';
        if (!task.length) {
            return str;
        }
        var sortedTask = createDateSortedData(task);
        console.log('sortedTask: ' + JSON.stringify(sortedTask));
        for (var i = 0, l = sortedTask.length; i < l; i++) {
            console.log('l:' + l);
            var item = sortedTask[i];
            str += '<div class="time">' + item.date + '</div><ul>';
            for (var j = 0, len = item.task.length; j < len; j++) {
                var liStr = '';
                if (item.task[j].done) {
                    if (item.task[j].id == -1) {
                        liStr = '<li class="task-done task-self" taskid="' + item.task[j].id + '"><i class="fa fa-check" style="color: #23b812; padding-right: 5px;" aria-hidden="true"></i>' + item.task[j].name + '</li>';
                    } else {
                        liStr = '<li class="task-done task-self" taskid="' + item.task[j].id + '"><i class="fa fa-check" style="color: #23b812; padding-right: 5px;" aria-hidden="true"></i>' + item.task[j].name + '<i class="fa fa-trash-o del" style="color: #b00d07;"></i></li>';
                    }
                } else {
                    liStr = '<li class="task-self" taskid="' + item.task[j].id + '">' + item.task[j].name + '<i class="fa fa-trash-o del" style="color: #b00d07;"></i></li>';
                }
                str += liStr;
            }
            str += '</ul>';
        }
        return str;
    };
    var cleanStatusSelected = function () {
        util.removeClass(util.$('#all'), 'selected');
        util.removeClass(util.$('#done'), 'selected');
        util.removeClass(util.$('#undone'), 'selected');
    };
    var filterTaskByStatus = function (ele, status) {
        cleanStatusSelected();
        util.addClass(ele, 'selected');
        var taskList = util.$('#task-list');
        if (currentCateId == -1) {
            taskList.innerHTML = createTaskList(data.queryAllTasks(status));
        } else if (currentCateTable === 'cate') {
            taskList.innerHTML = createTaskList(data.queryTasksByCateId(currentCateId, status));
        } else {
            taskList.innerHTML = createTaskList(data.queryTasksByChildCateId(currentCateId, status));
        }
    };
    var createStatusTaskList = function () {
        util.addClickEvent(util.$('#all'), function () {
            filterTaskByStatus(this);
        });
        util.addClickEvent(util.$('#undone'), function () {
            filterTaskByStatus(this, false);
        });
        util.addClickEvent(util.$('#done'), function () {
            filterTaskByStatus(this, true);
        });
    };
    var clickOnTask = function (ele) {
        cleanTaskSelected();
        util.addClass(ele, 'selected');
        var taskId = ele.getAttribute('taskid');
        currentTaskId = taskId;
        showTaskContentById(taskId);
        setCurr3();
    };
    var showTaskContentById = function (id) {
        console.log('in showTaskContentById');
        var task = data.queryTaskById(id);
        console.log(task.done);
        if (!task.done) {
            var optStr = '<i class="fa fa-pencil-square-o" id="edit-icon" style="font-size: 25px; margin-right: 15px; cursor: pointer;" aria-hidden="true"></i>';
            optStr += '<i class="fa fa-check-square-o" id="check-icon" style="font-size: 25px; cursor: pointer;" aria-hidden="true"></i>';
            util.$('.operation').innerHTML = optStr;
            util.addClickEvent(util.$('#check-icon'), check);
            util.addClickEvent(util.$('#edit-icon'), edit);
        } else {
            util.$('.operation').innerHTML = '';
        }
        util.$('.todo-name').innerHTML = task.name;
        util.$('.date span').innerHTML = task.date;
        util.$('.content').innerHTML = task.content;
        util.$('.button-area').style.display = 'none';
    };
    var cleanTaskSelected = function () {
        var taskLi = util.$('#task-list').getElementsByTagName('li');
        for (var i = 0, l = taskLi.length; i < l; i++) {
            util.removeClass(taskLi[i], 'selected');
        }
    };
    var clickAddTask = function () {
        console.log('in clickAddTask');
        console.log(typeof currentCateId);
        if (currentCateId == -1 || currentCateTable !== 'childCate') {
            alert('请选择具体子分类\uFF0C若没有\uFF0C请先建立子分类');
            setCurr1();
        } else if (currentCateId == 0) {
            alert('不能给默认子分类添加任务');
            setCurr1();
        } else {
            createEditArea();
            setCurr3();
        }
    };
    var createEditArea = function () {
        util.$('.todo-name').innerHTML = '<input type="text" class="input-title" maxlength="15" placeholder="请输入标题\uFF08不超过15字符\uFF09...">';
        util.$('.date span').innerHTML = '<input type="date" class="input-date">';
        util.$('.content').innerHTML = '<textarea class="text-content" placeholder="请输入内容..."></textarea>';
        util.$('.button-area').style.display = 'block';
    };
    var updateTaskList = function () {
        console.log('in updateTaskList');
        var taskList = util.$('#task-list');
        if (currentCateTable === 'allCate') {
            console.log('allCate');
            taskList.innerHTML = createTaskList(data.queryAllTasks());
        } else if (currentCateTable === 'cate') {
            console.log('cate');
            taskList.innerHTML = createTaskList(data.queryTasksByCateId(currentCateId));
        } else {
            console.log('childCate');
            console.log(currentCateId);
            taskList.innerHTML = createTaskList(data.queryTasksByChildCateId(currentCateId));
        }
    };
    var save = function () {
        var title = util.$('.input-title').value, date = util.$('.input-date').value, content = util.$('.text-content').value, taskList = util.$('#task-list'), temp1, temp2;
        if (!(title && date && content)) {
            alert('标题\u3001日期和任务内容都不能为空\uFF0C请重新输入\u3002');
            createEditArea();
            return;
        }
        if (editSave) {
            temp1 = currentTaskId;
            console.log('before:' + localStorage.task);
            data.updateTaskById(currentTaskId, title, date, content);
            console.log('after:' + localStorage.task);
        } else {
            var taskObj = {};
            taskObj.name = util.escape(title);
            taskObj.date = util.escape(date);
            taskObj.content = util.escape(content);
            taskObj.done = false;
            taskObj.parent = currentCateId;
            console.log(taskObj);
            temp2 = data.addTask(taskObj);
            console.log('after addTask, currentTaskId:  ' + temp2);
        }
        updateTaskList();
        console.log('currentTaskId again: ' + currentTaskId);
        currentTaskId = editSave ? temp1 : temp2;
        showTaskContentById(currentTaskId);
        initCates();
        editSave = false;
    };
    var cancelSave = function () {
        showTaskContentById(currentTaskId);
    };
    var check = function () {
        if (confirm('确定将任务标记为已完成吗\uFF1F')) {
            data.updateTaskStatusById(currentTaskId);
            showTaskContentById(currentTaskId);
            filterTaskByStatus(util.$('#all'));
        }
    };
    var edit = function () {
        var task = data.queryTaskById(currentTaskId);
        util.$('.todo-name').innerHTML = '<input type="text" class="input-title" max-length="20" placeholder="请输入标题..." value="' + task.name + '">';
        util.$('.date span').innerHTML = '<input type="date" class="input-date" value="' + task.date + '">';
        util.$('.content').innerHTML = '<textarea class="text-content" placeholder="请输入内容...">' + task.content + '</textarea>';
        util.$('.button-area').style.display = 'block';
        editSave = true;
    };
    var setCurr1 = function () {
        console.log('in setCurr1');
        util.$('.category').setAttribute('class', 'category view curr');
        util.$('.list-all').setAttribute('class', 'list-all view next');
        currentPage = 1;
        showBackTo(1);
    };
    var setCurr2 = function () {
        console.log('in setCurr2');
        util.$('.category').setAttribute('class', 'category view last');
        util.$('.list-all').setAttribute('class', 'list-all view curr');
        util.$('.description').setAttribute('class', 'description view next');
        currentPage = 2;
        showBackTo(2);
    };
    var setCurr3 = function () {
        console.log('in setCurr3');
        util.$('.list-all').setAttribute('class', 'list-all view last');
        util.$('.description').setAttribute('class', 'description view curr');
        currentPage = 3;
        showBackTo(3);
    };
    var showBackTo = function (currentPage) {
        if (window.innerWidth < 760) {
            var backTo = util.$('#backto');
            switch (currentPage) {
            case 1:
                backTo.style.display = 'none';
                break;
            case 2:
                backTo.style.display = 'block';
                break;
            case 3:
                backTo.style.display = 'block';
                break;
            default:
                break;
            }
        }
    };
    var clickBackTo = function () {
        if (window.innerWidth < 760) {
            console.log('in clickBackTo');
            console.log('currentPage: ' + currentPage);
            var backTo = util.$('#backto');
            switch (currentPage) {
            case 2:
                setCurr1();
                break;
            case 3:
                setCurr2();
                break;
            default:
                break;
            }
        }
    };
    var is_touch_device = function () {
        return 'ontouchstart' in window || navigator.maxTouchPoints;
    };
    var optTouchDevice = function () {
        console.log('touch-device?  ' + is_touch_device());
        if (is_touch_device()) {
            var styleSheet = document.styleSheets[0], len = styleSheet.cssRules.length;
            styleSheet.insertRule('#all-tasks:hover {border: none; border-radius: 0; box-shadow: none; transition: none;}', len);
            styleSheet.insertRule('.folder:hover {border: none; border-radius: 0; box-shadow: none; transition: none;}', len + 1);
            styleSheet.insertRule('.file:hover {border: none; border-radius: 0; box-shadow: none; transition: none;}', len + 2);
            styleSheet.insertRule('.task-self:hover {border: none; border-radius: 0; box-shadow: none; transition: none;}', len + 3);
            styleSheet.insertRule('.add:hover {box-shadow: none; transition: none;}', len + 4);
            styleSheet.insertRule('.filter:hover {color: #000;}', len + 5);
            styleSheet.insertRule('.del {visibility: visible;}', len + 6);
        }
    };
    return { initAll: initAll };
});
;
(function () {
    'use strict';
    function FastClick(layer, options) {
        var oldOnClick;
        options = options || {};
        this.trackingClick = false;
        this.trackingClickStart = 0;
        this.targetElement = null;
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.lastTouchIdentifier = 0;
        this.touchBoundary = options.touchBoundary || 10;
        this.layer = layer;
        this.tapDelay = options.tapDelay || 200;
        this.tapTimeout = options.tapTimeout || 700;
        if (FastClick.notNeeded(layer)) {
            return;
        }
        function bind(method, context) {
            return function () {
                return method.apply(context, arguments);
            };
        }
        var methods = [
            'onMouse',
            'onClick',
            'onTouchStart',
            'onTouchMove',
            'onTouchEnd',
            'onTouchCancel'
        ];
        var context = this;
        for (var i = 0, l = methods.length; i < l; i++) {
            context[methods[i]] = bind(context[methods[i]], context);
        }
        if (deviceIsAndroid) {
            layer.addEventListener('mouseover', this.onMouse, true);
            layer.addEventListener('mousedown', this.onMouse, true);
            layer.addEventListener('mouseup', this.onMouse, true);
        }
        layer.addEventListener('click', this.onClick, true);
        layer.addEventListener('touchstart', this.onTouchStart, false);
        layer.addEventListener('touchmove', this.onTouchMove, false);
        layer.addEventListener('touchend', this.onTouchEnd, false);
        layer.addEventListener('touchcancel', this.onTouchCancel, false);
        if (!Event.prototype.stopImmediatePropagation) {
            layer.removeEventListener = function (type, callback, capture) {
                var rmv = Node.prototype.removeEventListener;
                if (type === 'click') {
                    rmv.call(layer, type, callback.hijacked || callback, capture);
                } else {
                    rmv.call(layer, type, callback, capture);
                }
            };
            layer.addEventListener = function (type, callback, capture) {
                var adv = Node.prototype.addEventListener;
                if (type === 'click') {
                    adv.call(layer, type, callback.hijacked || (callback.hijacked = function (event) {
                        if (!event.propagationStopped) {
                            callback(event);
                        }
                    }), capture);
                } else {
                    adv.call(layer, type, callback, capture);
                }
            };
        }
        if (typeof layer.onclick === 'function') {
            oldOnClick = layer.onclick;
            layer.addEventListener('click', function (event) {
                oldOnClick(event);
            }, false);
            layer.onclick = null;
        }
    }
    var deviceIsWindowsPhone = navigator.userAgent.indexOf('Windows Phone') >= 0;
    var deviceIsAndroid = navigator.userAgent.indexOf('Android') > 0 && !deviceIsWindowsPhone;
    var deviceIsIOS = /iP(ad|hone|od)/.test(navigator.userAgent) && !deviceIsWindowsPhone;
    var deviceIsIOS4 = deviceIsIOS && /OS 4_\d(_\d)?/.test(navigator.userAgent);
    var deviceIsIOSWithBadTarget = deviceIsIOS && /OS [6-7]_\d/.test(navigator.userAgent);
    var deviceIsBlackBerry10 = navigator.userAgent.indexOf('BB10') > 0;
    FastClick.prototype.needsClick = function (target) {
        switch (target.nodeName.toLowerCase()) {
        case 'button':
        case 'select':
        case 'textarea':
            if (target.disabled) {
                return true;
            }
            break;
        case 'input':
            if (deviceIsIOS && target.type === 'file' || target.disabled) {
                return true;
            }
            break;
        case 'label':
        case 'iframe':
        case 'video':
            return true;
        }
        return /\bneedsclick\b/.test(target.className);
    };
    FastClick.prototype.needsFocus = function (target) {
        switch (target.nodeName.toLowerCase()) {
        case 'textarea':
            return true;
        case 'select':
            return !deviceIsAndroid;
        case 'input':
            switch (target.type) {
            case 'button':
            case 'checkbox':
            case 'file':
            case 'image':
            case 'radio':
            case 'submit':
                return false;
            }
            return !target.disabled && !target.readOnly;
        default:
            return /\bneedsfocus\b/.test(target.className);
        }
    };
    FastClick.prototype.sendClick = function (targetElement, event) {
        var clickEvent, touch;
        if (document.activeElement && document.activeElement !== targetElement) {
            document.activeElement.blur();
        }
        touch = event.changedTouches[0];
        clickEvent = document.createEvent('MouseEvents');
        clickEvent.initMouseEvent(this.determineEventType(targetElement), true, true, window, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, false, false, false, false, 0, null);
        clickEvent.forwardedTouchEvent = true;
        targetElement.dispatchEvent(clickEvent);
    };
    FastClick.prototype.determineEventType = function (targetElement) {
        if (deviceIsAndroid && targetElement.tagName.toLowerCase() === 'select') {
            return 'mousedown';
        }
        return 'click';
    };
    FastClick.prototype.focus = function (targetElement) {
        var length;
        if (deviceIsIOS && targetElement.setSelectionRange && targetElement.type.indexOf('date') !== 0 && targetElement.type !== 'time' && targetElement.type !== 'month') {
            length = targetElement.value.length;
            targetElement.setSelectionRange(length, length);
        } else {
            targetElement.focus();
        }
    };
    FastClick.prototype.updateScrollParent = function (targetElement) {
        var scrollParent, parentElement;
        scrollParent = targetElement.fastClickScrollParent;
        if (!scrollParent || !scrollParent.contains(targetElement)) {
            parentElement = targetElement;
            do {
                if (parentElement.scrollHeight > parentElement.offsetHeight) {
                    scrollParent = parentElement;
                    targetElement.fastClickScrollParent = parentElement;
                    break;
                }
                parentElement = parentElement.parentElement;
            } while (parentElement);
        }
        if (scrollParent) {
            scrollParent.fastClickLastScrollTop = scrollParent.scrollTop;
        }
    };
    FastClick.prototype.getTargetElementFromEventTarget = function (eventTarget) {
        if (eventTarget.nodeType === Node.TEXT_NODE) {
            return eventTarget.parentNode;
        }
        return eventTarget;
    };
    FastClick.prototype.onTouchStart = function (event) {
        var targetElement, touch, selection;
        if (event.targetTouches.length > 1) {
            return true;
        }
        targetElement = this.getTargetElementFromEventTarget(event.target);
        touch = event.targetTouches[0];
        if (deviceIsIOS) {
            selection = window.getSelection();
            if (selection.rangeCount && !selection.isCollapsed) {
                return true;
            }
            if (!deviceIsIOS4) {
                if (touch.identifier && touch.identifier === this.lastTouchIdentifier) {
                    event.preventDefault();
                    return false;
                }
                this.lastTouchIdentifier = touch.identifier;
                this.updateScrollParent(targetElement);
            }
        }
        this.trackingClick = true;
        this.trackingClickStart = event.timeStamp;
        this.targetElement = targetElement;
        this.touchStartX = touch.pageX;
        this.touchStartY = touch.pageY;
        if (event.timeStamp - this.lastClickTime < this.tapDelay) {
            event.preventDefault();
        }
        return true;
    };
    FastClick.prototype.touchHasMoved = function (event) {
        var touch = event.changedTouches[0], boundary = this.touchBoundary;
        if (Math.abs(touch.pageX - this.touchStartX) > boundary || Math.abs(touch.pageY - this.touchStartY) > boundary) {
            return true;
        }
        return false;
    };
    FastClick.prototype.onTouchMove = function (event) {
        if (!this.trackingClick) {
            return true;
        }
        if (this.targetElement !== this.getTargetElementFromEventTarget(event.target) || this.touchHasMoved(event)) {
            this.trackingClick = false;
            this.targetElement = null;
        }
        return true;
    };
    FastClick.prototype.findControl = function (labelElement) {
        if (labelElement.control !== undefined) {
            return labelElement.control;
        }
        if (labelElement.htmlFor) {
            return document.getElementById(labelElement.htmlFor);
        }
        return labelElement.querySelector('button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea');
    };
    FastClick.prototype.onTouchEnd = function (event) {
        var forElement, trackingClickStart, targetTagName, scrollParent, touch, targetElement = this.targetElement;
        if (!this.trackingClick) {
            return true;
        }
        if (event.timeStamp - this.lastClickTime < this.tapDelay) {
            this.cancelNextClick = true;
            return true;
        }
        if (event.timeStamp - this.trackingClickStart > this.tapTimeout) {
            return true;
        }
        this.cancelNextClick = false;
        this.lastClickTime = event.timeStamp;
        trackingClickStart = this.trackingClickStart;
        this.trackingClick = false;
        this.trackingClickStart = 0;
        if (deviceIsIOSWithBadTarget) {
            touch = event.changedTouches[0];
            targetElement = document.elementFromPoint(touch.pageX - window.pageXOffset, touch.pageY - window.pageYOffset) || targetElement;
            targetElement.fastClickScrollParent = this.targetElement.fastClickScrollParent;
        }
        targetTagName = targetElement.tagName.toLowerCase();
        if (targetTagName === 'label') {
            forElement = this.findControl(targetElement);
            if (forElement) {
                this.focus(targetElement);
                if (deviceIsAndroid) {
                    return false;
                }
                targetElement = forElement;
            }
        } else if (this.needsFocus(targetElement)) {
            if (event.timeStamp - trackingClickStart > 100 || deviceIsIOS && window.top !== window && targetTagName === 'input') {
                this.targetElement = null;
                return false;
            }
            this.focus(targetElement);
            this.sendClick(targetElement, event);
            if (!deviceIsIOS || targetTagName !== 'select') {
                this.targetElement = null;
                event.preventDefault();
            }
            return false;
        }
        if (deviceIsIOS && !deviceIsIOS4) {
            scrollParent = targetElement.fastClickScrollParent;
            if (scrollParent && scrollParent.fastClickLastScrollTop !== scrollParent.scrollTop) {
                return true;
            }
        }
        if (!this.needsClick(targetElement)) {
            event.preventDefault();
            this.sendClick(targetElement, event);
        }
        return false;
    };
    FastClick.prototype.onTouchCancel = function () {
        this.trackingClick = false;
        this.targetElement = null;
    };
    FastClick.prototype.onMouse = function (event) {
        if (!this.targetElement) {
            return true;
        }
        if (event.forwardedTouchEvent) {
            return true;
        }
        if (!event.cancelable) {
            return true;
        }
        if (!this.needsClick(this.targetElement) || this.cancelNextClick) {
            if (event.stopImmediatePropagation) {
                event.stopImmediatePropagation();
            } else {
                event.propagationStopped = true;
            }
            event.stopPropagation();
            event.preventDefault();
            return false;
        }
        return true;
    };
    FastClick.prototype.onClick = function (event) {
        var permitted;
        if (this.trackingClick) {
            this.targetElement = null;
            this.trackingClick = false;
            return true;
        }
        if (event.target.type === 'submit' && event.detail === 0) {
            return true;
        }
        permitted = this.onMouse(event);
        if (!permitted) {
            this.targetElement = null;
        }
        return permitted;
    };
    FastClick.prototype.destroy = function () {
        var layer = this.layer;
        if (deviceIsAndroid) {
            layer.removeEventListener('mouseover', this.onMouse, true);
            layer.removeEventListener('mousedown', this.onMouse, true);
            layer.removeEventListener('mouseup', this.onMouse, true);
        }
        layer.removeEventListener('click', this.onClick, true);
        layer.removeEventListener('touchstart', this.onTouchStart, false);
        layer.removeEventListener('touchmove', this.onTouchMove, false);
        layer.removeEventListener('touchend', this.onTouchEnd, false);
        layer.removeEventListener('touchcancel', this.onTouchCancel, false);
    };
    FastClick.notNeeded = function (layer) {
        var metaViewport;
        var chromeVersion;
        var blackberryVersion;
        var firefoxVersion;
        if (typeof window.ontouchstart === 'undefined') {
            return true;
        }
        chromeVersion = +(/Chrome\/([0-9]+)/.exec(navigator.userAgent) || [
            ,
            0
        ])[1];
        if (chromeVersion) {
            if (deviceIsAndroid) {
                metaViewport = document.querySelector('meta[name=viewport]');
                if (metaViewport) {
                    if (metaViewport.content.indexOf('user-scalable=no') !== -1) {
                        return true;
                    }
                    if (chromeVersion > 31 && document.documentElement.scrollWidth <= window.outerWidth) {
                        return true;
                    }
                }
            } else {
                return true;
            }
        }
        if (deviceIsBlackBerry10) {
            blackberryVersion = navigator.userAgent.match(/Version\/([0-9]*)\.([0-9]*)/);
            if (blackberryVersion[1] >= 10 && blackberryVersion[2] >= 3) {
                metaViewport = document.querySelector('meta[name=viewport]');
                if (metaViewport) {
                    if (metaViewport.content.indexOf('user-scalable=no') !== -1) {
                        return true;
                    }
                    if (document.documentElement.scrollWidth <= window.outerWidth) {
                        return true;
                    }
                }
            }
        }
        if (layer.style.msTouchAction === 'none' || layer.style.touchAction === 'manipulation') {
            return true;
        }
        firefoxVersion = +(/Firefox\/([0-9]+)/.exec(navigator.userAgent) || [
            ,
            0
        ])[1];
        if (firefoxVersion >= 27) {
            metaViewport = document.querySelector('meta[name=viewport]');
            if (metaViewport && (metaViewport.content.indexOf('user-scalable=no') !== -1 || document.documentElement.scrollWidth <= window.outerWidth)) {
                return true;
            }
        }
        if (layer.style.touchAction === 'none' || layer.style.touchAction === 'manipulation') {
            return true;
        }
        return false;
    };
    FastClick.attach = function (layer, options) {
        return new FastClick(layer, options);
    };
    if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {
        define('fastclick', [], function () {
            return FastClick;
        });
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = FastClick.attach;
        module.exports.FastClick = FastClick;
    } else {
        window.FastClick = FastClick;
    }
}());
console.log('in main.js');
require.config({
    paths: {
        'util': './helper/util',
        'fastclick': './helper/fastclick'
    }
});
require([
    'control',
    'fastclick'
], function (control, fastClick) {
    control.initAll();
    console.log(fastClick);
    fastClick.attach(document.body);
});
define('main', [
    'control',
    'fastclick'
], function () {
    return;
});