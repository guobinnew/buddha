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
