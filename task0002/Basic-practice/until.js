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
