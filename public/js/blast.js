
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
function sortBlastTableForm(cb, blastID, col){
   console.log(cb, blastID, col)
   if(col === 'query'){
      document.getElementById('isort').checked = false
      document.getElementById('ssort').checked = false
   }else if(col == 'score'){
      document.getElementById('qsort').checked = false
      document.getElementById('isort').checked = false
   }else{  // identity
      document.getElementById('qsort').checked = false
      document.getElementById('ssort').checked = false
   }
   
    if(cb.checked){
       //console.log('checked')
       direction = 'rev'
    }else{
       //console.log('not checked')
       direction = 'fwd'
    }
    var xmlhttp = new XMLHttpRequest();
    var url = '?id='+blastID+'&col='+col+'&dir='+direction+'&ajax=1'
    xmlhttp.open("GET", "blast_results"+url, true);
    
    xmlhttp.setRequestHeader("Content-type","application/json");
    xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
      var resp = xmlhttp.responseText;
      document.getElementById('blastResultsDiv').innerHTML = resp
     } 
    }
    xmlhttp.send();
  
}
qdir = 'fwd'
bdir = 'fwd'
idir = 'fwd'
direction = 'fwd'
function sortBlastTableForm_toggle(blastID, col){
   console.log(blastID, col)
   if(col === 'query'){
      document.getElementById('bsort').style.background = 'grey'
      document.getElementById('isort').style.background = 'grey'
      document.getElementById('ssort').checked = false
      if(direction=='fwd'){
         document.getElementById('qsort').style.background = 'lightgreen'
         direction='rev'
      }else{
         document.getElementById('qsort').style.background = 'darkgreen'
         direction='fwd'
      }
      
   }else if(col == 'bitscore'){
       document.getElementById('qsort').style.background = 'grey'
      
      document.getElementById('isort').style.background = 'grey'
      document.getElementById('ssort').checked = false
      if(direction=='fwd'){
         document.getElementById('bsort').style.background = 'lightgreen'
         direction='rev'
      }else{
         document.getElementById('bsort').style.background = 'darkgreen'
         direction='fwd'
      }
   }else if(col == 'identity'){
       document.getElementById('qsort').style.background = 'grey'
      document.getElementById('bsort').style.background = 'grey'
     
      document.getElementById('ssort').checked = false
      if(direction=='fwd'){
         document.getElementById('isort').style.background = 'lightgreen'
         direction='rev'
      }else{
         document.getElementById('isort').style.background = 'darkgreen'
         direction='fwd'
      }
   }else{  // sequence original
       document.getElementById('qsort').style.background = 'grey'
      document.getElementById('bsort').style.background = 'grey'
      document.getElementById('isort').style.background = 'grey'
      direction='fwd'

   }
   console.log(direction)
  //   if(cb.checked){
//        //console.log('checked')
//        direction = 'rev'
//     }else{
//        //console.log('not checked')
//        direction = 'fwd'
//     }
    var xmlhttp = new XMLHttpRequest();
    var url = '?id='+blastID+'&col='+col+'&dir='+direction+'&ajax=1&t='+ Math.random()
    console.log(url)
    xmlhttp.open("GET", "blast_results"+url, true);
    
    xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
      var resp = xmlhttp.responseText;
      document.getElementById('blastResultsDiv').innerHTML = resp
     } 
    }
    xmlhttp.send(null);
  
}

function reset2default(fxn) {
   // set advanced,expect,max_target_seqs,
   // defaults
   if(fxn == 'genome'){
      adv = ''
      document.getElementById('blast_prokka_rb').checked = true
   }else{
      adv = '-penalty -3 -reward 2 -gapopen 5 -gapextend 2'
   }
   max_target_seqs = '100'
   expect = '0.0001'
   document.getElementById('advancedOpts').value = adv
   document.getElementById('blastMaxTargetSeqs').value = max_target_seqs
   document.getElementById('blastExpect').value = expect
   document.getElementById('textinput').value = ''
   
}