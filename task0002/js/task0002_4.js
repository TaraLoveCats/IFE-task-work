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
