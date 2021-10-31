
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
    var win = window.open("about:blank", null, "menubar=no,status=no,toolbar=no,location=no,width=650,height=500");
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
   var ckbs = document.querySelectorAll("input[type='checkbox']");
   // just need to check or un-check all
   if(ckbs[1].checked){
      ckall = false
   }else{
      ckall = true
   }
   for(var i = 0; i < ckbs.length; i++) {
      if(ckall)
        ckbs[i].checked = true; 
      else
        ckbs[i].checked = false; 
    } 
}

function blastDownload(value, id){
   //alert(id)
   if(value === 0){
       return
   }
   form = document.getElementById('blastDownloadForm')
   // form.reset();
//    const i = document.createElement("input");
//    i.type = "text";
//    i.name = "dnldType";
//    i.id = "intext";
//    i.value = value
//    // add all elements to the form
//    form.appendChild(i);
//    const j = document.createElement("input");
//    j.type = "text";
//    j.name = "blastID";
//    j.id = "intext";
//    j.value = id
//    // add all elements to the form
//    form.appendChild(j);
   document.getElementById('dnldType').value = 0
   form.submit()
}
function sortBlastTableForm(cb, blastID, col){
   //console.log(cb, blastID, col)
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

function reset2default() {
   // set advanced,expect,max_target_seqs,
   // defaults
   adv = '-penalty -3 -reward 2 -gapopen 5 -gapextend 2'
   max_target_seqs = '20'
   expect = '0.0001'
   document.getElementById('advancedOpts').value = adv
   document.getElementById('blastMaxTargetSeqs').value = max_target_seqs
   document.getElementById('blastExpect').value = expect
   
}