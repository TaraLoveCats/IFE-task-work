define(['util', 'data'], function (util, data) {

    var currentCateId = -1,
        currentCateTable = "allCate",
        currentTaskId = -1,
        currentPage = 1,
        editSave = false;

    var initAll = function () {

        data.initDataBase();
        initCates();
        initPopUp();
        util.$('#task-list').innerHTML = createTaskList(data.queryAllTasks());
        createStatusTaskList();
        util.addClass(util.$('[taskid]'), 'selected');
        showTaskContentById(util.$('[taskid]').getAttribute('taskid'));
        optTouchDevice();

        document.ontouchmove = function (e) {
            e.preventDefault();
        };

        util.addClickEvent(util.$('.category .add'), clickAddCate);
        util.addClickEvent(util.$('.list-all .add'), clickAddTask);
        util.addClickEvent(util.$('#all-tasks'), function () {
            clickOnCate(this);
        });

        util.addClickEvent(util.$('#backto'), clickBackTo);

        util.addClickEvent(util.$('.save'), save);
        util.addClickEvent(util.$('.cancel-save'), cancelSave);
        util.addClickEvent(util.$('.ok'), ok);
        util.addClickEvent(util.$('.cancel-ok'), cancel);

        //事件代理
        util.delegateEvent(util.$('#list-content'), 'p', 'click', function () {
            clickOnCate(this);
        });
        util.delegateEvent(util.$('#task-list'), 'li', 'click', function () {
            clickOnTask(this);
        });

        util.delegateDelEvent(util.$('#list-content'), 'fa-trash-o', 'click', function () {
            del(event, this);
        });
        util.delegateDelEvent(util.$('#task-list'), 'fa-trash-o', 'click', function () {
            del(event, this);
        });

        util.addEvent(window, 'resize', function () {
            if (window.innerWidth > 760) {
                util.$('#backto').style.display = 'none';
            } else if (!is_touch_device()){
                console.log('in window.onresize');
                clickBackTo(currentPage);
            }
        });
    };

    /**
     * 初始化分类列表
     */

    var initCates = function () {
        console.log('in initCates');
        var cate = data.queryCates(),
            defaultChildCate =data.queryChildCateById(0),
            str = '<ul class="folder-wrap">';

        for (var i = 0; i < cate.length; i++) {
            var liStr = '';
            if (cate[i].child.length === 0) {
                liStr = '<li><p class="folder no-default" cateid='+ cate[i].id + '><i class="fa fa-folder-open folder-icon" style="padding-right: 5px;" aria-hidden="true"></i>' + cate[i].name + '(' + data.queryTasksNumByCate(cate[i]) + ')<i class="fa fa-trash-o del" style="color: #b00d07;"></i></p></li>';
            } else {
                if (cate[i].id === 0) {
                    liStr =  '<li><p class="folder" cateid='+ cate[i].id + '><i class="fa fa-folder-open folder-icon" style="padding-right: 5px;" aria-hidden="true"></i>' + cate[i].name + '(1)</p><ul class="file-wrap">';
                    liStr += '<li><p class="file" cateid='+ defaultChildCate.id + '><i class="fa fa-file-o file-icon" style="padding-right: 5px;" aria-hidden="true"></i>' + defaultChildCate.name + '(1)</li>';
                } else {
                    liStr = '<li><p class="folder no-default" cateid='+ cate[i].id + '><i class="fa fa-folder-open folder-icon" style="padding-right: 5px;" aria-hidden="true"></i>' + cate[i].name + '(' + data.queryTasksNumByCate(cate[i]) + ')<i class="fa fa-trash-o del" style="color: #b00d07;"></i></p><ul class="file-wrap">';
                    console.log(cate[i].child);

                    var childCate = data.queryChildCateByIdArr(cate[i].child);
                    for (var j = 0; j < childCate.length; j++) {
                        var childLiStr = '';
                        childLiStr = '<li><p class="file no-default" cateid='+ childCate[j].id + '><i class="fa fa-file-o file-icon" style="padding-right: 5px;" aria-hidden="true"></i>' + childCate[j].name + '(' + childCate[j].child.length +')' + '<i class="fa fa-trash-o del" style="color: #b00d07;"></i></p><li>';
                        liStr += childLiStr;
                    }
                }
                liStr += '</ul></li>';
            }
            str += liStr;
        }
        str += '</ul>';

        util.$('#list-content').innerHTML = str;
        util.$('#all-tasks span').innerHTML = data.queryAllTasks().length;
    };


    /**
     * 初始化浮层
     */
    var initPopUp = function () {
        var cate = data.queryCates(),
            options = '<option value="-1">新增主分类</option>';
        for (var i = 0; i < cate.length; i++) {
            if (cate[i].id !== 0) {
                options += '<option value="' + cate[i].id + '">' + cate[i].name + '</option>';
            }
        }

        util.$('#select-cate').innerHTML = options;
        util.$('#input-cate').innerHTML = '';
    };


    /**
     * 显示浮层
     */
    var clickAddCate = function () {
        var cover = util.$('.cover');
        cover.style.display = 'block';
    };

    /**
     * 删除分类图标回调函数
     * @param  {Object} e   event
     * @param  {Object} ele DOM元素
     * @return {[type]}     [description]
     */
    var del = function (e, ele) {
        //阻止事件冒泡
        // if (window.event) {
        //     window.event.cancelBubble = true;
        // } else {
        //     e.stopPropagation();
        // }

        console.log(ele);
        var clickedEle = ele.parentNode;
        console.log(clickedEle);

        if (/folder/.test(clickedEle.className)) {
            if (confirm("是否确定删除分类？")) {
                data.deleteCate(clickedEle.getAttribute('cateid'));
            }
        } else if (/file/.test(clickedEle.className)) {
            if (confirm("是否确定删除子分类？")) {
                data.deleteChildCate(clickedEle.getAttribute('cateid'));
            }
        } else if (/task-self/.test(clickedEle.className)) {
            if (confirm('是否确定删除此任务')) {
                data.deleteTaskById(clickedEle.getAttribute('taskid'));
            }
        }

        initCates();
        util.$('#task-list').innerHTML = createTaskList(data.queryAllTasks());

        clickOnCate(util.$('#all-tasks'));
    };

    /**
     * 浮层确认按钮
     */
    var ok = function () {
        var optionValue = util.$('#select-cate').value,
            inputCate = util.$('#input-cate').value;

        if (inputCate === '') {
            alert('请输入新分类名称');
            return;
        }
        console.log(typeof optionValue);// string!!!
        console.log(inputCate);

        if (optionValue == -1) {
            console.log('about going in addCate');
            data.addCate(inputCate);
        } else {
            console.log('about going in addChildCate');
            data.addChildCate(optionValue, inputCate);
        }
        console.log(localStorage.cate);
        initCates();

        util.$('.cover').style.display = 'none';
        //新增了（主）分类，更新浮层
        initPopUp();
    };

    /**
     * 浮层取消按钮
     */
    var cancel = function () {
        util.$('.cover').style.display = 'none';
    };

    /**
     * 点击分类显示任务列表
     * @param  {Object} ele 点击的DOM元素
     * @return {[type]}     [description]
     */
    var clickOnCate = function (ele) {
        console.log('in clickOnCate');
        cleanAllSelected();
        util.addClass(ele, 'selected');

        var taskList = util.$('#task-list'),
            cateId = ele.getAttribute('cateid');
            console.log('cateid:' + cateId);

        if (ele.getAttribute('id') === 'all-tasks') {

            taskList.innerHTML = createTaskList(data.queryAllTasks());
            currentCateId = -1;
            currentCateTable = 'allCate';
        } else if (/folder/.test(ele.className)) {

            taskList.innerHTML = createTaskList(data.queryTasksByCateId(cateId));
            currentCateId = cateId;
            currentCateTable = 'cate';
        } else if (/file/.test(ele.className)) {
            taskList.innerHTML = createTaskList(data.queryTasksByChildCateId(cateId));
            currentCateId = cateId;
            currentCateTable = 'childCate';
        }

        cleanStatusSelected();
        util.addClass(util.$('#all'), 'selected');
        //将第一个task高亮
        if (util.$('[taskid]')) {
            util.addClass(util.$('[taskid]'), 'selected');
        }

        showTaskContentById(currentTaskId);

        setCurr2();
    };

    /**
     * 清除高亮
     * @return {[type]} [description]
     */
    var cleanAllSelected = function () {
        var folderEle = document.getElementsByClassName('folder'),
            fileEle = document.getElementsByClassName('file');

        for (var i = 0, l = folderEle.length; i < l; i++) {
            util.removeClass(folderEle[i], 'selected');
        }
        for (var j = 0, len = fileEle.length; j < len; j++) {
            util.removeClass(fileEle[j], 'selected');
        }
        util.removeClass(util.$('#all-tasks'), 'selected');
    };


    /**
     * 创建和日期关联的数据对象
     * @param  {Array} task 任务数组
     * @return {Array}      日期任务对象数组
     */
    var createDateSortedData = function (task) {
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

        for (var j = 0; j < dateArr.length; j++) {
            var obj = {};
            obj.date = dateArr[i];
            obj.task =data. queryTasksByDateInTaskArr(dateArr[i], task);
            sortedTask.push(obj);
        }
        //
        currentTaskId = sortedTask[0].task[0].id;

        return sortedTask;
    };


    /**
     * 创建任务列表
     * @param  {Array} task 需要显示在列表中的任务数组
     * @return {String}      任务列表的html内容
     */

    var createTaskList = function (task) {
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
                        liStr = '<li class="task-done task-self" taskid="' + item.task[j].id + '"><i class="fa fa-check" style="color: #23b812; padding-right: 5px;" aria-hidden="true"></i>' + item.task[j].name + '</li>';
                    } else {
                        liStr = '<li class="task-done task-self" taskid="' + item.task[j].id + '"><i class="fa fa-check" style="color: #23b812; padding-right: 5px;" aria-hidden="true"></i>' + item.task[j].name + '<i class="fa fa-trash-o del" style="color: #b00d07;"></i></li>';
                    }

                } else {
                    liStr = '<li class="task-self" taskid="' + item.task[j].id + '">' + item.task[j].name + '<i class="fa fa-trash-o del" style="color: #b00d07;"></i></li>';
                }
                str += liStr;
            }

            str += '</ul>';
        }

        // console.log(str);
        return str;
    };


    var cleanStatusSelected = function () {
        util.removeClass(util.$('#all'), 'selected');
        util.removeClass(util.$('#done'), 'selected');
        util.removeClass(util.$('#undone'), 'selected');
    };

    /**
     * 根据不同的状态更改任务列表内容
     * @param  {Object} ele    点击的状态按钮
     * @param  {[type]} status
     * @return {[type]}        [description]
     */
    var filterTaskByStatus = function (ele, status) {
        cleanStatusSelected();
        util.addClass(ele, 'selected');

        var taskList = util.$('#task-list');

        if (currentCateId == -1) {
            taskList.innerHTML = createTaskList(data.queryAllTasks(status));
        } else if (currentCateTable === 'cate') {
            taskList.innerHTML = createTaskList(data.queryTasksByCateId(currentCateId, status));
        } else {
            taskList.innerHTML = createTaskList(data.queryTasksByChildCateId(currentCateId, status));
        }
    };

    /**
     * 添加事件侦听，显示列表内容
     * @return {[type]} [description]
     */
    var createStatusTaskList = function () {
        util.addClickEvent(util.$('#all'), function () {
            filterTaskByStatus(this);
        });
        util.addClickEvent(util.$('#undone'), function () {
            filterTaskByStatus(this, false);
        });
        util.addClickEvent(util.$('#done'), function () {
            filterTaskByStatus(this, true);
        });
    };

    /**
     * 点击任务
     * @param  {Object} ele 点击的任务对象
     * @return {[type]}     [description]
     */
    var clickOnTask = function (ele) {
        cleanTaskSelected();
        util.addClass(ele, 'selected');

        var taskId = ele.getAttribute('taskid');
        currentTaskId = taskId;

        showTaskContentById(taskId);

        setCurr3();
    };

    /**
     * 根据任务id在右侧显示任务的具体信息
     * @param  {number} id
     * @return {[type]}    [description]
     */
    var showTaskContentById = function (id) {
        console.log('in showTaskContentById');
        var task = data.queryTaskById(id);
        console.log(task.done);

        if (!task.done) {
            var optStr = '<i class="fa fa-pencil-square-o" id="edit-icon" style="font-size: 25px; margin-right: 15px; cursor: pointer;" aria-hidden="true"></i>';
            optStr +=  '<i class="fa fa-check-square-o" id="check-icon" style="font-size: 25px; cursor: pointer;" aria-hidden="true"></i>';
            util.$('.operation').innerHTML = optStr;
            util.addClickEvent(util.$('#check-icon'), check);
            util.addClickEvent(util.$('#edit-icon'), edit);
        } else {
            util.$('.operation').innerHTML = '';
        }

        util.$('.todo-name').innerHTML = task.name;
        util.$('.date span').innerHTML = task.date;
        util.$('.content').innerHTML = task.content;
        util.$('.button-area').style.display = 'none';

    };

    /**
     * 清除任务列表的高亮
     * @return {[type]} [description]
     */
    var cleanTaskSelected = function () {
        var taskLi = util.$('#task-list').getElementsByTagName('li');

        for (var i = 0, l = taskLi.length; i < l; i++) {
            util.removeClass(taskLi[i], 'selected');
        }
    };

    /**
     * 点击新增任务按钮
     * @return {[type]} [description]
     */
    var clickAddTask = function () {
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
    };

    var createEditArea = function () {
        util.$('.todo-name').innerHTML = '<input type="text" class="input-title" maxlength="15" placeholder="请输入标题（不超过15字符）...">';
        util.$('.date span').innerHTML = '<input type="date" class="input-date">';
        util.$('.content').innerHTML = '<textarea class="text-content" placeholder="请输入内容..."></textarea>';
        util.$('.button-area').style.display = 'block';
    };


    var updateTaskList = function () {
        console.log('in updateTaskList');
        var taskList = util.$('#task-list');

            if (currentCateTable === 'allCate') {
                console.log('allCate');
                taskList.innerHTML = createTaskList(data.queryAllTasks());
            } else if (currentCateTable === 'cate') {
                console.log('cate');
                taskList.innerHTML = createTaskList(data.queryTasksByCateId(currentCateId));
            } else {
                console.log('childCate');
                console.log(currentCateId);
                taskList.innerHTML = createTaskList(data.queryTasksByChildCateId(currentCateId));
            }
    };

    /**
     * 点击保存按钮
     * @return {[type]} [description]
     */
    var save = function () {
        var title = util.$('.input-title').value,
            date = util.$('.input-date').value,
            content = util.$('.text-content').value,
            taskList = util.$('#task-list'),
            temp1,
            temp2;

        if (!(title && date && content)) {
            alert('标题、日期和任务内容都不能为空，请重新输入。');
            createEditArea();
            return;
        }
        if (editSave) {
            temp1 = currentTaskId;

            console.log('before:' + localStorage.task);
            data.updateTaskById(currentTaskId, title, date, content);
            console.log('after:' + localStorage.task);
        } else {
            var taskObj = {};
            taskObj.name = util.escape(title);
            taskObj.date = util.escape(date);
            taskObj.content = util.escape(content);
            taskObj.done = false;
            taskObj.parent = currentCateId;

            console.log(taskObj);
            //updateTaskList()中调用createTaskList(),再调用createDateSortedData()中会改变currentTaskId
            temp2 = data.addTask(taskObj);
            console.log('after addTask, currentTaskId:  ' + temp2);
        }

        updateTaskList();
        console.log('currentTaskId again: ' + currentTaskId);

        currentTaskId = editSave ? temp1 : temp2;
        showTaskContentById(currentTaskId);
        initCates();
        // addClass(util.$('[cateid == currentCateId]'), 'selected');
        editSave = false;
    };

    var cancelSave = function () {
        showTaskContentById(currentTaskId);
    };

    /**
     * 点击check图标，将任务标记为已完成
     * @return {[type]} [description]
     */
    var check = function () {
        if (confirm('确定将任务标记为已完成吗？')) {
            data.updateTaskStatusById(currentTaskId);
            showTaskContentById(currentTaskId);

            // updateTaskList();
            filterTaskByStatus(util.$('#all'));
        }
    };

    /**
     * 点击编辑图标，修改任务内容
     * @return {[type]} [description]
     */
    var edit = function () {
        var task = data.queryTaskById(currentTaskId);

        util.$('.todo-name').innerHTML = '<input type="text" class="input-title" max-length="20" placeholder="请输入标题..." value="' + task.name + '">';
        util.$('.date span').innerHTML = '<input type="date" class="input-date" value="' + task.date + '">';
        util.$('.content').innerHTML = '<textarea class="text-content" placeholder="请输入内容...">' + task.content + '</textarea>';
        util.$('.button-area').style.display = 'block';

        editSave = true;
    };

    /**
    *设置当前页面
    **/
    var setCurr1 = function () {
        console.log('in setCurr1');
        util.$('.category').setAttribute('class', 'category view curr');
        util.$('.list-all').setAttribute('class', 'list-all view next');
        currentPage = 1;

        showBackTo(1);
    };

    var setCurr2 = function () {
        console.log('in setCurr2');
        util.$('.category').setAttribute('class', 'category view last');
        util.$('.list-all').setAttribute('class', 'list-all view curr');
        util.$('.description').setAttribute('class', 'description view next');
        currentPage = 2;

        showBackTo(2);
    };

    var setCurr3 = function () {
        console.log('in setCurr3');
        util.$('.list-all').setAttribute('class', 'list-all view last');
        util.$('.description').setAttribute('class', 'description view curr');
        currentPage = 3;

        showBackTo(3);
    };

     /**
     *根据当前页面显示返回按钮
     **/
     var showBackTo = function (currentPage) {
         if (window.innerWidth < 760) {
             var backTo = util.$('#backto');

             switch (currentPage) {
                 case 1:
                     backTo.style.display = 'none';
                     break;
                 case 2:
                     backTo.style.display = 'block';
                     break;
                 case 3:
                     backTo.style.display = 'block';
                     break;
                 default:
                     break;
             }
         }
     };

    /**
    *“返回”按钮的回调函数
    **/
    var clickBackTo = function () {
        if (window.innerWidth < 760) {
            console.log('in clickBackTo');
            console.log('currentPage: ' +  currentPage);

            var backTo = util.$('#backto');

            switch (currentPage) {
                case 2:
                    setCurr1();
                    break;
                case 3:
                    setCurr2();
                    break;
                default:
                    break;
            }
        }
    };

    /**
    *检测是否为touch-device
    **/
     var is_touch_device = function () {
         return 'ontouchstart' in window || navigator.maxTouchPoints;
     };

     /**
     *取消touch-device的hover样式
     **/
     var optTouchDevice = function () {
         console.log('touch-device?  '+ is_touch_device());
         if (is_touch_device()) {
            var styleSheet = document.styleSheets[0],
                len = styleSheet.cssRules.length;
            styleSheet.insertRule('#all-tasks:hover {border: none; border-radius: 0; box-shadow: none; transition: none;}', len);
            styleSheet.insertRule('.folder:hover {border: none; border-radius: 0; box-shadow: none; transition: none;}', len + 1);
            styleSheet.insertRule('.file:hover {border: none; border-radius: 0; box-shadow: none; transition: none;}', len + 2);
            styleSheet.insertRule('.task-self:hover {border: none; border-radius: 0; box-shadow: none; transition: none;}', len + 3);
            styleSheet.insertRule('.add:hover {box-shadow: none; transition: none;}', len + 4);
            styleSheet.insertRule('.filter:hover {color: #000;}', len + 5);
            styleSheet.insertRule('.del {visibility: visible;}', len + 6);
         }
     };

     return {
        initAll: initAll
     };

});

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

/** vim: et:ts=4:sw=4:sts=4
 * @license RequireJS 2.3.4 Copyright jQuery Foundation and other contributors.
 * Released under MIT license, https://github.com/requirejs/requirejs/blob/master/LICENSE
 */
var requirejs,require,define;!function(global,setTimeout){function commentReplace(e,t){return t||""}function isFunction(e){return"[object Function]"===ostring.call(e)}function isArray(e){return"[object Array]"===ostring.call(e)}function each(e,t){if(e){var i;for(i=0;i<e.length&&(!e[i]||!t(e[i],i,e));i+=1);}}function eachReverse(e,t){if(e){var i;for(i=e.length-1;i>-1&&(!e[i]||!t(e[i],i,e));i-=1);}}function hasProp(e,t){return hasOwn.call(e,t)}function getOwn(e,t){return hasProp(e,t)&&e[t]}function eachProp(e,t){var i;for(i in e)if(hasProp(e,i)&&t(e[i],i))break}function mixin(e,t,i,r){return t&&eachProp(t,function(t,n){!i&&hasProp(e,n)||(!r||"object"!=typeof t||!t||isArray(t)||isFunction(t)||t instanceof RegExp?e[n]=t:(e[n]||(e[n]={}),mixin(e[n],t,i,r)))}),e}function bind(e,t){return function(){return t.apply(e,arguments)}}function scripts(){return document.getElementsByTagName("script")}function defaultOnError(e){throw e}function getGlobal(e){if(!e)return e;var t=global;return each(e.split("."),function(e){t=t[e]}),t}function makeError(e,t,i,r){var n=new Error(t+"\nhttp://requirejs.org/docs/errors.html#"+e);return n.requireType=e,n.requireModules=r,i&&(n.originalError=i),n}function newContext(e){function t(e){var t,i;for(t=0;t<e.length;t++)if("."===(i=e[t]))e.splice(t,1),t-=1;else if(".."===i){if(0===t||1===t&&".."===e[2]||".."===e[t-1])continue;t>0&&(e.splice(t-1,2),t-=2)}}function i(e,i,r){var n,o,a,s,u,c,d,p,f,l,h=i&&i.split("/"),m=y.map,g=m&&m["*"];if(e&&(c=(e=e.split("/")).length-1,y.nodeIdCompat&&jsSuffixRegExp.test(e[c])&&(e[c]=e[c].replace(jsSuffixRegExp,"")),"."===e[0].charAt(0)&&h&&(e=h.slice(0,h.length-1).concat(e)),t(e),e=e.join("/")),r&&m&&(h||g)){e:for(a=(o=e.split("/")).length;a>0;a-=1){if(u=o.slice(0,a).join("/"),h)for(s=h.length;s>0;s-=1)if((n=getOwn(m,h.slice(0,s).join("/")))&&(n=getOwn(n,u))){d=n,p=a;break e}!f&&g&&getOwn(g,u)&&(f=getOwn(g,u),l=a)}!d&&f&&(d=f,p=l),d&&(o.splice(0,p,d),e=o.join("/"))}return getOwn(y.pkgs,e)||e}function r(e){isBrowser&&each(scripts(),function(t){if(t.getAttribute("data-requiremodule")===e&&t.getAttribute("data-requirecontext")===q.contextName)return t.parentNode.removeChild(t),!0})}function n(e){var t=getOwn(y.paths,e);if(t&&isArray(t)&&t.length>1)return t.shift(),q.require.undef(e),q.makeRequire(null,{skipMap:!0})([e]),!0}function o(e){var t,i=e?e.indexOf("!"):-1;return i>-1&&(t=e.substring(0,i),e=e.substring(i+1,e.length)),[t,e]}function a(e,t,r,n){var a,s,u,c,d=null,p=t?t.name:null,f=e,l=!0,h="";return e||(l=!1,e="_@r"+(T+=1)),c=o(e),d=c[0],e=c[1],d&&(d=i(d,p,n),s=getOwn(j,d)),e&&(d?h=r?e:s&&s.normalize?s.normalize(e,function(e){return i(e,p,n)}):-1===e.indexOf("!")?i(e,p,n):e:(d=(c=o(h=i(e,p,n)))[0],h=c[1],r=!0,a=q.nameToUrl(h))),u=!d||s||r?"":"_unnormalized"+(A+=1),{prefix:d,name:h,parentMap:t,unnormalized:!!u,url:a,originalName:f,isDefine:l,id:(d?d+"!"+h:h)+u}}function s(e){var t=e.id,i=getOwn(S,t);return i||(i=S[t]=new q.Module(e)),i}function u(e,t,i){var r=e.id,n=getOwn(S,r);!hasProp(j,r)||n&&!n.defineEmitComplete?(n=s(e)).error&&"error"===t?i(n.error):n.on(t,i):"defined"===t&&i(j[r])}function c(e,t){var i=e.requireModules,r=!1;t?t(e):(each(i,function(t){var i=getOwn(S,t);i&&(i.error=e,i.events.error&&(r=!0,i.emit("error",e)))}),r||req.onError(e))}function d(){globalDefQueue.length&&(each(globalDefQueue,function(e){var t=e[0];"string"==typeof t&&(q.defQueueMap[t]=!0),O.push(e)}),globalDefQueue=[])}function p(e){delete S[e],delete k[e]}function f(e,t,i){var r=e.map.id;e.error?e.emit("error",e.error):(t[r]=!0,each(e.depMaps,function(r,n){var o=r.id,a=getOwn(S,o);!a||e.depMatched[n]||i[o]||(getOwn(t,o)?(e.defineDep(n,j[o]),e.check()):f(a,t,i))}),i[r]=!0)}function l(){var e,t,i=1e3*y.waitSeconds,o=i&&q.startTime+i<(new Date).getTime(),a=[],s=[],u=!1,d=!0;if(!x){if(x=!0,eachProp(k,function(e){var i=e.map,c=i.id;if(e.enabled&&(i.isDefine||s.push(e),!e.error))if(!e.inited&&o)n(c)?(t=!0,u=!0):(a.push(c),r(c));else if(!e.inited&&e.fetched&&i.isDefine&&(u=!0,!i.prefix))return d=!1}),o&&a.length)return e=makeError("timeout","Load timeout for modules: "+a,null,a),e.contextName=q.contextName,c(e);d&&each(s,function(e){f(e,{},{})}),o&&!t||!u||!isBrowser&&!isWebWorker||w||(w=setTimeout(function(){w=0,l()},50)),x=!1}}function h(e){hasProp(j,e[0])||s(a(e[0],null,!0)).init(e[1],e[2])}function m(e,t,i,r){e.detachEvent&&!isOpera?r&&e.detachEvent(r,t):e.removeEventListener(i,t,!1)}function g(e){var t=e.currentTarget||e.srcElement;return m(t,q.onScriptLoad,"load","onreadystatechange"),m(t,q.onScriptError,"error"),{node:t,id:t&&t.getAttribute("data-requiremodule")}}function v(){var e;for(d();O.length;){if(null===(e=O.shift())[0])return c(makeError("mismatch","Mismatched anonymous define() module: "+e[e.length-1]));h(e)}q.defQueueMap={}}var x,b,q,E,w,y={waitSeconds:7,baseUrl:"./",paths:{},bundles:{},pkgs:{},shim:{},config:{}},S={},k={},M={},O=[],j={},P={},R={},T=1,A=1;return E={require:function(e){return e.require?e.require:e.require=q.makeRequire(e.map)},exports:function(e){if(e.usingExports=!0,e.map.isDefine)return e.exports?j[e.map.id]=e.exports:e.exports=j[e.map.id]={}},module:function(e){return e.module?e.module:e.module={id:e.map.id,uri:e.map.url,config:function(){return getOwn(y.config,e.map.id)||{}},exports:e.exports||(e.exports={})}}},b=function(e){this.events=getOwn(M,e.id)||{},this.map=e,this.shim=getOwn(y.shim,e.id),this.depExports=[],this.depMaps=[],this.depMatched=[],this.pluginMaps={},this.depCount=0},b.prototype={init:function(e,t,i,r){r=r||{},this.inited||(this.factory=t,i?this.on("error",i):this.events.error&&(i=bind(this,function(e){this.emit("error",e)})),this.depMaps=e&&e.slice(0),this.errback=i,this.inited=!0,this.ignore=r.ignore,r.enabled||this.enabled?this.enable():this.check())},defineDep:function(e,t){this.depMatched[e]||(this.depMatched[e]=!0,this.depCount-=1,this.depExports[e]=t)},fetch:function(){if(!this.fetched){this.fetched=!0,q.startTime=(new Date).getTime();var e=this.map;if(!this.shim)return e.prefix?this.callPlugin():this.load();q.makeRequire(this.map,{enableBuildCallback:!0})(this.shim.deps||[],bind(this,function(){return e.prefix?this.callPlugin():this.load()}))}},load:function(){var e=this.map.url;P[e]||(P[e]=!0,q.load(this.map.id,e))},check:function(){if(this.enabled&&!this.enabling){var e,t,i=this.map.id,r=this.depExports,n=this.exports,o=this.factory;if(this.inited){if(this.error)this.emit("error",this.error);else if(!this.defining){if(this.defining=!0,this.depCount<1&&!this.defined){if(isFunction(o)){if(this.events.error&&this.map.isDefine||req.onError!==defaultOnError)try{n=q.execCb(i,o,r,n)}catch(t){e=t}else n=q.execCb(i,o,r,n);if(this.map.isDefine&&void 0===n&&((t=this.module)?n=t.exports:this.usingExports&&(n=this.exports)),e)return e.requireMap=this.map,e.requireModules=this.map.isDefine?[this.map.id]:null,e.requireType=this.map.isDefine?"define":"require",c(this.error=e)}else n=o;if(this.exports=n,this.map.isDefine&&!this.ignore&&(j[i]=n,req.onResourceLoad)){var a=[];each(this.depMaps,function(e){a.push(e.normalizedMap||e)}),req.onResourceLoad(q,this.map,a)}p(i),this.defined=!0}this.defining=!1,this.defined&&!this.defineEmitted&&(this.defineEmitted=!0,this.emit("defined",this.exports),this.defineEmitComplete=!0)}}else hasProp(q.defQueueMap,i)||this.fetch()}},callPlugin:function(){var e=this.map,t=e.id,r=a(e.prefix);this.depMaps.push(r),u(r,"defined",bind(this,function(r){var n,o,d,f=getOwn(R,this.map.id),l=this.map.name,h=this.map.parentMap?this.map.parentMap.name:null,m=q.makeRequire(e.parentMap,{enableBuildCallback:!0});return this.map.unnormalized?(r.normalize&&(l=r.normalize(l,function(e){return i(e,h,!0)})||""),o=a(e.prefix+"!"+l,this.map.parentMap,!0),u(o,"defined",bind(this,function(e){this.map.normalizedMap=o,this.init([],function(){return e},null,{enabled:!0,ignore:!0})})),void((d=getOwn(S,o.id))&&(this.depMaps.push(o),this.events.error&&d.on("error",bind(this,function(e){this.emit("error",e)})),d.enable()))):f?(this.map.url=q.nameToUrl(f),void this.load()):((n=bind(this,function(e){this.init([],function(){return e},null,{enabled:!0})})).error=bind(this,function(e){this.inited=!0,this.error=e,e.requireModules=[t],eachProp(S,function(e){0===e.map.id.indexOf(t+"_unnormalized")&&p(e.map.id)}),c(e)}),n.fromText=bind(this,function(i,r){var o=e.name,u=a(o),d=useInteractive;r&&(i=r),d&&(useInteractive=!1),s(u),hasProp(y.config,t)&&(y.config[o]=y.config[t]);try{req.exec(i)}catch(e){return c(makeError("fromtexteval","fromText eval for "+t+" failed: "+e,e,[t]))}d&&(useInteractive=!0),this.depMaps.push(u),q.completeLoad(o),m([o],n)}),void r.load(e.name,m,n,y))})),q.enable(r,this),this.pluginMaps[r.id]=r},enable:function(){k[this.map.id]=this,this.enabled=!0,this.enabling=!0,each(this.depMaps,bind(this,function(e,t){var i,r,n;if("string"==typeof e){if(e=a(e,this.map.isDefine?this.map:this.map.parentMap,!1,!this.skipMap),this.depMaps[t]=e,n=getOwn(E,e.id))return void(this.depExports[t]=n(this));this.depCount+=1,u(e,"defined",bind(this,function(e){this.undefed||(this.defineDep(t,e),this.check())})),this.errback?u(e,"error",bind(this,this.errback)):this.events.error&&u(e,"error",bind(this,function(e){this.emit("error",e)}))}i=e.id,r=S[i],hasProp(E,i)||!r||r.enabled||q.enable(e,this)})),eachProp(this.pluginMaps,bind(this,function(e){var t=getOwn(S,e.id);t&&!t.enabled&&q.enable(e,this)})),this.enabling=!1,this.check()},on:function(e,t){var i=this.events[e];i||(i=this.events[e]=[]),i.push(t)},emit:function(e,t){each(this.events[e],function(e){e(t)}),"error"===e&&delete this.events[e]}},q={config:y,contextName:e,registry:S,defined:j,urlFetched:P,defQueue:O,defQueueMap:{},Module:b,makeModuleMap:a,nextTick:req.nextTick,onError:c,configure:function(e){if(e.baseUrl&&"/"!==e.baseUrl.charAt(e.baseUrl.length-1)&&(e.baseUrl+="/"),"string"==typeof e.urlArgs){var t=e.urlArgs;e.urlArgs=function(e,i){return(-1===i.indexOf("?")?"?":"&")+t}}var i=y.shim,r={paths:!0,bundles:!0,config:!0,map:!0};eachProp(e,function(e,t){r[t]?(y[t]||(y[t]={}),mixin(y[t],e,!0,!0)):y[t]=e}),e.bundles&&eachProp(e.bundles,function(e,t){each(e,function(e){e!==t&&(R[e]=t)})}),e.shim&&(eachProp(e.shim,function(e,t){isArray(e)&&(e={deps:e}),!e.exports&&!e.init||e.exportsFn||(e.exportsFn=q.makeShimExports(e)),i[t]=e}),y.shim=i),e.packages&&each(e.packages,function(e){var t;t=(e="string"==typeof e?{name:e}:e).name,e.location&&(y.paths[t]=e.location),y.pkgs[t]=e.name+"/"+(e.main||"main").replace(currDirRegExp,"").replace(jsSuffixRegExp,"")}),eachProp(S,function(e,t){e.inited||e.map.unnormalized||(e.map=a(t,null,!0))}),(e.deps||e.callback)&&q.require(e.deps||[],e.callback)},makeShimExports:function(e){return function(){var t;return e.init&&(t=e.init.apply(global,arguments)),t||e.exports&&getGlobal(e.exports)}},makeRequire:function(t,n){function o(i,r,u){var d,p,f;return n.enableBuildCallback&&r&&isFunction(r)&&(r.__requireJsBuild=!0),"string"==typeof i?isFunction(r)?c(makeError("requireargs","Invalid require call"),u):t&&hasProp(E,i)?E[i](S[t.id]):req.get?req.get(q,i,t,o):(p=a(i,t,!1,!0),d=p.id,hasProp(j,d)?j[d]:c(makeError("notloaded",'Module name "'+d+'" has not been loaded yet for context: '+e+(t?"":". Use require([])")))):(v(),q.nextTick(function(){v(),(f=s(a(null,t))).skipMap=n.skipMap,f.init(i,r,u,{enabled:!0}),l()}),o)}return n=n||{},mixin(o,{isBrowser:isBrowser,toUrl:function(e){var r,n=e.lastIndexOf("."),o=e.split("/")[0],a="."===o||".."===o;return-1!==n&&(!a||n>1)&&(r=e.substring(n,e.length),e=e.substring(0,n)),q.nameToUrl(i(e,t&&t.id,!0),r,!0)},defined:function(e){return hasProp(j,a(e,t,!1,!0).id)},specified:function(e){return e=a(e,t,!1,!0).id,hasProp(j,e)||hasProp(S,e)}}),t||(o.undef=function(e){d();var i=a(e,t,!0),n=getOwn(S,e);n.undefed=!0,r(e),delete j[e],delete P[i.url],delete M[e],eachReverse(O,function(t,i){t[0]===e&&O.splice(i,1)}),delete q.defQueueMap[e],n&&(n.events.defined&&(M[e]=n.events),p(e))}),o},enable:function(e){getOwn(S,e.id)&&s(e).enable()},completeLoad:function(e){var t,i,r,o=getOwn(y.shim,e)||{},a=o.exports;for(d();O.length;){if(null===(i=O.shift())[0]){if(i[0]=e,t)break;t=!0}else i[0]===e&&(t=!0);h(i)}if(q.defQueueMap={},r=getOwn(S,e),!t&&!hasProp(j,e)&&r&&!r.inited){if(!(!y.enforceDefine||a&&getGlobal(a)))return n(e)?void 0:c(makeError("nodefine","No define call for "+e,null,[e]));h([e,o.deps||[],o.exportsFn])}l()},nameToUrl:function(e,t,i){var r,n,o,a,s,u,c,d=getOwn(y.pkgs,e);if(d&&(e=d),c=getOwn(R,e))return q.nameToUrl(c,t,i);if(req.jsExtRegExp.test(e))s=e+(t||"");else{for(r=y.paths,o=(n=e.split("/")).length;o>0;o-=1)if(a=n.slice(0,o).join("/"),u=getOwn(r,a)){isArray(u)&&(u=u[0]),n.splice(0,o,u);break}s=n.join("/"),s=("/"===(s+=t||(/^data\:|^blob\:|\?/.test(s)||i?"":".js")).charAt(0)||s.match(/^[\w\+\.\-]+:/)?"":y.baseUrl)+s}return y.urlArgs&&!/^blob\:/.test(s)?s+y.urlArgs(e,s):s},load:function(e,t){req.load(q,e,t)},execCb:function(e,t,i,r){return t.apply(r,i)},onScriptLoad:function(e){if("load"===e.type||readyRegExp.test((e.currentTarget||e.srcElement).readyState)){interactiveScript=null;var t=g(e);q.completeLoad(t.id)}},onScriptError:function(e){var t=g(e);if(!n(t.id)){var i=[];return eachProp(S,function(e,r){0!==r.indexOf("_@r")&&each(e.depMaps,function(e){if(e.id===t.id)return i.push(r),!0})}),c(makeError("scripterror",'Script error for "'+t.id+(i.length?'", needed by: '+i.join(", "):'"'),e,[t.id]))}}},q.require=q.makeRequire(),q}function getInteractiveScript(){return interactiveScript&&"interactive"===interactiveScript.readyState?interactiveScript:(eachReverse(scripts(),function(e){if("interactive"===e.readyState)return interactiveScript=e}),interactiveScript)}var req,s,head,baseElement,dataMain,src,interactiveScript,currentlyAddingScript,mainScript,subPath,version="2.3.4",commentRegExp=/\/\*[\s\S]*?\*\/|([^:"'=]|^)\/\/.*$/gm,cjsRequireRegExp=/[^.]\s*require\s*\(\s*["']([^'"\s]+)["']\s*\)/g,jsSuffixRegExp=/\.js$/,currDirRegExp=/^\.\//,op=Object.prototype,ostring=op.toString,hasOwn=op.hasOwnProperty,isBrowser=!("undefined"==typeof window||"undefined"==typeof navigator||!window.document),isWebWorker=!isBrowser&&"undefined"!=typeof importScripts,readyRegExp=isBrowser&&"PLAYSTATION 3"===navigator.platform?/^complete$/:/^(complete|loaded)$/,defContextName="_",isOpera="undefined"!=typeof opera&&"[object Opera]"===opera.toString(),contexts={},cfg={},globalDefQueue=[],useInteractive=!1;if(void 0===define){if(void 0!==requirejs){if(isFunction(requirejs))return;cfg=requirejs,requirejs=void 0}void 0===require||isFunction(require)||(cfg=require,require=void 0),req=requirejs=function(e,t,i,r){var n,o,a=defContextName;return isArray(e)||"string"==typeof e||(o=e,isArray(t)?(e=t,t=i,i=r):e=[]),o&&o.context&&(a=o.context),(n=getOwn(contexts,a))||(n=contexts[a]=req.s.newContext(a)),o&&n.configure(o),n.require(e,t,i)},req.config=function(e){return req(e)},req.nextTick=void 0!==setTimeout?function(e){setTimeout(e,4)}:function(e){e()},require||(require=req),req.version=version,req.jsExtRegExp=/^\/|:|\?|\.js$/,req.isBrowser=isBrowser,s=req.s={contexts:contexts,newContext:newContext},req({}),each(["toUrl","undef","defined","specified"],function(e){req[e]=function(){var t=contexts[defContextName];return t.require[e].apply(t,arguments)}}),isBrowser&&(head=s.head=document.getElementsByTagName("head")[0],(baseElement=document.getElementsByTagName("base")[0])&&(head=s.head=baseElement.parentNode)),req.onError=defaultOnError,req.createNode=function(e,t,i){var r=e.xhtml?document.createElementNS("http://www.w3.org/1999/xhtml","html:script"):document.createElement("script");return r.type=e.scriptType||"text/javascript",r.charset="utf-8",r.async=!0,r},req.load=function(e,t,i){var r,n=e&&e.config||{};if(isBrowser)return(r=req.createNode(n,t,i)).setAttribute("data-requirecontext",e.contextName),r.setAttribute("data-requiremodule",t),!r.attachEvent||r.attachEvent.toString&&r.attachEvent.toString().indexOf("[native code")<0||isOpera?(r.addEventListener("load",e.onScriptLoad,!1),r.addEventListener("error",e.onScriptError,!1)):(useInteractive=!0,r.attachEvent("onreadystatechange",e.onScriptLoad)),r.src=i,n.onNodeCreated&&n.onNodeCreated(r,n,t,i),currentlyAddingScript=r,baseElement?head.insertBefore(r,baseElement):head.appendChild(r),currentlyAddingScript=null,r;if(isWebWorker)try{setTimeout(function(){},0),importScripts(i),e.completeLoad(t)}catch(r){e.onError(makeError("importscripts","importScripts failed for "+t+" at "+i,r,[t]))}},isBrowser&&!cfg.skipDataMain&&eachReverse(scripts(),function(e){if(head||(head=e.parentNode),dataMain=e.getAttribute("data-main"))return mainScript=dataMain,cfg.baseUrl||-1!==mainScript.indexOf("!")||(src=mainScript.split("/"),mainScript=src.pop(),subPath=src.length?src.join("/")+"/":"./",cfg.baseUrl=subPath),mainScript=mainScript.replace(jsSuffixRegExp,""),req.jsExtRegExp.test(mainScript)&&(mainScript=dataMain),cfg.deps=cfg.deps?cfg.deps.concat(mainScript):[mainScript],!0}),define=function(e,t,i){var r,n;"string"!=typeof e&&(i=t,t=e,e=null),isArray(t)||(i=t,t=null),!t&&isFunction(i)&&(t=[],i.length&&(i.toString().replace(commentRegExp,commentReplace).replace(cjsRequireRegExp,function(e,i){t.push(i)}),t=(1===i.length?["require"]:["require","exports","module"]).concat(t))),useInteractive&&(r=currentlyAddingScript||getInteractiveScript())&&(e||(e=r.getAttribute("data-requiremodule")),n=contexts[r.getAttribute("data-requirecontext")]),n?(n.defQueue.push([e,t,i]),n.defQueueMap[e]=!0):globalDefQueue.push([e,t,i])},define.amd={jQuery:!0},req.exec=function(text){return eval(text)},req(cfg)}}(this,"undefined"==typeof setTimeout?void 0:setTimeout);
;(function () {
	'use strict';

	/**
	 * @preserve FastClick: polyfill to remove click delays on browsers with touch UIs.
	 *
	 * @codingstandard ftlabs-jsv2
	 * @copyright The Financial Times Limited [All Rights Reserved]
	 * @license MIT License (see LICENSE.txt)
	 */

	/*jslint browser:true, node:true*/
	/*global define, Event, Node*/


	/**
	 * Instantiate fast-clicking listeners on the specified layer.
	 *
	 * @constructor
	 * @param {Element} layer The layer to listen on
	 * @param {Object} [options={}] The options to override the defaults
	 */
	function FastClick(layer, options) {
		var oldOnClick;

		options = options || {};

		/**
		 * Whether a click is currently being tracked.
		 *
		 * @type boolean
		 */
		this.trackingClick = false;


		/**
		 * Timestamp for when click tracking started.
		 *
		 * @type number
		 */
		this.trackingClickStart = 0;


		/**
		 * The element being tracked for a click.
		 *
		 * @type EventTarget
		 */
		this.targetElement = null;


		/**
		 * X-coordinate of touch start event.
		 *
		 * @type number
		 */
		this.touchStartX = 0;


		/**
		 * Y-coordinate of touch start event.
		 *
		 * @type number
		 */
		this.touchStartY = 0;


		/**
		 * ID of the last touch, retrieved from Touch.identifier.
		 *
		 * @type number
		 */
		this.lastTouchIdentifier = 0;


		/**
		 * Touchmove boundary, beyond which a click will be cancelled.
		 *
		 * @type number
		 */
		this.touchBoundary = options.touchBoundary || 10;


		/**
		 * The FastClick layer.
		 *
		 * @type Element
		 */
		this.layer = layer;

		/**
		 * The minimum time between tap(touchstart and touchend) events
		 *
		 * @type number
		 */
		this.tapDelay = options.tapDelay || 200;

		/**
		 * The maximum time for a tap
		 *
		 * @type number
		 */
		this.tapTimeout = options.tapTimeout || 700;

		if (FastClick.notNeeded(layer)) {
			return;
		}

		// Some old versions of Android don't have Function.prototype.bind
		function bind(method, context) {
			return function() { return method.apply(context, arguments); };
		}


		var methods = ['onMouse', 'onClick', 'onTouchStart', 'onTouchMove', 'onTouchEnd', 'onTouchCancel'];
		var context = this;
		for (var i = 0, l = methods.length; i < l; i++) {
			context[methods[i]] = bind(context[methods[i]], context);
		}

		// Set up event handlers as required
		if (deviceIsAndroid) {
			layer.addEventListener('mouseover', this.onMouse, true);
			layer.addEventListener('mousedown', this.onMouse, true);
			layer.addEventListener('mouseup', this.onMouse, true);
		}

		layer.addEventListener('click', this.onClick, true);
		layer.addEventListener('touchstart', this.onTouchStart, false);
		layer.addEventListener('touchmove', this.onTouchMove, false);
		layer.addEventListener('touchend', this.onTouchEnd, false);
		layer.addEventListener('touchcancel', this.onTouchCancel, false);

		// Hack is required for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
		// which is how FastClick normally stops click events bubbling to callbacks registered on the FastClick
		// layer when they are cancelled.
		if (!Event.prototype.stopImmediatePropagation) {
			layer.removeEventListener = function(type, callback, capture) {
				var rmv = Node.prototype.removeEventListener;
				if (type === 'click') {
					rmv.call(layer, type, callback.hijacked || callback, capture);
				} else {
					rmv.call(layer, type, callback, capture);
				}
			};

			layer.addEventListener = function(type, callback, capture) {
				var adv = Node.prototype.addEventListener;
				if (type === 'click') {
					adv.call(layer, type, callback.hijacked || (callback.hijacked = function(event) {
						if (!event.propagationStopped) {
							callback(event);
						}
					}), capture);
				} else {
					adv.call(layer, type, callback, capture);
				}
			};
		}

		// If a handler is already declared in the element's onclick attribute, it will be fired before
		// FastClick's onClick handler. Fix this by pulling out the user-defined handler function and
		// adding it as listener.
		if (typeof layer.onclick === 'function') {

			// Android browser on at least 3.2 requires a new reference to the function in layer.onclick
			// - the old one won't work if passed to addEventListener directly.
			oldOnClick = layer.onclick;
			layer.addEventListener('click', function(event) {
				oldOnClick(event);
			}, false);
			layer.onclick = null;
		}
	}

	/**
	* Windows Phone 8.1 fakes user agent string to look like Android and iPhone.
	*
	* @type boolean
	*/
	var deviceIsWindowsPhone = navigator.userAgent.indexOf("Windows Phone") >= 0;

	/**
	 * Android requires exceptions.
	 *
	 * @type boolean
	 */
	var deviceIsAndroid = navigator.userAgent.indexOf('Android') > 0 && !deviceIsWindowsPhone;


	/**
	 * iOS requires exceptions.
	 *
	 * @type boolean
	 */
	var deviceIsIOS = /iP(ad|hone|od)/.test(navigator.userAgent) && !deviceIsWindowsPhone;


	/**
	 * iOS 4 requires an exception for select elements.
	 *
	 * @type boolean
	 */
	var deviceIsIOS4 = deviceIsIOS && (/OS 4_\d(_\d)?/).test(navigator.userAgent);


	/**
	 * iOS 6.0-7.* requires the target element to be manually derived
	 *
	 * @type boolean
	 */
	var deviceIsIOSWithBadTarget = deviceIsIOS && (/OS [6-7]_\d/).test(navigator.userAgent);

	/**
	 * BlackBerry requires exceptions.
	 *
	 * @type boolean
	 */
	var deviceIsBlackBerry10 = navigator.userAgent.indexOf('BB10') > 0;

	/**
	 * Determine whether a given element requires a native click.
	 *
	 * @param {EventTarget|Element} target Target DOM element
	 * @returns {boolean} Returns true if the element needs a native click
	 */
	FastClick.prototype.needsClick = function(target) {
		switch (target.nodeName.toLowerCase()) {

		// Don't send a synthetic click to disabled inputs (issue #62)
		case 'button':
		case 'select':
		case 'textarea':
			if (target.disabled) {
				return true;
			}

			break;
		case 'input':

			// File inputs need real clicks on iOS 6 due to a browser bug (issue #68)
			if ((deviceIsIOS && target.type === 'file') || target.disabled) {
				return true;
			}

			break;
		case 'label':
		case 'iframe': // iOS8 homescreen apps can prevent events bubbling into frames
		case 'video':
			return true;
		}

		return (/\bneedsclick\b/).test(target.className);
	};


	/**
	 * Determine whether a given element requires a call to focus to simulate click into element.
	 *
	 * @param {EventTarget|Element} target Target DOM element
	 * @returns {boolean} Returns true if the element requires a call to focus to simulate native click.
	 */
	FastClick.prototype.needsFocus = function(target) {
		switch (target.nodeName.toLowerCase()) {
		case 'textarea':
			return true;
		case 'select':
			return !deviceIsAndroid;
		case 'input':
			switch (target.type) {
			case 'button':
			case 'checkbox':
			case 'file':
			case 'image':
			case 'radio':
			case 'submit':
				return false;
			}

			// No point in attempting to focus disabled inputs
			return !target.disabled && !target.readOnly;
		default:
			return (/\bneedsfocus\b/).test(target.className);
		}
	};


	/**
	 * Send a click event to the specified element.
	 *
	 * @param {EventTarget|Element} targetElement
	 * @param {Event} event
	 */
	FastClick.prototype.sendClick = function(targetElement, event) {
		var clickEvent, touch;

		// On some Android devices activeElement needs to be blurred otherwise the synthetic click will have no effect (#24)
		if (document.activeElement && document.activeElement !== targetElement) {
			document.activeElement.blur();
		}

		touch = event.changedTouches[0];

		// Synthesise a click event, with an extra attribute so it can be tracked
		clickEvent = document.createEvent('MouseEvents');
		clickEvent.initMouseEvent(this.determineEventType(targetElement), true, true, window, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, false, false, false, false, 0, null);
		clickEvent.forwardedTouchEvent = true;
		targetElement.dispatchEvent(clickEvent);
	};

	FastClick.prototype.determineEventType = function(targetElement) {

		//Issue #159: Android Chrome Select Box does not open with a synthetic click event
		if (deviceIsAndroid && targetElement.tagName.toLowerCase() === 'select') {
			return 'mousedown';
		}

		return 'click';
	};


	/**
	 * @param {EventTarget|Element} targetElement
	 */
	FastClick.prototype.focus = function(targetElement) {
		var length;

		// Issue #160: on iOS 7, some input elements (e.g. date datetime month) throw a vague TypeError on setSelectionRange. These elements don't have an integer value for the selectionStart and selectionEnd properties, but unfortunately that can't be used for detection because accessing the properties also throws a TypeError. Just check the type instead. Filed as Apple bug #15122724.
		if (deviceIsIOS && targetElement.setSelectionRange && targetElement.type.indexOf('date') !== 0 && targetElement.type !== 'time' && targetElement.type !== 'month') {
			length = targetElement.value.length;
			targetElement.setSelectionRange(length, length);
		} else {
			targetElement.focus();
		}
	};


	/**
	 * Check whether the given target element is a child of a scrollable layer and if so, set a flag on it.
	 *
	 * @param {EventTarget|Element} targetElement
	 */
	FastClick.prototype.updateScrollParent = function(targetElement) {
		var scrollParent, parentElement;

		scrollParent = targetElement.fastClickScrollParent;

		// Attempt to discover whether the target element is contained within a scrollable layer. Re-check if the
		// target element was moved to another parent.
		if (!scrollParent || !scrollParent.contains(targetElement)) {
			parentElement = targetElement;
			do {
				if (parentElement.scrollHeight > parentElement.offsetHeight) {
					scrollParent = parentElement;
					targetElement.fastClickScrollParent = parentElement;
					break;
				}

				parentElement = parentElement.parentElement;
			} while (parentElement);
		}

		// Always update the scroll top tracker if possible.
		if (scrollParent) {
			scrollParent.fastClickLastScrollTop = scrollParent.scrollTop;
		}
	};


	/**
	 * @param {EventTarget} targetElement
	 * @returns {Element|EventTarget}
	 */
	FastClick.prototype.getTargetElementFromEventTarget = function(eventTarget) {

		// On some older browsers (notably Safari on iOS 4.1 - see issue #56) the event target may be a text node.
		if (eventTarget.nodeType === Node.TEXT_NODE) {
			return eventTarget.parentNode;
		}

		return eventTarget;
	};


	/**
	 * On touch start, record the position and scroll offset.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onTouchStart = function(event) {
		var targetElement, touch, selection;

		// Ignore multiple touches, otherwise pinch-to-zoom is prevented if both fingers are on the FastClick element (issue #111).
		if (event.targetTouches.length > 1) {
			return true;
		}

		targetElement = this.getTargetElementFromEventTarget(event.target);
		touch = event.targetTouches[0];

		if (deviceIsIOS) {

			// Only trusted events will deselect text on iOS (issue #49)
			selection = window.getSelection();
			if (selection.rangeCount && !selection.isCollapsed) {
				return true;
			}

			if (!deviceIsIOS4) {

				// Weird things happen on iOS when an alert or confirm dialog is opened from a click event callback (issue #23):
				// when the user next taps anywhere else on the page, new touchstart and touchend events are dispatched
				// with the same identifier as the touch event that previously triggered the click that triggered the alert.
				// Sadly, there is an issue on iOS 4 that causes some normal touch events to have the same identifier as an
				// immediately preceeding touch event (issue #52), so this fix is unavailable on that platform.
				// Issue 120: touch.identifier is 0 when Chrome dev tools 'Emulate touch events' is set with an iOS device UA string,
				// which causes all touch events to be ignored. As this block only applies to iOS, and iOS identifiers are always long,
				// random integers, it's safe to to continue if the identifier is 0 here.
				if (touch.identifier && touch.identifier === this.lastTouchIdentifier) {
					event.preventDefault();
					return false;
				}

				this.lastTouchIdentifier = touch.identifier;

				// If the target element is a child of a scrollable layer (using -webkit-overflow-scrolling: touch) and:
				// 1) the user does a fling scroll on the scrollable layer
				// 2) the user stops the fling scroll with another tap
				// then the event.target of the last 'touchend' event will be the element that was under the user's finger
				// when the fling scroll was started, causing FastClick to send a click event to that layer - unless a check
				// is made to ensure that a parent layer was not scrolled before sending a synthetic click (issue #42).
				this.updateScrollParent(targetElement);
			}
		}

		this.trackingClick = true;
		this.trackingClickStart = event.timeStamp;
		this.targetElement = targetElement;

		this.touchStartX = touch.pageX;
		this.touchStartY = touch.pageY;

		// Prevent phantom clicks on fast double-tap (issue #36)
		if ((event.timeStamp - this.lastClickTime) < this.tapDelay) {
			event.preventDefault();
		}

		return true;
	};


	/**
	 * Based on a touchmove event object, check whether the touch has moved past a boundary since it started.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.touchHasMoved = function(event) {
		var touch = event.changedTouches[0], boundary = this.touchBoundary;

		if (Math.abs(touch.pageX - this.touchStartX) > boundary || Math.abs(touch.pageY - this.touchStartY) > boundary) {
			return true;
		}

		return false;
	};


	/**
	 * Update the last position.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onTouchMove = function(event) {
		if (!this.trackingClick) {
			return true;
		}

		// If the touch has moved, cancel the click tracking
		if (this.targetElement !== this.getTargetElementFromEventTarget(event.target) || this.touchHasMoved(event)) {
			this.trackingClick = false;
			this.targetElement = null;
		}

		return true;
	};


	/**
	 * Attempt to find the labelled control for the given label element.
	 *
	 * @param {EventTarget|HTMLLabelElement} labelElement
	 * @returns {Element|null}
	 */
	FastClick.prototype.findControl = function(labelElement) {

		// Fast path for newer browsers supporting the HTML5 control attribute
		if (labelElement.control !== undefined) {
			return labelElement.control;
		}

		// All browsers under test that support touch events also support the HTML5 htmlFor attribute
		if (labelElement.htmlFor) {
			return document.getElementById(labelElement.htmlFor);
		}

		// If no for attribute exists, attempt to retrieve the first labellable descendant element
		// the list of which is defined here: http://www.w3.org/TR/html5/forms.html#category-label
		return labelElement.querySelector('button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea');
	};


	/**
	 * On touch end, determine whether to send a click event at once.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onTouchEnd = function(event) {
		var forElement, trackingClickStart, targetTagName, scrollParent, touch, targetElement = this.targetElement;

		if (!this.trackingClick) {
			return true;
		}

		// Prevent phantom clicks on fast double-tap (issue #36)
		if ((event.timeStamp - this.lastClickTime) < this.tapDelay) {
			this.cancelNextClick = true;
			return true;
		}

		if ((event.timeStamp - this.trackingClickStart) > this.tapTimeout) {
			return true;
		}

		// Reset to prevent wrong click cancel on input (issue #156).
		this.cancelNextClick = false;

		this.lastClickTime = event.timeStamp;

		trackingClickStart = this.trackingClickStart;
		this.trackingClick = false;
		this.trackingClickStart = 0;

		// On some iOS devices, the targetElement supplied with the event is invalid if the layer
		// is performing a transition or scroll, and has to be re-detected manually. Note that
		// for this to function correctly, it must be called *after* the event target is checked!
		// See issue #57; also filed as rdar://13048589 .
		if (deviceIsIOSWithBadTarget) {
			touch = event.changedTouches[0];

			// In certain cases arguments of elementFromPoint can be negative, so prevent setting targetElement to null
			targetElement = document.elementFromPoint(touch.pageX - window.pageXOffset, touch.pageY - window.pageYOffset) || targetElement;
			targetElement.fastClickScrollParent = this.targetElement.fastClickScrollParent;
		}

		targetTagName = targetElement.tagName.toLowerCase();
		if (targetTagName === 'label') {
			forElement = this.findControl(targetElement);
			if (forElement) {
				this.focus(targetElement);
				if (deviceIsAndroid) {
					return false;
				}

				targetElement = forElement;
			}
		} else if (this.needsFocus(targetElement)) {

			// Case 1: If the touch started a while ago (best guess is 100ms based on tests for issue #36) then focus will be triggered anyway. Return early and unset the target element reference so that the subsequent click will be allowed through.
			// Case 2: Without this exception for input elements tapped when the document is contained in an iframe, then any inputted text won't be visible even though the value attribute is updated as the user types (issue #37).
			if ((event.timeStamp - trackingClickStart) > 100 || (deviceIsIOS && window.top !== window && targetTagName === 'input')) {
				this.targetElement = null;
				return false;
			}

			this.focus(targetElement);
			this.sendClick(targetElement, event);

			// Select elements need the event to go through on iOS 4, otherwise the selector menu won't open.
			// Also this breaks opening selects when VoiceOver is active on iOS6, iOS7 (and possibly others)
			if (!deviceIsIOS || targetTagName !== 'select') {
				this.targetElement = null;
				event.preventDefault();
			}

			return false;
		}

		if (deviceIsIOS && !deviceIsIOS4) {

			// Don't send a synthetic click event if the target element is contained within a parent layer that was scrolled
			// and this tap is being used to stop the scrolling (usually initiated by a fling - issue #42).
			scrollParent = targetElement.fastClickScrollParent;
			if (scrollParent && scrollParent.fastClickLastScrollTop !== scrollParent.scrollTop) {
				return true;
			}
		}

		// Prevent the actual click from going though - unless the target node is marked as requiring
		// real clicks or if it is in the whitelist in which case only non-programmatic clicks are permitted.
		if (!this.needsClick(targetElement)) {
			event.preventDefault();
			this.sendClick(targetElement, event);
		}

		return false;
	};


	/**
	 * On touch cancel, stop tracking the click.
	 *
	 * @returns {void}
	 */
	FastClick.prototype.onTouchCancel = function() {
		this.trackingClick = false;
		this.targetElement = null;
	};


	/**
	 * Determine mouse events which should be permitted.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onMouse = function(event) {

		// If a target element was never set (because a touch event was never fired) allow the event
		if (!this.targetElement) {
			return true;
		}

		if (event.forwardedTouchEvent) {
			return true;
		}

		// Programmatically generated events targeting a specific element should be permitted
		if (!event.cancelable) {
			return true;
		}

		// Derive and check the target element to see whether the mouse event needs to be permitted;
		// unless explicitly enabled, prevent non-touch click events from triggering actions,
		// to prevent ghost/doubleclicks.
		if (!this.needsClick(this.targetElement) || this.cancelNextClick) {

			// Prevent any user-added listeners declared on FastClick element from being fired.
			if (event.stopImmediatePropagation) {
				event.stopImmediatePropagation();
			} else {

				// Part of the hack for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
				event.propagationStopped = true;
			}

			// Cancel the event
			event.stopPropagation();
			event.preventDefault();

			return false;
		}

		// If the mouse event is permitted, return true for the action to go through.
		return true;
	};


	/**
	 * On actual clicks, determine whether this is a touch-generated click, a click action occurring
	 * naturally after a delay after a touch (which needs to be cancelled to avoid duplication), or
	 * an actual click which should be permitted.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onClick = function(event) {
		var permitted;

		// It's possible for another FastClick-like library delivered with third-party code to fire a click event before FastClick does (issue #44). In that case, set the click-tracking flag back to false and return early. This will cause onTouchEnd to return early.
		if (this.trackingClick) {
			this.targetElement = null;
			this.trackingClick = false;
			return true;
		}

		// Very odd behaviour on iOS (issue #18): if a submit element is present inside a form and the user hits enter in the iOS simulator or clicks the Go button on the pop-up OS keyboard the a kind of 'fake' click event will be triggered with the submit-type input element as the target.
		if (event.target.type === 'submit' && event.detail === 0) {
			return true;
		}

		permitted = this.onMouse(event);

		// Only unset targetElement if the click is not permitted. This will ensure that the check for !targetElement in onMouse fails and the browser's click doesn't go through.
		if (!permitted) {
			this.targetElement = null;
		}

		// If clicks are permitted, return true for the action to go through.
		return permitted;
	};


	/**
	 * Remove all FastClick's event listeners.
	 *
	 * @returns {void}
	 */
	FastClick.prototype.destroy = function() {
		var layer = this.layer;

		if (deviceIsAndroid) {
			layer.removeEventListener('mouseover', this.onMouse, true);
			layer.removeEventListener('mousedown', this.onMouse, true);
			layer.removeEventListener('mouseup', this.onMouse, true);
		}

		layer.removeEventListener('click', this.onClick, true);
		layer.removeEventListener('touchstart', this.onTouchStart, false);
		layer.removeEventListener('touchmove', this.onTouchMove, false);
		layer.removeEventListener('touchend', this.onTouchEnd, false);
		layer.removeEventListener('touchcancel', this.onTouchCancel, false);
	};


	/**
	 * Check whether FastClick is needed.
	 *
	 * @param {Element} layer The layer to listen on
	 */
	FastClick.notNeeded = function(layer) {
		var metaViewport;
		var chromeVersion;
		var blackberryVersion;
		var firefoxVersion;

		// Devices that don't support touch don't need FastClick
		if (typeof window.ontouchstart === 'undefined') {
			return true;
		}

		// Chrome version - zero for other browsers
		chromeVersion = +(/Chrome\/([0-9]+)/.exec(navigator.userAgent) || [,0])[1];

		if (chromeVersion) {

			if (deviceIsAndroid) {
				metaViewport = document.querySelector('meta[name=viewport]');

				if (metaViewport) {
					// Chrome on Android with user-scalable="no" doesn't need FastClick (issue #89)
					if (metaViewport.content.indexOf('user-scalable=no') !== -1) {
						return true;
					}
					// Chrome 32 and above with width=device-width or less don't need FastClick
					if (chromeVersion > 31 && document.documentElement.scrollWidth <= window.outerWidth) {
						return true;
					}
				}

			// Chrome desktop doesn't need FastClick (issue #15)
			} else {
				return true;
			}
		}

		if (deviceIsBlackBerry10) {
			blackberryVersion = navigator.userAgent.match(/Version\/([0-9]*)\.([0-9]*)/);

			// BlackBerry 10.3+ does not require Fastclick library.
			// https://github.com/ftlabs/fastclick/issues/251
			if (blackberryVersion[1] >= 10 && blackberryVersion[2] >= 3) {
				metaViewport = document.querySelector('meta[name=viewport]');

				if (metaViewport) {
					// user-scalable=no eliminates click delay.
					if (metaViewport.content.indexOf('user-scalable=no') !== -1) {
						return true;
					}
					// width=device-width (or less than device-width) eliminates click delay.
					if (document.documentElement.scrollWidth <= window.outerWidth) {
						return true;
					}
				}
			}
		}

		// IE10 with -ms-touch-action: none or manipulation, which disables double-tap-to-zoom (issue #97)
		if (layer.style.msTouchAction === 'none' || layer.style.touchAction === 'manipulation') {
			return true;
		}

		// Firefox version - zero for other browsers
		firefoxVersion = +(/Firefox\/([0-9]+)/.exec(navigator.userAgent) || [,0])[1];

		if (firefoxVersion >= 27) {
			// Firefox 27+ does not have tap delay if the content is not zoomable - https://bugzilla.mozilla.org/show_bug.cgi?id=922896

			metaViewport = document.querySelector('meta[name=viewport]');
			if (metaViewport && (metaViewport.content.indexOf('user-scalable=no') !== -1 || document.documentElement.scrollWidth <= window.outerWidth)) {
				return true;
			}
		}

		// IE11: prefixed -ms-touch-action is no longer supported and it's recomended to use non-prefixed version
		// http://msdn.microsoft.com/en-us/library/windows/apps/Hh767313.aspx
		if (layer.style.touchAction === 'none' || layer.style.touchAction === 'manipulation') {
			return true;
		}

		return false;
	};


	/**
	 * Factory method for creating a FastClick object
	 *
	 * @param {Element} layer The layer to listen on
	 * @param {Object} [options={}] The options to override the defaults
	 */
	FastClick.attach = function(layer, options) {
		return new FastClick(layer, options);
	};


	if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {

		// AMD. Register as an anonymous module.
		define(function() {
			return FastClick;
		});
	} else if (typeof module !== 'undefined' && module.exports) {
		module.exports = FastClick.attach;
		module.exports.FastClick = FastClick;
	} else {
		window.FastClick = FastClick;
	}
}());

define(function () {
    
    var $ = function (selector) {
        var idReg = /^#([\w_\-]+)/;
        var classReg = /^\.([\w_\-]+)/;
        var tagReg = /^\w+$/i;
        //看不懂下面这个
        var attrReg = /(\w+)?\[([^=\]]+)(?:=(["'])?([^\]"']+)\3?)?\]/;

        var context = document;

        function blank() {}

        function direct(part, actions) {
            actions = actions || {
                id: blank,
                className: blank,
                tag: blank,
                attribute: blank
            };
            var fn;
            //convert to array
            var params = [].slice.call(arguments, 2);
            //id
            if (result = part.match(idReg)) {
                fn = 'id';
                //捕获分组下标从1开始
                params.push(result[1]);
            }
            //class
            else if (result = part.match(classReg)) {
                fn = 'className';
                params.push(result[1]);
            }
            //tag
            else if (result = part.match(tagReg)) {
                fn = 'tag';
                params.push(result[0]);
            }
            //attribute
            else if (result = part.match(attrReg)) {
                fn = 'attribute';
                var tag = result[1];
                var key = result[2];
                var value = result[4];
                params.push(tag, key, value);
            }
            return actions[fn].apply(null, params);
        }

        function find(parts, context) {
            // part 是 selector 中的最后一个
            var part = parts.pop();
            //这些函数返回的都是 array []
            var actions = {
                id: function (id) {
                    return [
                        document.getElementById(id)
                    ];
                },
                className: function (className) {
                    var result = [];
                    if (context.getElementsByClassName) {
                        result = context.getElementsByClassName(className);
                    }
                    //IE 9 之前的版本不支持 getElementsByClassName 方法
                    else {
                        var temp = context.getElementsByTagName('*');
                        for (var i = 0, len = temp.length; i < len; i++) {
                            var node = temp[i];
                            if (hasClass(node, className)) {
                                result.push(node);
                            }
                        }
                    }
                    return result;
                },
                tag: function (tag) {
                    return context.getElementsByTagName(tag);
                },
                attribute: function (tag, key, value) {
                    var result = [];
                    var temp = context.getElementsByTagName(tag || '*');

                    for (var i = 0, len = temp.length; i < len; i++) {
                        var node = temp[i];
                        if (value) {
                            var v = node.getAttribute(key);
                            //这是个什么语法? if 代替语句？
                            (v === value) && result.push(node);
                        }
                        else if (node.hasAttribute(key)) {
                            result.push(node);
                        }
                    }
                    return result;
                }
            };

            var ret = direct(part, actions);
            //convert to array
            ret = [].slice.call(ret);

            // if (parts[0] && ret[0]) {
            //
            //     var r_ele = filterParents(parts, ret);
            //     alert('this is 1 ' + r_ele.tagName);
            //     return r_ele;
            // } else {
            //     var r_ele = ret[0];
            //     alert('this is 2 ' + r_ele.tagName);
            //     return r_ele;
            // }

            //ret[0] 不是 ret, ret is an array, while ret[0] is the true element!!!(demo中有错)
            return parts[0] && ret[0] ? filterParents(parts, ret) : ret[0];
        }

        function filterParents(parts, ret) {
            var parentPart = parts.pop();
            var result = [];

            for (var i = 0, len = ret.length; i < len; i++) {
                var node = ret[i];
                var p = node;
                //向上遍历
                while (p = p.parentNode) {
                    var actions = {
                        id: function (el, id) {
                            return (el.id === id);
                        },
                        className: function (el, className) {
                            return hasClass(el, className);
                        },
                        tag: function (el, tag) {
                            return (el.tagName.toLowerCase() === tag);
                        },
                        attribute: function (el, tag, key, value) {
                            var valid = true;
                            if (tag) {
                                valid = actions.tag(el, tag);
                            }
                            valid = valid && el.hasAttribute(key);
                            if (value) {
                                valid = valid && (value === el.getAttribute(key));
                            }
                            return valid;
                        }
                    };
                    var matches = direct(parentPart, actions, p);
                    if (matches) {
                        break;
                    }
                }
                //while 循环结束
                if (matches) {
                    result.push(node);
                }
            }
            //for 循环结束
            return parts[0] && result[0] ? filterParents(parts, result) : result[0];
        }

        var result = find(selector.split(/\s+/), context);
        return result;
    };

    // function $(selector) {
    //     return document.querySelector(selector);
    // }


    // 判断arr是否为一个数组，返回一个bool值
    var isArray = function (arr) {
        return Object.prototype.toString.call(arr) === "[object Array]";
    };

    // 判断fn是否为一个函数，返回一个bool值
    var isFunction = function (fn) {
        return Object.prototype.toString.call(fn) === "[object Function]";
    };

    //判断一个对象是否为字面量对象
    var isPlain = function (obj) {
        var hasOwnProperty = Object.prototype.hasOwnProperty,
            key;
        if (!obj
            || Object.prototype.toString.call(obj) !== "[object Object]"
            || !('isPrototypeOf' in obj)
            ) {
            return false;
        }

        if (obj.constructor &&
            !hasOwnProperty.call(obj, "constructor") &&
            !hasOwnProperty.call(obj.constructor.prototype, "isPrototypeOf")) {
            return false;
        }
        //空循环，目的是使key到最后一项，如果有继承属性，这一项一定是继承属性
        for ( key in obj) {}
        return key === undefined || hasOwnProperty.call(obj, key);

    };

    // 使用递归来实现一个深度克隆，可以复制一个目标对象，返回一个完整拷贝
    // 被复制的对象类型会被限制为数字、字符串、布尔、日期、数组、Object对象。不会包含函数、正则对象等
    var cloneObject = function (src) {
        var result = src,
            i,
            len;
        if (!src
            || src instanceof Number
            || src instanceof String
            || src instanceof Boolean) {
            return result;
        } else if (isArray(src)) {
            result = [];
            var resultLen = 0;
            for (i = 0, len = src.length; i < len; i++) {
                result[resultLen++] = cloneObject(src[i]);
            }
        } else if (isPlain(src)) {
            result = {};
            for (i in src) {
                if (src.hasOwnProperty(i)){
                    result[i] = cloneObject(src[i]);
                }
            }
        }
        return result;
    };

    // 对数组进行去重操作，只考虑数组中元素为数字或字符串，返回一个去重后的数组
    var uniqArray = function (arr) {
        arr.sort(function(a, b) {
            if (a === b) {
                return 0;
            }
            if (typeof a === typeof b) {
                return a < b ? -1 : 1;
            }
            return typeof a < typeof b ? -1 : 1;
         });

        for (var i = 0; i < arr.length; i++) {
            while (arr[i] === arr[i + 1]) {
                arr.splice(i + 1, 1);
            }
        }
        return arr;
    };

    // hash
    var uniqArray1 = function (arr) {
        var obj = {},
            result = [];

        for(var i = 0, len = arr.length; i < len; i++) {

            var key = arr[i];
            if (!obj[key]) {
                result.push(key);
                obj[key] = true;
            }
            return result;
        }
    };

    //es5 + hash
    var uniqArray2 = function (arr) {
        var obj = {};
        for (var i = 0, len = arr.length; i < len; i++) {
            obj[arr[i]] = true;
        }
        return Object.keys(obj);
    };



    // 实现一个简单的trim函数，用于去除一个字符串，头部和尾部的空白字符,假定空白字符只有半角空格、Tab
    // 练习通过循环，以及字符串的一些基本方法，分别扫描字符串str头部和尾部是否有连续的空白字符，并且删掉他们，最后返回一个完成去除的字符串
    var simpleTrim = function (str) {
        var i = 0,
            j = str.length - 1;

        while (str[i] === ' ') {
            i++;
        }
        while (str[j] === ' ') {
            j--;
        }

        if (i > j) {
            return '';
        }

        return str.slice(i, j + 1);
    };

    // 对字符串头尾进行空格字符的去除、包括全角半角空格、Tab等，返回一个字符串
    // 尝试使用一行简洁的正则表达式完成该题目
    var trim = function (str) {
        return str.match(/\S+.+\S/);
    };

    var trim1 = function (str) {
    // \xa0是不换行空格（&nbsp） \u3000是全角空格的16进制编码
        var trimer = new RegExp("(^[\\s\\t\\xa0\\u3000]+)|([\\u3000\\xa0\\s\\t]+\x24)", "g");

        return String(str).replace(trimer, "");

    };

    // 实现一个遍历数组的方法，针对数组中每一个元素执行fn函数，并将数组索引和元素作为参数传递
    // 其中fn函数可以接受两个参数：item和index
    var each = function (arr, fn) {
        for (var i = 0, len = arr.length; i < len; i++) {
            fn(arr[i], i);
        }
    };

    // 获取一个对象里面第一层元素的数量，返回一个整数
    var getObjectLength = function (obj) {
        var count = 0;
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                count++;
            }
        }
        return count;
    };

    // 判断是否为邮箱地址(并不是很完全的答案)
    var isEmail = function (emailStr) {
        var pattern = /^([\w\.\-\+])+\@([\w\-]+\.)+([\w]{2,10})+$/;
        return pattern.test(emailStr);
    }

    // 判断是否为手机号
    var isMobilePhone = function (phone) {
        return /^1[3|5|8]\d{10}$/.test(phone);
    };

    var hasClass = function (element, className) {
        var names = element.className;
        if (!names) {
            return false;
        }
        names = names.split(/\s+/);
        for (var i = 0, len = names.length; i < len; i++) {
            if (names[i] === className) {
                return true;
            }
        }
        return false;
    };

    // 为element增加一个样式名为newClassName的新样式
    var addClass = function (element, newClassName) {
        if (!hasClass(element, newClassName)) {
            element.className = trim(element.className + " " + newClassName);
        }
    };

    // 移除element中的样式oldClassName
    var removeClass = function(element, oldClassName) {
        if (hasClass(element, oldClassName)) {
            element.className = trim(element.className.replace(oldClassName, " "));
        }
    };


    // 判断siblingNode和element是否为同一个父元素下的同一级的元素，返回bool值
    var isSiblingNode = function (element, siblingNode) {
        return element.parentNode === siblingNode.parentNode;
    };

    // 获取element相对于浏览器窗口的位置，返回一个对象{x, y} (我没有考虑滚动条)
    var getPosition = function (element) {
        var x = 0;
        var y = 0;
        var current = element;

        while (current !== null) {
            x += current.offsetLeft;
            y += current.offsetTop;
            current = current.offsetParent;
        }
        return {
            x: x,
            y: y
        };
    };

    // 实现一个简单的Query
    /*
    *这个方法只能处理一个selector
    */
    // function singleQuery(selector) {
    //     var selector = trim(selector);
    //     var element = null;
    //     var symbol = selector[i].match(/\W/);
    //
    //     switch (symbol) {
    //         case "#":
    //             element = document.getElementById(selector.slice(1));
    //             break;
    //         case ".":
    //             element = document.getElementsByClassName(selector.slice(1))[0];
    //             break;
    //         case "[":
    //             var index = slector.indexOf("=");
    //             var allElements = document.getElementsByTagName("*");
    //             if (index !== -1) {
    //                 var key = selector.slice(1, index);
    //                 var value = selector.slice(index + 1);
    //                 for (var j = 0; j < allElements.length; j++) {
    //                     if (allElements[j].getAttribute(key) === value) {
    //                         element = allElements[j];
    //                         break;
    //                     }
    //                 }
    //             }
    //             else {
    //                 var key = selector.slice(1);
    //                 for (var j = 0; j < allElements.length; j++) {
    //                     if (allElements[j]) {
    //                         element = allElements[j];
    //                         break;
    //                     }
    //                 }
    //             }
    //             break;
    //             default:
    //                 element = document.getElementsByTagName(selector)[0];
    //                 break;
    //         }
    //     return element;
    // }


    // 给一个element绑定一个针对event事件的响应，响应函数为listener
    var addEvent = function (element, event, listener) {
        event = event.replace(/^on/i, '').toLowerCase();
        if (element.addEventListener) {
            element.addEventListener(event, listener, false);
        }
        else if (element.attachEvent) {
            element.attachEvent("on" + event, listener);
        }
        else {
            element["on" + event] = listener;
        }
    };

    // 移除element对象对于event事件发生时执行listener的响应
    var removeEvent = function (element, event, listener) {
        event = event.replace(/^on/i, '').toLowerCase();
        if (element.removeEventListener) {
            element.removeEventListener(event, listener, false);
        }
        else if (element.detachEvent) {
            element.detachEvent("on" + event, listener);
        }
        else {
            element["on" + type] = null;
        }
    };

    // 实现对click事件的绑定
    var addClickEvent = function(element, listener) {
        addEvent(element, "click", listener);
    };

    // 实现对于按Enter键时的事件绑定
    var addEnterEvent = function (element, listener) {
        addEvent(element, "keydown", function (e) {
            if (e.keyCode === 13) {
                listener.call(element, event);
            }
        });
    };

    //事件代理 (element代理tag)
    var delegateEvent = function (element, tag, eventName, listener) {
        console.log('in delegateEvent');
        addEvent(element, eventName, function (e) {
            var event = e || window.event;
            var target = e.target || e.srcElement;
            if (target && target.tagName === tag.toUpperCase()) {
                console.log('if matched');
                listener.call(target, event);
            }
        });
    };

    var delegateDelEvent = function (element, aClassName, eventName, listener) {
        addEvent(element, eventName, function (e) {
            var event = e || window.event;
            var target = e.target || e.srcElement;
            if (target && target.className.indexOf(aClassName) !== -1) {
                listener.call(target, event);
            }
        });
    };
    console.log(typeof delegateDelEvent);

    //估计有同学已经开始吐槽了，函数里面一堆$看着晕啊，那么接下来把我们的事件函数做如下封装改变：
    $.on = function (selector, event, listener) {
        addEvent($(selector), event, listener);
    };

    $.click = function (selector, listener) {
        addClickEvent($(selector), listener);
    };

    $.un = function (selector, event, listener) {
        removeEventListener($(selector), event, listener);
    };

    $.delegate = function (selector, tag, event, listener) {
        delegateEvent($(selector), tag, event, listener);
    };

    // 判断是否为IE浏览器，返回-1或者版本号
    var isIE = function () {
        return /MSIE ([^;]+)/.test(navigator.userAgent) ?
            //正则表达式，\x24即是 $
             (parseFloat(RegExp.$1) || document.documentMode) : -1;
    };

    // 设置 cookie
    var setCookie = function (cookieName, cookieValue, expiredays) {
        var expires = new Date();

        if (typeof expiredays === 'number') {
            expires.setTime(expires.getTime() + (expiredays * 24 * 60 * 60 * 1000));
            expires = expires.toGMTString();
        }

        document.cookie =
            encodeURIComponent(cookieName) + '=' + encodeURIComponent(cookieValue)
             + '; expires=' + expires +'; path=/';
    };

    //获取 cookie 值
    var getCookie = function (cookieName) {

        var name = cookieName + '=';
        var decodedCookie = decodeURIComponent(document.cookie);
        var parts = decodedCookie.split(';');

        for (var i = 0, len = parts.length; i < len; i++) {

            var part = trim(parts[i]);
            if (part.indexOf(name) === 0) {
                return part.slice(name.length, part.length);
            }
        }
        return '';
    };

    //学习Ajax，并尝试自己封装一个Ajax方法
    /**
     * @param {string} url 发送请求的url
     * @param {Object} options 发送请求的选项参数
     * @config {string} [options.type] 请求发送的类型。默认为GET。
     * @config {Object} [options.data] 需要发送的数据,为一个键值对象或一个用&链接的赋值字符串。
     * @config {Function} [options.onsuccess] 请求成功时触发，function(XMLHttpRequest xhr, string responseText)。
     * @config {Function} [options.onfail] 请求失败时触发，function(XMLHttpRequest xhr)。
     *
     * @returns {XMLHttpRequest} 发送请求的XMLHttpRequest对象
     */
    var ajax = function (url, options) {
        var options = options || {};
        var data = stringifyData(options.data || {});
        var type = (options.type || 'GET').toUpperCase();
        var xhr;

        try {
            if (type === 'GET' && data) {
                url += (url.indexof('?') === -1 ? '?' : '&') + data;
                data = null;
            }

            xhr = createXHR();
            xhr.open(type, url, true);
            xhr.onreadystatechange = stateChangeHandler;

            //open()之后设置http请求头
            if (type === 'POST') {
                xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            }
            //GET请求的setRequestHeader(书上没有)
            xhr.setRequestHeader('X-Request-With', 'XMLHttpRequest');
            xhr.send(data);
        }
        catch(ex) {
            fire('fail');
        }
        return xhr;

        //函数
        function stringifyData(data) {
            var param = [];
            for (var key in data) {
                if (data.hasOwnProperty(key)) {
                    param.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
                }
            }
            return param.join('&');
        }

        function createXHR() {
            if (window.XMLHttpRequest) {
                return new XMLHttpRequest();
            }
            else {
                //code for IE5 & IE6
                return new ActiveXObject('Microsoft.XMLHTTP');
            }
        }

        function stateChangeHandler() {
            var stat;
            if (xhr.readyState === 4) {
                try {
                    stat = xhr.status;
                }
                catch(ex) {
                    fire('fail');
                    return;
                }
                //什么意思？
                fire(stat);

                if ((stat >= 200 && stat < 300)
                    || stat === 304
                    || stat === 1223) {
                    fire('success');
                }
                else {
                    fire('fail');
                }
                    /*
                    *见Note
                    */
                    window.setTimeOut(
                        function() {
                            xhr.onreadystatechange = new Function();
                            xhr = null;
                        },
                        0
                    );
            }
        }

        function fire(type) {
            type = 'on' + type;
            var handler = options[type];

            if (!isFunction(handler)) {
                return;
            }
            if (type === 'onfail') {
                handler(xhr);
            }
            else {
                try {
                    xhr.responseText;
                }
                catch(e) {
                    return handler(xhr);
                }
                handler(xhr, xhr.responseText);
            }
        }

    };

    var escape = function (str) {
        str = str.replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#x27;')
                .replace(/`/g, '&#x60;')
                .replace(/\//g, '&#x2f;');
        return str;
    };

    return {
        $: $,
        isArray: isArray,
        isFunction: isFunction,
        cloneObject: cloneObject,
        uniqArray: uniqArray,
        trim: trim,
        each: each,
        getObjectLength: getObjectLength,
        isEmail: isEmail,
        isMobilePhone: isMobilePhone,
        hasClass: hasClass,
        addClass: addClass,
        removeClass: removeClass,
        isSiblingNode: isSiblingNode,
        getPosition: getPosition,
        addEvent: addEvent,
        removeEvent: removeEvent,
        addClickEvent: addClickEvent,
        addEnterEvent: addEnterEvent,
        delegateEvent: delegateEvent,
        delegateDelEvent: delegateDelEvent,
        isIE: isIE,
        setCookie: setCookie,
        getCookie: getCookie,
        ajax: ajax,
        escape: escape
    };
});
