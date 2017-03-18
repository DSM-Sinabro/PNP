
$(document).ready(function(){
    $("#downBtn").on('click', function(event) {
      if (this.hash !== "") {
        $('html, body').animate({
          scrollTop: $('#intro').offset().top
      }, 500, function(){
            console.log();
        });
      }
      event.preventDefault();
    });

    $("#signUpModal #checkId").click(function(event){
      var id = "id="+$("#signUpModal #userid").val();
      $.ajax({
        url: '/checkId',
        type: 'POST',
        data: id,
        success: function(result){
          alert(result['msg']);
        },
        error:function(error){
          alert(error.responseText);

        }
      });
    });

    $("#signUpModal #confirmSign").click(function(event){
      var formData = $("#signUpModal form").serialize();
      $.ajax({
        url: '/signUp',
        type: 'POST',
        data: formData,
        success: function(result){
          alert(result['msg']);
          location.reload();
        },
        error: function(error){
          alert(error.responseText);
        }
      });
    });

    $("#signInModal #confirmSign").click(function(event){
      confirmSignIn();
      // var formData = $("#signInModal form").serialize();
      // $.ajax({
      //   url: '/signIn',
      //   type: 'POST',
      //   data: formData,
      //   success: function(result){
      //     alert(result['msg']);
      //     location.reload();
      //   },
      //   error: function(error){
      //     alert(error.responseText);
      //   }
      // });
    });
});
var confirmSignIn = function(){
  var formData = $("#signInModal form").serialize();
  $.ajax({
    url: '/signIn',
    type: 'POST',
    data: formData,
    success: function(result){
      alert(result['msg']);
      location.reload();
    },
    error: function(error){
      alert(error.responseText);
    }
  });
};
