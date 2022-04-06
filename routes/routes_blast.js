'use strict'
const express   = require('express');
var router    = express.Router()
const CFG     = require(app_root + '/config/config')
const fs        = require('fs-extra')
const fsp = require('fs').promises
const {exec, spawn} = require('child_process');
const multer  = require('multer')
const upload = multer({ dest: CFG.UPLOAD_DIR })
const path      = require('path')
const parser = require('xml2json');
const helpers   = require(app_root + '/routes/helpers/helpers')
const C       = require(app_root + '/public/constants')
const async = require('async')
var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = today.getFullYear();
today = yyyy + '-' + mm + '-' + dd;
var currentTimeInSeconds=Math.floor(Date.now()/1000); //unix timestamp in seconds

/*  test seqs    

 agtcgtactgggatctgaa
  
  >ds0|imput 1200
  agtcgtactggtaccggatctgaa
  >ds1|kefdgste5%$
  agtcgtactgggatctgaagtagaatccgt
  >ds2| let kefdgste5%$
  agtcgtactgggat
  ctgaagtagaatccatccgt
  
  >PC_634_1_FLP3FBN01ELBSX_orig_bc_ACAGAGT
CTGGGCCGTCTCAGTCCCAATGTGGCCGTACCCTCTGGCCGGCTACGTCATCGCCTTGGTGGGCCGTT
>PC_634_2_FLP3FBN01EG8AX_orig_bc_ACAGAGT
TTGGACCGTGTCTCAGTTCCAATGTGGGGGCCTTCCTCTCAGAACCCCTATCCATCGAAGGCTTGGTGGGCCGTTA
>PC_354_3_FLP3FBN01EEWKD_orig_bc_AGCACGA
TTGGGCCGTGTCTATGTGGCCGATCAGTCTCTTGGCTATGCATCATTGCCTTGGTAAGCCGTT
>PC_481_4_FLP3FBN01DEHK3_orig_bc_ACCAGCG
CTGGGCCGTGTCTCTCCCAATGTGGCCGTTCAACCTCTCAGTCCGGCTACTGATCGACTTGGTGAGCCGTT
*/  
// router.post('/blast_results', function blastResults(req, res) {
//         console.log('in blast_results-POST')
//         console.log('req.body:',req.body)
//         res.redirect('/blast/blast_results?id='+req.body.id+'&col='+req.body.col+'&dir='+req.body.dir)
// })
router.get('/blast_results_genome', function blastResults_genome(req, res) {
    console.log('in blast_results Genomic')
    console.log('req.query:',req.query)
    //console.log('req.body:',req.body)
    //console.log('req:',req)
    const blastID = req.query.id
    const filename = req.query.file || ''
    const blastquery = req.query.query || ''
    let ext,html_files=[],data=[],xml_files = [],query_strings=[]
    const renderFxn = (req, res, queries, genome_data, files, config, blastID) => {
          //console.log('htmlfiles',files)
          res.render('pages/blast/blast_results_genome', {
                  title: 'HOMD :: Blast Results', 
                  pgname: 'blast/blast',
                  config: JSON.stringify({ hostname: CFG.HOSTNAME, env: CFG.ENV, url: CFG.URL }),
                  hostname: CFG.HOSTNAME,
                  ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
                  queries: JSON.stringify(queries),
                  files: JSON.stringify(files),
                  blastParams: JSON.stringify(config),
                  blastID: blastID,
                  blastData: encodeURI(genome_data.toString()),
                  error: JSON.stringify({})
            })
    }
    
    if(Object.prototype.hasOwnProperty.call(req.session, 'blast')){
            //thisSessionBlast = JSON.parse(JSON.stringify(req.session.blast))
            //console.log('deleteing session blast')
            delete req.session.blast
    }

    // read directory CONFIG.json first
    let blastDir = path.join(CFG.PATH_TO_BLAST_FILES, blastID)
    let blastResultsDir = path.join(blastDir, 'blast_results')
    
    
    
    //console.log('blastfiles')
    //console.log(blastFiles)
    //try:  https://node.homd.info/blast/blast_results?id=1638297207475-44741
    let configFilePath = path.join(blastDir,'CONFIG.json')
    fs.readFile(configFilePath, function readConfig(err, configData) {
        if(err){
            req.flash('fail', 'blastID no longer Valid')
            res.redirect('/') // this needs to redirect to either refseq or genome
            return
        }else{
             // blast.out files are present (but are they complete?)
            let config = JSON.parse(configData)
             
            const result_html = getAllFilesWithExt(blastResultsDir, 'html')
            const result_xml = getAllFilesWithExt(blastResultsDir, 'xml')
            if(!result_html){
                throw new Error('The Blast ID "'+blastID+'" was not found.<br>Probably expired if you are using and old link.')
                return
            }
             
            for(let i=0; i < result_html.length; i++){
                html_files.push(path.join(blastResultsDir, result_html[i]))
            }
            for(let i=0; i < result_xml.length; i++){
                xml_files.push(path.join(blastResultsDir, result_xml[i]))
            }
            async.map(xml_files, helpers.readAsync, function asyncMapBlast(err, results) {
                let hitid_obj,hitids=[],hitid_collector={}
                for(let i=0; i<xml_files.length; i++){
                     
                    let query = helpers.parse_blast_query_xml(parser.toJson(results[i]), 'query')
                    query_strings.push({query:query, file: html_files[i]})
                    
                    hitid_obj = helpers.parse_blast_query_xml(parser.toJson(results[i]), 'homdhitids')
                    hitids.push(hitid_obj)
                    for(let n in hitid_obj.hitid_ary){
                        hitid_collector[hitid_obj.hitid_ary[n]] = 1
                    }
                 
                }
                //console.log('hitid_collector',hitid_collector)
                // if protein::need to query DB for start stop
                
                if(filename && blastquery){   // from drop menu (filename is html not xml)
                   fs.readFile(filename, 'utf8', function readBlasterFile(err, genome_data) {
                      renderFxn(req, res, query_strings, genome_data, html_files, config, blastID)
                   })
                 }
                //console.log('**data**',data)
                if(xml_files.length === 0){
                    // error no data
                    let errorFilePath = path.join(CFG.PATH_TO_BLAST_FILES, config.id, 'blasterror.log')
                    fs.readFile(errorFilePath, function tryReadErrorFile(err, content) {
                        if(err){
                            req.flash('fail', 'BLAST Failed with no data and no error information')
                            res.redirect(config.returnTo) // this needs to redirect to either refseq or genome
                            return            
                        }else{
                          // file exists throw error
                          //console.log('YYYY')
                          //throw new Error('BLAST Script Error: '+content)
                          //console.log('CONTENT',content.toString().trim())
                            if(content.toString().trim()){  // means there was true error NOT zero length
                            //pyerror = { code: 1, msg:'BLAST Script Error:: ' + content }
                                req.flash('fail', 'BLAST Script Error:: '+ content)
                                res.redirect(config.returnTo) // this needs to redirect to either refseq or genome
                                return
                            }
                        }
                    })
                }
                
                
                if(!blastID){
                    req.flash('fail', 'blastID no longer Valid')
                    res.redirect(config.blastFxn) // this needs to redirect to either refseq or genome
                    return
                }

                fs.readFile(html_files[0], 'utf8', function readBlasterFile(err, genome_data) {
                    renderFxn(req, res, query_strings, genome_data, html_files, config, blastID)
                })
                
            }) // end async map
           
           
        } // end else
    })
    
})
router.get('/blast_results_refseq', function blastResults_refseq(req, res) {
    console.log('in blast_results RefSeq')
    //console.log('req.query:',req.query)
    //console.log('req.body:',req.body)
    //console.log('req:',req)
    const blastID = req.query.id
    let ext,html_files=[]
    const sortCol = req.query.col || '' 
    const sortDir = req.query.dir || '' 
    //////////////////
    const renderFxn = (req, res, html, queries, genome_data, files, config, blastID) => {
        //console.log('htmlfiles',files)
        res.render('pages/blast/blast_results_refseq', {
            title: 'HOMD :: Blast Results', 
            pgname: 'blast/blast',
            config: JSON.stringify({ hostname: CFG.HOSTNAME, env: CFG.ENV, url: CFG.URL }),
            hostname: CFG.HOSTNAME,
            //url: CFG.URL,
            ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
            //db_choices: JSON.stringify(C.refseq_blastn_db_choices),
            html: html,
            //numseqs: queries.length,
            queries: JSON.stringify(queries),
            files: JSON.stringify(files),
            blastParams: JSON.stringify(config),
            blastID: blastID,
            blastData: encodeURI(genome_data.toString()),
            error: JSON.stringify({})
        })
    }
        
    if(Object.prototype.hasOwnProperty.call(req.session, 'blast')){
        //thisSessionBlast = JSON.parse(JSON.stringify(req.session.blast))
        //console.log('deleteing session blast')
        delete req.session.blast
    }

    //console.log(req.query)
    let data=[],blastFiles = [],query_strings=[]
    // read directory CONFIG.json first
    let blastDir = path.join(CFG.PATH_TO_BLAST_FILES, blastID)
    let blastResultsDir = path.join(blastDir, 'blast_results')
        
        //console.log(blastFiles)
        //try:  https://node.homd.info/blast/blast_results?id=1638297207475-44741
    let configFilePath = path.join(blastDir,'CONFIG.json')
    fs.readFile(configFilePath, function readConfig(err, configData) {
        if(err){
            req.flash('fail', 'blastID no longer Valid')
            res.redirect('/') // this needs to redirect to either refseq or genome
            return
        }else{
            // blast.out files are present (but are they complete?)
            let config = JSON.parse(configData)
             
            const result = getAllFilesWithExt(blastResultsDir, 'out')
            if(!result){
                   throw new Error('The Blast ID "'+blastID+'" was not found.<br>Probably expired if you are using and old link.')
                   return
            }

             
            for(let i=0; i < result.length; i++){
                blastFiles.push(path.join(blastResultsDir, result[i]))
            }
            async.map(blastFiles, helpers.readAsync, function asyncMapBlast(err, results) {
                for(let i=0; i<blastFiles.length; i++){
                    //console.log('file',blastFiles[i])
//                  console.log('config',config)
//                  console.log('results-i',results[i].toString())
                    let query = helpers.parse_blast_query(results[i], config.blastFxn)
                    query_strings.push({query:query, file:blastFiles[i]})
                  
                    let parsed_data = helpers.parse_blast(results[i], config.blastFxn)
                    data.push(parsed_data) // in order of sequences
                }
                
                //console.log('**data**',data)
                if(data.length === 0){
                    // error no data
                    let errorFilePath = path.join(CFG.PATH_TO_BLAST_FILES, config.id, 'blasterror.log')
                    fs.readFile(errorFilePath, function tryReadErrorFile(err, content) {
                        if(err){
                            // continue on NO ERROR FILE PRESENT and no data  WTF?
                            // throw error 
                            req.flash('fail', 'BLAST Failed with no data and no error information')
                            res.redirect(config.returnTo) // this needs to redirect to either refseq or genome
                            return            
                        }else{
                          // file exists throw error
                            if(content.toString().trim()){  // means there was true error NOT zero length
                                //pyerror = { code: 1, msg:'BLAST Script Error:: ' + content }
                                req.flash('fail', 'BLAST Script Error:: '+ content)
                                res.redirect(config.returnTo) // this needs to redirect to either refseq or genome
                                return
                            }
                        }
                    })
                }
                let refseq_html = ''
                refseq_html = getBlastHtmlTable0(data, blastID, sortCol, sortDir)
                 
                
                if(!blastID){
                    req.flash('fail', 'blastID no longer Valid')
                    res.redirect(config.blastFxn) // this needs to redirect to either refseq or genome
                    return
                }

                if(req.query.ajax){
                    return res.send(refseq_html)   // this is for refseq blast
                }else{ 
                  renderFxn(req, res, refseq_html, query_strings, '', html_files, config, blastID)
                }
            }) // end async map
           
           
        } // end else
    })
})

//
router.get('/blast_wait', async function blastWait(req, res, next) {
    helpers.print('in blast wait')
    //????
    //console.log('session blast_wait:')
    //console.log(req.session)
    let finished = false, blastFiles = [], faFiles = [], html, jsondata, database, pyerror
    let ext
    //////
//     const renderFxn = (req, res, gid, otid, blast, organism, dbChoices,  allAnnosObj, annoType, pageData, annoInfoObj, pidList) => {
//       res.render('pages/genome/explorer', {
//         title: 'HOMD :: ' + gid,
//         pgname: 'blast', // for AbountThisPage 
//         config: JSON.stringify({ hostname: CFG.HOSTNAME, env: CFG.ENV }),
//         ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
//         gid: gid,
//         otid: otid,
//         all_annos: JSON.stringify(allAnnosObj),
//         anno_type: annoType,
//         page_data: JSON.stringify(pageData),
//         blast: blast,
//         organism: organism,
//         db_choices: JSON.stringify(dbChoices),
//         blast_prg: JSON.stringify(C.blastPrograms),
//         blastFxn: 'genome',
//         info_data: JSON.stringify(annoInfoObj),
//         pid_list: JSON.stringify(pidList),
//         returnTo: '/genome/explorer?gid='+gid+'&blast=1'
//       
//       })
//    }
    if(req.session.blast.id){
        let blastDir = path.join(CFG.PATH_TO_BLAST_FILES, req.session.blast.id)
        //# blasterror.log will always be created
        //# whereas pythonerror.log will only be present if pyscript error
        let errorFile = path.join(blastDir,'pythonerror.log')  // 
        if (fs.existsSync(errorFile)) {
            let error = fs.readFileSync(errorFile) 
            if (error.length == 0) {
                // ok
            }else{
              //console.log('XXXX')
              req.flash('fail', 'BLAST Program Error '+ error.toString())
              res.redirect(req.session.blast.returnTo) // this needs to redirect to either refseq or genome
              return
            }
            
        }
        //req.session.blastCounter += 1
        req.session.blast.timer += 5  // 5sec at a pop
        let blastResultsDir = path.join(blastDir,'blast_results')
        const result = getAllDirFiles(blastDir) // will give ALL files in ALL dirs
        console.log('blastResultsDir',blastResultsDir)
        console.log('result',result)
        if(!result){
           req.flash('fail', 'There was a fatal error reading the BLAST directory')
           res.redirect(req.session.blast.returnTo) // this needs to redirect to either refseq or genome
           return
        }
        for(let i=0; i < result.length; i++){
           if(result[i].endsWith('.fa')){
              faFiles.push(result[i])
           } 
           if(req.session.blast.blastFxn === 'refseq'){
             ext = '.out'  // these are the files we are looking for to finish
           }else{
             ext = '.html'
           }
           if(result[i].endsWith(ext)){
              blastFiles.push(path.join(blastResultsDir, result[i]))
              if(req.session.blast.timer <= 5){
                req.session.blast.fsize0 = helpers.checkFileSize(blastFiles[blastFiles.length-1])
                //console.log('fsize0',req.session.blast.fsize)
              }
           } 
        }
        console.log('blastFiles',blastFiles)
        if(blastFiles.length >0 && blastFiles.length === faFiles.length){// && req.session.blast.timer > 41){ // time chosen arbitrarily
           //finished = true;
           req.session.blast.fsize0 = req.session.blast.fsize
           req.session.blast.fsize = helpers.checkFileSize(blastFiles[blastFiles.length-1])  // when stable then finished == true
            //console.log('fsizes',req.session.blast.fsize0,req.session.blast.fsize)
            if(req.session.blast.fsize > 100 && req.session.blast.fsize0 === req.session.blast.fsize){
              finished = true;
            }
        }
        
    }else{
        finished = false;
    }
    
    if(!req.session.blast.timer){
       // need to get off this train
       //await module.exports.sleep(1000);
       helpers.print('in !req.session.blast.timer -setting finish true')
       finished = true;
    }
    //console.log('timer:',req.session.blast.timer,'blastFiles',blastFiles.length,'faFiles',faFiles.length)
    helpers.print(['finished:t/f?',finished])
    //console.log('session.error',req.session.pyerror)
    if(finished){
      if(!req.session.blast.id){
         req.flash('fail', 'blastID no longer Valid')
         res.redirect(req.session.blast.returnTo) // this needs to redirect to either refseq or genome
         return
       }
      if(req.session.blast.blastFxn === 'refseq'){
         res.redirect('/blast/blast_results_refseq?id=' + req.session.blast.id)
      }else{
         res.redirect('/blast/blast_results_genome?id=' + req.session.blast.id)
      }
      
    }else{
      res.render('pages/blast/blast_wait', {
        title: 'HOMD :: BLAST WAIT', 
        pgname: 'blast',
        config: JSON.stringify({ hostname: CFG.HOSTNAME, env: CFG.ENV, url: CFG.URL }),
        hostname: CFG.HOSTNAME,
        ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
        db_choices: JSON.stringify(C.refseq_blastn_db_choices),
        filesFinished: blastFiles.length,
        filesStarted: faFiles.length,
        elapsed: req.session.blast.timer,
        fxn: req.session.blast.blastFxn,
        blastID: req.session.blast.id,
        //error: JSON.stringify(req.session.pyerror)
        
      })
    }
    

})
//
router.post('/changeBlastGenomeDbs', function changeBlastGenomeDbs(req, res) {
    console.log('in changeBlastGenomeDbs AJAX')
    helpers.print(req.body)
    let prog = req.body.prog
    let gid = req.body.gid
    let organism = '',dbChoices
    if (Object.prototype.hasOwnProperty.call(C.annotation_lookup, gid)) {
       organism = C.annotation_lookup[gid].prokka.organism
     }
    
    let html = "<select class='dropdown' id='blastDb' name='blastDb'>"
    if(prog === 'blastn' || prog === 'tblastn' || prog ==='tblastx'){
       dbChoices = C.all_genome_blastn_db_choices.nucleotide.map((x) => x)
       if(gid != 'all'){
           html += "<option value='fna/"+gid+".fna'>This Organism's ("+organism + ") Genomic DNA</option>"
           html += "<option value='ffn/"+gid+".ffn'>This Organism's ("+organism + ") DNA of Annotated Proteins</option>"
       }else{
           html += "<option value='"+dbChoices[0].filename+"'>"+dbChoices[0].name+"</option>"
           html += "<option value='"+dbChoices[1].filename+"'>"+dbChoices[1].name+"</option>"
       }
       
    }else{  // blastp and blastx
       dbChoices = C.all_genome_blastn_db_choices.protein.map((x) => x)
       if(gid != 'all'){
           html += "<option value='faa/"+gid+".faa'>This Organism's ("+organism + ") DNA of Annotated Proteins</option>"
       }else{
           html += "<option value='"+dbChoices[0].filename+"'>"+dbChoices[0].name+"</option>"
       }
    }
    html += "</select>"
    res.send(html)
    
})
//
router.post('/blast_post', upload.single('blastFile'),  async function blast_post(req, res, next) {
  console.log('MADEIT TO blastPost')
  helpers.print(req.body)
  
  if(CFG.ENV === 'production'){
    let ip = helpers.getCallerIP(req)
    const output = fs.createWriteStream('../homd-stats/blastUseIP.log', {flags : 'a'})
    const blastip_logger = new console.Console(output)
    blastip_logger.log(helpers.timestamp()+'\t'+ip+'\t'+req.body.blastFxn)
  }
  //console.log('req.file?', req.file)   // may be undefined
  let anno = req.body.anno  // either prokka or ncbi
  let filename, filepath, data, fasta_as_list, trimlines, twolist,fastaFilePaths;
  const opts = { minLength: 10, patt: /[^ATCGUKSYMWRBDHVN]/i, returnTo: req.body.returnTo }
  let blastOpts = createBlastOpts(req.body)
  let dbPath
  if(req.body.blastFxn === 'genome'){
      if(anno === 'ncbi'){
          dbPath = path.join(CFG.BLAST_DB_PATH_GENOME,'genomes_ncbi')
      }else{
          dbPath = path.join(CFG.BLAST_DB_PATH_GENOME,'genomes')
      }
      
  }else{
      dbPath = path.join(CFG.BLAST_DB_PATH_REFSEQ)
  }
  blastOpts.dbPath = dbPath
  
  console.log('DB Path (for production):: ',dbPath)
  //let blast_session_ts = Date.now().toString();
  //const randomnum = Math.floor(Math.random() * 90000) + 10000;
  //opts.blastSessionID = Date.now() + '-' + randomnum.toString()
  opts.blastSessionID = helpers.makeid(20) + '_'+req.body.blastFxn
  const blastDir = path.join(CFG.PATH_TO_BLAST_FILES, opts.blastSessionID)
  if (!fs.existsSync(blastDir+'/'+'blast_results')){
       fs.mkdirSync(blastDir+'/'+'blast_results', { recursive: true });
  }
  if(req.file){
      opts.type = 'fileInput'
      //console.log('req.file',req.file)
      let grep_cmd = "/usr/bin/grep '>' "+req.file.path+' | wc -l'
      exec(grep_cmd, (err, stdout, stderr) => {
          if (stderr) {
            console.error('stderr',stderr);
            return;
          }
          let fa_seqs = parseInt(stdout.trim())
          if(fa_seqs > C.blast_max_file.seqs){
             req.flash('fail', 'File too large:SeqCount='+fa_seqs.toString());
             res.redirect(req.body.returnTo);
             return;
          } 
      
          if (req.file.size > C.blast_max_file.size * 1000000){   // 1 911 016
           req.flash('fail', 'File too large: '+helpers.format_MB(req.file.size));
           res.redirect(req.body.returnTo);
           return;
          }
          var fileContents = ''  // if buffer in req,file not need to move/read file
          followFilePath(req, res, opts, blastOpts, blastDir, fileContents, next)
      })
  }else{
      opts.type = 'textInput'
      let inputSeqInput = req.body.inputSeq.trim();
      // count '>'
      var count = (inputSeqInput.match(/>/g) || []).length;
      if(count < C.blast_max_file.seqs){
         runPyBlastScript(req, res, opts, blastOpts, blastDir, inputSeqInput, next)
      }else{
         req.flash('fail', 'Input too large:SeqCount='+count.toString());
             res.redirect(req.body.returnTo);
             return;
      }
  }
    

    
})
//

//
router.post('/blastDownload', function blastDownload(req, res) {
    //
    console.log('in blastDownload')
    const AdmZip = require('adm-zip');
    //console.log(req.body)
    let blastID = req.body.blastID
    let zip
    let type = req.body.dnldType
    if(type === 'zip'){
       zip = new AdmZip();
    }
    if(type==='fasta'){
     // blastdbcmd -db myBlastDBName -dbtype prot -entry_batch myContigList.txt -outfmt %f -out myHitContigs.fasta
     // gather <Hit_id>gnl|BL_ORD_ID|4937322</Hit_id>
      //return
    }
    let blastFxn = req.body.blastFxn
    //console.log('type',type)
    
    if(!type || !blastID){
       return
    }
    let  data=[],blastFiles = [],xml_files=[],files_array,result
    // read directory CONFIG.json first
    let blastDir = path.join(CFG.PATH_TO_BLAST_FILES, blastID)
    let blastResultsDir = path.join(CFG.PATH_TO_BLAST_FILES, blastID, 'blast_results')
    if(blastFxn ==='refseq'){
        result = getAllFilesWithExt(blastResultsDir, 'out')
        for(let i=0; i < result.length; i++){
            blastFiles.push(path.join(blastResultsDir, result[i]))
            if(type === 'zip'){
               zip.addLocalFile(path.join(blastResultsDir, result[i]))
            }
        }
    }else{   // genome blast
        result = getAllFilesWithExt(blastResultsDir, 'xml')
        for(let i=0; i < result.length; i++){
            xml_files.push(path.join(blastResultsDir, result[i]))
            
            if(type === 'zip'){
               zip.addLocalFile(path.join(blastResultsDir, result[i]))
            }
        }
    }
    if(!result){
       throw new Error('The Blast ID "'+blastID+'" was not found.<BR>Probably expired if you are using and old link.')
       return
    }
    
    if(type === 'zip'){
        const data = zip.toBuffer();
        res.set('Content-Type','application/octet-stream');
        res.set('Content-Disposition',"attachment; filename=\"HOMD_blast"+today+'_'+currentTimeInSeconds+".zip\"");
        res.set('Content-Length',data.length);
        res.send(data);
    }else{
    //console.log('blastfiles')
    //console.log(blastFiles)
    let fileData = {}
    let configFilePath = path.join(CFG.PATH_TO_BLAST_FILES, blastID,'CONFIG.json')
    fs.readFile(configFilePath, function readConfig(err,  configData) {
     if(err){
        req.flash('fail', 'blastID no longer Valid')
        res.redirect('/') // this needs to redirect to either refseq or genome
        return
      }else{
            let config = JSON.parse(configData)
            if(blastFxn ==='refseq'){
                files_array = blastFiles
            }else{
                files_array = xml_files
            }
            async.map(files_array, helpers.readAsync, function asyncMapBlast(err, results) {

                if(blastFxn ==='refseq'){
                    for(let i=0; i<blastFiles.length; i++){
                        let parsed_data = helpers.parse_blast(results[i], type)
                        data.push(parsed_data) // in order of sequences
                    }
                    //const html = getBlastHtmlTable(data, blastID, sortCol, sortDir)
                    var table_tsv = create_blast_download_table(data, type, blastFxn)
                    if(type.substring(0,4) === 'text'){
                        res.set({"Content-Disposition":"attachment; filename=\"HOMD_blast"+today+'_'+currentTimeInSeconds+".txt\""})
                    }else{  //excel
                        res.set({"Content-Disposition":"attachment; filename=\"HOMD_blast"+today+'_'+currentTimeInSeconds+".xls\""})
                    }
                    res.send(table_tsv)
                    delete req.body
                }else{   // genme xml files
                    if(type === 'fasta'){
                        
						let hitid_obj,hitids=[],hitid_collector={},comma_string
						for(let i=0; i<xml_files.length; i++){
						    hitid_obj = helpers.parse_blast_query_xml(parser.toJson(results[i]), 'hitids')
						    hitids.push(hitid_obj)
						    for(let i in hitid_obj.hitid_ary){
								hitid_collector[hitid_obj.hitid_ary[i]] = 1
						    }
						}
						comma_string = Object.keys(hitid_collector)   //let blastdbcmd = 'blastdbcmd -entry '+comma_string+' -outfmt %f -out '+outfilename
						//console.log('comma_string',comma_string.join(','))
						let blastdbcmd = "cd "+path.join(config.blastdbPath,config.ext)+";blastdbcmd -db "+config.blastdb+" -entry '"+comma_string.join(',')+"' -outfmt %f"
						console.log('blastdbcmd',blastdbcmd)
						helpers.execute(blastdbcmd, function(fasta_result){
                            //console.log('fasta_result',fasta_result)
                            
                            res.set({"Content-Disposition":"attachment; filename=\"HOMD_blast"+today+'_'+currentTimeInSeconds+".fa\""})
                            res.send(fasta_result)
                            return
                        });
						
					}else{
                    for(let i=0; i<xml_files.length; i++){
                        let parsed_data = helpers.parse_blast_xml2json(JSON.parse(parser.toJson(results[i])), type)
                        data.push(parsed_data) // in order of sequences
                        
                    }
                    var table_tsv = create_blast_download_table(data, type, blastFxn)
                    if(type.substring(0,4) === 'text'){
                        res.set({"Content-Disposition":"attachment; filename=\"HOMD_blast"+today+'_'+currentTimeInSeconds+".txt\""})
                    }else{  //excel
                        res.set({"Content-Disposition":"attachment; filename=\"HOMD_blast"+today+'_'+currentTimeInSeconds+".xls\""})
                    }
                    res.send(table_tsv)
                    delete req.body
                    }
                }
                //res.end()
             })   // end async files
      }
    })
    }  // end else
    
})
//
router.post('/openBlastWindow', function openBlastWindow(req, res) {
    //
    console.log('in openBlastWindow')
    //console.log(req.body)
    let type = req.body.type
    let num = req.body.num
    let blastID = req.body.id
    //console.log('type',type)
    //console.log('id',blastID)
    //console.log('num',num)
    let file
    if(type === 'res'){
        file = path.join(CFG.PATH_TO_BLAST_FILES, blastID, 'blast_results', 'blast' + num + '.fa.out')
    }else{  // type = seq
        file = path.join(CFG.PATH_TO_BLAST_FILES, blastID, 'blast' + num + '.fa')
    }
    //console.log('file',file)
    fs.readFile(file, 'utf8', function readBlastFile(err, data) {
      if (err)
          console.log(err)
      else
          //console.log(data)
          res.send(data)
    
    })
})



//////////////////////////////////////////////////////////////////
///// FUNCTIONS /////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
function create_blast_download_table(data_obj, type, fxn) {
  let txt = ''
  
  //let header = 'Query Title\tQuery Length\tHit HMT\tHOMD Seq Name\tHOMD Clone name\tIdentity\tIdentities(%)\tScore (bits)\tQuery Start\tSbjct Start\tQuery End\tSbjct End\tEvalue\tGaps\n'
  let header = 'Query Title\tQuery Length\tHit HMT\tHOMD Seq Name\tHOMD Clone name\tIdentities(%)\tScore (bits)\tEvalue\tGaps\n'
  
  //console.log('data',data_obj)
  //console.log(data[0].hits[0].hsps[0])
  let hit,h,hitCountOutput,dnldInfo,otid,clone_id
  
  for(let n in data_obj){
     let obj = data_obj[n]
     //console.log('obj',obj)
     obj.data.sort(function sortIR2(a, b) {
            return helpers.compareStrings_int(b.bitscore, a.bitscore);
     })
     if(obj.data == 'no hits'){
        txt += obj.query+'\t'+obj.query_length+'\t\t\tNo Hits Found\t\t\t\t\n'
     }else{
         
         if(type === 'text1' || type === 'excel1'){
             dnldInfo = 'Top BLAST Hit Only: '+obj.version+'\n'
             txt += obj.query+'\t'+obj.query_length+'\t'
         
              //console.log('data[0]',data[n].data[0])
            
            otid = helpers.make_otid_display_name(obj.data[0].otid)
            clone_id = obj.data[0].clone_id
            
            txt += otid+'\t'+clone_id+'\t'+obj.data[0].clone+'\t'+obj.data[0].identity+'\t'+obj.data[0].bitscore+'\t'+obj.data[0].expect+'\t'+obj.data[0].gaps+'\n'
        
          }else if(type === 'textAll' || type === 'excelAll'){
             dnldInfo = 'All BLAST Hits: '+obj.version+'\n'
         
              //console.log('data[0]',data[n].data[0])
              for(let i in obj.data){
                
                if(obj.data[i]){
                  otid = helpers.make_otid_display_name(obj.data[i].otid)
                  clone_id = obj.data[i].clone_id
                  txt += obj.query+'\t'+obj.query_length+'\t'
                  txt += otid+'\t'+clone_id+'\t'+obj.data[i].clone+'\t'+obj.data[i].identity+'\t'+obj.data[i].bitscore+'\t'+obj.data[i].expect+'\t'+obj.data[i].gaps+'\n'
                }else{
                  //txt += '\t\t\t\t\t\t\t\t\n'
                }
              }
          }else if(type === 'text4' || type === 'excel4'){
             dnldInfo = 'Top 4 BLAST Hits: '+obj.version+'\n'
         
              //console.log('data[0]',data[n].data[0])
              for(let i=0;i<4;i++){

                if(obj.data[i]){
                  otid = helpers.make_otid_display_name(obj.data[i].otid)
                  clone_id = obj.data[i].clone_id
                  txt += obj.query+'\t'+obj.query_length+'\t'
                  txt += otid+'\t'+clone_id+'\t'+obj.data[i].clone+'\t'+obj.data[i].identity+'\t'+obj.data[i].bitscore+'\t'+obj.data[i].expect+'\t'+obj.data[i].gaps+'\n'
                }else{
                  //txt += '\t\t\t\t\t\t\t\t\n'
                }
              }
           }else if(type === 'text20' || type === 'excel20'){
             dnldInfo = 'Top 20 BLAST Hits: '+obj.version+'\n'
         
              //console.log('data[0]',data[n].data[0])
              for(let i=0;i<20;i++){
                
                otid = helpers.make_otid_display_name(obj.data[i].otid)
                clone_id = obj.data[i].clone_id
                
                if(obj.data[i]){
                txt += obj.query+'\t'+obj.query_length+'\t'
                txt += otid+'\t'+clone_id+'\t'+obj.data[i].clone+'\t'+obj.data[i].identity+'\t'+obj.data[i].bitscore+'\t'+obj.data[i].expect+'\t'+obj.data[i].gaps+'\n'
                }else{
                  //txt += '\t\t\t\t\t\t\t\t\n'
                }
              }
           }
       }  
     
  }
  let retTxt = dnldInfo + header + txt
  return retTxt
}
function create_blast_download_table_genomeXXX(jsondata, type) {
  let txt = ''
  
  //let header = 'Query Title\tQuery Length\tHit HMT\tHOMD Seq Name\tHOMD Clone name\tIdentity\tIdentities(%)\tScore (bits)\tQuery Start\tSbjct Start\tQuery End\tSbjct End\tEvalue\tGaps\n'
  let header = 'Query Title\tQuery Length\tHit HMT\tHOMD Seq Name\tHOMD Clone name\tIdentities(%)\tScore (bits)\tEvalue\tGaps\n'
  
  //console.log(data[0].hits[0].description)
  //console.log(data[0].hits[0].hsps[0])
  let hit,h,hitCountOutput,dnldInfo
  
  for(let n in data){
     //console.log(data[n])
     
     if(type === 'text1' || type === 'excel1'){
         dnldInfo = 'Top BLAST Hit Only: '+version+'\n'
         txt += n+'\t'+data[n].query_len+'\t'
         //console.log(data[n].hits[0])
         hit = data[n].hits[0]
         h = getHitValues(hit)
         
         //console.log(h.titleid,h.HMT,h.bitScore,h.identityPct)
         
         txt += h.HMT+'\t'+h.titleid+'\t'+h.clone +'\t'+ h.identity +'\t'+ h.identityPct+'\t'+ h.bitScore+'\t'
         txt += h.qstart +'\t'+h.sstart +'\t'+h.qend +'\t'+h.send +'\t'+h.evalue +'\t'+h.gaps +'\n'
     }else if(type === 'textAll' || type === 'excelAll'){
         dnldInfo = 'All BLAST Hits: '+version+'\n'
         for(let i=0; i<data[n].hits.length; i++){
             txt += n+'\t'+data[n].query_len+'\t'
             hit = data[n].hits[i]
             h = getHitValues(hit)
             txt += h.HMT+'\t'+h.titleid+'\t'+h.clone +'\t'+ h.identity +'\t'+ h.identityPct+'\t'+ h.bitScore+'\t'
             txt += h.qstart +'\t'+h.sstart +'\t'+h.qend +'\t'+h.send +'\t'+h.evalue +'\t'+h.gaps +'\n'
         }
     }else{
         if(type === 'text4' || type === 'excel4'){
             hitCountOutput = 4; 
             dnldInfo = 'Top 4 BLAST Hits: '+version+'\n'
             if(data[n].hits.length <  hitCountOutput)           // If length less than 4
                hitCountOutput = data[n].hits.length
         }else if(type === 'text20' || type === 'excel20'){
             dnldInfo = 'Top 20 BLAST Hits: '+version+'\n'
             hitCountOutput = 20; 
             if(data[n].hits.length <  hitCountOutput)           // If length less than 20
                hitCountOutput = data[n].hits.length
         }
         for(let i=0; i<hitCountOutput; i++){
             txt += n+'\t'+data[n].query_len+'\t'
             hit = data[n].hits[i]
             h = getHitValues(hit)
             txt += h.HMT+'\t'+h.titleid+'\t'+h.clone +'\t'+ h.identity +'\t'+ h.identityPct+'\t'+ h.bitScore+'\t'
             txt += h.qstart +'\t'+h.sstart +'\t'+h.qend +'\t'+h.send +'\t'+h.evalue +'\t'+h.gaps +'\n'
         }
         
     }
  }
  let retTxt = dnldInfo + header + txt
  return retTxt
}
function getHitValues(hit){
    
    let hitVals = {},hitItems
    hitItems = hit.description[0].title.split('|')
    hitVals.titleid = hitItems.shift()  // remove and return first item after cleaning off zeros
    hitVals.HMT = (parseInt(hitItems[1].split('-')[1].trim())).toString()
    hitVals.bitScore =     hit.hsps[0].bit_score.toFixed(1).toString()
    hitVals.identity = hit.hsps[0].identity
    hitVals.identityPct = (hit.hsps[0].identity * 100 / hit.hsps[0].align_len).toFixed(1).toString()
    hitVals.evalue = hit.hsps[0].evalue.toString()
    hitVals.qstart = hit.hsps[0].query_from
    hitVals.qend = hit.hsps[0].query_to
    hitVals.sstart = hit.hsps[0].hit_from
    hitVals.send = hit.hsps[0].hit_to
    hitVals.gaps = hit.hsps[0].gaps
    hitVals.clone = hitItems.join(' | ')
    return hitVals
}
function createBlastOpts(reqBody) {
    let bOpts = {},dbItems
    bOpts.expect =    reqBody.blastExpect
    //descriptions: req.body.blastDescriptions,
    //alignments: req.body.blastAlignments,
    bOpts.maxTargetSeqs = reqBody.blastMaxTargetSeqs,
    bOpts.advanced = reqBody.advancedOpts,
    bOpts.program = reqBody.blastProg
    // add dbPath later
    
    if(reqBody.blastFxn === 'genome') {
      //bOpts.dbPath = CFG.BLAST_DB_PATH_GENOME
      bOpts.anno = reqBody.anno
      if(reqBody.blastDb){
      dbItems = reqBody.blastDb.split('/')
      }else{
        dbItems = ''
      }
      bOpts.blastDb = dbItems[1]
      bOpts.ext = dbItems[0]
      bOpts.genome_dbhost = CFG.GENOME_DBHOST
    } else {
      //bOpts.dbPath = CFG.BLAST_DB_PATH_REFSEQ
      bOpts.blastDb = reqBody.blastDb
      bOpts.ext = ''
    }
    if(reqBody.blastFilter){
      bOpts.fitler = '-F F'
    }
    return bOpts
}
//
function createConfig(req, opts, blastOpts, blastDir, dataOrPath ) {
    
    //console.log('blastOpts',blastOpts)
    //console.log('opts',opts)
    if(blastOpts.program === 'blastp'){
       // this serves to fix possible bug 
       // where blastp is matched with 'ffn'
       blastOpts.ext = 'faa'
       blastOpts.blastDb = blastOpts.blastDb.split('.')[0] + '.' + blastOpts.ext
       if(blastOpts.anno === 'prokka'){
          blastOpts.dbPath = path.join(CFG.BLAST_DB_PATH_GENOME,'genomes_prokka')
       }else{
          blastOpts.dbPath = path.join(CFG.BLAST_DB_PATH_GENOME,'genomes_ncbi')
       }
    }
    let config = {}
    config.site = CFG.SITE  //  local, mbl or homd;; this determines blast db
    config.id = opts.blastSessionID
    config.blastdbPath = blastOpts.dbPath
    config.ext = blastOpts.ext  // used only for genome
    config.blastdb = blastOpts.blastDb
    config.blastDir = blastDir
    config.dataType = opts.type
    config.expect = blastOpts.expect
    config.blastFxn = req.body.blastFxn
    config.anno = blastOpts.anno
    config.genome_dbhost = blastOpts.genome_dbhost
    config.advanced = blastOpts.advanced
    config.maxTargetSeqs = blastOpts.maxTargetSeqs
    config.program = blastOpts.program
    config.programPath = CFG.PATH_TO_BLAST_PROG
    config.returnTo = opts.returnTo
    let pyScriptPath = path.join(CFG.PATH_TO_SCRIPTS, 'run_blast_no_cluster.py') 
    config.command = pyScriptPath +' -c '+ path.join(blastDir, 'CONFIG.json')
    config.filePath = ''
    config.textInput = ''
    // config.seqcount
    
    if(opts.type == 'fileInput'){
        config.filePath = dataOrPath
    }else{
        config.textInput = '"'+dataOrPath+'"'
    }
    
    return config
}
//
//
function getBlastHtmlTable0(data_arr, blastID, sortCol, sortDir){
    let desc,id,html,init,split_items,hmt,seqid,odd,bgcolor
    
    // sort data_arr
    html =''
   
    html += "<table><thead>"
    html += '<tr>'
    //html += "<th><input type='checkbox'  value='master' onclick=\"blastCkboxMaster('"+blastID+"')\"><br><sup>1</sup></th>"
    
    html += '<th>Query</th><th>Length<br>(nt)</th>'
    html += '<th>Query<br>Sequence</th><th>Alignment</th><th>Hit</th><th>HOMD Clone Name</th>  <th>evalue</th><th>bit<br>score</th><th>Identity<br>(%)</th></tr>'
    html += '</thead><tbody>'
    if(sortCol ==='query'){
         //console.log(sortDir)
         if(sortDir === 'fwd'){
           data_arr.sort(function sortDA(a, b) {
            return helpers.compareStrings_alpha(b.query, a.query);
            })
         }else{
           data_arr.sort(function sortDA(b, a) {
            return helpers.compareStrings_alpha(b.query, a.query);
            })
         }
    }else{ 
        //if(sortCol ==='sequence'){  // original: by sequence
         
    }
    //console.log('data_arr',data_arr)
    for(let i in data_arr){
        odd = i % 2  // will be either 0 or 1
       //console.log('odd',odd)
       
       if(odd){
         bgcolor = 'blastBGodd'
       }else{
         bgcolor = 'blastBGeven'
       }
       html += "<tr class='"+bgcolor+"'><td rowspan='4'>"+data_arr[i].query+"</td><td rowspan='4' class='center'>"+data_arr[i].query_length+'</td>'
       
       if(data_arr[i].data == 'no hits'){
           html += "<td rowspan='4'><a href='#' onclick=\"getFileContent('seq','"+blastID+"','"+i.toString()+"')\">view</a></td><td rowspan='4'></td>"
           html += '<td></td>'+"<td>No Hits Found"+'</td><td></td><td></td><td></td>'
           html += '</tr>'
       }else{
         //sort data_arr[i].data by bitscore
         if(sortCol ==='bitscore'){
           if(sortDir === 'fwd'){
               data_arr[i].data.sort(function sortDA(a, b) {
                return helpers.compareStrings_int(b.bitscore, a.bitscore);
                })
             }else{
               data_arr[i].data.sort(function sortDA(b, a) {
                return helpers.compareStrings_int(b.bitscore, a.bitscore);
                })
             }
         }else if(sortCol ==='identity'){
            if(sortDir === 'fwd'){
               data_arr[i].data.sort(function sortDA(a, b) {
                return helpers.compareStrings_alpha(b.identity, a.identity);
                })
             }else{
               data_arr[i].data.sort(function sortDA(b, a) {
                return helpers.compareStrings_alpha(b.identity, a.identity);
                })
             }
         }else{
           // original
           data_arr[i].data.sort(function sortDA(a, b) {
            return helpers.compareStrings_int(b.bitscore, a.bitscore);
           })
         }
         html += "<td rowspan='4' class='center'><a href='#' onclick=\"getFileContent('seq','"+blastID+"','"+i.toString()+"')\">view</a></td>"
         html += "<td rowspan='4' class='center'><a href='#' onclick=\"getFileContent('res','"+blastID+"','"+i.toString()+"')\">open</a></td>"
         for(let n=0;n<4;n++){
           html += "<td nowrap class='blastcol3 center "+bgcolor+"'><a href='/taxa/tax_description?otid="+data_arr[i].data[n].otid+"'>"+data_arr[i].data[n].clone_id+'</a></td>'
           html += "<td class='blastcol4 xsmall "+bgcolor+"'>"+data_arr[i].data[n].clone+"</td><td class='right-justify "+bgcolor+"'>"+data_arr[i].data[n].expect+"</td>"
           html += "<td class='right-justify "+bgcolor+"'>"+data_arr[i].data[n].bitscore+"</td>"
           html += "<td class='right-justify "+bgcolor+"'>"+data_arr[i].data[n].identity+'</td>'
           html += '</tr>'
         }
       }
       
    }
    
    html += '</tbody></table>'
    return html
}
//


//
function getAllFilesWithExt(dirPath, ext) {
    let arrayOfFiles = []
    try{
        const files = fs.readdirSync(dirPath)
        files.forEach(function getFilesArray(file) {
            if (fs.statSync(dirPath + "/" + file).isFile() && file.endsWith(ext)) {
                arrayOfFiles.push(file)
            }
        })
    }catch(e){
        return 0
    }

    return arrayOfFiles
}
//
function getAllDirFiles(dirPath, arrayOfFiles) {
  
  try{
      const files = fs.readdirSync(dirPath)

      arrayOfFiles = arrayOfFiles || []
 
      files.forEach(function getFilesArray(file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
          arrayOfFiles = getAllDirFiles(dirPath + "/" + file, arrayOfFiles)
        } else {
          arrayOfFiles.push(file)
        }
      })
      return arrayOfFiles
  }catch(e){
        return 0
  }
  
}
// function checkSeqLength(seq, minLength) {
//   if(inputSeqInput === ''){
//         req.flash('fail', 'No Query Sequence(s) were Entered');  // implement flash?
//         res.redirect(req.session.blast.returnTo);  // this may be refseq or genome
//         return false;
//   }
//   if(inputSeqInput.length <= opts.minLength){  
//         req.flash('fail', 'Query length needs to be greater than 10bp');
//         res.redirect(req.session.blast.returnTo);
//         return false
//   }
//   return true
//   
// }
function followFilePath(req, res, opts, blastOpts, blastDir, fileContents, next) {
  console.log('in File Path')
  
  // need 5000 seq limit in place
    const source = req.file.path;
    const dest = path.join(blastDir,'fastaFromFile.fna');  // MUST BE *.fna NOT *.fa so that it wont be read by script
   
    return (async function mvAndRunPyFxn() {
      if (req.file){
        
        await moveFile(source, dest)
        let data = await readFile(dest)
        
        runPyBlastScript(req, res, opts, blastOpts, blastDir, dest, next)
        
      }else{
         console.log('File Promise broken')
      }
    })()
  
  
  
}


// async function writeFile(filePath, data) {
//   try {
//     await fsp.writeFile(filePath, data);
//     console.log('data written to '+filePath);
//   } catch (error) {
//     console.error('Got an error trying to write the file: ',error);
//   }
// }
async function readFile(filePath) {
  try {
    const data = await fsp.readFile(filePath);
    //console.log('data read from to '+filePath);
    return data
  } catch (error) {
    console.error('Got an error trying to read the file: ',error);
  }
}
async function moveFile(source, destination) {
  //console.log('in move')
  try {
    await fsp.rename(source, destination);
    console.log(`Moved file from ${source} to ${destination}`);
  } catch (error) {
    console.error('Got an error trying to move the file:',error);
  }
}




//
//
function runPyBlastScript(req, res, opts, blastOpts, blastDir, dataForPy, next){
    console.log('In runPyBlastScript')
    
//     
    const pyscript = path.join(CFG.PATH_TO_SCRIPTS, 'run_blast_no_cluster.py') 
    
    const config = createConfig(req, opts, blastOpts, blastDir, dataForPy)
    
    const jsonConfigFilePath = path.join(blastDir, 'CONFIG.json')
    
    fs.writeFileSync(jsonConfigFilePath , JSON.stringify(config, null, 2))
    
    const pyscriptOpts = ['-c', jsonConfigFilePath]
    
    //console.log('running py script: ')
    console.log(pyscript, pyscriptOpts.join(' '))
    
    
    const pythonRun = spawn(pyscript, pyscriptOpts, {
                env:{'PATH': CFG.PATH},   // CFG.PATH must include python executable path
                detached: true, stdio: 'pipe'
    })
    
    pythonRun.stdout.on('data', function pyStdOut(data) {
      console.log('Pipeing data from python script::')
      //console.log(data.toString())
      let dataPyToSend = data.toString()
      //req.session.pyerror = {code:0, msg:''}
    })
    
    pythonRun.stderr.on('data', function pyStdErr(data) {
      let errorData = data.toString()
      
      //req.session.pyerror = {code: 1, msg: errorData}
      console.log('Caught ERROR', errorData)
      //
      let errorFilePath = path.join(blastDir, 'pythonerror.log')
      //console.log(errorFilePath)
      fs.appendFileSync(errorFilePath, errorData)
      //throw new Error(errordata);
      
    })
    
    pythonRun.on('close', function pyClose() {
        console.log('Finished - from nodejs')
        
    })
    let testing = false
    //console.log('Testing',testing)
    
    if(testing){
        //send data to browser window
        pythonRun.on('close', (code) => {
          console.log(`child process close all stdio with code ${code}`);
          // send pyscript output to browser for testing
          res.send(dataPyToSend)
        });
    }else{
        // respond immediately
        console.log('session BLASTING')
        //res.cookie('blastDir',blastDir);
        //req.session.cookie.blastid = blastDir
        const oneDayToSeconds = 24 * 60 * 60;  // hr/d min/hr sec/min
        
        req.session.blast = {}         
//       //  1000 * 60 * 60 * 60 * 24)   // // 24hrs === 86,400,000 msec
        req.session.blast.id = opts.blastSessionID
        req.session.blast.timer = 0
        req.session.blast.blastFxn = req.body.blastFxn
        req.session.blast.returnTo = req.body.returnTo
        res.redirect('blast_wait')   // MUST run at least once
    }
     
}


module.exports = router
