//C:\Users\Username\AppData\Local\Google\Chrome\User Data\Default\Local Storage
var currentCateId = -1,
    currentCateTable = "allCate",
    currentTaskId = -1,
    currentPage = 1,
    editSave = false;

function initAll() {
    // localStorage.clear();
    initDataBase();
    initCates();
    initPopUp();
    $('#task-list').innerHTML = createTaskList(queryAllTasks());
    createStatusTaskList();
    addClass($('[taskid]'), 'selected');
    showTaskContentById($('[taskid]').getAttribute('taskid'));
    listlocalStorage();

}

initAll();

addClickEvent($('.category .add'), clickAddCate);
addClickEvent($('.list-all .add'), clickAddTask);
addClickEvent($('#all-tasks'), function () {
    clickOnCate(this);
});
// addClickEvent($('#backto'), clickBackTo);

//功能函数模块

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
                'name': '默认分类',
                'child': [0]
            }
        ];

        var childCate = [
            {
                'id': 0,
                'parent': 0,
                'name': '默认子分类',
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
                'content': '这是一个个人任务管理系统，为离线应用，数据保存在本地硬盘。<br>'
            }
        ];

        localStorage.cate = JSON.stringify(cate);
        localStorage.childCate = JSON.stringify(childCate);
        localStorage.task = JSON.stringify(task);
    }
}

console.log(localStorage.cate);

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
        if (cate[i].id == id) {
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
        var childCate = queryChildCateById(cate.chlid[i]);
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
        var childCate = queryChildCateById(cateObj.child[i]);
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
function queryChildCateById(id) {
    var childCate = JSON.parse(localStorage.childCate),
        len = childCate.length;

    for (var i = 0; i < len; i++) {
        if (childCate[i].id == id) {
            return childCate[i];
        }
    }
}

/**
 * 根据id数组查询子分类
 * @param  {Array}
 * @return {Array} 子分类对象数组
 */
function queryChildCateByIdArr(idArr) {
    console.log('in queryChildCateByIdArr');

    if (isArray(idArr)) {
        var cateArr = [],
            len = idArr.length;

        for (var i = 0; i < len; i++) {
            cateArr.push(queryChildCateById(idArr[i]));
        }
        console.log(cateArr);
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
        if (allTasks[i].id == id) {
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
        arr = queryChildCateById(id).child,
        len = arr.length;
    console.log(JSON.stringify(queryChildCateById(id)));
    console.log('arr: ' + arr);

    for (var i = 0; i < len; i++) {
        var task = queryTaskById(arr[i]);

        if (typeof status !== 'boolean') {
            result.push(task);
        } else {
            if (status && task.done) {
                result.push(task);
            } else if (!status && !task.done) {
                result.push(task);
            }
        }

    }

    return result;
}

/**
 * 根据主分类id查询任务
 * @param  {number}
 * @param  {boolean}
 * @return {Array}
 */
function queryTasksByCateId(id, status) {
    console.log('in queryTasksByCateId');
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
    console.log(newChildCate);

    childCate.push(newChildCate);
    console.log(childCate);
    localStorage.childCate = JSON.stringify(childCate);

    updateCateChildByAdd(parent, newChildCate.id);
    console.log('after updateCateChildByAdd: ' + localStorage.cate);
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

    updateChildCateChildByAdd(obj.parent, obj.id);
    localStorage.task = JSON.stringify(allTasks);
    console.log('in addTask, allTasks: ' + localStorage.task);

    return obj.id;
}

/**
 * 更新主分类的child，添加一个childId
 * @param  {number} id      要更新的分类id
 * @param  {number} childId child中添加的id
 */
function updateCateChildByAdd(id, childId) {
    console.log('in updateCateChildByAdd');
    console.log(localStorage.cate);
    var cate = JSON.parse(localStorage.cate),
        len = cate.length;

    for (var i = 0; i < len; i++) {

        if (cate[i].id == id) {//id 是 string!!!
            cate[i].child.push(childId);
            break;
        }
    }

    localStorage.cate = JSON.stringify(cate);
}


/**
 * 更新主分类的child属性，删除一个childId
 * @param  {number} id
 * @param  {number} childId
 */
function updateCateChildByDel(id, childId) {
    var cate = JSON.parse(localStorage.cate),
        len = cate.length;
    for (var i = 0; i < len; i++) {
        var item = cate[i];

        if (item.id == id) {
            for (var j = 0; j < item.child.length; j++) {
                if (item.child[j] === childId) {
                    item.child.splice(j, 1);
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
        if (childCate[i].id == id) {
            childCate[i].child.push(childId);
            break;
        }
    }
    localStorage.childCate = JSON.stringify(childCate);
}

/**
 * 更新子分类的child属性，删除一个childId
 * @param  {number} id
 * @param  {number} childId
 */
function updateChildCateChildByDel(id, childId) {
    console.log('in updateChildCateChildByDel');
    var childCate = queryAllChildCates(),
        len = childCate.length;

    for (var i = 0; i < len; i++) {
        var item = childCate[i];
        if (item.id == id) {
            console.log(JSON.stringify(item.child));
            for (var j = 0; j < item.child.length; j++) {
                //item.child[j]本身就是id
                if (item.child[j] == childId) {
                    item.child.splice(j, 1);
                    break;
                }
            }
            console.log(JSON.stringify(item.child));
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
        if (allTasks[i].id == taskId) {
            allTasks[i].done = true;
            break;
        }
    }

    localStorage.task = JSON.stringify(allTasks);
    console.log('after updateTaskStatusById, task: ' + localStorage.task);
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
        var task = allTasks[i];
        if (task.id == id) {
            task.name = name;
            task.date = date;
            task.content = content;

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
    var cate = queryCates();
    console.log('id: ' + id);

    for (var i = 0; i < cate.length; i++) {
        var item = cate[i];
        console.log('in for');
        if (item.id == id) {
            cate.splice(i, 1);
            console.log('cate spliced: ' + cate);
            for (var j = 0, l = item.child.length; j < l; j++) {
                deleteChildCate(item.child[j]);
            }
        }
    }

    localStorage.cate = JSON.stringify(cate);
}

/**
 * 删除指定id的子类
 * @param  {number} id 子分类
 */
function deleteChildCate(id) {
    console.log('in deleteChildCate');
    var childCate = queryAllChildCates();

    for (var i = 0; i < childCate.length; i++) {
        var item = childCate[i];
        if (item.id == id) {
            childCate.splice(i, 1);
            //删除子分类下所有任务
            console.log(item.child);
            for (var j = 0, l = item.child.length; j < l; j++) {
            console.log(l);
                deleteTaskById(item.child[j]);
            }
            updateCateChildByDel(item.parent, item.id);
        }
    }

    localStorage.childCate = JSON.stringify(childCate);
}

/**
 * 根据id删除任务
 * @param  {number} id 任务id
 */
function deleteTaskById(id) {
    console.log('in deleteTaskById');
    var allTasks = queryAllTasks();

    for (var i = 0; i < allTasks.length; i++) {
        var item = allTasks[i];
        if (item.id == id) {
            allTasks.splice(i, 1);
            //删除一个后，i位置的元素是原来i + 1位置的元素
            updateChildCateChildByDel(item.parent, item.id);
            break;
        }
    }

    localStorage.task = JSON.stringify(allTasks);
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

function initCates() {
    console.log('in initCates');
    var cate = queryCates(),
        defaultChildCate = queryChildCateById(0),
        str = '<ul class="folder-wrap">';

    for (var i = 0; i < cate.length; i++) {
        var liStr = '';
        if (cate[i].child.length === 0) {
            liStr = '<li><p class="folder no-default" onclick="clickOnCate(this)" cateid='+ cate[i].id + '><i class="fa fa-folder-open folder-icon" style="padding-right: 5px;" aria-hidden="true"></i>' + cate[i].name + '(' + queryTasksNumByCate(cate[i]) + ')<i class="fa fa-trash-o del" style="color: #b00d07;" onclick="del(event, this)"></i></p></li>';
        } else {
            if (cate[i].id === 0) {
                liStr =  '<li><p class="folder" onclick="clickOnCate(this)" cateid='+ cate[i].id + '><i class="fa fa-folder-open folder-icon" style="padding-right: 5px;" aria-hidden="true"></i>' + cate[i].name + '(1)</p><ul class="file-wrap">';
                liStr += '<li><p class="file" onclick="clickOnCate(this)" cateid='+ defaultChildCate.id + '><i class="fa fa-file-o file-icon" style="padding-right: 5px;" aria-hidden="true"></i>' + defaultChildCate.name + '(1)</li>';
            } else {
                liStr = '<li><p class="folder no-default" onclick="clickOnCate(this)" cateid='+ cate[i].id + '><i class="fa fa-folder-open folder-icon" style="padding-right: 5px;" aria-hidden="true"></i>' + cate[i].name + '(' + queryTasksNumByCate(cate[i]) + ')<i class="fa fa-trash-o del" style="color: #b00d07;" onclick="del(event, this)"></i></p><ul class="file-wrap">';
                console.log(cate[i].child);

                var childCate = queryChildCateByIdArr(cate[i].child);
                for (var j = 0; j < childCate.length; j++) {
                    var childLiStr = '';
                    childLiStr = '<li class="file no-default" onclick="clickOnCate(this)" cateid='+ childCate[j].id + '><i class="fa fa-file-o file-icon" style="padding-right: 5px;" aria-hidden="true"></i>' + childCate[j].name + '(' + childCate[j].child.length +')'
                    +'<i class="fa fa-trash-o del" style="color: #b00d07;" onclick="del(event, this)"></i></li>'
                    liStr += childLiStr;
                }
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
        if (cate[i].id !== 0) {
            options += '<option value="' + cate[i].id + '">' + cate[i].name + '</option>';
        }
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
function del(e, ele) {
    //阻止事件冒泡
    if (window.event) {
        window.event.cancelBubble = true;
    } else {
        e.stopPropagation();
    }

    console.log(ele);
    var clickedEle = ele.parentNode;
    console.log(clickedEle);

    if (/folder/.test(clickedEle.className)) {
        if (confirm("是否确定删除分类？")) {
            deleteCate(clickedEle.getAttribute('cateid'));
        }
    } else if (/file/.test(clickedEle.className)) {
        if (confirm("是否确定删除子分类？")) {
            deleteChildCate(clickedEle.getAttribute('cateid'));
        }
    } else if (/task-self/.test(clickedEle.className)) {
        if (confirm('是否确定删除此任务')) {
            deleteTaskById(clickedEle.getAttribute('taskid'));
        }
    }

    initCates();
    $('#task-list').innerHTML = createTaskList(queryAllTasks());

    clickOnCate($('#all-tasks'));
}

/**
 * 浮层确认按钮
 */
function ok() {
    var optionValue = $('#select-cate').value,
        inputCate = $('#input-cate').value;

    if (inputCate === '') {
        alert('请输入新分类名称');
        return;
    }
    console.log(typeof optionValue);// string!!!
    console.log(inputCate);

    if (optionValue == -1) {
        console.log('about going in addCate');
        addCate(inputCate);
    } else {
        console.log('about going in addChildCate');
        addChildCate(optionValue, inputCate);
    }
    console.log(localStorage.cate);
    initCates();

    $('.cover').style.display = 'none';
    //新增了（主）分类，更新浮层
    initPopUp();
}

/**
 * 浮层取消按钮
 */
function cancel() {
    $('.cover').style.display = 'none';
}

/**
 * 点击分类显示任务列表
 * @param  {Object} ele 点击的DOM元素
 * @return {[type]}     [description]
 */
function clickOnCate(ele) {
    console.log('in clickOnCate');
    cleanAllSelected();
    addClass(ele, 'selected');

    var taskList = $('#task-list'),
        cateId = ele.getAttribute('cateid');
        console.log('cateid:' + cateId);

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

    cleanStatusSelected();
    addClass($('#all'), 'selected');
    //将第一个task高亮
    if ($('[taskid]')) {
        addClass($('[taskid]'), 'selected');
    }

    showTaskContentById(currentTaskId);

    setCurr2();
}

/**
 * 清除高亮
 * @return {[type]} [description]
 */
function cleanAllSelected() {
    var folderEle = document.getElementsByClassName('folder'),
        fileEle = document.getElementsByClassName('file');

    for (var i = 0, l = folderEle.length; i < l; i++) {
        removeClass(folderEle[i], 'selected');
    }
    for (var i = 0, l = fileEle.length; i < l; i++) {
        removeClass(fileEle[i], 'selected');
    }
    removeClass($('#all-tasks'), 'selected');
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
        if (dateArr.indexOf(task[i].date) === -1) {
            dateArr.push(task[i].date);
        }
    }
    console.log('dateArr:    ' + dateArr);
    //对日期进行排序
    dateArr = dateArr.sort();
    console.log('dateArr:    ' + dateArr);

    for (var i = 0; i < dateArr.length; i++) {
        var obj = {};
        obj.date = dateArr[i];
        obj.task = queryTasksByDateInTaskArr(dateArr[i], task);
        sortedTask.push(obj);
    }
    //
    currentTaskId = sortedTask[0].task[0].id;

    return sortedTask;
}


/**
 * 创建任务列表
 * @param  {Array} task 需要显示在列表中的任务数组
 * @return {String}      任务列表的html内容
 */

function createTaskList(task) {
    console.log('in createTaskList, task: ' + JSON.stringify(task));
    var str = '';

    if (!task.length) {
        return str;
    }
    var sortedTask = createDateSortedData(task);
    console.log('sortedTask: ' + JSON.stringify(sortedTask));
    //命名冲突！！！
    for (var i = 0, l = sortedTask.length; i < l; i++) {
        console.log('l:' + l);
        //liStr表示一个日期下的一个任务
        var item = sortedTask[i];
        str += '<div class="time">' + item.date + '</div><ul>';
        for (var j = 0, len = item.task.length; j < len; j++) {
            var liStr = '';
            if (item.task[j].done) {

                if (item.task[j].id == -1) {
                    liStr = '<li class="task-done task-self" taskid="' + item.task[j].id + '" onclick="clickOnTask(this)"><i class="fa fa-check" style="color: #23b812; padding-right: 5px;" aria-hidden="true"></i>' + item.task[j].name + '</li>';
                } else {
                    liStr = '<li class="task-done task-self" taskid="' + item.task[j].id + '" onclick="clickOnTask(this)"><i class="fa fa-check" style="color: #23b812; padding-right: 5px;" aria-hidden="true"></i>' + item.task[j].name + '<i class="fa fa-trash-o del" style="color: #b00d07;" onclick="del(event, this)"></i></li>';
                }

            } else {
                liStr = '<li class="task-self" taskid="' + item.task[j].id + '" onclick="clickOnTask(this)">' + item.task[j].name + '<i class="fa fa-trash-o del" style="color: #b00d07;" onclick="del(event, this)"></i></li>';
            }
            str += liStr;
        }

        str += '</ul>';
    }

    // console.log(str);
    return str;
}


function cleanStatusSelected() {
    removeClass($('#all'), 'selected');
    removeClass($('#done'), 'selected');
    removeClass($('#undone'), 'selected');
}

/**
 * 根据不同的状态更改任务列表内容
 * @param  {Object} ele    点击的状态按钮
 * @param  {[type]} status
 * @return {[type]}        [description]
 */
function  filterTaskByStatus(ele, status) {
    cleanStatusSelected();
    addClass(ele, 'selected');

    var taskList = $('#task-list');

    if (currentCateId == -1) {
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
    addClickEvent($('#undone'), function () {
        filterTaskByStatus(this, false);
    });
    addClickEvent($('#done'), function () {
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

    setCurr3();
}

/**
 * 根据任务id在右侧显示任务的具体信息
 * @param  {number} id
 * @return {[type]}    [description]
 */
function showTaskContentById(id) {
    console.log('in showTaskContentById');
    var task = queryTaskById(id);
    console.log(task.done);

    if (!task.done) {
        var optStr = '<i class="fa fa-pencil-square-o" id="edit-icon" style="font-size: 25px; margin-right: 15px; cursor: pointer;" aria-hidden="true"></i>';
        optStr +=  '<i class="fa fa-check-square-o" id="check-icon" style="font-size: 25px; cursor: pointer;" aria-hidden="true"></i>';
        $('.operation').innerHTML = optStr;
        addClickEvent($('#check-icon'), check);
        addClickEvent($('#edit-icon'), edit);
    } else {
        $('.operation').innerHTML = '';
    }

    $('.todo-name').innerHTML = task.name;
    $('.date span').innerHTML = task.date;
    $('.content').innerHTML = task.content;
    $('.button-area').style.display = 'none';

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
    console.log('in clickAddTask');
    console.log(typeof currentCateId);
    if (currentCateId == -1 || currentCateTable !== 'childCate') {
        alert('请选择具体子分类，若没有，请先建立子分类');
        setCurr1();
    } else if (currentCateId == 0) {
        alert('不能给默认子分类添加任务');
        setCurr1();
    } else {
        createEditArea();

        setCurr3();
    }
}

function createEditArea() {
    $('.todo-name').innerHTML = '<input type="text" class="input-title" max-length="20" placeholder="请输入标题...">';
    $('.date span').innerHTML = '<input type="date" class="input-date">';
    $('.content').innerHTML = '<textarea class="text-content" placeholder="请输入内容..."></textarea>';
    $('.button-area').style.display = 'block';
}


function updateTaskList() {
    console.log('in updateTaskList');
    var taskList = $('#task-list');

        if (currentCateTable === 'allCate') {
            console.log('allCate');
            taskList.innerHTML = createTaskList(queryAllTasks());
        } else if (currentCateTable === 'cate') {
            console.log('cate');
            taskList.innerHTML = createTaskList(queryTasksByCateId(currentCateId));
        } else {
            console.log('childCate');
            console.log(currentCateId);
            taskList.innerHTML = createTaskList(queryTasksByChildCateId(currentCateId));
        }
}

/**
 * 点击保存按钮
 * @return {[type]} [description]
 */
function save() {
    var title = $('.input-title').value,
        date = $('.input-date').value,
        content = $('.text-content').value,
        taskList = $('#task-list');

    if (!(title && date && content)) {
        alert('标题、日期和任务内容都不能为空，请重新输入。');
        createEditArea();
        return;
    }
    if (editSave) {
        var temp1 = currentTaskId;

        console.log('before:' + localStorage.task);
        updateTaskById(currentTaskId, title, date, content);
        console.log('after:' + localStorage.task);
    } else {
        var taskObj = {};
        taskObj.name = title;
        taskObj.date = date;
        taskObj.content = content;
        taskObj.done = false;
        taskObj.parent = currentCateId;

        //updateTaskList()中调用createTaskList(),再调用createDateSortedData()中会改变currentTaskId
        var temp2 = addTask(taskObj);
        console.log('after addTask, currentTaskId:  ' + temp2);
    }

    updateTaskList();
    console.log('currentTaskId again: ' + currentTaskId);

    currentTaskId = editSave ? temp1 : temp2;
    showTaskContentById(currentTaskId);
    initCates();
    // addClass($('[cateid == currentCateId]'), 'selected');
    editSave = false;
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

        // updateTaskList();
        filterTaskByStatus($('#all'));
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

function setCurr1() {
    $('.category').setAttribute('class', 'category view curr');
    $('.list-all').setAttribute('class', 'list-all view next');
    currentPage = 1;
    clickBackTo(1);
}

function setCurr2() {
    $('.category').setAttribute('class', 'category view last');
    $('.list-all').setAttribute('class', 'list-all view curr');
    $('.description').setAttribute('class', 'description view next');
    currentPage = 2;
    clickBackTo(2);
}

function setCurr3() {
    $('.list-all').setAttribute('class', 'list-all view last');
    $('.description').setAttribute('class', 'description view curr');
    currentPage = 3;
    clickBackTo(3);
}


function clickBackTo(currentPage) {
    if (window.innerWidth < 760) {
        var backTo = $('#backto');

        switch (currentPage) {
            case 1:
                backTo.style.display = 'none';
                break;
            case 2:
                backTo.style.display = 'block';
                addClickEvent(backTo, function () {
                    setCurr1();
                });
                // addClickEvent(backTo, setCurr1);
                break;
            case 3:
                backTo.style.display = 'block';
                addClickEvent(backTo, function () {
                    setCurr2();
                });
                // addClickEvent(backTo, setCurr2);
                break;
            default:
                break;
        }
    }
 }

 window.onresize = function () {
     if (window.innerWidth > 760) {
         $('#backto').style.display = 'none';
     } else {
         clickBackTo(currentPage);
     }
 }
