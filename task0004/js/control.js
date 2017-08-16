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
        }

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
        })

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
        })
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
                        childLiStr = '<li><p class="file no-default" cateid='+ childCate[j].id + '><i class="fa fa-file-o file-icon" style="padding-right: 5px;" aria-hidden="true"></i>' + childCate[j].name + '(' + childCate[j].child.length +')'
                        +'<i class="fa fa-trash-o del" style="color: #b00d07;"></i></p><li>'
                        liStr += childLiStr;
                    }
                }
                liStr += '</ul></li>'
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
        for (var i = 0, l = fileEle.length; i < l; i++) {
            util.removeClass(fileEle[i], 'selected');
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

        for (var i = 0; i < dateArr.length; i++) {
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
            taskList = util.$('#task-list');

        if (!(title && date && content)) {
            alert('标题、日期和任务内容都不能为空，请重新输入。');
            createEditArea();
            return;
        }
        if (editSave) {
            var temp1 = currentTaskId;

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
            var temp2 = data.addTask(taskObj);
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
    }

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
         return 'ontouchstart' in window
            || navigator.maxTouchPoints;
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
