
// function change_genome1(genome){
// 	console.log(genome)
// 	var form = document.getElementById('load_genome_form')
// 	document.getElementById('iframe_div').style.visibility='visible'
// 	console.log(form)
// 	//alert(form['gnom_select'].value)
// 	form.submit()
// }
function open_jbrowse_in_new_window(gid){
  console.log(gid)
  if(gid=='none'){
     document.getElementById("genome_iframe").src = "";	
	 document.getElementById("genome_iframe").width = '100%'
	 document.getElementById("genome_iframe").height = '0'
     return
  }
  var url = "http://www.homd.org/jbrowse/index.html?data=homd/"+gid
  window.open(url)
}

function change_genome_4_jbrowse(gid){
  console.log(gid)
  if(gid=='none'){
     document.getElementById("genome_iframe").src = "";	
	 document.getElementById("genome_iframe").width = '100%'
	 document.getElementById("genome_iframe").height = '0'
     return
  }
  // reload page form or ajax?
  
  let url ="http://www.homd.org/jbrowse/index.html?data=homd/"+gid
  console.log(url)
  document.getElementById("genome_iframe").width = '100%'
  document.getElementById("genome_iframe").height = '800px'
  document.getElementById("genome_iframe").src = url;
  new_window_txt ="[<a href='http://www.homd.org/jbrowse/index.html?data=homd/"+gid+"' target='_blank'>Open in a new window</a>]"
  document.getElementById("open_new_window").innerHTML = new_window_txt;
  document.getElementById("gid-label").innerHTML = ': '+gid
  
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
		var win = window.open("about:blank", null, "menubar=no,status=no,toolbar=no,location=no,width=950,height=400");
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
function genome_table_search(){
   form = document.getElementById('gtable_search')
   if(form.gen_srch.value === ''){
       return
   }
   form.submit()
}