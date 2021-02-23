

// https://docs.dhtmlx.com/api__refs__dhtmlxtree.html  // this is the 'old' version5 with xml-auto-load
//// Uses customTree = new dhtmlXTreeObject() syntax
//// SEE https://docs.dhtmlx.com/suite/tree__loading_data.html#preparingdataset for proper JSON object format
// https://docs.dhtmlx.com/suite/tree__api__refs__tree.html // new version 7 must load from json file
//// Uses new dhx.Tree() syntax
//// Also see https://snippet.dhtmlx.com/4p7zgiaz for arbitrary appened data
/// Write a python script to take data from vamps (or HOMD) taxonomy to json.file:
//////////////////////////
// SELECT DISTINCT domain, phylum, klass, `order`, family, genus, species, strain, 
//  domain_id, phylum_id, klass_id, order_id, family_id, genus_id, species_id, strain_id 
//  FROM 
//  silva_taxonomy
//   JOIN domain AS dom USING(domain_id) 
//  JOIN phylum AS phy USING(phylum_id) 
//  JOIN klass AS kla USING(klass_id) 
//  JOIN `order` AS ord USING(order_id) 
//  JOIN family AS fam USING(family_id) 
//  JOIN genus AS gen USING(genus_id) 
//  JOIN species AS spe USING(species_id) 
//  JOIN strain AS str USING(strain_id)
/////////////////////////

function load_dhtmlx(data) {
    //customTree = new dhtmlXTreeObject("custom_treebox","100%","100%",0);
    
    // customTree = new dhx.Tree("custom_treebox", {
//     	css:"my_first_class my_second_class"
//     	});
    customTree = new dhx.Tree("custom_treebox", {
    	icon: false
	});
	customTree.data.parse(data);
    // customTree.setImagesPath("/images/dhtmlx/imgs/");

    customTree.events.on("itemClick", function(id, e){
    	console.log("The item with the id "+ id +" was clicked.");
    	customTree.toggle(id);
	});
}

// function expand_tree_dhtmlx(id){
//   //alert(customTree.hasChildren(id))
//   //kids = customTree.getAllSubItems(id);
//   level = customTree.getLevel(id)
//   
//   
//   //alert(level)
//   if ( customTree.hasChildren(id) ) {
//        
//       //clk_counter++;
//       //if(clk_counter+level <= 7){
//         //document.getElementById('custom_rank_info').innerHTML = 'opening;
//         customTree.openAllItems(id,true); 
// 
//       //}else{
//       //  alert('no more levels')
//       //}
// 
//       
//        
//       
//   }else{
//     alert('no sub-levels found')
//   }
// 
// }
function reset_tree_dhtmlx(){
  
  customTree.collapseAll();
}

function open_tree_dhtmlx(){
  
  customTree.expandAll();
}