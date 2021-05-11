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

function search(){
	var form = document.getElementById('menu-search')
	searchText = document.getElementById('search_text').value
	if(!searchText)
		return
	var f = document.createElement("form");
	f.setAttribute('method',"post");
	f.setAttribute('action',"/homd/site_search"); 
	
	//create input element
	var i = document.createElement("input");
	i.type = "text";
	i.name = "intext";
	i.id = "intext";
	i.value = searchText
	// add all elements to the form
	f.appendChild(i);
	document.getElementsByTagName('body')[0].appendChild(f); //pure javascript
	f.submit()
}