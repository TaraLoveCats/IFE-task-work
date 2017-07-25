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
    obj.id = task[task.length - 1].id + 1;
    task.push(obj);

    updateCateChildByAdd(obj.parent, obj.id);
    localStorage.task = JSON.stringify(task);

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
            allTasks[i].finished = true;
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
