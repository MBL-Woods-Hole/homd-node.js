
function change_genome1(genome){
	console.log(genome)
	var form = document.getElementById('load_genome_form')
	document.getElementById('iframe_div').style.visibility='visible'
	console.log(form)
	//alert(form['gnom_select'].value)
	form.submit()
}


function change_genome2(gid){
  console.log(gid)
  if(gid=='none'){
     document.getElementById("genome_iframe").src = "";	
	 document.getElementById("genome_iframe").width = '100%'
	 document.getElementById("genome_iframe").height = '0'
     return
  }
  // reload page form or ajax?
  args = {}
  args.gid = gid
  //import assembly from '/jbrowse/js/assembly_'+genome+'.js'
  //import tracks from '/jbrowse/js/tracks_'+genome+'.js';
  //var json = require('/jbrowse/js/assembly_'+genome+'.js'); //(with path)
  
  

  
  
  var xmlhttp = new XMLHttpRequest();
	xmlhttp.open("POST", "/genome/jbrowse_ajax", true);
	xmlhttp.setRequestHeader("Content-type","application/json");
    xmlhttp.onreadystatechange = function() {
          if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var response = xmlhttp.responseText;
            var static_data = JSON.parse(response)
            // if(response=='OK')
            console.log('resp:',response)
            //alert(response)
                //html = "<center><h2>Embedded JBrowse2 "+ genome +"</h2></center>"
				//html += "<iframe"
				// 	html += "src='/jbrowse2-orig/index.html?config=/jbrowse2-orig/test_data/"+ genome +"/config.json'"
// 					html += 'style="border: 1px solid black"'
// 					html += 'width="100%"'
// 					html += 'height="800px"'
// 				html += ">"
// 				html += "</iframe>"
			var jburl = "?data=homd_configs/"+gid
			jburl += "&tracklist=0&nav=0&overview=0"
			jburl += "&config=homd_configs/"+gid +"/config.json"
			document.getElementById("genome_iframe").src = "/jbrowse2/" + jburl;	
			document.getElementById("genome_iframe").width = '100%'
			document.getElementById("genome_iframe").height = '800px'
			
			//document.getElementById('iframe_div').innerHTML = 'VVV'



          }
    }
	xmlhttp.send(JSON.stringify(args));
}

function toggle_options(){
	var el = document.getElementById("gen_options")
	if(el.style.display === 'none'){
		el.style.display = 'inline'
		document.getElementById("goptions").innerHTML = 'Options [-]'
	}else{
		el.style.display = 'none'
		document.getElementById("goptions").innerHTML = 'Options [+]'
	}
}

function get_16s_seq(seqid) {
    
    //<!-- >001A28SC | Bartonella schoenbuchensis | HMT-001 | Strain: A28SC | GB: GQ422708 | Status: Named | Preferred Habitat: Unassigned | Genome: yes -->
    //defline = '>'+seqid+' | '+genus+' '+species+' | '+taxfullname+' | '+strain+' | '+genbank+' | Status: '+status+' | Preferred Habitat: '+site+' | '+flag
    args={}
    args.seqid = seqid
    var xmlhttp = new XMLHttpRequest();
	xmlhttp.open("POST", "/genome/get_16s_seq", true);
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
		var win = window.open("about:blank", null, "menubar=no,status=no,toolbar=no,location=no,width=650,height=500");
		var doc = win.document;
		//doc.writeln("<title>yourtitle</title>");
		//doc.title = 'eHOMD Reference Sequence'
		doc.open("text/html");
		
		doc.write("<title>eHOMD 16s rRNA Gene Sequence</title>"+text);
		doc.close();
      }
    }
    xmlhttp.send(JSON.stringify(args));
}
//
function get_NN_NA_seq(type,pid,db) {  // type=nn or na
    console.log('in NNNA',type,pid)
    //<!-- >001A28SC | Bartonella schoenbuchensis | HMT-001 | Strain: A28SC | GB: GQ422708 | Status: Named | Preferred Habitat: Unassigned | Genome: yes -->
    //defline = '>'+seqid+' | '+genus+' '+species+' | '+taxfullname+' | '+strain+' | '+genbank+' | Status: '+status+' | Preferred Habitat: '+site+' | '+flag
    console.log(type,pid)
    args={}
    args.type = type
    args.pid  = pid
    args.db   = db
    var xmlhttp = new XMLHttpRequest();
	xmlhttp.open("POST", "/genome/get_NN_NA_seq", true);
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
		var win = window.open("about:blank", null, "menubar=no,status=no,toolbar=no,location=no,width=650,height=500");
		var doc = win.document;
		//doc.writeln("<title>yourtitle</title>");
		//doc.title = 'eHOMD Reference Sequence'
		doc.open("text/html");
		
		doc.write("<title>eHOMD 16s rRNA Gene Sequence</title>"+text);
		doc.close();
      }
    }
    xmlhttp.send(JSON.stringify(args));
}
//
function format_long_numbers(x){
    // change 456734 => 456,734
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
//
function clear_gene_srch(){
   gene_srch_text = document.getElementById("gene_srch_text")
   gene_srch_text.value=''
}
function select_annotation(gid,anno){
    console.log(gid,anno)
}