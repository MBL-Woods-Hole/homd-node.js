'use strict'
import express from 'express';
let router   = express.Router();

import fs from 'fs-extra';

import path from 'path';
import { pipeline, Transform } from 'stream';
import csv from 'fast-csv';
import C from '../public/constants.js';
import * as helpers from './helpers/helpers.js';
import * as helpers_taxa from './helpers/helpers_taxa.js';
import * as helpers_genomes from './helpers/helpers_genomes.js';
import * as queries from './queries.js';
//import { getConnection } from '../config/database.js';
//import pool from '../config/database.js';
router.get('/download/:q', function download(req, res) {
  // renders the overall downlads page
  //console.log('q',req.params)
  let q = req.params.q
  res.render('pages/download', {
    title: 'HOMD :: Downloads',
    pgname: 'download', // for AbountThisPage
    section: q,
    config: JSON.stringify(ENV),
    ver_info: JSON.stringify(C.version_information)

  })
})
router.get('/download', function download(req, res) {
   res.redirect('download/all');
})
router.get('/download_file', function search(req, res) {
  //let page = req.params.pagecode
  let fullpath = req.query.filename
  helpers.print('file path: '+fullpath)
  res.download(fullpath)
  //res.end()
})

router.get('/dld_taxtable_all/:type/', function dld_taxtable_all(req, res) {
//router.get('/dld_table_all/:type/:letter/:stati/:search_txt/:search_field', function dld_tax_table(req, res) {
    let dt = helpers.get_today_obj()

    let type = req.params.type
    let file_filter_txt = "HOMD.org Taxon Data::No Filter Applied"+ " Date: "+dt.today 
    let send_list = Object.values(C.taxon_lookup);
    
    let list_of_otids = send_list.map(item => item.otid)
    
    console.log('ALL::Count of OTIDs:',list_of_otids.length)
    
    let table_tsv = create_taxon_table(list_of_otids, 'table', type, file_filter_txt )
    
    if(type === 'browser'){
      res.set('Content-Type', 'text/plain');  // <= important - allows tabs to display
    }else if(type === 'text'){
      res.set({"Content-Disposition":"attachment; filename=\"HOMD_taxon_table"+dt.today+'_'+dt.seconds+".txt\""})
    }else if(type === 'excel'){
      res.set({"Content-Disposition":"attachment; filename=\"HOMD_taxon_table"+dt.today+'_'+dt.seconds+".xls\""})
    }else {
      // error
      console.log('Download table format ERROR')
    }
    res.send(table_tsv)
    res.end()
})
//
router.get('/dld_refseqtable_all/:type', function dld_refseqtable(req, res) {
    let dt = helpers.get_today_obj()
    let otid,tmp_ary,vals,hmt,refseq_array=[]
    let type = req.params.type
    let tableTsv = "HOMD.org RefSeq Data;"+ " Date: "+dt.today + '\n'
    let headers = ["HMT-ID","RefSeq-ID","Species","Sequence Length","SeqID Count","Seq-IDs"]
    tableTsv +=  headers.join('\t') + '\n'
    let keys = Object.keys(C.refseq_lookup)
    for(let n in keys){
         otid = keys[n]
         hmt = helpers.make_otid_display_name(otid)
         vals = C.refseq_lookup[otid]
         for(let m  in vals){
            refseq_array.push({
                otid:        otid,
                species:     vals[m].species,
                refseq_id:   vals[m].refseq_id,
                length:      vals[m].seq_length,
                seqid_count: vals[m].seqid_count,
                seqids:      vals[m].seqids,
            })
         }
    
    }
    refseq_array.sort((a, b) => {
        return helpers.compareStrings_alpha(a.species, b.species);
    })
    for(let n in refseq_array){
        hmt = helpers.make_otid_display_name(refseq_array[n].otid)
        tableTsv += hmt+'\t'+refseq_array[n].refseq_id+'\t'+refseq_array[n].species+'\t'+refseq_array[n].length+'\t'+refseq_array[n].seqid_count+'\t'+refseq_array[n].seqids+'\n'
    }
    
    if (type === 'browser') {
        res.set('Content-Type', 'text/plain') // <= important - allows tabs to display
    } else if (type === 'text') {
        let fname = 'HOMD_refseq_table' + dt.today + '_' + dt.seconds + '.txt'
        res.set({ 'Content-Disposition': 'attachment; filename='+fname })
    } else if (type === 'excel') {
        let fname = 'HOMD_refseq_table' + dt.today + '_' + dt.seconds + '.xls'
        res.set({ 'Content-Disposition': 'attachment; filename='+fname })
    } else {
        // error
        console.log('Download table format ERROR')
    }
    res.send(tableTsv)
    res.end()
    

})
router.get('/dld_taxtable/:type', function dld_taxtable(req, res) {
//router.get('/dld_table/:type/:letter/:stati/:search_txt/:search_field', function dld_tax_table(req, res) {
    let dt = helpers.get_today_obj()
    let letter='all',statusfilter='on',search_txt='',search_field=''
    let send_list = []
    let type = req.params.type

    
    send_list = helpers_taxa.apply_ttable_filter(req, req.session.ttable_filter)
    let file_filter_txt = "HOMD.org Taxon Data::Site/Status Filter Applied"+ " Date: "+dt.today 

    let list_of_otids = send_list.map(item => item.otid)
    //console.log('Table::Count of OTIDs:',list_of_otids)
    // type = browser, text or excel
    let table_tsv = create_taxon_table(list_of_otids, 'table', type, file_filter_txt )
    if(type === 'browser'){
      res.set('Content-Type', 'text/plain');  // <= important - allows tabs to display
    }else if(type === 'text'){
      res.set({"Content-Disposition":"attachment; filename=\"HOMD_taxon_table"+dt.today+'_'+dt.seconds+".txt\""})
    }else if(type === 'excel'){
      res.set({"Content-Disposition":"attachment; filename=\"HOMD_taxon_table"+dt.today+'_'+dt.seconds+".xls\""})
    }else {
      // error
      console.log('Download table format ERROR')
    }
    res.send(table_tsv)
    res.end()
})
router.get('/dld_tax/:type/:fxn', function dld_tax(req, res) {
    let dt = helpers.get_today_obj()

    let type = req.params.type   // browser, text or excel
    let fxn = req.params.fxn     // hierarchy or level
    helpers.print(['in download: '+type+'::'+fxn])
    let file_filter_txt, table_tsv;
   
    let temp_list = Object.values(C.taxon_lookup);
    let list_of_otids = temp_list.map(item => item.otid)  // use all the otids
    if(fxn == 'level'){
        file_filter_txt = "HOMD.org Taxon Data::Taxonomic Level" 
        table_tsv = create_taxon_table(list_of_otids, 'level', type, file_filter_txt )
    }else if(fxn == 'hierarchy'){
        file_filter_txt = "HOMD.org Taxon Data::Taxonomic Hierarchy" 
        table_tsv = create_taxon_table(list_of_otids, 'hierarchy', type, file_filter_txt )
    }else if(fxn == 'lineage'){
        file_filter_txt = "HOMD.org Taxon Data::Taxonomic Lineage" 
        table_tsv = create_taxon_table(list_of_otids, 'lineage', type, file_filter_txt )
    
    }else {
       // type error
    }
    if(type === 'browser'){
      res.set('Content-Type', 'text/plain');  // <= important - allows tabs to display
  }else if(type === 'text'){
      res.set({"Content-Disposition":"attachment; filename=\"HOMD_taxon_table"+dt.today+'_'+dt.seconds+".txt\""})
  }else if(type === 'excel'){
      res.set({"Content-Disposition":"attachment; filename=\"HOMD_taxon_table"+dt.today+'_'+dt.seconds+".xls\""})
  }else {
      // error
      console.log('Download table format ERROR')
  }
  res.send(table_tsv)
  res.end()
    
})

router.get('/dld_taxabund/:type/:source/', function dld_taxabund(req, res) {
    //console.log('in dld abund - taxon')
    let dt = helpers.get_today_obj()

    let type = req.params.type
    let source = req.params.source
    //helpers.print('type: '+type+' source: '+source)
    let table_tsv='',row,site
    let temp_list = Object.values(C.abundance_lookup)
    let abundance_order
    let header = 'HOMD (https://homd.org/)::'
    if(source === 'dewhirst'){
        header += 'HOMD Data from Dewhirst(unpublished); '
        abundance_order = C.dewhirst_abundance_order
    }else if(source === 'erenv1v3'){
        if(type === 'samples_file'){
            let fullpath = path.join(ENV.PATH_TO_STATIC_DOWNLOADS,'eren2014_v1v3_rank_abundance_sums_homd.csv.gz')
            res.download(fullpath)
            return 
        }
        header += 'HOMD Data from Eren(2014) V1-V3; '
        abundance_order = C.eren_abundance_order
    }else if(source === 'erenv3v5'){
        if(type === 'samples_file'){
            let fullpath = path.join(ENV.PATH_TO_STATIC_DOWNLOADS,'eren2014_v3v5_rank_abundance_sums_homd.csv.gz')
            res.download(fullpath)
            return
        }
        header += 'HOMD Data from Eren(2014) V3-V5; '
        abundance_order = C.eren_abundance_order
    }else if(source === 'hmpmeta'){
        header += 'HOMD Data from HMP MetaPhlan (unpublished); '
        abundance_order = C.hmp_metaphlan_abundance_order
    }else if(source === 'hmprefseqv1v3'){
        if(type === 'samples_file'){
            let fullpath = path.join(ENV.PATH_TO_STATIC_DOWNLOADS,'HMP_16SRefseq_Ranked_Abundance_v1v3_homd.tar.gz')
            res.download(fullpath)
            return 
        }
        header += 'HOMD Data from HMP 16S RefSeq V1-V3 (unpublished); '
        abundance_order = C.hmp_refseq_abundance_order
    }else if(source === 'hmprefseqv3v5'){
        if(type === 'samples_file'){
            let fullpath = path.join(ENV.PATH_TO_STATIC_DOWNLOADS,'HMP_16SRefseq_Ranked_Abundance_v3v5_homd.tar.gz')
            res.download(fullpath)
            return 
        }
        header += 'HOMD Data from HMP 16S RefSeq V3-V5 (unpublished); '
        abundance_order = C.hmp_refseq_abundance_order
    }
    header += 'HMT == Human Microbial Taxon'
    table_tsv += header+'\nTAX\tHMT' 
    
    for(let n in abundance_order){
         site = abundance_order[n]
         table_tsv += '\t' +site+'_mean'+'\t'+site+'_stdev'+'\t'+site+'_prev'
    }
    table_tsv += '\n'
    for(let tax_string in C.abundance_lookup){
      if(source === 'dewhirst' 
                && C.abundance_lookup[tax_string].hasOwnProperty('dewhirst') 
                && Object.keys(C.abundance_lookup[tax_string]['dewhirst']).length > 0)
            {
            table_tsv += tax_string+'\t'+C.abundance_lookup[tax_string]['otid']
            row = C.abundance_lookup[tax_string]['dewhirst']
            for(let n in abundance_order){
                site = abundance_order[n]
                table_tsv += '\t'+row[site]['avg']+'\t'+row[site]['sd']+'\t'+row[site]['prev']
            }
            table_tsv += '\n'
      }else if(source === 'erenv1v3' 
                && C.abundance_lookup[tax_string].hasOwnProperty('eren_v1v3')
                && Object.keys(C.abundance_lookup[tax_string]['eren_v1v3']).length > 0)
            {
            table_tsv += tax_string+'\t'+C.abundance_lookup[tax_string]['otid']
            row = C.abundance_lookup[tax_string]['eren_v1v3']
            for(let n in abundance_order){
                site = abundance_order[n]
                table_tsv += '\t'+row[site]['avg']+'\t'+row[site]['sd']+'\t'+row[site]['prev']
            }
            table_tsv += '\n'
      }else if(source === 'erenv3v5' 
                && C.abundance_lookup[tax_string].hasOwnProperty('eren_v3v5')
                &&  Object.keys(C.abundance_lookup[tax_string]['eren_v3v5']).length > 0)
            {
            table_tsv += tax_string+'\t'+C.abundance_lookup[tax_string]['otid']
            row = C.abundance_lookup[tax_string]['eren_v3v5']
            for(let n in abundance_order){
                site = abundance_order[n]
                table_tsv += '\t'+row[site]['avg']+'\t'+row[site]['sd']+'\t'+row[site]['prev']
            }
            table_tsv += '\n'
      }else if(source === 'hmpmeta' 
                && C.abundance_lookup[tax_string].hasOwnProperty('hmp_metaphlan')
                &&  Object.keys(C.abundance_lookup[tax_string]['hmp_metaphlan']).length > 0)
            {
            table_tsv += tax_string+'\t'+C.abundance_lookup[tax_string]['otid']
            row = C.abundance_lookup[tax_string]['hmp_metaphlan']
            for(let n in abundance_order){
                site = abundance_order[n]
                table_tsv += '\t'+row[site]['avg']+'\t'+row[site]['sd']+'\t'+row[site]['prev']
            }
            table_tsv += '\n'
            
            
      }else if(source === 'hmprefseqv1v3'
              && C.abundance_lookup[tax_string].hasOwnProperty('hmp_refseq_v1v3')
                &&  Object.keys(C.abundance_lookup[tax_string]['hmp_refseq_v1v3']).length > 0)
            {
            table_tsv += tax_string+'\t'+C.abundance_lookup[tax_string]['otid']
            row = C.abundance_lookup[tax_string]['hmp_refseq_v1v3']
            for(let n in abundance_order){
                site = abundance_order[n]
                table_tsv += '\t'+row[site]['avg']+'\t'+row[site]['sd']+'\t'+row[site]['prev']
            }
            table_tsv += '\n'
      }else if(source === 'hmprefseqv3v5'
              && C.abundance_lookup[tax_string].hasOwnProperty('hmp_refseq_v3v5')
                &&  Object.keys(C.abundance_lookup[tax_string]['hmp_refseq_v3v5']).length > 0)
            {
            table_tsv += tax_string+'\t'+C.abundance_lookup[tax_string]['otid']
            row = C.abundance_lookup[tax_string]['hmp_refseq_v3v5']
            for(let n in abundance_order){
                site = abundance_order[n]
                table_tsv += '\t'+row[site]['avg']+'\t'+row[site]['sd']+'\t'+row[site]['prev']
            }
            table_tsv += '\n'
      }else{
         // error
      }
    }
    let filename = 'HOMD_abundance_table_'+source
    if(type === 'browser'){
      res.set('Content-Type', 'text/plain');  // <= important - allows tabs to display
    }else if(type === 'text'){
      res.set({"Content-Disposition":"attachment; filename=\""+filename+dt.today+'_'+dt.seconds+".txt\""})
    }else if(type === 'excel'){
      res.set({"Content-Disposition":"attachment; filename=\""+filename+dt.today+'_'+dt.seconds+".xls\""})
    }else {
      // error
      console.log('Download table format ERROR')
    }
    res.send(table_tsv)
    res.end()
})
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
router.get('/dld_genome_table_all/:type/:filter', async function dld_genome_table_all (req, res) {
    
    let dt = helpers.get_today_obj()
    const type = req.params.type
    const filter = req.params.filter
    //console.log('in dld_genome_table_all/:type/:filter',type,filter)
    let conn,fileFilterText,tableTsv
    const sendList = Object.values(C.genome_lookup)
    const listOfGids = sendList.map(item => item.gid)
    
    
    const q = queries.get_all_genomes()
    
    //////////
    let ext = '.csv'
    let fname = 'HOMD_genome_table' + dt.today + '_' + dt.seconds
    
    //let fname = 'HOMD_genome_table' + dt.today + '_' + dt.seconds + ext
    stream_sqlquery_download(q, fname, res, 'table', type)
    return

})
//
router.get('/dld_genome_table/:type', function dld_genome_table (req, res) {
  
  console.log('in download table partial-genome:')
  let dt = helpers.get_today_obj()
  const type = req.params.type
  
  let letter = '0'
  let phylum = ''
  let otid = ''
  let searchText = ''
  let searchField = ''
  let filter = helpers_genomes.get_default_gtable_filter()
  if(req.session.hasOwnProperty('gtable_filter')){
    filter = req.session.gtable_filter
    //console.log('filter',filter)
    
  }
  //console.log('YYYfilter',filter)
  let sendList = helpers_genomes.apply_gtable_filter(req, filter)

     let fileFilterText = 'HOMD.org Genome Data:: Filtered Genome Data'
//   }
  const listOfGids = sendList.map(item => item.gid)
  fileFilterText = fileFilterText + ' Date: ' + dt.today

  //helpers.print(['listOfGids', listOfGids])
  // type = browser, text or excel
  const tableTsv = create_genome_table(listOfGids, 'table', type, fileFilterText)

  if (type === 'browser') {
    res.set('Content-Type', 'text/plain') // <= important - allows tabs to display
  } else if (type === 'text') {
    let fname = 'HOMD_genome_table' + dt.today + '_' + dt.seconds + '.txt'
    res.set({ 'Content-Disposition': 'attachment; filename='+fname })
  } else if (type === 'excel') {
    let fname = 'HOMD_genome_table' + dt.today + '_' + dt.seconds + '.xls'
    res.set({ 'Content-Disposition': 'attachment; filename='+fname })
  } else {
    // error
    console.log('Download table format ERROR')
  }
  res.send(tableTsv)
  res.end()
  
})
router.get('/dld_static_file/:fname', function dld_static_file (req, res) {
    const fname = req.params.fname
    
    let fullpath = path.join(ENV.PATH_TO_STATIC_DOWNLOADS,fname)
    console.log('downloading',fullpath)
    res.download(fullpath)
    return 
})
// /////////////////////////////
router.get('/dld_peptide_table_all/:study', function dld_peptide_table_all (req, res) {
    const study = req.params.study
    let fullpath = path.join(ENV.PATH_TO_STATIC_DOWNLOADS,'homd_protein-peptides_study'+study+'.csv')
    res.download(fullpath)
    return 
})
router.get('/dnld_pangenome',(req, res) => {
    console.log('req query',req.query)
    let pg = req.query.pg
    let ver = req.query.V
    let fn
    let obj = C.pangenomes.find(o => o.name === pg);
    
    if(ver === '7'){
       fn = obj.dnld_v7
    }else{
       fn = obj.dnld_v8
    }
    
    let fullpath = path.join(ENV.PATH_TO_PANGENOMES, req.query.pg, fn)
    
    helpers.print('file path: '+fullpath)
    res.download(fullpath)

});

router.post('/anno_search_data', async (req, res) => {
   // Download all Annotation Hits/ table and fasta
   //console.log('anno_search_data req body',req.body)
   let type = req.body.type  // browser, text or excel
   let anno = req.body.anno  // ncbi prokka or bakta
   let anno_cap = anno.toUpperCase()
   let search_text = req.body.search_text
    let format = req.body.format  // csv or fasta
    let id_list = JSON.parse(req.body.anno_ids)
    console.log('id_list length',id_list.length)
    console.log('anno',anno)
    console.log('type',type)
    console.log('format',format)
    let fname,result_text,ext,q
    let dt = helpers.get_today_obj()
    //if anno is prokka or ncbi us .map to get all the pids from idlist
    // if anno == bakta ??
    let selected_gids = Object.keys(id_list)
    let pid_list=[],unique_pidlst,lst,head_text_array
    for(let n in selected_gids){
       lst = id_list[selected_gids[n]].map(el => "'"+el.pid+"'")
       
       pid_list = pid_list.concat(lst)
    }
    unique_pidlst = [...new Set(pid_list)];
    //console.log('unique_lst',unique_pidlst)
    if(anno.toUpperCase() === 'BAKTA'){
        if(format === 'fasta_aa'){
            q = "SELECT CONCAT('>Bakta | ',BAKTA.orf.core_contig_acc,' | ', BAKTA.orf.genome_id,' | ',"
            q += " core_ID,' | ',core_start,'..',core_end,' | length:',bakta_Length) AS defline,"
            q += " UNCOMPRESS(seq_compressed) as sequence"
            q += " from BAKTA.orf"
            q += " JOIN BAKTA.faa using(core_ID)"
            q += " WHERE core_ID in ("+unique_pidlst+")"
            //head_text_array = ['core_ID','Genome_ID','Contig','BAKTA','seq_length']
        }else if(format === 'fasta_na'){
            // error  there is no bakta na seqs
            res.send("Error::BAKTA doesn't have nucleotide (na) sequences.")
            res.end()
            return
        }else{
            // bakta table (everthing except seqs)
            q = "SELECT genome_id as gid,core_contig_acc as contig,core_ID as pid,core_start as start,core_end as stop,bakta_Product as product,bakta_Gene as gene,bakta_Length as length,"
            q += " bakta_EC,bakta_GO,bakta_COG,bakta_RefSeq,bakta_UniParc,bakta_UniRef"
            q += " from `BAKTA`.orf WHERE core_ID in ("+unique_pidlst+")"
            head_text_array = ['Genome_ID','Contig','Protein_ID','seq_length','start','end','Product','Gene','bakta_EC','bakta_GO','bakta_COG','bakta_RefSeq','bakta_UniParc','bakta_UniRef']

        }
    }else{
        // PROKKA and NCBI
        
        if(format === 'fasta_aa'){
            q = "SELECT"
            q += " CONCAT('>"+anno_cap+" | ',"+anno_cap+".orf.genome_id,' | ',accession,' | ',protein_id) AS defline,"
            q += " UNCOMPRESS(seq_compressed) AS sequence"
            q += " from "+anno_cap+".orf JOIN "+anno_cap+".faa using(protein_id) WHERE protein_id in ("+unique_pidlst+")"
            //q += " from "+anno_cap+".orf JOIN "+anno_cap+".ffn using(protein_id) WHERE protein_id in ('WKE52996.1','WKE52997.1','WKE52998.1')"
        
        }else if(format === 'fasta_na'){
            q = "SELECT"
            q += " CONCAT('>"+anno_cap+" | ',"+anno_cap+".orf.genome_id,' | ',accession,' | ',protein_id) AS defline,"
            q += " UNCOMPRESS(seq_compressed) AS sequence"
            q += " from "+anno_cap+".orf JOIN "+anno_cap+".ffn using(protein_id) WHERE protein_id in ("+unique_pidlst+")"
            //q += " from "+anno_cap+".orf JOIN "+anno_cap+".ffn using(protein_id) WHERE protein_id in ('WKE52996.1','WKE52997.1','WKE52998.1')"
        
        }else{
            // table  PROKKA and NCBI
            q = "SELECT genome_id as gid,accession as acc,protein_id as pid,start,stop,product,gene,length_aa as laa,"
            q += "length_na as lna from "+anno_cap+".orf WHERE protein_id in ("+unique_pidlst+")"
            head_text_array = ['Genome_ID','Contig','Protein_ID','seq_length_na','seq_length_aa','start','end','Product','Gene']
             
        }
        
    }
    
    helpers.print('query: '+q)
    let conn
    
    if(format.slice(0,5) === 'fasta'){
        // Set response headers for file download
        //res.setHeader('Content-Type', 'text/plain');
        let fname = 'HOMD_'+anno+'_search' + dt.today + '_' + dt.seconds
        stream_sqlquery_download(q, fname,  res, 'fasta', type)
        return
    }else{
    
        try {
            conn = await global.TDBConn();
            const [rows] = await conn.execute(q);
            for(let n in rows){
                //console.log(rows[n].genome_id)
            }
            
            fname = ''
            ext = '.txt'
            result_text = create_anno_search_table(rows, anno, head_text_array, search_text)
            
            
            if (type === 'browser') {
                res.set('Content-Type', 'text/plain') // <= important - allows tabs to display
            } else if (type === 'text') {
                
                let fname = 'HOMD_search'+anno_cap+ dt.today + '_' + dt.seconds + ext
                res.set({ 'Content-Disposition': 'attachment; filename='+fname })
            
            
            } else if (type === 'excel') {
                let fname = 'HOMD_search'+anno_cap + dt.today + '_' + dt.seconds + '.xls'
                res.set({ 'Content-Disposition': 'attachment; filename='+fname })
              
            
            } else {
                // error
                console.log('Download table format ERROR')
            
            }
            res.send(result_text)
            res.end()
        } catch (error) {
            console.error(error);
            res.status(500).send('Error fetching data');
        } finally {
            if (conn) conn.release(); // Release the connection back to the pool
        }
        return
    }
    
})
////
router.post('/anno_data_by_gid', async (req, res) => {
    // Download all Annotation Hits By gid/ table and fasta
    console.log('anno_data_by_gid req body',req.body)
    let type = req.body.type  // browser, text or excel
    let anno = req.body.anno  // ncbi prokka or bakta
    let gid = req.body.gid
   
    let format = req.body.format  // csv or fasta
    //let id_list = JSON.parse(req.body.anno_ids)
    
    console.log('anno',anno)
    console.log('type',type)
    console.log('format',format)
    let fname,result_text,ext,q
    let dt = helpers.get_today_obj()
    //if anno is prokka or ncbi us .map to get all the pids from idlist
    // if anno == bakta ??
    
    let head_text_array
    let anno_cap = anno.toUpperCase()

    q = "SELECT"
    q += " CONCAT('>',protein_id,' | ',genome_id,' | ',mol_id) AS defline,"
    q += " UNCOMPRESS(seq_compressed) AS sequence"
    if(format === 'fasta_aa' && anno === 'ncbi'){
        q += " from NCBI.faa WHERE NCBI.faa.genome_id = '"+gid+"'" 
        
    }else if(format === 'fasta_na' && anno === 'ncbi'){
        q += " from NCBI.ffn WHERE NCBI.ffn.genome_id = '"+gid+"'"
        
    }else if(format === 'fasta_aa' && anno === 'prokka'){
        q += " from PROKKA.faa WHERE PROKKA.faa.genome_id = '"+gid+"'" 
        
    //GCA_030450175.1| Protein ID: GCA_030450175.1_00001 | Galactan 5-O-arabinofuranosyltransferase | Corynebacterium tuberculostearicum | length: 688 bp
    //SELECT UNCOMPRESS(seq_compressed) as seq FROM `PROKKA`.`faa` WHERE genome_id ='GCA_030450175.1' and protein_id='GCA_030450175.1_00001'
    }else if(format === 'fasta_na' && anno === 'prokka'){
        q += " from PROKKA.ffn WHERE PROKKA.ffn.genome_id = '"+gid+"'"
        
    //GCA_030450175.1| Protein ID: GCA_030450175.1_00001 | Galactan 5-O-arabinofuranosyltransferase | Corynebacterium tuberculostearicum | length: 688 bp
    //SELECT UNCOMPRESS(seq_compressed) as seq FROM `PROKKA`.`ffn` WHERE genome_id ='GCA_030450175.1' and protein_id='GCA_030450175.1_00001'
    
    }else if(anno === 'prokka'){
        q = "SELECT accession as acc,  gc, protein_id as pid, length_na,length_aa, `start`, `stop`,"
        q+= " PROKKA.orf.product as product,PROKKA.orf.gene as gene,BAKTA.orf.Bakta_product as bakta_product,BAKTA.orf.Bakta_gene as bakta_gene" 
        q += " FROM PROKKA.orf"
        q += " LEFT JOIN BAKTA.orf on(protein_id=core_ID)"
        q += " WHERE PROKKA.orf.genome_id = '"+gid+"'" 
        head_text_array = ['Genome_ID','Contig','Protein_ID','seq_length_na','seq_length_aa','start','end','Product','Gene']
        
    }else if(anno === 'ncbi'){
        q = "SELECT accession as acc,  gc, protein_id as pid, product, length_na,length_aa, `start`, `stop`, gene" 
        q += " FROM NCBI.orf"
        q += " WHERE NCBI.orf.genome_id = '"+gid+"'" 
        head_text_array = ['Genome_ID','Contig','Protein_ID','seq_length_na','seq_length_aa','start','end','Product','Gene']
        
    }

       
    
    
    helpers.print('query: '+q)
    let conn
    
    if(format.slice(0,5) === 'fasta'){
        // Set response headers for file download
        //res.setHeader('Content-Type', 'text/plain');
        let fname = 'HOMD_'+anno+'_search' + dt.today + '_' + dt.seconds
        stream_sqlquery_download(q, fname,  res, 'fasta', type)
        return
    }else{
    
        try {
            conn = await global.TDBConn();
            const [rows] = await conn.execute(q);
            for(let n in rows){
                //console.log(rows[n].genome_id)
            }
            
            fname = ''
            ext = '.txt'
            // anno is ONLY prokka or ncbi  NOT bakta
            result_text = create_anno_table(rows, anno,gid)
            
            
            if (type === 'browser') {
                res.set('Content-Type', 'text/plain') // <= important - allows tabs to display
            } else if (type === 'text') {
                
                let fname = 'HOMD_annotations' + anno_cap+ dt.today + '_' + dt.seconds + ext
                res.set({ 'Content-Disposition': 'attachment; filename='+fname })
            
            
            } else if (type === 'excel') {
                let fname = 'HOMD_annotations' + anno_cap+ dt.today + '_' + dt.seconds + '.xls'
                res.set({ 'Content-Disposition': 'attachment; filename='+fname })
              
            
            } else {
                // error
                console.log('Download table format ERROR')
            
            }
            res.send(result_text)
            res.end()
        } catch (error) {
            console.error(error);
            res.status(500).send('Error fetching data');
        } finally {
            if (conn) conn.release(); // Release the connection back to the pool
        }
        return
    }
    
})
////
router.post('/phage_sequences', async (req, res) => {
    console.log(req.body)
    let q = queries.get_phage_fasta(req.body.search_ids)
    let dt = helpers.get_today_obj()
    let fname = 'HOMD_phage_seqs' + dt.today + '_' + dt.seconds
    stream_sqlquery_download(q, fname, res, 'fasta', 'text')
    return
    
})
////
router.post('/phage_search_data', async (req, res) => {
    // Download all Phage Hits
    //console.log('req body',req.body)
    let type = req.body.type  // browser, text or excel
    let format = req.body.format  // csv or fasta
    let search_text = req.body.search_text
    let id_list = req.body.ids
    let conn,fname,result_text,ext
    
    let dt = helpers.get_today_obj()
    let head_text_array = ['Fasta_ID','Genome_ID','Contig','Predictor','seq_length',
            'accession','description']
    
    let q = "SELECT search_id,genome_id,contig,predictor,start,end,"
    q += "accession,description,"
    q += "seq_length,UNCOMPRESS(seq_compressed) as seq"
    q += " from phage_search where search_id in ("+id_list+')'
    if(format === 'fasta'){
            
            if(type == 'excel'){
                type = 'text'  //change type if fasta::excel selected
            }
            
            let q = queries.get_phage_fasta(id_list)
            let fname = 'HOMD_phage_search' + dt.today + '_' + dt.seconds
            stream_sqlquery_download(q, fname, res, 'fasta', type)
            return
    }else{
        try {
            conn = await global.TDBConn();
            const [rows] = await conn.execute(q);
        
            for(let n in rows){
                //console.log(rows[n].genome_id)
            }
            
            fname = ''
            ext = '.txt'
            result_text = create_phage_table(rows, head_text_array, search_text)
            
            
            if (type === 'browser') {
                res.set('Content-Type', 'text/plain') // <= important - allows tabs to display
            } else if (type === 'text') {
                
                let fname = 'HOMD_phage_search' + dt.today + '_' + dt.seconds + ext
                res.set({ 'Content-Disposition': 'attachment; filename='+fname })
            } else if (type === 'excel') {
                let fname = 'HOMD_phage_search' + dt.today + '_' + dt.seconds + '.xls'
                res.set({ 'Content-Disposition': 'attachment; filename='+fname })
              
            } else {
                // error
                console.log('Download table format ERROR')
            }
            res.send(result_text)
            res.end()
        } catch (error) {
            console.error(error);
            res.status(500).send('Error fetching data');
        } finally {
            if (conn) conn.release(); // Release the connection back to the pool
        }
        return
   }
});
router.get('/dld_phage_table/:type', async function dld_phage_table (req, res) {
    let dt = helpers.get_today_obj()
    const type = req.params.type
    
    
    let conn,fileFilterText,tableTsv
    //const sendList = Object.values(C.genome_lookup)
    //const listOfGids = sendList.map(item => item.gid)
    
    
    const q = queries.get_all_phage_for_download()
    try {
        conn = await global.TDBConn();
        const [mysqlrows] = await conn.execute(q);

        
        fileFilterText = 'HOMD.org Phage Data:: All HOMD Data;' + ' Date: ' + dt.today
        tableTsv = create_table_from_sql_query(mysqlrows, fileFilterText)
        
        if (type === 'browser') {
          res.set('Content-Type', 'text/plain') // <= important - allows tabs to display
        } else if (type === 'text') {
          res.set({ 'Content-Disposition': 'attachment; filename="HOMD_phage_table' + dt.today + '_' + dt.seconds + '.txt"' })
        } else if (type === 'excel') {
          res.set({ 'Content-Disposition': 'attachment; filename="HOMD_phage_table' + dt.today + '_' + dt.seconds + '.xls"' })
        } else {
          // error
          console.log('Download table format ERROR')
        }
        res.send(tableTsv)
        res.end()
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching data');
    } finally {
        if (conn) conn.release(); // Release the connection back to the pool
    }
    return
})
router.get('/dld_crispr_table/:type', function dld_crispr_table (req, res) {
    let dt = helpers.get_today_obj()
    const type = req.params.type
        
    let fileFilterText,tableTsv
    
    
    // get all crispr data from C.crispr_lookup
    
    console.log('hello')
        //const tableTsv = createTable(listOfGids, 'table', type, fileFilterText)
        
    fileFilterText = 'HOMD.org Crispr-Cas Data:: All HOMD Data;' + ' Date: ' + dt.today
    tableTsv = create_full_crispr_table(C.crispr_lookup, fileFilterText)
        
    if (type === 'browser') {
      res.set('Content-Type', 'text/plain') // <= important - allows tabs to display
    } else if (type === 'text') {
      res.set({ 'Content-Disposition': 'attachment; filename="HOMD_crispr_cas_table' + dt.today + '_' + dt.seconds + '.txt"' })
    } else if (type === 'excel') {
      res.set({ 'Content-Disposition': 'attachment; filename="HOMD_crispr_cas_table' + dt.today + '_' + dt.seconds + '.xls"' })
    } else {
      // error
      console.log('Download table format ERROR')
    }
    res.send(tableTsv)
    res.end()
    
})
router.get('/pg/:type/:pg', function dld_pg (req, res) {
    console.log('in dnld pg')
    //console.log(req.params)
    let pg = req.params.pg
    let dt = helpers.get_today_obj()
    const type = req.params.type   // sha256 OR targz are only choices
        
    let fullpath
    if(type === 'sha256'){
        fullpath = path.join(ENV.PATH_TO_STATIC_DOWNLOADS,'pangenomes/V11.02/targz',pg+'.tar.gz.sha256')
    }else{
        fullpath = path.join(ENV.PATH_TO_STATIC_DOWNLOADS,'pangenomes/V11.02/targz',pg+'.tar.gz')
    }
    res.download(fullpath)
    return 
    
})
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function create_full_crispr_table(lookup_obj,header_txt) {
    let text = header_txt+'\n'
    let header_array = ['Genome-ID','Contig','Operon','Operon Pos','Prediction','Crisprs','Distances','Predicion_cas','Prediction_crisprs']
    text += header_array.join('\t')+'\n'
    //console.log(lookup_obj)
    for(let gid in lookup_obj){
       
       
       for(let n in lookup_obj[gid]){
           text += gid+'\t'+lookup_obj[gid][n].contig
           text += '\t'+lookup_obj[gid][n].operon
           text += '\t'+lookup_obj[gid][n].operon_pos
           text += '\t'+lookup_obj[gid][n].prediction
           text += '\t'+lookup_obj[gid][n].crisprs
           text += '\t'+lookup_obj[gid][n].distances
           text += '\t'+lookup_obj[gid][n].prediction_cas
           text += '\t'+lookup_obj[gid][n].prediction_crisprs
           
           text += '\n'
       }
    }
    return text
}
function create_phage_table(sql_rows,header_array,search_term) {
    let text ='::Search String: "'+search_term+'"\n'
    text += header_array.join('\t') + '\n'
    for(let n in sql_rows){
        //console.log('sql_rows[n]',sql_rows[n])
        //['Fasta_ID','Genome_ID','Contig','Predictor','seq_length', 'bakta_core_product','bakta_core_note','bakta_EC','bakta_GO','bakta_COG',
        //  'accession','description']
        if(sql_rows[n].seq){
           text += sql_rows[n].search_id +'\t'+sql_rows[n].genome_id+'\t'+sql_rows[n].contig
           text += '\t'+sql_rows[n].predictor+'\t'+sql_rows[n].seq_length
           text += '\t'+sql_rows[n].accession
           text += '\t'+sql_rows[n].description
           text += '\n'
        }
    }
    return text
}

////
async function stream_sqlquery_download(q, fname, res, format, type) {
    console.log('in stream_sqlquery_download',format,type)
    // IMPORTANT: q must have defline and sequence elements
    // format is fasta or table
    if(format === 'fasta' && type === 'excel'){
        type = 'text'
    }
    let conn,transformerStream
    if (type === 'browser') {
          res.set('Content-Type', 'text/plain') // <= important:plain - allows tabs to display
    } else if (type === 'text') {
        if(format==='fasta'){
            fname = fname + '.fasta'
        }else{
            fname = fname + '.csv'
        }
        res.setHeader('Content-Disposition', 'attachment; filename='+fname )
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Transfer-Encoding', 'chunked');
    } else if (type === 'excel') {
        fname = fname + '.xls'
        res.setHeader('Content-Disposition', 'attachment; filename='+fname )
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Transfer-Encoding', 'chunked');
    }
    const fastaObjectToStringStream = new Transform({
      writableObjectMode: true, // Accepts objects
      transform(chunk, encoding, callback) {
        // Convert the object to a string (e.g., JSON string) and push it as a string
        const arr = helpers.chunkSubstr(chunk.sequence.toString(), 100)
           //console.log('arr[0]',arr[0])
          // let str += arr.join('\n')
        //let record = JSON.stringify(chunk.defline) + '\n'+JSON.stringify(chunk.sequence.toString())+ '\n'
        let record = JSON.stringify(chunk.defline) + '\n'+arr.join('\n')+ '\n'
        this.push(record.replaceAll(/["]/g, ''));
         //this.push(JSON.stringify(chunk.defline+'\n'));
        callback();
      }
    });
 

    try {
        conn = await global.TDBConn();
        const queryStream = conn.connection.query(q).stream();
        
        
        
        // const Writer = new stream.Writable({
        //           objectMode: true,
        //           write(data, enc, cb) {
        //             console.log(data);
        //             cb();
        //           },
        //         });
        ///////
        // Assume getDatabaseStream() is a function that returns a Readable stream from your DB driver
        // Assume createCsvTransformer() is a Transform stream (e.g., using 'fast-csv' or similar)
        // const databaseStream = getDatabaseStream();
//         const csvTransformer = createCsvTransformer();
//         const writeStream
        // pipeline(
//           databaseStream,
//           csvTransformer,
//           writeStream,
//           (err) => {
//             if (err) {
//               console.error('Pipeline failed:', err);
//             } else {
//               console.log('Pipeline succeeded, file written to output.csv');
//             }
//           }
//         );
        // Here res IS the output stream:
        
        if(format === 'table'){
            //transformerStream = tableObjectToStringStream
            const passThroughStream = new Transform.PassThrough();
            let delimiter = '\t'
            passThroughStream.write(C.genome_table_headers.join(delimiter) + '\n');
            const csvStream = csv.format({ headers: false, delimiter: delimiter,writeHeaders: false }); 
            
            pipeline(queryStream, csvStream, passThroughStream, res, (err) => {
            if (err) {
                console.log(err);
            }
            console.log('streaming to download')
            });
            
            return
        }else if(format === 'fasta'){
            
            transformerStream = fastaObjectToStringStream
            pipeline(queryStream, transformerStream, res, (err) => {
            if (err) {
                console.log(err);
            }
            console.log('streaming to download')
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching data');
    } finally {
        if (conn) conn.release(); // Release the connection back to the pool
    }
    return
    
}
////
function create_anno_table(sql_rows,anno,gid) {
    let text = 'Annotation Table: '+anno.toUpperCase()+'\n'
    let headers
    
    if(anno === 'prokka'){
        //'Bakta' as anno,core_contig_acc as contig,core_ID as pid,core_start as start,core_end as stop,bakta_Product as product,bakta_Gene as gene,bakta_Length as length,"
        //        q += " bakta_EC,bakta_GO,bakta_COG,bakta_RefSeq,bakta_UniParc,bakta_UniRef
        // ['Genome_ID','Contig','Protein_ID','seq_length','start','end','Product','Gene','bakta_EC','bakta_GO','bakta_COG','bakta_RefSeq','bakta_UniParc','bakta_UniRef']
        headers = ['Genome_ID','Accession','Protein_ID','seq_length_na','seq_length_aa','start','end','Product','Gene','BAKTA_Product',
        'BAKTA_Gene']
        text += headers.join("\t")+'\n'
        for(let n in sql_rows){
            text += gid+'\t'+sql_rows[n].acc+'\t'+sql_rows[n].pid+'\t'+sql_rows[n].length_na+'\t'+sql_rows[n].length_aa
            text += '\t'+sql_rows[n].start+'\t'+sql_rows[n].stop+'\t'+sql_rows[n].product+'\t'+sql_rows[n].gene
            text += '\t'+sql_rows[n].bakta_product+'\t'+sql_rows[n].bakta_gene
            text += '\n'
        }
    }else{ // anno === ncbi
        //text='anno table: '+anno
        headers = ['Genome_ID','Accession','Protein_ID','seq_length_na','seq_length_aa','start','end','Product','Gene']
        text += headers.join("\t")+'\n'
        for(let n in sql_rows){
            text += gid+'\t'+sql_rows[n].acc+'\t'+sql_rows[n].pid+'\t'+sql_rows[n].length_na+'\t'+sql_rows[n].length_aa
            text += '\t'+sql_rows[n].start+'\t'+sql_rows[n].stop+'\t'+sql_rows[n].product+'\t'+sql_rows[n].gene
            text += '\n'
        }
             
    }
    
    return text
}
////
function create_anno_search_table(sql_rows,anno,headers,search_term) {
    let text = anno.toUpperCase()+' ::Search String: "'+search_term+'"\n'
    text += headers.join("\t")+'\n'
    
    if(anno === 'bakta'){
        //'Bakta' as anno,core_contig_acc as contig,core_ID as pid,core_start as start,core_end as stop,bakta_Product as product,bakta_Gene as gene,bakta_Length as length,"
        //        q += " bakta_EC,bakta_GO,bakta_COG,bakta_RefSeq,bakta_UniParc,bakta_UniRef
        // ['Genome_ID','Contig','Protein_ID','seq_length','start','end','Product','Gene','bakta_EC','bakta_GO','bakta_COG','bakta_RefSeq','bakta_UniParc','bakta_UniRef']
                
        for(let n in sql_rows){
            text += sql_rows[n].gid+'\t'+sql_rows[n].contig+'\t'+sql_rows[n].pid+'\t'+sql_rows[n].length
            text += '\t'+sql_rows[n].start+'\t'+sql_rows[n].stop+'\t'+sql_rows[n].product+'\t'+sql_rows[n].gene
            text += '\t'+sql_rows[n].bakta_EC+'\t'+sql_rows[n].bakta_GO+'\t'+sql_rows[n].bakta_COG
            text += '\t'+sql_rows[n].bakta_RefSeq+'\t'+sql_rows[n].bakta_UniParc+'\t'+sql_rows[n].bakta_UniRef
            text += '\n'
        }
    }else{
        //text='anno table: '+anno
       
        for(let n in sql_rows){
            text += sql_rows[n].gid+'\t'+sql_rows[n].acc+'\t'+sql_rows[n].pid+'\t'+sql_rows[n].lna
            text += '\t'+sql_rows[n].laa
            text += '\t'+sql_rows[n].start+'\t'+sql_rows[n].stop+'\t'+sql_rows[n].product+'\t'+sql_rows[n].gene
            
            text += '\n'
        }
             
    }
    
    return text
}
function create_taxon_table(otids, source, type, head_txt) {
    // source == table, hirearchy or level
    let txt = head_txt+'\n'
    let headers,lineage,old_lineage,otid_pretty,rank,cnts
    if(source === 'table'){
        let obj1 = C.taxon_lookup
        let obj2 = C.taxon_lineage_lookup
        //let obj3 = C.taxon_info_lookup  // discontinued 2025-02-24
        let obj4 = C.taxon_references_lookup 
        let obj5 = C.site_lookup 
        //console.log('in create_taxon_table: '+source)
        //console.log('otids',otids)
        
        txt +=  C.taxon_table_headers.join('\t')
        let o1,o2 //,o3,o4
        for(let n in otids){
            
            let otid = otids[n].toString()
            if(C.dropped_taxids.indexOf(otid) != -1){
                let data1 = C.taxon_lookup[otid]
                //console.log('data1',data1)
                // let r = [("000" + otid).slice(-3),,
//                         
//                         ]
                let row = 'HMT-'+('000' + otid).slice(-3) +  '\tDROPPED Taxon\t\t\t\t\t' + data1.genus+'\t'+data1.species  //r.join('\t')
                txt += '\n'+row
                
            }else{
            
                o1 = obj1[otid]
                 //console.log('otid',otid)
                 
                if(otid in obj2){
                   o2 = obj2[otid]
                }else {
                   o2 = {'domain':'','phylum':'','klass':'','order':'','family':'','genus':'','species':'','subspecies':''}
                }
                // if(otid in obj3){
//                    o3 = obj3[otid]
//                 }else {
//                    o3 = {'general':'','culta':'','pheno':'','prev':'','disease':''}
//                 }
                // if(otid in obj4){
//                    o4 = obj4[otid]
//                 }else {
//                    o4 = {NCBI_pubmed_search_count: '0',NCBI_nucleotide_search_count: '0',NCBI_protein_search_count: '0'}
//                 }
                // list! o1.type_strain, o1,genomes, o1,synonyms, o1.sites, o1.ref_strains, o1,rrna_sequences
                // clone counts
                if(o2.domain){  // weeds out dropped
                   //console.log('o2',o2)
                   let tstrains = o1.type_strains.join(' | ')
                   let gn = o1.genomes.join(' | ')
                   let syn = o1.synonyms.join(' | ')
                   let sites = obj5[otid].s1
                   if(obj5[otid].hasOwnProperty('s2')){
                       sites = sites + ' | ' +obj5[otid].s2
                   }
                   let rstrains = o1.ref_strains.join(' | ')
                   let rnaseq = o1.rrna_sequences.join(' | ')
                   
                   // per FDewhirst: species needs to be unencumbered of genus for this table
                   // let species_pts = o2.species.split(/\s/)
    //                species_pts.shift()
    //                let species = species_pts.join(' ')
                   
                   otid_pretty = 'HMT-'+("000" + otids[n]).slice(-3);
                   let species = o2.species.replace(o2.genus,'').trim()  // removing gens from species name
                   let r = [otid_pretty,o2.domain,o2.phylum,o2.klass,o2.order,o2.family,o2.genus,species,o2.subspecies,
                            o1.naming_status,o1.cultivation_status,sites,tstrains,rnaseq,syn,o1.ncbi_taxid
                            //,o4.NCBI_pubmed_search_count,o4.NCBI_nucleotide_search_count,o4.NCBI_protein_search_count
                            ,gn,o1.tlength_str
                            //,o3.general,o3.culta,o3.pheno,o3.prev,o3.disease
                            
                            ]
                            
                   let row = r.join('\t')
                   txt += '\n'+row
                }
            }
        }
    }else if(source === 'lineage'){
       headers = ['HMT-ID','Domain','Phylum','Class','Order','Family','Genus','Species','Subspecies']
       txt +=  headers.join('\t')+'\n'
       for(let n in otids){
            otid_pretty = 'HMT-'+("000" + otids[n]).slice(-3);
            //console.log('hmt',otids[n])
            //console.log(C.taxon_lineage_lookup[otids[n]])
            if(otids[n] in C.taxon_lineage_lookup){
                txt += otid_pretty+'\t'+C.taxon_lineage_lookup[otids[n]].domain
                txt += '\t'+C.taxon_lineage_lookup[otids[n]].phylum
                txt += '\t'+C.taxon_lineage_lookup[otids[n]].klass
                txt += '\t'+C.taxon_lineage_lookup[otids[n]].order
                txt += '\t'+C.taxon_lineage_lookup[otids[n]].family
                txt += '\t'+C.taxon_lineage_lookup[otids[n]].genus
                txt += '\t'+C.taxon_lineage_lookup[otids[n]].species
                txt += '\t'+C.taxon_lineage_lookup[otids[n]].subspecies
                txt += '\n'
            }
        }
    }else if(source === 'level'){
        headers = ['Domain','Domain_count','Phylum','Phylum_count','Class','Class_count','Order','Order_count',
                   'Family','Family_count','Genus','Genus_count','Species','Species_count','Subspecies','Oral_Taxon_ID'
                   ]
        txt +=  headers.join('\t')+'\n'
        
        for(let n in otids){
            otid_pretty = 'HMT-'+("000" + otids[n]).slice(-3);
            //console.log(C.taxon_lineage_lookup[otids[n]])
            old_lineage = ''
            if(otids[n] in C.taxon_lineage_lookup){
                for( let m in C.ranks){
                    rank = C.ranks[m]
                
                    lineage = old_lineage + C.taxon_lineage_lookup[otids[n]][rank]
                    //console.log(rank,lineage)
                    cnts = C.taxon_counts_lookup[lineage].taxcnt
                    if(rank == 'subspecies' ){
                          txt += C.taxon_lineage_lookup[otids[n]]['subspecies']+'\t'+otid_pretty // no counts
                    }else if(rank == 'species' ){
                      if(C.taxon_lineage_lookup[otids[n]]['subspecies'] == ''){
                         old_lineage = lineage
                      }else {
                         old_lineage = lineage+';'
                      }
                      txt += C.taxon_lineage_lookup[otids[n]]['species']+'\t'+cnts+'\t'
                    }else {
                       old_lineage = lineage+';'
                       txt += C.taxon_lineage_lookup[otids[n]][rank]+'\t'+cnts+'\t'
                    }
                }
                txt += '\n'
            }
        }
    }else if(source === 'hierarchy'){
        headers = ['Domain','Phylum','Class','Order','Family','Genus','Species','Subspecies','Oral_Taxon_ID',
                   'Domain_Taxon_Count','Domain_Seq_Count','Domain_Clone_Count',
                   'Phylum_Taxon_Count','Phylum_Seq_Count','Phylum_Clone_Count',
                   'Class_Taxon_Count','Class_Seq_Count','Class_Clone_Count',
                   'Order_Taxon_Count','Order_Seq_Count','Order_Clone_Count',
                   'Family_Taxon_Count','Family_Seq_Count','Family_Clone_Count',
                   'Genus_Taxon_Count','Genus_Seq_Count','Genus_Clone_Count',
                   'Species_Taxon_Count','Species_Seq_Count','Species_Clone_Count',
                   'Subspecies_Taxon_Count','Subspecies_Seq_Count','Subspecies_Clone_Count'
                   ]
        txt +=  headers.join('\t')+'\n'
        for(let n in otids){
            otid_pretty = 'HMT-'+("000" + otids[n]).slice(-3);
            old_lineage = ''
            if(otids[n] in C.taxon_lineage_lookup){
                for( let m in C.ranks){
                    rank = C.ranks[m]
                    txt += C.taxon_lineage_lookup[otids[n]][rank] +'\t'
                }
                txt += otid_pretty+'\t'
                // tax_counts
                for( let m in C.ranks){
                    rank = C.ranks[m]
                    lineage = old_lineage + C.taxon_lineage_lookup[otids[n]][rank]
                    cnts = C.taxon_counts_lookup[lineage]
                    //console.log(lineage)
                    //console.log(cnts)
                    txt += cnts.taxcnt +'\t'+cnts.gcnt +'\t'+cnts.refcnt +'\t'
                    if(rank == 'species' ){
                      if(C.taxon_lineage_lookup[otids[n]]['subspecies'] == ''){
                         old_lineage = lineage
                      }else {
                         old_lineage = lineage+';'
                      }
                    }else {
                      old_lineage = lineage+';'
                    }
                }
                // are clone counts the same as refseq counts????
                txt += '\n'
            }
        }
        
    }else {
       // source ERROR
       return 'ERROR'
    }
   
    return txt
}
//
function create_table_from_sql_query (sqlrows, startText) {
    //console.log('in create_table_from_sql_query')
    let txt = startText + '\n'
    let tmp,data,i,n,hmt
    const headersRow = Object.keys(sqlrows[0])
    txt += headersRow.join('\t')+'\n'
    //console.log('headersRow',headersRow)
    for(n in sqlrows){
        tmp = []
        for(i in headersRow){
          data = []
          if(headersRow[i] == 'otid'){
              hmt = helpers.make_otid_display_name(sqlrows[n][headersRow[i]])
              data.push(hmt)
          }else{
              data.push(sqlrows[n][headersRow[i]])
          }
          tmp.push(data)
          //console.log('hd',sqlrows[n][headersRow[i]])
        }
        txt += tmp.join('\t')
        txt += '\n'
    }
    return txt
}
function create_full_genome_table_gtdb (sqlrows, startText) {
    let txt = startText + '\n'
    let tmp,data,i,n,hmt
    //console.log('in create_full_genome_table_gtdb',txt)
    const headersRow = ['Genome-ID','HMT-ID','GTDB Taxonomy']
    txt += headersRow.join('\t')+'\n'
    //console.log('sqlrows',headersRow)
    for(n in sqlrows){

        //console.log('sqlrows[n]',sqlrows[n])
        //hmt = helpers.make_otid_display_name(sqlrows[n].HMT_ID)

        hmt = sqlrows[n].HMT_ID
        tmp = [sqlrows[n].GENOME_ID, hmt, sqlrows[n].GTDB_taxonomy]
        
        txt += tmp.join('\t')
        txt += '\n'
    }
    return txt
}
// ////////////////////////////
function create_genome_table (gids, source, type, startText) {
  let txt = startText + '\n'
  if (source === 'table') {
    const headersRow = ['Genome-ID', 'Oral_Taxon-ID', 'Genus', 'Species', 'SubSpecies', 'Strain','No. Contigs',  'Total Length',   'Category','GC %']
    txt += headersRow.join('\t')+'\n'
    ///console.log('SEQF5379.1',C.genome_lookup['SEQF5379.1'])
    for (let n in gids) {
      const gid = gids[n]
      const obj = C.genome_lookup[gid]
      //console.log(obj)
      // per FDewhirst: species needs to be unencumbered of genus for this table
      //let species = obj.species.replace(obj.genus,'').trim()
      let genus = C.taxon_lookup[obj.otid].genus
      let species = C.taxon_lookup[obj.otid].species
      let subspecies = C.taxon_lookup[obj.otid].subspecies
      let hmt = helpers.make_otid_display_name(obj.otid)
      const r = [ gid, hmt, genus, species, subspecies, obj.strain, obj.contigs, obj.combined_size, obj.category,obj.gc]
      txt += r.join('\t') +'\n'
    }
  }
  // console.log(txt)
  return txt
}

// --- Example Usage ---
// const fs = require('fs');
// const https = require('https');
// const path = require('path');
// const fileUrl = 'https://code.visualstudio.com/shortcuts/keyboard-shortcuts-windows.pdf';
// const destination = path.join(__dirname, 'downloaded_file.pdf');
// 
// downloadFile_stream(fileUrl, destination, (err) => {
//     if (err) {
//         console.error('Download failed:', err.message);
//     } else {
//         console.log(`Download successful! File saved to ${destination}`);
//     }
// });
const downloadFile_stream = (url, destinationPath, callback) => {
    // Create a writable stream to the destination file
    const file = fs.createWriteStream(destinationPath);

    // Make the HTTP request
    const request = https.get(url, (response) => {
        // Check if the response status is OK
        if (response.statusCode !== 200) {
            fs.unlink(destinationPath, () => { // Delete the partial file
                callback(new Error(`Failed to download: Status Code ${response.statusCode}`));
            });
            return;
        }

        // Pipe the response stream (readable) to the file stream (writable)
        response.pipe(file);

        // Handle the 'finish' event to know when the download is complete
        file.on('finish', () => {
            file.close(callback); // Close the stream and call the callback
        });
    });

    // Handle errors during the request (e.g., network issues)
    request.on('error', (err) => {
        // Delete the (partial) file on error
        fs.unlink(destinationPath, () => callback(err)); 
    });
    
    // Handle errors from the file system (e.g., permissions)
    file.on('error', (err) => {
        fs.unlink(destinationPath, () => callback(err)); 
    });
};



export default router;