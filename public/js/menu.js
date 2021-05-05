// this should run on every page for main menu open speed
function mainmenu(){
	$(" #nav ul ").css({display: "none"}); // Opera Fix
	$(" #nav li").hover(function(){
        $(this).find('ul:first').css({visibility: "visible",display: "none"}).show(200);
        },function(){
        $(this).find('ul:first').css({visibility: "hidden"});
        });
}