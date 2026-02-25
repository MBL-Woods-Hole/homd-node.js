var cfg = '<%= config %>'

  function show_phage_hits(gid,contig,species,predictor, h){
     hits = JSON.parse(h)
     console.log(predictor)
     //console.log('length',hits)
     //hit_pts = hits.split(',')
     //console.log('hits',h)
     predictor_show = predictor.charAt(0).toUpperCase() + predictor.slice(1);
     html ='<div><span style="float:left">('+hits.length+' Hits)&nbsp;&nbsp;&nbsp;&nbsp;'+predictor_show+': '+gid+':'+contig+' <i>'+species+'</i></span><a id="close_btn"  href="#" onclick="close_phage_info()">Close</a></div>'
     html += "<div id='phage-hit-results-div'>"
     html +="<table class='result-table sortable' id='phage-table2' >"
     html +="<thead>"
     html +="<tr><th class='c1 sorttable_nosort'>Genome Viewer</th><th class='c1 sorttable_nosort'>View Sequence</th><th class='c2 sorttable_nosort'>Genome-ID</th><th class='c2 sorttable_nosort'>Contig</th><th class='c1 sorttable_nosort'>Predictor</th>"
     var el = document.getElementById('phage-result')
     el.style.display = 'none'
     for(n in hits){
         //console.log('hxxx',hits[n])
     }
     if(predictor === 'bakta'){
         
         //core_product, core_note, bakta_EC, bakta_GO, bakta_COG
        html += "<th class='col4'>core_product</th>"
        html += "<th class='col5'>core_note</th>"
        html += "<th class='col6'>bakta_EC</th>"
        html += "<th class='col7'>bakta_GO</th>"
        html += "<th class='col8'>bakta_COG</th>"
         
        html += '</tr>'
        html += "</thead>"
        html += "<tbody>"
       //['6371', 'bakta', 'gca_000006605.1', 'cr931997.1', 'putative membrane protein', '', '', '', 'cog0586;m']
       for(n in hits){
        html += "<tr>"
        html += "<td class='center'><a href='#' onclick=\"open_genome_viewer('"+hits[n][0]+"')\">link</a></td>"
        html += "<td class='center'><a href='#' onclick=\"open_phage_sequence('"+hits[n][0]+"')\">open</a></td>"
        html += "<td class='center' title='"+hits[n][2]+"'>"+hits[n][2].toUpperCase()+'</td>'
        html += "<td class='center' title='"+hits[n][3]+"'>"+hits[n][3].toUpperCase()+'</td>'
        html += "<td class='center' title='"+hits[n][1]+"'>"+hits[n][1]+'</td>'
        html += "<td title='"+hits[n][4]+"'>"+hits[n][4]+'</td>'
        html += "<td title='"+hits[n][5]+"'>"+hits[n][5]+'</td>'
        html += "<td title='"+hits[n][6]+"'>"+hits[n][6]+'</td>'
        html += "<td title='"+hits[n][7]+"'>"+hits[n][7]+'</td>'
        html += "<td title='"+hits[n][8]+"'>"+hits[n][8]+'</td>'
        
        html += '</tr>'
       
       }
       
       
    }else if(predictor === 'cenote' || predictor === 'genomad'){
        html += '<th>Accession</th><th>Description</th>'
       
        html += '</tr>'
        html +="</thead>"
        html += "<tbody>"
       for(n in hits){
        html += '<tr>'
        html += "<td class='center'><a href='#' onclick=\"open_genome_viewer('"+hits[n][0]+"')\">open</a></td>"
        html += "<td class='center'><a href='#' onclick=\"open_phage_sequence('"+hits[n][0]+"')\">show</a></td>"
        html += "<td class='center'>"+hits[n][2].toUpperCase()+"</td><td class='center'>"+hits[n][3].toUpperCase()+"</td><td class='center'>"+hits[n][1]+'</td><td>'+hits[n][4]+'</td><td>'+hits[n][5]+'</td>'
        
        html += '</tr>'
       }
       
       
    }else{
       //error
    }
    html += "</tbody>"
    html += '</table>'
    html += '</div>'
    el.innerHTML = html
    el.style.display = 'block'
    sorttable.makeSortable(document.getElementById('phage-table2'));
  }
  
function show_anno_hits(obj, anno, gid){
    var data = JSON.parse(obj)
    //console.log('data obj',data)
    //console.log('data[gid]',data[0])
    org = data[0].species
    
    var el = document.getElementById('anno-result')
    el.style.display = 'none'
    //console.log('org',org)
    var html = '<center>'+gid+' | <i>'+data[0].species+'</i> | '+data[0].strain+'</center>'
    html += "<span style='float:right;'><a href='#' onclick=\"close_anno_info()\">close</a></span>"
    html += "<br><table class='result-table'>"
    html += "<tr><th>Accession</th><th>Type</th><th>Protein-ID</th> <th>Genome Viewer</th><th>NA<br>length/seq</th><th>AA<br>length/seq</th><th>Gene</th><th>Gene Product</th></tr>"
    annobox = document.getElementById('anno-div')
    selected_row = document.getElementById(gid)
    
    allrows = document.getElementsByClassName('anno-row')
    tblrows = document.getElementById("anno-table").rows
     //console.log('rowcount-tblrows',tblrows.length)
     //console.log('rowcount-allrows',allrows.length)
   
    for(n in allrows){
         //console.log('allrows[n]',n,allrows[n])
        if(n <= allrows.length){
            allrows[n].style.background = "lightgreen";
        }
    }
     
    selected_row.style.background = "white";
    annobox.style.padding = "10px";
    annobox.style.height = "400px"
     
 
    id_list = []
    for(n in data){
        //console.log('1',data[n])
        if(anno === 'bakta'){
          console.log('2',"'"+data[n].pid+"'")
          if(data[n].pid){
           id_list.push("'"+data[n].pid+"'")
          }
        }else{  // ncbi and prokka
          //console.log('2',"'"+data[n].orf_id+"'")
          if(data[n].orf_id){
           id_list.push("'"+data[n].orf_id+"'")
          }
        }
    }
    //console.log('pid_list',pid_list)
    var args = {id_list: id_list, anno: anno}
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST", "/advanced_anno_orf_search", true);  // in index.js
    xmlhttp.setRequestHeader("Content-type","application/json");
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var resp_data = JSON.parse(xmlhttp.responseText);
            //console.log('XXXadvanced_anno_orf_search', resp_data)
            if(resp_data.length == 0){
                html = "<span style='float:right;'><a href='#' onclick=\"close_anno_info()\">close</a></span>"
                el.innerHTML = html+ '<br>no data found'
                el.style.display = 'block'
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
                //console.log('rdata[n]',n,resp_data[n])
                if(resp_data[n].start[0] === "<" ){
                    start = parseInt(resp_data[n].start.substring(1))
                }else{
                    start = parseInt(resp_data[n].start)
                }
                if(resp_data[n].end[0] === ">" ){ 
                    end = parseInt(resp_data[n].end.substring(1))
                }else{ 
                    end = parseInt(resp_data[n].end)
                }
                if(start > end){ 
                    tmp = end 
                    end = start 
                    start = tmp 
                } 
                locstart = start - 500 
                locstop = end + 500
                if(locstart < 1){ 
                    locstart = 1 
                } 
                let db = anno+'_'+gid // line_gi
                seqacc = resp_data[n].acc
                //seqacc = data[n].acc.replace('_','|')
                let loc = seqacc+":"+locstart.toString()+".."+locstop.toString()
                let highlight = seqacc+":"+start.toString()+".."+end.toString()
                
                html += "<tr>"
                html += "<td><a href='https://www.ncbi.nlm.nih.gov/nuccore/"+resp_data[n].acc+"' target='_blank'>"+resp_data[n].acc+"</a></td>"
                if(resp_data[n].type){
                  html += "<td>"+resp_data[n].type+"</td>"
                }else{
                  html += "<td></td>"   // AA length
                }
                if(anno === 'ncbi'){
                    html += "<td><a href='https://www.ncbi.nlm.nih.gov/protein/"+resp_data[n].pid+"' target='_blank'>"+resp_data[n].pid+"</a></td>"
                
                }else{
                    //console.log('/genome/open_ftp_file/'+gid)
                    //let line = "<a href='/genome/open_ftp_file/"+gid+".faa' target='_blank'>"+resp_data[n].pid+"</a>"
                    let line = "<a href='/genome/open_ftp_file?prokka_pid="+resp_data[n].pid+"' target='_blank'>"+resp_data[n].pid+"</a>"
                    // <a class='link' href='/genome/rRNA_gene_tree?otid=<%= otid %>' target='_blank'>16S rRNA Gene Tree
                    //console.log(line)
                    html += "<td>"+line+"</td>"
                
                }
                  
                
                html += "<td class='center'>" 
                //in genomes.js open_jbrowse(value, page, gc='', contig='',  annotation='', loc='0', hilit='0'){
                html += " <a title='JBrowse/Genome Viewer:"+gid+"' href='#' onclick=\"open_jbrowse('"+gid+"','anno_table','','','"+anno+"','"+loc+"','"+highlight+"')\" >open</a>"
                html += "</td>" //  JB)
                if(!resp_data[n].lna || resp_data[n].lna == '0'){
                  html += "<td></td>"   // AA length
                }else{
                  html += "<td nowrap class='center'>"+resp_data[n].lna
                  html += " [<a title='Nucleic Acid' href='#' onclick=\"get_AA_NA_seq('na','"+resp_data[n].orf_id+"','"+db+"','"+resp_data[n].acc+"','"+org+"','"+resp_data[n].product+"','"+gid+"')\"><b>NA</b></a>]"
                  html += "</td>"   // NA length
                }
                if(!resp_data[n].laa || resp_data[n].laa == '0'){
                  html += "<td></td>"   // AA length
                }else{
                  html += "<td nowrap class='center'>"+resp_data[n].laa
                  html += " [<a title='Amino Acid' href='#' onclick=\"get_AA_NA_seq('aa','"+resp_data[n].pid+"','"+db+"','"+resp_data[n].acc+"','"+org+"','"+resp_data[n].product+"','"+gid+"')\"><b>AA</b></a>]"
                  html += "</td>"   // AA length
                }
        
                html += "<td>"+resp_data[n].gene+"</td>"
                html += "<td>"+resp_data[n].product+"</td>"
                html += "</tr>"
                
            }  // end for
            html += "</table>"
            //newbox.innerHTML = html
            el.innerHTML = html
            el.style.display = 'block'
        }  // end xmlhttp
     }
     xmlhttp.send(JSON.stringify(args));
     return
     

     
  }

function open_ftp_file(gid){
    var args = {'gid':gid}
    //let fpath = cfg.FILEPATH_TO_FTP+'/genomes/PROKKA/V11.02/gff/'+gid+'.gff'
    //let fpath_local = '/Users/avoorhis/programming/homd-work/genomesV11/PROKKA/V11.0/gff/GCA_000174175.1.gff'
    //window.open(fpath_local)
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST", "/genome/open_ftp_file", true);  // in index.js
    xmlhttp.setRequestHeader("Content-type","application/json");
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            //var resp_data = JSON.parse(xmlhttp.responseText);
            //console.log('resp_data',xmlhttp.responseText)
            
        }
    }
   xmlhttp.send(JSON.stringify(args));
}