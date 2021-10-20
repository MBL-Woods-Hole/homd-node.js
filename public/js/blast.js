
function getFileContent(type, id, num) {
   
    var args={}
    args.type = type  // seq or res
    args.id = id
    args.num = num
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST", "/blast/showBlast", true);
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


function blastCBMaster(){
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

     