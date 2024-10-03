'use strict'
/*
 * TaxonomyTree = custom_taxa_class.js
 */

/*jshint multistr: true */

const CONSTS = require(app_root + '/public/constants');
const helpers = require(app_root + '/routes/helpers/helpers');

// Private
let taxon_name_id = 1;
const ranks = CONSTS.ranks;

function make_dictMap_by_rank(tags) {
  const dictMap_by_rank = {};
  // let ranks = CONSTS.ranks;
  ranks.forEach( rank => {
    dictMap_by_rank[rank] = [];
  });
  for (let i = 0; tags.length > i; i += 1) {
    dictMap_by_rank[tags[i].rank].push(tags[i]);
  }
  return dictMap_by_rank;
}

function add_to_dict_by_key(dictMap, dictMap_key, value) 
{
  dictMap[dictMap_key] = value;
  return dictMap;
}

function get_by_key(dictMap, dictMap_key) 
{
  return dictMap[dictMap_key];
}

function make_current_dict(taxa_name, taxa_rank, i_am_a_parent, taxon_name_id, otid)
{
  const current_dict =
          {
            parent_id: "",
            children_ids: [],
            taxon: "",
            rank: "",
            node_id: 1,
            //otid: 'x'
          };

  current_dict.taxon = taxa_name;
  current_dict.rank = taxa_rank;
  current_dict.parent_id = i_am_a_parent;
  current_dict.node_id = taxon_name_id;
  if(taxa_rank == 'species' || taxa_rank == 'subspecies'){
    current_dict.otid = otid;
  }
  return current_dict;
}

function add_children_to_parent(dictMap_by_id, current_dict)
{
  // here current dict if species WITH children REMOVE otid
 
  add_to_dict_by_key(dictMap_by_id, current_dict.node_id, current_dict);
  
//  TODO: test if changed to let and removed from above
  let parent_node = dictMap_by_id[current_dict.parent_id];
  
  if (parent_node)
  {
    // if(current_dict.rank=='family' && current_dict.taxon=='Aminobacteriaceae'){
//       console.log('4 parent',parent_node)
//       console.log('5 currant',current_dict)
//     }
    //console.log(parent_node.taxon)
    parent_node.children_ids.push(current_dict.node_id);
  }
  
  // here current dict if subspecies:  REMOVE (ambiguous)parent.otid
  if(current_dict.rank == 'subspecies' ){
      delete parent_node.otid
  }
  return parent_node;
}

// todo: refactor! Too long and nested
// JSHint: This function's cyclomatic complexity is too high. (7)(W074)
function make_taxa_tree_dict(taxonomy_obj)
{
  let taxa_tree_dict = [];
  let dictMap_by_name_n_rank  = {};
  let dictMap_by_otid_n_rank = {};

  let dictMap_by_id = {};
  //console.log("HHH0");
  //console.log("taxonomy_obj = " + JSON.stringify(taxonomy_obj));
  //console.log("HHH");
  
  for (let i=0, len = taxonomy_obj.length; i < len; i++)
  {
    
  //problem node   {
//   parent_id: 0,
//   children_ids: [ 48 ],
//   taxon: 'Terrahaemophilus',
//   rank: 'genus',
//   node_id: 47
// }

    
      let in_obj = taxonomy_obj[i];
    //console.log("\ntaxon_objs[i] = " + JSON.stringify(in_obj));
    let i_am_a_parent = 0;
    for (let field_name in in_obj)
    {
      //console.log("field_name = " + JSON.stringify(field_name));
       
      let is_rank = helpers.check_if_rank(field_name);
      if (is_rank)
      {
        
        //let otid_field_name = field_name + "_id";
        let otid_field_name = "otid";
        //console.log("otid_field_name = " + JSON.stringify(otid_field_name));
        let otid = in_obj[otid_field_name];
        //console.log("in_obj = " + JSON.stringify(in_obj));

        let parent_node = {};
        let current_dict = {};
        let taxa_rank = field_name;
        
        if (in_obj.hasOwnProperty(taxa_rank))
        {
          let taxa_name = in_obj[taxa_rank];
          if (taxa_name) {
                
                let node = get_by_key(dictMap_by_name_n_rank, taxa_name + "_" + taxa_rank);
                //console.log("old_node = " + JSON.stringify(node));
// if(taxa_name =='Terrahaemophilus'){
//              console.log("name_rank1 = " + taxa_name + " - " + taxa_rank);
//              console.log("old_node = " + JSON.stringify(node));
//              console.log("taxon_name_id = ", taxon_name_id);
// }
                if (node) {
                    
                    i_am_a_parent = node.node_id;
                } else {//(!node)
                    
                    current_dict = make_current_dict(taxa_name, taxa_rank, i_am_a_parent, taxon_name_id, otid);
                    //console.log("current_dict = " + JSON.stringify(current_dict,null,4))
                   
                    taxa_tree_dict.push(current_dict);

                    add_to_dict_by_key(dictMap_by_name_n_rank,  current_dict.taxon + "_" + current_dict.rank, current_dict);

                    add_to_dict_by_key(dictMap_by_otid_n_rank, current_dict.otid + "_" + current_dict.rank, current_dict);

                    i_am_a_parent = current_dict.node_id;

                    taxon_name_id += 1;
                    
                    parent_node = add_children_to_parent(dictMap_by_id, current_dict);
            }
          }
        }
      }
    }
  } 
  //console.log(dictMap_by_otid_n_rank)
  return [taxa_tree_dict, dictMap_by_id, dictMap_by_otid_n_rank, dictMap_by_name_n_rank];
}

// Public
module.exports = TaxonomyTree;

function TaxonomyTree(rows) {
  this.taxa_tree_dict = [];
  this.taxa_tree_dict_map_by_rank = [];
  this.taxonomy_obj = rows;
  
  let temp_arr = make_taxa_tree_dict(this.taxonomy_obj);
  this.taxa_tree_dict = temp_arr[0];
  this.taxa_tree_dict_map_by_id = temp_arr[1]; 
  this.taxa_tree_dict_map_by_otid_n_rank = temp_arr[2]; 
  this.taxa_tree_dict_map_by_name_n_rank = temp_arr[3]; 
  this.taxa_tree_dict_map_by_rank = make_dictMap_by_rank(this.taxa_tree_dict);
  //console.log("HHH1");
  //console.log("taxonomy_obj = " + JSON.stringify(this.taxonomy_obj));
  //console.log("taxonomy_obj673 = " + JSON.stringify(this.taxonomy_obj.filter(item => item.otid=='673')));
  //console.log("HHH");
}

TaxonomyTree.prototype.make_dict = (tree_obj, key_name) => {
  let new_dict = {};
  console.log('in TT prottype')
  for (let i = 0; tree_obj.length > i; i += 1) {
    new_dict[tree_obj[i][key_name]] = tree_obj[i];
  }
  return new_dict;
};

