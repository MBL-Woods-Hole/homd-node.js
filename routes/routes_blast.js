const express   = require('express');
var router    = express.Router()
const CFG     = require(app_root + '/config/config')
const fs        = require('fs-extra')
const fsp = require('fs').promises
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
function followFilePath(req, res, opts, blastOpts, blastDir) {
  console.log('in File Path')
  source = req.file.path;
  dest = path.join(blastDir,'fastaFromFile.fna');  // MUST BE *.fna NOT *.fa so that it wont be read by script
  // for fileinput
  //fs.renameSync(source, dest)
  //let fastaFilePaths = readFileWriteFiles(blastDir, dest)
  
  return (async function (req) {
    if (req.file){
      await moveFile(source, dest);
      readFileWriteFilesPromise(dest, blastOpts, blastDir);
    }
  })(req)
  
  
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
       req.flash('fail', 'Too many sequences entered. 5000 max');
       res.redirect('/refseq/refseq_blastn');
       return;
     }
     for (i = 0; i <= xtrim.length; i++) {
         if(xtrim[i]){
              fastaAsList =xtrim[i].split(/\r?\n/)
              fastaAsList[0] = '>' + fastaAsList[0]
              //console.log('\nsingle_as_list')
              //console.log(single_as_list)
              trimLines = fastaAsList.map(el => el.trim()) 
              //console.log(cleanlines2)
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
              console.log('Cleaned:',twoList)
              data = twoList.join('\n') + '\n'
              fileName = 'blast' + i.toString() + '.fa'
              filePath = path.join(blastDir, fileName)
              fastaFilePaths.push(filePath)
              
             fs.writeFile(filePath, data, (err) => {
                if (err){
                   console.log(err)
                } else {
                   console.log("File written successfully", filePath);
                }
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
          console.log("File written successfully -single\n", filePath);
        }
      })
  }
  
  
  
  
  
  helpers.createBlastCommandFile(fastaFilePaths, blastOpts , blastDir )
}
// https://www.digitalocean.com/community/tutorials/how-to-work-with-files-using-the-fs-module-in-node-js
function readFileWriteFiles(dir, bigFilePath) {
    console.log('in readFileWriteFiles')
    readFileContent(bigFilePath, function (err, content) {
        console.log('content')
        console.log(content.toString())
        
        return 'myreturn'
    })
    
}
function readFileContent(file, callback) {
    fs.readFile(file, function (err, content) {
        if (err) return callback(err)
        callback(null, content)
    })
}
async function readFileWriteFilesPromise(bigFilePath, blastOpts, blastDir ) {
  
  console.log('in readFileWriteFilesPromise')
  try {
    const data = await fsp.readFile(bigFilePath);
    //console.log(data.toString())
    const lines = (data.toString().trim()).split('\n')
    let count = 0
    let lastLine = false
    let fastaFilePaths = []
    for(n = 0; n <= lines.length; n++){
       if( lines[parseInt(n)+1] === undefined ){
          lastLine = true
       }
       
       //console.log('')
       //console.log(lines[n])
       write_file=false
       if(!lines[n]){
          continue
       }
       if(lines[n][0] === '>'){
          // here write the file from previous
          
          newFile = true
          fileName = 'blast'+ count.toString()+'.fa'
          fastaFilePath = path.join(blastDir, fileName)
          fastaFilePaths.push(fastaFilePath)
          fileText = lines[n].trim() + '\n'
          count += 1
       }else{
          fileText += lines[n].trim() + '\n'
          write_file=true
          
       }
       //console.log('lines[n+1]')
       //console.log(lines[parseInt(n)+1])
       if( lastLine || (n > 0  && lines[parseInt(n)+1][0] === '>')){
         fs.writeFile(fastaFilePath, fileText, function(err) {
             if(err) console.log(err)
             else console.log('wrote file',fastaFilePath)
          })
       }
    }
    helpers.createBlastCommandFile(fastaFilePaths, blastOpts , blastDir)
  } catch (error) {
    console.error('Got an error trying to read the file: ',error);
  }
}
async function writeFile(filePath, data) {
  try {
    const data = await fsp.writeFile(filePath, data);
    console.log('data written to '+filePath);
  } catch (error) {
    console.error('Got an error trying to write the file: ',error);
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

let render_page = (res) => {
   res.render('pages/refseq/blastn_results', {
    title: 'HOMD :: BLAST', 
    pgname: 'refseq_blast',
    config: JSON.stringify({ hostname: CFG.HOSTNAME, env: CFG.ENV }),
    hostname: CFG.HOSTNAME,
    ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
    db_choices: JSON.stringify(C.refseq_blastn_db_choices),
    
   })
}
router.post('/refseq_blastn2', upload.single('blastFile'),  function refseq_blastn_post2(req, res) {
    console.log('MADEIT TO blastn-post')
  console.log(req.body)
  console.log('req.file?', req.file)   // may be undefined
  let filename, filepath, data, fasta_as_list, trimlines, twolist;
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
  const blast_directory = path.join(CFG.PATH_TO_BLAST_FILES, blast_session_ts)
  if (!fs.existsSync(blast_directory)){
       fs.mkdirSync(blast_directory);
  }
  let result 
  if(req.file){
      // move file
      // read file
      // write files(s) to dir
      followFilePath(req, res, opts, blastOpts, blast_directory)
    }else{
      // differentiate single from multiple
      // write data into file(s)
      followTextInputPath(req, res, opts, blastOpts, blast_directory)
    }
    
    return
// agtcgtactgggatctgaa
/*   
  >ds1|imput 1200
  agtcgtactggtaccggatctgaa
  >ds1|kefdgste5%$
  agtcgtactgggatctgaagtagaatccgt
  >ds2| let kefdgste5%$
  agtcgtactgggat
  ctgaagtagaatccatccgt
*/  
    
    if(C.use_cluster){
        console.log('Use Cluster')
        blast_script_txt = helpers.make_blast1_script_txt(req, blast_directory, [], {})
        qsub_blastfile = path.join(blast_directory, 'blast.sh')
        //console.log(qsub_commands_txt)
        fs.writeFile(qsub_blastfile, blast_script_txt, (err2)=> {
          if (err2)
           console.log(err2);
          else {
            console.log('success writing blast script - now run it!')
            fs.chmodSync(qsub_blastfile, 0o775); // make executable
          }
        })
    }else{
        console.log('NO Cluster; Use Python script')
        //let pyscript = path.join(CFG.PATH_TO_SCRIPTS,'run_blast_no_cluster.py')
        //RunAndCheck(pyscript,req,res,{},{})
        
    }
  
  
 

  
  

/*
  workflow:
  save file where?
  run script python? shell?
  that validates format,size,...
  script: split sequences into separate files if appropriate
  script create sep qsub script for each file
  
  vamps blast DOES NOT use cluster  => must look to gast for example
  see helpers.get_qsub_script_text()
  
  Samples:
  
  
*/
  
    
    
     //var blast_directory = path.join(CFG.PATH_TO_BLAST_FILES,blast_session_ts)
//     if (!fs.existsSync(blast_directory)){
//          fs.mkdirSync(blast_directory);
//     }
//     if (from_file){
//        fs.rename(req.file.path, path.join(blast_directory,'fasta_from_file.fa'), function (err) {
//       if (err) {
//         console.log(err)
//       } else {
//         console.log("Successfully moved the file!");
//         // now open/read, check_size, and split into individual files
//       }
//     })
//     }else {
//        // from entry
//     }
    
       
       
       
       // may be multiple seqs or single
       // defline may contain any char?
  
    
  

    
  //we'll create one blast.sh script
  // that will write one blast2.sh script
  
  res.render('pages/refseq/blastn_results', {
    title: 'HOMD :: BLAST', 
    pgname: 'refseq_blast',
    config: JSON.stringify({ hostname: CFG.HOSTNAME, env: CFG.ENV }),
    hostname: CFG.HOSTNAME,
    ver_info: JSON.stringify({ rna_ver: C.rRNA_refseq_version, gen_ver: C.genomic_refseq_version }),
    db_choices: JSON.stringify(C.refseq_blastn_db_choices),
    
  })
})
//
function RunAndCheck(script_path, req, res, callback_function, callback_function_options)
{
  // http://krasimirtsonev.com/blog/article/Nodejs-managing-child-processes-starting-stopping-exec-spawn
  console.log("in RunAndCheck");
  console.log("script_path: " + script_path);

  const exec = require('child_process').exec;
  // TODO:  use file_path_obj;
  const opts = {env:{'PATH': CFG.PATH,'LD_LIBRARY_PATH': CFG.LD_LIBRARY_PATH} }
  const child = exec(script_path, opts);
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
        CheckIfPID(data);
  });
  
 
  
  child.stderr.on('data', data => {
      console.log('stderr: ' + data);
  });
  
  child.on('close', function checkExitCode(code) {
     console.log('From RunAndCheck process exited with code ' + code);
     let ary = output.split("\n");
     console.log("TTT output.split (ary) ");
     //console.log(util.inspect(ary, false, null));
     let last_line = ary[ary.length - 1];
     console.log('last_line:', last_line);
     if (code === 0)
     {
       callback_function(callback_function_options, last_line);
     }
     else // code != 0
     {
       console.log('FAILED',script_path)
       //failedCode(req, res, path.join(CFG.USER_FILES_BASE, req.user.username, 'project-' + project), project, last_line);
     }
  });

 
}


module.exports = router