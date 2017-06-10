var data = ['jd', 'job hunting', 'java', 'javascript', 'javascript void 0'];
var showData = [];
var prompt = [];
var span;

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
    var spanChar = '';
    for (var i = 0; i < showData.length; i++) {
        for (var j = 0; j < input.length; j++) {
            spanChar = spanChar + showData[i].charAt(j);
        }
        span = document.createElement('span');
        span.innerHTML = spanChar;
        span.style.color = '#f00';
    }
    show();
}

function show() {
    //refresh data
    $('.prompt-box').innerHTML = null;
    prompt = [];

    for ( var i = 0; i < showData.length; i++) {

        var p = document.createElement('p');
        p.style.margin = '1px';
        p.innerHTML = showData[i];
        
        p.appendChild(span);
        prompt.push(p);

        $('.prompt-box').appendChild(p);

        addEvent(prompt[i], 'mouseover', function () {
            //first clear other current classes
            for (var i = 0; i < prompt.length; i++) {
                prompt[i].classList.remove('current');
            }
            //必须用this不能写prompt[i], 因为事件发生时才会调用此函数，i已经变了
            this.classList.add('current');
        });
    }
}
// var lastinput = null;
// addEvent($('.input'), 'keyup', function () {
//     var inputCurr = trim($('.input').value).toLowerCase();
//     if (inputCurr !== lastinput) {
//         filterData();
//     }
//     lastinput = inputCurr;
// });

addEvent($('.input'), 'keyup', filterData);
