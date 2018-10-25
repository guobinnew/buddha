var datahouse = null
var path = require('path')
var http = require('http')
var querystring = require('querystring')
var fs = require('fs')

// 听写单词列表
var selectdata = []
var currentindex = -1

function initChapter(data, elem) {
    var getTpl = document.getElementById('tpl-chapter').innerHTML
    layui.laytpl(getTpl).render(data, function(h){
        elem[0].innerHTML = h
    });
}

function makeChapter( data ) {

    // 上册
    if( !data ){
        return
    }

    if( data.first && data.first.length){
        var elem = $("#tingxie-chapter-first")
        initChapter(data.first, elem)
    }

    if( data.second && data.second.length){
        var elem = $("#tingxie-chapter-second")
        initChapter(data.second, elem)
    }

    layui.form.render('checkbox')
}

// 读取JSON文件
$.getJSON("../data/g4_tingxie.json", "", function(data) {
    datahouse = data
    // 默认上册
    makeChapter(data)
})

function restartTest() {
    currentindex = -1

    var percent = (currentindex+1) + '/' + selectdata.length
    $('.layui-progress-bar').attr('lay-percent', percent)

    if( selectdata.length > 0 ){
        layui.element.progress('progress', Math.floor((currentindex+1) / selectdata.length * 100.0) + '%')
    }
    else {
        layui.element.progress('progress', '0%')
    }

    $('.tingxie-index').text(percent)
    $('.tingxie-word').text('')
    $('.page button').removeClass('layui-btn-disabled')
}

function randomSort(a, b) {
    return Math.random() > 0.5 ? -1 : 1;
}

$("#start").on('click',function () {

    // 检查是否选择课文
    var firstchapters = $('#tingxie-chapter-first input[name="chapter"]:checked')
    var secondchapters = $('#tingxie-chapter-second input[name="chapter"]:checked')

    if(firstchapters.length > 0 || secondchapters.length > 0){
        selectdata = []

        $.each(firstchapters, function () {
            var index = $(this).val()
            selectdata = selectdata.concat(datahouse.first[index])
        })
    }
    else{
        layer.alert('请选择要听写的课文')
        return
    }

    if(selectdata.length <= 0){
        layer.alert('选择要听写的课文没有词语表，请检查单词数据表是否正确')
        return
    }

    // 随机打乱
    var mode = $('input[name="mode"]:checked').val()
    if( mode == 2){
        selectdata.sort(randomSort);
    }

    restartTest()

})

$("#restart").on('click',function () {
    restartTest()
})

var option = {
    method:'get',
    hostname:"tts.baidu.com",
    path:'/text2audio?'  // +data
}

var datatemplate = {
    "lan": "zh",
    "ie": "UTF-8",
    "spd": 1,
    "text": ""
}

function playVoice(file) {
    $('#voice').html('<audio controls="controls" id="audio_player" style="display:none;"> <source src="' + file + '" > </audio><embed id="MPlayer_Alert" src="' + file + '" loop="false" width="0px" height="0px" /></embed>');
}

function getCurrentWord() {
    // 获取当前单词
    if( currentindex < -1 || currentindex >= selectdata.length){
        currentindex = -1
    }

    if( currentindex >= selectdata.length){
        layer.alert('选择要听写的课文没有词语表，请检查单词数据表是否正确')
        return
    }
    return currentindex >= 0 ? selectdata[currentindex] : null
}

// 判断文件是否存在
function fileexists(url){
    var isExists = 0

    $.ajax({
        url:url,
        async:false,
        type:'HEAD',
        error:function(){
            isExists=0
        },
        success:function(){
            isExists=1
        }
    })

    if(isExists==1){
        return true
    }
    else{
        return false
    }
}

function readWord(word) {
    // 在线语音合成
    responsiveVoice.speak(word, "Chinese Female", {rate: 0.8})
}

$("#tingxie-read").on('click',function () {
    var word = getCurrentWord()
    if(word){
        readWord(word)
    }
})

$("#tingxie-next").on('click',function () {

    currentindex += 1

    if( currentindex >= selectdata.length){
        $('.page button').addClass('layui-btn-disabled')
        return
    }
    var percent = (currentindex+1) + '/' + selectdata.length
    $('.layui-progress-bar').attr('lay-percent', percent)
    layui.element.progress('progress', Math.floor((currentindex+1) / selectdata.length * 100.0) + '%')

    $('.tingxie-index').text(percent)
    $('.tingxie-word').text('')
    var word = getCurrentWord()
    readWord(word)
})


$("#tingxie-answer").on('click',function () {
    var word = getCurrentWord()
    if(word){
        $('.tingxie-word').text(word)
    }
})