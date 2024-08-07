
function getFileContent(type, id, num) {
   console.log(type, id, num)
    var args={}
    args.type = type  // seq or res
    args.id = id
    args.num = num
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST", "/blast/openBlastWindow", true);
    xmlhttp.setRequestHeader("Content-type","application/json");
    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
        var resp = xmlhttp.responseText;
        console.log(resp)
        text = ''
        //text += '<pre>'+defline+'<br>'
        text = '<pre>'
        text += resp
        text += '</pre>'
    var win = window.open("about:blank", null, "menubar=no,status=no,toolbar=no,location=no,width=680,height=500");
    var doc = win.document;
    //doc.writeln("<title>yourtitle</title>");
    //doc.title = 'eHOMD Reference Sequence'
    doc.open("text/html")
    doc.write(text);
    doc.close();
    
    
      }
    }
    xmlhttp.send(JSON.stringify(args));
} 
if (!String.prototype.cordwood) {
  // https://itnext.io/javascript-split-a-string-into-equal-lengths-848eb811f383
  String.prototype.cordwood = function(cordlen) {
  if (cordlen === undefined || cordlen > this.length) {
    cordlen = this.length;
  }
  var yardstick = new RegExp(`.{${cordlen}}`, 'g');
  var pieces = this.match(yardstick);
  var accumulated = (pieces.length * cordlen);
  var modulo = this.length % accumulated;
  if (modulo) pieces.push(this.slice(accumulated));	
  return pieces;
 };
}
function create_alignment_client(qid, hit, qseq, sseq, qstart, qend, sstart, send, fxn){
    //alert(qseq)
    let qseq_letters = qseq.trim().split('')
    let sseq_letters = sseq.trim().split('')
    let fold_length = 60
    let header_txt = 'HOMD Alignment<br>QueryID: '+qid+'<br>'+'Hit: '+hit+'<br><br>'
    
    let align_value = '   '
    let onereturn = '',qcaps,scaps
    console.log(qseq_letters.length,sseq_letters.length)
    if(qseq_letters.length < fold_length){
		qcaps = 'Query:  '+qstart.padStart(6,' ')+' ', scaps = 'Subject:'+sstart.padStart(6,' ')+' '
		for(let q in qseq_letters){
		   let letter = qseq_letters[q].toUpperCase()
		   qcaps += letter
		}
		onereturn += '\n'
		for(let q in qseq_letters){
		   let qletter = qseq_letters[q].toUpperCase()
		   let sletter = sseq_letters[q].toUpperCase()
			if(qletter == sletter){
				 align_value += "|"
			}else{
				 align_value += ' '
			}
		}
	
		for(let s in sseq_letters){
		   let letter = sseq_letters[s].toUpperCase()
		   scaps += letter
	  
		}
	}else{
	    qcaps = 'Query:  ', scaps = 'Subject:'
	    qseq_pieces = qseq.cordwood(fold_length)
	    sseq_pieces = sseq.cordwood(fold_length)
	    numrows = qseq_pieces.length
	    text = ''
	    let qtally = parseInt(qstart)
	    let stally = parseInt(sstart)
	    for(let n=0;n<numrows;n++){
	        qtally_start = ((parseInt(n))*fold_length) + parseInt(qstart)  // 60+qstart, 120 = qstart
	        qtally_end = qtally_start + fold_length -1
	        stally_start = ((parseInt(n))*fold_length) + parseInt(sstart)  // 60+qstart, 120 = qstart
	        stally_end = stally_start + fold_length -1
	        if(n === numrows-1){
	            stally_end = send
	            qtally_end = qend
	        }
	        text += qcaps + qtally_start.toString().padStart(6,' ') + ' ' + qseq_pieces[n]+' ' +qtally_end.toString()+'\n'
	        thisq_list = qseq_pieces[n].split('')
	        thiss_list = sseq_pieces[n].split('')
	        let align_value = '               '
	        for(let q in thisq_list){
	            let qletter = thisq_list[q]
		        let sletter = thiss_list[q]
		        if(qletter == sletter){
		            align_value += '|'
		        }else{
		            align_value += ' '
		        }
		        
	        }
	        text += align_value +'\n'
	        text += scaps + stally_start.toString().padStart(6,' ') + ' ' + sseq_pieces[n]+ ' ' + stally_end.toString()+'\n\n'
	    }
	    
	}
    //window.open(qcaps+'<br>'+align_value+'<br>'+scaps)
   
    //doc.write('<pre>'+qcaps+'<br>'+align_value+'<br>'+scaps+'</pre>');
    
    if(fxn === 'download'){
        filetext = header_txt+text
        client_download('homd_alignment.txt',filetext.replace(/<br>/g,'\n'))
    }else{
         filetext = header_txt+'<pre>'+text+'</pre>'
         var win = window.open("about:blank", null, "menubar=no,status=no,toolbar=no,location=no,width=680,height=500");
        var doc = win.document;
        //doc.writeln("<title>yourtitle</title>");
        doc.title = 'eHOMD Alignment'
        doc.open("text/html")
        doc.write(filetext);
        doc.close();
    }
    
    //return qcaps+'<br>'+align_value+'<br>'+scaps
}    
function client_download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

function blastCkboxMaster(id){
   //alert('in bcbm')
   table = document.getElementById('blastResultsDiv')
   cbxs = table.querySelectorAll("input[type='checkbox']");
   // just need to check or un-check all
   if(cbxs[1].checked){
      ckall = false
   }else{
      ckall = true
   }
   for(var i = 0; i < cbxs.length; i++) {
      if(ckall)
        cbxs[i].checked = true; 
      else
        cbxs[i].checked = false; 
    } 
}

function blastDownload(form){
   //alert(id)
   
   //form = document.getElementById('blastDownloadForm')
  
   form.submit()
}
// function sortBlastTableForm(cb, blastID, col){
//    console.log(cb, blastID, col)
//    if(col === 'query'){
//       document.getElementById('isort').checked = false
//       document.getElementById('ssort').checked = false
//    }else if(col == 'score'){
//       document.getElementById('qsort').checked = false
//       document.getElementById('isort').checked = false
//    }else{  // identity
//       document.getElementById('qsort').checked = false
//       document.getElementById('ssort').checked = false
//    }
//    
//     if(cb.checked){
//        //console.log('checked')
//        direction = 'rev'
//     }else{
//        //console.log('not checked')
//        direction = 'fwd'
//     }
//     var xmlhttp = new XMLHttpRequest();
//     var url = '?id='+blastID+'&col='+col+'&dir='+direction+'&ajax=1'
//     xmlhttp.open("GET", "blast_results"+url, true);
//     
//     xmlhttp.setRequestHeader("Content-type","application/json");
//     xmlhttp.onreadystatechange = function() {
//     if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
//       var resp = xmlhttp.responseText;
//       document.getElementById('blastResultsDiv').innerHTML = resp
//      } 
//     }
//     xmlhttp.send();
//   
// }
qdir = 'fwd'
bdir = 'fwd'
idir = 'fwd'
direction = 'fwd'
function sortBlastTableForm_toggle(blastID, col){
   console.log(blastID, col)
   if(col === 'query'){
      if(direction=='fwd'){
         document.getElementById('qsort').style.background = 'lightgreen'
         direction='rev'
      }else{
         document.getElementById('qsort').style.background = 'darkgreen'
         direction='fwd'
      }
   }else if(col == 'bitscore'){
       document.getElementById('qsort').style.background = 'grey'
       direction='fwd'
   }else if(col == 'identity'){
      document.getElementById('qsort').style.background = 'grey'
      direction='fwd'
      
   }else{  // sequence original
      document.getElementById('qsort').style.background = 'grey'
      direction='fwd'

   }
  
    var xmlhttp = new XMLHttpRequest();
    var url = '?id='+blastID+'&col='+col+'&dir='+direction+'&ajax=1&t='+ Math.random()
    //console.log(url)
    xmlhttp.open("GET", "blast_results_refseq"+url, true);
    
    xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
      var resp = xmlhttp.responseText;
      document.getElementById('blastResultsDiv').innerHTML = resp
     } 
    }
    xmlhttp.send(null);
  
}
function opt_toggle(blastID, opt){
   console.log(blastID, opt)
   
    var xmlhttp = new XMLHttpRequest();
    var url = '?id='+blastID+'&opt='+opt+'&ajax=1&t='+ Math.random()
    //console.log(url)
    xmlhttp.open("GET", "blast_results_refseq"+url, true);
    
    xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
      var resp = xmlhttp.responseText;
      document.getElementById('blastResultsDiv').innerHTML = resp
      var newTableObject = document.getElementById('newSortTable')
      sorttable.makeSortable(newTableObject);
     } 
    }
    xmlhttp.send(null);
  
}
function reset2default(fxn) {
   // defaults
   if(fxn == 'genome'){
     window.open('/genome/blast?gid=all','_self');
   }else{
     window.open('/refseq/refseq_blastn','_self');
   }
   
}
//
function handleBlasterJSSelect(elm)
{
     console.log(elm)
     window.location = elm.value
  }
//
function handleNewSelect(elm)
{
     console.log('elm',elm.value)
     window.location = elm.value
}
function show_other_blast(gid){
   console.log('gid',gid)
   title_blastx = 'BLASTX: Compares a nucleotide query sequence translated in all reading frames against a protein sequence database.'
   title_tblastn = 'TBLASTN: Compares a protein query sequence against a nucleotide sequence database dynamically translated in all reading frames.'
   title_tblastx = 'TBLASTX: Compares the six-frame translations of a nucleotide query sequence against the six-frame translations of a nucleotide sequence database.'
       
   txt = "&nbsp;&nbsp;&nbsp;<input title='"+title_blastx+"' type='radio' name='blastProg' value='blastx' onclick=\"changeBlastGenomeDbs('"+gid+"','blastx')\"> <span title='"+title_blastx+"'><small>BLASTX</small></span>&nbsp;&nbsp;&nbsp;"
   txt += "<input title='"+title_tblastn+"' type='radio' name='blastProg' value='tblastn' onclick=\"changeBlastGenomeDbs('"+gid+"','tblastn')\"> <span title='"+title_tblastn+"'><small>TBLASTN</small></span>&nbsp;&nbsp;&nbsp;"
   txt += "<input title='"+title_tblastx+"' type='radio' name='blastProg' value='tblastx' onclick=\"changeBlastGenomeDbs('"+gid+"','tblastx')\"> <span title='"+title_tblastx+"'><small>TBLASTX</small></span>"
   document.getElementById('other_blast').innerHTML = txt
}
function toggle_blast_genome_list(sh,gid){
   args={}
   args.gid = gid
   // reload
   if(document.getElementById('all_genomes').checked === true){
       //alert('all')
       args.gid = 'all'
       document.getElementById('blast_sub_title').innerHTML='BLAST Against All HOMD Genome Sequences'
    }else{
      document.getElementById('blast_sub_title').innerHTML='BLAST Against "'+gid+'" Genome Sequences'
    }
   var xmlhttp = new XMLHttpRequest();
   xmlhttp.open("GET", "/genome/blast?gid="+args.gid, true);
    xmlhttp.setRequestHeader("Content-type","application/json");
    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
        var response = xmlhttp.responseText;
        //console.log(resp)
        //document.getElementById('genomeBlastDbChoices').innerHTML=response
        progs = document.getElementsByName('blastProg')
        for(i in progs){
           if(progs[i].checked === true){
              prog = progs[i].value
           }
        }
        //alert(db)
        changeBlastGenomeDbs(args.gid, prog)
            if(sh === 'show'){
              document.getElementById('genome_choices').style.display = 'block'
            }else{
              document.getElementById('genome_choices').style.display = 'none'
            }
        }
    }
    xmlhttp.send();
   
}
function change_blast_genome(gid){
   window.open('/genome/blast?gid='+gid,'_self');

}
function changeBlastGenomeDbs(gid, prog) {
    //alert(gid)
    args = {}
    args.prog = prog
    args.gid = gid
    // if all_genomes is selected: ignore 'gid'
    if(document.getElementById('all_genomes').checked === true){
       args.gid = 'all'
    }
    
    
    
    if(prog==='blastn' || prog ==='blastp'){
      document.getElementById('other_blast').innerHTML = ''
    }
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST", "/blast/changeBlastGenomeDbs", true);
    xmlhttp.setRequestHeader("Content-type","application/json");
    xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
        var response = xmlhttp.responseText;
        //console.log(resp)
        document.getElementById('genomeBlastDbChoices').innerHTML=response
        //document.getElementById(selected_db+'_rb').checked = true
       }
    }
    xmlhttp.send(JSON.stringify(args));

}
//
function blastFormCheck_refseq(){
   form = document.getElementById('blastForm')
   spamguard_input = document.getElementById('spamguard_input').value.toUpperCase()
   spamguard_actual = form.spamcode1.value.toUpperCase()
   //alert('in ' +spamguard_input)
   //alert('actual ' +spamguard_actual)
   if(spamguard_input !== spamguard_actual){
      alert('Spam Guard Codes must match')
      return
   }
   blastText = document.getElementById('textinput').value.trim()
   //alert(blastText)
   fileInput = document.getElementById('fileInput').value
   const patt = /[^ATCGUKSYMWRBDHVN]/i   // These are the IUPAC letters
   if(blastText == '' && fileInput == ''){
       alert('No sequences or file found')
       return
   }else if(blastText && !fileInput == ''){
      // check text
      if(blastText.length < 10) {
          alert('Sequence is too short: min_length = 10bp')
          return
      
      }else if(blastText[0] === '>') {
         var seqcount = (blastText.match(/>/g) || []).length;
         
      }else{
          //test out one naked sequence
          if( patt.test(blastText) ){
             alert(blastText[0],'Wrong character(s) detected: only letters represented by the standard IUB/IUPAC codes are allowed.')
             return
          }
      }
      
      
   }
   
   form.submit()
}
function blastFormCheck_genome(){
   form = document.getElementById('blastForm')
   spamguard_input = document.getElementById('spamguard_input').value.toUpperCase()
   spamguard_actual = form.spamcode1.value.toUpperCase()
   //alert('in ' +spamguard_input)
   //alert('actual ' +spamguard_actual)
   if(spamguard_input !== spamguard_actual){
      alert('Spam Guard Codes must match')
      return
   }
   if(form.blastDb.value === ''){
      if(document.getElementById('blastp_rb').checked){
         form.blastDb.value == 'faa/ALL_genomes.faa'
      }else if(document.getElementById('blastn_rb').checked){
         form.blastDb.value == 'fna/ALL_genomes.fna'
      }else{
        alert('You must choose a database')
        return
     }
   }
   // test for single wo chosen
   // if(document.getElementById('single_genome').checked === true
//      && document.getElementById('choose_genome_select').value === '0'){
//      alert('You must choose a genome OR select "ALL Genomes"')
//      return
//    }
   
   blastText = document.getElementById('textinput').value.trim()
   //alert(blastText)
   fileInput = document.getElementById('fileInput').value
   const patt = /[^ATCGUKSYMWRBDHVN]/i   // These are the IUPAC letters
   if(blastText == '' && fileInput == ''){
       alert('No sequences or file found')
       return
   }else if(blastText && !fileInput == ''){
      // check text
      if(blastText.length < 10) {
          alert('Sequence is too short: min_length = 10bp')
          return
      
      }else if(blastText[0] === '>') {
         var seqcount = (blastText.match(/>/g) || []).length;
         
      }else{
          //test out one naked sequence
          if( patt.test(blastText) ){
             alert(blastText[0],'Wrong character(s) detected: only letters represented by the standard IUB/IUPAC codes are allowed.')
             return
          }
      }
      
      
   }
   
   form.submit()
}

function copy_link(){
    var resultsurl = document.getElementById("blasturl");
    //console.log(resultsurl)
    window.getSelection().selectAllChildren(resultsurl);
    document.execCommand("Copy")
    /* Alert the copied text */
    alert("Link copied to clipboard.");
    
}