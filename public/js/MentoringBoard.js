function cancelButton_click(){
  var ask = confirm('작성하지 않고 현재 페이지를 벗어나겠습니까?');
  if(ask == true){
    location.href = 'mentoring';
  }
}

function deleteBoard(){
  // var identify = prompt("글 삭제 비밀번호를 입력해주세요","password");
  // if(identify == data[0].ment_write_password){
  //   confirm("글을 삭제하시겠습니까??????????")}
  alert(<%=data[0].ment_write_password%>);

}

function submitEvent() {
  var title = document.getElementById('title').value;
  var content = document.getElementById('content').value;
  var password = document.getElementById('password').value;

  var isTitle = "", isContent = "", isPassword = "";

  if(title == undefined || title == ""){
    isTitle = "제목,";
  }

  if(content == undefined ||content == ""){
    isContent = "본문,";
  }

  if(password == undefined || password == ""){
    isPassword = "비밀번호";
  }

  if(isTitle != "" || isContent != "" || isPassword != ""){
    alert('입력하지 않은 부분이 있습니다!! (' + isTitle + isContent + isPassword + ')');
    return false;
  }

  return true;
}
