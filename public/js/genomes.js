
// function change_genome1(genome){
// 	console.log(genome)
// 	var form = document.getElementById('load_genome_form')
// 	document.getElementById('iframe_div').style.visibility='visible'
// 	console.log(form)
// 	//alert(form['gnom_select'].value)
// 	form.submit()
// }
function open_blast_in_new_window(gid){
  console.log(gid)
  let url = ''
  if(gid=='0'){
     return
  }
  form = document.getElementById("blast_single_form")
  radios = document.getElementsByName("annotation")
  if(radios[0].checked == true){
    url = homd_path+'/genome_blast_single_prokka?gid='+gid
  }else{
    url = homd_path+'/genome_blast_single_ncbi?gid='+gid
  }
  window.open(url)
}
// function open_jbrowse_in_new_windowORIG(gidplusgc){
//   console.log('open_jbrowse_in_new_window',gidplusgc)
//   pts = gidplusgc.split('|')
//   gid = pts[0]
//   gc = pts[1]
//   if(gid=='0'){
//      document.getElementById("genome_iframe").src = "";	
//      document.getElementById("genome_iframe").width = '100%'
//      document.getElementById("genome_iframe").height = '0'
//      return
//   }
//   //let url = "/jbrowse/index.html?data=homd_V10.1/"+gid+"&tracks=DNA,prokka,prokka_ncrna,ncbi,ncbi_ncrna,GC Content (pivot at "+gc+"),GC Skew"
//   let url = jb_path+'/'+gid+"&tracks=DNA,prokka,prokka_ncrna,ncbi,ncbi_ncrna,GC Content (pivot at "+gc+"),GC Skew"
//   
//   window.open(url)
// }
// function open_jbrowse_in_new_window(gidplusgc){
//   console.log('open_jbrowse_in_new_window',gidplusgc)
//   console.log('1-jb from choose gid')
//   pts = gidplusgc.split('|')
//   gid = pts[0]
//   gc = pts[1]
//   if(!gc){gc='0'}
//   if(gid=='0'){
//      document.getElementById("genome_iframe").src = "";	
//      document.getElementById("genome_iframe").width = '100%'
//      document.getElementById("genome_iframe").height = '0'
//      return
//   }
//   
//   var xmlhttp = new XMLHttpRequest();
// 	xmlhttp.open("POST", "/genome/jbrowse_ajax1", true);
// 	xmlhttp.setRequestHeader("Content-type","application/json");
//     xmlhttp.onreadystatechange = function() {
//       if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
//         var resp = xmlhttp.responseText;
//         //console.log(defline)
//         let url = jb_path+'/'+gid+"&tracks=DNA,prokka,prokka_ncrna,ncbi,ncbi_ncrna,GC Content (pivot at "+gc+"),GC Skew"
//         console.log(url)
//         window.open(url)
//       }
//     }
//     xmlhttp.send();
//   //let url = "/jbrowse/index.html?data=homd_V10.1/"+gid+"&tracks=DNA,prokka,prokka_ncrna,ncbi,ncbi_ncrna,GC Content (pivot at "+gc+"),GC Skew"
//   
// }
// function open_jbrowse_in_new_window2(gid){
//   console.log('open_jbrowse_in_new_window2',gidplusgc)
//   console.log('1-jb from choose gid')
//   
//   contig = document.getElementById("select-contig").value
//      
//   var xmlhttp = new XMLHttpRequest();
// 	xmlhttp.open("POST", "/genome/jbrowse_ajax1", true);
// 	xmlhttp.setRequestHeader("Content-type","application/json");
//     xmlhttp.onreadystatechange = function() {
//       if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
//         var resp = xmlhttp.responseText;
//         //console.log(defline)
//         //let url = jb_path+'/'+gid+"&tracks=DNA,prokka,prokka_ncrna,ncbi,ncbi_ncrna,GC Content (pivot at "+gc+"),GC Skew"
//         let url = jb_path+'/'+gid+"&tracks=DNA,prokka,prokka_ncrna,ncbi,ncbi_ncrna&loc="+gid+"|"+contig
//      
//         console.log(url)
//         window.open(url)
//       }
//     }
//     xmlhttp.send();
//   //let url = "/jbrowse/index.html?data=homd_V10.1/"+gid+"&tracks=DNA,prokka,prokka_ncrna,ncbi,ncbi_ncrna,GC Content (pivot at "+gc+"),GC Skew"
//   
// }
function open_jbrowse(value, page, gc='', contig='',  annotation='', loc='0', hilit='0'){
  console.log('open_jbrowse',value,page)
  /*
  value: may be gid or gid|gc or gid|contig
  page = may be the specific page:
     genome_table, main_menu, genome_desc, 
     explorer(covers:head sect of exp and desc), 
     anno_table, crispr, oralgen
  annotation either ncbi or prokka
  gc may or may not be used
  
  */
  var url
  var tracks = 'DNA,prokka,prokka_ncrna,ncbi,ncbi_ncrna'
  if(page == 'genome_desc'){ 
      gid = value
      contigplusgc = document.getElementById("select-contig").value
      //console.log('contigplusgc',contigplusgc)
      pts = contigplusgc.split('|')
      contig = pts[0]
      gc = pts[1]
      url = jb_path+'/'+gid+"&tracks="+tracks+",GC Content (pivot at "+gc+"),GC Skew&loc="+gid+"|"+contig
     
  }else if(page == 'genome_table'){
       gid = value
       url = jb_path+'/'+gid+"&tracks="+tracks+",GC Content (pivot at "+gc+"),GC Skew"
      
  }else if(page == 'main_menu'){
      pts = value.split('|')
      gid = pts[0]
      gc = pts[1]
      url = jb_path+'/'+gid+"&tracks="+tracks+",GC Content (pivot at "+gc+"),GC Skew"
  }else if(page == 'explorer'){
      gid = value
      url = jb_path+'/'+gid+"&tracks="+tracks+",GC Content (pivot at "+gc+"),GC Skew"
  }else if(page == 'anno_table'){
      gid = value
      url = jb_path+'/'+gid+"&tracks="+tracks+"&loc="+loc+"&highlight="+hilit
  }else if(page == 'crispr'){
      tracks = 'crispr'
      gid = value
      url = jb_path+'/'+gid+"&tracks="+tracks+"&loc="+loc+"&highlight="+hilit
  }else if(page == 'oralgen'){
      gid = value
      url = jb_path+'/'+gid+"&tracks="+tracks
  }else{
      console.log('error')
      
  }
  console.log(url)
  
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open("POST", "/genome/jbrowse_ajax", true);
  xmlhttp.setRequestHeader("Content-type","application/json");
  xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
        var resp = xmlhttp.responseText;
        console.log(resp)
        window.open(url)
      }
  }
  xmlhttp.send();
  
}
// function offer_jbrowse(gid, contigplusgc){
//    console.log('offer_jbrowse',contigplusgc)
//    pts = contigplusgc.split('|')
//    contig = pts[0]
//    gc = (parseFloat(pts[1])/100).toFixed(2)
//    if(!contig){
//       return
//    }
//    //let url = "/jbrowse/index.html?data=homd_V10.1/"+gid+"&tracks=DNA,prokka,prokka_ncrna,ncbi,ncbi_ncrna,GC Content (pivot at "+gc+"),GC Skew"
//    let url = jb_path+'/'+gid+"&tracks=DNA,prokka,prokka_ncrna,ncbi,ncbi_ncrna,GC Content (pivot at "+gc+"),GC Skew"
//    url += "&loc="+gid+'|'+contig
//    console.log(url)
//    document.getElementById("jbrowse_offer_span").innerHTML = "<a href='"+url+"' target='_blank'>Open in Genome Viewer</a>"
// }
// function change_genome_4_jbrowse(gid){
//   //console.log(gid)
//   if(gid=='none'){
//      document.getElementById("genome_iframe").src = "";
// 	 document.getElementById("genome_iframe").width = '100%'
// 	 document.getElementById("genome_iframe").height = '0'
//      return
//   }
//   // reload page form or ajax?
//   
//   let url ="jb_path+'/'+gid+"&tracks=DNA,prokka,prokka_ncrna,ncbi,ncbi_ncrna,GC Content,GC Skew"
//   console.log(url)
//   document.getElementById("genome_iframe").width = '100%'
//   document.getElementById("genome_iframe").height = '800px'
//   document.getElementById("genome_iframe").src = url;
//   new_window_txt ="[<a href='"+url+"' target='_blank'>Open in a new window</a>]"
//   document.getElementById("open_new_window").innerHTML = new_window_txt;
//   document.getElementById("gid-label").innerHTML = ': '+gid
//   
// }

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
    // on taxon description page
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
function get_NN_NA_seq(type,pid,db,mol,org,product,gid) {  // type=nn or na
    //console.log('in NNNA',type,pid)
    // on genome explore page
    //<!-- >001A28SC | Bartonella schoenbuchensis | HMT-001 | Strain: A28SC | GB: GQ422708 | Status: Named | Preferred Habitat: Unassigned | Genome: yes -->
    //defline = '>'+seqid+' | '+genus+' '+species+' | '+taxfullname+' | '+strain+' | '+genbank+' | Status: '+status+' | Preferred Habitat: '+site+' | '+flag
    //console.log(type,pid,db,mol,org,product,gid)
    args={}
    args.type = type
    args.pid  = pid
    args.db   = db
    args.mol  = mol
    args.org   = org
    args.product   = product
    //console.log('args',args)
    const xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST", "/genome/get_NN_NA_seq", true);
    xmlhttp.setRequestHeader("Content-type","application/json");
    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {

        const resp = JSON.parse(xmlhttp.responseText);
        //console.log(resp)
        text = ''
        var leng = resp.length
        var length = ''
        if(leng !== 0){
           var length = ' | length: '+leng.toString()
        }
        //console.log('len',length)

        //text += '<pre>'+defline+'<br>'
        text = '<pre>'
        //text += '>'+product+' | '+mol+' | '+ org +'\n'
        //if(type === 'prokka'){
            text += '>' + gid +'| Protein ID: ' + pid +' | ' + product + ' | ' + org + length + '\n'
        //}else{
         //    text += '>' + mol + ' | ' + product + ' | '+ org + length + '\n'
        //}
        

        text += resp.html
        text += '</pre>'
    var win = window.open("about:blank", null, "menubar=no,status=no,toolbar=no,location=no,width=800,height=300");
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
// function select_annotation(gid,anno){
//     console.log(gid,anno)
// }
function genome_table_search(){
   form = document.getElementById('gtable_search')
   if(form.gene_srch.value === ''){
       return
   }
   form.submit()
}
///////////////////////////////////////////////////////////
// new filter stuff
//
function letter_submit(letter){
   var form = document.getElementById("genome_filter_form");
   const el = document.getElementById("letter");
   if(el){
       el.remove();
    }
    //if(letter !== '0'){
       var i = document.createElement("input");
       i.type = "hidden";
       i.name = "letter";
       i.id = "letter";
       i.value = letter
       form.appendChild(i);
  // }
   form.submit()
}
function update_sb(){ //submit button
    //var form = document.getElementById("tax_filter_form");
    // both gtable and atable??
    btn = document.getElementById("form_btn");
    btn.style.color = 'orange'
    btn.style.background = 'black'
    btn.style.cursor = 'pointer'
    btn.style.fontSize ='14px';
    btn.innerHTML = '** Update Table **'
    
}
function clear_search_txt(){
   txt = document.getElementById("gene_srch_text");
   dd = document.getElementById("field_select");
   if(txt.value !== '' && dd.value !== 'all'){
     update_sb()
   }
   txt.value = ''
   dd.value = 'all'
   
}
function clear_phylum(){
   
   dd = document.getElementById("phylum_select");
   if(dd.value !== ''){
     update_sb()
   }
   dd.value = ''
}
function select_anno(anno, search_text){
   //console.log('in anno_srch')
   let form = document.createElement("form");
   document.getElementsByTagName("body")[0].appendChild(form);
   form.setAttribute("method", "post");
   form.setAttribute("action" , "/genome/orf_search");
    
   var i = document.createElement("input");
   i.type = "hidden";
   i.name = "anno";
   i.id = "anno";
   i.value = anno
   form.appendChild(i);
   var i = document.createElement("input");
   i.type = "hidden";
   i.name = "search_text";
   i.id = "search_text";
   i.value = search_text
   form.appendChild(i);
   form.submit()
}
//
function view_anno_items(gid, anno, search_text){
   //console.log('in anno_srch')
   var args = {}
   args.gid = gid
   args.anno = anno
   args.search_text = search_text
   var pretable = document.getElementById("anno-pre-table");   
   var rows = pretable.getElementsByTagName("tr");   
   for(i = 0; i < rows.length; i++){ 
       //console.log(rows[i])
      rows[i].style.backgroundColor = 'white'
   } 
   
   var xmlhttp = new XMLHttpRequest();
   xmlhttp.open("POST", "/genome/make_anno_search_table", true);
   xmlhttp.setRequestHeader("Content-type","application/json");
   xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
        var resp = xmlhttp.responseText;
        //console.log('anno search resp')
        //console.log(resp)
        document.getElementById('anno_result_div').innerHTML = resp
        //var newTableObject = document.getElementById('anno_result_table')
        //sorttable.makeSortable(newTableObject);
        var row = document.getElementById(gid)
        row.style.backgroundColor = '#7AC97A'
        newTableObject = document.getElementById("annotation-table")
        sorttable.makeSortable(newTableObject);
        
      }
   }
   xmlhttp.send(JSON.stringify(args));
}
//
function show_hide_cc(type){ // CRISPR_Cas
    show = document.getElementsByName("show")
    if(show[0].checked){  // all
       q = 'all'
    }else if(show[1].checked){  // na
      q = 'na'
    }else{  // a
      q = 'a'
    }
    url = "/genome/crispr"
    let form = document.createElement("form");
    document.getElementsByTagName("body")[0].appendChild(form);
    form.setAttribute("method", "GET");
    form.setAttribute("action" , url);
    
    var i = document.createElement("input");
    i.type = "hidden";
    i.name = "show";
    i.id = "show";
    i.value = q
    form.appendChild(i);
   
    form.submit()
}




