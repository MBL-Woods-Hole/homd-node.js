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
function followFilePath(req, res, opts, blastDir) {
  console.log('File Path')
  source = req.file.path;
  dest = path.join(blastDir,'fastaFromFile.fna');  // MUST BE *.fna NOT *.fa so that it wont be read by script
  // for fileinput
  (async function (req) {
    if (req.file){
      await moveFile(source, dest);
      await readFile(blastDir, dest);
    }
    // splint into separate files
    // write individulal blast file
    // write single qsubcommands file??
    
  })(req)
}
//  TEXT Input
function followTextInputPath(req, res, opts, blastDir) {
  console.log('TextEntry Path')
  let inputSeqInput = req.body.inputSeq.trim();
  
    
  let fileList = []
  if (inputSeqInput[0] === '>'){
     console.log('got fasta format')
     var xtrim = inputSeqInput.split('>')  // split on > first then \r
     // what if other > in defline? fail
     console.log('xtrim')
     console.log(xtrim)
     if (xtrim.length >5000){
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
              twoList = [trimLines[0],trimLines.slice(1,trimLines.length).join('')]
              // validate newlist[1]
              if(twoList[1].length <= opts.minLength){  
                 // what to do here? delete?
                 console.log('found short sequence: #',i.toString(),' length: ', twoList[1].length)
              }
              twoList[1] = twoList[1].toUpperCase()
              if ( opts.patt.test(twoList[1]) ){
                 req.flash('fail', 'Wrong character(s) detected: only letters represented by the standard IUB/IUPAC codes are allowed.');
                 res.redirect('/refseq/refseq_blastn');
                 return;
              }
              console.log(twoList)
              data = twoList.join('\n')+'\n'
              fileName = 'blast'+i.toString()+'.fa'
              filePath = path.join(blastDir, fileName)
              //fileList.push(filePath)
              
              
             fs.writeFile(filePath, data, (err)=> {
                if (err)
                   console.log(err);
                else {
                   console.log("File written successfully2\n");
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
      fileList = [filePath]
      data = '>1\n'+inputSeqInput + '\n'
      
      
      fs.writeFile(filePath, data, (err)=> {
      if (err)
      console.log(err);
      else {
      console.log("File written successfully2\n");
      }
      })
  }
}
// https://www.digitalocean.com/community/tutorials/how-to-work-with-files-using-the-fs-module-in-node-js
async function readFile(dir, bigFilePath) {
  
  console.log('read')
  try {
    const data = await fsp.readFile(bigFilePath);
    //console.log(data.toString())
    const lines = (data.toString().trim()).split('\n')
    let count = 0
    let lastLine = false
    for(n = 0; n <= lines.length; n++){
       if( lines[parseInt(n)+1] === undefined ){
          lastLine = true
       }
       
       //console.log('')
       //console.log(lines[n])
       write_file=false
       if(lines[n][0] === '>'){
          // here write the file from previous
          
          newFile = true
          fileName = 'blast'+ count.toString()+'.fa'
          fastaFilePath = path.join(dir, fileName)
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
             else console.log('wrote file')
          })
       }
    }
  } catch (error) {
    console.error(`Got an error trying to read the file: ${error.message}`);
  }
}
async function writeFile(filePath, data) {
  try {
    const data = await fsp.writeFile(filePath, data);
    console.log('data written to '+filePath);
  } catch (error) {
    console.error(`Got an error trying to write the file: ${error.message}`);
  }
}
async function moveFile(source, destination) {
  console.log('move')
  try {
    await fsp.rename(source, destination);
    console.log(`Moved file from ${source} to ${destination}`);
  } catch (error) {
    console.error(`Got an error trying to move the file: ${error.message}`);
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
  console.log('file', req.file)   // may be undefined
  let filename, filepath, data, fasta_as_list, trimlines, twolist;
  const opts = { minLength: 10, patt: /[^ATCGUKSYMWRBDHVN]/i, returnTo: req.body.returnTo }
    let blast_session_ts = Date.now().toString();
    const blast_directory = path.join(CFG.PATH_TO_BLAST_FILES, blast_session_ts)
    if (!fs.existsSync(blast_directory)){
         fs.mkdirSync(blast_directory);
    }
    if(req.file){
      // move file
      // read file
      // write files(s) to dir
      followFilePath(req, res, opts, blast_directory)
    }else{
      // differentiate single from multiple
      // write data into file(s)
      followTextInputPath(req, res, opts, blast_directory)
    }
    
    
  
  
        // fieldname: 'blastn_file',
//      originalname: 'fasta.fa',
//      encoding: '7bit',
//      mimetype: 'application/octet-stream',
//      destination: '/Users/avoorhis/programming/homd-uploads',
//      filename: '1ad2c7d1141c1b6763a084f55d0716dd',
//      path: '/Users/avoorhis/programming/homd-uploads/1ad2c7d1141c1b6763a084f55d0716dd',
//      size: 616

  
  

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
  agtcgtactgggatctgaa
  
  >ds1|imput 1200
  agtcgtactggtaccggatctgaa
  >ds1|kefdgste5%$
  agtcgtactgggatctgaagtagaatccgt
  >ds2| let kefdgste5%$
  agtcgtactgggat
  ctgaagtagaatccatccgt
  
*/
//  let input_seq_input = `  >ds1|imput 1200 
//  agtcgtactggtaccggatctgaa
//  >ds1|kefdgste5%$
//  agtcgtactgggatctgaagtagaatccgt
//  >ds2| let kefdgste5%$
//  agtcgtactgggat
//  ctgaagtagaatccatccgt`;
  
  
    
    
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
  
    
  blast_script_txt = helpers.make_blast1_script_txt(req, blast_directory, [], {})
  qsub_blastfile = path.join(blast_directory, 'blast.sh')
  
  // I'm working here: need to write one fasta file per sequence
  // also need one command file per sequence (will reference fasta)
  // Then one qsubcommands file that lists the files: qsub fileN
  // to be run by torque
  // ?? Question how best to write many files in node -- Consider python
  //qsub_commands_txt = helpers.make_qsub_commands_txt(req, blast_directory, filelist)
  
  //console.log(qsub_commands_txt)
  fs.writeFile(qsub_blastfile, blast_script_txt, (err2)=> {
    if (err2)
     console.log(err2);
    else {
      console.log('success writing blast script - now run it!')
      fs.chmodSync(qsub_blastfile, 0o775); // make executable
      
    }
  })

    
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

module.exports = router