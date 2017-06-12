var data = ['jd', 'job hunting', 'java', 'javascript', 'javascript void 0'];
var showData = [],
    prompt = [];
var indexGlobal = -1;

function clearCurr() {
    //first clear other current classes
    each (prompt, function (item) {
        item.classList.remove('current');
    });
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
        setInputText(this);
    });
}

function setInputText(obj) {
    if(obj) {
        //obj.innerHTML是HTML文档形式（<span>...</span><span>...</span>）
        $('.input').value = obj.childNodes[0].innerHTML + obj.childNodes[1].innerHTML;
        //让输入框重新 focus,否则无法触发键盘事件
        $('.input').focus();
    }
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

    //避免TypeError
    if (prompt[index]) {
        prompt[index].classList.add('current');
    }
}

function filterData() {
    //every time the input changes, re-initialize glbal variables
    showData = [];
    prompt = [];
    indexGlobal = -1;

    var input = trim($('.input').value).toLowerCase();
    each (data, function (item) {
        var index = item.indexOf(input);
        if (input !== '' && index === 0) {
            showData.push(item);
        }
    });

    //refresh data
    $('.prompt-box').innerHTML = null;

    if (showData[0]) {
        var validInput = showData[0].slice(0, input.length);
        show(validInput);
    }
}

function show(input) {

    each (showData, function (item, i) {
        var span1 = document.createElement('span');
        var span2 = document.createElement('span');
        var len = input.length;

        span1.innerHTML = input;
        span1.style.color = '#e20059';
        span2.innerHTML = item.slice(len);

        var p = document.createElement('p');
        p.style.margin = '2px';

        p.appendChild(span1);
        p.appendChild(span2);
        prompt.push(p);

        $('.prompt-box').appendChild(p);

        addEvent(prompt[i], 'mouseover', mouseSelect);
    });
}
//don't add some handler to A element more than one time,
//because the handler will execute more than once! 
addEvent($('.input'), 'keydown', function (e) {
    kbdSelect(e.keyCode);
});

addEnterEvent($('.input'), function () {
    setInputText(prompt[indexGlobal]);
});

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
