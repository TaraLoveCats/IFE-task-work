console.log('in main.js');
//localStorage.clear();

require.config({

    paths: {
        'util': 'helper/util',
        'fastclick': 'helper/fastclick'
    }
});

require(['control', 'fastclick'], function (control, fastClick) {
    control.initAll();

    console.log(fastClick);//返回的是Fastclick函数
    fastClick.attach(document.body);
});
