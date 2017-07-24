var currentCateId = -1,
    currentCateTable = "AllCate",
    currentTaskId = -1;

initAll();

function initAll() {
    initDataBase();
    iniCates();
    initModal();
    $('.task-list').innerHTML = createTaskList(queryAllTasks());
    cateStatusControl();
    generateTaskById(-1);
    addClass($('[data-taskId]'), 'selected');
    listAllStorage();
}

/**
 * cate分类
 * childCate子分类
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
                'name': '默认子分类'，
                'child': [-1],
                'parent': 0
            }
        ];

        var task = [
            {
                'id': -1,
                'finished': true,
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
        if (status && task[i].finished) {
            result.push(task[i]);
        }
        else if (!status && !task[i].finished) {
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
 * @param  {boolean}
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
        if (status && task[i].finished) {
            result.push(task);
        }
        else if (!status && !task[i].finished) {
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
