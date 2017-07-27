var currentCateId = -1,
    currentCateTable = "allCate",
    currentTaskId = -1;

initAll();

function initAll() {
    initDataBase();
    initCates();
    initPopUp();
    $('#task-list').innerHTML = createTaskList(queryAllTasks());
    cateStatusControl();
    generateTaskById(-1);
    addClass($('[data-taskId]'), 'selected');
    listlocalStorage();
}

/**
 * cate分类
 *
 * childCate子分类
 *
 * task任务
 */

function initDataBase() {
    if (!localStorage.cate || !localStorage.childCate || !localStorage.task) {

        var cate = [
            {
                'id': 0,
                'name': '默认分类'，
                'child': [0]
            }
        ];

        var childCate = [
            {
                'id': 0,
                'parent': 0,
                'name': '默认子分类'，
                'child': [-1]
            }
        ];

        var task = [
            {
                'id': -1,
                'parent': 0,
                'done': true,
                'name': '介绍',
                'date': '2017-7-30',
                'content': '这是一个个人任务管理系统，为离线应用，数据保存在本地硬盘。<br>浏览器兼容性： Chrome/ IE8+'
            }
        ];

        localStorage.cate = JSON.stringify(cate);
        localStorage.childCate = JSON.stringify(childCate);
        localStorage.task = JSON.stringify(task);
    }
}

/**
 * 查询所有分类
 * @return {Array} 对象数组
 */
function queryCates() {
    return JSON.parse(localStorage.cate);
}

/**
 * 根据任务id查询
 * @param  {number} id
 * @return {Object} 一个分类对象
 */
function queryCateById(id) {
    var cate = JSON.parse(localStorage.cate),
        len = cate.length;

    for (var i = 0; i < len; i++) {
        if (cate[i].id === id) {
            return cate[i];
        }
    }
}

/**
 * 根据主分类id查询任务个数
 * @param  {number} id
 * @return {number}
 */
function queryTasksNumByCateId(id) {
    var cate = queryCateById(id),
        result = 0,
        len = cate.child.length;

    for (var i = 0; i < len; i++) {
        var childCate = queryChildCatesById(cate.chlid[i]);
        result += childCate.child.length;
    }

    return result;
}

/**
 * 根据主分类查询任务个数
 * @param  {Object}
 * @return {number}
 */
function queryTasksNumByCate(cateObj) {
    var result = 0,
        len = cateObj.child.length;

    for (var i = 0; i < len; i++) {
        var childCate = queryChildCatesById(cateObj.chlid[i]);
         result += childCate.child.length;
    }

    return result;
}

/**
 * 查询所有子分类
 * @return {Array} 子分类对象数组
 */
function queryAllChildCates() {
    return JSON.parse(localStorage.childCate);
}

/**
 * 根据id 查询子分类
 * @param  {number} id
 * @return {Object}
 */
function queryChildCatesById(id) {
    var childCate = JSON.parse(localStorage.childCate),
        len = childCate.length;

    for (var i = 0; i < len; i++) {
        if (childCate[i].id === id) {
            return childCate[i];
        }
    }
}

/**
 * 根据id数组查询子分类
 * @param  {Array}
 * @return {Array} 子分类对象数组
 */
function queryChildCatesByIdArr(idArr) {
    if (isArray(idArr)) {
        var cateArr = [],
            len = idArr.length;

        for (var i = 0; i < len; i++) {
            cateArr.push(queryChildCatesById(idArr[i]));
        }

        return cateArr;
    }
}

/**
 * 查询所有任务
 * @param  {boolean} 任务完成状态
 * @return {Array} 任务对象数组
 */
function queryAllTasks(status) {
    var task = JSON.parse(localStorage.task),
        result = [],
        len = task.length;

    if (typeof status !== 'boolean') {
        return task;
    }

    for (var i = 0; i < len; i++) {
        if (status && task[i].done) {
            result.push(task[i]);
        }
        else if (!status && !task[i].done) {
            result.push(task[i]);
        }
    }

    return result;
}

/**
 * 根据任务日期查询任务
 * @param  {string} 日期字符串
 * @param  {Array} 任务对象列表
 * @return {Array}
 */
function queryTasksByDateInTaskArr(date, taskArr) {
    var task = [],
        len = taskArr.length;

    for (var i = 0; i < len; i++) {
        if (taskArr[i].date === date) {
            task.push(taskArr[i]);
        }
    }

    return task;
}

/**
 * 根据任务id查询任务
 * @param  {number}
 * @return {Object} 一个任务对象
 */
function queryTaskById(id) {
    var allTasks = queryAllTasks(),
        len = allTasks.length;

    for (var i = 0; i < len; i++) {
        if (allTasks[i].id === id) {
            return allTasks[i];
        }
    }
}

/**
 * 根据子分类id查询任务
 * @param  {number}
 * @param  {boolean} 任务完成状态
 * @return {Array} 任务对象数组
 */
function queryTasksByChildCateId(id, status) {
    var result = [],
        arr = queryChildCatesById(id).child,
        len = arr.length;

    for (var i = 0; i < len; i++) {
        var task = queryTaskById(arr[i]);

        if (typeof status !== 'boolean') {
            result.push(task);
        }
        if (status && task[i].done) {
            result.push(task);
        }
        else if (!status && !task[i].done) {
            result.push(task);
        }

        return result;
    }
}

/**
 * 根据主分类id查询任务
 * @param  {number}
 * @param  {boolean}
 * @return {Array}
 */
function queryTasksByCateId(id, status) {
    var result = [],
        cateChild = queryCateById(id).child,
        len = cateChild.length;

    for (var i = 0; i < len; i++) {
        if (typeof status !== 'boolean') {
            result = result.concat(queryTasksByChildCateId(cateChild[i]));
        } else {
            result = result.concat(queryTasksByChildCateId(cateChild[i], status));
        }
    }

    return result;
}

/**
 * Object.create polyfill（部分功能）
 * @param  {Object} o 原对象
 * @return {Object}   一份原对象的shallow copy
 */
function object(o) {
    function F() {}
    F.prototype = o;
    return new F();
}

/**
 * 添加分类
 * @param {String} name 新分类的名称
 */
function addCate(name) {
    var cate = JSON.parse(localStorage.cate),
        newCate = {};
    newCate.id = cate[cate.length - 1].id + 1;
    newCate.name = name;
    newCate.child = [];

    cate.push(newCate);
    localStorage.cate = JSON.stringify(cate);
}

/**
 * 添加子分类
 * @param {number} parent 父节点的id
 * @param {String} name   新子分类的名称
 */
function addChildCate(parent, name) {
    var childCate = JSON.parse(localStorage.childCate),
        newChildCate = {};
    newChildCate.id = childCate[childCate.length - 1].id + 1;
    newChildCate.parent = parent;
    newChildCate.name = name;
    newChildCate.child = [];

    childCate.push(newChildCate);
    localStorage.childCate = JSON.stringify(childCate);

    updateCateChildByAdd(parent, newChildCate.id);
}

/**
 * 添加任务
 * @param {Object} obj 一个没有id的任务对象
 * @return {number} 任务的id
 */
function addTask(obj) {
    var allTasks = queryAllTasks();
    obj.id = allTasks[allTasks.length - 1].id + 1;
    allTasks.push(obj);

    updateCateChildByAdd(obj.parent, obj.id);
    localStorage.task = JSON.stringify(allTasks);

    return obj.id;
}

/**
 * 更新主分类的child，添加一个childId
 * @param  {number} id      要更新的分类id
 * @param  {number} childId child中添加的id
 */
function updateCateChildByAdd(id, childId) {
    var cate = JSON.parse(localStorage.cate),
        len = cate.length;
    for (var i = 0; i < len; i++) {
        if (cate[i].id === id) {
            cate[i].child.push(childId);
            break;
        }
    }

    localStorage.cate = JSON.stringify(cate);
}


/**
 * 更新主分类的child，删除一个childId
 * @param  {number} id
 * @param  {number} childId
 */
function updateCateChildByDel(id, childId) {
    var cate = JSON.parse(localStorage.cate),
        len = cate.length;
    for (var i = 0; i < len; i++) {
        if (cate[i].id === id) {
            for (var j = 0, l = cate[i].child.length; j < l; j++) {
                if (cate[i].child[j] === childId) {
                    cate[i].child = deleteInArray(cate[i].child, j);
                    break;
                }
            }
        }
    }
    localStorage.cate = JSON.stringify(cate);
}

/**
 * 更新子分类的child,添加一个childId
 * @param  {number} id
 * @param  {number} childId
 */
function updateChildCateChildByAdd(id, childId) {
    var childCate = queryAllChildCates(),
        len = childCate.length;

    for (var i = 0; i < len; i++) {
        if (childCate[i].id === id) {
            childCate[i].child.push(childId);
            break;
        }
    }
    localStorage.childCate = JSON.stringify(childCate);
}

/**
 * 根据任务id更新任务状态
 * @param  {number} taskId 任务id
 */
function updateTaskStatusById(taskId) {
    var allTasks = queryAllTasks(),
        len = allTasks.length;
    for (var i = 0; i < len; i++) {
        if (allTasks[i].id === taskId) {
            allTasks[i].done = true;
            break;
        }
    }

    localStorage.task = JSON.stringify(allTasks);
}


/**
 * 修改任务
 * @param  {number} id      任务id
 * @param  {String} name    任务名称
 * @param  {String} date    任务日期
 * @param  {String} content 任务内容
 */
function updateTaskById(id, name, date, content) {
    var allTasks = queryAllTasks(),
        len = allTasks.length;
    for (var i = 0; i < len; i++) {
        var item = allTasks[i];
        if (item.id === id) {
            item.name = name;
            item.date = date;
            item.content = content;
            break;
        }
    }
    localStorage.task = JSON.stringify(allTasks);
}

/**
 * 删除指定id的分类
 * @param  {number} id 任务id
 */
function deleteCate(id) {
    var cate = queryCates(),
        result = [],
        len = cateArr.length;

    for (var i = 0; i < len; i++) {
        var item = cate[i];
        if (item.id === id) {
            result = deleteInArray(item, i);
            for (var j = 0, l = item.length; j < l; j++) {
                deleteChildCate(item.child[j]);
            }
        }
    }

    localStorage.cate = JSON.stringify(result);
}

/**
 * 删除指定id的子类
 * @param  {number} id 子分类
 */
function deleteChildCate(id) {
    var childCate = queryAllChildCates(),
        result = [],
        len = childCate.length;

    for (var i = 0; i < len; i++) {
        var item = childCate[i];
        if (item.id === id) {
            result = deleteInArray(childCate, i);
            updateCateChildByDel(item.parent, item.id);

            for (var j = 0, l = item.child.length; i < l; i++) {
                deleteTaskById(item.child[j]);
            }
        }
    }

    localStorage.childCate = JSON.stringify(result);
}

/**
 * 根据id删除任务
 * @param  {number} id 任务id
 */
function deleteTaskById(id) {
    var allTasks = queryAllTasks(),
        result = [],
        len = allTasks.length;

    for (var i = 0; i < len; i++) {
        if (allTasks[i].id === id) {
            result = deleteInArray(allTasks, i);
            break;
        }
    }

    localStorage.task = JSON.stringify(result);
}

/**
 * 列举localStorage
 */
function listlocalStorage() {
    console.log('-------localStorage--------');
    for (var i = 0, l = localStorage.length; i < l; i++) {
        var name = localStorage.key(i),
            value = localStorage.getItem(name);
        console.log('name:   ' + name);
        console.log('value:   ' + value);
        console.log('++++++++++++++++');
    }
    console.log('-------localStorage---------');
}


// DOM操作 页面控制

/**
 * 初始化分类列表
 */
function initCase() {
    var cate = queryCates(),
        defaultChildCate = queryChildCatesById(0),
        str = '<ul class="folder-wrap">';

    for (var i = 0; i < cate.length; i++) {
        var liStr = '';
        if (cate[i].child.length === 0) {
            liStr = '<li><p class="folder no-default" onclick="clickCate(this)" cateid='+ cate[i].id + '><img src="img/folder-icon.png" style="padding-right: 5px">' + cate[i].name + '(<span>' + queryTasksNumByCate(cate[i]) + ')</span><img src="img/del-icon.png" class="del" onclick="delete(event, this)"></p></li>';
        } else {
            liStr = '<li><p class="folder no-default" onclick="clickCate(this)" cateid='+ cate[i].id + '><img src="img/folder-icon.png" style="padding-right: 5px">' + cate[i].name + '(<span>' + queryTasksNumByCate(cate[i]) + ')</span><img src="img/del-icon.png" class="del" onclick="delete(event, this)"></p><ul>';
            var childCate = queryChildCatesByIdArr(cate[i].child);
            for (var j = 0; j < childCate.length; j++) {
                var childLiStr = '';
                childLiStr = '<li class="file no-default" onclick="clickCate(this)" cateid='+ childCate[j].id + '><img src="img/file-icon.png" style="padding-right: 5px">' + childCate[j].name + '(<span>' + childCate[j].child.length +')</span>'
                +'<img src="img/del-icon.png" class="del" onclick="delete(event, this)"></li>'
                liStr += childLiStr;
            }
            liStr += '</ul></li>'
        }
        str += liStr;
    }
    str += '</ul>';

    $('#list-content').innerHTML = str;
    $('#all-tasks span').innerHTML = queryAllTasks().length;

}

/**
 * 初始化浮层
 */
function initPopUp() {
    var cate = queryCates(),
        options = '<option value="-1">新增主分类</option>';
    for (var i = 0; i < cate.length; i++) {
        options += '<option value="' + cate[i].id + '">' + cate[i].name + '</option>';
    }

    $('#select-cate').innerHTML = options;
    $('#input-cate').innerHTML = '';
}


/**
 * 显示浮层
 */
function clickAddCate() {
    var cover = $('.cover');
    cover.style.display = 'block';
}

/**
 * 删除分类图标回调函数
 * @param  {Object} e   event
 * @param  {Object} ele DOM元素
 * @return {[type]}     [description]
 */
function delete(e, ele) {
    //阻止事件冒泡
    if (window.event) {
        window.event.cancelBubble = true;
    } else {
        e.stopPropagation();
    }

    var clickedCate = element.parentNode;
    if (/folder/.test(clickedCate.className)) {
        if (confirm("是否确定删除分类？")) {
            deleteCate(clickedCate.getAttribute('cateid'));
        }
    } else if (/file/.test(clickedCate.className)) {
        if (confirm("是否确定删除分类？")) [
            deleteChildCate(clickedCate.getAttribute('cateid'));
    }

    initCates();
    $('#task-list').innerHTML = initTaskList(queryAllTasks());
}

/**
 * 浮层确认按钮
 */
function ok() {
    var optionValue = $('#select-cate').value,
        inputCate = $('#input-cate').value;
    if (inputCate === '') {
        alert('请输入新分类名称')；
    }

    if (optionValue === -1) {
        addCate(inputCate);
    } else {
        addChildCate(optionValue, inputCate);
    }

    initCates();
    $('cover').style.display = 'none';
    //新增了（主）分类，更新浮层
    initPopUp();
}

/**
 * 浮层取消按钮
 */
function cancel() {
    $('cover').style.display = 'none';
}

/**
 * 点击分类显示任务列表
 * @param  {Object} ele 点击的DOM元素
 * @return {[type]}     [description]
 */
function clickOnCate(ele) {
    cleanAllSelected();
    addClass(ele, 'selected');

    var taskList = $('#task-list'),
        cateId = ele.getAttribute('cateid');

    if (ele.getAttribute('id') === 'all-tasks') {

        taskList.innerHTML = createTaskList(queryAllTasks());
        currentCateId = -1;
        currentCateTable = 'allCate';
    } else if (/folder/.test(ele.className)) {

        taskList.innerHTML = createTaskList(queryTasksByCateId(cateId));
        currentCateId = cateId;
        currentCateTable = 'cate';
    } else if (/file/.test(ele.className)) {
        taskList.innerHTML = createTaskList(queryTasksByChildCateId(cateId));
        currentCateId = cateId;
        currentCateTable = 'childCate';
    }

    removeClass($('.filter'), 'selected');
    addClass($('#all'), 'selected');
    addClass($('[taskid]'), 'selected');

    showTaskContentById(currentTaskId);
}

/**
 * 清除高亮
 * @return {[type]} [description]
 */
function cleanAllSelected() {
    removeClass($('#all-tasks'), 'selected');
    removeClass($('.folder'), 'selected');
    removeClass($('file'), 'selected');
}


/**
 * 创建和日期关联的数据对象
 * @param  {Array} task 任务数组
 * @return {Array}      日期任务对象数组
 */
function createDateSortedData(task) {
    var dateArr = [],
        sortedTask = [];

    for (var i = 0; i < task.length; i++) {
        if (dateArr.indexOf(task[i].date === -1)) {
            dateArr.push(task[i].date);
        }
    }
    console.log('dateArr:    ' + dateArr);
    //对日期进行排序
    dateArr = dateArr.sort(function (a, b) {
        return a - b;
    });
    console.log('dateArr:    ' + dateArr);

    for (var i = 0; i < dateArr.length; i++) {
        var obj = {};
        obj.date = dateArr[i];
        obj.task = queryTasksByDateInTaskArr(dateArr[i], task);
        sortedTask.push(obj);
    }
    currentTaskId = sortedTask[0].task[0].id;

    return sortedTask;
}


/**
 * 创建任务列表
 * @param  {Array} task 需要显示在列表中的任务数组
 * @return {String}      任务列表的html内容
 */
function createTaskList(task) {
    var str = '';

    if (!task.length) {
        return str;
    }
    var sortedTask = createDateSortedData(task);

    for (var i = 0, l = sortedTask.length; i < l; i++) {

        //liStr表示一个日期下的一个任务
        var item = sortedTask[i];
        str += '<div>' + item.date + '</div><ul>';
        for (var i = 0, l = item.task.length; i < l; i++) {
            var liStr = '';
            if (item.task[i].done) {
                liStr = '<li class="task-done" taskid="' + item.task[i].id + '" onclick="clickOnTask(this)">' + item.task[i].name + '</li>';
            } else {
                liStr = '<li taskid="' + item.task[i].id + '" onclick="clickOnTask(this)">' + item.task[i].name + '</li>';
            }
            str += liStr;
        }

        str += '</ul>';
    }

    console.log(str);
    return str;
}

/**
 * 根据不同的状态更改任务列表内容
 * @param  {Object} ele    点击的状态按钮
 * @param  {[type]} status
 * @return {[type]}        [description]
 */
function filterTaskByStatus(ele, status) {
    removeClass($('.filter'), 'selected');
    addClass(ele, 'selected');

    var taskList = $('#task-list');

    if (currentCateId === -1) {
        taskList.innerHTML = createTaskList(queryAllTasks(status));
    } else if (currentCateTable === 'cate') {
        taskList.innerHTML = createTaskList(queryTasksByCateId(currentCateId, status));
    } else {
        taskList.innerHTML = createTaskList(queryTasksByChildCateId(currentCateId, status));
    }
}

/**
 * 添加事件侦听，显示列表内容
 * @return {[type]} [description]
 */
function createStatusTaskList() {
    addClickEvent($('#all'), function () {
        filterTaskByStatus(this);
    });
    addClickEvent($('undone'), function () {
        filterTaskByStatus(this, false);
    });
    addClickEvent($('done'), function () {
        filterTaskByStatus(this, true);
    });
}

/**
 * 点击任务
 * @param  {Object} ele 点击的任务对象
 * @return {[type]}     [description]
 */
function clickOnTask(ele) {
    cleanTaskSelected();
    addClass(ele, 'selected');

    var taskId = ele.getAttribute('taskid');
    currentTaskId = taskId;

    showTaskContentById(taskId);
}

/**
 * 根据任务id在右侧显示任务的具体信息
 * @param  {number} id
 * @return {[type]}    [description]
 */
function showTaskContentById(id) {
    var task = queryTaskById(id);

    var name = $('.todo-name'),
        opt = $('.operation'),
        date = $('.date span'),
        content = $('.content');

    if (!task.done) {
        var optStr = '<a><img src="img/check.png" style="width: 26px; heigth: 26px; padding-right: 20px;"></a>';
        optStr +=  '<a><img src="img/edit.png" style="width: 26px; heigth: 26px;"></a>';
        opt.innerHTML = optStr;
    }

    name.innerHTML = task.name;
    date.innerHTML = task.date;
    content.innerHTML = task.content;
}

/**
 * 清除任务列表的高亮
 * @return {[type]} [description]
 */
function cleanTaskSelected() {
    var taskLi = $('#task-list').getElementsByTagName('li');

    for (var i = 0, l = taskLi.length; i < l; i++) {
        removeClass(taskLi[i], 'selected');
    }
}

/**
 * 点击新增任务按钮
 * @return {[type]} [description]
 */
function clickAddTask() {
    if (currentCateId === -1 || currentCateTable !== 'childCate') {
        alert('请选择具体子分类，若没有，请先建立子分类');
    } else {
        $('.todo-name').innerHTML = '<input type="text" class="input-title" max-length="20" placeholder="请输入标题...">';
        $('.date span').innerHTML = '<input type="date" class="input-date">';
        $('.content').innerHTML = '<textarea class="text-content" placeholder="请输入内容..."></textarea>';
        $('.button-area').style.display = 'block';
    }
}


function hint() {
    var title = $('input-title').value,
        date = $('.input-date').value,
        content = $('.text-content').value,
        taskList = $('#task-list');

    if (!title) {
        alert('标题不能为空')；
    }
    if (!date) {
        alert('日期不能为空');
    }
    if (!content) {
        alert('输入内容不能为空');
    }
}

function updateTaskList() {
    var taskList = $('.task-list');

        if (currentCateTable === 'allCate') {
            taskList.innerHTML = createTaskList(queryAllTasks());
        } else if (currentCateTable === 'cate') {
            taskList.innerHTML = createTaskList(queryTasksByCateId(currentCateId));
        } else {
            taskList.innerHTML = createTaskList(queryTasksByChildCateId(currentCateId));
        }
}

/**
 * 点击保存按钮
 * @return {[type]} [description]
 */
function save() {
    hint();

    var taskObj = {
        name: title,
        date: date,
        content: content,
        done: false,
        parent: currentCateId;
    };

    currentTaskId = addTask(taskObj);
    updateTaskList();

    showTaskContentById(currentTaskId);
}


function cancelSave() {
    showTaskContentById(currentTaskId);
}

addEventListener($('save'), save);
addEventListener($('.cancel'), cancelSave);

/**
 * 点击check图标，将任务标记为已完成
 * @return {[type]} [description]
 */
function check() {
    if (confirm('确定将任务标记为已完成吗？')) {
        updateTaskStatusById(currentTaskId);
        showTaskContentById(currentTaskId);

        updateTaskList();
    }
}

/**
 * 点击编辑图标，修改任务内容
 * @return {[type]} [description]
 */
function edit() {
    var task = queryTaskById(currentTaskId);

    $('.todo-name').innerHTML = '<input type="text" class="input-title" max-length="20" placeholder="请输入标题..." value="' + task.name + '">';
    $('.date span').innerHTML = '<input type="date" class="input-date" value="' + task.date + '">';
    $('.content').innerHTML = '<textarea class="text-content" placeholder="请输入内容...">' + task.content + '</textarea>';
    $('.button-area').style.display = 'block';
}




