// Get the search box input field
var input = document.getElementById("search_text");
// Execute a function when the user releases a key on the keyboard
input.addEventListener("keyup", function(event) {
  // Number 13 is the "Enter" key on the keyboard
  if (event.keyCode === 13) {
    // Cancel the default action, if needed
    event.preventDefault();
    // Trigger the button element with a click
    document.getElementById("search_button").click();
  }
});

// this should run on every page for main menu open speed
function mainmenu(){
	$(" #nav ul ").css({display: "none"}); // Opera Fix
	$(" #nav li").hover(function(){
        $(this).find('ul:first').css({visibility: "visible",display: "none"}).show(400);
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
	//var form = document.getElementById('menu-search')
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

function open_tree(tree_name) {  // needs to be global ie in menu.js
    // tree names: refseq, conserved, ribosomal, 16S_rRNA
    // OPEN TREES In another window not in an iframe
    args={}
    args.tree_name = tree_name
    var xmlhttp = new XMLHttpRequest();
	xmlhttp.open("POST", "/homd/open_tree", true);
	xmlhttp.setRequestHeader("Content-type","application/json");
    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
        var resp = xmlhttp.responseText;
        //console.log(defline)
        text = ''
        //text += '<pre>'+defline+'<br>'
        text = '<pre>'
        text += resp
        text += '</pre>'
		var win = window.open( "menubar=no,status=no,toolbar=no,location=no,width=950,height=400");
		var doc = win.document;
		//doc.writeln("<title>yourtitle</title>");
		//doc.title = 'eHOMD Reference Sequence'
		//doc.open("text/html");
		doc.open("image/svg+xml");
		//doc.write("<title>eHOMD 16s rRNA Gene Sequence</title>"+text);
		doc.write(text);
		doc.close();
      }
    }
    xmlhttp.send(JSON.stringify(args));
}