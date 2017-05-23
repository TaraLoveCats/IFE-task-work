//util

function insertAfter(newElement, existElement) {
    var parent = existElement.parentNode;
    if (parent) {
        parent.insertBefore(newElement, existElement.nextSibling);
    }
    return newElement;
}

function filterArray(arr) {
    var result = [];
    each(arr, function(item) {
        if (item) {
            result.push(item);
        }
    });
    return result;
}

//step1
function step1(e) {
    var input = trim($('.step1 .input').value);
    var arr = input.split(',');

    arr = uniqArray(arr);
    arr = filterArray(arr);

    var output = arr.join(',');

    //不将未出现的新元素先写入ＨＴＭＬ结构中，而是动态创建
    var p = document.createElement('p');
    p.innerHTML = 'Your hobbies: ' + output;
    //在事件发生的元素（target）后插入新元素
    insertAfter(p, e.target);
}

$.on('.step1 .button', 'click', step1);

//step2
function step2(e) {
    var input = trim($('.step2 .input').value);
    //中文输入下的逗号和空格是全角的
    var arr = input.split(/\n|\s|\ |\,|\，|\、|\;/);

    arr = uniqArray(arr);
    arr = filterArray(arr);

    var output = arr.join(',');

    var p = document.createElement('p');
    p.innerHTML = 'Your hobbies: ' + output;

    insertAfter(p, e.target);
}

$.on('.step2 .button', 'click', step2);

//step3
function step3(e) {
    var input = trim($('.step3 .input').value);
    if (!input) {
        return $('.err').innerHTML = '输入不能为空';
    }

    var arr = input.split(/\n|\s|\ |\,|\，|\、|\;/);
    arr = uniqArray(arr);
    arr = filterArray(arr);
    if (arr.length > 10) {
        return $('.err').innerHTML = '输入的爱好数量不能超过10个'；
    }

    var output = arr.join(',');

    var p = document.createElement('p');

    each (arr, function(item, i) {
        var checkbox = document.createElement('input');
        checkbox.setAttribute('type', 'checkbox');
        checkbox.setAttribute('id', 'checkbox' + i);
        var label = document.createElement('label');
        label.setAttribute('for', 'checkboxid' + i);
        label.innerHTML = item;
        p.appendChild(checkbox);
        p.appendChild(label);
    });

    insertAfter(p, e.target);

}

$.on('.step3 .button', 'click', step3);
