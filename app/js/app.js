/**
 * Created by ods_h on 2018/9/16.
 */
let $ = layui.$

window.onresize = function(){
    "use strict";
    let w = window.innerWidth
    $(".region").css("width", (w - 200)+ 'px')
}

window.onresize()

if (!window.Buddha) {
    window.Buddha = {}
}

// 设置班级/姓名
const gradeNames = ['','一', '二','三','四','五','六']

// 读取JSON文件
$.getJSON("../data/manifest.json", "", function(data) {
    window.Buddha.user = data.user
    let grade = $('li.layui-this > a').html()
    window.Buddha.user.gradeclass =grade + gradeNames[Number(data.user.class)] + '班'

    $('input[name="grade"]').val(window.Buddha.user.gradeclass)
    $('input[name="name"]').val(window.Buddha.user.name)

})