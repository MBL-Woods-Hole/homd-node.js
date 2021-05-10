// this should run on every page for main menu open speed
function mainmenu(){
	$(" #nav ul ").css({display: "none"}); // Opera Fix
	$(" #nav li").hover(function(){
        $(this).find('ul:first').css({visibility: "visible",display: "none"}).show(200);
        },function(){
        $(this).find('ul:first').css({visibility: "hidden"});
        });
}

// function mainmenu() {
//    document.getElementById("nav").style.display='none'
//    document.getElementById("ul").style.display='none'
//    
//    
// }

// replace jquery?
// window.onload = function() {
//     var elements = document.getElementsByTagName('sd');
//     for (var i in elements) {
//         if (!elements.hasOwnProperty(i)) continue;
//         elements[i].addEventListener( 'mouseover', function() {
//             this.className += 'a';
//         }
//         elements[i].addEventListener( 'mouseout', function() {
//             this.className = this.className.replace( /(?:^|\s)a(?!\S)/g , '' );
//         }
//     }
// }