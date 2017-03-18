$(document).ready(function() {

    $("#submit").on("click", function() {
        $.ajax({
            type: "POST",
            url: "signIn",
            dataType: 'json',
            data:
                {
                    'id': $("#id").val(),
                    'pwd':$("#pwd").val()
                }
            ,
            success: function(data) {
                if(data.status == "success"){
                    window.location = "/";
                }else{
                    alert("아이디 혹은 비밀번호를 다시 확인해주세요");
                }
            }
        });
    });

});
