
function change_genome1(genome){
	console.log(genome)
	var form = document.getElementById('load_genome_form')
	document.getElementById('iframe_div').style.visibility='visible'
	console.log(form)
	//alert(form['gnom_select'].value)
	form.submit()
}


function change_genome2(genome){
  console.log(genome)
  if(genome=='none'){
     document.getElementById("genome_iframe").src = "";	
	 document.getElementById("genome_iframe").width = '100%'
	 document.getElementById("genome_iframe").height = '0'
     return
  }
  // reload page form or ajax?
  args = {}
  args.gnom = genome
  //import assembly from '/jbrowse/js/assembly_'+genome+'.js'
  //import tracks from '/jbrowse/js/tracks_'+genome+'.js';
  //var json = require('/jbrowse/js/assembly_'+genome+'.js'); //(with path)
  
  

  
  
  var xmlhttp = new XMLHttpRequest();
	xmlhttp.open("POST", "/genomes/jbrowse_ajax", true);
	xmlhttp.setRequestHeader("Content-type","application/json");
    xmlhttp.onreadystatechange = function() {
          if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var response = xmlhttp.responseText;
            var static_data = JSON.parse(response)
            // if(response=='OK')
            console.log(response)
            //alert(response)
                //html = "<center><h2>Embedded JBrowse2 "+ genome +"</h2></center>"
				//html += "<iframe"
				// 	html += "src='/jbrowse2-orig/index.html?config=/jbrowse2-orig/test_data/"+ genome +"/config.json'"
// 					html += 'style="border: 1px solid black"'
// 					html += 'width="100%"'
// 					html += 'height="800px"'
// 				html += ">"
// 				html += "</iframe>"
				
			document.getElementById("genome_iframe").src = "/jbrowse2/index.html?tracklist=0&nav=0&overview=0&config=/jbrowse2/test_data/"+ genome +"/config.json";	
			document.getElementById("genome_iframe").width = '100%'
			document.getElementById("genome_iframe").height = '800px'
			
			//document.getElementById('iframe_div').innerHTML = 'VVV'



          }
    }
	xmlhttp.send(JSON.stringify(args));
}

function toggle_options(){
	var el = document.getElementById("gen_options")
	//console.log(el)
	if(el.style.display == 'none'){
		el.style.display = 'inline'
	}else{
		el.style.display = 'none'
	}
	//document.getElementById("gen_options").innerHTML = "insert here"
}