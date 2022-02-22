'use strict'
const express   = require('express');
var router    = express.Router()
const CFG     = require(app_root + '/config/config')
const fs        = require('fs-extra')
const fsp = require('fs').promises
const {spawn} = require('child_process');
const multer  = require('multer')
const upload = multer({ dest: CFG.UPLOAD_DIR })
const path      = require('path')
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
router.get('/blast_results', function blastResults(req, res) {
        console.log('in blast_results')
        console.log('req.query:',req.query)
        console.log('req.body:',req.body)
        //console.log('req:',req)
        const blastID = req.query.id
        
        const sortCol = req.query.col || '' 
        const sortDir = req.query.dir || '' 
        //////////////////
        const renderFxn = (req, res, html, blastFiles, config, blastID) => {
          res.render('pages/blast/blast_results', {
                  title: 'HOMD :: Blast Results', 
                  pgname: 'blast',
                  config: JSON.stringify({ hostname: CFG.HOSTNAME, env: CFG.ENV }),
                  hostname: CFG.HOSTNAME,
                  //url: CFG.URL,
                  ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
                  //db_choices: JSON.stringify(C.refseq_blastn_db_choices),
                  html: html,
                  numseqs: blastFiles.length,
                  blastParams: JSON.stringify(config),
                  blastID: blastID,
                  error: JSON.stringify({})
            })
        }
        //////////////////
        //let thisSessionBlast = {}
        if(Object.prototype.hasOwnProperty.call(req.session, 'blast')){
            //thisSessionBlast = JSON.parse(JSON.stringify(req.session.blast))
            console.log('deleteing session blast')
            delete req.session.blast
        }

        //console.log(req.query)
        let jsondata, data=[]
        // read directory CONFIG.json first
        let blastDir = path.join(CFG.PATH_TO_BLAST_FILES, blastID)

        let blastResultsDir = path.join(CFG.PATH_TO_BLAST_FILES, blastID, 'blast_results')

        const result = getAllFilesWithExt(blastResultsDir, 'out')

        if(!result){
           throw new Error('The Blast ID "'+blastID+'" was not found.<BR>Probably expired if you are using and old link.')
           return
        }


        let blastFiles = []
        for(let i=0; i < result.length; i++){
            blastFiles.push(path.join(blastResultsDir, result[i]))
        }
        
        
        //console.log('blastfiles')
        //console.log(blastFiles)
        //try:  https://node.homd.info/blast/blast_results?id=1638297207475-44741
        let configFilePath = path.join(CFG.PATH_TO_BLAST_FILES, blastID,'CONFIG.json')
        fs.readFile(configFilePath, function readConfig(err, configData) {
         if(err){
            req.flash('fail', 'blastID no longer Valid')
            res.redirect('/') // this needs to redirect to either refseq or genome
            return
         }else{
             let config = JSON.parse(configData)
             
             async.map(blastFiles, helpers.readAsync, function asyncMapBlast(err, results) {

                for(let i=0; i<blastFiles.length; i++){
                     console.log('file',blastFiles[i])
//                   console.log('config',config)
//                   console.log('results-i',results[i].toString())
                  if(config.blastFxn === 'genome'){
                     //data = results[i].toString()
                     console.log('pushing',results[i].toString())
                     //data.push("<div style='font-family: monospace;'><pre>"+results[i].toString()+'</pre></div>')   // genome is -html flag
                     data.push(results[i].toString()) 
                  }else{
                    jsondata = JSON.parse(results[i])  // refseq is json -outfmt 
                    //console.log(blastFiles[i])
                    data.push(jsondata.BlastOutput2[0].report.results.search)
                    if(jsondata === undefined){
                        console.log('jsondata error for file:',blastFiles[i])
                    }
                  }
                  if(CFG.ENV === 'development'){
                      //console.log('jsondata[0]', jsondata[0])
                  }
                  
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
                          //console.log('YYYY')
                          //throw new Error('BLAST Script Error: '+content)
                          console.log('CONTENT',content.toString().trim())
                          if(content.toString().trim()){  // means there was true error NOT zero length
                            //pyerror = { code: 1, msg:'BLAST Script Error:: ' + content }
                            req.flash('fail', 'BLAST Script Error:: '+ content)
                            res.redirect(config.returnTo) // this needs to redirect to either refseq or genome
                            return
                          }
                        }
                    })
                }
                let html = ''
                 if(config.blastFxn === 'genome'){
                     let rowBreak = "<br>= = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =<br>"
                     html = data.join(rowBreak)
                     //html = data
                 }else{
                     html = getBlastHtmlTable(data, blastID, sortCol, sortDir)
                 }
                
                if(!blastID){
                     req.flash('fail', 'blastID no longer Valid')
                     res.redirect(config.blastFxn) // this needs to redirect to either refseq or genome
                     return
                }

                console.log('rendering page')
                if(req.query.ajax){
                   return res.send(html)
                }else{
                  renderFxn(req, res, html, blastFiles, config, blastID)
                  
                }
            }) 
        }
    })
})
// function getBlastHtmlFromHtml(blastFiles, blastID){
//    let html = '<table>'
//    for(let i in blastFiles){
//      html += "<tr><td><a href='#' onclick=\"window.open('"+blastFiles[i]+"', '_blank', 'fullscreen=yes'); return false;\">"+blastFiles[i]+"</a></td></tr>"
//    }
//    return html
// }
//
//
router.get('/blast_wait', async function blastWait(req, res, next) {
    console.log('in blast wait')
    //????
    console.log('session blast_wait:')
    console.log(req.session)
    let finished = false, blastFiles = [], faFiles = [], html, jsondata, database, pyerror
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
        if(!result){
           req.flash('fail', 'There was a fatal error reading the BLAST directory')
           res.redirect(req.session.blast.returnTo) // this needs to redirect to either refseq or genome
           return
        }
        for(let i=0; i < result.length; i++){
           if(result[i].endsWith('.fa')){
              faFiles.push(result[i])
           } 
           if(result[i].endsWith('.out')){
              blastFiles.push(path.join(blastResultsDir, result[i]))
           } 
        }
        
        if(blastFiles.length === faFiles.length && req.session.blast.timer > 5){
           finished = true;
           
        }
    }else{
        finished = false;
    }
    if(!req.session.blast.timer){
       // need to get off this train
       await module.exports.sleep(1000);
       finished = true;
    }
    //console.log('timer:',req.session.blast.timer,'blastFiles',blastFiles.length,'faFiles',faFiles.length)
    console.log('finished:t/f?',finished)
    //console.log('session.error',req.session.pyerror)
    if(finished){
      if(!req.session.blast.id){
         req.flash('fail', 'blastID no longer Valid')
         res.redirect(req.session.blast.returnTo) // this needs to redirect to either refseq or genome
         return
       }
      res.redirect('/blast/blast_results?id=' + req.session.blast.id)
      
    }else{
      console.log('rendering blast_wait')
      res.render('pages/blast/blast_wait', {
        title: 'HOMD :: BLAST WAIT', 
        pgname: 'blast',
        config: JSON.stringify({ hostname: CFG.HOSTNAME, env: CFG.ENV }),
        hostname: CFG.HOSTNAME,
        ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
        db_choices: JSON.stringify(C.refseq_blastn_db_choices),
        filesFinished: blastFiles.length,
        filesStarted: faFiles.length,
        //error: JSON.stringify(req.session.pyerror)
        
      })
    }
    

})

router.post('/blast_post', upload.single('blastFile'),  async function blast_post(req, res, next) {
  console.log('MADEIT TO blastPost')
  console.log(req.body)
  console.log('req.file?', req.file)   // may be undefined
  let filename, filepath, data, fasta_as_list, trimlines, twolist,fastaFilePaths;
  const opts = { minLength: 10, patt: /[^ATCGUKSYMWRBDHVN]/i, returnTo: req.body.returnTo }
  let blastOpts = createBlastOpts(req.body)
  let dbPath
  if(req.body.blastFxn === 'genome'){
      dbPath = path.join(CFG.BLAST_DB_PATH_GENOME,req.body.blastDb)
  }else{
      dbPath = path.join(CFG.BLAST_DB_PATH_REFSEQ,req.body.blastDb)
  }
  
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
      if (req.file.size > C.blast_max_file_size){   // 1 911 016
       req.flash('fail', 'File too large');
       res.redirect(req.body.returnTo);
       return;
      }
      var fileContents = ''  // if buffer in req,file not need to move/read file
      
      followFilePath(req, res, opts, blastOpts, blastDir, fileContents, next)
      
  }else{
      opts.type = 'textInput'
      let inputSeqInput = req.body.inputSeq.trim();
      runPyScript(req, res, opts, blastOpts, blastDir, inputSeqInput, next)
  }
    

    
})
//
// router.post('/showBlast', function blastWait(req, res) {
//     console.log('in showBlast')
//     //console.log(req.body)
//     let type = req.body.type
//     let num = req.body.num
//     let blastID = req.body.id
//     //console.log('type',type)
//     //console.log('id',blastID)
//     //console.log('num',num)
//     let file
//     if(type === 'res'){
//         file = path.join(CFG.PATH_TO_BLAST_FILES,blastID,'blast_results','blast'+num+'.fa.out')
//     }else{  // type = seq
//         file = path.join(CFG.PATH_TO_BLAST_FILES,blastID,'blast'+num+'.fa')
//     }
//     console.log('file',file)
//     const data = fs.readFile(file, 'utf8', function readBlastFile(err, data) {
//       if (err)
//           console.log(err)
//       else
//           console.log(data)
//           res.send(data)
//     
//     })
// })
//
router.post('/blastDownload', function blastDownload(req, res) {
    //
    console.log('in blastDownload')
    console.log(req.body)
    let blastID = req.body.blastID
    let type = req.body.dnldType
    
    console.log('type',type)
    if(!type || !blastID){
       return
    }
    let jsondata, data=[], program, version
    // read directory CONFIG.json first
    let blastDir = path.join(CFG.PATH_TO_BLAST_FILES, blastID)

    let blastResultsDir = path.join(CFG.PATH_TO_BLAST_FILES, blastID, 'blast_results')

    const result = getAllFilesWithExt(blastResultsDir, 'out')

    if(!result){
       throw new Error('The Blast ID "'+blastID+'" was not found.<BR>Probably expired if you are using and old link.')
       return
    }


    let blastFiles = []
    for(let i=0; i < result.length; i++){
        if(req.body.blastFilesToDnld.indexOf(result[i]) >= 0) {
           blastFiles.push(path.join(blastResultsDir, result[i]))
        }else{
          console.log('NOT Downloading:',result[i])
        }
    }
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
             async.map(blastFiles, helpers.readAsync, function asyncMapBlast(err, results) {

                for(let i=0; i<blastFiles.length; i++){
                  
                  
                  jsondata = JSON.parse(results[i])
                  
                  //console.log(jsondata.BlastOutput2[0])
                  program = jsondata.BlastOutput2[0].report.program
                  version = jsondata.BlastOutput2[0].report.version
                  fileData[jsondata.BlastOutput2[0].report.results.search.query_title] = jsondata.BlastOutput2[0].report.results.search
                  //data.push(jsondata.BlastOutput2[0].report.results.search)
                  
                  if(CFG.ENV === 'development'){
                      //console.log('jsondata', jsondata)
                  }
                  if(jsondata === undefined){
                      console.log('jsondata error for file:',blastFiles[i])
                  }

                }
                
                //const html = getBlastHtmlTable(data, blastID, sortCol, sortDir)
                var table_tsv = create_download_table(fileData, type, program, version)
                if(type.substring(0,4) === 'text'){
                    res.set({"Content-Disposition":"attachment; filename=\"HOMD_taxon_table"+today+'_'+currentTimeInSeconds+".txt\""})
                 }else{  //excel
                    res.set({"Content-Disposition":"attachment; filename=\"HOMD_taxon_table"+today+'_'+currentTimeInSeconds+".xls\""})
                 }
                res.send(table_tsv)
                delete req.body
                //res.end()
             })   
      }
    })

    
})
function create_download_table(data, type, program, version) {
  let txt = ''
  
  let header = 'Query Title\tQuery Length\tHit HMT\tHOMD Seq Name\tHOMD Clone name\tIdentity\tIdentities(%)\tScore (bits)\tQuery Start\tSbjct Start\tQuery End\tSbjct End\tEvalue\tGaps\n'
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
    const data = fs.readFile(file, 'utf8', function readBlastFile(err, data) {
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
      bOpts.dbPath = CFG.BLAST_DB_PATH_GENOME
      dbItems = reqBody.blastDb.split('/')
      bOpts.blastDb = dbItems[1]
      bOpts.ext = dbItems[0]
    } else {
      bOpts.dbPath = CFG.BLAST_DB_PATH_REFSEQ
      bOpts.blastDb = reqBody.blastDb
      bOpts.ext = ''
    }
    if(reqBody.blastFilter){
      bOpts.fitler = '-F F'
    }
    return bOpts
}
function createConfig(req, opts, blastOpts, blastDir, dataOrPath ) {
    
    //console.log('blastOpts')
    //console.log(blastOpts)
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
function getBlastHtmlTable(jsonList, blastID, sortCol, sortDir){
    let desc,id,html,init,split_items,hmt,seqid
    html =''
    //html += "<small>"
    html += "blast results link: [ <span id='blasturl'>"+CFG.URL+"/blast/blast_results?id="+blastID+"</span> ] <= Copy this link to come back to these results for 30 days."
    //html += "</small>"
    html += "<table><thead>"
    html += '<tr>'
    html += "<th><input type='checkbox'  value='master' onclick=\"blastCkboxMaster('"+blastID+"')\"><br><sup>1</sup></th>"
    html += '<th>Query<sup>2</sup></th><th>Length</th>'
    html += '<th>View<sup>3</sup><br>Link</th><th>Hit<sup>4</sup></th><th>HOMD Clone Name</th>  <th>evalue</th><th>bit<br>score</th><th>Identity<sup>5</sup><br>(%)</th></tr>'
    html += '</thead><tbody>'
    //console.log('jsonList')
    //console.log(jsonList)
    if(sortCol === 'query'){
      console.log('sorting: ', sortCol, sortDir)
      if(sortDir === 'fwd'){
          jsonList.sort(function sortQF(a, b) {
            return helpers.compareStrings_alpha(a.query_title, b.query_title);
          })
      } else {
          jsonList.sort(function sortQR(a, b) {
            return helpers.compareStrings_alpha(b.query_title, a.query_title);
          })
      }
      html += getBlastHTML1(jsonList, blastID)
    } else if(sortCol === 'identity' || sortCol === 'score'){
       // make a new list from jsonList-- then sort it
       html += getBlastHTML2(jsonList, blastID, sortCol, sortDir)
   
    } else {
       // unsorted
        html += getBlastHTML1(jsonList, blastID)
    }
    html += '</tbody></table>'
    return html
}
function getBlastHTML2(jsonList, blastID, sortCol, sortDir) {
    // for sorting by identity and bit score
    
    let numhits,count=0,odd,bgcolor
    console.log('jsonList[0]')
    console.log(jsonList[0])
    let newList = [],addhtml = ''
    for(let n = 0; n < jsonList.length; n++){
        if(Object.prototype.hasOwnProperty.call(jsonList[n],'hits')){
           numhits = jsonList[n].hits.length
        }else{  
           return "<tr><td>Blast Error: "+jsonList[n].message+"</td></tr>"
        }
        let q = jsonList[n].query_title
        let l = jsonList[n].query_len
        let allow = 4
        if(numhits < allow){
           allow = numhits
        }
        for(let m = 0; m < allow; m++) { 
           //console.log('jsonList[n].hits[m]')
           //console.log(jsonList[n].hits[m])
           let hit_items = jsonList[n].hits[m].description[0].title.split('|')
           let titleid = hit_items.shift()  // remove and return first item after cleaning off zeros
           let HMT = (parseInt(hit_items[1].split('-')[1].trim())).toString()
           let bitScore =     jsonList[n].hits[m].hsps[0].bit_score.toFixed(1).toString()
           let identityPct = (jsonList[n].hits[m].hsps[0].identity * 100 / jsonList[n].hits[m].hsps[0].align_len).toFixed(1).toString()
           let evalue = jsonList[n].hits[m].hsps[0].evalue.toString()
           newList.push({
             query: q,
             length: l,
             hit: titleid.trim(),
             clone: hit_items.join(' | '),
             evalue: evalue,
             score: bitScore,
             identity: identityPct
            
            })
        
        
        }
    
    
    }
    if(sortCol === 'identity'){
      if(sortDir === 'fwd'){
          newList.sort(function sortIF(a, b) {
            return helpers.compareStrings_int(a.identity, b.identity);
          })
      } else {
          newList.sort(function sortIR(a, b) {
            return helpers.compareStrings_int(b.identity, a.identity);
          })
      }
    }else if(sortCol === 'score'){
      if(sortDir === 'fwd'){
          newList.sort(function sortSF(a, b) {
            return helpers.compareStrings_int(a.identity, b.identity);
          })
      } else {
          newList.sort(function sortSR(a, b) {
            return helpers.compareStrings_int(b.identity, a.identity);
          })
      }
    }
    
    for(let n = 0; n < newList.length; n++){
       // quey_name,length,hit,clone_name,evalue,score,identity
       
       
       //console.log(jsonList[n])
       odd = count % 2  // will be either 0 or 1
       //console.log('odd',odd)
       
       if(odd){
         bgcolor = 'blastBGodd'
       }else{
         bgcolor = 'blastBGeven'
       }
        count += 1
        addhtml += "<tr class='"+bgcolor+"'>"
        addhtml += "<td></td>"  // no checkboxes
        addhtml += "<td class='blastcol1 small' >"+newList[n].query+'</td>'
        addhtml += "<td class='blastcol2 center' >"+newList[n].length+"</td>"
       // addhtml += "<td rowspan='4'><a href='showBlast/seq/"+blastID+"/"+n[n.length - 1]+"'>seq</a><br><br><a href='showBlast/res/"+blastID+"/"+n[n.length - 1]+"'>blast_resultfile</a></td>"
        addhtml += "<td class='center' ><a href='#' onclick=\"getFileContent('seq','"+blastID+"','"+n.toString()+"')\"><img  src='/images/tinyseq.gif' height='15'></a><br><a href='#' onclick=\"getFileContent('res','"+blastID+"','"+n.toString()+"')\"><img  src='/images/blastRes.gif' height='15'></a></td>"
        addhtml += "<td class='blastcol3 center "+bgcolor+"'><a href=''>" + newList[n].hit + '</a></td>'
        addhtml += "<td class='blastcol4 xsmall "+bgcolor+"'>" + newList[n].clone + '</td>'
        addhtml += "<td class='center xsmall "+bgcolor+"'>" + newList[n].evalue + '</td>'
        addhtml += "<td class='center xsmall "+bgcolor+"'>" + newList[n].score + '</td>'
        addhtml += "<td class='center xsmall "+bgcolor+"'>" + newList[n].identity + '</td>'
        addhtml += "</tr>"
       
    }
    
    return addhtml
}
function getBlastHTML1(jsonList, blastID) {
    //console.log(jsonList[0].query_title)
    //
    let count = 0, bgcolor, odd, numhits, addhtml = ''
    //for(let n in jsonList){
    for(let n = 0; n < jsonList.length; n++){
       //console.log('jsonList[n]',n)
       //console.log(jsonList[n])
       if(Object.prototype.hasOwnProperty.call(jsonList[n],'hits')){
           numhits = jsonList[n].hits.length
       }else{  
           return "<tr><td>Blast Error: "+jsonList[n].message+"</td></tr>"
       }
       let allow = 4
        if(numhits < allow){
           allow = numhits
        }
       // n == query0, query1, query2
       odd = count % 2  // will be either 0 or 1
       //console.log('odd',odd)
       
       if(odd){
         //bgcolor = 'background: var(--div-bg016)'
         bgcolor = 'blastBGodd'
       }else{
         //bgcolor = 'background: var(--div-bg017)'
         bgcolor = 'blastBGeven'
       }
       count += 1
       if(numhits === 0){
           //console.log('numhits',numhits)
           addhtml += "<tr class='"+bgcolor+"'>"
           addhtml += '<td></td>'
           addhtml += "<td class='blastcol1 small'>"+jsonList[n].query_title+'</td>'
           addhtml += "<td class='blastcol2 center'>"+jsonList[n].query_len+'</td>'
           addhtml += "<td class='center' ><a href='#' onclick=\"getFileContent('seq','"+blastID+"','"+n.toString()+"')\"><img  src='/images/tinyseq.gif' height='15'></a> <a href='#' onclick=\"getFileContent('res','"+blastID+"','"+n.toString()+"')\"><img  src='/images/blastRes.gif' height='15'></a></td>"
           addhtml += "<td class='blastcol3 center'>no hits found</td>"
           addhtml += "<td class='blastcol4'>no hits found</td>"  
           addhtml += '<td></td><td></td><td></td></tr>'
       
       } else {
          //console.log('numhits<4',numhits)
          addhtml += "<tr class='"+bgcolor+"'>"
          addhtml += "<td rowspan='"+allow+"'><input checked type='checkbox' name='blastcbx' value='"+n+"'></td>"  // value will be the file number: blast0, 1, 2...
          addhtml += "<td class='blastcol1 small' rowspan='"+allow+"'>"+jsonList[n].query_title+'</td>'
          addhtml += "<td class='blastcol2 center' rowspan='"+allow+"'>"+jsonList[n].query_len+'</td>'
          //addhtml += "<td rowspan='"+allow+"'><a href='showBlast/seq/"+blastID+"/"+n[n.length - 1]+"'>seq</a><br><br><a href='showBlast/res/"+blastID+"/"+n[n.length - 1]+"'>res</a></td>"
          addhtml += "<td class='center' rowspan='"+allow+"'><a href='#' onclick=\"getFileContent('seq','"+blastID+"','"+n.toString()+"')\"><img  src='/images/tinyseq.gif' height='15'></a><br><br><a href='#' onclick=\"getFileContent('res','"+blastID+"','"+n.toString()+"')\"><img  src='/images/blastRes.gif' height='15'></a></td>"
          
          for(let m = 0; m < allow; m++) {   // take 4 hits only -- are they top hits??
               addhtml += getRowHTML(jsonList[n].hits[m].description[0], jsonList[n].hits[m].hsps[0], bgcolor)
               addhtml += '</tr>'
          }
       }
    }
    
    return addhtml
}
//
//

function getRowHTML(description, hsps, bgcolor) {
    let hit_items,titleid,HMT,bitScore,identityPct,evalue,addhtml = ''
    bitScore = hsps.bit_score.toFixed(1).toString()
    identityPct = (hsps.identity * 100 / hsps.align_len).toFixed(1).toString()
    evalue = hsps.evalue.toString()
    // console.log('evalue', evalue)
//     console.log('hsps.identity', hsps.identity)
//     console.log('bitScore', bitScore)
//     console.log('identityPct', identityPct)
    
     if(description.title === ''){
        //eg Bv6
        addhtml += "<td class='blastcol3 center "+bgcolor+"'>" + description.id + '</td>'
        addhtml += "<td class='blastcol4 xsmall "+bgcolor+"'>" + description.accession + '</td>'
        addhtml += "<td class='center xsmall "+bgcolor+"'>" + evalue + '</td>'
        addhtml += "<td class='center xsmall "+bgcolor+"'>" + bitScore + '</td>'
        addhtml += "<td class='center xsmall "+bgcolor+"'>" + identityPct + '</td>'
        
     }else{
        // for all? homd blast databases??
        // this only works for 16Srefseq
        let title = description.title
        hit_items = title.split('|')
        //console.log('hit_items:',hit_items)
        try {
          titleid = hit_items.shift()  // remove and return first item after cleaning off zeros
          HMT = (parseInt(hit_items[1].split('-')[1].trim())).toString()
          addhtml += "<td class='blastcol3 center "+bgcolor+"'><a href='/taxa/tax_description?otid=" + HMT + "'>" + titleid.trim() + '</a></td>'
        }catch(e){
          addhtml += "<td class='blastcol3 center "+bgcolor+"'>"+title+"</td>"
        }
        addhtml += "<td class='blastcol4 xsmall "+bgcolor+"'>" + hit_items.join('|') + '</td>'
        addhtml += "<td class='center xsmall "+bgcolor+"'>" + evalue + '</td>'
        addhtml += "<td class='center xsmall "+bgcolor+"'>" + bitScore + '</td>'
        addhtml += "<td class='center xsmall "+bgcolor+"'>" + identityPct + '</td>'
        
     }
    
    
    return addhtml
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
        //console.log('dataxx')
        //console.log(data)
        
        runPyScript(req, res, opts, blastOpts, blastDir, dest, next)
        
        
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
    console.log('data read from to '+filePath);
    return data
  } catch (error) {
    console.error('Got an error trying to read the file: ',error);
  }
}
async function moveFile(source, destination) {
  console.log('in move')
  try {
    await fsp.rename(source, destination);
    console.log(`Moved file from ${source} to ${destination}`);
  } catch (error) {
    console.error('Got an error trying to move the file:',error);
  }
}




//
//
function runPyScript(req, res, opts, blastOpts, blastDir, dataForPy, next){
    console.log('In runPyScript')
    
    //const dataFromPython = await pythonPromise(req, res, opts, blastOpts, blastDir, dataForPy);
    // here run pyscript
    // then render and return to restart q 5sec
    // let pyscriptOpts = []
//     
    const pyscript = path.join(CFG.PATH_TO_SCRIPTS, 'run_blast_no_cluster.py') 
    
    const config = createConfig(req, opts, blastOpts, blastDir, dataForPy)
    
    const jsonConfigFilePath = path.join(blastDir, 'CONFIG.json')
    
    fs.writeFileSync(jsonConfigFilePath , JSON.stringify(config, null, 2))
    
    const pyscriptOpts = ['-c', jsonConfigFilePath]
    
    //console.log('running py script: ')
    //console.log(pyscript, pyscriptOpts.join(' '))
    
    
    const pythonRun = spawn(pyscript, pyscriptOpts, {
                env:{'PATH': CFG.PATH},   // CFG.PATH must include python executable path
                detached: true, stdio: 'pipe'
    })
    
    
    
    pythonRun.stdout.on('data', function pyStdOut(data) {
      console.log('Pipeing data from python script::')
      console.log(data.toString())
      let dataPyToSend = data.toString()
      //req.session.pyerror = {code:0, msg:''}
    })
    
    pythonRun.stderr.on('data', function pyStdErr(data) {
      let errorData = data.toString()
      
      //req.session.pyerror = {code: 1, msg: errorData}
      console.log('Caught ERROR', errorData)
      //
      let errorFilePath = path.join(blastDir, 'pythonerror.log')
      console.log(errorFilePath)
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
