'use strict'
const C       = require(app_root + '/public/constants');
//const queries = require(app_root + '/routes/queries');
const CFG  = require(app_root + '/config/config');
const express     = require('express');
const fs          = require('fs-extra');
var accesslog = require('access-log');
const async = require('async')
const util        = require('util');
const path        = require('path');

// route middleware to make sure a user is logged in
module.exports.isLoggedIn = (req, res, next) => {
  // if user is authenticated in the session, carry on

  if (req.isAuthenticated()) {
    console.log(module.exports.log_timestamp());
    console.log("Hurray! isLoggedIn.req.isAuthenticated:", req.user.username);
    return next();
  }
  // if they aren't redirect them to the home page
  console.log("Oops! NOT isLoggedIn.req.isAuthenticated");
  // save the url in the session
  req.session.returnTo = req.originalUrl;
  req.flash('fail', 'Please login or <a href="/admin/register">register</a> before continuing.');
  res.redirect('admin/login');
  // return;
};

// todo: use in file instead of those in the class
module.exports.check_if_rank = (field_name) => {

  let ranks = C.ranks;

  // ranks = ["domain","phylum","klass","order","family","genus","species","strain"]
  return ranks.includes(field_name);
};

module.exports.compareStrings_alpha = (a, b) => {
  // Assuming you want case-insensitive comparison
  a = a.toLowerCase();
  b = b.toLowerCase();
  return (a < b) ? -1 : (a > b) ? 1 : 0;
  
};
// Sort list of json objects numerically
module.exports.compareStrings_int   = (a, b) => {
  // Assuming you want case-insensitive comparison
  a = parseInt(a);
  b = parseInt(b);
  return (a < b) ? -1 : (a > b) ? 1 : 0;
};
module.exports.show_session = (req) =>{
  console.log('(Availible for when sessions are needed) req.session: ')
    //console.log('req.session',req.session)
    //console.log('req.sessionID',req.sessionID)
    console.log('req.session.id',req.session.id)
};
module.exports.accesslog = (req, res) =>{
    accesslog(req, res, C.access_log_format, function(s) {
      //console.log(s);
      //fs.writeFileSync(C.access_logfile, s+'\n', {flag:'a'})
        fs.writeFile(C.access_logfile, s+'\n', err => {
             if (err) {
                 console.error(err)
                 return
             }
             //file written successfully
         })
    });
}

module.exports.chunkSubstr = (str, size) =>{
  //https://stackoverflow.com/questions/7033639/split-large-string-in-n-size-chunks-in-javascript
  const numChunks = Math.ceil(str.length / size)
  const chunks = new Array(numChunks)

  for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
    chunks[i] = str.substr(o, size)
  }

  return chunks
}
//
module.exports.format_long_numbers = (x) =>{
    // change 456734 => 456,734
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
module.exports.format_Mbps = (x) =>{ // mega base pairs
    // change 456734 => 456,734
    return (parseFloat(x) /1000000).toFixed(2).toString() +' Mbps'
}
//
module.exports.onlyUnique = (value, index, self) =>{
  return self.indexOf(value) === index;
}
module.exports.capitalizeFirst = (value, index, self) =>{
  return value.charAt(0).toUpperCase() + value.slice(1)
}
module.exports.print_size = (obj, index, self) =>{
  let size = Buffer.byteLength(JSON.stringify(C.taxon_lookup))
    console.log('C.taxon_lookup length:',Object.keys(C.taxon_lookup).length,'\t\tsize(KB):',size/1024)
}
module.exports.make_otid_display_name = (otid) =>{
    return 'HMT-'+("000" + otid.toString()).slice(-3);
} 
module.exports.clean_rank_name_for_show = (rank) =>{
    // capitalise and fix klass => Class
    if(rank == 'klass' || rank == 'Klass'){
       rank = 'Class'
    }
    return rank.charAt(0).toUpperCase() + rank.slice(1)
}
module.exports.make_lineage_string_with_links = function make_lineage_string_with_links(lineage_list, link) {
     let tmp = ''
     let i = 0 
     for(let n in lineage_list[1]){
         if(link == 'life'){
           tmp += "<a href='/taxa/"+link+"?rank="+C.ranks[i]+"&name=\""+lineage_list[1][n]+"\"'>"+lineage_list[1][n]+'</a>; '
         }else{
           tmp += "<a href='/taxa/"+link+"/"+C.ranks[i]+"/"+lineage_list[1][n]+"'>"+lineage_list[1][n]+'</a>; '
         }
         i += 1
     }
     //console.log(tmp)
     return tmp
}
//
// module.exports.get_qsub_script_text = function get_qsub_script_text(req, scriptlog, dir_path, cmd_name, cmd_list) {
//   /*
//    #!/bin/sh
//    # CODE:
//    # source environment:\n";
//    source /groups/vampsweb/"+site+"/seqinfobin/vamps_environment.sh
//    TSTAMP=`date "+%Y%m%d%H%M%S"`'
//    # . /usr/share/Modules/init/sh
//    # export MODULEPATH=/usr/local/www/vamps/software/modulefiles
//    # module load clusters/vamps
//    cd "+pwd+"
//    function status() {
//    qstat -f
//    }
//    function submit_job() {
//    cat<<END | qsub
//    #!/bin/bash
//    #$ -j y
//    #$ -o "+scriptlog+"
//    #$ -N "+name+"
//    #$ -cwd
//    #$ -V
//    echo -n "Hostname: "
//    hostname
//    echo -n "Current working directory: "
//    pwd
//    source /groups/vampsweb/"+site+"/seqinfobin/vamps_environment.sh
//    for (i in cmd_list) {
//    cmd_list[i]
//    }
//    END
//    }
//    status
//    submit_job
//    */
//   //### Create Cluster Script
//   // TODO: DRY with l 1380
//   script_text = "#!/bin/bash\n\n";
//   script_text += "# CODE:\t" + cmd_name + "\n\n";
//   //script_text += "# source environment:\n";
//   //script_text += "source /groups/vampsweb/" + req.CONFIG.site + "/seqinfobin/vamps_environment.sh\n\n";
//   script_text += 'TSTAMP=`date "+%Y%m%d%H%M%S"`' + "\n\n";
//   //script_text += "# Loading Module didn't work when testing:\n";
//   //$script_text .= "LOGNAME=test-output-$TSTAMP.log\n";
//   script_text += ". /usr/share/Modules/init/sh\n";
//   //script_text += "export MODULEPATH=/usr/local/www/vamps/software/modulefiles\n";
//   //script_text += "module load clusters/vamps\n\n";
//   script_text += "cd /groups/vampsweb/tmp\n\n";
//   //script_text += "cd "+pwd+"\n\n";
//   //script_text += "mkdir "+pwd+"/gast\n\n";
//   //script_text += "mkdir gast\n\n";
//   //    script_text += "function status() {\n";
// //     script_text += "   qstat -f\n";
// //     script_text += "}\n\n";
//   script_text += "function submit_job() {\n";
//   script_text += "cat<<END | qsub\n";
//   script_text += "#!/bin/bash\n";
//   script_text += "#$ -j y\n";
//   script_text += "#$ -o " + scriptlog + "\n";
//   script_text += "#$ -N " + cmd_name + "\n";
//   script_text += "#$ -pe allslots 12\n";
//   //script_text += "#$ -p 100\n";   // priority default is 0
//   script_text += "#$ -cwd\n";
//   script_text += "#$ -V\n";
//   
//   script_text += 'echo -n "Hostname: "' + "\n";
//   script_text += "hostname\n";
//   script_text += 'echo -n "qsub: Current working directory: "' + "\n";
//   script_text += "pwd\n\n";
//   //script_text += "source /groups/vampsweb/" + req.CONFIG.site + "/seqinfobin/vamps_environment.sh;\n\n"
// //     script_text += "source /groups/vampsweb/"+site+"/seqinfobin/vamps_environment.sh\n\n";
// 
//   for (var i in cmd_list) {
//     script_text += cmd_list[i] + "\n";
//     script_text += "echo \"DONE-"+i.toString()+"\" >> " + scriptlog + "\n\n"
//   }
// //
// //     //script_text += "chmod 666 "+log+"\n";
// //     //$script_text .= "sleep 120\n";   # for testing
//   script_text += "\nEND\n";
//   script_text += "}\n";
// //     script_text += "status\n";  //#  status will show up in export.out
//   script_text += "submit_job\n";
//   //##### END  create command
// 
//   return script_text;
// 
// };
//
//

// module.exports.make_blast1_script_txt = function make_blast_script_txt(req, dataDir, cmd_list, opts) {
//   //console.log('OPTS: ')
//   //console.log(opts)
//   make_blast_script_txt = "";
//   
// 
//   make_blast_script_txt += "ls " + dataDir + "/*.fa > " + dataDir + "/filenames.list\n"
//   make_blast_script_txt += "# chmod 666 " + dataDir + "/filenames.list\n"
//   make_blast_script_txt += "cd " + dataDir + "\n";
// 
//   make_blast_script_txt += "\n";
//   make_blast_script_txt += "\n";
//   //make_blast_script_txt += `FILE_NUMBER=\`/usr/bin/wc -l < ${data_dir}/filenames.list\``;
//   make_blast_script_txt += `FILE_NUMBER=\`/usr/bin/sed -n '$=' < ${dataDir}/filenames.list\``;
//   make_blast_script_txt += "\n";
//   //make_blast_script_txt += "FILE_NUMBER=\"$({FILE_NUMBER##*( )}+1-1)\""
//   
//   make_blast_script_txt += "\n";
//   make_blast_script_txt += "echo \"total files = $FILE_NUMBER\" >> " + dataDir + "/clust_blast.log\n"
// 
//   make_blast_script_txt += "cat >" + dataDir + "/clust_blast.sh <<InputComesFromHERE\n"
//   make_blast_script_txt += "#!/bin/bash\n";
// 
//     make_blast_script_txt += "#$ -S /bin/bash\n"
//     make_blast_script_txt += "#$ -N clust_blast.sh\n"
//     make_blast_script_txt += "# Giving the name of the output log file\n"
//     make_blast_script_txt += "#$ -o " + dataDir + "/cluster.log\n"
//     make_blast_script_txt += "#$ -j y\n"
//     make_blast_script_txt += "# Send mail to these users\n"
//     //make_blast_script_txt += "#$ -M " + req.user.email + "\n"
//     //make_blast_script_txt += "# Send mail; -m as sends on abort, suspend.\n"
//     make_blast_script_txt += "#$ -m as\n"
//     make_blast_script_txt += "#$ -t 1-\${FILE_NUMBER##*( )}\n"   // ##*( )supposed to remove white space
//     make_blast_script_txt += "# Now the script will iterate $FILE_NUMBER times.\n"
// 
//     //make_blast_script_txt += "  . /xraid/bioware/Modules/etc/profile.modules\n"
//     //make_blast_script_txt += "  module load bioware\n"
//     //make_blast_script_txt += "  PATH=$PATH:"+app_root+"/public/scripts/gast:"+req.CONFIG.GAST_SCRIPT_PATH+"\n"
//     //make_blast_script_txt += "  source /groups//vampsweb/" + req.CONFIG.site + "/seqinfobin/vamps_environment.sh\n"
//     //make_blast_script_txt += "  echo \"===== $PATH ====\" >> " + data_dir + "/clust_blast.log\n"
// 
//     make_blast_script_txt += "  LISTFILE=" + dataDir + "/filenames.list\n"
//     //make_blast_script_txt += "  echo \"LISTFILE is \\$LISTFILE\" >> " + data_dir + "/clust_blast.log\n";
// 
//     make_blast_script_txt += "\n";
//     make_blast_script_txt += '  INFILE=\\`sed -n "\\${SGE_TASK_ID}p" \\$LISTFILE\\`';
//   
// 
//   make_blast_script_txt += "\n";
//   make_blast_script_txt += "  echo \"=====\" >> " + dataDir + "/clust_blast.log\n"
//   make_blast_script_txt += "  echo \"file name is \\$INFILE\" >> " + dataDir + "/clust_blast.log\n"
//   make_blast_script_txt += "  echo '' >> " + dataDir + "/clust_blast.log\n"
//   make_blast_script_txt += "  echo \"SGE_TASK_ID = \\${SGE_TASK_ID}\" >> " + dataDir + "/clust_blast.log\n"
//   make_blast_script_txt += "  echo '' >> " + dataDir + "/clust_blast.log\n"
// 
// 
// // ORIGINAL::make_blast_script_txt += "  echo \"" + opts.gast_script_path + "/gast/gast_ill -saveuc -nodup " + opts.full_option + " -in \\$INFILE -db " + opts.gast_db_path + "/" + opts.ref_db_name + ".fa -rtax " + opts.gast_db_path + "/" + opts.ref_db_name + ".tax -out \\$INFILE.gast -uc \\$INFILE.uc -threads 0\" >> " + data_dir + "/clust_gast_ill_" + project + ".sh.sge_script.sh.log\n"
// //   make_blast_script_txt += "  echo \"" + "/usr/local/blast/bin/blastall  -p blastn "
// //   make_blast_script_txt += "-d /mnt/LV1/blast_db/oral16S/HOMD_16S_rRNA_RefSeq_V15.22.p9.fasta "
// //   make_blast_script_txt += "-e 0.0001 -F F -v 20 -b 20 -q -3 -r 2 -G 5 -E 2 "
// //   make_blast_script_txt += "-i \\$INFILE " 
// //   make_blast_script_txt += "-o "+data_dir+"/out_file.out "
// //   make_blast_script_txt += "1>/dev/null 2>>"+data_dir+"/error2;\""
//   //make_blast_script_txt += ""
// //  make_blast_script_txt += "   " + opts.gast_script_path + "/gast/gast_ill -saveuc -nodup " + opts.full_option + " -in \\$INFILE -db " + opts.gast_db_path + "/" + opts.ref_db_name + ".fa -rtax " + opts.gast_db_path + "/" + opts.ref_db_name + ".tax -out \\$INFILE.gast -uc \\$INFILE.uc -threads 0\n";
//   make_blast_script_txt += "\n\n";
//   
//   // The qsub blast command
//   //blast_command = "/usr/local/blast/bin/blastall  -p blastn "
//   blast_command = C.PATH_TO_BLAST_PROGS + '/' + blastProg
//   blast_command += " -d /mnt/LV1/blast_db/oral16S/HOMD_16S_rRNA_RefSeq_V15.22.p9.fasta"
//   blast_command += " -e 0.0001 -F F -v 20 -b 20 -q -3 -r 2 -G 5 -E 2"
//   blast_command += " -i \\$INFILE" 
//   blast_command += " -o "+dataDir+"/out_file.out"
//   blast_command += " 1>/dev/null 2>>"+dataDir+"/error2;"
// 
//   //make_blast_script_txt += "  echo \"BLASTn Commamd:\n " + blast_command + "\n<--END Command\"\n\n"
//   make_blast_script_txt += "  echo \"" + blast_command + "\" >> " + dataDir + "/clust_blast.log\n"
//   
//   make_blast_script_txt += "\n\n";
//   
//   //make_blast_script_txt += blast_command;
// 
// /////////////////////////////////////////////////////////////////
// // testing:: must port >> to log
// make_blast_script_txt += "  echo \"# print date and time \" >> " + dataDir + "/clust_blast.log\n"
// make_blast_script_txt += "date >>" + dataDir + "/clust_blast.log\n\n"
// make_blast_script_txt += "  echo \"File to run:\" >> " + dataDir + "/clust_blast.log\n"
// make_blast_script_txt += "  echo \"\\$INFILE\" >> " + dataDir + "/clust_blast.log\n"
// 
// 
// 
// // make_blast_script_txt += "  echo \"# Sleep for 20 seconds \" >> " + data_dir + "/clust_blast.log\n"
// // make_blast_script_txt += "sleep 20 >>" + data_dir + "/clust_blast.log\n"
// // make_blast_script_txt += "  echo \"# print date and time again \" >> " + data_dir + "/clust_blast.log\n"
// // make_blast_script_txt += "date >> " + data_dir + "/clust_blast.log\n"
// //////////////////////////////////////////
// 
//   // https://stackoverflow.com/questions/16483977/sge-task-id-not-getting-set-with-qsub-array-grid-job
//   make_blast_script_txt += "\n\n";
//   make_blast_script_txt += "  chmod 666 " + dataDir + "/clust_blast.log\n"
//   make_blast_script_txt += "\n";
//   make_blast_script_txt += "InputComesFromHERE\n\n"
// 
//   //make_blast_script_txt += "echo \"Running clust_blast.sh >> " + data_dir + "/clust_blast.log\n"
// 
//   make_blast_script_txt += "chmod 775 "+dataDir+"/clust_blast.sh\n";
// 
//   //make_blast_script_txt += "\n";
//   //make_blast_script_txt += "\n";
//   //make_blast_script_txt += "export SGE_ROOT=/opt/sge\n";
//   //make_blast_script_txt += "source /groups/vampsweb/" + req.CONFIG.site + "/seqinfobin/vamps_environment.sh\n\n"
//   
//     // the -sync y tag means that the following install scripts will run AFTER the cluster gast scripts finish
//     // this is important to have -sync y
//     //var sync_tag = '-sync y' // forces qsub to wait until all jobs finish before exiting and then running install
//     //var parallel_env_tag = '-pe smp 8'  // req to work on vamps cluster 2019-01
//     //var parallel_env_tag = '-pe allslots 12'
//     //make_blast_script_txt += "qsub "+parallel_env_tag+" "+sync_tag+" " + data_dir + "/clust_blast.sh\n";
//   
//   
//   //make_blast_script_txt += "qsub " + data_dir + "/clust_blast.sh\n";
// 
// /////////////////////////////////////////////////////////////////
// // testing:: run the script locally
// make_blast_script_txt += "bash "+dataDir + "/clust_blast.sh\n";
// ///////////////////////////////////////////////////////////////////
//   
//   //make_blast_script_txt += "echo \"Done with cluster_blast\" >> " + data_dir + "/cluster.log\n"
//   //make_blast_script_txt += "echo \"Running install scripts (see log)\" >> " + data_dir + "/cluster.log\n"
//   
// 
//   make_blast_script_txt += "\n";
//   // make_blast_script_txt += "touch " + path.join(data_dir, "TEMP.tmp");
//   // make_blast_script_txt += "\n";
//   return make_blast_script_txt
// }
//

module.exports.sleep = function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}
// module.exports.createBlastCommandFile = function createBlastCommandFile(fastaFilePaths, opts, dataDir) {
//     console.log('in createBlastCommandFile')
//     //console.log(fastaFilePaths)
//     let make_blast_script_txt = ''
//     make_blast_script_txt += "#!/bin/bash\n\n"
//     
// //     /usr/local/blast/bin/blastall -p blastn \
// // -d /mnt/LV1/blast_db/oral16S/HOMD_16S_rRNA_RefSeq_V15.22.p9.fasta \
// // -e 0.0001 -F F -v 20 -b 20 -q -3 -r 2 -G 5 -E 2 \
// // -i /mnt/LV1/oral16S6_tmp/feu9hoakrcsg3r9cukjp5r36k7/389_0541_Abiotrophia_defectiva_HMT \
// // -o /mnt/LV1/oral16S6_tmp/feu9hoakrcsg3r9cukjp5r36k7/blast_results/tmp/389_0541_Abiotrophia_defectiva_HMT \
// // 1>/dev/null 2>>/mnt/LV1/oral16S6_tmp/feu9hoakrcsg3r9cukjp5r36k7/error2; \
// // mv /mnt/LV1/oral16S6_tmp/feu9hoakrcsg3r9cukjp5r36k7/blast_results/tmp/389_0541_Abiotrophia_defectiva_HMT \
// // /mnt/LV1/oral16S6_tmp/feu9hoakrcsg3r9cukjp5r36k7/blast_results/389_0541_Abiotrophia_defectiva_HMT;\
// // /mnt/myBROP/var/www/html/homd_modules/RNAblast/parse_blast_single.pl \
// // feu9hoakrcsg3r9cukjp5r36k7 389_0541_Abiotrophia_defectiva_HMT S ;\
// // #rm /mnt/LV1/oral16S6_tmp/feu9hoakrcsg3r9cukjp5r36k7/submit_command0
//     //console.log(opts)
//     console.log('XXXXXXXXHostname: ',CFG.HOSTNAME)
//     console.log('XXXXXXXXSITE: ',CFG.SITE)
//     for (let i = 0; i < fastaFilePaths.length; i++) {
//        make_blast_script_txt += path.join(CFG.PATH_TO_BLAST_PROG, opts.program)
//        if(CFG.SITE === 'localhome'){
//           make_blast_script_txt += ' -db /Users/avoorhis/programming/blast_db/HOMD_16S_rRNA_RefSeq_V15.22.fasta'
//        }else if(CFG.SITE === 'localmbl'){
//           make_blast_script_txt += ' -db /Users/avoorhis/programming/blast/Bv6/Bv6'
//        }else{   // HOMD
//           make_blast_script_txt += ' -db ' + opts.dbPath
//        }
//        
//        make_blast_script_txt += ' -evalue ' + opts.expect
//        make_blast_script_txt += ' -max_target_seqs ' + opts.descriptions
//        //make_blast_script_txt += ' -num_alignments ' + opts.alignments
//        // Error: Argument "num_alignments".num_descriptions Incompatible with argument:  `max_target_seqs'
//        // 
//        make_blast_script_txt += ' -query ' + fastaFilePaths[i]
//        make_blast_script_txt += ' -outfmt 15'   // single file: JSON
//        //make_blast_script_txt += ' -outfmt 16'   //single file:XML
//       // make_blast_script_txt += ' -html'   //JSON
//        make_blast_script_txt += ' -out ' + dataDir + '/result' + i.toString() + '.blast' 
//        make_blast_script_txt += " 1>/dev/null 2>>" + dataDir + "/error.log;"
//        
//        make_blast_script_txt += '\n\n'
//        
//     }
//     //console.log('batch blast content:')
//     //console.log(make_blast_script_txt)
//     return make_blast_script_txt
// }
module.exports.readFilesInDirectory = function readFilesInDirectory(directory, destination) {

  return new Promise((resolve, reject) => {

    fs.readdir(directory, (err, files) => {
        if (err)
            return reject(err);

        files = files.map(file => path.join(directory,file));

        //Read all files in parallel
        async.map(files, fs.readFile, (err, results) => {
            if (err)
                return reject(err);

           //results[0] contents of file #1
           //results[1] contents of file #2
           //results[n] ...

            //Write the joined results to destination
            // fs.writeFile(destination, results.join("\n"), (err) => {
//                 if (err)
//                     return reject(err);
// 
//                 resolve();
//             });
        });

    });
  });
}
//
module.exports.readAsync = function readAsync(file, callback) {
    if(CFG.ENV === 'development'){
        console.log('Reading File:',file)
    }
    try {
      if (fs.existsSync(file)) {
    //file exists
      }
    } catch(err) {
      console.error(err)
    }
    
    fs.readFile(file, callback);
}

