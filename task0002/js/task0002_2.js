
//To be able to use the clearTimeout() method,
// a global variable must be used when creating the timeout method
var timer;
var targetTime;

function start() {
    // var input = $('.input').value;
    var input = trim($('.input').value);
    if (!input) {
        alert('输入不能为空！');
        return;
    }
    clearTimeout(timer);

    targetTime = new Date(input);

    if (/\d{4}-\d{1,2}-\d{1,2}/.test(input)) {
        countdown();
    }
    else {
        alert('请按格式YYYY-MM-DD输入年月日！');
        return;
    }
}

function countdown() {

    var now = new Date();
    var year = targetTime.getFullYear();
    var month = targetTime.getMonth() + 1;
    var day = targetTime.getDate();

    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {

        if (now < targetTime) {
            var correctTime = targetTime;
        }
        else {
            alert('输入日期必须大于当前日期！');
            return;
        }
    }
    else {
        alert('输入日期范围有误，请重新输入！');
        return;
    }

    dateDiff(correctTime, now, year, month, day);

    timer = setTimeout(countdown, 1000);
}

function dateDiff(date1, date2, year, month, day) {

    var diff = Math.abs(date1 - date2);

    var seconds = Math.floor(diff / 1000 % 60);
    var mins = Math.floor(diff / 1000 / 60 % 60);
    var hours = Math.floor(diff / 1000 / 60 / 60 % 24);
    var days = Math.floor(diff /1000 / 60 / 60 / 24);

    $('.output').innerHTML = '距离' + year + '年' + month + '月' + day + '日' + '还有'
                             + days + '天' + hours + '小时' + mins + '分' + seconds + '秒';

}

$.on('.button', 'click', start);
