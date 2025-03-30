
function get_annotations_counts_full(intext){
    // search SQL orf table for both prokka and ncbi WHOLE PID Only
    // if no result then go to partial search
    console.log('get_annotations_counts_full',intext)
    var xmlhttp = new XMLHttpRequest();
    
    
    var args = {intext:intext}
    //document.getElementById('prokka_count_div').innerHTML = '<img id="" class="loader-gif" align="center" src="/images/row-of-blocks-loader-animation.gif"> Searching'
    //document.getElementById('ncbi_count_div').innerHTML = '<img id="" class="loader-gif" align="center" src="/images/row-of-blocks-loader-animation.gif"> Searching'
    
    xmlhttp.open("POST", "/get_annotations_counts_sql", true);
    
    xmlhttp.setRequestHeader("Content-type","application/json");
    xmlhttp.onreadystatechange = function() {
      //console.log('readystate: ',xmlhttp.readyState)
      //console.log('status: ',xmlhttp.status)
      //console.log('txt: ',xmlhttp.statusText)
      if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
        //console.log('before parse')
        var resp = JSON.parse(xmlhttp.responseText);
        console.log('get_annotations_counts SQL', resp)
        // [prokka_genome_count,prokka_gene_count,ncbi_genome_count,ncbi_gene_count]
        if(resp.phits == 0){
            html1 = "0"
            console.log('found phits 0')
        }else{
            html1 = resp.phits.length.toString()
            console.log('sendhtml',xmlhttp.responseText)
            html1 += "--<span class='search_link' onclick=\"anno_search('"+intext+"','prokka','full')\"> show results</span>--"
        
        }
        document.getElementById('prokka_count_div_full').innerHTML = html1
    
        if(resp.nhits == 0){
            html2 = "0"
            console.log('found nhits 0')
        }else{
            html2 = resp.nhits.length.toString()
            html2 += "--<span class='search_link' onclick=\"anno_search('"+intext+"','ncbi','full')\"> show results</span>--"
        
        }
        document.getElementById('ncbi_count_div_full').innerHTML = html2
        
      }
    }
    xmlhttp.send(JSON.stringify(args));
    //xmlhttp.send(null);
}
function get_annotations_counts_partial(intext){
    
    var xmlhttp
    //if (window.XMLHttpRequest) {
       // for modern browsers
    xmlhttp = new XMLHttpRequest();
    //} else {
       // for IE6, IE5
    //   xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    //}
    
    var args = {intext:intext}
    document.getElementById('prokka_count_div').innerHTML = '<img id="" class="loader-gif" align="center" src="/images/row-of-blocks-loader-animation.gif"> Searching'
    document.getElementById('ncbi_count_div').innerHTML = '<img id="" class="loader-gif" align="center" src="/images/row-of-blocks-loader-animation.gif"> Searching'
    xmlhttp.open("POST", "/get_annotations_counts_grep", true);
    //xmlhttp.timeout = 1200000;  // 10,000; timeout in ms, 10 seconds
    xmlhttp.setRequestHeader("Content-type","application/json");
    xmlhttp.onreadystatechange = function() {
      //console.log('readystate: ',xmlhttp.readyState)
      //console.log('status: ',xmlhttp.status)
      //console.log('txt: ',xmlhttp.statusText)
      if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
        //console.log('before parse')
        var resp = JSON.parse(xmlhttp.responseText);
        //console.log('get_annotations_counts')
        //console.log(resp)
        // [prokka_genome_count,prokka_gene_count,ncbi_genome_count,ncbi_gene_count]
        if(parseInt(resp[0]) === 0){
            html1 = "0"
        }else{
            if(parseInt(resp[0]) === 1){
                html1 = resp[1]+' gene(s) in 1 genome '
            }else{
                html1 = resp[1]+' gene(s) in '+resp[0]+' genomes '
            }
            html1 += "--<span class='search_link' onclick=\"anno_search('"+intext+"','prokka','partial')\"> show results</span>--"
        
        }
        document.getElementById('prokka_count_div').innerHTML = html1
    
        if(parseInt(resp[2]) === 0){
            html2 = "0"
        }else{
            if(parseInt(resp[2]) === 1){
                html2 = resp[3]+' gene(s) in 1 genome '
            }else{
                html2 = resp[3]+' gene(s) in '+resp[2]+' genomes '
            }
            //html2 += "--<span class='search_link' onclick=\"anno_search('"+intext+"','ncbi')\">show results</span>--"
            html2 += "--<span class='search_link' onclick=\"anno_search('"+intext+"','ncbi','partial')\"> show results</span>--"
        
        }
        document.getElementById('ncbi_count_div').innerHTML = html2
        
      }
    }
    xmlhttp.send(JSON.stringify(args));
    //xmlhttp.send(null);
}

function anno_search(search_text, anno, type){  //type is full or partial
   console.log('in anno_srch',search_text)
   //var args = {}
   //args.anno = anno
   //args.search_text = search_text
   let form = document.createElement("form");
   if(type == 'partial'){
       target = "/genome/orf_search"
   }else{
       target = "/genome/orf_search_full"
   }
   document.getElementsByTagName("body")[0].appendChild(form);
   form.setAttribute("method", "post");
   form.setAttribute("action" , target);
   
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
  
  
//   var xmlhttp = new XMLHttpRequest();
//   xmlhttp.open("POST", "/anno_protein_search", true);
//   xmlhttp.setRequestHeader("Content-type","application/json");
//   xmlhttp.onreadystatechange = function() {
//       if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
//         var resp = xmlhttp.responseText;
//         //console.log('anno search resp')
//         //console.log(resp)
//         document.getElementById('anno_result_box').innerHTML = resp
//         var newTableObject = document.getElementById('anno_result_table')
//         sorttable.makeSortable(newTableObject);
//         
//       }
//   }
//   xmlhttp.send(JSON.stringify(args));
  
}

// function open_explorer_search(gid,anno){
//    //href='genome/explorer?gid="+gid+"&anno="+anno+"' 
//   console.log('IN open_explorer_search')
//   args = {}
//   args.anno = anno
//   args.gid = gid
//   
//   var xmlhttp = new XMLHttpRequest();
//   xmlhttp.open("POST", "/genome/open_explorer_search", true);
//   xmlhttp.setRequestHeader("Content-type","application/json");
//   xmlhttp.onreadystatechange = function() {
//       if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
//         var resp = xmlhttp.responseText;
//         console.log('anno search resp')
//         console.log(resp)
//         //document.getElementById('anno_result_box').innerHTML = resp
//         
//       }
//   }
//   xmlhttp.send(JSON.stringify(args));
// }