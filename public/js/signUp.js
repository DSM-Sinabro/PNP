$(document).ready(function() {
    var id = false;
    var email = false;
    $("#id").focusout(function() {
        $.ajax({
            type: "POST",
            url: "checkID",
            dataType: 'json',
            data: {
                'id': $("#id").val()
            },
            success: function(data) {
                id = data.ID;
                console.log(id=="true");
                $("#checkID").html(data.msg);
            }
        });
    });
    $("#email").focusout(function() {
        $.ajax({
            type: "POST",
            url: "checkEmail",
            dataType: "json",
            data: {
                'email': $("#email").val()
            },
            success: function(data) {
                email = data.email;
                console.log(email);
                $("#checkEmail").html(data.msg);
            }
        });
    });

    $("#submit").on("click", function() {
        if (id == "true" && email == "true"){
            $.ajax({
                type : "POST",
                url:"signUp",
                dataType : "json",
                data :  $("form").serialize()
            });
        }else{
            alert("ID 혹은 Email을 다시 확인 하여주세요");
        }
    });
});
