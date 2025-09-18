
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

function open_jbrowse(value, page, gc='', contig='',  annotation='', loc='0', hilit='0'){
  console.log('open_jbrowse', value, page)
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
  if(page == 'genome_desc_single'){ 
      gid = value
      contigplusgc = document.getElementById("select-contig").innerHTML
      //console.log('contigplusgc',contigplusgc)
      pts = contigplusgc.split('|')
      contig = pts[0]
      gc = pts[1]
      url = jb_path+'/'+gid+"&tracks="+tracks+",GC Content (pivot at "+gc+"),GC Skew&loc="+gid+"|"+contig.trim()
     
  }else if(page == 'genome_desc'){ 
      gid = value
      contigplusgc = document.getElementById("select-contig").value.trim()
      //console.log('xxcontigplusgc',contigplusgc)
      pts = contigplusgc.split('|')
      contig = pts[0]
      gc = pts[1]
      url = jb_path+'/'+gid+"&tracks="+tracks+",GC Content (pivot at "+gc+"),GC Skew&loc="+gid+"|"+contig.trim()
     
  }else if(page == 'genome_table'){
       gid = value
       tracks = ''
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
      //console.log('value',value)
      //console.log('loc',loc)
      //console.log('hilit',hilit)
      gid = value
      
       //Good https://www.homd.org//jbrowse/?data=homd_V11.0/GCA_030450175.1&tracks=DNA,prokka,prokka_ncrna,ncbi,ncbi_ncrna&loc=GCA_030450175.1|CP073095.1:1..2445683&highlight=GCA_030450175.1|CP073095.1:455..2445183
      //https://www.homd.org//jbrowse/?data=homd_V11.0/GCA_030450175.1&tracks=DNA,prokka,prokka_ncrna,ncbi,ncbi_ncrna&loc=GCA_030450175.1|GCA_030450175.1|CP073095.1:1..2445683&highlight=GCA_030450175.1|GCA_030450175.1|CP073095.1:455..2445183
      url = jb_path+'/'+gid+"&tracks="+tracks+"&loc="+gid+'|'+loc+"&highlight="+gid+'|'+hilit
      //console.log('myurl',url)
  }else if(page == 'protein_peptide'){
       gid = value
       url = jb_path+'/'+gid+"&tracks="+tracks+"&loc="+loc+"&highlight="+gid+'|'+hilit
       
  }else if(page == 'crispr'){
      tracks = 'crispr'
      gid = value
      url = jb_path+'/'+gid+"&tracks="+tracks+"&loc="+loc+"&highlight="+gid+'|'+hilit
  }else if(page == 'oralgen'){
      gid = value
      url = jb_path+'/'+gid+"&tracks="+tracks
  }else if(page == 'phage_table'){
      gid = value
      
      //https://www.homd.org/jbrowse/?data=homd_V11.02_phage_1.1/GCA_000008185.1&loc=GCA_000008185.1|AE017226.1:1165152..1202411&
      tracks="DNA,panggolin,genomad,cenote"
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
        //console.log(url)
        window.open(url)
      }
  }
  xmlhttp.send();
  
}
function open_ncbi(type){
    //console.log('type',type)
    if(type == 'single'){
       contig = document.getElementById("select-contig").innerHTML
       url = 'https://www.ncbi.nlm.nih.gov/nuccore/'+contig.trim()
    }else{
       contig = document.getElementById("select-contig").value.trim()
       url = 'https://www.ncbi.nlm.nih.gov/nuccore/'+contig.split('|')[0]
    }
    
    //console.log(url)
    window.open(url)
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
function get_contig_seq(gid, mid, type) {
    //<!-- >001A28SC | Bartonella schoenbuchensis | HMT-001 | Strain: A28SC | GB: GQ422708 | Status: Named | Preferred Habitat: Unassigned | Genome: yes -->
    //defline = '>'+seqid+' | '+genus+' '+species+' | '+taxfullname+' | '+strain+' | '+genbank+' | Status: '+status+' | Preferred Habitat: '+site+' | '+flag
    //if(type == 'single'){
       //contig = document.getElementById("select-contig").innerHTML
    //}else{
    
    if(type === 'single'){
        contig = document.getElementById("select-contig").innerHTML
    }else{
       contig = document.getElementById("select-contig").value.split('|')[0]
    }
    console.log('value',document.getElementById("select-contig").innerHTML)
    //}
    //console.log('contig',contig)
    args={}
    args.gid = gid.trim()
    args.mid = mid.trim()
    args.contig = contig.trim()
    defline = '>'+args.gid+' | '+args.contig
    var win = window.open("Contig Sequence", null, "menubar=no,status=no,toolbar=no,location=no,width=900,height=300,scrollbars=yes");
    var doc = win.document;
    doc.open("text/html");
        
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST", "/genome/get_contig_seq", true);
    xmlhttp.setRequestHeader("Content-type","application/json");
    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {

        const resp = JSON.parse(xmlhttp.responseText);
        //console.log(resp['html'].substring(0,8))
        
        text = '<pre>'
        text += defline +' | Length: '+resp.length.toString()+ " bp\n"+resp['html']
        text += '</pre>'
        
        doc.write("<title>eHOMD Contig Sequence</title><body><div style='overflow:auto; height:100%;'>"+text+"</div></body>");
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
    args.gid = gid
    args.type = type
    args.pid  = pid
    args.db   = db
    args.mol  = mol
    args.org   = org
    args.product   = product
    //console.log('args',args)
    var win = window.open("about:blank", null, "menubar=no,status=no,toolbar=no,location=no,width=900,height=300,scrollbars=yes");
    var doc = win.document;
        //doc.writeln("<title>yourtitle</title>");
        //doc.title = 'eHOMD Reference Sequence'
    doc.open("text/html");
        
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
            text += '>' + gid +'| Protein ID: ' + pid +' | ' + product + ' | ' + org + length + ' bp\n'
        //}else{
         //    text += '>' + mol + ' | ' + product + ' | '+ org + length + '\n'
        //}
        

        text += resp.html
        text += '</pre>'
        
  
        doc.write("<title>eHOMD 16s rRNA Gene Sequence</title><body><div style='overflow:auto; height:100%;'>"+text+"</div></body>");
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
function toggle_cb_levels(x){
    if(x == 'off'){
        document.getElementById("complete_genome").checked = false;
        document.getElementById("scaffold").checked = false;
        document.getElementById("contig").checked = false;
        document.getElementById("chromosome").checked = false;
        var link_html = "<a class=\"pill pill-aqua\" href='#' onclick=\"toggle_cb_levels('on')\">Toggle CheckBoxes On/Off</a>"
        document.getElementById('toggle_cb_levels_span').innerHTML = link_html
    }else{
        document.getElementById("complete_genome").checked = true;
        document.getElementById("scaffold").checked = true;
        document.getElementById("contig").checked = true;
        document.getElementById("chromosome").checked = true;
        var link_html = "<a class=\"pill pill-aqua\" href='#' onclick=\"toggle_cb_levels('off')\">Toggle CheckBoxes On/Off</a>"
        document.getElementById('toggle_cb_levels_span').innerHTML = link_html
    }
    update_sb()
}
function adv_toggle_cb_levels(x){
    if(x == 'off'){
        document.getElementById("adv_complete_genome").checked = false;
        document.getElementById("adv_scaffold").checked = false;
        document.getElementById("adv_contig").checked = false;
        document.getElementById("adv_chromosome").checked = false;
        
        
        var link_html = "<a class=\"pill pill-aqua\" href='#' onclick=\"adv_toggle_cb_levels('on')\">Toggle CheckBoxes On/Off</a>"
        document.getElementById('adv_toggle_cb_levels_span').innerHTML = link_html
    }else{
        document.getElementById("adv_complete_genome").checked = true;
        document.getElementById("adv_scaffold").checked = true;
        document.getElementById("adv_contig").checked = true;
        document.getElementById("adv_chromosome").checked = true;
        
        var link_html = "<a class=\"pill pill-aqua\" href='#' onclick=\"adv_toggle_cb_levels('off')\">Toggle CheckBoxes On/Off</a>"
        document.getElementById('adv_toggle_cb_levels_span').innerHTML = link_html
    }
    adv_update_sb()
}
function adv_toggle_cb_sites(x){
    if(x == 'off'){
        document.getElementById("adv_oral").checked = false;
        document.getElementById("adv_nasal").checked = false;
        document.getElementById("adv_skinx").checked = false;
        document.getElementById("adv_gut").checked = false;
        document.getElementById("adv_vaginal").checked = false;
        document.getElementById("adv_pathogen").checked = false;
        document.getElementById("adv_enviro").checked = false;
        document.getElementById("adv_ref").checked = false;
        document.getElementById("adv_unassigned").checked = false;
        var link_html = "<a class=\"pill pill-btn\" href='#' onclick=\"adv_toggle_cb_sites('on')\">Toggle CheckBoxes On/Off</a>"
        document.getElementById('adv_toggle_cb_sites_span').innerHTML = link_html
    }else{
        document.getElementById("adv_oral").checked = true;
        document.getElementById("adv_nasal").checked = true;
        document.getElementById("adv_skinx").checked = true;
        document.getElementById("adv_gut").checked = true;
        document.getElementById("adv_vaginal").checked = true;
        document.getElementById("adv_pathogen").checked = true;
        document.getElementById("adv_enviro").checked = true;
        document.getElementById("adv_ref").checked = true;
        document.getElementById("adv_unassigned").checked = true;
        var link_html = "<a class=\"pill pill-btn\" href='#' onclick=\"adv_toggle_cb_sites('off')\">Toggle CheckBoxes On/Off</a>"
        document.getElementById('adv_toggle_cb_sites_span').innerHTML = link_html
    }
    adv_update_sb()
}
function adv_toggle_cb_abund(x){
    if(x == 'off'){
        document.getElementById("adv_high_abund").checked = false;
        document.getElementById("adv_medium_abund").checked = false;
        document.getElementById("adv_low_abund").checked = false;
        document.getElementById("adv_scarce_abund").checked = false;
        
        var link_html = "<a class=\"pill pill-btn\" href='#' onclick=\"adv_toggle_cb_abund('on')\">Toggle CheckBoxes On/Off</a>"
        document.getElementById('adv_toggle_cb_abund_span').innerHTML = link_html
    }else{
        document.getElementById("adv_high_abund").checked = true;
        document.getElementById("adv_medium_abund").checked = true;
        document.getElementById("adv_low_abund").checked = true;
        document.getElementById("adv_scarce_abund").checked = true;
        
        var link_html = "<a class=\"pill pill-btn\" href='#' onclick=\"adv_toggle_cb_abund('off')\">Toggle CheckBoxes On/Off</a>"
        document.getElementById('adv_toggle_cb_abund_span').innerHTML = link_html
    }
    adv_update_sb()
}
function adv_toggle_cb_status(x){
    if(x == 'off'){
        document.getElementById("adv_named_cultivated").checked = false;
        document.getElementById("adv_named_uncultivated").checked = false;
        document.getElementById("adv_unnamed_cultivated").checked = false;
        document.getElementById("adv_phylotype").checked = false;
        document.getElementById("adv_dropped").checked = false;
        //document.getElementById("nonoralref").checked = false;
        
        var link_html = "<a class=\"pill pill-btn\" href='#' onclick=\"adv_toggle_cb_status('on')\">Toggle CheckBoxes On/Off</a>"
        document.getElementById('adv_toggle_cb_status_span').innerHTML = link_html
    }else{
        document.getElementById("adv_named_cultivated").checked = true;
        document.getElementById("adv_named_uncultivated").checked = true;
        document.getElementById("adv_unnamed_cultivated").checked = true;
        document.getElementById("adv_phylotype").checked = true;
        document.getElementById("adv_dropped").checked = true;
        //document.getElementById("nonoralref").checked = true;
        
        var link_html = "<a class=\"pill pill-btn\" href='#' onclick=\"adv_toggle_cb_status('off')\">Toggle CheckBoxes On/Off</a>"
        document.getElementById('adv_toggle_cb_status_span').innerHTML = link_html
    }
    adv_update_sb()
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
function adv_update_sb(){
    btn = document.getElementById("adv_form_btn");
    btn.style.color = 'orange'
    btn.style.background = 'black'
    btn.style.cursor = 'pointer'
    btn.style.fontSize ='14px';
    btn.innerHTML = '** Apply Updated Filter to Table. **'
}
function adv_clear_search_txt(){
   txt = document.getElementById("gene_srch_text");
   dd = document.getElementById("field_select");
   if(txt.value !== '' && dd.value !== 'all'){
     adv_update_sb()
   }
   txt.value = ''
   dd.value = 'all'
   
}
function phylum_submit(phylum){
   console.log('phylum',phylum)
   var form = document.getElementById("genome_filter_form");
   form.submit()
}
function adv_clear_phylum(){
   
   dd = document.getElementById("adv_phylum_select");
   console.log('dd',dd)
   console.log('dd',dd.value)
   if(dd.value !== ''){
     adv_update_sb()
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
function view_anno_items(gid, anno, search_text, dirname){
   //console.log('in anno_srch')
   var args = {}
   args.gid = gid
   args.anno = anno
   args.dirname = dirname
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




