$(document).ready(function(){
	var socket = io.connect();

	var from = $.cookie('user');//从 cookie 中读取用户名，存于变量 from
	var to = 'all';//设置默认接收对象为"所有人"
	//发送用户上线信号
	socket.emit('online', {user: from});
	socket.on('online', function (data) {
  	//显示系统消息
  	if (data.user != from) {
  	var sys = '<div style="color:#f00">系统(' + now() + '):' + '用户 ' + data.user + ' 上线了！</div>';
  	} else {
  	var sys = '<div style="color:#f00">系统(' + now() + '):你进入了聊天室！</div>';
  	}
  	$("#contents").append(sys + "<br/>");
  	//刷新用户在线列表
  	flushUsers(data.users);
  	//显示正在对谁说话
  	showSayTo();
  });

  socket.on('say', function(data){
     if(data.to == 'all'){
        $("#contents").append('<div>' + data.from + '(' + now() + ')对 所有人 说：<br/>' + data.msg + '</div><br />');
     }

     if(data.to == from) {
        $("#contents").append('<div style="color:#00f" >' + data.from + '(' + now() + ')对 你 说：<br/>' + data.msg + '</div><br />');
     }
  });

  socket.on('offline', function(data){
     var sys = '<div style="color:#f00">系统(' + now() + '):' + '用户 ' + data.user + ' 下线了！</div>';

    $("#contents").append(sys + "<br/>");
    //刷新用户在线列表
    flushUsers(data.users);
    //如果正对某人聊天，该人却下线了
    if (data.user == to) {
      to = "all";
    }
    //显示正在对谁说话
    showSayTo();
    });

  $('#say').click(function(){
    var $msg = $('#input_content').html();
    //alert(msg);
    if($msg == '')
      return;

    if(to == 'all'){
      $('#contents').append('<div>你(' + now() + ')对 所有人 说：<br/>' + $msg + '</div><br />');
    }
    else{
      $('#contents').append('<div style="color:#00f" >你(' + now() + ')对 ' + to + ' 说：<br/>' + $msg + '</div><br />')
    }

    socket.emit('say', {from: from, to: to, msg: $msg});

    $('#input_content').html('').focus();
  });

  //刷新用户在线列表
function flushUsers(users) {
  //清空之前用户列表，添加 "所有人" 选项并默认为灰色选中效果
  $("#list").empty().append('<li title="双击聊天" alt="all" class="sayingto" onselectstart="return false">所有人</li>');
  //遍历生成用户在线列表
  for (var i in users) {
    $("#list").append('<li alt="' + users[i] + '" title="双击聊天" onselectstart="return false">' + users[i] + '</li>');
  }
  //双击对某人聊天
  $("#list > li").dblclick(function() {
    //如果不是双击的自己的名字
    if ($(this).attr('alt') != from) {
      //设置被双击的用户为说话对象
      to = $(this).attr('alt');
      //清除之前的选中效果
      $("#list > li").removeClass('sayingto');
      //给被双击的用户添加选中效果
      $(this).addClass('sayingto');
      //刷新正在对谁说话
      showSayTo();
    }
  });
}

//显示正在对谁说话
function showSayTo() {
  $("#from").html(from);
  $("#to").html(to == "all" ? "所有人" : to);
}

function now() {
  var date = new Date();
  var time = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + (date.getMinutes() < 10 ? ('0' + date.getMinutes()) : date.getMinutes()) + ":" + (date.getSeconds() < 10 ? ('0' + date.getSeconds()) : date.getSeconds());
  return time;
}

});

