define(['util'], function (util) {
    /**
     * cate分类
     *
     * childCate子分类
     *
     * task任务
     */

    var initDataBase = function () {
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
    };

    console.log(localStorage.cate);

    /**
     * 查询所有分类
     * @return {Array} 对象数组
     */
    var queryCates = function () {
        return JSON.parse(localStorage.cate);
    };

    /**
     * 根据任务id查询
     * @param  {number} id
     * @return {Object} 一个分类对象
     */
    var queryCateById = function (id) {
        var cate = JSON.parse(localStorage.cate),
            len = cate.length;

        for (var i = 0; i < len; i++) {
            if (cate[i].id == id) {
                return cate[i];
            }
        }
    };

    /**
     * 根据主分类id查询任务个数
     * @param  {number} id
     * @return {number}
     */
    var queryTasksNumByCateId = function (id) {
        var cate = queryCateById(id),
            result = 0,
            len = cate.child.length;

        for (var i = 0; i < len; i++) {
            var childCate = queryChildCateById(cate.chlid[i]);
            result += childCate.child.length;
        }

        return result;
    };

    /**
     * 根据主分类查询任务个数
     * @param  {Object}
     * @return {number}
     */
    var queryTasksNumByCate = function (cateObj) {
        var result = 0,
            len = cateObj.child.length;

        for (var i = 0; i < len; i++) {
            var childCate = queryChildCateById(cateObj.child[i]);
             result += childCate.child.length;
        }

        return result;
    };

    /**
     * 查询所有子分类
     * @return {Array} 子分类对象数组
     */
    var queryAllChildCates = function () {
        return JSON.parse(localStorage.childCate);
    };

    /**
     * 根据id 查询子分类
     * @param  {number} id
     * @return {Object}
     */
    var queryChildCateById = function (id) {
        var childCate = JSON.parse(localStorage.childCate),
            len = childCate.length;

        for (var i = 0; i < len; i++) {
            if (childCate[i].id == id) {
                return childCate[i];
            }
        }
    };

    /**
     * 根据id数组查询子分类
     * @param  {Array}
     * @return {Array} 子分类对象数组
     */
    var queryChildCateByIdArr = function (idArr) {
        console.log('in queryChildCateByIdArr');

        if (util.isArray(idArr)) {
            var cateArr = [],
                len = idArr.length;

            for (var i = 0; i < len; i++) {
                cateArr.push(queryChildCateById(idArr[i]));
            }
            console.log(cateArr);
            return cateArr;
        }
    };

    /**
     * 查询所有任务
     * @param  {boolean} 任务完成状态
     * @return {Array} 任务对象数组
     */
    var queryAllTasks = function (status) {
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
    };

    /**
     * 根据任务日期查询任务
     * @param  {string} 日期字符串
     * @param  {Array} 任务对象列表
     * @return {Array}
     */
    var queryTasksByDateInTaskArr = function (date, taskArr) {
        var task = [],
            len = taskArr.length;

        for (var i = 0; i < len; i++) {
            if (taskArr[i].date === date) {
                task.push(taskArr[i]);
            }
        }

        return task;
    };

    /**
     * 根据任务id查询任务
     * @param  {number}
     * @return {Object} 一个任务对象
     */
    var queryTaskById = function (id) {
        var allTasks = queryAllTasks(),
            len = allTasks.length;

        for (var i = 0; i < len; i++) {
            if (allTasks[i].id == id) {
                return allTasks[i];
            }
        }
    };

    /**
     * 根据子分类id查询任务
     * @param  {number}
     * @param  {boolean} 任务完成状态
     * @return {Array} 任务对象数组
     */
    var queryTasksByChildCateId = function (id, status) {
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
    };

    /**
     * 根据主分类id查询任务
     * @param  {number}
     * @param  {boolean}
     * @return {Array}
     */
    var queryTasksByCateId = function (id, status) {
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
    };

    /**
     * 添加分类
     * @param {String} name 新分类的名称
     */
    var addCate = function (name) {

        var cate = JSON.parse(localStorage.cate),
            newCate = {};
        newCate.id = cate[cate.length - 1].id + 1;
        newCate.name = name;
        newCate.child = [];

        cate.push(newCate);
        localStorage.cate = JSON.stringify(cate);
    };

    /**
     * 添加子分类
     * @param {number} parent 父节点的id
     * @param {String} name   新子分类的名称
     */
    var addChildCate = function (parent, name) {
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
    };

    /**
     * 添加任务
     * @param {Object} obj 一个没有id的任务对象
     * @return {number} 任务的id
     */
    var addTask = function (obj) {
        var allTasks = queryAllTasks();
        obj.id = allTasks[allTasks.length - 1].id + 1;
        allTasks.push(obj);

        updateChildCateChildByAdd(obj.parent, obj.id);
        localStorage.task = JSON.stringify(allTasks);
        console.log('in addTask, allTasks: ' + localStorage.task);

        return obj.id;
    };

    /**
     * 更新主分类的child，添加一个childId
     * @param  {number} id      要更新的分类id
     * @param  {number} childId child中添加的id
     */
    var updateCateChildByAdd = function (id, childId) {
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
    };


    /**
     * 更新主分类的child属性，删除一个childId
     * @param  {number} id
     * @param  {number} childId
     */
    var updateCateChildByDel = function (id, childId) {
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
    };

    /**
     * 更新子分类的child,添加一个childId
     * @param  {number} id
     * @param  {number} childId
     */
    var updateChildCateChildByAdd = function (id, childId) {
        var childCate = queryAllChildCates(),
            len = childCate.length;

        for (var i = 0; i < len; i++) {
            if (childCate[i].id == id) {
                childCate[i].child.push(childId);
                break;
            }
        }
        localStorage.childCate = JSON.stringify(childCate);
    };

    /**
     * 更新子分类的child属性，删除一个childId
     * @param  {number} id
     * @param  {number} childId
     */
    var updateChildCateChildByDel = function (id, childId) {
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
    };

    /**
     * 根据任务id更新任务状态
     * @param  {number} taskId 任务id
     */
    var updateTaskStatusById = function (taskId) {
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
    };


    /**
     * 修改任务
     * @param  {number} id      任务id
     * @param  {String} name    任务名称
     * @param  {String} date    任务日期
     * @param  {String} content 任务内容
     */
    var updateTaskById = function (id, name, date, content) {
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
    };

    /**
     * 删除指定id的分类
     * @param  {number} id 任务id
     */
    var deleteCate = function (id) {
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
    };

    /**
     * 删除指定id的子类
     * @param  {number} id 子分类
     */
    var deleteChildCate = function (id) {
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
    };

    /**
     * 根据id删除任务
     * @param  {number} id 任务id
     */
    var deleteTaskById = function (id) {
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
    };

    return {
        initDataBase: initDataBase,
        queryCates: queryCates,
        queryCateById: queryCateById,
        queryTasksNumByCateId: queryTasksNumByCateId,
        queryTasksNumByCate: queryTasksNumByCate,
        queryAllChildCates: queryAllChildCates,
        queryChildCateById: queryChildCateById,
        queryChildCateByIdArr: queryChildCateByIdArr,
        queryAllTasks: queryAllTasks,
        queryTasksByDateInTaskArr: queryTasksByDateInTaskArr,
        queryTaskById: queryTaskById,
        queryTasksByChildCateId: queryTasksByChildCateId,
        queryTasksByCateId: queryTasksByCateId,

        addCate: addCate,
        addChildCate: addChildCate,
        addTask: addTask,

        updateCateChildByAdd: updateCateChildByAdd,
        updateCateChildByDel: updateCateChildByDel,
        updateChildCateChildByAdd: updateChildCateChildByAdd,
        updateChildCateChildByDel: updateChildCateChildByDel,
        updateTaskStatusById: updateTaskStatusById,
        updateTaskById: updateTaskById,

        deleteCate: deleteCate,
        deleteChildCate: deleteChildCate,
        deleteTaskById: deleteTaskById
    };
});
