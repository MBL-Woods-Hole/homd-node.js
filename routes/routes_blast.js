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

router.post('/refseq_blastn_1', upload.single('blastFile'),  function refseq_blastn_post1(req, res) {
    console.log('MADEIT TO blastn-postTESTING')
    console.log(req.body)
    console.log(req.file)
    // const patt = /[^ATCGUKSYMWRBDHVN]/i   // These are the IUPAC letters
    
    const opts = { minLength: 10, patt: /[^ATCGUKSYMWRBDHVN]/i }
    let blast_session_ts = Date.now().toString();
    const blast_directory = path.join(CFG.PATH_TO_BLAST_FILES, blast_session_ts)
    if (!fs.existsSync(blast_directory)){
         fs.mkdirSync(blast_directory);
    }
    if(req.file){
       followFilePath(req, res, opts, blast_directory)
    }else{
       followTextInputPath(req, res, opts,blast_directory)
    }
    
    
    // steps
    // move file
    // read file
    // console.log results
      
  // for text input
  //(async function () {
    // write single file
    
    // splint into separate files
    // write individulal blast file
    // write single qsubcommands file
  //await addGroceryItem('nutella', 1, 4);
  //})();
   render_page(res)
})
function checkSeqLength(seq, minLength) {
  if(inputSeqInput === ''){
        req.flash('fail', 'No Query Sequence(s) were Entered');  // implement flash?
        res.redirect('/refseq/refseq_blastn');  // this may be refseq or genome
        return false;
  }
  if(inputSeqInput.length <= opts.minLength){  
        req.flash('fail', 'Query length needs to be greater than 10bp');
        res.redirect('/refseq/refseq_blastn');
        return false
  }
  return true
  
}
function followFilePath(req, res, opts, blastOpts, blastDir, fileContents) {
  console.log('in File Path')
  
  // need 5000 seq limit in place
  
    source = req.file.path;
    dest = path.join(blastDir,'fastaFromFile.fna');  // MUST BE *.fna NOT *.fa so that it wont be read by script
    // for fileinput
    //fs.renameSync(source, dest)
    //let fastaFilePaths = readFileWriteFiles(blastDir, dest)
    
    return (async function () {
      if (req.file){
        
        await moveFile(source, dest)
        let data = await readFile(dest)
        console.log('dataxx')
        console.log(data)
        
        runPyScript(req, res, opts, blastOpts, blastDir, dest)
        //return data
          //readFileWriteFilesPromise(dest, req, res, blastOpts, blastDir);
          //readFileContent(dest, {})
      }else{
         console.log('File Promise broken')
      }
    })()
  
  
  
}
function followTextInputPathPyScript(req, res, opts, blastOpts, blastDir) {
  console.log('in TextEntry Path')
  let inputSeqInput = req.body.inputSeq.trim();
  // let python doo the work of splitting and file writing
  return inputSeqInput
  
}
//  TEXT Input
function followTextInputPath(req, res, opts, blastOpts, blastDir) {
  console.log('in TextEntry Path')
  let inputSeqInput = req.body.inputSeq.trim();
  let filePath,fileName,data,fastaAsList,trimLines,twoList
  
  let fileList = []
  let fastaFilePaths = []
  if (inputSeqInput[0] === '>'){
     console.log('got fasta format')
     var xtrim = inputSeqInput.split('>')  // split on > first then \r
     // what if other > in defline? fail
     console.log('xtrim')
     console.log(xtrim)
     if (xtrim.length > 5000){
       req.flash('fail', 'Too many sequences entered: 5000 max');
       res.redirect('/refseq/refseq_blastn');
       return;
     }
     for (i = 0; i <= xtrim.length; i++) {
         if(xtrim[i]){
              fastaAsList =xtrim[i].split(/\r?\n/)
              fastaAsList[0] = '>' + fastaAsList[0]
              trimLines = fastaAsList.map(el => el.trim()) 
              twoList = [trimLines[0],trimLines.slice(1, trimLines.length).join('')]
              // validate newlist[1]
              if(twoList[1].length <= opts.minLength){  
                 // what to do here? delete?
                 console.log('found short sequence: #', i.toString(), ' length: ', twoList[1].length)
              }
              twoList[1] = twoList[1].toUpperCase()
              if ( opts.patt.test(twoList[1]) ){
                 req.flash('fail', 'Wrong character(s) detected: only letters represented by the standard IUB/IUPAC codes are allowed.');
                 res.redirect('/refseq/refseq_blastn');
                 return;
              }
              //console.log('Cleaned:',twoList)
              data = twoList.join('\n') + '\n'
              fileName = 'blast' + i.toString() + '.fa'
              filePath = path.join(blastDir, fileName)
              fastaFilePaths.push(filePath)
              
             fs.writeFile(filePath, data, (err) => {
                if (err) console.log(err)
              })

         }
       }  // end for i in xtrim
       
  } else {
      // not fasta format -- MUST be single sequence
      // single sequence
      // validate
     
      inputSeqInput = inputSeqInput.toUpperCase()
      if( opts.patt.test(inputSeqInput) ){
        req.flash('fail', 'Wrong character(s) detected: only letters represented by the standard IUB/IUPAC codes are allowed.');
        res.redirect('/refseq/refseq_blastn');
        return;
      }
      console.log('got valid single sequence')
      fileName = 'blast1.fa'
      filePath = path.join(blastDir, fileName)
      fastaFilePaths = [filePath]
      data = '>1\n'+inputSeqInput + '\n'
      
      
      fs.writeFile(filePath, data, (err)=> {
        if(err){
          console.log(err)
        } else {
          //console.log("File written successfully -single\n", filePath);
        }
      })
  }
  
  let command = helpers.createBlastCommandFile(fastaFilePaths, blastOpts , blastDir )
  let batchFile = path.join(blastDir,'batch.sh')
  fs.writeFile(batchFile, command, { mode: 0o755 }, function(err) {
      if(err){
          console.log(err)
      }else{
          //console.log('wrote batch blast file')
          RunAndCheck(batchFile, render_page, [req, res])
          //RunAndCheck(batchFile, callback_function, callback_function_options)
      }
    })
}
// // https://www.digitalocean.com/community/tutorials/how-to-work-with-files-using-the-fs-module-in-node-js
// function writeFilesFromContents(fileContents, req, res, blastOpts , blastDir) {
//     console.log('In writeFilesFromContents - no promises')
//     const lines = (fileContents.trim()).split('\n')
//     let count = 0
//     let lastLine = false
//     let fastaFilePaths = []
//     for(let n = 0; n < lines.length; n++){
//        if(!lines[n]){
//           continue
//        }
//        if( lines[parseInt(n)+1] === undefined ){
//           lastLine = true
//        }
//        
//        //console.log('')
//        //console.log(lines[n])
//        write_file=false
//        
//        if(lines[n][0] === '>'){
//           // here write the file from previous
//           
//           newFile = true
//           fileName = 'blast'+ count.toString()+'.fa'
//           fastaFilePath = path.join(blastDir, fileName)
//           fastaFilePaths.push(fastaFilePath)
//           fileText = lines[n].trim() + '\n'
//           count += 1
//        }else{
//           fileText += lines[n].trim() + '\n'
//           write_file=true
//           
//        }
//        //console.log('lines[n+1]')
//        //console.log(lines[parseInt(n)+1])
//        if( lastLine || (n > 0  && lines[parseInt(n)+1][0] === '>')){
//          fs.writeFile(fastaFilePath, fileText, function(err) {
//              if(err) console.log(err)
//              //else console.log('wrote file',fastaFilePath)
//           })
//        }
//     }
//     let command = helpers.createBlastCommandFile(fastaFilePaths, blastOpts , blastDir)
//     let batchFile = path.join(blastDir,'batch.sh')
//     fs.writeFile(batchFile, command, { mode: 0o755 }, function(err) {
//       if(err){
//           console.log(err)
//       }else{
//           //console.log('wrote batch blast file')
//           RunAndCheck(batchFile, render_page, [req, res])
//           //RunAndCheck(batchFile, callback_function, callback_function_options)
//       }
//     })
// }


async function readFileWriteFilesPromise(bigFilePath, req, res, blastOpts, blastDir ) {
  
  console.log('in readFileWriteFilesPromise')
  try {
    const data = await fsp.readFile(bigFilePath);
    //console.log(data.toString())
    const lines = (data.toString().trim()).split('\n')
    let count = 0
    let lastLine = false
    let fastaFilePaths = []
    for(let n = 0; n < lines.length; n++){
       console.log('line::',lines[n])
       if(!lines[n]){
          continue
       }
       if( lines[parseInt(n)+1] === undefined ){
          lastLine = true
       }
       
       //console.log('')
       //console.log(lines[n])
       //write_file=false
       
       if(lines[n][0] === '>'){
          // here write the file from previous
          
          //newFile = true
          fileName = 'blast'+ count.toString()+'.fa'
          fastaFilePath = path.join(blastDir, fileName)
          fastaFilePaths.push(fastaFilePath)
          fileText = lines[n].trim() + '\n'
          count += 1
       }else{
          fileText += lines[n].trim() + '\n'
          //write_file=true
          
       }
       //console.log('lines[n+1]')
       //console.log(lines[parseInt(n)+1])
       if( lastLine || (n > 0  && lines[parseInt(n)+1][0] === '>')){
         fs.writeFile(fastaFilePath, fileText, function(err) {
             if(err) console.log(err)
             //else console.log('wrote file',fastaFilePath)
          })
       }
    }
    
    let command = helpers.createBlastCommandFile(fastaFilePaths, blastOpts , blastDir)
    let batchFile = path.join(blastDir, 'batch.sh')
    fs.writeFile(batchFile, command, { mode: 0o755 }, function(err) {  // executable
      if(err){
          console.log(err)
      }else{
          //console.log('wrote batch blast file')
          RunAndCheck(batchFile, render_page, [req, res])
          //RunAndCheck(batchFile, callback_function, callback_function_options)
          
      }
    })
    
    
  } catch (error) {
    console.error('Got an error trying to read the file: ',error);
    
  }
  
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

let render_page = function render_page(opts) {
   console.log('in render page fxn')
   
   opts[1].render('pages/refseq/blastn_results', {
    title: 'HOMD :: BLAST', 
    pgname: 'refseq_blast',
    config: JSON.stringify({ hostname: CFG.HOSTNAME, env: CFG.ENV }),
    hostname: CFG.HOSTNAME,
    ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
    db_choices: JSON.stringify(C.refseq_blastn_db_choices),
    
   })
}
let render_wait_page = function render_wait_page(opts) {
   console.log('in render wait blast page fxn')
   
   opts[1].render('pages/blast/blast_wait', {
    title: 'HOMD :: BLAST', 
    pgname: 'blast_wait',
    config: JSON.stringify({ hostname: CFG.HOSTNAME, env: CFG.ENV }),
    hostname: CFG.HOSTNAME,
    ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
    db_choices: JSON.stringify(C.refseq_blastn_db_choices),
    
   })
}
router.post('/blast_post', upload.single('blastFile'),  function blast_post(req, res) {
    console.log('MADEIT TO blastPost')
  console.log(req.body)
  console.log('req.file?', req.file)   // may be undefined
  let filename, filepath, data, fasta_as_list, trimlines, twolist,fastaFilePaths;
  const opts = { minLength: 10, patt: /[^ATCGUKSYMWRBDHVN]/i, returnTo: req.body.returnTo }
  let blastOpts = { expect:    req.body.blastExpect, 
              descriptions: req.body.blastDescriptions,
              alignments: req.body.blastAlignments,
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
  let blast_session_ts = Date.now().toString();
  const blastDir = path.join(CFG.PATH_TO_BLAST_FILES, blast_session_ts)
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
      
      followFilePath(req, res, opts, blastOpts, blastDir, fileContents)
      
      //data = followFilePathPyScript(req, res, opts, blastOpts, blastDir, fileContents)
  }else{
      opts.type = 'textInput'
      //followTextInputPath(req, res, opts, blastOpts, blast_directory)
      data = followTextInputPathPyScript(req, res, opts, blastOpts, blastDir)
      runPyScript(req, res, opts, blastOpts, blastDir, data)
  }
    
    // pyScript takes data as string/buffer does all the rest
    // node just watches for files and ....
    
    
    // let command = helpers.createBlastCommandFile(fastaFilePaths, blastOpts, blastDir )
//     let batchFile = path.join(blastDir,'batch.sh')
//     fs.writeFile(batchFile, command, { mode: 0o755 }, function writeBatchBlastFile(err) {
//       if(err){
//           console.log(err)
//       }else{
//           //console.log('wrote batch blast file')
//           //RunAndCheck(batchFile, render_page, [req, res])
//           //RunAndCheck(batchFile, callback_function, callback_function_options)
//           
//       }
//     })
    
})
//
//
function runPyScript(req, res, opts, blastOpts, blastDir, dataForPy){
    // here run pyscript
    // then render and return to restart q 5sec
    let pyscriptOpts 
    let pyscript = path.join(CFG.PATH_TO_SCRIPTS, 'run_blast_no_cluster.py') 
    let config = {}
    config.blastdbPath = blastOpts.dbPath
    config.blastDir = blastDir
    config.datatype = opts.type
    config.expect = blastOpts.expect
    config.numresults = blastOpts.descriptions
    config.advanced = blastOpts.advanced
    config.program = path.join(CFG.PATH_TO_BLAST_PROG, blastOpts.program)
    config.site = CFG.SITE
    config.filepath = ''
    config.textInput = ''
    
    if(opts.type == 'fileInput'){
        config.filepath = dataForPy
    }else{
        config.textInput = '"'+dataForPy+'"'
    }
    
    const configFile = writeBlastConfig(blastDir, config)
    
    pyscriptOpts = ['-c', configFile]
    
    
    //let pyscriptOpts =  ['-t',opts.type]
    console.log('running py script ')
    
    const pythonRun = spawn(pyscript, pyscriptOpts, {
                    env:{'PATH':CFG.PATH},
                    detached: true, stdio: 'pipe'
            });
    
    pythonRun.stdout.on('data', function (data) {
      console.log('Pipe data from python script ...');
      dataToSend = data.toString();
    });
    // pythonRun.on('close', (code) => {
//       console.log(`child process close all stdio with code ${code}`);
//       // send data to browser for testing
//       res.send(dataToSend)
//     });
   
   //render_wait_page([req,res])
   res.render('pages/blast/blast_wait', {
    title: 'HOMD :: BLAST', 
    pgname: 'blast_wait',
    config: JSON.stringify({ hostname: CFG.HOSTNAME, env: CFG.ENV }),
    hostname: CFG.HOSTNAME,
    ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
    db_choices: JSON.stringify(C.refseq_blastn_db_choices),
    
   })
     
}

function writeBlastConfig(dir, data) {
    const configFilePath = path.join(dir,'DATA.config')
    let config_string = '[MAIN]\n'
    for(n in data){
       config_string += n+" = "+data[n] +'\n'
    }
    fs.writeFileSync(configFilePath , config_string)
    return configFilePath
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
function RunAndCheck(script_path, callback_function, callback_function_options)
{
  // http://krasimirtsonev.com/blog/article/Nodejs-managing-child-processes-starting-stopping-exec-spawn
  console.log("in RunAndCheck");
  console.log("script_path: " + script_path);

  const exec = require('child_process').exec;
  // TODO:  use file_path_obj;
  //const opts = {env:{'PATH': CFG.PATH,'LD_LIBRARY_PATH': CFG.LD_LIBRARY_PATH} }
  //const child = exec(script_path, opts);
  const child = exec(script_path);
  //var scriptlog1 = path.join(CFG.USER_FILES_BASE, req.user.username,'project-'+project, 'matrix_log1.txt');
  
  // var child = spawn(script_path, [], {
//                             env:{'PATH':CFG.PATH,'LD_LIBRARY_PATH':CFG.LD_LIBRARY_PATH},
//                             detached: true, stdio: 'pipe'
//                         });
  let output = '';
  
  child.stdout.on('data', function AddDataToOutput(data) {
        data = data.toString().trim();
        output += data;
        console.log('stdout: ' + data);
        //CheckIfPID(data);
  });
  
 
  
  child.stderr.on('data', data => {
      console.log('stderr: ' + data);
  });
  
  child.on('close', function checkExitCode(code) {
     console.log('From RunAndCheck process exited with code ' + code);
     let ary = output.split("\n");
     console.log("TTT output.split (ary) ");
     //console.log(util.inspect(ary, false, null));
     
     if (code === 0)
     {
       //callback_function(callback_function_options);
     }
     else // code != 0
     {
       console.log('FAILED',script_path)
       //failedCode(req, res, path.join(CFG.USER_FILES_BASE, req.user.username, 'project-' + project), project, last_line);
     }
  });

 
}
function readFileWriteFiles(dir, bigFilePath) {
    console.log('in readFileWriteFiles - no Promises')
    readFileContent(bigFilePath, function (err, content) {
        console.log('content')
        console.log(content.toString())
        
        return 'myreturn'
    })
    
}
function readFileContent(file, callback) {
    fs.readFile(file, function (err, content) {
        if (err) return callback(err)
        console.log(content.toString())
        callback(null, content)
    })
}

module.exports = router