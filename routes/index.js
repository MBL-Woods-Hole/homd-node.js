'use strict'
const express = require('express')
const router = express.Router()
const fs        = require('fs-extra')
// const fs   = require('fs-extra')
const path  = require('path')
const helpers = require('./helpers/helpers')
// const url = require('url')
// const ds = require('./load_all_datasets')
const CFG = require(app_root + '/config/config')
const C = require(app_root + '/public/constants')
const { exec, spawn } = require('child_process');
const queries = require(app_root + '/routes/queries')
// let timestamp = new Date() // getting current timestamp
// var rs_ds = ds.get_datasets( () => {
var browseDir = require("browse-directory");
const { v4: uuidv4 } = require('uuid'); // I chose v4 ‒ you can select othersc
//const Stream = require( 'stream-json/streamers/StreamArray');
/* GET home page. */
router.get('/', function index(req, res) {
  
  //console.log('Session ID:',req.session.id)
  //console.log('CFG.ENV :',CFG.ENV )
  res.render('pages/home', {
    title: 'HOMD :: Human Oral Microbiome Database',
    pgname: 'home', // for AbountThisPage
    config: JSON.stringify(CFG),
    ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version, tax_ver: C.homd_taxonomy_version }),
    user: JSON.stringify(req.user || {})
    

  })
})
router.get('/blastdir=*', function taxon(req, res) {
  // sequence server
  console.log('blastdir=*')
  var url = req.url;
  console.log(url)
  // /blastdir=zvCJASB75nUIIKUL4s5y
  let dir = url.split('=')[1]
  let dirpath = path.join(CFG.PATH_TO_SS_DIRS, dir)
  let filepath = path.join(dirpath,'sequenceserver-xml_report.xml')
  console.log('file',filepath)
  try{
     let stats = fs.statSync(filepath)
     if(stats.isFile()){
           let pyscript = path.join(CFG.PATH_TO_SCRIPTS,'xml2tree.py')
           //let cmd = pyscript +' -in '+ filepath
           // -mp == Muscle Path  -id == In Directory
           let treefilepath = path.join(CFG.PATH_TO_SS_DIRS,dir,'tree.relabel.svg')
           const ls = spawn(CFG.PYTHON_EXE, [pyscript,'-c',CFG.CONDABIN,"-id", dirpath]);
           ls.stdout.on("data", data => {
                console.log(`stdout: ${data}`);
            });

            ls.stderr.on("data", data => {
                console.log(`stderr: ${data}`);
                console.log(data.toString().trim())
                if(data.toString().trim() === 'Low Hit Count'){
                    console.log('We Got low hits')
                    var error = fs.readFileSync(path.join(CFG.PATH_TO_SS_DIRS,dir,'err.txt'),'utf8')
                    res.render('pages/blast/tree', {
                          title: 'HOMD :: Human Oral Microbiome Database',
                          pgname: '', // for AbountThisPage
                          config: JSON.stringify(CFG),
                          ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version, tax_ver: C.homd_taxonomy_version }),
                          user: JSON.stringify(req.user || {}),
                          file_dir: path.join(CFG.PATH_TO_SS_DIRS,dir),
                          svg_path: '',
                          svg: '',
                          error: 'LOW HIT Count',
                          newick: ''
                    })
                    return
                }
                
            });

            ls.on('error', (error) => {
                console.log(`error: ${error.message}`);
            });

            ls.on("close", code => {
                console.log(`child process exited with code ${code}`);
                if(code === 0){
                    var stats = fs.statSync(treefilepath)
                    var fileSizeInBytes = stats.size;
                    console.log('File size',fileSizeInBytes)
                    if(fileSizeInBytes === 0){
                        var newick = fs.readFileSync(path.join(CFG.PATH_TO_SS_DIRS,dir,'newick.tre'),'utf8')
                        var error = fs.readFileSync(path.join(CFG.PATH_TO_SS_DIRS,dir,'err.txt'),'utf8')
                        console.log('newick',newick)
                        res.render('pages/blast/tree', {
                          title: 'HOMD :: Human Oral Microbiome Database',
                          pgname: '', // for AbountThisPage
                          config: JSON.stringify(CFG),
                          ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version, tax_ver: C.homd_taxonomy_version }),
                          user: JSON.stringify(req.user || {}),
                          file_dir: path.join(CFG.PATH_TO_SS_DIRS,dir),
                          svg_path: '',
                          svg: '',
                          error: error,
                          newick: newick
                        })
                        return
                    }else{
                        fs.readFile(treefilepath, 'utf8', function readSVGTree (err, data) {
                           if (err) {
                              console.log(err)
                           } else {
                            res.render('pages/blast/tree', {
                              title: 'HOMD :: Human Oral Microbiome Database',
                              pgname: '', // for AbountThisPage
                              config: JSON.stringify(CFG),
                              ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version, tax_ver: C.homd_taxonomy_version }),
                              user: JSON.stringify(req.user || {}),
                              file_dir: path.join(CFG.PATH_TO_SS_DIRS,dir),
                              svg_path: '/tree/'+dir+'/tree.svg',
                              svg: data,
                              error: '',
                              newick: ''
                            })
                          }
                        })
                    }
                }else{
                   //req.flash('fail', 'Tree Script Failure: '+filepath);
                   //res.redirect('/')
                }
            });
    }else{
      req.flash('fail', 'Could Not Find File: '+filepath);
      res.redirect('/')
    }
  }catch(e){
      req.flash('fail', 'Could Not Find File: '+filepath);
      res.redirect('/')
  }
  
  
})
router.get('/taxon=(\\d+)', function taxon(req, res) {
  // sequence server
  //console.log('taxon=/.d/')
  var url = req.url;
  //console.log(url)
  let otid = url.split('=')[1]
  res.redirect('/taxa/tax_description?otid='+otid)
  
})
router.get('/idn=SEQF(\\d+.\\d)', function idn(req, res) {
  // sequence server
  //console.log('idn=SEQF')
  var url = req.url;
  //console.log(url)
  let gid = url.split('=')[1]
  res.redirect('/genome/genome_description?gid='+gid)
 
})
router.get('/get_seq=*', function jb_seq(req, res) {
  // jbrowse link to retrieve seq
  //console.log('get_seq=')
   // https://www.homd.org/get_seq=xxxxxx&type=yy
   // https://www.homd.org/get_seq=KDE71052.1&type=aa
  var url = req.url;
  //console.log(url)
  // /get_seq=KDE71052.1&type=aa
  let type,pid,sp,db,anno
  sp = url.split('&')
  type = sp[1].split('=')[1].toLowerCase() // must be aa,AA,na or NA 
  pid = sp[0].split('=')[1]
  //console.log(type,pid)
  // PROKKA pids (starting as SEQFXXX
  if(type === 'aa'){   // NCBI
      if(pid.substring(0,4) === 'SEQF'){
          db = "`PROKKA_faa`.`protein_seq`"
          anno = 'PROKKA'
       }else{
          db = "`NCBI_faa`.`protein_seq`"
          anno = 'NCBI'
       }
  }else{   //req.body.type == 'na':   // NCBI  na
      if(pid.substring(0,4) === 'SEQF'){
          db = "`PROKKA_ffn`.`ffn_seq`"
          anno = 'PROKKA'
       }else{
          db = "`NCBI_ffn`.`ffn_seq`"
          anno = 'NCBI'
       }
  }
  let q = 'SELECT seq_id, mol_id, UNCOMPRESS(seq_compressed) as seq FROM ' + db
  q += " WHERE protein_id='" + pid + "'"
  //console.log(q)
  
  const fileName = 'HOMD_'+anno+'_'+pid+'_'+type.toUpperCase()+'.fasta'
  
  TDBConn.query(q, (err, rows) => {
  //ADBConn.query(q, (err, rows) => {
    if (err) {
        console.log(err)
        res.send(err)
        return
    }
    //console.log('rows',rows)
    let sequence = '',gid,acc,show = ''
    let length = 0
    if(rows.length === 0){
        sequence += "No sequence found in database"
    }else{
       length = rows[0].seq.length
       gid = rows[0].seq_id
       acc = rows[0].mol_id
       const seqstr = (rows[0].seq).toString()
       const arr = helpers.chunkSubstr(seqstr, 100)
       sequence += arr.join('\n')
       show = ">"+gid+' | '+anno+' | Protein_id: '+pid+' | Accession: '+acc+' | length '+length.toString()+'\n'
       
    }
    show = show + sequence
    res.writeHead(200, {
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Type': 'text/plain',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    })
    res.end(show)
  })
})
router.get('/download_file', function search(req, res) {
  //let page = req.params.pagecode
  let fullpath = req.query.filename
  helpers.print('file path: '+fullpath)
  res.download(fullpath)
  //res.end()
})


router.get('/download', function download(req, res) {
  // renders the overall downlads page
  res.render('pages/download', {
    title: 'HOMD :: Human Oral Microbiome Database',
    pgname: 'download', // for AbountThisPage
    config: JSON.stringify(CFG),
    ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version, tax_ver: C.homd_taxonomy_version }),
    user: JSON.stringify(req.user || {})

  })
})
//
router.get('/poster', function poster(req, res) {
  res.render('pages/poster', {
    title: 'HOMD :: Human Oral Microbiome Database',
    pgname: '', // for AbountThisPage
    config: JSON.stringify(CFG),
    ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version, tax_ver: C.homd_taxonomy_version }),
    user: JSON.stringify(req.user || {})

  })
})


//
//

router.post('/anno_protein_search', function anno_protein_search(req, res) {
    console.log('in POST::anno_protein_search')
    console.log('req.body',req.body)
    let obj,data,gid,name,resultObj={}
    let anno = req.body.anno
    let search_text = req.body.search_text
    //console.log(req.session)
    //console.log('chose:',anno,Object.values(req.session['site_search_result_'+anno]).length)
    //console.log('sess-ncbi',req.session.site_search_result.ncbi)
    
    //resultObj = req.session['site_search_result_'+anno]
    
    res.send(create_protein_table(anno, resultObj, search_text))
})

router.post('/get_annotations_counts_sql', function get_annotations_counts_sql(req, res) {
    console.log('POST::get_annotations_counts_sql')
    //console.log(req.body)
    const searchText = req.body.intext
    let phits=0, nhits=0, pdata={},ndata={},gid,ssp,organism
    let q_prokka = "SELECT * from PROKKA_meta.orf WHERE protein_id='"+searchText+"' OR accession = '"+searchText+"'"
    let q_ncbi = "SELECT * from NCBI_meta.orf WHERE protein_id ='"+searchText+"' OR accession = '"+searchText+"'"
    console.log('q_prokka',q_prokka)

    TDBConn.query(q_prokka, (err, prows) => {
        if (err) {
          console.log("prokka select error",err)
          return
        }
        if(prows.length >0){
            //[pgid_count, ppid_count,ngid_count, npid_count]
            phits = prows
            for(let n in prows){
                gid = prows[n].seq_id  // genomeid SEQF
                
                
                if(!pdata.hasOwnProperty(gid)){
                   
                   pdata[gid] = []
                }
                pdata[gid].push(prows[n])
            }
        }
        
        TDBConn.query(q_ncbi, (err, nrows) => {
           if (err) {
             console.log("ncbi select error",err)
             return
           }
           if(nrows.length >0){
             console.log('ncbi zero length')
            //[pgid_count, ppid_count,ngid_count, npid_count]
            nhits = nrows
            for(let n in nrows){
                gid = nrows[n].seq_id
                
                if(!ndata.hasOwnProperty(gid)){
                   ndata[gid] = []
                }
                ndata[gid].push(nrows[n])
            }
           }
           let obj = {phits:phits,nhits:nhits,pdata:pdata,ndata:ndata}
           console.log('tryobj')
           console.log('obj',phits,nhits,pdata,ndata)
           req.session.anno_search_full = obj
           res.send(JSON.stringify(obj))
        })
           
    })
})
router.post('/get_annotations_counts_grep', function get_annotations_counts_grep(req, res) {
    console.log('POST::get_annotations_counts_grep')
    //console.log(req.body)
    

    var dirname = uuidv4(); // '110ec58a-a0f2-4ac4-8393-c866d813b8d1'
    
    //req.setTimeout(240000);
    //const searchText = req.body.intext
    const searchText = req.body.intext

    let anno //= req.body.anno_type  // ncbi or prokka
    let acc,pid,gid,prod,organism=''
    let pgid_count=0, ppid_count=0,ngid_count=0, npid_count=0

   
       let prokka_gid_lookup = {}, ncbi_gid_lookup = {}
       
       let full_data = '',orfrow,datapath
       //https://github.com/uhop/stream-json/wiki/StreamValues

       if(CFG.SITE === 'localmbl' || CFG.SITE === 'localhome'){
         datapath = path.join(CFG.PATH_TO_DATA,"homd_GREP_Search*")  //homd_ORFSearch*
       }else{
          datapath = path.join(CFG.PATH_TO_DATA,"homd_GREP_Search*")  //homd_ORFSearch*
       }
       let grep_cmd = CFG.GREP_CMD + ' -ih "'+searchText+'" '+ datapath  //homd_ORFSearch*

        console.log('grep_cmd1',grep_cmd)
        let anno_path = path.join(CFG.PATH_TO_TMP,dirname)
        let panno_path = path.join(CFG.PATH_TO_TMP,dirname,'prokka')
        let nanno_path = path.join(CFG.PATH_TO_TMP,dirname,'ncbi')
        fs.mkdirSync(anno_path)
        fs.mkdirSync(panno_path)
        fs.mkdirSync(nanno_path)
        let pfile_name = path.join(panno_path,'data')
        let nfile_name = path.join(nanno_path,'data')
        
        var pstream = fs.createWriteStream(pfile_name, {flags:'a'});
        var nstream = fs.createWriteStream(nfile_name, {flags:'a'});
        let child = spawn("/bin/sh", ['-c',grep_cmd], { 
            //, (err, stdout, stderr) => {
        }) 
    
        child.stdout.on('data', (data) => {

          //console.log(`child stdout:\n${data}`);
            //console.log('gathering grep data')
            //console.log(typeof data)

//             let lines = data.toString().split('\n')
//             for(let i in lines){
//                let line = lines[i].trim()
//            
//                let pts = line.split('|')
//                //if(pts.length === 9 && parseInt(pts[pts.length -1]) ){
//                console.log('line',line)
//                //if(pts.length === 9){
//                    anno = pts[0]
//                    gid = pts[1]
//                
//                    if(lines[i].substring(0,4) === 'ncbi'){
//                         //let fname_path = path.join(anno_path,'ncbi_'+gid)
//                           nstream.write(line + "\n");
//                           ncbi_gid_lookup[gid]=1
//                           npid_count += 1
//                    }else if(lines[i].substring(0,6) === 'prokka'){
//                     
//                         pstream.write(line + "\n");
//                         prokka_gid_lookup[gid]=1
//                         ppid_count += 1
//                     
//                    }else{
//                        //console.log('-i',line)
//                        //pass for now
//                    }
//                 //}else{
//                    //console.log('remainder',line)
//                 //}
//             }
            
            
            full_data += data.toString()

        });

        child.stderr.on('data', (data) => {
          console.error(`child stderr:\n${data}`);
        });
    
        child.on('exit', function (code, signal) {
          console.log('child process exited with ' +`code ${code} and signal ${signal}`);
          
          let lines = full_data.toString().split('\n')
          for(let i in lines){
               let line = lines[i].trim()
               
               let pts = line.split('|')
               //if(pts.length === 9 && parseInt(pts[pts.length -1]) ){
               //console.log('line',line)
               //if(pts.length === 9){
                   anno = pts[0]
                   gid = pts[1]
                   
                   if(lines[i].substring(0,4) === 'ncbi'){
                        //let fname_path = path.join(anno_path,'ncbi_'+gid)
                          nstream.write(line + "\n");
                          ncbi_gid_lookup[gid]=1
                          npid_count += 1
                   }else if(lines[i].substring(0,6) === 'prokka'){
                        
                        pstream.write(line + "\n");
                        prokka_gid_lookup[gid]=1
                        ppid_count += 1
                        
                   }else{
                       //console.log('-i',line)
                       //pass for now
                   }
                //}else{
                   //console.log('remainder',line)
                //}
          }
          
          
          
          pstream.end();
          nstream.end();
          if(code === 0){

             //console.log(full_data)
        

            //pgid_count = Object.keys(req.session.site_search_result_prokka).length // genome_count
            //ngid_count = Object.keys(req.session.site_search_result_ncbi).length // genome_count
            pgid_count = Object.keys(prokka_gid_lookup).length
            ngid_count = Object.keys(ncbi_gid_lookup).length
            //console.log('prokka_gid_lookup.length',pgid_count)
            //console.log('ncbi_gid_lookup.length',ngid_count)
            //let size = Buffer.byteLength(JSON.stringify(req.session))
            //console.log('req.session size(KB):',size/1024)
            // on dev  req.session size(KB): 38827.2841796875  == 38 MB   tranposase
            // req.session size(KB): 278541.3876953125 == 278 MB  family

            //console.log(ar,ar.length)
            //console.log(gid_count, pid_count)
            req.session.anno_search_dirname = dirname
            
            //console.log('counts',pgid_count, ppid_count,ngid_count, npid_count)
            res.send(JSON.stringify([pgid_count, ppid_count,ngid_count, npid_count]))
          }else{  //end if code ==0
             console.log('nothing found')
             res.send(JSON.stringify([0,0,0,0]))
          }
        });

})

//
//  Global Site Search
//
router.post('/site_search', function site_search(req, res) {
  
  console.log('in index.js POST -Search')
  console.log(req.body)
  const searchText = req.body.intext
  const searchTextLower = req.body.intext.toLowerCase()
  
////////////// TAXON NAMES ////////////////////////////////////////////////////////////////////////////

  // lets search the taxonomy names
  // Bacterial Taxonomy Names
  //helpers.print(Object.keys(C.taxon_counts_lookup)[0])
  const taxonList = Object.values(C.taxon_lineage_lookup).filter(function (e) {
    if (Object.keys(e).length !== 0) {
      // console.log(e)
      if (e.domain.toLowerCase().includes(searchTextLower) ||
        e.phylum.toLowerCase().includes(searchTextLower) ||
        e.klass.toLowerCase().includes(searchTextLower) ||
        e.order.toLowerCase().includes(searchTextLower) ||
        e.family.toLowerCase().includes(searchTextLower) ||
        e.genus.toLowerCase().includes(searchTextLower) ||
        e.species.toLowerCase().includes(searchTextLower) ||
        e.subspecies.toLowerCase().includes(searchTextLower)) {
        return e
      }
    }
    //
  })
  //  Now get the otids
  const taxonOtidObj = {}
  let pototid = parseInt(searchTextLower)
  if(pototid && pototid in C.taxon_lookup){
     if(C.dropped_taxids.indexOf(pototid.toString()) != -1){
        taxonOtidObj[pototid] = 'This taxon has been dropped from HOMD.'
     }else{
        console.log('got OTID int')
        taxonOtidObj[pototid] = C.taxon_lineage_lookup[pototid].domain
        taxonOtidObj[pototid] += ';' + C.taxon_lineage_lookup[pototid].phylum
        taxonOtidObj[pototid] += ';' + C.taxon_lineage_lookup[pototid].klass
        taxonOtidObj[pototid] += ';' + C.taxon_lineage_lookup[pototid].order
        taxonOtidObj[pototid] += ';' + C.taxon_lineage_lookup[pototid].family
        taxonOtidObj[pototid] += ';' + C.taxon_lineage_lookup[pototid].genus
        taxonOtidObj[pototid] += ';' + C.taxon_lineage_lookup[pototid].species
        taxonOtidObj[pototid] += ';' + C.taxon_lineage_lookup[pototid].subspecies
     }
  }
  const taxonOtidList = taxonList.map(e => e.otid)
  
  for (let n in taxonOtidList) {
    const otid = taxonOtidList[n]
    taxonOtidObj[otid] = C.taxon_lineage_lookup[otid].domain
    taxonOtidObj[otid] += ';' + C.taxon_lineage_lookup[otid].phylum
    taxonOtidObj[otid] += ';' + C.taxon_lineage_lookup[otid].klass
    taxonOtidObj[otid] += ';' + C.taxon_lineage_lookup[otid].order
    taxonOtidObj[otid] += ';' + C.taxon_lineage_lookup[otid].family
    taxonOtidObj[otid] += ';' + C.taxon_lineage_lookup[otid].genus
    taxonOtidObj[otid] += ';' + C.taxon_lineage_lookup[otid].species
    //if (C.taxon_lineage_lookup[otid].subspecies !== '') {
      taxonOtidObj[otid] += ';' + C.taxon_lineage_lookup[otid].subspecies
    //}

    // {
    // 'genus':C.taxon_lineage_lookup[otid].genus,'species':C.taxon_lineage_lookup[otid].species
    // }
  }


  
////////// GENOMES ////////////////////////////////////////////////////////////////////////////////
  
  
  let add_genome_to_otid = {}
  // Genome  Metadata
  const allGidObjList = Object.values(C.genome_lookup)
  // let gid_lst = Object.keys(C.genome_lookup).filter(item => ((item.toLowerCase()+'').includes(searchTextLower)))
  const gidKeyList = Object.keys(allGidObjList[0])
  const gidObjList = allGidObjList.filter(function (el) {
    for (let n in gidKeyList) {
      if (Array.isArray(el[gidKeyList[n]])) {
        // we're missing any arrays
      } else {
        if ( Object.prototype.hasOwnProperty.call(el, gidKeyList[n]) && (el[gidKeyList[n]]).toString().toLowerCase().includes(searchTextLower)) {
          add_genome_to_otid[el.otid] = el.genus+' '+el.species
          return el.gid
        }
      }
    }
  })
  //helpers.print(gidObjList[0])
  const gidLst = gidObjList.map(e => ({gid:e.gid, species: '<i>'+e.genus+' '+e.species+'</i>'}))
  gidLst.sort(function (a, b) {
       return helpers.compareStrings_alpha(a.species, b.species);
  })
  //console.log('gidObjList',gidObjList)



///////////// OTIDs /////////////////////////////////////////////////////////////////////////////
  // OTID Metadata
  const allOtidObjList = Object.values(C.taxon_lookup)
  const otidKeyList = Object.keys(allOtidObjList[0])
  //helpers.print(['allOtidObjList[0]',allOtidObjList[0]]) // site is undefined
  let otidObjList = allOtidObjList.filter(function (el) {
    for (let n in otidKeyList) {
      //console.log( 'el[otidkeylist[n]]',el[otidkeylist[n]] )
      if (Array.isArray(el[otidKeyList[n]]) && el[otidKeyList[n]].length > 0) {
        // we're catching any arrays: rrna_sequences, synonyms, sites, pangenomes, type_strains, ref_strains
        //console.log('x0',el[otidKeyList[n]])
          if(el[otidKeyList[n]].findIndex(element => element.toLowerCase().includes(searchTextLower)) !== -1){
              return el.otid
          }

      } else {
        
        //helpers.print(['el',el])
        
        if ( Object.prototype.hasOwnProperty.call(el, otidKeyList[n]) 
             && el[otidKeyList[n]]
             && el[otidKeyList[n]].toString().toLowerCase().includes(searchTextLower)) {
          return el.otid
        }
       
      }
    }
  })
  
  const otidLst = otidObjList.map(e => ({otid:e.otid, species: '<i>'+e.genus+' '+e.species+'</i>'}))
  //console.log('otidLst',otidLst[0])
  otidLst.sort(function (a, b) {
       return helpers.compareStrings_alpha(a.species, b.species);
  })
  //console.log(otidLst)
  //let otidLst = []
  // if(Object.keys(add_genome_to_otid).length > 0){
//      
//       for(let otid in add_genome_to_otid){
//           let o = {otid: otid, species: '<i>'+add_genome_to_otid[otid]+'</i>'}
//           if(){
//           
//           }
//           otidLst.push({otid: otid, species: '<i>'+add_genome_to_otid[otid]+'</i>'})
//       }
//   }
  //console.log('otidLst[0]',otidLst)


  
  
///////////// CONTIGS /////////////////////////////////////////////////////////////////////////////

  // search contigs
  let contigObj_list = []
  //console.log('C.contig_lookup',C.contig_lookup )
  let all_contigs = Object.keys(C.contig_lookup)
  const contig_list = all_contigs.filter(el => {
    if (el.toLowerCase().indexOf(searchTextLower) !== -1) {
        return true;
    }
  });
  for(let n in contig_list){
      
      contigObj_list.push({contig:contig_list[n], gids: C.contig_lookup[contig_list[n]]})
  }
  
///////////// PHAGE /////////////////////////////////////////////////////////////////////////////


  //  Now the phage db
  // phageID, phage:family,genus,species, host:genus,species, ncbi ids
  // console.log(C.phage_lookup['HPT-000001'])
  // PHAGE Metadata
//   const allPhageObjList = Object.values(C.phage_lookup)
//   // let gid_lst = Object.keys(C.genome_lookup).filter(item => ((item.toLowerCase()+'').includes(searchTextLower)))
//   // console.log(allPhageObjList[0])
//   const pidKeyList = Object.keys(allPhageObjList[0])
//   const pidObjList = allPhageObjList.filter(function (el) {
//     for (let n in pidKeyList) {
//       // console.log(pidkeylist[n]+'-'+searchTextLower)
//       if (Array.isArray(el[pidKeyList[n]])) {
//         // we're missing any arrays
//         // return 0
//       } else {
//         if ((el[pidKeyList[n]]).toString().toLowerCase().includes(searchTextLower)) {
//           return el.pid
//         }
//         // return 0
//       }
//     }
//   })
//   // console.log(pidObjList)
//   
//   const phageIdLst = pidObjList.map(e => e.pid)
//////////// HELP PAGES //////////////////////////////////////////////////////////////////////////////  
  // help pages uses grep
  let helpLst = []
  let help_trunk = path.join(CFG.PROCESS_DIR,'views','partials','help')
  const grep_cmd = CFG.GREP_CMD + " -liR "+help_trunk + " -e '" + helpers.addslashes(searchText) + "'" 

  exec(grep_cmd, (err, stdout, stderr) => {
      if (stderr) {
        console.error('stderr',stderr);
        return;
      }
      //console.log('stdout',stdout);
      let fileLst = []
      if(stdout){
        fileLst = stdout.trim().split('\n')
      }
      if(fileLst.length > 0){
        for(let n in fileLst){
          //console.log('file',fileLst[n])
          let cleanfinal = fileLst[n].replace(help_trunk,'').replace(/^\//,'').replace(/\.ejs$/,'')
          helpLst.push(cleanfinal)
        }
      }
      //if(CFG.ENV == 'productionX'){
      let prokka_genome_count=0
      let prokka_gene_count=0
      let ncbi_genome_count=0
      let ncbi_gene_count=0
      // set req.session.site_search_result = {} here before annotation collection
      //req.session.site_search_result_prokka = {}
      //req.session.site_search_result_ncbi = {}
      console.log('st',searchText)
      res.render('pages/search_result', {
        title: 'HOMD :: Site Search',
        pgname: '', // for AbountThisPage
        config: JSON.stringify(CFG),
        ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version, tax_ver: C.homd_taxonomy_version }),
        user: JSON.stringify(req.user || {}),
        search_text: searchText,
        otid_list: JSON.stringify(otidLst),
        gid_list: JSON.stringify(gidLst),
        
        //let prokka_genome_count_lookup={},prokka_gene_count=0,ncbi_genome_count_lookup={},ncbi_gene_count=0
        num_prokka_genomes: prokka_genome_count,
        num_prokka_genes: prokka_gene_count,
        num_ncbi_genomes: ncbi_genome_count,
        num_ncbi_genes: ncbi_gene_count,
        
        
        taxon_otid_obj: JSON.stringify(taxonOtidObj),
        help_pages: JSON.stringify(helpLst),
        contig_list:JSON.stringify(contigObj_list),
        //phage_id_list: JSON.stringify(phageIdLst) // phageIDs
      })
   });
  
})
// }); // end pipeline
// })  // end anno query
module.exports = router

