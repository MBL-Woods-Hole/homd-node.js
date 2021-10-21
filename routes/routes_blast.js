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
router.post('/blastDownload', function blastWait(req, res) {
    console.log('in blastDownload')
    console.log(req.body)
    
    
})
router.post('/showBlast', function blastWait(req, res) {
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
        file = path.join(CFG.PATH_TO_BLAST_FILES,blastID,'blast_results','blast'+num+'.fa.out')
    }else{  // type = seq
        file = path.join(CFG.PATH_TO_BLAST_FILES,blastID,'blast'+num+'.fa')
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
router.get('/blast_wait', function blastWait(req, res) {
    console.log('in blast wait')
    // need access to blast dir????
    // session id??
    
    console.log('session blast_wait:')
    console.log(req.session)
    let finished = false, blastFiles = [], faFiles = [], html, jsondata, database, pyerror
    
    
    
    if(req.session.blastID){
        let blastDir = path.join(CFG.PATH_TO_BLAST_FILES, req.session.blastID)
        req.session.blastCounter += 1
        req.session.blastTimer += 5  // 5sec at a pop
        let blastResultsDir = path.join(blastDir,'blast_results')
        const result = getAllDirFiles(blastDir) // will give ALL files in ALL dirs
        
        for(let i=0; i < result.length; i++){
           if(result[i].endsWith('.fa')){
              faFiles.push(result[i])
           } 
           if(result[i].endsWith('.out')){
              blastFiles.push(path.join(blastResultsDir, result[i]))
           } 
        }
        
        if(blastFiles.length === faFiles.length && req.session.blastCounter > 1){
           finished = true;
           
        }
    }else{
        finished = false;
    }
    if(!req.session.blastCounter){
       // need to get off this train
       finished = true;
    }
    console.log('counter:',req.session.blastCounter,'blastFiles',blastFiles.length,'faFiles',faFiles.length)
    console.log('finished:t/f?',finished)
    //console.log('session.error',req.session.pyerror)
    if(finished){
      let data = {}
      async.map(blastFiles, helpers.readAsync, function asyncMapBlast(err, results) {
          
          for(let i=0;i<blastFiles.length;i++){
              jsondata = JSON.parse(results[i])
              console.log(blastFiles[i])
              data['query'+i.toString()] = jsondata.BlastOutput2[0].report.results.search
              if(CFG.ENV === 'development'){
                  console.log('jsondata', jsondata)
              }
              if(jsondata === undefined){
                  console.log('jsondata error for file:',blastFiles[i])
              }
              database = path.basename(jsondata.BlastOutput2[0].report.search_target.db)
              console.log('database', database)
          }

          html = getBlastHtmlTable(data, req.session.blastID)
          //console.log('session.error2',req.session.pyerror)
          // if(blastFiles.length === 0){
//              req.session.pyerror = {code:1, msg:'something bad happened'}
//              
//           }
          if(!req.session.blastID){
             req.flash('fail', 'blastID no longer Valid')
             res.redirect('/refseq/refseq_blastn') // this needs to redirect to either refseq or genome
             return
           }
          console.log('req.session.blastID',req.session.blastID)
          let errorFilePath = path.join(CFG.PATH_TO_BLAST_FILES, req.session.blastID, 'SCRIPTERROR')
          
          fs.readFile(errorFilePath, function tryReadErrorFile(err, content) {
              if(err){
                  // continue on NO ERROR FILE PRESENT
                  if(!database){
                     // throw error
                     //throw new Error('BLAST Database Error - no db found.')
                     pyerror = { code: 1, msg: 'BLAST Database Error - no db found.' }
                  }
                  // no error to report
                  pyerror = { code: 0, msg: ''}
                  
                  
                  
              }else{
                 // file exists throw error
                 //throw new Error('BLAST Script Error: '+content)
                 pyerror = { code: 1, msg:'BLAST Script Error: ' + content }
                 
              }
              
              //////////////
               // don't delete req.session.blast* yet
              res.render('pages/blast/blast_results', {
                title: 'HOMD :: BLAST WAIT', 
                pgname: 'blast_results',
                config: JSON.stringify({ hostname: CFG.HOSTNAME, env: CFG.ENV }),
                hostname: CFG.HOSTNAME,
                ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
                db_choices: JSON.stringify(C.refseq_blastn_db_choices),
                html: html,
                targetdb: database,
                numseqs: blastFiles.length,
                blastId: req.session.blastID,
                blastTimer: req.session.blastTimer,   // rough count
                error: JSON.stringify(pyerror)
              })
              //////////////////////
              
              
          }) 
             
          
          
          
         
      })
      
      
      
    }else{
      console.log('rendering blast_wait')
      res.render('pages/blast/blast_wait', {
        title: 'HOMD :: BLAST WAIT', 
        pgname: 'blast_wait',
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
          console.log('numhits>=4',numhits)
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
          console.log('numhits<4',numhits)
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


router.post('/blast_post', upload.single('blastFile'),  async function blast_post(req, res, next) {
  console.log('MADEIT TO blastPost')
  console.log(req.body)
  console.log('req.file?', req.file)   // may be undefined
  let filename, filepath, data, fasta_as_list, trimlines, twolist,fastaFilePaths;
  const opts = { minLength: 10, patt: /[^ATCGUKSYMWRBDHVN]/i, returnTo: req.body.returnTo }
  let blastOpts = { expect:    req.body.blastExpect, 
              //descriptions: req.body.blastDescriptions,
              //alignments: req.body.blastAlignments,
              maxTargetSeqs: req.body.blastMaxTargetSeqs,
              advanced: req.body.advancedOpts,
              program: req.body.blastProg
              // add dbPath later
  }
  
  if(req.body.blastFxn === 'genome') {
    blastOpts.dbPath = path.join(CFG.BLAST_DB_PATH_GENOME,req.body.blastDb) 
  } else {
    blastOpts.dbPath = path.join(CFG.BLAST_DB_PATH_REFSEQ,req.body.blastDb) 
  }
  if(req.body.blastFilter){
    blastOpts.fitler = '-F F'
  }
  //let blast_session_ts = Date.now().toString();
  const randomnum = Math.floor(Math.random() * 90000) + 10000;
  opts.blastSessionID = req.session.id + '-' + randomnum.toString()
  
  const blastDir = path.join(CFG.PATH_TO_BLAST_FILES, opts.blastSessionID)
  if (!fs.existsSync(blastDir)){
       fs.mkdirSync(blastDir);
  }
  if(req.file){
      opts.type = 'fileInput'
      if (req.file.size > 1500000){   // 1 911 016
       req.flash('fail', 'File too large');
       res.redirect('/refseq/refseq_blastn');
       return;
      }
      var fileContents = ''  // if buffer in req,file not need to move/read file
      
      followFilePath(req, res, opts, blastOpts, blastDir, fileContents, next)
      
      //data = followFilePathPyScript(req, res, opts, blastOpts, blastDir, fileContents)
  }else{
      opts.type = 'textInput'
      //followTextInputPath(req, res, opts, blastOpts, blast_directory)
      data = followTextInputPathPyScript(req, res, opts, blastOpts, blastDir, next)
      runPyScript(req, res, opts, blastOpts, blastDir, data, next)
     
//      dataFromPython = await pythonPromise(req, res, opts, blastOpts, blastDir, data);
      //console.log('XX',dataFromPython)
      
          
      //res.send(dataFromPython);
  }
    
 // (() => {
//   try {
//     runPyScript(req, res, opts, blastOpts, blastDir, data)
//     // process.exit(0)
//   } catch (e) {
//     console.error(e.stack);
//     process.exit(1);
//   }
// })();
    
})
//
//
// const pythonPromise = (req, res, opts, blastOpts, blastDir, dataForPy) => {
//   return new Promise((resolve, reject) => {
//     //https://dev.to/addempsea/snake-in-the-js-shadow-run-your-python-script-in-nodejs-im8
//     let pyscriptOpts = []
//     let pyscript = path.join(CFG.PATH_TO_SCRIPTS, 'run_blast_no_cluster.py') 
//     let config = {}
//     config.site = CFG.SITE  //  local, mbl or homd;; this determines blast db
//     config.blastdbPath = blastOpts.dbPath
//     config.blastDir = blastDir
//     config.dataType = opts.type
//     config.expect = blastOpts.expect
//     config.numResults = blastOpts.descriptions
//     config.advanced = blastOpts.advanced
//     config.program = path.join(CFG.PATH_TO_BLAST_PROG, blastOpts.program)
//     
//     config.filePath = ''
//     config.textInput = ''
//     
//     if(opts.type == 'fileInput'){
//         config.filePath = dataForPy
//     }else{
//         config.textInput = '"'+dataForPy+'"'
//     }
//     
//     const configFile = writeBlastConfig(blastDir, config)
//     
//     pyscriptOpts = ['-c', configFile]
//     const pythonRun = spawn(pyscript, pyscriptOpts, {
//                 env:{'PATH': CFG.PATH},   // CFG.PATH must include python executable path
//                 detached: true, stdio: 'pipe'
//     })
//     //const python = spawn("python", ["./main.py"]);
//     pythonRun.stdout.on("data", (data) => {
//       console.log('stdout')
//       resolve(data.toString(),data.toString());
//     });
// 
//     pythonRun.stderr.on("data", (data) => {
//       console.log('stderr',data.toString())
//       reject(data.toString());
//     });
//     
//         console.log('session BLASTING')
//         //res.cookie('blastDir',blastDir);
//         //req.session.cookie.blastid = blastDir
//         const oneDayToSeconds = 24 * 60 * 60;  // hr/d min/hr sec/min
//         req.session.blastID = opts.blastSessionID
//         req.session.blastTimer = 0
//         req.session.blastCounter = 0
//         console.log(req.session)
//         req.session.pyerror = {code:0, msg:''}
//         res.redirect('blast_wait')   // MUST run at least once
//  });
// };
//
//
function runPyScript(req, res, opts, blastOpts, blastDir, dataForPy, next){
    console.log('In runPyScript')
    
    //const dataFromPython = await pythonPromise(req, res, opts, blastOpts, blastDir, dataForPy);
    // here run pyscript
    // then render and return to restart q 5sec
    // let pyscriptOpts = []
//     
    let pyscript = path.join(CFG.PATH_TO_SCRIPTS, 'run_blast_no_cluster.py') 
    let config = {}
    config.site = CFG.SITE  //  local, mbl or homd;; this determines blast db
    config.blastdbPath = blastOpts.dbPath
    config.blastDir = blastDir
    config.dataType = opts.type
    config.expect = blastOpts.expect
    //config.descriptions = blastOpts.descriptions
    //config.alignments = blastOpts.alignments
    config.advanced = blastOpts.advanced
    config.maxTargetSeqs = blastOpts.maxTargetSeqs
    
    config.program = path.join(CFG.PATH_TO_BLAST_PROG, blastOpts.program)
    
    config.command = pyscript +' -c '+ path.join(blastDir, 'DATA.json')
    config.filePath = ''
    config.textInput = ''
    
    if(opts.type == 'fileInput'){
        config.filePath = dataForPy
    }else{
        config.textInput = '"'+dataForPy+'"'
    }
    
    const configFile = writeBlastConfig(blastDir, config)
    
    const pyscriptOpts = ['-c', configFile]
    
    
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
      //req.session.pyerror = {code:0, msg:''}
    })
    
    pythonRun.stderr.on('data', function pyStdErr(data) {
      let errorData = data.toString()
      
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
        
    })
    let testing = false
    console.log('Testing',testing)
    
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
        req.session.blastID = opts.blastSessionID
        req.session.blastTimer = 0
        req.session.blastCounter = 0
        console.log(req.session)
        //req.session.pyerror = {code:0, msg:''}
        res.redirect('blast_wait')   // MUST run at least once
    }
    
    
     
   
     
     
}

function writeBlastConfig(dir, data) {
    //const configFilePath = path.join(dir,'DATA.config')
    const jsonConfigFilePath = path.join(dir,'DATA.json')
    // let config_string = '[MAIN]\n'
//     for(n in data){
//        config_string += n+" = "+data[n] +'\n'
//     }
    //fs.writeFileSync(configFilePath , config_string)
    fs.writeFileSync(jsonConfigFilePath , JSON.stringify(data, null, 2))
    return jsonConfigFilePath
}
// router.post('/refseq_blastn_takesTooLong', upload.single('blastFile'),  function refseq_blastn_post2(req, res) {
//     console.log('MADEIT TO blastn-post')
//   console.log(req.body)
//   console.log('req.file?', req.file)   // may be undefined
//   let filename, filepath, data, fasta_as_list, trimlines, twolist;
//   const opts = { minLength: 10, patt: /[^ATCGUKSYMWRBDHVN]/i, returnTo: req.body.returnTo }
//   let blastOpts = { expect:    req.body.blastExpect, 
//               descriptions: req.body.blastDescriptions,
//               alignments: req.body.blastAlignments,
//               advanced: req.body.advancedOpts,
//               program: req.body.blastProg
//               // add dbPath later
//   }
//   
//   if(req.body.blastFxn === 'genome') {
//     blastOpts.dbPath = path.join(CFG.BLAST_DB_PATH_GENOME,req.body.blastDb) 
//   } else {
//     blastOpts.dbPath = path.join(CFG.BLAST_DB_PATH_REFSEQ,req.body.blastDb) 
//   }
//   if(req.body.blastFilter){
//     blastOpts.fitler = '-F F'
//   }
//   let blast_session_ts = Date.now().toString();
//   const blast_directory = path.join(CFG.PATH_TO_BLAST_FILES, blast_session_ts)
//   if (!fs.existsSync(blast_directory)){
//        fs.mkdirSync(blast_directory);
//   }
//   let result 
//   if(req.file){
//       if (req.file.size > 1500000){   // 1 911 016
//        req.flash('fail', 'File too large');
//        res.redirect('/refseq/refseq_blastn');
//        return;
//       }
//       var fileContents = ''  // if buffer in req,file not need to move/read file
//       if(req.file.buffer){
//          fileContents = req.file.buffer.toString()
//          opts.move_file = false
//       } else {
//          opts.move_file = true
//       }
//       // move file
//       // read file
//       // write files(s) to dir
//       followFilePath(req, res, opts, blastOpts, blast_directory, fileContents)
//     }else{
//       // differentiate single from multiple
//       // write data into file(s)
//       followTextInputPath(req, res, opts, blastOpts, blast_directory)
//     }
//     
/*  test seqs    

 agtcgtactgggatctgaa
  
  >ds0|imput 1200
  agtcgtactggtaccggatctgaa
  >ds1|kefdgste5%$
  agtcgtactgggatctgaagtagaatccgt
  >ds2| let kefdgste5%$
  agtcgtactgggat
  ctgaagtagaatccatccgt
*/  
//     
//     if(C.use_cluster){
//         console.log('Use Cluster')
//         blast_script_txt = helpers.make_blast1_script_txt(req, blast_directory, [], {})
//         qsub_blastfile = path.join(blast_directory, 'blast.sh')
//         //console.log(qsub_commands_txt)
//         fs.writeFile(qsub_blastfile, blast_script_txt, (err2)=> {
//           if (err2)
//            console.log(err2);
//           else {
//             console.log('success writing blast script - now run it!')
//             fs.chmodSync(qsub_blastfile, 0o775); // make executable
//           }
//         })
//     }else{
//         console.log('NO Cluster; Use shell script')
//         //let pyscript = path.join(CFG.PATH_TO_SCRIPTS,'run_blast_no_cluster.py')
//         //RunAndCheck(pyscript,{},{})
//     }
//     req.flash('success', 'Successful Blast');
//     render_page([req,res])
//  
// 
//   
//   
// 
// /*
//   workflow:
//   save file where?
//   run script python? shell?
//   that validates format,size,...
//   script: split sequences into separate files if appropriate
//   script create sep qsub script for each file
//   
//   vamps blast DOES NOT use cluster  => must look to gast for example
//   see helpers.get_qsub_script_text()
//   
//   Samples:
//   
//   
// */
//   
//     
//     
//      //var blast_directory = path.join(CFG.PATH_TO_BLAST_FILES,blast_session_ts)
// //     if (!fs.existsSync(blast_directory)){
// //          fs.mkdirSync(blast_directory);
// //     }
// //     if (from_file){
// //        fs.rename(req.file.path, path.join(blast_directory,'fasta_from_file.fa'), function (err) {
// //       if (err) {
// //         console.log(err)
// //       } else {
// //         console.log("Successfully moved the file!");
// //         // now open/read, check_size, and split into individual files
// //       }
// //     })
// //     }else {
// //        // from entry
// //     }
//     
//        
//        
//        
//        // may be multiple seqs or single
//        // defline may contain any char?
//   
//     
//   
// 
//     
//   //we'll create one blast.sh script
//   // that will write one blast2.sh script
// //   console.log('rendering page fxn2')
// //   res.render('pages/refseq/blastn_results', {
// //     title: 'HOMD :: BLAST', 
// //     pgname: 'refseq_blast',
// //     config: JSON.stringify({ hostname: CFG.HOSTNAME, env: CFG.ENV }),
// //     hostname: CFG.HOSTNAME,
// //     ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
// //     db_choices: JSON.stringify(C.refseq_blastn_db_choices),
// //     
// //   })
// })
//
// function RunAndCheck(script_path, callback_function, callback_function_options)
// {
//   // http://krasimirtsonev.com/blog/article/Nodejs-managing-child-processes-starting-stopping-exec-spawn
//   console.log("in RunAndCheck");
//   console.log("script_path: " + script_path);
// 
//   const exec = require('child_process').exec;
//   // TODO:  use file_path_obj;
//   //const opts = {env:{'PATH': CFG.PATH,'LD_LIBRARY_PATH': CFG.LD_LIBRARY_PATH} }
//   //const child = exec(script_path, opts);
//   const child = exec(script_path);
//   //var scriptlog1 = path.join(CFG.USER_FILES_BASE, req.user.username,'project-'+project, 'matrix_log1.txt');
//   
//   // var child = spawn(script_path, [], {
// //                             env:{'PATH':CFG.PATH,'LD_LIBRARY_PATH':CFG.LD_LIBRARY_PATH},
// //                             detached: true, stdio: 'pipe'
// //                         });
//   let output = '';
//   
//   child.stdout.on('data', function AddDataToOutput(data) {
//         data = data.toString().trim();
//         output += data;
//         console.log('stdout: ' + data);
//         //CheckIfPID(data);
//   });
//   
//  
//   
//   child.stderr.on('data', data => {
//       console.log('stderr: ' + data);
//   });
//   
//   child.on('close', function checkExitCode(code) {
//      console.log('From RunAndCheck process exited with code ' + code);
//      let ary = output.split("\n");
//      console.log("TTT output.split (ary) ");
//      //console.log(util.inspect(ary, false, null));
//      
//      if (code === 0)
//      {
//        //callback_function(callback_function_options);
//      }
//      else // code != 0
//      {
//        console.log('FAILED',script_path)
//        //failedCode(req, res, path.join(CFG.USER_FILES_BASE, req.user.username, 'project-' + project), project, last_line);
//      }
//   });
// 
//  
// }
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