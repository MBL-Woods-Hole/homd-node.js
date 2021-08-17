function select_phage_headers(){
   
   list=[
      
      'Host Taxon-ID',
      'NCBI-Assembly',
      'NCBI-SRA_Accession',
      'NCBI-Submitters',
      'NCBI-Release_Date',
      'NCBI-Family',
      'NCBI-Genus',
      'NCBI-Species',
      'NCBI-Publications',
      'NCBI-Molecule_Type',
      'NCBI-Sequence_Type',
      'NCBI-Geo_Location',
      'NCBI-USA',
      'NCBI-Host_Bacteria',
      'NCBI-Isolation_Source',
      'NCBI-Collection_Date',
      'NCBI-Biosample',
      'NCBI-genbank_title'
   ]
   html = ''
   html += "<input type='checkbox' checked disabled name='pid' value='Phage-ID' /> Phage-ID<br>"
   for (n in list){
     html += "<input type='checkbox' name='' value='"+list[n]+"' /> "+list[n]+"<br>"
   }
   html += "<input type='button' name='cancel' value='Cancel' onclick='close_phage_header_select()' />&nbsp;"
   html += "<input type='button' name='done' value='Go' />"
   document.getElementById('phage-column-choices').innerHTML = html
   document.getElementById('phage-column-choices').style.cssText= `
      position : absolute;
      background:grey;
      padding: 5px;
    `;
}

function close_phage_header_select(){
    document.getElementById('phage-column-choices').style.visibility='hidden'
}