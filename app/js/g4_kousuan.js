
var table = layui.table
    ,form = layui.form
    ,layer = layui.layer
    ,layedit = layui.layedit
    ,laydate = layui.laydate;

//日期
laydate.render({
    elem: '#date'
    ,value: new Date()
});


let opers = ['×', '÷']

// 生成随机数
function randomNumber(max, min = 0) {
    return Math.floor(Math.random()*(max-min+1) + min)
}

// 随机生一个乘除计算
// 1 = 2 * 1
// 2 = 2 * 2
// 3 = 3 * 2
function randomSingleTest(style, level = 1) {
    var t = ''
    var a = 0, b = 0
    var res = 0
    var op = opers[style - 1]
    var eq = '='


    if (level === 1) {
        // 随机取1个数字
         a = randomNumber(99, 10)
        // 随机取第2个数字
         b = randomNumber(9, 1)    
    } else if (level === 2) {
        // 随机取1个数字
        a = randomNumber(99, 10)
        // 随机取第2个数字
         b = randomNumber(99, 10)   
    } else {
        // 随机取1个数字
        a = randomNumber(999, 100)
        // 随机取第2个数字
        b = randomNumber(99, 10)   
    }
    res = a*b

    if (style == 2) { // 除法
        if (a>b) {
            var tmp = b
            b = a
            a = res
            res = tmp
        } else {
            var tmp = a
            a = res
            res = tmp
        }
    }
 
    var arr = new Array(a, op, b, eq)
    return { q: arr.join(' '), a: res }
}

function currentTime() {
    var date=new Date();
    var year=date.getFullYear(); //获取当前年份
    var mon=date.getMonth()+1; //获取当前月份
    var da=date.getDate(); //获取当前日
    var day=date.getDay(); //获取当前星期几
    var Week = ['日','一','二','三','四','五','六'];
    return year + ' 年 '+ mon + ' 月 '+ da + ' 日' + ' 星期' + Week[day]
}

function currentTimeString() {
    var date=new Date();
    var year=date.getFullYear(); //获取当前年份
    var mon=date.getMonth()+1; //获取当前月份
    var da=date.getDate(); //获取当前日
    var day=date.getDay(); //获取当前星期几
    var Week = ['日','一','二','三','四','五','六'];
    return year + '-'+ mon + '-'+ da
}

function makeTest( num, col ) {

    if (num < 10) {
        layer.alert('题目数目最少为10个')
        return
    }

    var pagebody = $(".page")

    // 生成Data
    let w = col > 1 ? 600 / col : 150

    var data = {}
    data.info = {}
    data.info.time = $("input[name='date']").val()
    data.info.grade = $("input[name='grade']").val()
    data.info.name  = $("input[name='name']").val()
  
    var level = $("input[name='level']:checked").val()
    console.log('level', level)

    var styles = []
    $("input[name='style']:checked").each(function(){
        styles.push(Number($(this).val()))
    })
    console.log('style', styles)

    if (styles.length === 0) {
        layer.alert('请选择至少一个题目类型')
        return
    }

    var colgroup = []
    var list = []

    for(var i=0; i<col; i++){
        colgroup.push(w)
    }

    // 平均分配
    var ops = []
    const l = styles.length
    for(var i=0; i<num; i++){
        ops.push(styles[i%l])
    }
   
    var cols = []
    for(var i=0; i<num; i++){
        if( i % col == 0){
            cols = []
        }

        cols.push(randomSingleTest(ops[i], Number(level)))

        if((i % col) == (col - 1)){
            list.push([].concat(cols))
        }
    }

    data.col = colgroup
    data.list = list

    var getTpl = document.getElementById('tpl-test').innerHTML
    layui.laytpl(getTpl).render(data, function(h){
        pagebody[0].innerHTML = h
    });
}

$("#test").on('click',function () {
    var sum = parseInt($("input[name='sum']").val())
    var col = parseInt($("input[name='colnum']:checked").val())
    makeTest(sum, col)
})

$("#answer").on('click',function () {
    $('span.answer').toggleClass('hidden')
})

$("#save").on('click',function () {

    var page = document.getElementById('page')
    html2canvas(page,{
    }).then(function(canvas) {
        var context = canvas.getContext('2d');
        // 关闭抗锯齿
        context.mozImageSmoothingEnabled = false;
        context.webkitImageSmoothingEnabled = false;
        context.msImageSmoothingEnabled = false;
        context.imageSmoothingEnabled = false;
        //返回图片dataURL，参数：图片格式和清晰度(0-1)
        var pageData = canvas.toDataURL('image/jpeg', 1.0)

        //方向默认竖直，尺寸ponits，格式a4[595.28,841.89]
        var pdf = new jsPDF('', 'pt', 'a4')

        //addImage后两个参数控制添加图片的尺寸，此处将页面高度按照a4纸宽高比列进行压缩
        pdf.addImage(pageData, 'JPEG', 20, 40, 535.28, 535.28/canvas.width * canvas.height )

        var ans = $('span.answer').hasClass('hidden')
        var date = $("input[name='date']").val()
        if(!date || date == ''){
            date = currentTimeString()
        }
        pdf.save(date + (ans ? '' : '_ans') + '.pdf');
    })

})

