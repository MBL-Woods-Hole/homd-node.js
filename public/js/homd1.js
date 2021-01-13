function showtext(id_name){
   document.linkout.tigr_locus.value = id_name[0]
   document.linkout.tigr_locus_name.value = id_name[1]
}


function showtext(id_name){
   document.linkout.tigr_locus.value = id_name[0]
   document.linkout.tigr_locus_name.value = id_name[1]
}
function submitApp(org){
    document.open=('modules.php?op=modload&name=GenomeViewer&file=index&org='+org)
}

/***********************************************
* AnyLink Drop Down Menu- ? Dynamic Drive (www.dynamicdrive.com)
* This notice MUST stay intact for legal use
* Visit http://www.dynamicdrive.com/ for full source code
***********************************************/

//Contents for menu 1
var menu1=new Array()
menu1[0]='<a href="#" onClick="interproselect(\'mapview\')">Map-View</a>'
menu1[1]='<a href="#" onClick="interproselect(\'tableview\')">Table-View</a>'

var menuwidth='100px' //default menu width
var menubgcolor='lightyellow' //menu bgcolor
var disappeardelay=200 //menu disappear speed onMouseout (in miliseconds)
var hidemenu_onclick="yes" //hide menu when user clicks within menu?

/////No further editting needed

var ie4=document.all
var ns6=document.getElementById&&!document.all

if (ie4||ns6)
document.write('<div id="dropmenudiv" style="visibility:hidden;width:'+menuwidth+';background-color:'+menubgcolor+'" onMouseover="clearhidemenu()" onMouseout="dynamichide(event)"></div>')

function getposOffset(what, offsettype){
var totaloffset=(offsettype=="left")? what.offsetLeft : what.offsetTop;
var parentEl=what.offsetParent;
while (parentEl!=null){
totaloffset=(offsettype=="left")? totaloffset+parentEl.offsetLeft : totaloffset+parentEl.offsetTop;
parentEl=parentEl.offsetParent;
}
return totaloffset;
}


function showhide(obj, e, visible, hidden, menuwidth){
if (ie4||ns6)
dropmenuobj.style.left=dropmenuobj.style.top=-500
if (menuwidth!=""){
dropmenuobj.widthobj=dropmenuobj.style
dropmenuobj.widthobj.width=menuwidth
}
if (e.type=="click" && obj.visibility==hidden || e.type=="mouseover")
obj.visibility=visible
else if (e.type=="click")
obj.visibility=hidden
}

function iecompattest(){
return (document.compatMode && document.compatMode!="BackCompat")? document.documentElement : document.body
}

function clearbrowseredge(obj, whichedge){
var edgeoffset=0
if (whichedge=="rightedge"){
var windowedge=ie4 && !window.opera? iecompattest().scrollLeft+iecompattest().clientWidth-15 : window.pageXOffset+window.innerWidth-15
dropmenuobj.contentmeasure=dropmenuobj.offsetWidth
if (windowedge-dropmenuobj.x < dropmenuobj.contentmeasure)
edgeoffset=dropmenuobj.contentmeasure-obj.offsetWidth
}
else{
var topedge=ie4 && !window.opera? iecompattest().scrollTop : window.pageYOffset
var windowedge=ie4 && !window.opera? iecompattest().scrollTop+iecompattest().clientHeight-15 : window.pageYOffset+window.innerHeight-18
dropmenuobj.contentmeasure=dropmenuobj.offsetHeight
if (windowedge-dropmenuobj.y < dropmenuobj.contentmeasure){ //move up?
edgeoffset=dropmenuobj.contentmeasure+obj.offsetHeight
if ((dropmenuobj.y-topedge)<dropmenuobj.contentmeasure) //up no good either?
edgeoffset=dropmenuobj.y+obj.offsetHeight-topedge
}
}
return edgeoffset
}

function populatemenu(what){
if (ie4||ns6)
dropmenuobj.innerHTML=what.join("")
}


function dropdownmenu(obj, e, menucontents, menuwidth){
if (window.event) event.cancelBubble=true
else if (e.stopPropagation) e.stopPropagation()
clearhidemenu()
dropmenuobj=document.getElementById? document.getElementById("dropmenudiv") : dropmenudiv
populatemenu(menucontents)

if (ie4||ns6){
showhide(dropmenuobj.style, e, "visible", "hidden", menuwidth)
dropmenuobj.x=getposOffset(obj, "left")
dropmenuobj.y=getposOffset(obj, "top")
dropmenuobj.style.left=dropmenuobj.x-clearbrowseredge(obj, "rightedge")+"px"
dropmenuobj.style.top=dropmenuobj.y-clearbrowseredge(obj, "bottomedge")+obj.offsetHeight+"px"
}

return clickreturnvalue()
}

function clickreturnvalue(){
if (ie4||ns6) return false
else return true
}

function contains_ns6(a, b) {
while (b.parentNode)
if ((b = b.parentNode) == a)
return true;
return false;
}

function dynamichide(e){
if (ie4&&!dropmenuobj.contains(e.toElement))
delayhidemenu()
else if (ns6&&e.currentTarget!= e.relatedTarget&& !contains_ns6(e.currentTarget, e.relatedTarget))
delayhidemenu()
}

function hidemenu(e){
if (typeof dropmenuobj!="undefined"){
if (ie4||ns6)
dropmenuobj.style.visibility="hidden"
}
}

function delayhidemenu(){
if (ie4||ns6)
delayhide=setTimeout("hidemenu()",disappeardelay)
}

function clearhidemenu(){
if (typeof delayhide!="undefined")
clearTimeout(delayhide)
}

if (hidemenu_onclick=="yes")
document.onclick=hidemenu


/////////////////////////////////////////////////////////////////////////////////////////////////////
/***********************************************
* Switch Content script II- ? Dynamic Drive (www.dynamicdrive.com)
* This notice must stay intact for legal use. Last updated April 2nd, 2005.
* Visit http://www.dynamicdrive.com/ for full source code
***********************************************/

var enablepersist="off" //Enable saving state of content structure using session cookies? (on/off)
var memoryduration="1" //persistence in # of days

var contractsymbol='themes/ExtraLite_homd/images/hide.png' //Path to image to represent contract state.
var expandsymbol='themes/ExtraLite_homd/images/show.png' //Path to image to represent expand state.

/////No need to edit beyond here //////////////////////////
function getElementbyClass(rootobj, classname){
var temparray=new Array()
var inc=0
var rootlength=rootobj.length
for (i=0; i<rootlength; i++){
if (rootobj[i].className==classname)
temparray[inc++]=rootobj[i]
}
return temparray
}

function sweeptoggle(ec){
var inc=0
while (ccollect[inc]){
ccollect[inc].style.display=(ec=="contract")? "none" : ""
inc++
}
revivestatus()
}


function expandcontent(curobj, cid){
if (ccollect.length>0){
document.getElementById(cid).style.display=(document.getElementById(cid).style.display!="none")? "none" : ""
curobj.src=(document.getElementById(cid).style.display=="none")? expandsymbol : contractsymbol
}
}

function revivecontent(){
selectedItem=getselectedItem()
selectedComponents=selectedItem.split("|")
for (i=0; i<selectedComponents.length-1; i++)
document.getElementById(selectedComponents[i]).style.display="none"
}

function revivestatus(){
var inc=0
while (statecollect[inc]){
if (ccollect[inc].style.display=="none")
statecollect[inc].src=expandsymbol
else
statecollect[inc].src=contractsymbol
inc++
}
}

function get_cookie(Name) { 
var search = Name + "="
var returnvalue = "";
if (document.cookie.length > 0) {
offset = document.cookie.indexOf(search)
if (offset != -1) { 
offset += search.length
end = document.cookie.indexOf(";", offset);
if (end == -1) end = document.cookie.length;
returnvalue=unescape(document.cookie.substring(offset, end))
}
}
return returnvalue;
}

function getselectedItem(){
if (get_cookie(window.location.pathname) != ""){
selectedItem=get_cookie(window.location.pathname)
return selectedItem
}
else
return ""
}

function saveswitchstate(){
var inc=0, selectedItem=""
while (ccollect[inc]){
if (ccollect[inc].style.display=="none")
selectedItem+=ccollect[inc].id+"|"
inc++
}
if (get_cookie(window.location.pathname)!=selectedItem){ //only update cookie if current states differ from cookie's
var expireDate = new Date()
expireDate.setDate(expireDate.getDate()+parseInt(memoryduration))
document.cookie = window.location.pathname+"="+selectedItem+";path=/;expires=" + expireDate.toGMTString()
}
}

function do_onload(){
uniqueidn=window.location.pathname+"firsttimeload"
var alltags=document.all? document.all : document.getElementsByTagName("*")
ccollect=getElementbyClass(alltags, "switchcontent")
statecollect=getElementbyClass(alltags, "showstate")
if (enablepersist=="on" && get_cookie(window.location.pathname)!="" && ccollect.length>0)
revivecontent()
if (ccollect.length>0 && statecollect.length>0)
revivestatus()
}

if (window.addEventListener)
window.addEventListener("load", do_onload, false)
else if (window.attachEvent)
window.attachEvent("onload", do_onload)
else if (document.getElementById)
window.onload=do_onload

if (enablepersist=="on" && document.getElementById)
window.onunload=saveswitchstate


////////////////////////////////write by myself////////////////////////
function permission(add_extracomment){
    if (add_extracomment==2){
        var myComment=document.compliation.comment.value;
        if (!myComment){
            window.alert("Please finish Comment, before saving it.");
        }else{
            return true;
        }
    }else if (add_extracomment==1){
        var myResult=document.compliation.access_right.value;
        var mySelectgroup="nodata";
        var mySelectuser=1;
        if (myResult==2){
            var groupArray=document.compliation.elements['select_group[]'];
            for(i=0; i<groupArray.length; i++){
                if (groupArray[i].checked){
                    mySelectgroup=groupArray[i].value;
                }
            }
            var userArray=document.compliation.elements['select_user[]'];
            for(i=0; i<userArray.length; i++){
                if (userArray[i].checked){
                    mySelectuser=userArray[i].value;
                }
            }
        } 
        var myGeneid=document.compliation.geneid.value;
        var myAnnotation=document.compliation.annotation.value;
        if (!myGeneid){
            window.alert("Please assign a Gene id first.  Before saving it, you must fill in Gene id, Annotation and Permission.");
        }else if (!myAnnotation){
            window.alert("Please finish the annotation first.  Before saving it, you must fill in Gene id, Annotation and Permission.");
        }else if (!myResult){
            window.alert("Before saving it, please assign a permission first");
        }else if(myResult==2 && mySelectgroup=="nodata" &&mySelectuser==1){
            window.alert("You have selected the permission for sharing groups or users. Please specify the groups or users you would share."); 
        }else{
            return myResult;
        }
    }
}
function doublecheck(formObj){
        var userChoice = window.confirm("Are you sure to change the annotation ? ");
        //var newParameter=
        //formObj.document.write(formObj + '<input type="hidden" name="save" value="1">');
        //window.location="http://bioinformatics.forsyth.org/homd/modules.php?op=modload&name=GeneAnno&file=index&main=editor&show=com&#Annotation";
        if (userChoice==true){
            //window.replace("");
            //formObj.write("<input type='hidden' name='save' value='1'>");
            formObj.action='modules.php?op=modload&name=GeneAnno&file=index&main=editor&show=com&tmp=1';
            //formObj.document.write(formObj + '<input type="hidden" name="save" value="1">');
            formObj.submit();
        }
        if (userChoice==false){
            //formObj.action='modules.php?op=modload&name=GeneAnno&file=index&main=editor&show=com&tmp=3';
            //formObj.submit();
        }
}
function doublecheck_cancel(formObj){
    var userChoice = window.confirm("Are you sure to cancel the current modifications ? ");
    if (userChoice==true){
        formObj.action='modules.php?op=modload&name=GeneAnno&file=index&main=editor&show=com&reset=1#preview';
        formObj.submit();
    }
    if (userChoice==false){
    }
}
function checkcompare(formObj){
    var compareArray=document.history_compare.elements['his_compare[]'];
    var arrayNumber=0;
    for(i=0; i<compareArray.length; i++){
        if (compareArray[i].checked){
            arrayNumber++;
        }
    }    
    //document.write(arrayNumber);
    if (arrayNumber!=2){
        window.alert("Please select only two editing records for comparing");
        document.history_compare.his_compare.focus();
    }else{
        formObj.submit();
    }
}
function checkdelete(formObj, parameter){
        var userChoice = window.confirm("Are you sure to delete the record ? ");
        if (userChoice==true){
            formObj.action='modules.php?op=modload&name=GeneAnno&file=index&main=editor&show=his&his_delete='+parameter;
            formObj.submit();
        }
        if (userChoice==false){
        }
}
function checkNum() {
    var startValue = document.editorrange.start.value;
    var stopValue = document.editorrange.stop.value;
    if (isNaN(startValue) || startValue == "" ||startValue<1) {
        window.alert("It's invalid range. Please try again.");
        document.editorrange.start.focus();
    }else if (isNaN(stopValue) || stopValue == ""||stopValue<1) {
        window.alert("It's invalid range. Please try again.");
        document.editorrange.stop.focus();
    }else if (stopValue == startValue) {
        window.alert("It's invalid range. Please try again.");
        document.editorrange.stop.focus();
    }else{
        return true;
    }
    
}
function checkNum2() {
    var startValue = document.genesearch.start_S.value;
    var stopValue = document.genesearch.stop_S.value;
    if (startValue == "" && stopValue == ""){
        return true;
    }else{
        if (isNaN(startValue) || startValue == "" ||startValue<1) {
            window.alert("It's invalid range. Please try again.");
            document.genesearch.start.focus();
        }else if (isNaN(stopValue) || stopValue == ""||stopValue<1) {
            window.alert("It's invalid range. Please try again.");
            document.genesearch.stop.focus();
        }else if (stopValue == startValue) {
            window.alert("It's invalid range. Please try again.");
            document.genesearch.stop.focus();
        }else{
            return true;
        }
    }
}

function whichbutton_genesearch(){
    var buttonValue="";
    for (i=0; i<document.genesearch.database.length; i++){
        if (document.genesearch.database[i].checked){
            buttonValue= document.formname.typename[i].value;
        }
    }
    return buttonValue;
}
        
function check_searchfiled(){
    var checkValue=document.genesearch.genomeSel_S.value;
    if (checkValue=="all"){
        window.alert("To avoid system overload, please specify the genome when searching for all of the database.");
        window.location='modules.php?op=modload&name=GeneAnno&file=index&genomeSel_S=aact';
    }else{
        return true;
    }
}











