var path = require('path')
var fs = require('fs')


var table = layui.table
    , form = layui.form
    , layer = layui.layer
    , layedit = layui.layedit
    , laydate = layui.laydate;

const kousuan_data = {}
//日期
laydate.render({
    elem: '#date'
    , value: new Date()
});

$(".mathstate-body input[name='sum']").val(40)
$(".mathstate-body input[name='time_min']").val(5)


//////////////////////////////////////////////////////////////////////
// 图表显示

var chart = echarts.init(document.getElementById('chart'))
var chartT = echarts.init(document.getElementById('chart-time'))
var chart_date = []
var chart_sum = []
var chart_wrong = []
var chart_time = []

var option = {
    tooltip: {
        trigger: 'axis',
        position: function (pt) {
            return [pt[0], '10%'];
        }
    },
    title: {
        left: 'center',
        text: '成绩趋势图',
    },
    toolbox: {
        feature: {
            dataZoom: {
                yAxisIndex: 'none'
            },
            restore: {},
            saveAsImage: {}
        }
    },
    xAxis: {
        data: []
    },
    yAxis: {
    },
    series: [
        {
            name: '题目总数',
            type: 'line',
            data: []
        },
        {
            name: '错题数目',
            type: 'line',
            data: []
        }
    ]
};
chart.setOption(option);

var optionT = {
    tooltip: {
        trigger: 'axis',
        position: function (pt) {
            return [pt[0], '10%'];
        }
    },
    title: {
        left: 'center',
        text: '成绩——时间趋势图',
    },
    toolbox: {
        feature: {
            dataZoom: {
                yAxisIndex: 'none'
            },
            restore: {},
            saveAsImage: {}
        }
    },
    xAxis: {
        data: []
    },
    yAxis: {
    },
    series: [
        {
            name: '题目总数',
            type: 'line',
            data: []
        },
        {
            name: '用时',
            type: 'line',
            data: []
        }
    ]
};
chartT.setOption(optionT);

function refreshChart() {
    "use strict";
    chart_date = kousuan_data.index.sort()

    if (chart_date.length == 0) {
        chart_sum = []
        chart_wrong = []
        chart_time = []
    }
    else {
        // 根据
        chart_sum = new Array(chart_date.length)
        chart_wrong = new Array(chart_date.length)
        chart_time = new Array(chart_date.length)

        kousuan_data.scores.forEach(function (item) {
            const index = $.inArray(item.date, chart_date)
            chart_sum[index] = item.sum
            chart_wrong[index] = item.wrong
            chart_time[index] = item.time
        })
    }

    // 绘制图表
    chart.setOption({
        xAxis: {
            data: chart_date
        },
        series: [
            {
                // 根据名字对应到相应的系列
                name: '题目总数',
                data: chart_sum
            },
            {
                // 根据名字对应到相应的系列
                name: '错题',
                data: chart_wrong
            }
        ]
    })

    // 绘制图表
    chartT.setOption({
        xAxis: {
            data: chart_date
        },
        series: [
            {
                // 根据名字对应到相应的系列
                name: '题目总数',
                data: chart_sum
            },
            {
                // 根据名字对应到相应的系列
                name: '测试用时',
                data: chart_time
            }
        ]
    });
}

//////////////////////////////////////////////////////////////////////


const levelString = ['无', '初级', '中级', '高级']
function level2String(level) {
    if (level <= 0 || level > levelString.length) {
        level = 0
    }
    return levelString[level]
}

function time2String(sec) {
    var s = sec % 60
    var m = Math.floor(sec / 60)
    return (m ? m + ' 分' : '') + (s ? s + ' 秒' : '')
}

function removeDate(date) {
    // 根据日期
    for (var i = 0; i < kousuan_data.scores.length; i++) {
        if (kousuan_data.scores[i].date == date) {
            kousuan_data.sumscore -= (kousuan_data.scores[i].wrong == 0) ? 3 : 1
            kousuan_data.scores.splice(i, 1)
            break
        }
    }
    kousuan_data.index.splice($.inArray(date, kousuan_data.index), 1)
}

function refreshTable() {
    table.render({
        elem: '#table-kousuan'
        , data: kousuan_data.scores
        , cols: [[
            { field: 'date', width: 120, title: '日期', sort: true, fixed: 'left' }
            , { field: 'levelstr', width: 80, title: '难度' }
            , { field: 'sum', width: 100, title: '题目总数' }
            , { field: 'wrong', width: 80, title: '错' }
            , { field: 'right', width: 80, title: '对' }
            , { field: 'timestr', title: '用时' }
            , { fixed: 'right', width: 178, align: 'center', toolbar: '#barDemo' }
        ]]
        , page: true
    });

    $(".mathstate-body input[name='score']").val(kousuan_data.sumscore)
}

function reloadData() {
    $.getJSON("../data/score/g4_kousuan.json", function (data) {
        "use strict";

        console.log(data)

        // 查找匹配的索引
        let index = -1
        data.forEach(function (item, i) {
            if (item.name == window.Buddha.user.name && item.grade == window.Buddha.user.gradeclass) {
                index = i
                return false
            }
        })

        if (index < 0) {
            kousuan_data.name = window.Buddha.user.name
            kousuan_data.grade = window.Buddha.user.gradeclass
        } else {
            kousuan_data.name = data[index].name
            kousuan_data.grade = data[index].grade
        }
        kousuan_data.scores = []
        kousuan_data.index = []
        kousuan_data.sumscore = 0

        if (index >= 0) {
            data[index].scores.forEach(function (item, index) {
                var it = {}
                it.date = item.date
                kousuan_data.index.push(item.date)
                it.level = item.level
                it.levelstr = level2String(item.level)
                it.sum = item.sum
                it.wrong = item.wrong
                it.right = item.sum - item.wrong
                it.time = item.time
                it.timestr = time2String(item.time)
                kousuan_data.sumscore += (it.wrong == 0 ? 3 : 1)
                kousuan_data.scores.push(it)
            })
        }

        $.unique(kousuan_data.index)
        if (kousuan_data.index.length != kousuan_data.scores.length) {
            layer.alert('成绩数据有误，存在重复日期')
            return
        }
        else {
            refreshChart()
        }
        refreshTable()
    })
}

reloadData()


//监听表格复选框选择
table.on('checkbox(demo)', function (obj) {
    console.log(obj)
});


//监听工具条
table.on('tool(demo)', function (obj) {
    var data = obj.data;
    if (obj.event === 'del') {
        layer.confirm('真的删除行么', function (index) {
            removeDate(data.date)
            obj.del();
            layer.close(index)
        })
    }
    else if (obj.event === 'edit') {
        layer.alert('尚未实现')
        //layer.alert('编辑行：<br>'+ JSON.stringify(data))
    }
})

var active = {
    reloadData: function () {
        // 重新加载数据
        reloadData()
    },
    addData: function () { // 添加数据
        // 添加数据
        var newitem = {}
        newitem.date = $(".mathstate-body input[name='date']").val()
        if (newitem.date == '') {
            //示范一个公告层
            layer.msg('请填写日期')
            return
        }

        var _add = function () {
            newitem.level = parseInt($(".mathstate-body input[name='level']:checked").val())
            newitem.levelstr = level2String(newitem.level)
            newitem.sum = parseInt($(".mathstate-body input[name='sum']").val())
            newitem.wrong = parseInt($(".mathstate-body input[name='wrong']").val())
            newitem.right = newitem.sum - newitem.wrong

            var m = parseInt($(".mathstate-body input[name='time_min']").val())
            var s = parseInt($(".mathstate-body input[name='time_sec']").val())
            newitem.time = m * 60 + s
            newitem.timestr = time2String(newitem.time)

            kousuan_data.sumscore += (newitem.wrong == 0) ? 3 : 1
            kousuan_data.scores.push(newitem)
            kousuan_data.index.push(newitem.date)
            refreshTable()
            refreshChart()
        }

        if ($.inArray(newitem.date, kousuan_data.index) >= 0) {
            layer.confirm('日期已经存在，确认覆盖?', function (index) {
                removeDate(newitem.date)
                _add()
                layer.close(index)
            })
        }
        else {
            _add()
        }
    }
    , saveData: function () { // 保存到文件
        // 保存数据
        var savedata = {}
        savedata.name = kousuan_data.name
        savedata.grade = kousuan_data.grade
        savedata.scores = []

        kousuan_data.scores.forEach(function (item, index) {
            var it = {}
            it.date = item.date
            it.level = item.level
            it.sum = item.sum
            it.wrong = item.wrong
            it.time = item.time
            savedata.scores.push(it)
        })

        var content = []
        content.push(savedata)

        var _path = path.join(__dirname, '../data/score/g4_kousuan.json')

        // 备份
        var _bkpath = path.join(__dirname, '../data/score/g4_kousuan_bak.json')
        fs.writeFileSync(_bkpath, fs.readFileSync(_path))

        // 写入
        fs.writeFile(_path, JSON.stringify(content), function (err) {
            if (!err) {
                layer.msg("保存成功")
            }
            else {
                console.log(err)
            }
        })
    }
}

$('.demoTable .layui-btn').on('click', function () {
    var type = $(this).data('type');
    active[type] ? active[type].call(this) : '';
});

//////////////////////////////////////////////////////////////////////
// 图表显示

