function close_anno(){
      //console.log('inclose')
      newbox = document.getElementById('anno-result')
      newbox.style.display = 'none'
      annobox.style.height = "800px"
  };
  
function show_table(obj, anno, gid){
    var data = JSON.parse(obj)
    console.log('obj',data)
    //console.log('data[gid]',data[0])
    org = data[0].species
    //console.log('org',org)
    var html = '<center>'+gid+' | <i>'+data[0].species+'</i> | '+data[0].strain+'</center>'
    html += "<span style='float:right;'><a href='#' onclick=\"close_anno()\">close</a></span>"
    html += "<br><table>"
    html += "<tr><th>Accession</th><th>Protein-ID</th> <th>Genome Viewer</th><th>NA<br>length/seq</th><th>AA<br>length/seq</th><th>Gene</th><th>Gene Product</th></tr>"
    annobox = document.getElementById('anno-div')
    selected_row = document.getElementById(gid)
    // var xmlhttp = new XMLHttpRequest();
//  var args = {intext:intext}
//  document.getElementById('prokka_count_div').innerHTML = '<img id="" class="loader-gif" align="center" src="/images/row-of-blocks-loader-animation.gif"> Searching'
//  xmlhttp.open("POST", "/get_annotations_counts_sql", true);
//  
//  xmlhttp.setRequestHeader("Content-type","application/json");
//  xmlhttp.onreadystatechange = function() {

//      if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
     //console.log('selectedrow',selected_row)
    allrows = document.getElementsByClassName('anno-row')
    tblrows = document.getElementById("anno-table").rows
     //console.log('rowcount-tblrows',tblrows.length)
     //console.log('rowcount-allrows',allrows.length)
     //for(let i = 0; i < total_hits-1; i++){
    for(n in allrows){
         //console.log('allrows[n]',n,allrows[n])
        if(n <= allrows.length){
            allrows[n].style.background = "lightgreen";
        }
    }
     
    selected_row.style.background = "white";
     
     
    annobox.style.padding = "10px";
    annobox.style.height = "400px"
     
     //newbox = document.getElementById(gid+'-result')
    newbox = document.getElementById('anno-result')
    newbox.style.display = 'block'
    newbox.style.background = "lightblue";
    newbox.style.padding = "10px";
    pid_list = []
    for(n in data){
        pid_list.push("'"+data[n].pid+"'")
    }
    //console.log('pid_list',pid_list)
    var args = {pid_list:pid_list,anno:anno}
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST", "/advanced_anno_orf_search", true);
    xmlhttp.setRequestHeader("Content-type","application/json");
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var resp_data = JSON.parse(xmlhttp.responseText);
            //console.log('advanced_anno_orf_search SQL resp', resp_data)
            if(resp_data.length == 0){
                newbox.innerHTML = 'no data found'
                return
            }
    //         {
//     id: 2020,
//     genome_id: 'GCA_030450175.1',
//     accession: 'CP073095.1',
//     length_na: '1953',
//     length_aa: '650',
//     gc: '63.24',
//     gene: 'glfT2',
//     protein_id: 'GCA_030450175.1_02088',
//     product: 'Galactofuranosyltransferase GlfT2',
//     start: '2147735',
//     stop: '2149687'
//   }
            for(n in resp_data){
                if(resp_data[n].start[0] === "<" ){
                    start = parseInt(resp_data[n].start.substring(1))
                }else{
                    start = parseInt(resp_data[n].start)
                }
                if(resp_data[n].stop[0] === ">" ){ 
                    stop = parseInt(resp_data[n].stop.substring(1))
                }else{ 
                    stop = parseInt(resp_data[n].stop)
                }
                if(start > stop){ 
                    tmp = stop 
                    stop = start 
                    start = tmp 
                } 
                locstart = start - 500 
                locstop = stop + 500
                if(locstart < 1){ 
                    locstart = 1 
                } 
                let db = anno+'_'+gid // line_gi
                seqacc = resp_data[n].accession
                //seqacc = data[n].acc.replace('_','|')
                let loc = seqacc+":"+locstart.toString()+".."+locstop.toString()
                let highlight = seqacc+":"+start.toString()+".."+stop.toString()
                
                html += "<tr>"
                html += "<td>"+resp_data[n].accession+"</td>"
                html += "<td>"+resp_data[n].protein_id+"</td>"
                html += "<td class='center'>" 
                //in genomes.js open_jbrowse(value, page, gc='', contig='',  annotation='', loc='0', hilit='0'){
                html += " <a title='JBrowse/Genome Viewer' href='#' onclick=\"open_jbrowse('"+gid+"','anno_table','','','"+anno+"','"+loc+"','"+highlight+"')\" >open</a>"
                html += "</td>" //  JB)
                
                html += "<td nowrap class='center'>"+resp_data[n].length_na
                html += " [<a title='Nucleic Acid' href='#' onclick=\"get_NN_NA_seq('na','"+resp_data[n].protein_id+"','"+db+"','"+resp_data[n].accession+"','"+org+"','"+resp_data[n].product+"','"+gid+"')\"><b>NA</b></a>]"
                html += "</td>"   // NA length
                html += "<td nowrap class='center'>"+resp_data[n].length_aa
                html += " [<a title='Amino Acid' href='#' onclick=\"get_NN_NA_seq('aa','"+resp_data[n].protein_id+"','"+db+"','"+resp_data[n].accession+"','"+org+"','"+resp_data[n].product+"','"+gid+"')\"><b>AA</b></a>]"
                html += "</td>"   // AA length
                
        
                html += "<td>"+resp_data[n].gene+"</td>"
                html += "<td>"+resp_data[n].product+"</td>"
                html += "</tr>"
                
            }  // end for
            html += "</table>"
            newbox.innerHTML = html
        }  // end xmlhttp
     }
     xmlhttp.send(JSON.stringify(args));
     return
     
//      for(n in data){
//         org = data[n].genus+' '+data[n].species
//         if(data[n].start[0] === "<" ){
//             start = parseInt(data[n].start.substring(1))
//         }else{
//             start = parseInt(data[n].start)
//         }
//         if(data[n].stop[0] === ">" ){ 
//             stop = parseInt(data[n].stop.substring(1))
//         }else{ 
//             stop = parseInt(data[n].stop)
//         }
//         if(start > stop){ 
//             tmp = stop 
//             stop = start 
//             start = tmp 
//         } 
//         locstart = start - 500 
//         locstop = stop + 500
//         if(locstart < 1){ 
//             locstart = 1 
//         } 
//         let db = anno+'_'+gid // line_gid
//         
//         seqacc = data[n].acc
//         //seqacc = data[n].acc.replace('_','|')
//         let loc = seqacc+":"+locstart.toString()+".."+locstop.toString()
//         let highlight = seqacc+":"+start.toString()+".."+stop.toString()
//         
//         html += "<tr>"
//         html += "<td>"+data[n].acc+"</td>"
//         html += "<td>"+data[n].pid+"</td>"
//         html += "<td class='center'>" 
//         //in genomes.js open_jbrowse(value, page, gc='', contig='',  annotation='', loc='0', hilit='0'){
//         html += " <a title='JBrowse/Genome Viewer' href='#' onclick=\"open_jbrowse('"+gid+"','anno_table','','','"+anno+"','"+loc+"','"+highlight+"')\" >open</a>"
//         html += "</td>" //  JB)
//         
//         html += "<td nowrap class='center'>"+data[n].length_na
//         html += " [<a title='Nucleic Acid' href='#' onclick=\"get_NN_NA_seq('na','"+data[n].pid+"','"+db+"','"+data[n].acc+"','"+org+"','"+data[n].product+"','"+gid+"')\"><b>NA</b></a>]"
//         html += "</td>"   // NA length
//         html += "<td nowrap class='center'>"+data[n].length_aa
//         html += " [<a title='Amino Acid' href='#' onclick=\"get_NN_NA_seq('aa','"+data[n].pid+"','"+db+"','"+data[n].acc+"','"+org+"','"+data[n].product+"','"+gid+"')\"><b>AA</b></a>]"
//         html += "</td>"   // AA length
//         
// 
//         html += "<td>"+data[n].gene+"</td>"
//         html += "<td>"+data[n].prod+"</td>"
//         html += "</tr>"
//      }
//      html += "</table>"
//      newbox.innerHTML = html
     /////////////////////////////////////
//      if(rowobj.start[0] === "<" ){
//               start = parseInt(rowobj.start.substring(1))
//             }else{
//               start = parseInt(rowobj.start)
//             }
//             if(rowobj.stop[0] === ">" ){ 
//               stop = parseInt(rowobj.stop.substring(1))
//             }else{ 
//               stop = parseInt(rowobj.stop)
//             }
//      
//             if(start > stop){ 
//              tmp = stop 
//              stop = start 
//              start = tmp 
//             } 
//      
//             locstart = start - 500 
//             locstop = stop + 500 
//             //size = stop - start 
//      
//             if(locstart < 1){ 
//               locstart = 1 
//             } 
//             let db = anno+'_'+line_gid
//             html += '<tr>'
//             
//             rowobj.acc_adorned = (rowobj.acc).replace(re, "<font color='red'>"+search_text.toLowerCase()+"</font>");
//             html += "<td nowrap>"+rowobj.acc_adorned+"</td>"   // molecule
//             
//             rowobj.pid_adorned = (rowobj.pid).replace(re, "<font color='red'>"+search_text.toLowerCase()+"</font>");
//             html += "<td nowrap>"+rowobj.pid_adorned
//             
//             if(anno === "prokka"){ 
//                 seqacc = rowobj.acc.replace('_','|')
//             }else{
//                 seqacc = selected_gid +'|'+ rowobj.acc
//             }
//             let jbtracks = "DNA,homd,prokka,ncbi"
//             let loc = seqacc+":"+locstart.toString()+".."+locstop.toString()
//             let highlight = seqacc+":"+start.toString()+".."+stop.toString()
//             
//             html += "</td>"   // pid
//             
//             html += "<td class='center'>" 
//             html += " <a title='JBrowse/Genome Viewer' href='#' onclick=\"open_jbrowse('"+selected_gid+"','anno_table','','','"+anno+"','"+loc+"','"+highlight+"')\" >open</a>"
//             html += "</td>" //  JB)
//             
//             
//             html += "<td nowrap>"+rowobj.length_na
//                 html += " [<a title='Nucleic Acid' href='#' onclick=\"get_NN_NA_seq('na','"+rowobj.pid+"','"+db+"','"+rowobj.acc+"','"+organism+"','"+rowobj.product+"','"+selected_gid+"')\"><b>NA</b></a>]"
//             html += "</td>"   // NA length
//             html += "<td nowrap>"+rowobj.length_aa
//                 html += " [<a title='Nucleic Acid' href='#' onclick=\"get_NN_NA_seq('aa','"+rowobj.pid+"','"+db+"','"+rowobj.acc+"','"+organism+"','"+rowobj.product+"','"+selected_gid+"')\"><b>AA</b></a>]"
//             html += "</td>"   // AA length
//             html += "<td nowrap>"+start+'-'+stop+"</td>"   // Range
//             
//             rowobj.gene_adorned = rowobj.gene.replace(re, "<font color='red'>"+search_text.toLowerCase()+"</font>");
//             html += "<td nowrap>"+rowobj.gene_adorned+"</td>"   // product
//             
//             rowobj.product_adorned = rowobj.product.replace(re, "<font color='red'>"+search_text.toLowerCase()+"</font>");
//             html += "<td>"+rowobj.product_adorned+"</td>"   // product
//         
//             html += "</tr>"
//        
//         }
//         html += "</table>"
     ////////////////////////////////////
     
  }
// document.onreadystatechange = function() {
//         if (document.readyState !== "complete") {
//             document.querySelector(
//                 '#genome-box').style.visibility = "hidden";
//             document.querySelector(
//                 "#loader").style.visibility = "visible";
//         } else {
//             document.querySelector(
//                 "#loader").style.display = "none";
//             document.querySelector(
//                 '#genome-box').style.visibility = "visible";
//         }
// };
// function get_annotations_counts_sql(intext){
//     // search SQL orf table for both prokka and ncbi WHOLE PID Only
//     // if no result then go to partial search
//     console.log('get_annotations_counts_aql',intext)
//     var xmlhttp = new XMLHttpRequest();
//     
//     
//     var args = {intext:intext}
//     //document.getElementById('prokka_count_div').innerHTML = '<img id="" class="loader-gif" align="center" src="/images/row-of-blocks-loader-animation.gif"> Searching'
//     //document.getElementById('ncbi_count_div').innerHTML = '<img id="" class="loader-gif" align="center" src="/images/row-of-blocks-loader-animation.gif"> Searching'
//     document.getElementById('prokka_count_div').innerHTML = '<img id="" class="loader-gif" align="center" src="/images/row-of-blocks-loader-animation.gif"> Searching'
//     xmlhttp.open("POST", "/get_annotations_counts_sql", true);
//     
//     xmlhttp.setRequestHeader("Content-type","application/json");
//     xmlhttp.onreadystatechange = function() {
//       //console.log('readystate: ',xmlhttp.readyState)
//       //console.log('status: ',xmlhttp.status)
//       //console.log('txt: ',xmlhttp.statusText)
//       if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
//         //console.log('before parse')
//         var resp = JSON.parse(xmlhttp.responseText);
//         console.log('get_annotations_counts SQL', resp)
//         // [prokka_genome_count,prokka_gene_count,ncbi_genome_count,ncbi_gene_count]
//         dirname = resp.dirname
//         if(resp.phits == 0){
//             html1 = "0"
//             console.log('found phits 0')
//         }else{
//             html1 = resp.phits.length.toString()
//             console.log('sendhtml',xmlhttp.responseText)
//             html1 += "--<span class='search_link' onclick=\"anno_search('"+intext+"','prokka','sql','"+dirname+"')\"> show results</span>--"
//         
//         }
//         document.getElementById('prokka_count_div_sql').innerHTML = html1
//     
//         if(resp.nhits == 0){
//             html2 = "0"
//             console.log('found nhits 0')
//         }else{
//             html2 = resp.nhits.length.toString()
//             html2 += "--<span class='search_link' onclick=\"anno_search('"+intext+"','ncbi','sql','"+dirname+"')\"> show results</span>--"
//         
//         }
//         document.getElementById('ncbi_count_div_sql').innerHTML = html2
//         
//       }
//     }
//     xmlhttp.send(JSON.stringify(args));
//     //xmlhttp.send(null);
// }
// function get_annotations_counts_partialXXX(intext){
//     
//     var xmlhttp
//     //if (window.XMLHttpRequest) {
//        // for modern browsers
//     xmlhttp = new XMLHttpRequest();
//     //} else {
//        // for IE6, IE5
//     //   xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
//     //}
//     
//     var args = {intext:intext}
//     document.getElementById('prokka_count_div').innerHTML = '<img id="" class="loader-gif" align="center" src="/images/row-of-blocks-loader-animation.gif"> Searching'
//     document.getElementById('ncbi_count_div').innerHTML = '<img id="" class="loader-gif" align="center" src="/images/row-of-blocks-loader-animation.gif"> Searching'
//     xmlhttp.open("POST", "/get_annotations_counts_grep", true);
//     //xmlhttp.timeout = 1200000;  // 10,000; timeout in ms, 10 seconds
//     xmlhttp.setRequestHeader("Content-type","application/json");
//     xmlhttp.onreadystatechange = function() {
//       //console.log('readystate: ',xmlhttp.readyState)
//       //console.log('status: ',xmlhttp.status)
//       //console.log('txt: ',xmlhttp.statusText)
//       if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
//         //console.log('before parse')
//         var resp = JSON.parse(xmlhttp.responseText);
//         //console.log('get_annotations_counts')
//         //console.log(resp)
//         // [prokka_genome_count,prokka_gene_count,ncbi_genome_count,ncbi_gene_count]
//         if(parseInt(resp[0]) === 0){
//             html1 = "0"
//         }else{
//             if(parseInt(resp[0]) === 1){
//                 html1 = resp[1]+' gene(s) in 1 genome '
//             }else{
//                 html1 = resp[1]+' gene(s) in '+resp[0]+' genomes '
//             }
//             html1 += "--<span class='search_link' onclick=\"anno_search('"+intext+"','prokka','partial')\"> show results</span>--"
//         
//         }
//         document.getElementById('prokka_count_div').innerHTML = html1
//     
//         if(parseInt(resp[2]) === 0){
//             html2 = "0"
//         }else{
//             if(parseInt(resp[2]) === 1){
//                 html2 = resp[3]+' gene(s) in 1 genome '
//             }else{
//                 html2 = resp[3]+' gene(s) in '+resp[2]+' genomes '
//             }
//             //html2 += "--<span class='search_link' onclick=\"anno_search('"+intext+"','ncbi')\">show results</span>--"
//             html2 += "--<span class='search_link' onclick=\"anno_search('"+intext+"','ncbi','partial')\"> show results</span>--"
//         
//         }
//         document.getElementById('ncbi_count_div').innerHTML = html2
//         
//       }
//     }
//     xmlhttp.send(JSON.stringify(args));
//     //xmlhttp.send(null);
// }

// function anno_search(search_text, anno, type, dirname){  //type is sql or partial
//    console.log('in anno_srch',search_text)
//    //var args = {}
//    //args.anno = anno
//    //args.search_text = search_text
//    let form = document.createElement("form");
//    if(type == 'partial'){
//        target = "/genome/orf_search"   // GREP
//    }else{
//        target = "/genome/orf_search_sql"
//    }
//    document.getElementsByTagName("body")[0].appendChild(form);
//    form.setAttribute("method", "post");
//    form.setAttribute("action" , target);
//    
//    var i = document.createElement("input");
//    i.type = "hidden";
//    i.name = "anno";
//    i.id = "anno";
//    i.value = anno
//    form.appendChild(i);
//    var i = document.createElement("input");
//    i.type = "hidden";
//    i.name = "search_text";
//    i.id = "search_text";
//    i.value = search_text
//    form.appendChild(i);
//    var i = document.createElement("input");
//    i.type = "hidden";
//    i.name = "dirname";
//    i.id = "dirname";
//    i.value = dirname
//    form.appendChild(i);
//    form.submit()
//   
  
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
  
//}

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