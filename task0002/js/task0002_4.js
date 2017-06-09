var data = ['jd', 'job hunting', 'java', 'javascript', 'javascript void 0'];
var showData = [];

function filterData() {
    //to avoid duplicate data in showData
    showData = [];

    var input = trim($('.input').value);
    for (var i = 0; i < data.length; i++) {
        var index = data[i].indexOf(input);
        if (input !== '' && index === 0) {
            showData.push(data[i]);
        }
    }
    show();
}

function show() {
    //refresh data
    $('.prompt-box').innerHTML = null;

    for ( var i = 0; i < showData.length; i++) {
        var p = document.createElement('p');
        p.style.margin = 0; //遗留问题
        p.innerHTML = showData[i];
        $('.prompt-box').appendChild(p);
    }
}

$('.input').onfocus = function refresh() {
    filterData();
    var timer = setTimeout(refresh, 200);
};
