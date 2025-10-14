

// this should run on every page for main menu open speed
function mainmenu(){
  $(" #nav ul ").css({display: "none"}); // Opera Fix
  $(" #nav li").hover(function(){
        $(this).find('ul:first').css({visibility: "visible",display: "none"}).show(400);
        },function(){
        $(this).find('ul:first').css({visibility: "hidden"});
        });
}
function close_flash(m){
  if(m == 'success'){
    $('#alert_flash_message_success').delay(500).slideUp(300);
  }else{
    $('#alert_flash_message_fail').delay(500).slideUp(300);
  }
}

