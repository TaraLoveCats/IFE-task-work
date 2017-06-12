var data = ['jd', 'job hunting', 'java', 'javascript', 'javascript void 0'];
var showData = [],
    prompt = [];
var indexGlobal = -1;

function clearCurr() {
    //first clear other current classes
    for (var i = 0; i < prompt.length; i++) {
        prompt[i].classList.remove('current');
    }
}

function recordCurrentPos(pos) {
    indexGlobal = pos;
}

function changePos(flag) {
    var len = prompt.length;
    var maxIndex = len - 1;

    if (flag === -1) {
        if (indexGlobal === -1 || indexGlobal === 0) {
            indexGlobal = maxIndex;
        }
        else {
            indexGlobal = (indexGlobal - 1) % len;
        }
    }
    else if (flag === 1) {
        indexGlobal = (indexGlobal === -1) ? 0 : (indexGlobal + 1) % len;
    }
}

function mouseSelect() {
    clearCurr();
    //必须用this不能写prompt[i], 因为事件发生时才会调用此函数，i不存在
    this.classList.add('current');
    var pos = prompt.indexOf(this);

    recordCurrentPos(pos);

    addClickEvent(this, function () {
        //this.innerHTML是HTML文档形式（<span>...</span><span>...</span>）
        $('.input').value = this.childNodes[0].innerHTML + this.childNodes[1].innerHTML;
        //让输入框重新 focus,否则无法触发键盘事件
        $('.input').focus();
    });
}

function kbdSelect(code) {
    clearCurr();

    if (code === 38) {
        changePos(-1);
    }
    else if (code === 40) {
        changePos(1);
    }

    var index = indexGlobal;
    prompt[index].classList.add('current');

    addEnterEvent($('.input'), function () {
        $('.input').value = prompt[index].childNodes[0].innerHTML + prompt[index].childNodes[1].innerHTML;
    });

}

function filterData() {
    //to avoid duplicate data in showData
    showData = [];

    var input = trim($('.input').value).toLowerCase();
    for (var i = 0; i < data.length; i++) {
        var index = data[i].indexOf(input);
        if (input !== '' && index === 0) {
            showData.push(data[i]);
        }
    }
    show(input);
}

function show(input) {
    //refresh data
    $('.prompt-box').innerHTML = null;
    prompt = [];

    for ( var i = 0; i < showData.length; i++) {
        var span1 = document.createElement('span');
        var span2 = document.createElement('span');
        var len = input.length;

        span1.innerHTML = input;
        span1.style.color = '#f00';
        span2.innerHTML = showData[i].slice(len);

        var p = document.createElement('p');
        p.style.margin = '2px';

        p.appendChild(span1);
        p.appendChild(span2);
        prompt.push(p);

        $('.prompt-box').appendChild(p);

        addEvent(prompt[i], 'mouseover', mouseSelect);

    }
    addEvent($('.input'), 'keydown', function (e) {
        kbdSelect(e.keyCode);
    });
}
//input event( fired synchronously when the value of an
// <input>, <select>, or <textarea> element is changed.)
addEvent($('.input'), 'input', filterData);

// var lastinput = null;
// function () {
//     var inputCurr = trim($('.input').value).toLowerCase();
//     if (inputCurr !== lastinput) {
//         filterData();
//     }
//     lastinput = inputCurr;
// }
