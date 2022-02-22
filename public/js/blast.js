
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

function blastDownload(value, id){
   //alert(id)
   if(value === 0){
       return
   }
   form = document.getElementById('blastDownloadForm')
   table = document.getElementById('blastResultsDiv')
   cbxs = table.querySelectorAll("input[type='checkbox']");
   //console.log(cbxs)
   
   checked = []
   for(var i=0; i<cbxs.length;i++){
       //console.log(cbxs[i].value)
       //console.log(cbxs[i].checked)
       if(cbxs[i].checked && cbxs[i].value != 'master'){
         checked.push(cbxs[i])
       }
   }
   for(var n=0; n<checked.length; n++){
      let i = document.createElement("input");
       i.type = "hidden";
       i.name = "blastFilesToDnld";
       i.value = 'blast'+checked[n].value.toString()+'.fa.out'
       // add all elements to the form
       form.appendChild(i);
   }
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

function reset2default(fxn) {
   // set advanced,expect,max_target_seqs,
   // defaults
   if(fxn == 'genome'){
      adv = ''
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