const express  	= require('express');
var router   	= express.Router();
const CFG   	= require(app_root + '/config/config');
const fs       	= require('fs-extra');
const url 		= require('url');
const path     	= require('path');
const C		  	= require(app_root + '/public/constants');
const helpers 	= require(app_root + '/routes/helpers/helpers');
const open = require('open');


router.get('/refseq_blastn', function refseq_blastn_get(req, res) {
    console.log('MADEIT TO blastn-get')
    helpers.accesslog(req, res)
	res.render('pages/refseq/blastn', {
		title: 'HOMD :: BLAST', 
		pgname: 'refseq_blast',
		config : JSON.stringify({hostname:CFG.HOSTNAME,env:CFG.ENV}),
		hostname: CFG.hostname,
		ver_info: JSON.stringify({rna_ver:C.rRNA_refseq_version, gen_ver:C.genomic_refseq_version}),
		db_choices: JSON.stringify(C.refseq_blastn_db_choices),
	});
});

router.post('/refseq_blastn', function refseq_blastn_post(req, res) {
    console.log('MADEIT TO blastn-post')
	console.log(req.body.input_seq)
	console.log(req.body.input_seq.length)
	console.log(req.session.id)  // create filename?
	let input_seq_input = req.body.input_seq
	let patt = /[^ATCGUKSYMWRBDHVN]/i   //contains anything other than 'A','T','C' or 'G'
	// current timestamp in milliseconds
	let blast_session_ts = Date.now().toString();
	console.log(blast_session_ts)
	
	// is input_seq in proper format 
	// if '>' as first char okay MAY be multiple seqs
	// if '>' not first char ONLY one sequence
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
// 	let input_seq_input = `	 >ds1|imput 1200 
// 	agtcgtactggtaccggatctgaa
// 	>ds1|kefdgste5%$
// 	agtcgtactgggatctgaagtagaatccgt
// 	>ds2| let kefdgste5%$
// 	agtcgtactgggat
// 	ctgaagtagaatccatccgt`;
	var min_length = 10;
	input_seq_input = input_seq_input.trim();
	if(input_seq_input === ''){
        req.flash('fail', 'No Query Sequence(s) were Entered');  // implement flash?
        res.redirect('/refseq/refseq_blastn');
        return;
    }
    if(input_seq_input.length <= min_length){  
        req.flash('fail', 'Query length needs to be greater than 10bp');
        res.redirect('/refseq/refseq_blastn');
        return;
    }
    let filename,filepath,data,fasta_as_list,trimlines,twolist;
    
    var blast_directory = path.join(CFG.PATH_TO_BLAST_FILES,blast_session_ts)
    if (!fs.existsSync(blast_directory)){
         fs.mkdirSync(blast_directory);
    }
    let filelist = []
    if(input_seq_input[0] === '>'){
       console.log('got fasta format')
       var xtrim = input_seq_input.split('>')  // split on > first then \r
       // what if other > in defline? fail
       console.log('xtrim')
       console.log(xtrim)
       if(xtrim.length >5000){
		 req.flash('fail', 'Too many sequences entered. 5000 max');
		 res.redirect('/refseq/refseq_blastn');
         return;
       }
       
       for (i = 0; i <= xtrim.length; i++) {
         if(xtrim[i]){
              fasta_as_list =xtrim[i].split(/\r?\n/)
              fasta_as_list[0] = '>' + fasta_as_list[0]
              //console.log('\nsingle_as_list')
              //console.log(single_as_list)
              trimlines = fasta_as_list.map(el => el.trim()) 
              //console.log(cleanlines2)
              twolist = [trimlines[0],trimlines.slice(1,trimlines.length).join('')]
              // validate newlist[1]
              if(twolist[1].length <= min_length){  
                 // what to do here? delete?
                 console.log('found short sequence: #',i.toString(),' length: ', twolist[1].length)
              }
              twolist[1] = twolist[1].toUpperCase()
              if( patt.test(twolist[1]) ){
                 req.flash('fail', 'Wrong character(s) detected: only letters represented by the standard IUB/IUPAC codes are allowed.');
                 res.redirect('/refseq/refseq_blastn');
                 return;
              }
              console.log(twolist)
              data = twolist.join('\n')+'\n'
              filename = 'blast'+i.toString()+'.fa'
              filepath = path.join(blast_directory, filename)
              filelist.push(filepath)
              fs.writeFile(filepath, data, (err)=> {
			    if (err)
					console.log(err);
				else {
					console.log("File written successfully: "+filepath);
				}
			  });
              
         }
       }
       
       
 
       // may be multiple seqs or single
       // defline may contain any char?
    }else{
      // single sequence
      // validate
      
      input_seq_input = input_seq_input.toUpperCase()
      if( patt.test(input_seq_input) ){
        req.flash('fail', 'Wrong character(s) detected: only letters represented by the standard IUB/IUPAC codes are allowed.');
        res.redirect('/refseq/refseq_blastn');
        return;
      }
      console.log('got valid single sequence')
      filename = 'blast1.fa'
      filepath = path.join(blast_directory, filename)
      filelist = [filepath]
      data = '>1\n'+input_seq_input+'\n'
      fs.writeFile(filepath, data, (err)=> {
		  if (err)
			console.log(err);
		  else {
			console.log("File written successfully\n");
		  }
	  });
    }
    
	blast_script_txt = helpers.make_blast1_script_txt(req, blast_directory, [], {})
	qsub_blastfile = path.join(blast_directory, 'blast.sh')
	
	// I'm working here: need to write one fasta file per sequence
	// also need one command file per sequence (will reference fasta)
	// Then one qsubcommands file that lists the files: qsub fileN
	// to be run by torque
	// ?? Question how best to write many files in node -- Consider python
	qsub_commands_txt = helpers.make_qsub_commands_txt(req, blast_directory, filelist)
	
	console.log(qsub_commands_txt)
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
		config : JSON.stringify({hostname:CFG.HOSTNAME,env:CFG.ENV}),
		hostname: CFG.HOSTNAME,
		ver_info: JSON.stringify({rna_ver:C.rRNA_refseq_version, gen_ver:C.genomic_refseq_version}),
		db_choices: JSON.stringify(C.refseq_blastn_db_choices),
		
	});
});
//
// router.get('/refseq_tree', function refseq_tree(req, res) {
//     console.log('phylo_tree')
// 	helpers.accesslog(req, res)
// 	let myurl = url.parse(req.url, true);
// 	let otid = myurl.query.otid
// 	console.log('otid',otid)
// 	
// });
router.get('/refseq_tree', function refseq_tree(req, res) {
    console.log('in refseq_tree')
	helpers.accesslog(req, res)
	let myurl = url.parse(req.url, true);
	let otid = myurl.query.otid
	console.log('otid',otid)
	let fullname = helpers.make_otid_display_name(otid)
	console.log(fullname)
	fs.readFile('public/trees/refseq_tree.svg','utf8', (err, data) => {
      if(err){
         console.log(err)
      }
      res.render('pages/refseq/refseq_tree', {
        title: 'HOMD :: Conserved Protein Tree',
        pgname: 'tree',  //for AbountThisPage , 
		config : JSON.stringify({hostname:CFG.HOSTNAME,env:CFG.ENV}),
		ver_info: JSON.stringify({rna_ver:C.rRNA_refseq_version, gen_ver:C.genomic_refseq_version}),
		svg_data: JSON.stringify(data),
		otid: fullname,
      })
    
    })
	
	// res.render('pages/refseq/refseq_tree', {
// 		title: 'HOMD :: Phylo Tree', 
// 		config : JSON.stringify({hostname:CFG.HOSTNAME,env:CFG.ENV}),
// 		hostname: CFG.HOSTNAME,
// 		ver_info: JSON.stringify({rna_ver:C.rRNA_refseq_version, gen_ver:C.genomic_refseq_version}),
// 		otid:otid
// 	});
});
router.get('/download', function download(req, res) {
    console.log('download')
	console.log(req.body)
	helpers.accesslog(req, res)
	res.render('pages/refseq/download', {
		title: 'HOMD :: Phylo Tree', 
		pgname: 'refseq_download',  //for AbountThisPage 
		config : JSON.stringify({hostname:CFG.HOSTNAME,env:CFG.ENV}),
		hostname: CFG.HOSTNAME,
		ver_info: JSON.stringify({rna_ver:C.rRNA_refseq_version, gen_ver:C.genomic_refseq_version}),
		
	});
});

module.exports = router;