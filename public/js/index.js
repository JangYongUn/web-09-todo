/************** 글로벌설정 ***************/
var auth = firebase.auth();
var db = firebase.database();
var user = null;
var ref = null;
var key = null;
var google = new firebase.auth.GoogleAuthProvider();
var facebook = new firebase.auth.FacebookAuthProvider();


/************** 사용자함수 ***************/
function dbInit() {
	db.ref('root/todo/'+user.uid).on('child_added', onAdd);
	db.ref('root/todo/'+user.uid).on('child_removed', onRev);
	db.ref('root/todo/'+user.uid).on('child_changed', onChg);
}

function addHTML(k, v) {
	var html = '<li id="'+k+'" class="'+(v.checked ? 'opacity': '')+'">';
	if(v.checked) {
		html += '<i class="far fa-circle" onclick="onCheck(\''+k+'\', true);"></i>';
		html += '<i class="active far fa-check-circle" onclick="onCheck(\''+k+'\', false);"></i>';
	}
	else{
		html += '<i class="active far fa-circle" onclick="onCheck(\''+k+'\', true);"></i>';
		html += '<i class="far fa-check-circle" onclick="onCheck(\''+k+'\', false);"></i>';
	}
	html += '<input type="text" class="ml-3" value="'+v.task+'" onchange="onChange(\''+k+'\', this);" onfocus="onFocus(this);" onblur="onBlur(this);">';
	html += '<div class="date">'+moment(v.createdAt).format('llll')+'</div>';
	html += '<button class="btn btn-sm btn-danger bt-delete" onclick="onDelete(\''+k+'\');">삭제</button>';
	html += '</li>';

	var $li = $(html).prependTo($(".list-wrap"));
	$li.css("opacity");
	$li.css("opacity", 1);

	return $li;
}

function toggleList() {
	var ref =sb.ref('root/todo/'+user.uid);
	if( $('.bt-done').hasClass('active') ) {  // 감추기
		ref.orderByChild('checked').equalTo(false).once('value').then(onGetData);
	}
	else{
		ref.once('value').then(onGetData);
	}
}


/************** 이벤트콜백 ***************/
function onReset(f) {
	f.key.value = '';
	$('.edit-wrapper').find('button.btn-primary').removeClass('d-none');
	$('.edit-wrapper').find('button.btn-success').addClass('d-none');
}

function onGetTask(r) {
	$('.edit-wrapper').find('form input[name="key"]').val(r.key);
	$('.edit-wrapper').find('form input[name="task"]').val(r.val().task);
	$('.edit-wrapper').find('form textarea[name="comment"]').val(r.val().comment);
	$('.edit-wrapper').find('button.btn-primary').addClass('d-none');
	$('.edit-wrapper').find('button.btn-success').removeClass('d-none');
}

function onEdit(f) {
	var key = f.key.value;
	var data = {
		task: f.task.value,
		comment: f.comment.value,
		createdAt: new DataCue().getTime(),
		checked: false
	};
	if(key == "") {
		db.ref('root/todo/'+user.uid).push(data);
	}
	else{
		db.ref('root/todo/'+user.uid+'/'+key).update(data);
	}
	f.key.value = '';
	f.reset();
	return false;
}

function onFocus(el) {
	$(el).parent().addClass('active');
	key = $(el).parent().attr('id');
	db.ref('root/todo/'+user.uid+'/'+key).once('value').then(onGetTask);
}

function onBlur(el) {
	$(el).parent().removeClass('active');
}

function onKeyup(el) {
	$('.edit-wrapper input[name="task"]').val($(el).val());
}

function onChange(k, v) {
	db.ref('root/todo/'+user.uid+'/'+k).update({ task: v.value });
}

function onDelete(key) {
	db.ref('root/todo/'+user.uid+'/'+key).remove();
}

function onCheck(key, chk) {
	db.ref('root/todo/'+user.uid+'/'+key).update({ checked: chk });
	/*
	$(el).siblings('i').addClass('active');
	$(el).removeClass('active');
	if(chk) {
		timeout = setTimeout(function(){ 
			$(el).parent().css('opacity', 0);
			setTimeout(function(){
				var data = { checked: true };
				$(el).parent().remove();
				db.ref('root/todo/'+user.uid+'/'+$(el).parent().attr('id')).update(data)
			}, 750) 
		}, 3000);
	}
	else {
		clearTimeout(timeout);
	}
	*/
}

function onDoneClick() {
	$('.bt-done').toggleClass('active');
	toggleList();
}













var timeout;
function onCheck(el, chk) {
	$(el).siblings('i').addClass('active');
	$(el).removeClass('active');
	if(chk) {
		timeout = setTimeout(function(){ 
			$(el).parent().css('opacity', 0);
			setTimeout(function(){
				var data = { checked: true };
				$(el).parent().remove();
				db.ref('root/todo/'+user.uid+'/'+$(el).parent().attr('id')).update(data)
			}, 750) 
		}, 3000);
	}
	else {
		clearTimeout(timeout);
	}
}

function onDoneClick() {
	$('.bt-done').toggleClass('active');
	var ref = db.ref('root/todo/'+user.uid);
	if( $('.bt-done').hasClass('active') ) { //감추기
		ref.orderByChild('checked').equalTo(false).once('value').then(onGetData);
	}
	else {	//보이기
		ref.once('value').then(onGetData);
	}
}

function onGetData(r) {
	for(var i in r.val()){
		console.log(r.val()[i].task);
	}
}

function onSubmit(f) {
	var data = {
		task: f.task.value,
		createdAt: new Date().getTime(),
		checked: false,
	}
	if(f.task.value !== '') db.ref('root/todo/'+user.uid).push(data);
	return false;
}

function onAdd(r) {
	// console.log(r.key);
	// console.log(r.val());
	if(!r.val().checked) {
		var html  = '<li id="'+r.key+'">';
		html += '	<i class="active far fa-circle" onclick="onCheck(this, true);"></i>';
		html += '	<i class="far fa-check-circle" onclick="onCheck(this, false);"></i>';
		html += '	<span>'+r.val().task+'</span>';
		html += '</li>';
		var $li = $(html).prependTo($(".list-wrap"));
		$li.css("opacity");
		$li.css("opacity", 1);
	}

	// $(".add-wrap")[0].reset();
	document.querySelector(".add-wrap").reset();
}

function onRev(r) {
	console.log(r.val());
}

function onChg(r) {
	console.log(r.val());
}


function onAuthChg(r) {
	user = r;
    if(r) {  // 로그인 되었다면..
		$('.sign-wrap .icon img').attr('src', user.photoURL);
		$('.sign-wrap .email').html(user.email);
		$('.modal-wrapper.auth-wrapper').hide();
   		$('#btLogout').show();
    	dbInit();
	}
	else {  // 로그아웃 되었다면...
		$('.sign-wrap .icon img').attr('src', 'https://via.placeholder.com/36');
		$('.sign-wrap .email').html('');
		$('.modal-wrapper.auth-wrapper').show();
		$('#btLogout').hide();
	}
}

function onGoogleLogin() {
  auth.signInWithPopup(google);
}

function onLogout() {
  auth.signOut();
}


/************** 이벤트등록 ***************/
auth.languageCode = 'ko';
auth.onAuthStateChanged(onAuthChg);  // Watcher: 로그인상태 감시자

$('#btGoogleLogin').click(onGoogleLogin);
$('#btLogout').click(onLogout);