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

//
//
router.get('/blast_results', function blastResults(req, res) {
     console.log('in blast_results')
     let blastID = req.query.id   
     
     if(Object.prototype.hasOwnProperty.call(req.session, 'blast')){
         console.log('deleteing session blast')
         delete req.session.blast
     }
     
     console.log(req.query)
     let jsondata, data={}, html
     // read directory CONFIG.json first
     let blastDir = path.join(CFG.PATH_TO_BLAST_FILES, blastID)
     
     
     let blastResultsDir = path.join(CFG.PATH_TO_BLAST_FILES, blastID, 'blast_results')
     //const result = getAllDirFiles(blastDir) // will give ALL files in ALL dirs
     const result = getAllFilesWithExt(blastResultsDir, 'out')
     // for(let i=0; i < result.length; i++){
//            if(result[i].endsWith('.fa')){
//               faFiles.push(result[i])
//            } 
//            if(result[i].endsWith('.out')){
//               blastFiles.push(path.join(blastResultsDir, result[i]))
//            } 
//         }
     
     
     let blastFiles = []
     for(let i=0; i < result.length; i++){
              blastFiles.push(path.join(blastResultsDir, result[i]))
      }
     console.log('blastfiles')
     console.log(blastFiles)
     let configFilePath = path.join(CFG.PATH_TO_BLAST_FILES, blastID,'CONFIG.json')
     fs.readFile(configFilePath, function readConfig(err,  configData) {
         if(err){
            return console.log(err)
         }else{
             let config = JSON.parse(configData)
             async.map(blastFiles, helpers.readAsync, function asyncMapBlast(err, results) {

                  for(let i=0; i<blastFiles.length; i++){
                      jsondata = JSON.parse(results[i])
                      //console.log(blastFiles[i])
                      data['query'+i.toString()] = jsondata.BlastOutput2[0].report.results.search
                      if(CFG.ENV === 'development'){
                          console.log('jsondata', jsondata)
                      }
                      if(jsondata === undefined){
                          console.log('jsondata error for file:',blastFiles[i])
                      }

                  }

                  html = getBlastHtmlTable(data, blastID)

                  if(!blastID){
                     req.flash('fail', 'blastID no longer Valid')
                     res.redirect(req.session.blast.returnTo) // this needs to redirect to either refseq or genome
                     return
                   }


                res.render('pages/blast/blast_results', {
                        title: 'HOMD :: BLAST WAIT', 
                        pgname: 'blast_results',
                        config: JSON.stringify({ hostname: CFG.HOSTNAME, env: CFG.ENV }),
                        hostname: CFG.HOSTNAME,
                        ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version, tax_ver: C.homd_taxonomy_version }),
                        //db_choices: JSON.stringify(C.refseq_blastn_db_choices),
                        html: html,
                        numseqs: blastFiles.length,
                        blastParams: JSON.stringify(config),
                        blastID: blastID,
                        //blastTimer: req.session.blast.timer,   // rough count
                        //blastProgram: req.session.blast.program,
                        //error: JSON.stringify(pyerror)
                        error: JSON.stringify({})
                  })
            }) 
        }
    })
})
//
router.get('/blast_wait', function blastWait(req, res) {
    console.log('in blast wait')
    
    // need access to blast dir????
    // session id??
    if(!req.session.blast){
       res.redirect('/')
       return
    }
    
    console.log('session blast_wait:')
    console.log(req.session)
    console.log(req.session.blast.id)
    let finished = false, blastFiles = [], faFiles = [], html, jsondata, pyerror
    
    if(req.session.blast.id){
        let blastDir = path.join(CFG.PATH_TO_BLAST_FILES, req.session.blast.id)
        req.session.blast.counter += 1
        req.session.blast.timer += 5  // 5sec at a pop
        let blastResultsDir = path.join(CFG.PATH_TO_BLAST_FILES, req.session.blast.id, 'blast_results')
        //const result = getAllDirFiles(blastDir) // will give ALL files in ALL dirs
        const faFiles    = getAllFilesWithExt(blastDir,'fa')
        const blastFiles = getAllFilesWithExt(blastResultsDir,'out')
       
        console.log('blastFiles1',blastFiles.length,'faFiles1',faFiles.length)
        if(blastFiles.length === faFiles.length && req.session.blast.counter > 1){
             finished = true;
        }
        
        
            if(blastFiles.length > 0 && finished ){
                let data = {}
                //console.log('req.session.blast.id',req.session.blast.id)
                let errorFilePath = path.join(CFG.PATH_TO_BLAST_FILES, req.session.blast.id, 'SCRIPTERROR')

                fs.readFile(errorFilePath, function tryReadErrorFile(err, content) {
                      if(err){
                          // continue on NO ERROR FILE PRESENT
                          // no error to report
                          pyerror = { code: 0, msg: ''}
                      }else{
                         // file exists throw error
                         //throw new Error('BLAST Script Error: '+content)
                         pyerror = { code: 1, msg:'BLAST Script Error: ' + content }
                      }
                      res.redirect('/blast/blast_results?id=' + req.session.blast.id)
                }) 

            }else{
              console.log('rendering blast_wait')
              res.render('pages/blast/blast_wait', {
                title: 'HOMD :: BLAST WAIT', 
                pgname: 'blast_wait',
                config: JSON.stringify({ hostname: CFG.HOSTNAME, env: CFG.ENV }),
                hostname: CFG.HOSTNAME,
                ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version, tax_ver: C.homd_taxonomy_version }),
                //db_choices: JSON.stringify(C.refseq_blastn_db_choices),
                filesFinished: blastFiles.length,
                filesStarted: faFiles.length,
                //error: JSON.stringify(req.session.pyerror)
        
              })
            }
        
        
        
        
    }else{
        finished = false;
        console.log('no session blast id')
    }
   //  if(!req.session.blast.counter){
//        // need to get off this train
//        finished = true;
//     }
//     console.log('counter:',req.session.blast.counter,'blastFiles2',blastFiles.length,'faFiles2',faFiles.length)
//     console.log('finished:t/f?',finished)
//     //console.log('session.error',req.session.pyerror)
   
    

})
//
//
router.post('/blast_post', upload.single('blastFile'),  async function blast_post(req, res, next) {
  console.log('MADEIT TO blastPost')
  console.log(req.body)
  
  console.log('req.file?', req.file)   // may be undefined
  // blastFxn == 'refseq' and returnTo == '/refseq/refseq_blastn'
  
  let filename, filepath, data, fasta_as_list, trimlines, twolist,fastaFilePaths;
  const opts = { minLength: 10, patt: /[^ATCGUKSYMWRBDHVN]/i, returnTo: req.body.returnTo }
  
  let blastOpts = createBlastOpts(req.body)
  //let blast_session_ts = Date.now().toString();
  const randomnum = Math.floor(Math.random() * 90000) + 10000;
  opts.blastSessionID = req.session.id + '-' + randomnum.toString()
  
  const blastDir = path.join(CFG.PATH_TO_BLAST_FILES, opts.blastSessionID)
  //const blastDir = path.join(CFG.PATH_TO_BLAST_FILES, opts.blastSessionID, 'blast_results')
  if (!fs.existsSync(blastDir+'/'+'blast_results')){
       fs.mkdirSync(blastDir+'/'+'blast_results', { recursive: true });
  }
  if(req.file){
      opts.type = 'fileInput'
      if (req.file.size > 1500000){   // 1 911 016
       req.flash('fail', 'File too large');
       res.redirect(req.body.returnTo);
       return;
      }
      var fileContents = ''  // if buffer in req,file not need to move/read file
      
      followFilePath(req, res, opts, blastOpts, blastDir, fileContents, next)
      
      //data = followFilePathPyScript(req, res, opts, blastOpts, blastDir, fileContents)
  }else{
      opts.type = 'textInput'
      //followTextInputPath(req, res, opts, blastOpts, blast_directory)
      data = followTextInputPathPyScript(req, res, opts, blastOpts, blastDir, next)
      
      
      let config = createConfig(req, opts, blastOpts, blastDir, data)
      const configFilePath = path.join(blastDir,'CONFIG.json')
      
      fs.writeFile(configFilePath, JSON.stringify(config, null, 2), function writeConfig(err){
          if(err){
              return console.log(err)
          }else{
              runPyScript(req, res, opts, blastOpts, blastDir)
          }
      
      
      })
     
//      dataFromPython = await pythonPromise(req, res, opts, blastOpts, blastDir, data);
      //console.log('XX',dataFromPython)
      
          
      //res.send(dataFromPython);
  }
    
})
router.post('/blastDownload', function blastDownload(req, res) {
    //
    console.log('in blastDownload')
    console.log(req.body)
    let blastID = req.body.blastID
    let type = req.body.dnldType
    let blastDir = path.join(CFG.PATH_TO_BLAST_FILES, blastID)
    
    // for text files push to bowser??
    // for excel download file
    // for json :: download
    
    // return to results
    res.end()
    
})
router.post('/openBlastWindow', function openBlastWindow(req, res) {
    //
    console.log('in showBlast')
    console.log(req.body)
    let type = req.body.type
    let num = req.body.num
    let blastID = req.body.id
    console.log('type',type)
    console.log('id',blastID)
    console.log('num',num)
    let file
    if(type === 'res'){
        file = path.join(CFG.PATH_TO_BLAST_FILES, blastID, 'blast_results', 'blast' + num + '.fa.out')
    }else{  // type = seq
        file = path.join(CFG.PATH_TO_BLAST_FILES, blastID, 'blast' + num + '.fa')
    }
    console.log('file',file)
    const data = fs.readFile(file, 'utf8', function readBlastFile(err, data) {
      if (err)
          console.log(err)
      else
          console.log(data)
          res.send(data)
    
    })
})
//////////////////////////////////////////////////////////////////
///// FUNCTIONS /////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
function createBlastOpts(reqBody) {
    let bOpts = {}
    bOpts.expect =    reqBody.blastExpect
    //descriptions: req.body.blastDescriptions,
    //alignments: req.body.blastAlignments,
    bOpts.maxTargetSeqs = reqBody.blastMaxTargetSeqs,
    bOpts.advanced = reqBody.advancedOpts,
    bOpts.program = reqBody.blastProg
    // add dbPath later
    bOpts.blastDb = reqBody.blastDb
    if(reqBody.blastFxn === 'genome') {
      bOpts.dbPath = CFG.BLAST_DB_PATH_GENOME 
    } else {
      bOpts.dbPath = CFG.BLAST_DB_PATH_REFSEQ
    }
    if(reqBody.blastFilter){
      bOpts.fitler = '-F F'
    }
    return bOpts
}
function createConfig(req, opts, blastOpts, blastDir, dataOrPath ) {
    
    console.log('blastOpts')
    console.log(blastOpts)
    let config = {}
    config.site = CFG.SITE  //  local, mbl or homd;; this determines blast db
    config.blastdbPath = blastOpts.dbPath
    config.blastdb = blastOpts.blastDb
    config.blastDir = blastDir
    config.dataType = opts.type
    config.expect = blastOpts.expect
    config.blastFxn = req.body.blastFxn
    config.advanced = blastOpts.advanced
    config.maxTargetSeqs = blastOpts.maxTargetSeqs
    config.program = blastOpts.program
    config.programPath = CFG.PATH_TO_BLAST_PROG
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

function getBlastHtmlTable(json, blastID){
    let desc,id,html,init,numhits,split_items,hmt,seqid
    
    html = '<table><thead>'
    html += '<tr>'
    html += "<th><input type='checkbox' onclick=\"blastCkboxMaster('"+blastID+"')\"><br><sup>1</sup></th>"
    html += '<th>Query</th><th>Length</th>'
    html += '<th>View<sup>3</sup><br>Link</th><th>Hit</th><th>HOMD Clone Name</th>  <th>evalue</th><th>bit<br>score</th><th>Identities<br>(%)</th></tr>'
    html += '</thead><tbody>'
    
    let count = 0,bgcolor,odd
    for(let n in json){
       numhits = json[n].hits.length
       // n == query0, query1, query2 .....
       //bg color
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
       if(numhits == 0){
           html += "<tr class='"+bgcolor+"'>"
           html += '<td></td>'
           html += "<td class='blastcol1 small'>"+json[n].query_title+'</td>'
           html += "<td class='blastcol2 center'>"+json[n].query_len+'</td>'
           html += '<td></td>'
           html += "<td class='blastcol3 center'>no hits found</td>"
           html += "<td class='blastcol4'>no hits found</td>"  
           html += '<td></td><td></td><td></td></tr>'
       
       } else if(numhits >= 4) {
          //console.log('numhits>=4',numhits)
          html += "<tr class='"+bgcolor+"'>"
          html += "<td rowspan='4'><input checked type='checkbox' name='blastcbx' value='"+n+"'></td>"
          html += "<td class='blastcol1 small' rowspan='4'>"+json[n].query_title+'</td>'
          html += "<td class='blastcol2 center' rowspan='4'>"+json[n].query_len+"</td>"
         // html += "<td rowspan='4'><a href='showBlast/seq/"+blastID+"/"+n[n.length - 1]+"'>seq</a><br><br><a href='showBlast/res/"+blastID+"/"+n[n.length - 1]+"'>blast_resultfile</a></td>"
          html += "<td class='center' rowspan='4'><a href='#' onclick=\"getFileContent('seq','"+blastID+"','"+n[n.length - 1]+"')\"><img  src='/images/tinyseq.gif' height='15'></a><br><br><a href='#' onclick=\"getFileContent('res','"+blastID+"','"+n[n.length - 1]+"')\"><img  src='/images/blastRes.gif' height='15'></a></td>"
          
          for(let m = 0; m < 4; m++) {   // take 4 hits only -- are they top hits??
               html += getRowHTML(json[n].hits[m].description[0], json[n].hits[m].hsps[0], bgcolor)
               html += '</tr>'
            
          }
       } else {
          //console.log('numhits<4',numhits)
          html += "<tr class='"+bgcolor+"'>"
          html += "<td rowspan='"+numhits+"'><input checked type='checkbox' name='blastcbx' value='"+n+"'></td>"
          html += "<td class='blastcol1 small' rowspan='"+numhits+"'>"+json[n].query_title+'</td>'
          html += "<td class='blastcol2 center' rowspan='"+numhits+"'>"+json[n].query_len+'</td>'
          //html += "<td rowspan='"+numhits+"'><a href='showBlast/seq/"+blastID+"/"+n[n.length - 1]+"'>seq</a><br><br><a href='showBlast/res/"+blastID+"/"+n[n.length - 1]+"'>res</a></td>"
          html += "<td class='center' rowspan='"+numhits+"'><a href='#' onclick=\"getFileContent('seq','"+blastID+"','"+n[n.length - 1]+"')\"><img  src='/images/tinyseq.gif' height='15'></a><br><br><a href='#' onclick=\"getFileContent('res','"+blastID+"','"+n[n.length - 1]+"')\"><img  src='/images/blastRes.gif' height='15'></a></td>"
          
          for(let m = 0; m < numhits; m++) {   // take 4 hits only -- are they top hits??
               html += getRowHTML(json[n].hits[m].description[0], json[n].hits[m].hsps[0], bgcolor)
               html += '</tr>'
          }
       }
    }
    html += '</tbody></table>'
    
    return html
}
function getRowHTML(description, hsps, bgcolor) {
    let hit_items,titleid,HMT,bitScore,identityPct,evalue,html = ''
    bitScore = hsps.bit_score.toFixed(1).toString()
    identityPct = (hsps.identity * 100 / hsps.align_len).toFixed(1).toString()
    evalue = hsps.evalue.toString()
    // console.log('evalue', evalue)
//     console.log('hsps.identity', hsps.identity)
//     console.log('bitScore', bitScore)
//     console.log('identityPct', identityPct)
    
     if(description.title === ''){
        //eg Bv6
        html += "<td class='blastcol3 center "+bgcolor+"'>" + description.id + '</td>'
        html += "<td class='blastcol4 xsmall "+bgcolor+"'>" + description.accession + '</td>'
        html += "<td class='center xsmall "+bgcolor+"'>" + evalue + '</td>'
        html += "<td class='center xsmall "+bgcolor+"'>" + bitScore + '</td>'
        html += "<td class='center xsmall "+bgcolor+"'>" + identityPct + '</td>'
        
     }else{
        // for all? homd blast databases??
        hit_items = description.title.split('|')
        titleid = hit_items.shift()  // remove and return first item after cleaning off zeros
        HMT = (parseInt(hit_items[1].split('-')[1].trim())).toString()
        html += "<td class='blastcol3 center "+bgcolor+"'><a href='/taxa/tax_description?otid=" + HMT + "'>" + titleid.trim() + '</a></td>'
        html += "<td class='blastcol4 xsmall "+bgcolor+"'>" + hit_items.join('|') + '</td>'
        html += "<td class='center xsmall "+bgcolor+"'>" + evalue + '</td>'
        html += "<td class='center xsmall "+bgcolor+"'>" + bitScore + '</td>'
        html += "<td class='center xsmall "+bgcolor+"'>" + identityPct + '</td>'
        
     }
    
    
    return html
}
function getAllFilesWithExt(dirPath, ext) {
     const files = fs.readdirSync(dirPath)
     let arrayOfFiles = []
     files.forEach(function getFilesArray(file) {
     if (fs.statSync(dirPath + "/" + file).isFile() && file.endsWith(ext)) {
        arrayOfFiles.push(file)
     }
    })

    return arrayOfFiles
}

function getAllDirFiles(dirPath, arrayOfFiles) {
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
}
// function checkSeqLength(seq, minLength) {
//   if(inputSeqInput === ''){
//         req.flash('fail', 'No Query Sequence(s) were Entered');  // implement flash?
//         res.redirect('/refseq/refseq_blastn');  // this may be refseq or genome
//         return false;
//   }
//   if(inputSeqInput.length <= opts.minLength){  
//         req.flash('fail', 'Query length needs to be greater than 10bp');
//         res.redirect('/refseq/refseq_blastn');
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
    // for fileinput
    //fs.renameSync(source, dest)
    //let fastaFilePaths = readFileWriteFiles(blastDir, dest)
    
    return (async function mvAndRunPyFxn() {
      if (req.file){
        
        await moveFile(source, dest)
        let data = await readFile(dest)
        //console.log('dataxx')
        //console.log(data)
        
        let config = createConfig(req, opts, blastOpts, blastDir, dest)
        const configFilePath = path.join(blastDir,'CONFIG.json')
        await writeFile(configFilePath, JSON.stringify(config, null, 2))
        
        runPyScript(req, res, opts, blastOpts, blastDir, dest, next)
        
        //return data
          //readFileWriteFilesPromise(dest, req, res, blastOpts, blastDir);
          //readFileContent(dest, {})
      }else{
         console.log('File Promise broken')
      }
    })()
  
  
  
}
function followTextInputPathPyScript(req, res, opts, blastOpts, blastDir, next) {
  console.log('in TextEntry Path')
  let inputSeqInput = req.body.inputSeq.trim();
  // let python do the work of splitting and file writing
  
  return inputSeqInput
  
}

async function writeFile(filePath, data) {
  try {
    await fsp.writeFile(filePath, data);
    console.log('data written to '+filePath);
  } catch (error) {
    console.error('Got an error trying to write the file: ',error);
  }
}
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
function runPyScript(req, res, opts, blastOpts, blastDir, dataOrPath, next){
    console.log('In runPyScript')
    let success, lineItems, seqcount
    //const dataFromPython = await pythonPromise(req, res, opts, blastOpts, blastDir, dataForPy);
    // here run pyscript
    // then render and return to restart q 5sec
    // let pyscriptOpts = []
//     
    let pyscript = path.join(CFG.PATH_TO_SCRIPTS, 'run_blast_no_cluster.py') 
    // let config = {}
//     config.site = CFG.SITE  //  local, mbl or homd;; this determines blast db
//     config.blastdbPath = blastOpts.dbPath
//     config.blastDir = blastDir
//     config.dataType = opts.type
//     config.expect = blastOpts.expect
//     config.blastFxn = req.body.blastFxn
//     //config.descriptions = blastOpts.descriptions
//     //config.alignments = blastOpts.alignments
//     config.advanced = blastOpts.advanced
//     config.maxTargetSeqs = blastOpts.maxTargetSeqs
//     
//     config.program = path.join(CFG.PATH_TO_BLAST_PROG, blastOpts.program)
//     
//     config.command = pyscript +' -c '+ path.join(blastDir, 'CONFIG.json')
//     config.filePath = ''
//     config.textInput = ''
//     
//     if(opts.type == 'fileInput'){
//         config.filePath = dataForPy
//     }else{
//         config.textInput = '"'+dataForPy+'"'
//     }
    //let config = createConfig(req, opts, blastOpts, blastDir, dataOrPath )
    //const configFile = writeBlastConfig(blastDir, config)   // sync or no sync??
    
    let pyScriptPath = path.join(CFG.PATH_TO_SCRIPTS, 'run_blast_no_cluster.py')
    
    const pyscriptOpts = ['-c', path.join(blastDir, 'CONFIG.json')]
    
    
    //let pyscriptOpts =  ['-t',opts.type]
    console.log('running py script: ')
    console.log(pyscript, pyscriptOpts.join(' '))
    
    
    const pythonRun = spawn(pyscript, pyscriptOpts, {
                env:{'PATH': CFG.PATH},   // CFG.PATH must include python executable path
                detached: true, stdio: 'pipe'
    })
    
    
    
    pythonRun.stdout.on('data', function pyStdOut(data) {
      console.log('Pipeing data from python script::')
      console.log(data.toString())
      let dataPyToSend = data.toString()
      let printItems = dataPyToSend.split('\n')
      let seqcount_lst = printItems.filter( (n) => {
         if(n.split('=')[0] === 'SEQCOUNT'){
            return n
         }
      })
      seqcount = seqcount_lst[0].split('=')[1]
      
      // if(lineItems[0] === 'SEQCOUNT'){
//            success = true
//            console.log('got seqcount')
//            seqcount = lineItems[1].strip()
//       }
      //req.session.pyerror = {code:0, msg:''}
    })
    
    pythonRun.stderr.on('data', function pyStdErr(data) {
      let errorData = data.toString()
      success = false
      seqcount=0
      //req.session.pyerror = {code: 1, msg: errorData}
      console.log('Caught ERROR', errorData)
      //
      let errorFilePath = path.join(blastDir, 'SCRIPTERROR')
      console.log(errorFilePath)
      fs.writeFileSync(errorFilePath, errorData)
      //throw new Error(errordata);
      
    })
    
    pythonRun.on('close', function pyClose() {
        console.log('Finished - from nodejs')
        console.log('seqcount=',seqcount)
        if(Number.isInteger(parseInt(seqcount))){
          console.log('success = true')
          success = true
        }
    
        let testing = false
        console.log('Testing',testing)
    
        if(testing){
            //send data to browser window
            pythonRun.on('close', (code) => {
              console.log(`child process close all stdio with code ${code}`);
              // send pyscript output to browser for testing
              res.send(dataPyToSend)
            });
        } else if(success) {
            // respond immediately
            console.log('session BLASTING')
            //res.cookie('blastDir',blastDir);
            //req.session.cookie.blastid = blastDir
            const oneDayToMilliSeconds = 1000 * 60 * 60 * 60 * 24;
            // IDEA:: put EVERYthing in config file NOT session var
        
            console.log('Setting session.blast')
        
        
            req.session.blast = {}
//         
//             //  1000 * 60 * 60 * 60 * 24)   // // 24hrs === 86,400,000 msec
            req.session.blast.id = opts.blastSessionID
            req.session.blast.timer = 0
//             req.session.blast.counter = 0
//             req.session.blast.seqcount = seqcount
//             req.session.blast.program = req.body.blastProg  //blastOpts.program
//             req.session.blast.returnTo = req.body.returnTo
//             req.session.blast.db = req.body.blastDb
//             req.session.blast.fxn = req.body.blastFxn
//             setTimeout(function() {
//                 console.log('Deleteing session.blast')
//                 delete req.session.blast
//                 console.log(req.session)
//                 console.log(req.session.id)
//             }, 100000)   // // 100sec === 100000 msec
//             console.log(req.session)
            //req.session.pyerror = {code:0, msg:''}
            res.redirect('blast_wait')   // MUST run at least once
        }else {
            // pyerror
            console.log('not success or testing')
        }
    
    
     })
   
     
     
}

function writeBlastConfig(dir, data) {
    //const configFilePath = path.join(dir,'CONFIG.json')
    const jsonConfigFilePath = path.join(dir,'CONFIG.json')
    // let config_string = '[MAIN]\n'
//     for(n in data){
//        config_string += n+" = "+data[n] +'\n'
//     }
    //fs.writeFileSync(configFilePath , config_string)
    fs.writeFileSync(jsonConfigFilePath , JSON.stringify(data, null, 2))
    return jsonConfigFilePath
}

function readFileWriteFiles(dir, bigFilePath) {
    console.log('in readFileWriteFiles - no Promises')
    readFileContent(bigFilePath, function readFileContentcb(err, content) {
        console.log('content')
        console.log(content.toString())
        
        return 'myreturn'
    })
    
}
function readFileContent(file, callback) {
    fs.readFile(file, function readFile2(err, content) {
        if (err) return callback(err)
        console.log(content.toString())
        callback(null, content)
    })
}




module.exports = router