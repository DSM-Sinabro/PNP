function cancelButton_click(){
  var ask = confirm('작성하지 않고 현재 페이지를 벗어나겠습니까?');
  if(ask == true){
    location.href = 'recruit';
  }
}
