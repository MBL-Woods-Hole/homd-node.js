// const links = {'help_overview':['features','guide'],
// 'help_taxon':['intro','table','hierarchy','level','description','trees','align'],
// 'help_ident':['blast','history'],
// 'help_genomes':['genomes_homd','tables','ref_history','meta','ncbi'],
// 'help_tools':['overview','genome','jbrowse','annotation','blast','dynamic','kegg','ontology','download'],
// 'help_search':['meta'],
// 'help_info':['homepage','pdescription','team','mailing','contact','cite','availability'],
// 'help_anouncements':['none']
// }
// var id_list = []
// var n = 0;
// for (i in links) {
// 	
// 	for (j in links[i]){
// 		n= n+1;
// 		//alert(n)
// 		var link = i+'--'+links[i][j]
// 		var link_id = link+'_id'
// 		console.log('link= '+link)
// 		link_id = document.getElementById(link) || null;
// 		if (link_id !== null) {
// 		  link_id.addEventListener('click', function () {
// 			  //clear_filters();
// 			  test_ajax(link_id)
// 			  
// 			  //console.log('...........................................found click fxn')
// 		  });
// 		}
// 	}
// }
	
// overview_link_id = document.getElementById('help_overview--features') || null;
// if (overview_link_id !== null) {
//   overview_link_id.addEventListener('click', function () {
// 	  //clear_filters();
// 	  test_ajax(overview_link_id)
// 	  
// 	  //console.log('...........................................found click fxn')
//   });
// }
// guide_link_id = document.getElementById('help_overview--guide') || null;
// if (guide_link_id !== null) {
//   guide_link_id.addEventListener('click', function () {
// 	  //clear_filters();
// 	  test_ajax(guide_link_id)
// 	  
// 	  //console.log('...........................................found click fxn')
//   });
// }
function userdocs_side_menu() {
	var Accordion = function(el, multiple) {
		this.el = el || {};
		this.multiple = multiple || false;

		// Variables privadas
		var links = this.el.find('.link');
		// Evento
		links.on('click', {el: this.el, multiple: this.multiple}, this.dropdown)
	}

	Accordion.prototype.dropdown = function(e) {
		var $el = e.data.el;
			$this = $(this),
			$next = $this.next();

		$next.slideToggle();
		$this.parent().toggleClass('open');

		if (!e.data.multiple) {
			$el.find('.submenu').not($next).slideUp().parent().removeClass('open');
		};
	}	

	var accordion = new Accordion($('#accordion'), false);
	//tmp = menu +'--'+ page
	//console.log(tmp)
	// on load open accordion to specific page
	//jQuery("#"+menu).slideDown()
	//jQuery.wait(200)
	//jQuery("#"+menu +"--"+ page+" > a").css({"color":"red"})
	
	
};
function set_all_links_default() {
	// get all the a links in the ul list
	var links = [];
	$("#accordion").find('a').each(function() {
    	//links.push( this ); 
    	//console.log('lnk '+$(this).attr('id')) 
    	 this.style.color='white'
	})
	//var id_list = []
	//var n = 0;
	//for (i in links) {
	     //links[i].style.color='white'
		// for (j in links[i]){
// 			n= n+1;
// 			//alert(n)
// 			var link = i+'--'+links[i][j]
// 			var link_id = link+'_id'
// 			console.log('link= '+link)
// 			link_id = document.getElementById(link) || null;
// 			if (link_id !== null) {
// 			  link_id.style.color='white'
// 			  
// 			}
// 		}
	//}
}
function ajax(x) {
   //console.log(jQuery(x).parent.id)
   	console.log(jQuery(x).attr('id'))
   	//jQuery(x).parent().css({"background-color":"green"})
   	var args = {}
   	args.id = jQuery(x).attr('id')
   	var tmp = args.id.split('--')
   	set_all_links_default()
   	var xmlhttp = new XMLHttpRequest();
	xmlhttp.open("POST", "/help/ajax", true);
	xmlhttp.setRequestHeader("Content-type","application/json");
    xmlhttp.onreadystatechange = function() {
          if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var response = xmlhttp.responseText;
            var static_data = JSON.parse(response)
            // if(response=='OK')
            //console.log('response')
            //console.log(response)
            //alert(response)
            document.getElementById(args.id).style.color = "red";
            document.getElementById('content_div').innerHTML = static_data.data;
        	// changes url to allow reload page (Seems to lose the header images)
           // window.history.pushState({}, null, "/help/template/?menu="+tmp[0]+"&page="+tmp[1]+"&new=1");
            //window.location.href = "/help/template/?menu="+tmp[0]+"&page="+tmp[1]+"&new=1";

          }
    }
	xmlhttp.send(JSON.stringify(args));
   
};
 //  var _gaq = _gaq || [];
//   _gaq.push(['_setAccount', 'UA-36251023-1']);
//   _gaq.push(['_setDomainName', 'jqueryscript.net']);
//   _gaq.push(['_trackPageview']);
// 
//   (function() {
//     var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
//     ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
//     var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
//   })();

