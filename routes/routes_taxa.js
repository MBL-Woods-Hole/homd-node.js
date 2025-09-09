'use strict'
const express = require('express');
let router = express.Router();
const CFG = require(app_root + '/config/config');
const fs = require('fs-extra');
// const url = require('url');
const path = require('path');
const { title } = require('process');
const C = require(app_root + '/public/constants');
const helpers = require(app_root + '/routes/helpers/helpers');
const helpers_taxa = require(app_root + '/routes/helpers/helpers_taxa');
const queries = require(app_root + '/routes/queries')
// let today = new Date();
// let dd = String(today.getDate()).padStart(2, '0');
// let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
// let yyyy = today.getFullYear();
// today = yyyy + '-' + mm + '-' + dd;
// let currentTimeInSeconds=Math.floor(Date.now()/1000); //unix timestamp in seconds

function renderTaxonTable(req, res, args) {

  res.render('pages/taxa/taxtable', {
    title: 'HOMD :: Taxon Table',
    pgtitle: 'Human Oral/Nasal Microbial Taxa',
    pgname: 'taxon/tax_table',  //for AbountThisPage
    config: JSON.stringify(CFG),
    ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version, tax_ver: C.homd_taxonomy_version }),

    data: JSON.stringify(args.send_list),
    count_txt: args.count_txt,
    filter: JSON.stringify(args.filter),
    filter_on: args.filter_on,
    phyla: JSON.stringify(helpers_taxa.get_all_phyla().sort()),

  })
}


router.get('/reset_ttable', function tax_table_reset(req, res) {
  //console.log('in RESET-session')
  req.session.ttable_filter = helpers_taxa.get_default_tax_filter()
  res.redirect('back');
})
router.get('/tax_table', function tax_table_get(req, res) {
  console.log('in TT get')
  let filter, send_list

  //console.log('get-session ',req.session.ttable_filter)
  // QUESTION - Should filter hold through EVERYTHING?
  filter = helpers_taxa.get_default_tax_filter()
  req.session.ttable_filter = filter
  // if(req.session.ttable_filter){
  //         //console.log('filetr session')
  //         filter = req.session.ttable_filter
  //     }else{
  //         //console.log('filetr from default')
  //         filter = helpers_taxa.get_default_tax_filter()
  //         req.session.ttable_filter = filter
  //     }

  send_list = helpers_taxa.apply_ttable_filter(req, filter)
  //console.log('LENGTH',send_list.length)
  //let big_tax_list0 = Object.values(C.taxon_lookup);
  //let specific = send_list.filter(item => (item.otid == '209'))
  //console.log('sendlist209',specific)
  //let big_tax_list = big_tax_list0.filter(item => C.tax_status_on.indexOf(item.status.toLowerCase()) !== -1 )
  let count_text = 'Number of Records Found: ' + send_list.length.toString()
  //console.log('statusfltr',filter)
  let args = { filter: filter, send_list: send_list, count_txt: count_text, filter_on: helpers_taxa.get_filter_on(filter) }

  renderTaxonTable(req, res, args)

})

router.post('/tax_table', function tax_table_post(req, res) {
  console.log('in TT post')
  //console.log(req.body)
  let send_list
  helpers_taxa.set_ttable_session(req)
  //console.log('ttable_session',req.session.ttable_filter)
  let filter = req.session.ttable_filter
  //console.log('filter1',filter)
  send_list = helpers_taxa.apply_ttable_filter(req, filter)

  let count_text = 'Number of Records Found: ' + send_list.length.toString()
  //console.log('filter2',filter)
  let args = { filter: filter, send_list: send_list, count_txt: count_text, filter_on: helpers_taxa.get_filter_on(filter) }

  renderTaxonTable(req, res, args)

})
router.get('/advanced_taxtable_search', function advanced_taxtable_search(req, res) {
  res.render('pages/taxa/tax_table_filter_advanced', {
    title: 'HOMD :: Taxon Search',
    pgname: '', // for AbountThisPage
    config: JSON.stringify(CFG),
    ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version, tax_ver: C.homd_taxonomy_version }),

  })

})
//
//
// router.get('/tax_hierarchy', function tax_hierarchy(req, res) {
//   //the json file was created from a csv of vamps taxonomy
//   // using the script: taxonomy_csv2json.py in ../homd_data
// 
// 
//   res.render('pages/taxa/taxhierarchy', {
//     title: 'HOMD :: Taxon Hierarchy',
//     pgname: 'taxon/hierarchy', // for AbountThisPage
//     config: JSON.stringify(CFG),
//     data: {},
//     //dhtmlx: JSON.stringify(C.dhtmlxTreeData),
//     ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version, tax_ver: C.homd_taxonomy_version }),
// 
//   })
// })
// // test: choose custom taxonomy, show tree
// router.get('/taxhierarchy_autoload', function taxhierarchy_autoload(req, res) {
//   //console.log('IN tax_autoload')
//   //console.log('req.query',req.query)
//   let cts, lineage, options_obj
//   //let myurl = url.parse(req.url, true);
//   let id = req.query.id;
//   let count_type = req.query.ct
//   //console.log('id',id)
//   //console.log('count_type',count_type)
//   let json = {};
//   json.id = id;
//   json.item = [];
// 
//   if (parseInt(id) === 0) {
//     C.homd_taxonomy.taxa_tree_dict_map_by_rank["domain"].map(node => {
//       //console.log('node1',node)
//       lineage = helpers_taxa.make_lineage(node)  // [str obj]
//       cts = helpers_taxa.get_counts(lineage[0], count_type).txt
//       //console.log(node)
//       options_obj = get_options_by_node(node);
//       options_obj.text = options_obj.text + ' ' + cts
//       options_obj.checked = true;
//       //console.log(options_obj)
//       json.item.push(options_obj);
//     }
//     );
//   } else {
//     if (id > 1000) {
//       //return
//     }
//     const objects_w_this_parent_id = C.homd_taxonomy.taxa_tree_dict_map_by_id[id].children_ids.map(n_id => C.homd_taxonomy.taxa_tree_dict_map_by_id[n_id]);
//     objects_w_this_parent_id.map(node => {
//       //console.log('node2',node)
//       lineage = helpers_taxa.make_lineage(node)  // [str obj]
//       //console.log('lineage:',lineage)
//       cts = helpers_taxa.get_counts(lineage[0], count_type).txt
//       options_obj = get_options_by_node(node);
//       options_obj.text = options_obj.text + ' ' + cts
//       options_obj.checked = false;
//       json.item.push(options_obj);
//     })
//   }
//   //console.log(json)
//   //console.log('returning',json.item)
//   json.item.sort((a, b) => {
//     return helpers.compareStrings_alpha(a.text, b.text);
//   })
// 
//   //console.timeEnd("TIME: tax_custom_dhtmlx");
// 
//   res.send(json);
// })
router.get('/tax_hierarchy', function tax_hierarchy_GET(req, res) {
  console.log('GET Hierarchy')
  let lineage
  let bnode = C.homd_taxonomy.taxa_tree_dict_map_by_name_n_rank['Bacteria_domain']
  lineage = helpers_taxa.make_lineage(bnode)  // [str obj]
  let bcts = helpers_taxa.get_counts(lineage[0], '').lst
  let anode = C.homd_taxonomy.taxa_tree_dict_map_by_name_n_rank['Archaea_domain']
  lineage = helpers_taxa.make_lineage(anode)  // [str obj]
  let acts = helpers_taxa.get_counts(lineage[0], '').lst
  let base_counts = helpers_taxa.get_counts('Bacteria', 'both')
  res.render('pages/taxa/taxhierarchy', {
    title: 'HOMD :: Taxon Hierarchy',
    pgname: 'taxon/hierarchy', // for AbountThisPage
    config: JSON.stringify(CFG),
    data: {},
    bcounts: JSON.stringify(bcts),
    acounts: JSON.stringify(acts),
    //dhtmlx: JSON.stringify(C.dhtmlxTreeData),
    ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version, tax_ver: C.homd_taxonomy_version }),

  })
})
router.post('/tax_hierarchy_level', (req, res) => {
  let requested_rank = req.body.rank;
  let html_obj = { ahtml: '', bhtml: '' }
  let node, anode, bnode

  let done = false
  //console.log('anode',anode)
  //Archaea node
  anode = C.homd_taxonomy.taxa_tree_dict_map_by_name_n_rank['Archaea_domain']
  for (let n in anode.children_ids) {
    node = C.homd_taxonomy.taxa_tree_dict_map_by_id[anode.children_ids[n]]
    html_obj.ahtml += get_hierarchy_html(node, requested_rank)
  }
  //Bacteria node
  bnode = C.homd_taxonomy.taxa_tree_dict_map_by_name_n_rank['Bacteria_domain']
  for (let n in bnode.children_ids) {
    node = C.homd_taxonomy.taxa_tree_dict_map_by_id[bnode.children_ids[n]]
    //console.log('mynode1',node)
    html_obj.bhtml += get_hierarchy_html(node, requested_rank)
  }

  //console.log(html_obj.bhtml)

  res.send(JSON.stringify(html_obj));
})

function get_hierarchy_html(node, requested_rank) {
  //console.log('mynode2',node)
  if (C.ranks.indexOf(node.rank) > C.ranks.indexOf(requested_rank)) {
    return ""
  }
  let done = false
  let html = '', child_name, child_rank, id, display_rank, encoded_child_name, cts, cnode
  let green_colors = ['#9FD4A3', '#AEDCAE', '#BEE3BA', '#CDEBC5', '#DDF2D1', '#ECFADC']
  child_name = node.taxon
  let lineage = helpers_taxa.make_lineage(node)  // [str obj]
  cts = helpers_taxa.get_counts(lineage[0], '').lst
  encoded_child_name = encodeURIComponent(node.taxon)
  //console.log('encoded name',encoded_child_name)
  child_rank = node.rank
  let ospace = '&nbsp;', space
  let num = C.ranks.indexOf(child_rank) + 1
  space = ospace.repeat(num * 2)
  if (child_rank === 'klass') {
    display_rank = 'Class'
  } else {
    display_rank = helpers.capitalizeFirst(child_rank)
  }
  id = child_name + '_' + child_rank
  html += '<ul>'
  html += "<li class='tax-item'>"
  if (node.children_ids.length === 0) {

    let hmt = helpers.make_otid_display_name(node.otid)
    let hmt_lnk = "<a href='tax_description?otid=" + node.otid + "'>" + hmt + "</a>"
    if (child_rank === 'species') {
      html += space + "<span class='otid-link-sp' nowrap><small>" + display_rank + ":</small> <i>" + child_name + "</i> (" + hmt_lnk + ")"
      html += " <a title='Genome Count' href='/genome/genome_table?otid="+node.otid+"' class='pill pill-orange' style='color:blue;text-decoration: underline;'>&nbsp;" + cts.genome_counts + "&nbsp;</a>"
      html += " <a title='RefSeq Count' href='/refseq/refseq_tree?otid="+node.otid+"' class='pill pill-khaki' target='_blank' style='color:blue;text-decoration: underline;'>&nbsp;" + cts.refseq_counts + "&nbsp;</a>"
      html += " </span>"
    } else {  //subspecies SAME html (could be combined)
      //console.log('Not Used::SSpecies')
      html += space + "<span class='otid-link-ssp' nowrap><small>" + display_rank + ":</small> <i>" + child_name + "</i> (" + hmt_lnk + ")"
      html += " <a title='Genome Count' href='/genome/genome_table?otid="+node.otid+"' class='pill pill-orange' style='color:blue;text-decoration: underline;'>&nbsp;" + cts.genome_counts + "&nbsp;</a>"
      html += " <a title='RefSeq Count' href='/refseq/refseq_tree?otid="+node.otid+"' class='pill pill-khaki' target='_blank' style='color:blue;text-decoration: underline;'>&nbsp;" + cts.refseq_counts + "&nbsp;</a>"
      html += " </span>"
    }
  } else {
    node.children_ids.sort((a, b) => {
      let xnode = C.homd_taxonomy.taxa_tree_dict_map_by_id[a]
      let ynode = C.homd_taxonomy.taxa_tree_dict_map_by_id[b]
      return helpers.compareStrings_alpha(xnode.taxon, ynode.taxon);
    })
    if (node.rank === requested_rank) {
      html += space + "<a onclick=get_leaf('" + encoded_child_name + "','" + child_rank + "')"
      html += "    role='button'"
      html += "    type='button'"
      html += "    style='background:" + green_colors[C.ranks.indexOf(node.rank) - 1] + ";'"
      html += "    class='btn btn-sm'>"

      if (child_rank === 'species') {
        //console.log('node.rank',node.rank,C.ranks.indexOf(node.rank),green_colors[C.ranks.indexOf(node.rank)-1])
        html += "    <small>" + display_rank + ':</small> <i>' + child_name + "</i>"
      } else {
        html += "    <small>" + display_rank + ':</small> ' + child_name
      }

      html += " <span title='Taxon Count' class='pill pill-indigo'>" + cts.tax_counts + "</span>"
      html += " <span title='Genome Count' class='pill pill-orange'>" + cts.genome_counts + "</span>"
      html += " <span title='RefSeq Count' class='pill pill-khaki'>" + cts.refseq_counts + "</span>"
      html += '</a>'

      html += " <span id='" + id + "_span' class='fa_widget'><i class='fa-solid fa-angle-right'></i></span>"
      html += "<div id='" + id + "_div'></div>"


    } else {
      html += space + "<a onclick=get_leaf('" + encoded_child_name + "','" + child_rank + "')"
      html += "    role='button'"
      html += "    type='button'"
      html += "    style='background:" + green_colors[C.ranks.indexOf(child_rank) - 1] + ";'"
      html += "    class='btn btn-sm'>"

      if (child_rank === 'species') {
        html += "    <small>" + display_rank + ':</small> <i>' + child_name + "</i>"
      } else {
        html += "    <small>" + display_rank + ':</small> ' + child_name
      }

      html += " <span title='Taxon Count'  class='pill pill-indigo'>" + cts.tax_counts + "</span>"
      html += " <span title='Genome Count' class='pill pill-orange'>" + cts.genome_counts + "</span>"
      html += " <span title='RefSeq Count' class='pill pill-khaki'>" + cts.refseq_counts + "</span>"
      html += '</a>'
      html += " <span id='" + id + "_span' class='fa_widget'><i class='fa-solid fa-angle-down'></i></span>"


      html += "<div id='" + id + "_div'>"
      for (let n in node.children_ids) {
        cnode = C.homd_taxonomy.taxa_tree_dict_map_by_id[node.children_ids[n]]
        html += get_hierarchy_html(cnode, requested_rank)
        //console.log(requested_rank,node.rank)
      }
      html += "</div>"
    }
  }
  html += '</li>'
  html += '</ul>'

  return html

}

router.post('/tax_hierarchy', function tax_hierarchy_POST(req, res) {
  //console.log('POST Hierarchy')
  //console.log('req.body',req.body)
  let tax_name = req.body.name
  let rank = req.body.rank;
  let html = '', node, child_name, child_rank, id, display_rank, encoded_child_name, cts, lineage
  let ospace = '&nbsp;', space
  let num = C.ranks.indexOf(rank) + 1
  space = ospace.repeat(num * 2)
  //let green_colors = ['#316764','#497F76','#609687','#78AE99','#8FC5AA','#A7DDBC']
  let green_colors = ['#9FD4A3', '#AEDCAE', '#BEE3BA', '#CDEBC5', '#DDF2D1', '#ECFADC']
  let pnode = C.homd_taxonomy.taxa_tree_dict_map_by_name_n_rank[tax_name + '_' + rank]
  //console.log('parent-node',pnode)
  let children_ids = pnode.children_ids

  // sort ids by node.taxon??
  children_ids.sort((a, b) => {
    let xnode = C.homd_taxonomy.taxa_tree_dict_map_by_id[a]
    let ynode = C.homd_taxonomy.taxa_tree_dict_map_by_id[b]
    return helpers.compareStrings_alpha(xnode.taxon, ynode.taxon);
  })
  for (let n in children_ids) {
    node = C.homd_taxonomy.taxa_tree_dict_map_by_id[children_ids[n]]

    child_name = node.taxon
    encoded_child_name = encodeURIComponent(node.taxon)
    //console.log('encoded name',encoded_child_name)
    child_rank = node.rank
    if (child_rank === 'klass') {
      display_rank = 'Class'
    } else {
      display_rank = helpers.capitalizeFirst(child_rank)
    }
    lineage = helpers_taxa.make_lineage(node)  // [str obj]
    cts = helpers_taxa.get_counts(lineage[0], '').lst
    if (node.children_ids.length === 0) {
      //otid = node.otid
      //let lineage = helpers_taxa.make_lineage(node) 
      //console.log('lin',lineage[0])

      html += '<ul>'
      html += "<li class='tax-item'>"
      let hmt = helpers.make_otid_display_name(node.otid)
      let hmt_lnk = "<a href='tax_description?otid=" + node.otid + "'>" + hmt + "</a>"
      if (child_rank === 'species') {
        html += space + "<span class='otid-link-sp' nowrap><small>" + display_rank + ":</small> <i>" + child_name + "</i> (" + hmt_lnk + ")"
        html += " <a title='Genome Count' href='/genome/genome_table?otid="+node.otid+"' class='pill pill-orange' style='color:blue;text-decoration: underline;'>&nbsp;" + cts.genome_counts + "&nbsp;</a>"
        html += " <a title='RefSeq Count' href='/refseq/refseq_tree?otid="+node.otid+"' class='pill pill-khaki' target='_blank' style='color:blue;text-decoration: underline;'>&nbsp;" + cts.refseq_counts + "&nbsp;</a>"
        html += "</span>"
      } else {
        // child name needs to be species + subspecies
        //console.log('mynode',node)
        let parent_taxon = C.homd_taxonomy.taxa_tree_dict_map_by_id[node.parent_id].taxon
        html += space + "<span class='otid-link-ssp' nowrap><small>" + display_rank + ":</small> <i>" + parent_taxon + '</i> ' + child_name + " (" + hmt_lnk + ")"
        html += " <a title='Genome Count' href='/genome/genome_table?otid="+node.otid+"' class='pill pill-orange' style='color:blue;text-decoration: underline;'>&nbsp;" + cts.genome_counts + "&nbsp;</a>"
        html += " <a title='RefSeq Count' href='/refseq/refseq_tree?otid="+node.otid+"' class='pill pill-khaki' target='_blank' style='color:blue;text-decoration: underline;'>&nbsp;" + cts.refseq_counts + "&nbsp;</a>"
        html += "</span>"
      }

      html += '</li>'
      html += '</ul>'
    } else {


      //console.log('node',node,'cts',cts)
      //console.log('sent node',node)

      id = child_name + '_' + child_rank

      html += '<ul>'
      html += "<li class='tax-item'>"
      html += space + "<a onclick=get_leaf('" + encoded_child_name + "','" + child_rank + "')"
      html += "    role='button'"
      html += "    type='button'"
      html += "    style='background:" + green_colors[C.ranks.indexOf(rank)] + ";'"
      html += "    class='btn btn-sm'>"
      if (child_rank === 'species') {
        html += "    <small>" + display_rank + ':</small> <i>' + child_name + "</i>"
      } else {
        html += "    <small>" + display_rank + ':</small> ' + child_name
      }
      html += " <span title='Taxon Count' class='pill pill-indigo'>" + cts.tax_counts + "</span>"
      html += " <span title='Genome Count' class='pill pill-orange'>" + cts.genome_counts + "</span>"
      html += " <span title='RefSeq Count' class='pill pill-khaki'>" + cts.refseq_counts + "</span>"
      html += '</a>'
      html += " <span id='" + id + "_span' class='fa_widget'><i class='fa-solid fa-angle-right'></i></span>"
      html += "<div  id='" + id + "_div'></div>"
      html += '</li>'
      html += '</ul>'
      //console.log('myhtlml',html)
    }
  }
  res.send(html)
})
router.get('/tax_level', function tax_level_get(req, res) {

  res.render('pages/taxa/taxlevel', {
    title: 'HOMD :: Taxon Level',
    pgname: 'taxon/level', // for AbountThisPage
    config: JSON.stringify(CFG),
    level: 'domain',
    //oral: oral,
    ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version, tax_ver: C.homd_taxonomy_version }),

  })
})
//
//
router.post('/tax_level', function tax_level_post(req, res) {
  console.log('in taxlevel POST')
  helpers.print(req.body)

  let rank = req.body.rank
  let count_type = req.body.count_type
  //let count_type = 'both'

  const tax_resp = []
  fs.readFile(path.join(CFG.PATH_TO_DATA, C.taxcounts_fn), 'utf8', function readTaxCountsFile(err, data) {
    if (err) {
      console.log(err)
      return
    }


    let taxdata = JSON.parse(data);
    //console.log('taxdata ',taxdata)
    C.homd_taxonomy.taxa_tree_dict_map_by_rank[rank].map(taxitem => {
      // get lineage of taxitem

      let lineage = [taxitem.taxon]

      let new_search_id = taxitem.parent_id
      //let new_search_rank = C.ranks[C.ranks.indexOf(taxitem.rank)-1]
      //console.log(new_search_id,new_search_rank)
      while (new_search_id !== 0) {
        let new_search_item = C.homd_taxonomy.taxa_tree_dict_map_by_id[new_search_id]

        lineage.unshift(new_search_item.taxon)  // adds to front of lineage array -prepends
        new_search_id = new_search_item.parent_id

      }
      let return_obj = {}
      return_obj.item_rank = rank

      if (rank === 'species' || rank === 'subspecies') {
        //console.log('rank '+rank+' = '+taxitem.otid)
        return_obj.otid = taxitem.otid
        // console.log('species')
        //          // here we 'fix' the species to exclude the genus so that
        //          // the whole lineage can be used as an index for the counts
        //          genus = lineage[lineage.length - 2]
        //          species = lineage[lineage.length - 1]
        //          new_sp = species.replace(genus,'')
        //          lineage[lineage.length - 1] = new_sp.trim()

      }
      return_obj.item_taxon = lineage[lineage.length - 1]
      return_obj.parent_rank = C.ranks[C.ranks.indexOf(rank) - 1]
      return_obj.parent_taxon = lineage[lineage.length - 2]
      //console.log(rank,lineage)
      if (lineage.length === C.ranks.indexOf(rank) + 1) {
        let lineage_str = lineage.join(';')
        //console.log(lineage_str)
        if (taxdata.hasOwnProperty(lineage_str)) {
          // console.log(lineage_str)
          //                 console.log(taxdata[lineage_str].taxcnt)
          //                 console.log(taxdata[lineage_str].gcnt)
          //                 console.log(taxdata[lineage_str].refcnt)
          if (count_type === 'wdropped') {
            return_obj.tax_count = taxdata[lineage_str].taxcnt + taxdata[lineage_str].taxcnt_wdropped
            return_obj.gne_count = taxdata[lineage_str].gcnt + taxdata[lineage_str].gcnt_wdropped
            return_obj.rrna_count = taxdata[lineage_str].refcnt + taxdata[lineage_str].refcnt_wdropped
          } else {
            return_obj.tax_count = taxdata[lineage_str].taxcnt
            return_obj.gne_count = taxdata[lineage_str].gcnt
            return_obj.rrna_count = taxdata[lineage_str].refcnt
          }
        } else {
          return_obj.tax_count = 0
          return_obj.gne_count = 0
          return_obj.rrna_count = 0
          return_obj.lineage = ''
        }
      } else {
        return_obj.tax_count = 0
        return_obj.gne_count = 0
        return_obj.rrna_count = 0
        return_obj.lineage = ''
      }
      tax_resp.push(return_obj)
      return return_obj

    })
    if (rank === 'domain') {
      //sort by domain only
      tax_resp.sort((a, b) => {
        return helpers.compareStrings_alpha(a.item_taxon, b.item_taxon);
      })
    } else {
      // sort by parent then item
      tax_resp.sort((a, b,) => {
        return helpers.compareByTwoStrings_alpha(a, b, 'parent_taxon', 'item_taxon');
      })
    }

    //console.log(tax_resp)

    //res.send(JSON.stringify(tax_resp));
    res.send(JSON.stringify([count_type, tax_resp]));
  })
})
//
router.post('/oral_counts_toggle', function oral_counts_toggle(req, res) {
  // NO USED!!!
  let oral = req.body.oral

  helpers.print(['oral ', oral])

  res.send({ ok: 'ok' })

})

/////////////////////////////////
function renderTaxonDescription(req, res, args) {
  //console.log('args',args)
  res.render('pages/taxa/taxdesc', {
    title: 'HOMD :: Taxon Info',
    pgname: 'taxon/description', // for AbountThisPage
    config: JSON.stringify(CFG),
    ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version, tax_ver: C.homd_taxonomy_version }),


    otid: args.otid,
    image_array: JSON.stringify(args.image_array),
    data1: JSON.stringify(args.data1),
    msg: args.msg,
    text_file: args.text_file,   // only 666 so far
    tinfo: JSON.stringify(args.tinfo),  // description 
    lin: JSON.stringify(args.lin),  // lineage domain=>subspecies
    data4: JSON.stringify(args.data4),  // publications
    refseq_info: JSON.stringify(args.refseq_info), // refseq, seqname, strain , genbank
    links: JSON.stringify(args.links),
    sites: JSON.stringify(args.sites),
    gtdb: JSON.stringify(args.gtdbtax),
    otid_has_abundance: args.otid_has_abundance,
    //lineage: args.lineage_string,

  })
}
function get_taxon_refseq(q) {
  return new Promise((resolve, reject) => {
    TDBConn.query(q, (err, refseq_rows) => {
      if (err) {
        console.log(err)
        reject(err)
      } else {
        //console.log('refseq',refseq_rows)
        resolve(refseq_rows)
      }

    })
  })
}
function get_taxon_info(q) {
  return new Promise((resolve, reject) => {
    TDBConn.query(q, (err, taxon_info_rows) => {
      if (err) {
        console.log(err)
        reject(err)
      } else {
        //console.log('taxon_info',taxon_info)
        let taxon_info = taxon_info_rows[0]
        if (taxon_info_rows.length === 0) {
          taxon_info = []
        }
        resolve(taxon_info)
      }
    })
  })
}
function get_taxon_pangenomes(q) {
  let pangenomes = []
  return new Promise((resolve, reject) => {
    TDBConn.query(q, (err, pangenome_rows) => {
      if (err) {
        console.log(err)
        reject(err)
      } else {
        //console.log('pangenome_rows',pangenome_rows)
        for (let n in pangenome_rows) {
          pangenomes.push(pangenome_rows[n].pangenome)
        }
        resolve(pangenomes)
      }

    })
  })
}
function get_gtdb_taxonomy(q) {
  let gtdbtax = {}
  return new Promise((resolve, reject) => {
    TDBConn.query(q, (err, rows) => {
      if (err) {
        console.log(err)
        reject(err)
      } else {
        //console.log('pangenome_rows',pangenome_rows)
        for (let n in rows) {
          gtdbtax[rows[n].genome_id] = rows[n].GTDB_taxonomy
        }
        resolve(gtdbtax)
      }

    })
  })
}
//router.get('/tax_description', function tax_description(req, res){
router.get('/tax_description', async function tax_description(req, res) {
  // let myurl = url.parse(req.url, true);
  //helpers.print(['pre data1',C.taxon_lookup[389]])
  let otid = req.query.otid.replace(/^0+/, '')   // remove leading zeros
  let lookup_data = {}, data4, refseq = [], links = {}, sites = ''
  if (otid && req.session.ttable_filter) {
    req.session.ttable_filter.otid = otid
  }
  if (req.query.gid && req.session.gtable_filter) {
    req.session.gtable_filter.gid = req.query.gid
  }
  /*
  This busy page needs:
  1  otid     type:string
  2  status
  3  reference strains vs strain info  type:array
    Why do some pages have ref and others straininfo?
  4  Tax classification  data3 type strings
  5  16S rRNA Reference Seqs
  6  Abundance
  7  Hierarchy Structure -- what is this?
  8  body site
  9  synonyms type:array
  10 NCBI taxid
  11 PubMed, Entrez Nucleotide and Proten Searches -- links(uses genus+species)
  12 Genome Sequence  - needs genome count and otid
  13 Ref Data: General,Citations,Pheno,Cultivability,Pevalence...
  */
  /*
  Link Exceptions
  105   Peptostreptococcaceae [XI][G-1] [Eubacterium] infirmum  
  467   Peptostreptococcaceae [XI][G-1] [Eubacterium] sulci 
759 Peptostreptococcaceae [XI][G-5] [Eubacterium] saphenum  
673 Peptostreptococcaceae [XI][G-6] [Eubacterium] minutum   
694 Peptostreptococcaceae [XI][G-6] [Eubacterium] nodatum   
557 Peptostreptococcaceae [XI][G-9] [Eubacterium] brachy    

106 Peptostreptococcaceae [XI][G-7] [Eubacterium] yurii subsp. schtitka
377 Peptostreptococcaceae [XI][G-7] [Eubacterium] yurii subsps. yurii & margaretiae

  
  */
  let lineage = C.taxon_lineage_lookup[otid]
  //console.log('lin',lineage)
  let text_file = get_rank_text('species', '', otid)
  if (C.dropped_taxids.indexOf(otid) !== -1) {
    //helpers.print(data1)
    // DROPPED
    lookup_data = C.taxon_lookup[otid]
    let hmt = 'HMT-' + ("000" + otid).slice(-3)
    let message = "This TaxonID (" + hmt + ") has been Dropped.<br>Reason: " + lookup_data.notes
    //let dropped_notes = "This taxon has been dropped from HOMD<br>Reason: "+data1.notes
    //data1.notes= "This taxon has been dropped from HOMD<br>Reason: "+data1.notes
    //data3 = get_special_lineage_from_db(otid)
    let q = queries.get_lineage_query(otid)  // dont need query 
    console.log('lineage', q)
    console.log('C.taxon_lineage_lookup', C.taxon_lineage_lookup[otid])
    TDBConn.query(q, (err, rows) => {
      if (err) { console.log(err); return }
      //console.log('data1',data1)

      //console.log('rows',rows)
      let lineage = rows[0]  // NEED because dropped are not in C.taxon_lineage_lookup
      links['lpsnlink'] = helpers_taxa.get_lpsn_outlink1(lookup_data, lineage)
      //console.log(links)

      sites = ''
      if (otid in C.site_lookup && 's1' in C.site_lookup[otid]) {
        sites = 'Primary: ' + C.site_lookup[otid]['s1']
        if (C.site_lookup[otid]['s2']) {
          sites += '<br>Secondary: ' + C.site_lookup[otid]['s2']
        }
        if (C.site_lookup[otid]['notes']) {
          sites += '<br><small>Note: ' + C.site_lookup[otid]['notes'] + '</small>'
        }
      }

      //DROPPED-DROPPED-DROPPED-DROPPED-DROPPED-DROPPED
      //DROPPED-DROPPED-DROPPED-DROPPED-DROPPED-DROPPED
      //DROPPED-DROPPED-DROPPED-DROPPED-DROPPED-DROPPED
      //DROPPED-DROPPED-DROPPED-DROPPED-DROPPED-DROPPED
      //args = {filter:filter, send_list: send_list, count_txt: count_txt, pd:page_data, filter_on: get_filter_on(filter,'genome')}
      let args = { otid: otid }
      args.image_array = []
      args.data1 = lookup_data
      args.data1.pangenomes = []
      args.msg = message
      args.text_file = text_file[0]
      args.tinfo = {}
      args.gtdbtax = {}
      args.lin = lineage
      args.data4 = {}
      args.refseq_info = {}
      args.links = links
      args.sites = sites
      args.otid_has_abundance = false
      //args.lineage = lineage_string
      renderTaxonDescription(req, res, args)
    })
    return
  }

  if (C.taxon_lookup[otid] === undefined) {

    res.send('That Taxon ID: (' + otid + ') was not found1 - Use the Back Arrow and select another')
    return
  }

  // TODO use query here instead of data1,data2....
  // 
  lookup_data = C.taxon_lookup[otid]

  if (otid in C.link_exceptions) {
    links = C.link_exceptions[otid]
  } else {
    links = { 'ncbilink': lookup_data.genus + '-' + lookup_data.species, 'gcmlink': lookup_data.genus + '%20' + lookup_data.species }
    links['lpsnlink'] = helpers_taxa.get_lpsn_outlink1(lookup_data, lineage)
  }
  //links.anviserver_link       = CFG.ANVIO_URL  //https://anvio.homd.org/anvio?pg=Mitis_Group
  links.anviserver_link = CFG.ANVIO_URL //https://vamps.mbl.edu/anviserver/pangenomes/Mitis_Group
  let otid_has_abundance = false
  if (C.otids_w_abundance.indexOf(otid) !== -1) {
    otid_has_abundance = true
  }
  //console.log('389')
  //console.log(C.taxon_references_lookup['389'])
  if (C.taxon_references_lookup[otid]) {
    data4 = C.taxon_references_lookup[otid]
  } else {
    console.warn('No taxon_references for HMT:', otid, 'in C.taxon_references_lookup')
    data4 = {}
  }
  let image_array = find_otid_images('species', otid)
  //refseq = {}
  //info = {'general':'','cultavability':'','prevalence':'','disease_associations':'','phenotypic':''}  // unique per otid
  //counts = 
  let q_refseq_metadata = queries.get_refseq_metadata_query(otid)    // dont need query 
  let q_info = queries.get_taxon_info_query(otid)
  let q_pangenome = queries.get_pangenomes_query(otid)
  let q_gtdb_tax = queries.get_gtdb_tax(lookup_data.genomes)
  //console.log(q_refseq_metadata)
  //console.log(q_info)
  console.log(q_pangenome)
  refseq = await get_taxon_refseq(q_refseq_metadata)
  const info = await get_taxon_info(q_info)
  const pangenomes = await get_taxon_pangenomes(q_pangenome)
  const gtdbtax = await get_gtdb_taxonomy(q_gtdb_tax)
  console.log('pg', pangenomes)
  //console.log('gtdb',gtdbtax)
  //https://medium.com/@amymurphy_40966/node-mysql-chained-promises-vs-async-await-9d0c8e8f5ee1
  Promise.all([refseq, info, pangenomes]).then((results) => {
    if (otid in C.site_lookup && 's1' in C.site_lookup[otid]) {
      sites = 'Primary: ' + C.site_lookup[otid]['s1']
      // = Object.values(C.site_lookup[otid]).join('<br>')
      if (C.site_lookup[otid]['s2'] && C.site_lookup[otid]['s2'] !== 'Unassigned') {
        sites += '<br>Secondary: ' + C.site_lookup[otid]['s2']
      }
      if (C.site_lookup[otid]['ref_link']) {
        let ref_link_lst = C.site_lookup[otid]['ref_link'].split(';')  //.split(/\s+/)
        sites += "<br><small>Reference(s):"
        for (let i in ref_link_lst) {
          sites += "<br>&nbsp;&nbsp;&nbsp;&nbsp;<a href='" + ref_link_lst[i].trim() + "' target='_blank'>" + ref_link_lst[i].trim() + '</a>'
        }
        sites += '</small>'
      }
      if (C.site_lookup[otid]['notes']) {
        sites += '<br><small>Note: ' + C.site_lookup[otid]['notes'] + '</small>'
      }
    }
    let args = { otid: otid }
    args.image_array = image_array
    args.data1 = lookup_data
    // add pangenomes
   console.log('refseq',refseq)
    args.data1.pangenomes = pangenomes
    helpers.print(pangenomes)
    helpers.print(['lookup_data', args.data1])
    args.msg = lookup_data.notes
    args.text_file = text_file[0]
    args.tinfo = info
    args.gtdbtax = gtdbtax
    args.data4 = data4
    args.refseq_info = refseq
    args.links = links
    args.sites = sites
    args.otid_has_abundance = otid_has_abundance

    //args.lineage = lineage_string
    args.lin = lineage
    renderTaxonDescription(req, res, args)


  });
  return
  //     TDBConn.query(q_refseq_metadata, (err, refseq_rows) => {
  //         //console.log('refseq',refseq_rows)
  //         refseq = refseq_rows
  //         
  //         TDBConn.query(q_info, (err, taxon_info_rows) => {  // picks-up notes and general,prev,cult
  //             taxon_info = taxon_info_rows[0]
  //             if(taxon_info_rows.length == 0){
  //                taxon_info = []
  //             }
  //             
  //             //console.log('info rows',taxon_info)
  //             
  //             
  //   
  // 
  //             
  //             
  //             //pangenomes
  //             //links.anviserver_link = C.anviserver_link
  //             
  //             // console.log('sites',C.site_lookup[otid])
  //             
  //             
  //           
  //          let args = {otid:otid}
  //          args.image_array = image_array
  //          args.data1 = lookup_data
  //          args.msg = lookup_data.notes
  //          args.text_file = text_file[0]
  //          args.tinfo = taxon_info
  //          
  //          args.data4 = data4
  //          args.refseq_info = refseq
  //          args.links = links
  //          args.sites = sites
  //          args.otid_has_abundance = otid_has_abundance
  //          
  //          //args.lineage = lineage_string
  //          args.lin = lineage
  //          
  //          
  //          
  //          renderTaxonDescription(req, res, args)
  //          return
  //          //  res.render('pages/taxa/taxdesc', {
  // //             title: 'HOMD :: Taxon Info', 
  // //             pgname: 'taxon/description', // for AbountThisPage
  // //             config: JSON.stringify(CFG),
  // //             otid: otid,
  // //             //pids: pid_list,
  // //             image_array:JSON.stringify(image_array),
  // //             data1: JSON.stringify(lookup_data),
  // //             msg: lookup_data.notes,
  // //             text_file: text_file[0],   // only 666 so far
  // //             tinfo: JSON.stringify(taxon_info),
  // //             lin: JSON.stringify(lineage),
  // //             data4: JSON.stringify(data4),
  // //             refseq_info: JSON.stringify(refseq),
  // //             links: JSON.stringify(links),
  // //             sites: JSON.stringify(sites),
  // //             otid_has_abundance:otid_has_abundance,
  // //             ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version, tax_ver: C.homd_taxonomy_version }),
  // //             
  // //           })
  //       })  // end refseq query
  //   })  // end info query
})


router.post('/get_refseq', function get_refseq(req, res) {
  helpers.print(req.body)
  let refseq_id = req.body.refseqid;
  let html

  //The 16S sequence pulled from the taxon page should be seq_trim9, which is longest.
  let q = queries.get_refseq_query(refseq_id)
  helpers.print(q)
  TDBConn.query(q, (err, rows) => {
    //console.log(rows)
    if (!rows || rows.length === 0) {
      html = 'No Seq Found'
    } else {
      let seqstr = rows[0].seq.toString()
      let arr = helpers.chunkSubstr(seqstr, 80)
      html = arr.join('<br>')
    }
    res.send(html)
  })
})




router.get('/life', function life(req, res) {

  //console.log('in LIFE')
  // let myurl = url.parse(req.url, true);
  let tax_name = req.query.name;
  //console.log('tax_name1',tax_name)
  if (tax_name) {
    tax_name = helpers.ltrim(helpers.rtrim(tax_name, '"'), '"')
  }
  //console.log('tax_name1a',tax_name)
  let rank = (req.query.rank)
  //console.log('rank',rank)
  let lin, lineage_string, otid
  if (req.query.otid && req.session.ttable_filter) {
    //console.log('got otid for ttable')
    req.session.ttable_filter.otid = req.query.otid
  }
  if (req.query.gid && req.session.gtable_filter) {
    //console.log('got otid for ttable')
    req.session.gtable_filter.gid = req.query.gid
  }
  //console.log('rank:',rank)
  //console.log('tax_name',tax_name)
  if (tax_name) {
    //tax_name = req.query.name.replace(/"/g,'')
  }
  let image_array = [], text = ''
  if (rank) {
    image_array = find_life_images(rank, tax_name)
    text = get_rank_text(rank, tax_name)
  }

  //console.log('TEXT',text)
  let taxa_list = []
  let next_rank, title, show_ranks, rank_id, last_rank, space, childern_ids, html, taxon, rank_display
  let lineage_list = ['']

  //next_rank = C.ranks[C.ranks.indexOf(rank) +1]

  html = ''
  let cts = ''
  if (!rank) {  // Cellular_Organisims
    //taxa_list = C.homd_taxonomy.taxa_tree_dict_map_by_rank['domain'].map(a => a.taxon)
    next_rank = 'domain'

    html += "<tr><td class='life-taxa-name'>&nbsp;Domains</td><td class='life-taxa'>"

    title = 'Domain: Archaea'
    cts = C.taxon_counts_lookup['Archaea'].taxcnt.toString()
    html += "<a title='" + title + "' href='life?rank=domain&name=\"Archaea\"'>Archaea</a> <small>(" + cts + ")</small>"
    html += "<span class='vist-taxon-page'>" //[<a href='https://lpsn.dsmz.de/domain/Archaea' target='_blank'>LPSN.dsmz.de</a>]"

    html += "<a href='ecology?rank=domain&name=Archaea'>abundance</a></span><br>"
    title = 'Domain: Bacteria'
    cts = C.taxon_counts_lookup['Bacteria'].taxcnt.toString()
    html += "<a title='" + title + "' href='life?rank=domain&name=\"Bacteria\"'>Bacteria</a> <small>(" + cts + ")</small>"
    html += "<span class='vist-taxon-page'>" //[<a href='https://lpsn.dsmz.de/domain/Bacteria' target='_blank'>LPSN.dsmz.de</a>]"

    html += "<a href='ecology?rank=domain&name=Bacteria'>abundance</a></span><br>"

    html += '</td></tr>'
    image_array = [{ name: 'cellular_organisms.png', text: '' }]
  } else {
    console.log('tax_name2', tax_name + '_' + rank)
    let node = C.homd_taxonomy.taxa_tree_dict_map_by_name_n_rank[tax_name + '_' + rank]
    if (!node) {
      console.log('taxnode error:', tax_name + '_' + rank)
    }
    lineage_list = helpers_taxa.make_lineage(node)  // [str obj]

    rank_id = C.ranks.indexOf(rank) + 2
    show_ranks = C.ranks.slice(0, rank_id)
    helpers.print(['node', node])
    console.log('show_ranks', show_ranks)
    last_rank = show_ranks[show_ranks.length - 1]

    space = '&nbsp;'
    for (let i in show_ranks) {

      rank_display = get_rank_display(show_ranks[i], false)

      if (show_ranks[i] !== last_rank) {  // Last row of many items

        node = C.homd_taxonomy.taxa_tree_dict_map_by_name_n_rank[lineage_list[1][show_ranks[i]] + '_' + show_ranks[i]]
        lin = helpers_taxa.make_lineage(node)
        //console.log('lin',lin)
        cts = C.taxon_counts_lookup[lin[0]].taxcnt.toString()

        title = rank_display + ': ' + lineage_list[1][show_ranks[i]]
        console.log('show_ranks[i]', show_ranks[i])
        if (rank === show_ranks[i]) {
          html += "<tr><td class='life-taxa-name selected'>" + space + rank_display + "</td><td class='life-taxa'>"
        } else {
          html += "<tr><td class='life-taxa-name'>" + space + rank_display + "</td><td class='life-taxa'>"
        }
        if (show_ranks[i] === 'species') {
          html += "<a title='" + title + "' href='life?rank=" + show_ranks[i] + "&name=\"" + lineage_list[1][show_ranks[i]] + "\"'><em>" + lineage_list[1][show_ranks[i]] + '</em></a> (' + cts + ')'
        } else {
          html += "<a title='" + title + "' href='life?rank=" + show_ranks[i] + "&name=\"" + lineage_list[1][show_ranks[i]] + "\"'>" + lineage_list[1][show_ranks[i]] + '</a> (' + cts + ')'
        }

        html += "<span class='vist-taxon-page'>" //[<a href='https://lpsn.dsmz.de/"+lpsn_link+"' target='_blank'>LPSN.dsmz.de</a>]"
        html += "<a href='ecology?rank=" + show_ranks[i] + "&name=" + lineage_list[1][show_ranks[i]] + "'>abundance</a></span>"
        html += '</td></tr>'
      } else {  // Gather rows before the last row

        next_rank = C.ranks[C.ranks.indexOf(rank) + 1]
        childern_ids = C.homd_taxonomy.taxa_tree_dict_map_by_name_n_rank[tax_name + '_' + rank].children_ids

        for (let n in childern_ids) {
          taxon = C.homd_taxonomy.taxa_tree_dict_map_by_id[childern_ids[n]].taxon
          taxa_list.push(taxon)
        }
        let use_plural = false;
        if (taxa_list.length > 1) {
          use_plural = true;
        }
        rank_display = get_rank_display(show_ranks[i], use_plural)
        //console.log('rank_displayx',rank_display)

        html += "<tr><td class='life-taxa-name'>" + space + rank_display + "</td><td class='life-taxa blue'>"
        taxa_list.sort((a, b) => {
          return helpers.compareStrings_alpha(a, b);
        })
        for (let n in taxa_list) {
          //console.log('SHOW RANKS',show_ranks.length)
          title = rank_display + ': ' + taxa_list[n]
          html += "<li>"
          if (rank === 'genus') {

            childern_ids = C.homd_taxonomy.taxa_tree_dict_map_by_name_n_rank[taxa_list[n] + '_' + 'species'].children_ids
            if (childern_ids.length > 0) {  // only if subspecies
              //Bacteria;Firmicutes;Bacilli;Lactobacillales;Streptococcaceae;Streptococcus;Streptococcus oralis;
              //console.log('childern_ids-2')
              html += "<span class=''>" + space + "<a title='" + title + "' href='life?rank=" + next_rank + "&name=\"" + taxa_list[n] + "\"'>" + taxa_list[n] + '</a><br>'
              html += "</span>"
            } else {
              otid = C.homd_taxonomy.taxa_tree_dict_map_by_name_n_rank[taxa_list[n] + '_' + 'species'].otid
              //console.log('otid',otid)
              html += "<span class=''>" + space + '<em>' + taxa_list[n] + "</em> (<a title='" + title + "' href='tax_description?otid=" + otid + "'>" + helpers.make_otid_display_name(otid) + '</a>)'
              html += "</span>"

              html += " <span class='vist-taxon-page'>" //[<a href='https://lpsn.dsmz.de/"+lpsn_link+"' target='_blank'>LPSN.dsmz.de</a>]"
              html += "<a href='ecology?rank=" + show_ranks[i] + "&name=" + taxa_list[n] + "'>abundance</a></span><br>"
            }

          } else {
            if (rank === 'species') {
              //display will be subspecies
              //console.log('taxa_list[n]',taxa_list[n])
              //console.log('taxa_list[n]2',C.homd_taxonomy.taxa_tree_dict_map_by_name_n_rank[taxa_list[n]+'_'+'subspecies'])
              otid = C.homd_taxonomy.taxa_tree_dict_map_by_name_n_rank[taxa_list[n] + '_' + 'subspecies'].otid

              html += "<span class=''>" + space + taxa_list[n] + "  </span>(<a title='" + title + "' href='tax_description?otid=" + otid + "'>" + helpers.make_otid_display_name(otid) + '</a>)<br>'
            } else {
              // list of not genus or species 
              node = C.homd_taxonomy.taxa_tree_dict_map_by_name_n_rank[taxa_list[n] + '_' + next_rank]
              lin = helpers_taxa.make_lineage(node)
              cts = C.taxon_counts_lookup[lin[0]].taxcnt.toString()
              html += "<span class=''>" + space + "<a title='" + title + "' href='life?rank=" + next_rank + "&name=\"" + taxa_list[n] + "\"'>" + taxa_list[n] + '</a> <small>(' + cts + ')</small>'
              html += "</span>"
              // let lpsn_rank = show_ranks[i]
              //              if(show_ranks[i] == 'klass'){
              //                lpsn_rank = 'class'
              //              }
              //console.log('show_ranks[i]',lin[1])

              //let lpsn_link = helpers.get_lpsn_outlink2(show_ranks[i],lineage_list[1],taxa_list[n])
              //let lpsn_link = 'zz'
              //console.log('zz link ',lpsn_link)
              html += "<span class='vist-taxon-page'>" //[<a href='https://lpsn.dsmz.de/"+lpsn_link+"' target='_blank'>LPSN.dsmz.de</a>]"
              html += "<a href='ecology?rank=" + show_ranks[i] + "&name=" + taxa_list[n] + "'>abundance</a></span><br>"
            }
          }
          html += "</li>"
        }
        html += '</td></tr>'
      }
      space += '&nbsp;'
    }

  }

  //console.log('regex1',lineage_list[0].replace(/.*(;)/,'<em>'))+'</em>'
  //console.log('regex2',lineage_list[0].split(';').pop())
  //console.log('regex3',lineage_list[0].split(';').slice(0,-1).join('; ') +'; <em>'+lineage_list[0].split(';').pop()+'</em>')
  let page_title = 'Life'
  if (rank)
    page_title = helpers.capitalizeFirst(rank)

  lineage_string = lineage_list[0]

  res.render('pages/taxa/life', {
    title: 'HOMD :: ' + page_title,
    pgname: 'taxon/life', // for AbountThisPage
    config: JSON.stringify(CFG),
    data: {},
    tax_name: tax_name,
    //headline: 'Life: Cellular Organisms',
    rank: rank,
    taxa_list: JSON.stringify(taxa_list),
    image_array: JSON.stringify(image_array),
    text_file: text[0],
    text_format: text[1],
    html: html,
    lineage: lineage_string,
    ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version, tax_ver: C.homd_taxonomy_version }),

  })

})
//
router.get('/ecology_home', function ecology_home(req, res) {
  //console.log('in ecology index')
  let bar_graph_data = []
  let site_species = {}, sp_per_site = {}// {site,sp,abund} ordered by sp
  // let graph_site_order = C.base_abundance_order
  //     graph_site_order.push('NS')
  //     console.log('PUSH',C.base_abundance_order,graph_site_order)
  let abundance_graph_order = C.base_abundance_order
  
  let archlin = helpers_taxa.make_lineage(C.homd_taxonomy.taxa_tree_dict_map_by_otid_n_rank['815_species'])
  
  let sole_arch = archlin[1]
  let phyla_obj = C.homd_taxonomy.taxa_tree_dict_map_by_rank['phylum']
  let class_obj = C.homd_taxonomy.taxa_tree_dict_map_by_rank['klass']
  let order_obj = C.homd_taxonomy.taxa_tree_dict_map_by_rank['order']
  let family_obj = C.homd_taxonomy.taxa_tree_dict_map_by_rank['family']
  let genus_obj = C.homd_taxonomy.taxa_tree_dict_map_by_rank['genus']
  // let species_obj = C.homd_taxonomy.taxa_tree_dict_map_by_rank['species']
  let group_collector = {}
  //let species_for_plot = C.plot_species_colors.map(el => el.name)
  //let otids_for_plot = C.plot_species_colors.map(el => el.otid)
  let otids_for_plot = Object.keys(C.plot_species_colors)



  let species_for_plot = [] // list of species (and ssp)
  for (let n in otids_for_plot) {
    //console.log(otids_for_plot[n])
    let sp = C.taxon_lineage_lookup[parseInt(otids_for_plot[n])].species
    if (C.taxon_lineage_lookup[otids_for_plot[n]].subspecies) {
      sp += ' ' + C.taxon_lineage_lookup[otids_for_plot[n]].subspecies
    }
    species_for_plot.push(sp)

    //console.log('otids_for_plot[n]',n,otids_for_plot[n])

    //console.log(C.homd_taxonomy.taxa_tree_dict_map_by_otid_n_rank[otids_for_plot[n]+'_species'])
    // let obj = C.homd_taxonomy.taxa_tree_dict_map_by_otid_n_rank
    //          
    //          if(obj.hasOwnProperty(otids_for_plot[n]+'_subspecies')){
    //              
    //              let parent_id = obj[otids_for_plot[n]+'_subspecies'].parent_id
    //              let ssp_taxon = obj[otids_for_plot[n]+'_subspecies'].taxon
    //              let parent_taxon = C.homd_taxonomy.taxa_tree_dict_map_by_id[parent_id].taxon
    //              //console.log('SSP TAXON',parent_taxon +'-'+ssp_taxon)
    //              species_for_plot.push(parent_taxon +' '+ssp_taxon)
    //              
    //          }else{
    //              if(obj.hasOwnProperty(otids_for_plot[n]+'_species')){
    //                 species_for_plot.push(obj[otids_for_plot[n]+'_species'].taxon)
    //              }
    //          }
    //tmp_sp.push(C.homd_taxonomy.taxa_tree_dict_map_by_otid_n_rank[otids_for_plot[n]+'_species'].taxon)
  }

  species_for_plot.push('other')
  //console.log('species_for_plot',species_for_plot)
  //let colors_for_plot = C.plot_species_colors //.map(el => {el.color, el.species})
  let colors_for_plot = Object.values(C.plot_species_colors) // [{}]
  //let colors_for_plot_lookup = {}

  //console.log('colors_for_plot',colors_for_plot)
  colors_for_plot.push('grey')
  //console.log('colors_for_plot',colors_for_plot)
  //let spcount = 0
  let abund_obj
  for (let n in abundance_graph_order) {
    //console.log('graph_site_order',graph_site_order[n])
    //other_collector[graph_site_order[n]] = 0.0
  }
  let site_sums = {}
  for (let y in abundance_graph_order) {
    site_sums[abundance_graph_order[y]] = 0.0
  }
  //console.log(site_sums)
  for (let i in species_for_plot) {
    //console.log('species_for_plot[i]',species_for_plot[i])
    let node = C.homd_taxonomy.taxa_tree_dict_map_by_name_n_rank[species_for_plot[i] + '_species']
    let lineage_list = helpers_taxa.make_lineage(node)
    if (!lineage_list[0]) {
      // must be ssp
      let pts = species_for_plot[i].split(/\s/)
      node = C.homd_taxonomy.taxa_tree_dict_map_by_name_n_rank[pts[pts.length - 1] + '_subspecies']
      lineage_list = helpers_taxa.make_lineage(node)

    }
    //console.log('lineage_list[0]',lineage_list)
    if (lineage_list[0]) {
      abund_obj = get_site_avgs(C.taxon_counts_lookup[lineage_list[0]], 'species')
      //console.log('abund_obj',species_for_plot[i],abund_obj)
      for (let site in abund_obj) {
        //console.log('n',sp,site,abund_obj[site])
        site_sums[site] += parseFloat(abund_obj[site])
      }
      group_collector[lineage_list[0]] = {}
      group_collector[lineage_list[0]] = abund_obj
    } else {
      //console.log('NONO',species_for_plot[i])
    }

  }

  group_collector['other'] = {}
  for (let y in abundance_graph_order) {
    //console.log(graph_site_order[y],site_sums)
    group_collector['other'][abundance_graph_order[y]] = (100 - site_sums[abundance_graph_order[y]]).toFixed(3)
    site_species[abundance_graph_order[y]] = []
  }

  //https://observablehq.com/@d3/stacked-normalized-horizontal-bar

  //console.log('site_order',site_order)
  let tmp, sp
  for (let n in abundance_graph_order) {//Object.keys(C.abundance_names)){
    let site = abundance_graph_order[n]
    //console.log('site',site)
    tmp = {}
    tmp['site'] = site
    sp_per_site[site] = {}
    for (let species in group_collector) {
      //console.log('sp',species,group_collector[species])
      let sp_pts = species.split(';')
      if (sp_pts.length === 8) {  // subsp
        sp = sp_pts[sp_pts.length - 2] + ' ' + sp_pts[sp_pts.length - 1]
      } else {
        sp = sp_pts[sp_pts.length - 1]
      }

      //let abund = parseFloat(group_collector[species][site])
      //let c = group_collector[species].color
      // let obj = C.plot_species_colors.find(o => o.name === sp);
      //             if(!obj){
      //                color = 'grey'
      //             }else{
      //                 color = obj.color
      //             }
      //tmp[sp] = {abundance:abund,color:colors_for_plot[species_for_plot.indexOf(sp)]}
      tmp[sp] = parseFloat(group_collector[species][site])
      //tmp[sp] = {abundance:abund,color:color}
      //console.log('sp',sp)
      //xconsole.log('val',val)
      //sp_per_site[site][sp] = abund  // {site,sp,sp,sp,sp,sp....}

      //console.log('sp',sp,'color',colors_for_plot[species_for_plot.indexOf(sp)])

      //site_species[site].push({site:site, species:sp, abundance:abund, color:colors_for_plot[species_for_plot.indexOf(sp)]})
      //site_species[site][sp] = 
    }
    //console.log('tmp',tmp)
    bar_graph_data.push(tmp)

  }

  //console.log('bar_graph_data',bar_graph_data.length)


  let bac_phyla_only = phyla_obj.filter((x) => {
    if (C.homd_taxonomy.taxa_tree_dict_map_by_id[x.parent_id].taxon === 'Bacteria') {
      return x
    }
  })
  let bac_classes_only = class_obj.filter((x) => {
    if (x.taxon !== sole_arch['klass']) {
      return x
    }
  })
  let bac_orders_only = order_obj.filter((x) => {
    if (x.taxon !== sole_arch['order']) {
      return x
    }
  })
  let bac_families_only = family_obj.filter((x) => {
    if (x.taxon !== sole_arch['family']) {
      return x
    }
  })
  let bac_genera_only = genus_obj.filter((x) => {
    if (x.taxon !== sole_arch['genus']) {
      return x
    }
  })
  let phyla = bac_phyla_only.map(x => x.taxon)
  let klasses = bac_classes_only.map(x => x.taxon)
  let orders = bac_orders_only.map(x => x.taxon)
  let families = bac_families_only.map(x => x.taxon)
  let genera = bac_genera_only.map(x => x.taxon)

  phyla.sort()
  klasses.sort()
  orders.sort()
  families.sort()
  genera.sort()
  //console.log('bar_graph_data',bar_graph_data)
  res.render('pages/taxa/ecology_home', {
    title: 'HOMD :: Ecology',
    pgname: 'taxon/ecology', // for AbountThisPage
    config: JSON.stringify(CFG),
    ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version, tax_ver: C.homd_taxonomy_version }),

    sole_arch: JSON.stringify(sole_arch),
    phyla: JSON.stringify(phyla),
    klasses: JSON.stringify(klasses),
    orders: JSON.stringify(orders),
    families: JSON.stringify(families),
    genera: JSON.stringify(genera),

    colors_ordered_list: JSON.stringify(colors_for_plot),
    species_ordered_list: JSON.stringify(species_for_plot),

    //bar_data1: JSON.stringify(sp_per_site),
    bar_data2: JSON.stringify(bar_graph_data),
    //site_species: JSON.stringify(site_species),
    site_order: JSON.stringify(abundance_graph_order),
    ab_names: JSON.stringify(C.abundance_names)

  })
})
//
router.get('/body_sites', function body_sites(req, res) {
  //console.log('in body sites')

  let send_list = [], obj, selected_otid = ''
  if (req.query && req.query.otid) {
    selected_otid = req.query.otid
  }

  //for(let otid in C.site_lookup){

  for (let otid in C.taxon_lookup) {
    obj = {}
    //console.log(C.taxon_lookup[otid])
    //console.log(otid)
    obj.otid = otid

    if (C.dropped_taxids.indexOf(otid) !== -1) {
      obj.s1 = 'Unassigned'
      obj.s2 = ''

      obj.notes = ''
      obj.gsp = C.taxon_lookup[otid].genus + ' ' + C.taxon_lookup[otid].species + ' (<b>DROPPED</b>)'
    } else if (otid in C.site_lookup) {
      obj.s1 = C.site_lookup[otid].s1
      if (C.site_lookup[otid].s2 === 'Unassigned') {
        obj.s2 = ''
      } else {
        obj.s2 = C.site_lookup[otid].s2
      }

      obj.note = C.site_lookup[otid].notes
      obj.gsp = C.taxon_lookup[otid].genus + ' ' + C.taxon_lookup[otid].species
    } else {
      obj.s1 = 'Unassigned'
      obj.s2 = ''

      obj.note = 'Missing From Database (C.site_lookup)'
      obj.gsp = C.taxon_lookup[otid].genus + ' ' + C.taxon_lookup[otid].species
    }
    obj.naming_status = C.taxon_lookup[otid].naming_status
    obj.cultivation_status = C.taxon_lookup[otid].cultivation_status

    send_list.push(obj)
  }
  //console.log(send_list )
  send_list.sort((b, a) => {
    return helpers.compareStrings_alpha(b.gsp, a.gsp);
  })

  res.render('pages/taxa/body_sites', {
    title: 'HOMD :: Body Sites',
    pgname: '', // for AbountThisPage
    config: JSON.stringify(CFG),
    ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version, tax_ver: C.homd_taxonomy_version }),

    sites: JSON.stringify(send_list),
    selected: selected_otid

  })
})
//router.get('/ecology/:level/:taxname', function ecology(req, res) {
router.get('/ecology', function ecology(req, res) {
  helpers.print('in ecology new')
  helpers.accesslog(req, res)
  let rank = req.query.rank;
  let tax_name = req.query.name
  //let target = 'ecology_lollipop'
  let page = 'lollipop'


  //console.log('target',target,req.query.page)
  if (req.query.otid && req.session.ttable_filter) {
    //console.log('got otid for ttable')
    req.session.ttable_filter.otid = req.query.otid
  }
  //let tax_name = req.params.name
  //console.log('req.params',req)
  //console.log(C.homd_taxonomy.taxa_tree_dict_map_by_rank['subspecies'])
  //console.log('rank',rank,'tax',tax_name)
  if (rank !== 'subspecies') {
    tax_name = tax_name[0].toUpperCase() + tax_name.substring(1); // string[0].toUpperCase() + string.substring(1)
  }
  //let segata_text = '',dewhirst_text='',erenv1v3_text='';
  //console.log('rank',rank,'tax',tax_name)
  let dewhirst_notes = '', erenv1v3_notes = '', erenv3v5_notes = '', hmp_metaphlan_notes = '', hmp_refseqv1v3_notes = '', hmp_refseqv3v5_notes = '';
  //let max = 0;
  let otid = '0';
  //let max_obj = {};
  //let major_genera=0;
  //let segata_data={},dewhirst_data={},erenv1v3_data={},erenv3v5_data={};
  let dewhirst_data = {}, erenv1v3_data = {}, erenv3v5_data = {}, hmp_metaphlan_data = {}, hmp_refseqv1v3_data = {}, hmp_refseqv3v5_data = {};
  //let segata_max=0,dewhirst_max=0,erenv1v3_max=0,erenv3v5_max=0;
  let dewhirst_max = 0, erenv1v3_max = 0, erenv3v5_max = 0, hmp_metaphlan_max = 0, hmp_refseqv1v3_max = 0, hmp_refseqv3v5_max = 0;
  //let erenv1v3_table='',erenv3v5_table='',dewhirst_table='',segata_table='';
  let erenv1v3_table = '', erenv3v5_table = '', dewhirst_table = '', hmp_metaphlan_table = '', hmp_refseqv1v3_table, hmp_refseqv3v5_table;
  //console.log('rank: '+rank+' name: '+tax_name);
  // TODO::should be in constants???
  let text = get_rank_text(rank, tax_name)

  let node = C.homd_taxonomy.taxa_tree_dict_map_by_name_n_rank[tax_name + '_' + rank]
  //console.log(tax_name+'_'+rank,node)
  if (!node) {
    console.log('ERROR - could not find node for', tax_name + '_' + rank)
  }
  let genera = get_major_genera(rank, node)
  // sort genera list 
  genera.sort((a, b) => {
    return helpers.compareStrings_alpha(a.taxon, b.taxon);
  })
  //console.log(tax_name,rank,node)
  if (rank === 'species') {
    if (node.hasOwnProperty('otid')) {
      otid = node.otid
    }
  } else if (rank === 'subspecies') {
    //console.log(node)
    otid = node.otid
  }
  //console.log('node',node)
  //console.log(node)
  // /subspecies/subsp.%20dentisani%20clade%20058
  //console.log(node)
  let children_list = []
  for (let i in node.children_ids) { // must sort?? by getting list of nodes=>sort=>then create list
    let n = C.homd_taxonomy.taxa_tree_dict_map_by_id[node.children_ids[i]]
    //children.push(helpers.clean_rank_name_for_show(n.rank)+': '+n.taxon)
    children_list.push("<a href='/taxa/ecology?rank=" + n.rank + "&name=" + n.taxon + "&page=" + page + "'>" + helpers_taxa.clean_rank_name_for_show(n.rank) + ":" + n.taxon + "</a>")
  }

  if (!node) {
    console.log('ERROR Node')
  }
  //console.log('node',node)
  let lineage_list = helpers_taxa.make_lineage(node)
  //console.log(C.taxon_counts_lookup)
  if (!lineage_list[0]) {
    lineage_list[0] = ''
    console.log('ERROR Lineage')
  } else {
    if (lineage_list[0] in C.taxon_counts_lookup) {

      if ('dewhirst' in C.taxon_counts_lookup[lineage_list[0]] && Object.keys(C.taxon_counts_lookup[lineage_list[0]]['dewhirst']).length !== 0) {
        dewhirst_max = C.taxon_counts_lookup[lineage_list[0]]['max_dewhirst']
        //console.log('in Dewhirst')
        dewhirst_data = Object.values(C.taxon_counts_lookup[lineage_list[0]]['dewhirst'])
        dewhirst_data = sort_obj_by_abundance_order(dewhirst_data, C.dewhirst_abundance_order)
        // order by constants.dewhirst_abundance_order
        let clone_dewhirst_data = JSON.parse(JSON.stringify(dewhirst_data)) // clone to avoid difficult errors
        dewhirst_table = build_abundance_table('dewhirst', clone_dewhirst_data, C.dewhirst_abundance_order)
        if ('dewhirst' in C.taxon_counts_lookup[lineage_list[0]]['notes']) {
          dewhirst_notes = C.taxon_counts_lookup[lineage_list[0]]['notes']['dewhirst']
        }
      }
      if ('eren_v1v3' in C.taxon_counts_lookup[lineage_list[0]] && Object.keys(C.taxon_counts_lookup[lineage_list[0]]['eren_v1v3']).length !== 0) {
        erenv1v3_max = C.taxon_counts_lookup[lineage_list[0]]['max_erenv1v3']
        erenv1v3_data = Object.values(C.taxon_counts_lookup[lineage_list[0]]['eren_v1v3'])
        erenv1v3_data = sort_obj_by_abundance_order(erenv1v3_data, C.eren_abundance_order)
        // order by constants.eren_abundance_order
        let clone_eren_data = JSON.parse(JSON.stringify(erenv1v3_data)) // clone to avoid difficult errors
        //helpers.print(C.taxon_counts_lookup[lineage_list[0]])
        erenv1v3_table = build_abundance_table('eren_v1v3', clone_eren_data, C.eren_abundance_order)
        if ('eren_v1v3' in C.taxon_counts_lookup[lineage_list[0]]['notes']) {
          erenv1v3_notes = C.taxon_counts_lookup[lineage_list[0]]['notes']['eren_v1v3']
        }
      }
      if ('eren_v3v5' in C.taxon_counts_lookup[lineage_list[0]] && Object.keys(C.taxon_counts_lookup[lineage_list[0]]['eren_v3v5']).length !== 0) {
        erenv3v5_max = C.taxon_counts_lookup[lineage_list[0]]['max_erenv3v5']
        erenv3v5_data = Object.values(C.taxon_counts_lookup[lineage_list[0]]['eren_v3v5'])

        erenv3v5_data = sort_obj_by_abundance_order(erenv3v5_data, C.eren_abundance_order)
        //console.log('eren3v5-sorted',erenv3v5_data)
        let clone_eren_data = JSON.parse(JSON.stringify(erenv3v5_data)) // clone to avoid difficult errors
        //helpers.print(C.taxon_counts_lookup[lineage_list[0]])
        erenv3v5_table = build_abundance_table('eren_v3v5', clone_eren_data, C.eren_abundance_order)
        if ('eren_v3v5' in C.taxon_counts_lookup[lineage_list[0]]['notes']) {
          erenv3v5_notes = C.taxon_counts_lookup[lineage_list[0]]['notes']['eren_v3v5']
        }
      }
      if ('hmp_metaphlan' in C.taxon_counts_lookup[lineage_list[0]] && Object.keys(C.taxon_counts_lookup[lineage_list[0]]['hmp_metaphlan']).length !== 0) {
        hmp_metaphlan_max = C.taxon_counts_lookup[lineage_list[0]]['max_hmp_metaphlan']
        hmp_metaphlan_data = Object.values(C.taxon_counts_lookup[lineage_list[0]]['hmp_metaphlan'])

        hmp_metaphlan_data = sort_obj_by_abundance_order(hmp_metaphlan_data, C.hmp_metaphlan_abundance_order)
        //console.log('eren3v5-sorted',erenv3v5_data)
        let clone_hmp_metaphlan_data = JSON.parse(JSON.stringify(hmp_metaphlan_data)) // clone to avoid difficult errors
        //helpers.print(C.taxon_counts_lookup[lineage_list[0]])
        hmp_metaphlan_table = build_abundance_table('hmp_metaphlan', clone_hmp_metaphlan_data, C.hmp_metaphlan_abundance_order)
        if ('hmp_metaphlan' in C.taxon_counts_lookup[lineage_list[0]]['notes']) {
          hmp_metaphlan_notes = C.taxon_counts_lookup[lineage_list[0]]['notes']['hmp_metaphlan']
        }
      }
      if ('hmp_refseq_v1v3' in C.taxon_counts_lookup[lineage_list[0]] && Object.keys(C.taxon_counts_lookup[lineage_list[0]]['hmp_refseq_v1v3']).length !== 0) {
        hmp_refseqv1v3_max = C.taxon_counts_lookup[lineage_list[0]]['max_hmp_refseq_v1v3']
        hmp_refseqv1v3_data = Object.values(C.taxon_counts_lookup[lineage_list[0]]['hmp_refseq_v1v3'])
        hmp_refseqv1v3_data = sort_obj_by_abundance_order(hmp_refseqv1v3_data, C.hmp_refseq_abundance_order)
        //console.log('eren3v5-sorted',erenv3v5_data)
        let clone_hmp_refseqv1v3_data = JSON.parse(JSON.stringify(hmp_refseqv1v3_data)) // clone to avoid difficult errors
        //helpers.print(C.taxon_counts_lookup[lineage_list[0]])
        hmp_refseqv1v3_table = build_abundance_table('hmp_refseqv1v3', clone_hmp_refseqv1v3_data, C.hmp_refseq_abundance_order)
        if ('hmp_refseq_v1v3' in C.taxon_counts_lookup[lineage_list[0]]['notes']) {
          hmp_refseqv1v3_notes = C.taxon_counts_lookup[lineage_list[0]]['notes']['hmp_refseq_v1v3']
        }
      }
      if ('hmp_refseq_v3v5' in C.taxon_counts_lookup[lineage_list[0]] && Object.keys(C.taxon_counts_lookup[lineage_list[0]]['hmp_refseq_v3v5']).length !== 0) {
        hmp_refseqv3v5_max = C.taxon_counts_lookup[lineage_list[0]]['max_hmp_refseq_v3v5']
        hmp_refseqv3v5_data = Object.values(C.taxon_counts_lookup[lineage_list[0]]['hmp_refseq_v3v5'])
        hmp_refseqv3v5_data = sort_obj_by_abundance_order(hmp_refseqv3v5_data, C.hmp_refseq_abundance_order)
        //console.log('eren3v5-sorted',erenv3v5_data)
        let clone_hmp_refseqv3v5_data = JSON.parse(JSON.stringify(hmp_refseqv3v5_data)) // clone to avoid difficult errors
        //helpers.print(C.taxon_counts_lookup[lineage_list[0]])
        hmp_refseqv3v5_table = build_abundance_table('hmp_refseqv3v5', clone_hmp_refseqv3v5_data, C.hmp_refseq_abundance_order)
        if ('hmp_refseq_v3v5' in C.taxon_counts_lookup[lineage_list[0]]['notes']) {
          hmp_refseqv3v5_notes = C.taxon_counts_lookup[lineage_list[0]]['notes']['hmp_refseq_v3v5']
        }
      }

    }
  }
  children_list.sort()
  //console.log('children_list',children_list)

  if (C.hmp_v3v5_to_suppress.indexOf(otid) !== -1) {
    hmp_refseqv3v5_notes = 'No data – the v3v5 region of the 16S rRNA gene does not distinguish this species from its close relatives.'
  }
  //console.log('hmp_refseqv1v3_notes',hmp_refseqv1v3_notes)
  //console.log('lineage_list',lineage_list)
  let lineage_string = helpers_taxa.make_lineage_string_with_links(lineage_list, 'ecology', page)
  //console.log('lineage_string',lineage_string)
  //console.log('data=>',erenv1v3_data,'<=data')
  //     console.log('dewhirst_notes',dewhirst_notes)
  //     console.log('erenv1v3_notes',erenv1v3_notes)
  //     console.log('erenv3v5_notes',erenv3v5_notes)
  //ecology?rank=genus&name=Fusobacterium
  //res.render('pages/taxa/ecology', {
  res.render('pages/taxa/ecology_lollipop', {
    title: 'HOMD ::' + rank + '::' + tax_name,
    pgname: 'taxon/ecology', // for AbountThisPage 
    config: JSON.stringify(CFG),
    tax_name: tax_name,
    //headline: 'Life: Cellular Organisms',
    lineage: lineage_string,
    lin: lineage_list[0],
    rank: rank,
    max: JSON.stringify({ 'hmp_refseqv1v3': hmp_refseqv1v3_max, 'hmp_refseqv3v5': hmp_refseqv3v5_max, 'hmp_metaphlan': hmp_metaphlan_max, 'dewhirst': dewhirst_max, 'erenv1v3': erenv1v3_max, 'erenv3v5': erenv3v5_max }),
    otid: otid,  // zero unless species (or subspecies)
    genera: JSON.stringify(genera),
    text_file: text[0],
    page: page,
    text_format: text[1],
    children: JSON.stringify(children_list),
    notes: JSON.stringify({ 'hmp_refseqv1v3': hmp_refseqv1v3_notes, 'hmp_refseqv3v5': hmp_refseqv3v5_notes, 'hmp_metaphlan': hmp_metaphlan_notes, 'dewhirst': dewhirst_notes, 'erenv1v3': erenv1v3_notes, 'erenv3v5': erenv3v5_notes }),

    dewhirst_table: dewhirst_table,
    erenv1v3_table: erenv1v3_table,
    erenv3v5_table: erenv3v5_table,
    hmp_metaphlan_table: hmp_metaphlan_table,
    hmp_refseqv1v3_table: hmp_refseqv1v3_table,
    hmp_refseqv3v5_table: hmp_refseqv3v5_table,
    //segata: JSON.stringify(segata_data),

    dewhirst: JSON.stringify(dewhirst_data),
    erenv1v3: JSON.stringify(erenv1v3_data),
    erenv3v5: JSON.stringify(erenv3v5_data),
    hmp_metaphlan: JSON.stringify(hmp_metaphlan_data),
    hmp_refseqv1v3: JSON.stringify(hmp_refseqv1v3_data),
    hmp_refseqv3v5: JSON.stringify(hmp_refseqv3v5_data),
    ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version, tax_ver: C.homd_taxonomy_version }),

    site_colors: JSON.stringify(C.abundance_site_colors),
  })
})
function sort_obj_by_abundance_order(obj, order) {
  let new_obj = []
  for (let n in order) {
    for (let j in obj) {
      if (obj[j].site === order[n]) {
        new_obj.push(obj[j])
      }
    }
  }
  return new_obj
}


//
router.get('/abundance_by_site/:rank', function abundance_by_site(req, res) {
  //console.log('in abundance_by_site')

  let rank = req.params.rank

  let node_list = C.homd_taxonomy.taxa_tree_dict_map_by_rank[rank]
  //let abund_refs = ['segata','eren_v1v3','eren_v3v5','dewhirst']
  let abund_sites = Object.keys(C.abundance_names)

  let group_collector = {}, top_ten = {}, node, lineage_list
  for (let i in node_list) {
    //console.log(phyla[p])
    node = node_list[i]
    lineage_list = helpers_taxa.make_lineage(node)
    //console.log('node',node)
    //console.log('rank',rank)
    //console.log('lineage_list-2',lineage_list)

    //let avg = get_site_avgs(C.taxon_counts_lookup[lineage_list[0]])
    //console.log('C.taxon_counts_lookup[lineage_list[0]]',C.taxon_counts_lookup[lineage_list[0]])
    group_collector[lineage_list[0]] = get_site_avgs(C.taxon_counts_lookup[lineage_list[0]], rank)

  }
  for (let i in abund_sites) {
    let site = abund_sites[i]
    top_ten[site] = get_sorted_abund_names(group_collector, site, rank, 10)
  }
  //console.log(top_ten)
  //const porder = [...C.base_abundance_order] //;.concat(['NS'])
  //porder.push('NS')
  //console.log(C.base_abundance_order,porder)
  res.render('pages/taxa/abundance_by_site', {
    title: 'HOMD ::Abundance by oral site',
    pgname: '', // for AbountThisPage 
    config: JSON.stringify(CFG),
    ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version, tax_ver: C.homd_taxonomy_version }),

    data: JSON.stringify(top_ten),
    plot_order: C.base_abundance_order,
    site_names: JSON.stringify(C.abundance_names),
    rank: rank
  })
})
//
router.get('/show_all_abundance/:site/:rank', function show_all_abundance(req, res) {
  //console.log('in show_all_abundance')
  let site = req.params.site
  let rank = req.params.rank
  //console.log('site2',site,'rank2',rank)
  let group = C.homd_taxonomy.taxa_tree_dict_map_by_rank[rank]
  let group_collector = {}, top_names, node, lineage_list, showrank
  if (rank === 'klass') {
    showrank = 'Class'
  } else {
    showrank = rank.charAt(0).toUpperCase() + rank.slice(1)
  }
  for (let i in group) {
    //console.log(phyla[p])
    node = group[i]
    lineage_list = helpers_taxa.make_lineage(node)
    //console.log('lineage_list3',lineage_list[0])
    group_collector[lineage_list[0]] = get_site_avgs(C.taxon_counts_lookup[lineage_list[0]], rank)
  }
  top_names = get_sorted_abund_names(group_collector, site, rank, 'all')
  //console.log(top_names)
  let count = 1
  let txt = `Oral Site: ${C.abundance_names[site]}<br><table border='1'>`
  txt += `<tr><td></td><td>Level: <b>${showrank}</b></td><td><b>% Abund</b></td></tr>`
  for (let i in top_names) {
    txt += '<tr><td>' + count.toString() + '</td>'
    if (rank === 'species') {
      txt += `<td><i>${top_names[i].name}</i></td>`
    } else {
      txt += `<td>${top_names[i].name}</td>`
    }
    txt += `<td>${top_names[i].value}</td></tr>`
    count += 1
  }
  txt += '</table>'
  res.send(txt)

})
//
router.get('/dropped', function dropped(req, res) {

  let q = queries.get_dropped_taxa()
  //console.log(q)
  TDBConn.query(q, (err, rows) => {
    if (err) {
      console.log("dropped select error-GET", err)
      return
    }
    res.render('pages/taxa/dropped', {
      title: 'HOMD :: Human Oral Microbiome Database',
      pgname: '', // for AbountThisPage
      pgtitle: 'Dropped Taxa Table',
      config: JSON.stringify(CFG),
      ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version, tax_ver: C.homd_taxonomy_version }),

      data: JSON.stringify(rows),
      row_count: rows.length,

    })
  })
})
router.get('/tree_d3', function tree_d3(req, res) {

  let unique_phyla_obj = {}
  let file_name = 'HOMD_16S_rRNA_RefSeq_V15.23.reroot.order.tre'
  //let file_name = 'HOMD_16S_rRNA_RefSeq_Tree_V16.tre'
  fs.readFile(path.join("public/" + file_name), 'utf8', function readTreeFile(err, data) {
    if (err) {
      console.log('xxx', err)
    } else {
      //let treedata = JSON.parse(data);
      let refseq_tree_lookup = {}
      for (let otid in C.refseq_lookup) {
        let hmt = 'HMT-' + ("000" + otid).slice(-3)
        //console.log(otid, C.refseq_lookup[otid], C.taxon_lineage_lookup[otid])
        for (let n in C.refseq_lookup[otid]) {

          refseq_tree_lookup[C.refseq_lookup[otid][n].refseqid] = {}
          refseq_tree_lookup[C.refseq_lookup[otid][n].refseqid].hmt = hmt
          if (C.taxon_lineage_lookup.hasOwnProperty(otid)) {
            unique_phyla_obj[C.taxon_lineage_lookup[otid].phylum] = 1
            refseq_tree_lookup[C.refseq_lookup[otid][n].refseqid].phylum = C.taxon_lineage_lookup[otid].phylum
            refseq_tree_lookup[C.refseq_lookup[otid][n].refseqid].species = C.taxon_lineage_lookup[otid].species.replace(/"/g, '')
            if (C.taxon_lineage_lookup[otid].subspecies) {
              refseq_tree_lookup[C.refseq_lookup[otid][n].refseqid].species = C.taxon_lineage_lookup[otid].species.replace(/"/g, '') + ' ' + C.taxon_lineage_lookup[otid].subspecies
            }
          } else {

            refseq_tree_lookup[C.refseq_lookup[otid][n].refseqid].phylum = 'Dropped'
            refseq_tree_lookup[C.refseq_lookup[otid][n].refseqid].species = C.taxon_lookup[otid].genus + ' ' + C.taxon_lookup[otid].species.replace(/"/g, '')
          }


          //refseq_tree_lookup[C.refseq_lookup[otid][n].refseqid].species = C.taxon_lineage_lookup[otid].species +' '+C.taxon_lineage_lookup[otid].subspecies
        }
      }
      let unique_phyla = Object.keys(unique_phyla_obj)
      let unique_phyla_sorted = unique_phyla.sort()
      unique_phyla_sorted.push('Dropped')
      //unique_phyla_obj['Dropped'] = 1
      //console.log(refseq_tree_lookup)


      res.render('pages/taxa/tree_d3', {
        title: 'HOMD :: tree',
        pgname: '', // for AbountThisPage
        pgtitle: 'D3 Tree',
        config: JSON.stringify(CFG),
        ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version, tax_ver: C.homd_taxonomy_version }),

        mdata: JSON.stringify(refseq_tree_lookup),
        tdata: JSON.stringify(data),
        uphyla: JSON.stringify(unique_phyla_sorted),
        fname: file_name

      })
    }
  })
})

////////////////////////////////////////////////////////////////////////////////////
/////////////////////// FUNCTIONS //////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
function get_rank_text(rank, tax_name, otid) {
  //console.log('xx',rank,tax_name,otid)
  let text = [false, false]
  if (rank === "genus") {
    if (C.names_w_text.genera.indexOf(tax_name) !== -1) {
      text[0] = 'genus/' + tax_name + '.ejs'
      //}else if(C.names_w_text.provisional_genera_v4.indexOf(tax_name) != -1){
    } else if (tax_name.includes('[')) {

      //console.log('GOT Provisional')
      //console.log(C.homd_taxonomy.taxa_tree_dict_map_by_name_n_rank[tax_name+'_genus'])
      let children_ids = C.homd_taxonomy.taxa_tree_dict_map_by_name_n_rank[tax_name + '_genus'].children_ids
      let num_species = children_ids.length
      //let children = []
      text[1] = tax_name + " is a provisionally named genus constructed to provide a"
      text[1] += " stably named reference for a currently unnamed taxon represented"
      text[1] += " by a set of 16S rRNA clones.  It contains " + num_species.toString() + " species:<br>"
      for (let n in children_ids) {
        text[1] += ' - ' + C.homd_taxonomy.taxa_tree_dict_map_by_id[children_ids[n]].taxon + '<br>'
      }

    }
  }
  if (rank === 'species') {
    if (C.names_w_text.species.indexOf(otid) !== -1) {
      return ['species/' + otid + '.ejs']
    }
  }
  return text
}
//
//
function get_sorted_abund_names(collector, site, rank, num_to_return) {

  let tmp1 = {}, tmp2 = []

  for (let taxname in collector) {
    tmp1 = {}
    //console.log('taxname',taxname)
    tmp1[taxname] = collector[taxname]
    tmp2.push(tmp1)
  }
  //console.log('tmp2-1',tmp2)
  let x = tmp2.map(el => {
    //console.log(Object.keys(el)[0])
    let obj = {}
    let name_ary = Object.keys(el)[0].split(';')
    obj['name'] = name_ary[name_ary.length - 1]
    obj['value'] = el[Object.keys(el)[0]][site]
    if (rank === 'species') {
      obj['otid'] = C.homd_taxonomy.taxa_tree_dict_map_by_name_n_rank[name_ary[name_ary.length - 1] + '_species'].otid
    }
    return obj
  })

  //sort by value
  if (num_to_return === 'all') {
    return sortByKeyDEC(x, 'value')
  } else {
    return sortByKeyDEC(x, 'value').slice(0, 10)
  }
}

function sortByKeyDEC(array, key) {
  return array.sort((a, b) => { return b[key] - a[key]; });
}
//
function get_site_avgs(obj, rank) {
  //console.log('\nin obj',obj)
  let return_obj = {}
  if (!obj) {
    return return_obj
  }

  let ref, site
  let abund_refs = C.abundance_refs
  //let abund_refs = ['dewhirst']
  //let abund_sites = ['BM','KG','HP','TD','PT','TH','SV','SupP','SubP','ST','NS']
  let abund_sites = Object.keys(C.abundance_names)
  //console.log('obj',obj)
  let counter_per_site = {}
  for (let i in abund_sites) {
    site = abund_sites[i]
    counter_per_site[site] = 0
    return_obj[abund_sites[i]] = 0
  }

  for (let n in abund_refs) {
    ref = abund_refs[n]

    for (let i in abund_sites) {
      site = abund_sites[i]

      if (obj.hasOwnProperty(ref) && (Object.keys(obj[ref]).indexOf(site) !== -1)) {
        //console.log('found site',site, 'adding',parseFloat(obj[ref][site].avg))
        return_obj[site] += parseFloat(obj[ref][site].avg)
        counter_per_site[site] += 1

      } else {
        //console.log('excluding',ref,site)
      }
    }

  }
  //constants.base_abundance_order X2    = ['AKE','ANA','BMU','HPA','LAF','LRC','MVA','PFO','PTO','RAF','RRC','SAL','STO','SUBP','SUPP','THR','TDO','VIN']
  //constants.eren_abundance_order X2    = ['AKE',      'BMU','HPA',                        'PTO',            'SAL','STO','SUBP','SUPP','THR','TDO']
  //constants.dewhirst_abundance_order X1 = ['AKE','ANA','BMU','HPA',                        'PTO',            'SAL',      'SUBP','SUPP','THR','TDO']

  //console.log('counter SV',counter_per_site['SV'])
  //console.log('countSV',count,return_obj)
  let result
  for (let site in return_obj) {
    if (['AKE', 'BMU', 'HPA', 'PTO', 'SAL', 'SUBP', 'SUPP', 'THR', 'TDO'].indexOf(site) !== -1) {
      // divide by 5
      result = (return_obj[site] / 5).toFixed(3)  // divide by 5
      return_obj[site] = result
    } else if (site === 'STO') {
      // divide by 4
      result = (return_obj[site] / 4).toFixed(3)  // divide by 4 a
      return_obj[site] = result
    } else if (site === 'ANA') {
      // divide by 3
      result = (return_obj[site] / 3).toFixed(3)  // divide by 3
      return_obj[site] = result
    } else {  //#7
      //divide by 2
      result = (return_obj[site] / 2).toFixed(3)  // divide by 2
      return_obj[site] = result
    }

    //let result = (return_obj[site] / counter_per_site[site]).toFixed(3)
    // if(site == 'NS'){   // only Dewhirst
    //             let result = (return_obj[site]).toFixed(3)  // divide by 1 ONLY Dewhirst
    //             return_obj[site] = result 
    //           }else if(rank === 'species'){  //only dewhirst and erinx2
    //             let result = (return_obj[site] / 3).toFixed(3)  // divide by 4 a
    //             return_obj[site] = result 
    //           }else{
    //             let result = (return_obj[site] / 4).toFixed(3)  // divide by 4 a
    //             return_obj[site] = result 
    //           }

    // }else{
    //               return_obj[site] = '0.000'
    //           }

  }

  //console.log('avg return SubP',return_obj['SubP'])
  //console.log('avg return SV',return_obj['SV'])
  //console.log('')
  return return_obj
}
function get_rank_display(rank, use_plural) {
  let display_name = 'not_working'
  if (use_plural) {
    if (rank === 'domain') {
      display_name = 'Domains'
    } else if (rank === 'phylum') {
      display_name = 'Phyla'
    } else if (rank === 'klass') {
      display_name = 'Classes'
    } else if (rank === 'order') {
      display_name = 'Orders'
    } else if (rank === 'family') {
      display_name = 'Families'
    } else if (rank === 'genus') {
      display_name = 'Genera'
    } else if (rank === 'species') {
      display_name = 'Species'
    } else if (rank === 'subspecies') {
      display_name = 'Subspecies/Clade'
    }
  } else {
    if (rank === 'klass') {
      display_name = 'Class'

    } else {
      display_name = helpers.capitalizeFirst(rank)
    }
  }

  return display_name

}


////////////
// function make_lineage(node){
//     //console.log('in lineage-node',node)
//     if(!node){
//        return ['',{}]
//     }
//     let lineage =''
//     let lineage_obj = {}
//     let tax_obj = C.homd_taxonomy.taxa_tree_dict_map_by_id
//     if(node.parent_id == 0){
//         lineage = node.taxon
//         lineage_obj.domain = node.taxon
//     }else if(node.rank==='phylum'){
//         let dn = C.homd_taxonomy.taxa_tree_dict_map_by_id[node.parent_id]
//         lineage = dn.taxon+';'+node.taxon
//         lineage_obj.domain = dn.taxon
//         lineage_obj.phylum = node.taxon
//     }else if(node.rank==='klass' || node.rank==='class'){
//         let pn = tax_obj[node.parent_id]
//         let dn = tax_obj[pn.parent_id]
//         lineage = dn.taxon+';'+pn.taxon+';'+node.taxon
//         lineage_obj.domain = tax_obj[pn.parent_id].taxon
//         lineage_obj.phylum = tax_obj[node.parent_id].taxon
//         lineage_obj.klass = node.taxon
//     }else if(node.rank==='order'){
//         let kn = tax_obj[node.parent_id]
//         let pn = tax_obj[kn.parent_id]
//         let dn = tax_obj[pn.parent_id]
//         lineage = dn.taxon+';'+pn.taxon+';'+kn.taxon+';'+ node.taxon
//         lineage_obj.domain = tax_obj[pn.parent_id].taxon
//         lineage_obj.phylum = tax_obj[kn.parent_id].taxon
//         lineage_obj.klass = tax_obj[node.parent_id].taxon
//         lineage_obj.order = node.taxon
//     }else if(node.rank==='family'){
//         let on = tax_obj[node.parent_id]
//         let kn = tax_obj[on.parent_id]
//         let pn = tax_obj[kn.parent_id]
//         let dn = tax_obj[pn.parent_id]
//         lineage = dn.taxon+';'+pn.taxon+';'+kn.taxon+';'+ on.taxon+';'+   node.taxon
//         lineage_obj.domain = tax_obj[pn.parent_id].taxon
//         lineage_obj.phylum = tax_obj[kn.parent_id].taxon
//         lineage_obj.klass = tax_obj[on.parent_id].taxon
//         lineage_obj.order = tax_obj[node.parent_id].taxon
//         lineage_obj.family = node.taxon
//     }else if(node.rank==='genus'){
//         let fn = tax_obj[node.parent_id]
//         let on = tax_obj[fn.parent_id]
//         let kn = tax_obj[on.parent_id]
//         let pn = tax_obj[kn.parent_id]
//         let dn = tax_obj[pn.parent_id]
//         lineage = dn.taxon+';'+pn.taxon+';'+kn.taxon+';'+ on.taxon+';'+ fn.taxon+';'+  node.taxon
//         lineage_obj.domain = tax_obj[pn.parent_id].taxon
//         lineage_obj.phylum = tax_obj[kn.parent_id].taxon
//         lineage_obj.klass = tax_obj[on.parent_id].taxon
//         lineage_obj.order = tax_obj[fn.parent_id].taxon
//         lineage_obj.family = tax_obj[node.parent_id].taxon
//         lineage_obj.genus = node.taxon
//     }else if(node.rank==='species'){
//         //console.log('species1',node)
//         let gn = tax_obj[node.parent_id]
//         //console.log('genus1',gn)
//         let fn = tax_obj[gn.parent_id]
//         
//         let on = tax_obj[fn.parent_id]
//         let kn = tax_obj[on.parent_id]
//         let pn = tax_obj[kn.parent_id]
//         let dn = tax_obj[pn.parent_id]
//         // console.log('phylum1',pn)
// //         console.log('class1',kn)
// //         console.log('order1',on)
// //         console.log('family1',fn)
//         
//         lineage = dn.taxon+';'+pn.taxon+';'+kn.taxon+';'+ on.taxon+';'+ fn.taxon+';'+ gn.taxon+';'+ node.taxon
//         lineage_obj.domain = tax_obj[pn.parent_id].taxon
//         lineage_obj.phylum = tax_obj[kn.parent_id].taxon
//         lineage_obj.klass = tax_obj[on.parent_id].taxon
//         lineage_obj.order = tax_obj[fn.parent_id].taxon
//         lineage_obj.family = tax_obj[gn.parent_id].taxon
//         lineage_obj.genus = tax_obj[node.parent_id].taxon
//         lineage_obj.species = node.taxon
//     }else if(node.rank==='subspecies'){
//         let sn = tax_obj[node.parent_id]
//         let gn = tax_obj[sn.parent_id]
//         let fn = tax_obj[gn.parent_id]
//         let on = tax_obj[fn.parent_id]
//         let kn = tax_obj[on.parent_id]
//         let pn = tax_obj[kn.parent_id]
//         let dn = tax_obj[pn.parent_id]
//         lineage = dn.taxon+';'+pn.taxon+';'+kn.taxon+';'+ on.taxon+';'+ fn.taxon+';'+ gn.taxon+';'+ sn.taxon+';'+ node.taxon
//         lineage_obj.domain = tax_obj[pn.parent_id].taxon
//         lineage_obj.phylum = tax_obj[kn.parent_id].taxon
//         lineage_obj.klass = tax_obj[on.parent_id].taxon
//         lineage_obj.order = tax_obj[fn.parent_id].taxon
//         lineage_obj.family = tax_obj[gn.parent_id].taxon
//         
//         lineage_obj.genus = tax_obj[sn.parent_id].taxon
//         lineage_obj.species = tax_obj[node.parent_id].taxon
//         lineage_obj.subspecies = node.taxon
//     }
//     //console.log('line',lineage)
//     return [lineage,lineage_obj]
// }
////
function get_options_by_node(node) {
  //console.log(node)

  let rankname = node.rank.charAt(0).toUpperCase() + node.rank.slice(1)
  if (rankname === 'Klass')
    rankname = 'Class'
  let text = rankname + ' ' + node.taxon
  if (node.rank === 'species' && node.children_ids.length === 0) {
    text = "<a href='tax_description?otid=" + node.otid + "'><i>" + rankname + ' ' + node.taxon + '</i></a>'
  }
  if (node.rank === 'subspecies') {
    text = "<a href='tax_description?otid=" + node.otid + "'><i>" + rankname + ' ' + node.taxon + '</i></a>'
  }
  let options_obj = {
    id: node.node_id,
    text: text,
    rank: node.rank,
    child: 0,
    tooltip: rankname,
  };
  if (node.children_ids.length > 0) {
    options_obj.child = 1;
    options_obj.item = [];
  }
  return options_obj;
}
//
//
//



//
function find_otid_images(rank, otid) {
  let image_list = []
  let img_obj, hr = false
  if (C.images_tax.species.hasOwnProperty(otid)) {

    img_obj = C.images_tax.species[otid]
    //console.log('image:',eval(img_obj.filename1))
    //console.log('img_obj',img_obj)
    if (C.images_tax.species[otid].hasOwnProperty('filename1')) {
      hr = false
      if (C.hires_images.hasOwnProperty(eval(img_obj.filename1))) {
        //console.log('got hires image1')
        hr = C.hires_images[eval(img_obj.filename1)]
      }
      image_list.push({
        name: path.join(rank, eval(img_obj.filename1)),
        text: eval(img_obj.text1),
        title: eval(img_obj.title1),
        hires: hr
      })
    }
    if (C.images_tax.species[otid].hasOwnProperty('filename2')) {
      hr = false
      if (C.hires_images.hasOwnProperty(eval(img_obj.filename2))) {
        //console.log('got hires image2')
        hr = C.hires_images[eval(img_obj.filename2)]
      }
      image_list.push({
        name: path.join(rank, eval(C.images_tax.species[otid].filename2)),
        text: eval(C.images_tax.species[otid].text2),
        title: eval(C.images_tax.species[otid].title2),
        hires: hr
      })
    }
    if (C.images_tax.species[otid].hasOwnProperty('filename3')) {
      hr = false
      if (C.hires_images.hasOwnProperty(eval(img_obj.filename3))) {
        //console.log('got hires image3')
        hr = C.hires_images[eval(img_obj.filename3)]
      }
      image_list.push({
        name: path.join(rank, eval(C.images_tax.species[otid].filename3)),
        text: eval(C.images_tax.species[otid].text3),
        title: eval(C.images_tax.species[otid].title3),
        hires: hr
      })
    }
    if (C.images_tax.species[otid].hasOwnProperty('filename4')) {
      hr = false
      if (C.hires_images.hasOwnProperty(eval(img_obj.filename4))) {
        //console.log('got hires image4')
        hr = C.hires_images[eval(img_obj.filename4)]
      }
      image_list.push({
        name: path.join(rank, eval(C.images_tax.species[otid].filename4)),
        text: eval(C.images_tax.species[otid].text4),
        title: eval(C.images_tax.species[otid].title4),
        hires: hr
      })
    }

  } else {
    console.log('NO images found:', otid)
  }

  return image_list


}
function find_life_images(rank, tax_name) {
  let image_list = []
  //console.log(rank, tax_name)
  if (C.images_tax[rank].hasOwnProperty(tax_name)) {
    if (C.images_tax[rank][tax_name].hasOwnProperty('filename1')) {
      image_list.push({
        name: path.join(rank, eval(C.images_tax[rank][tax_name].filename1)),
        text: eval(C.images_tax[rank][tax_name].text1),
        title: eval(C.images_tax[rank][tax_name].title1)
      })
    }
    if (C.images_tax[rank][tax_name].hasOwnProperty('filename2')) {
      image_list.push({
        name: path.join(rank, eval(C.images_tax[rank][tax_name].filename2)),
        text: eval(C.images_tax[rank][tax_name].text2),
        title: eval(C.images_tax[rank][tax_name].title2)
      })
    }
    if (C.images_tax[rank][tax_name].hasOwnProperty('filename3')) {
      image_list.push({
        name: path.join(rank, eval(C.images_tax[rank][tax_name].filename3)),
        text: eval(C.images_tax[rank][tax_name].text3),
        title: eval(C.images_tax[rank][tax_name].title3)
      })
    }
    if (C.images_tax[rank][tax_name].hasOwnProperty('filename4')) {
      image_list.push({
        name: path.join(rank, eval(C.images_tax[rank][tax_name].filename4)),
        text: eval(C.images_tax[rank][tax_name].text4),
        title: eval(C.images_tax[rank][tax_name].title4)
      })
    }
  }
  console.log('ImList', image_list)
  return image_list
}

function build_abundance_table(cite, data, order) {
  //console.log('data',data)
  //C.abundance_names
  let datapt = ''
  let html = "<table class='abundance-table'><thead><tr><td></td>"
  for (let n in order) {
    html += "<th title='" + C.abundance_names[order[n]] + "' style='background:" + C.abundance_site_colors[order[n]] + "'>" + order[n] + '</th>'
  }
  html += '</tr></thead><tbody>'

  html += '<tr><th>Avg (%)</th>'
  for (let n in data) {
    datapt = (parseFloat(data[n].avg)).toFixed(3)
    if (datapt === 'NaN') {
      datapt = ''
    }
    html += "<td class='right-justify'>" + datapt + "</td>"
  }
  html += '</tr>'

  html += '<tr><th>10<sup>th</sup>p</th>'
  for (let n in data) {
    datapt = (parseFloat(data[n]['10p'])).toFixed(3)
    if (datapt === 'NaN') { datapt = ''; }
    html += "<td class='right-justify'>" + datapt + "</td>"
  }
  html += "</tr>"
  html += "<tr><th>90<sup>th</sup>p</th>"
  for (let n in data) {
    datapt = (parseFloat(data[n]['90p'])).toFixed(3)
    if (datapt === 'NaN') { datapt = ''; }
    html += "<td class='right-justify'>" + datapt + "</td>"
  }
  html += "</tr>"


  html += "<tr><th>Stdev</th>"
  for (let n in data) {

    datapt = (parseFloat(data[n].sd)).toFixed(3)
    if (datapt === 'NaN') {
      datapt = ''
    }
    html += "<td class='right-justify'>" + datapt + "</td>"
  }
  html += "</tr>"


  html += "<tr><th>Prev(%)</th>"
  for (let n in data) {
    datapt = (parseFloat(data[n].prev)).toFixed(3)
    if (datapt === 'NaN') {
      datapt = ''
    }
    html += "<td class='right-justify'>" + datapt + "</td>"
  }
  html += "</tr>"

  html += "</tbody></table>"
  return html
}
//
function get_major_genera(rank, node) {
  let genera = []
  if (['phylum', 'klass', 'order'].indexOf(rank) !== -1) {
    // find major genera per Jessica (hand curated)
    // or abundance >1% at some site
    // find all genera under tax_name the get the counts
    // how to find all genera from node?

    for (let n in node.children_ids) {
      let new_node1 = C.homd_taxonomy.taxa_tree_dict_map_by_id[node.children_ids[n]]  // klass ,order or family
      for (let m in new_node1.children_ids) {
        let new_node2 = C.homd_taxonomy.taxa_tree_dict_map_by_id[new_node1.children_ids[m]]  // order, family or genus
        if (new_node2.rank === 'genus') {
          //stop you're done
          //counts = C.taxon_counts_lookup[make_lineage(new_node2)[0]]
          genera.push(new_node2)
        } else {
          for (let p in new_node2.children_ids) {
            let new_node3 = C.homd_taxonomy.taxa_tree_dict_map_by_id[new_node2.children_ids[p]] // family or genus
            if (new_node3.rank === 'genus') {
              //stop you're done
              //counts = C.taxon_counts_lookup[make_lineage(new_node3)[0]]
              genera.push(new_node3)
            } else {
              for (let q in new_node3.children_ids) {
                let new_node4 = C.homd_taxonomy.taxa_tree_dict_map_by_id[new_node3.children_ids[q]] // must be genus
                //console.log('make_lineage(new_node4)')
                //console.log(make_lineage(new_node4)[0])
                //counts = C.taxon_counts_lookup[make_lineage(new_node4)[0]].taxcnt
                //console.log('counts', counts)
                genera.push(new_node4)
              }
            }
          }
        }
      }
    }
    //major_genera=1
  }
  // the counts here are not abundance
  // here get majors
  // phylum/Actinobacteria from jessica
  // Actinomyces, Corynebacterium, Cutibacterium, Propionibacterium, Rothia, Schaalia.


  return genera
}


module.exports = router;




