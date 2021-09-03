function open_phage_header_select(){
    $('#phage-column-choices').show();
    //event.stopPropagation();
}
function close_phage_header_select(){
    //document.getElementById('phage-column-choices').style.visibility = 'hidden'
    $('#phage-column-choices').hide()
}
function clear_phage_header_select(){
    var els = document.getElementsByClassName('potential_column_header');
    for(n in els){
       els[n].checked  = false
       els[n].disabled = false
    }
}
function defaults_phage_header_select(){
   var els = document.getElementsByClassName('potential_column_header');
   var default_col_list_values = 
   [ 'host_otid','host_ncbi','family_ncbi', 'genus_ncbi', 'species_ncbi' ];
   for(n in els){
       if(default_col_list_values.indexOf(els[n].value) == -1 ){
          els[n].checked  = false
          els[n].disabled = true
       }else{
          els[n].checked  = true
          els[n].disabled = false
       }
    }
   
}
function create_column_choices_dialog(cols_showing){
   // on page load only
   var col_list = 
   [
      {name:'Host Taxon-ID',value:'host_otid'},
      {name:'NCBI-Host_Bacteria',value:'host_ncbi'},
      {name:'NCBI-Assembly',value:'assembly_ncbi'},
      
      {name:'NCBI-SRA_Accession',value:'sra_accession_ncbi'},
      {name:'NCBI-Collection_Date',value:'collection_date_ncbi'},
      {name:'NCBI-Release_Date',value:'release_date_ncbi'},
      {name:'NCBI-Geo_Location',value:'geo_location_ncbi'},
      {name:'NCBI-USA',value:'usa_ncbi'},
      
      {name:'NCBI-Family',value:'family_ncbi'},
      {name:'NCBI-Genus',value:'genus_ncbi'},
      {name:'NCBI-Species',value:'species_ncbi'},
      
      {name:'NCBI-Biosample',value:'biosample_ncbi'},
      {name:'NCBI-Genbank_Title',value:'genbank_title_ncbi'},
      {name:'NCBI-Isolation_Source',value:'isolation_source_ncbi'},
      {name:'NCBI-Molecule_Type',value:'molecule_type_ncbi'},
      {name:'NCBI-Publications',value:'publications_ncbi'},
      
      {name:'NCBI-Sequence_Type',value:'sequence_type_ncbi'},
      {name:'NCBI-Submitters',value:'submitters_ncbi'}
   ]
   
   html = "<form name='phage_table_column_select' method='POST' action='phage_table' >"
   html += '<table><tr>'
   html += "<td><input type='checkbox' checked disabled  value='Phage-ID' /> Phage-ID"
   html += "<input type='hidden'  name='pid' value='Phage-ID' /></td>"
   
   var cols=3
   //console.log(cols_showing[0])
   //make name list from cols_showing
   cols_showing_names=[]
   for(n in cols_showing){
      cols_showing_names.push(cols_showing[n].name)
   }
   //console.log(cols_showing_names)
   cnt = cols_showing_names.length
   for (n in col_list){
     //console.log('modulus ',n % cols)
     if(n % cols == 0){  // modulus
         html += "</tr><tr>"
     }
     if(cols_showing_names.indexOf(col_list[n].value) > 0){
        isdisabled = ''
        ischecked = 'checked'
     }else{
         if(cnt >= 6){
            isdisabled = 'disabled'
         }else{
            isdisabled = ''
         }
         ischecked=''
     }
     html += "<td><input type='checkbox' "+isdisabled+" "+ischecked+" class='potential_column_header' name='"+col_list[n].value+"' value='"+col_list[n].value+"' onclick='column_count()' /> "+col_list[n].name+"</td>"
   }
   html += "</tr><tr>"
   html += "<td><input type='button' class='pill pill-khaki' name='clear' value='Clear' onclick='clear_phage_header_select()' />&nbsp;&nbsp;&nbsp;&nbsp;"
   html += "<input type='button' class='pill pill-orange' name='cancel' value='Cancel' onclick='close_phage_header_select()' />&nbsp;&nbsp;&nbsp;&nbsp;"
   html += "<input type='button' class='pill pill-orange' name='defaults' value='Defaults' onclick='defaults_phage_header_select()' />&nbsp;&nbsp;&nbsp;&nbsp;"
   
   html += "</td><td><input type='submit' class='pill pill-lightseagreen' value='   Go   ' /></td>"
   
   html += "</tr></table>"
   html += "</form>"
   document.getElementById('phage-column-choices').innerHTML = html
   document.getElementById('phage-column-choices').style.cssText= `
      position : absolute;
      background:lightgrey;
      padding: 15px;
      border:1px solid black;
      display: none;
      z-index: 100;
    `;
}


function column_count(){
    // limit column count to five
    var cnt = 0
    var els = document.getElementsByClassName('potential_column_header')
    Array.from(els).forEach((el) => {
      if(el.checked === true){
          cnt += 1
       }
    });
    if(cnt >= 5){
      Array.from(els).forEach((el) => {
       if(el.checked === false){
          el.disabled = true
       }
      });
    }else{
      Array.from(els).forEach((el) => {
        el.disabled = false
      });
    }
    //console.log(cnt)
}
//
function phage_alpha(letter){
    console.log('js got letter',letter)
    var xmlhttp = new XMLHttpRequest();
    
    let rank_radio_list = document.getElementsByName('phage-by-alpha')
    let rank = 'family' // default
    for(n in rank_radio_list){
        if(rank_radio_list[n].checked == true){
            rank = rank_radio_list[n].value
        }
    }
   
    let url = "phage_table?k="+letter+'&rank='+rank
	window.open(url,"_self")
	
    return false;
    
}
//
function deselect_letter(){
    console.log('deselect')
    var els = document.getElementById('alpha-list').getElementsByTagName('a');
    for (var i = 0; i < els.length; i++) {
       console.log(els[i])
       els[i].style.color = 'black'
	   els[i].style.fontSize = 'small'
    }
}
//
function phage_table_search(){
   form = document.getElementById('ptable_search')
   if(form.phage_srch.value == ''){
       return
   }
   
   form.submit()
}