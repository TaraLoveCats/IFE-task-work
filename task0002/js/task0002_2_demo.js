function format(source, opts) {
    source = String(source);
    var data = Array.prototype.slice.call(arguments,1), toString = Object.prototype.toString;
    if(data.length){
        data = data.length == 1 ?
            /* ie 下 Object.prototype.toString.call(null) == '[object Object]' */
            (opts !== null && (/\[object Array\]|\[object Object\]/.test(toString.call(opts))) ? opts : data)
            : data;
        return source.replace(/#\{(.+?)\}/g, function (match, key){
            var replacer = data[key];
            // chrome 下 typeof /a/ == 'function'
            if('[object Function]' == toString.call(replacer)){
                replacer = replacer(key);
            }
            return ('undefined' == typeof replacer ? '' : replacer);
        });
    }
    return source;
}

function dateParse(source) {
    var reg = new RegExp("^\\d+(\\-|\\/)\\d+(\\-|\\/)\\d+\x24");
    if ('string' === typeof source) {
        if (reg.test(source) || isNaN(Date.parse(source))) {
            var d = source.split(/ |T/),
                d0 = d[0].split(/[^\d]/),
                d1 = d.length > 1
                    ? d[1].split(/[^\d]/)
                    : [0, 0, 0];
            return new Date(d0[0] - 0,
                            d0[1] - 1,
                            d0[2] - 0,
                            d1[0] - 0,
                            d1[1] - 0,
                            d1[2] - 0);
        } else {
            return new Date(source);
        }
    }
    return new Date();
}

function pad(source, length) {
    var pre = '',
        negative = (source < 0),
        string = String(Math.abs(source));

    if (string.length < length) {
        pre = (new Array(length - string.length + 1)).join('0');
    }

    return (negative ? "-" : "") + pre + string;
}

function dateFormat(source, pattern) {
    if ('string' !== typeof pattern) {
        return source.toString();
    }

    function replacer(patternPart, result) {
        pattern = pattern.replace(patternPart, result);
    }

    var year = source.getFullYear(),
        month = source.getMonth() + 1,
        date = source.getDate(),
        hours = source.getHours(),
        minutes = source.getMinutes(),
        seconds = source.getSeconds();

    replacer(/yyyy/g, pad(year, 4));
    replacer(/yy/g, pad(parseInt(year.toString().slice(2), 10), 2));
    replacer(/MM/g, pad(month, 2));
    replacer(/M/g, month);
    replacer(/dd/g, pad(date, 2));
    replacer(/d/g, date);

    replacer(/HH/g, pad(hours, 2));
    replacer(/H/g, hours);
    replacer(/hh/g, pad(hours % 12, 2));
    replacer(/h/g, hours % 12);
    replacer(/mm/g, pad(minutes, 2));
    replacer(/m/g, minutes);
    replacer(/ss/g, pad(seconds, 2));
    replacer(/s/g, seconds);

    return pattern;
}

var targetTime;
var timer;

function printTime(leftTime) {
    var leftDate = {
        //The parseInt function converts its first argument to a string, parses it,
        // and returns an integer or NaN
        dd: parseInt(leftTime / 1000 / 60 / 60 / 24, 10),
        hh: parseInt(leftTime / 1000 / 60 / 60 % 24, 10),
        mm: parseInt(leftTime / 1000 / 60 % 60, 10),
        ss: parseInt(leftTime / 1000 % 60, 10)
    };

    $('.output').innerHTML = ''
        + dateFormat(targetTime, '距离yyyy年MM月dd日')
        + format('还有#{dd}天#{hh}小时#{mm}分#{ss}秒', leftDate);
}

function runTimer(first) {
    var nowTime = new Date();
    var leftTime = targetTime - nowTime;

    if (first && leftTime < 0) {
        alert('输入日期必须大于当前日期！');
        return;
    }

    printTime(leftTime);

    if (leftTime / 1000 === 0) {
        return;
    }
    //setTimeout实现倒计时功能（即1秒钟调用一次）
    timer = setTimeout(runTimer, 1000);

}

function startTimer() {
    var input = $('.input').value;
    if (!input) {
        alert('请按格式YYYY-MM-DD输入年月日');
        return;
    }
    clearTimeout(timer);
    //targetTime is an object
    targetTime = dateParse(input);

    runTimer(true);
}

$.on('.button', 'click', startTimer);
