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
const {exec, spawn} = require('child_process');

// route middleware to make sure a user is logged in
module.exports.timestamp = (dateonly) => {
    //var today = new Date().toUTCString();
    if(dateonly){
      var today = new Date().toISOString().substring(0,10)
    }else{
      var today = new Date().toISOString()
    }
    return today
//     var dd = String(today.getDate()).padStart(2, '0');
//     var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
//     var yyyy = today.getFullYear();
//     var hours = today.getHours()
//     var mins = today.getMinutes()
//     var secs = today.getSeconds()
//     var date_string = yyyy + '-' + mm + '-' + dd;
//     var time_string = '('+String(hours)+'-'+String(mins)+'-'+String(secs)+')'
//     return date_string + ' '+time_string
}
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
module.exports.compareByTwoStrings_alpha = (a, b, colA, colB) => {
  // Assuming you want case-insensitive comparison
  //a = a.toLowerCase();
  //b = b.toLowerCase();
  
  if (a[colA].toLowerCase() === b[colA].toLowerCase()){
    return a[colB] < b[colB] ? -1 : 1
  } else {
    return a[colA] < b[colA] ? -1 : 1
  }
  
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
module.exports.format_MB = (x) =>{ // mega bytes
    // change 456734 => 456,734
    return (parseFloat(x) /1000000).toFixed(3).toString() +' MB'
}
module.exports.get_min = function get_min(ary){
   let ret = ary[0]
   for(let i=0;i<ary.length;i++){
      if(ary[i] < ret){
         ret = ary[i]
      }
   }
   return ret
}
module.exports.get_max = function get_max(ary){
   let ret = 0
   for(let i=0;i<ary.length;i++){
      if(ary[i] > ret){
         ret = ary[i]
      }
   }
   return ret
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
    //console.log('C.taxon_lookup length:',Object.keys(C.taxon_lookup).length,'\t\tsize(KB):',size/1024)
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
           if(i === (Object.keys(lineage_list[1])).length - 1){
               tmp += lineage_list[1][n]
           }else{
               tmp += "<a href='/taxa/"+link+"?rank="+C.ranks[i]+"&name="+lineage_list[1][n]+"'>"+lineage_list[1][n]+'</a>; '
            }
         }
         i += 1
     }
     //console.log(tmp)
     return tmp
}

module.exports.addslashes = function addslashes( str ) {
    return (str + '').replace(/[\]\[\\"']/g, '\\$&')
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
module.exports.getAllDirFiles = function getAllDirFiles(dirPath, arrayOfFiles) {
  arrayOfFiles = {}
  arrayOfFiles.files =[]
  arrayOfFiles.dirs =[]
  let excludeddirs =['users']
  try{
      const files = fs.readdirSync(dirPath)
 
      files.forEach(function getFilesArray(file) {
        let stats = fs.statSync(dirPath + "/" + file)
        var unixFilePermissions = '0' + (stats.mode & parseInt('777', 8)).toString(8);
        //console.log(file,unixFilePermissions,stats)
        if (stats.mode & (fs.constants.S_IRUSR | fs.constants.S_IRGRP | fs.constants.S_IROTH)) {
			
			if (stats.isDirectory()) {
			  if(excludeddirs.indexOf(file) === -1){
			    //arrayOfFiles = getAllDirFiles(dirPath + "/" + file, arrayOfFiles)
			    arrayOfFiles.dirs.push({name:file,src:dirPath + "/" + file,type:'dir'})
			  }
			} else {
			  arrayOfFiles.files.push({name:file,src:dirPath + "/" + file,type:'file'})
			}
        }
      })
      return arrayOfFiles
  }catch(e){
        return 0
  }
  
}
module.exports.readAsync = async function readAsync(file, callback) {
    if(CFG.ENV === 'development'){
        console.log('Reading File:',file)
    }
    module.exports.print(['Reading File:',file])
    try {
      if (fs.existsSync(file)) {
    //file exists
      }
    } catch(err) {
      console.error(err)
    }
    
    //await module.exports.sleep(10000)
    fs.readFile(file, callback);
}

//
module.exports.makeid = function makeid(length) {
    // Used for blast.id and spamguard
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
//

//
module.exports.checkFileSize = function checkFileSize(file_path){
   let statsObj = fs.statSync(file_path);
   //console.log('size',statsObj.size);  // bytes
   return statsObj.size
   // fs.statSync(file_path, (err, stats) => {
//     if (err) {
//         console.log(`File doesn't exist.`);
//     } else {
//         console.log('size',stats.size);  // bytes
//         return stats.size
//     }
//});
}
module.exports.print = function print(thing) {
    // console.log only if development
    // https://stackoverflow.com/questions/9781218/how-to-change-node-jss-console-font-color
    let date = new Date().toISOString()
    if(CFG.ENV != 'production') {
        console.log('\x1b[31m%s\x1b[0m',date, thing)  
    }
    
}
//
module.exports.parse_to_get_blast_query = function parse_to_get_blast_query(file_data, fxn){
    
    let string = file_data.toString()
    let lines = string.split('\n')
    
    let query='',line
    for(let i in lines){
        line = lines[i].trim()
        if(!line) continue;
        if(line.indexOf('Query=') === 0){
          query += line.substring(6).trim()
          if(lines[parseInt(i)+1] != 'Length='){
              query += ' '+lines[parseInt(i)+1]
          }
        }
    }
    if(query){
       return query
    }else{
      return 'NotFound'
    }
}
module.exports.parse_blast_query_xml = function parse_blast_query_xml(jsondata, grab){
    //console.log('file_data',file_data)
    let json = JSON.parse(jsondata)  // xml
    if(grab === 'query'){
		////console.log(json.BlastOutput)
		let query = json['BlastOutput']['BlastOutput_query-def']
		if(query){
		   return query
		}else{
		  return 'NotFound'
		}
	}else if(grab === 'homdhitids'){
	    //for protein:: SEQF3712_01295 hypothetical protein [HMT-096 Lachnospiraceae_G-2 bacterium_HMT_096 F0428]
	    // want SEQF3712_01295
	    let ret = {},hits,homdhitid
	    ret.hitid_ary = []
	    ret.no_hits = false
	    ret.queryid = json['BlastOutput']['BlastOutput_query-ID']
	    let iteration = json['BlastOutput']['BlastOutput_iterations']['Iteration']
	    if(iteration.hasOwnProperty('Iteration_message') && iteration['Iteration_message'] === 'No hits found'){
           ret.no_hits = true
        }else{
			for(let hit in json['BlastOutput']['BlastOutput_iterations']['Iteration']['Iteration_hits']){
				hits = json['BlastOutput']['BlastOutput_iterations']['Iteration']['Iteration_hits'][hit]
				if(hits instanceof Array){
				   //console.log('**hits**arry',hits)
				   // possibly many
				   for(let i in hits){
			          //console.log('**i in hits**',i,hits[i])
			          homdhitid = hits[i].Hit_def.split(' ')[0]
			          
				    }
				   
				}else{
				   //console.log('**hits**obj',hits)
				   // single
				   homdhitid = hits['Hit_def'].split(' ')[0]
				}
				ret.hitid_ary.push(homdhitid)
				
				
			}
        }
        //console.log('ret',ret)
        return ret
	}else if(grab === 'hitids'){
	    let ret = {},hits,hitid
	    ret.hitid_ary = []
	    ret.no_hits = false
	    ret.queryid = json['BlastOutput']['BlastOutput_query-ID']
	    let iteration = json['BlastOutput']['BlastOutput_iterations']['Iteration']
	    if(iteration.hasOwnProperty('Iteration_message') && iteration['Iteration_message'] === 'No hits found'){
           ret.no_hits = true
        }else{
			for(let n in json['BlastOutput']['BlastOutput_iterations']['Iteration']['Iteration_hits']){
				hits = json['BlastOutput']['BlastOutput_iterations']['Iteration']['Iteration_hits'][n]
				for(let i in hits){
			        hitid = hits[i].Hit_id
			        ret.hitid_ary.push(hitid)
				}
			}
        }
        //console.log('ret',ret)
        return ret
	}else{
	   return "ERROR in blast XML parse"
	}
}
module.exports.parse_blast_xml2json = function parse_blast_xml2json(jsondata, fxn){
   //""" for genome blast xml file download"""
    //console.log(jsondata['BlastOutput'])
    let file_collector = {}
    let id_collector = {}
    let otid,clone,split_name,clone_id,hit,hits
    file_collector.query = jsondata['BlastOutput']['BlastOutput_query-def']
    file_collector.query_length = jsondata['BlastOutput']['BlastOutput_query-len']
    file_collector.version = jsondata['BlastOutput']['BlastOutput_version']
    let iteration = jsondata['BlastOutput']['BlastOutput_iterations']['Iteration']
    //['Iteration_message']
    let no_hits = false
    if(iteration.hasOwnProperty('Iteration_message') && iteration['Iteration_message'] === 'No hits found'){
       no_hits = true
    }else{
      for(let n in jsondata['BlastOutput']['BlastOutput_iterations']['Iteration']['Iteration_hits']){
        
        hits = jsondata['BlastOutput']['BlastOutput_iterations']['Iteration']['Iteration_hits'][n]
        for(let i in hits){
            hit = hits[i]
        
            //console.log('hit Hsps',hit['Hit_hsps']['Hsp'])
            clone = hit['Hit_def']
            split_name = clone.split(' ')
            clone_id = split_name[0].trim()
            // SEQF1595_KI535341.1 [HMT-389 Abiotrophia defectiva ATCC 49176]
            
            let regCapture = /HMT-(\d+)\s/   // grab inside parens
            otid = clone.match(regCapture)[1]
            //console.log('otid',otid)
            id_collector[clone_id] = {'clone': clone, 'clone_id': clone_id, otid: otid}
            id_collector[clone_id]['bitscore'] = hit['Hit_hsps']['Hsp']['Hsp_bit-score']
            id_collector[clone_id]['expect'] = hit['Hit_hsps']['Hsp']['Hsp_evalue']
            id_collector[clone_id]['identity'] = hit['Hit_hsps']['Hsp']['Hsp_identity']
            id_collector[clone_id]['gaps'] = hit['Hit_hsps']['Hsp']['Hsp_gaps']
            //id_collector[clone_id]['strand'] = hit['Hit_hsps']['Hsp']['Hsp_bit-score']
            id_collector[clone_id]['length'] = hit['Hit_len']
        }
      }
    }
    if(no_hits){
        file_collector.data = ['no hits']
    }else{
        file_collector.data = Object.values(id_collector)
    }
    //console.log('file_collector',file_collector)
    return file_collector

}
module.exports.parse_blast_tsv = function parse_blast_tsv(file_data, opt, blastID, count){
    //opt = 'full'  // one,two,full
    // https://www.metagenomics.wiki/tools/blast/blastn-output-format-6
    let lines = file_data.toString().split('\n')
    // plan : get the top hits only (by bit_score)
    // split the id line
    // calculate FULL_PCT_ID 
    // qaccver, saccver, pident, length, mismatch, gaps, qstart, qend, sstart, send, evalue, bitscore, qlen, stitle
    let indexes ={query_id:0, hit_id:1,bit_score:11, pct_identity:2, 
                  qstart:6, qend:7, stitle:13, length:3, mismatches:4, 
                  gaps:5, qlen:12,evalue:10,qseq:14,sseq:15}  // qseq;11, sseq:12
    let query =''
    let header = ''
    let max_bitscore = 0
    let line_count = 0
    let row_collector = []
    for(let i in lines){
        if(!lines[i] || lines[i] === ''){
            continue
        }
        
        //console.log('line:',lines[i])
        if(lines[i][0] === '#'){
          header += lines[i]+'<br>'
          if(lines[i].startsWith('# Query:')){
            query = lines[i].split(':')[1]
          }
          
        }else{
            line_count += 1
            
            let line_items = lines[i].split('\t')
            // if(opt === 'one'){
//                 if(line_count === 1){
//                     // collect this line and all with this same max_bitscore 
//                     max_bitscore = line_items[indexes.bit_score]
//                     row_collector.push(line_items)
//                 }else if(max_bitscore === line_items[indexes.bit_score]){
//                     row_collector.push(line_items)
//                 }
//             }else 
            if(opt === 'std'){
              //collect only four
              // http://0.0.0.0:3001/blast/blast_results_refseq?id=ZYF1UUBqLje5JSuO2CfI_refseq
              // http://0.0.0.0:3001/blast/blast_results_refseq?id=Jfcp0GipN5QYxEcrTZKd_refseq
              if(line_count < 5){
                  row_collector.push(line_items)
              }
            }else{
                // full collect all rows
                row_collector.push(line_items)
            }
        }
    }
    //console.log('row_collector',row_collector)
    if(row_collector.length === 0){
        return header+"No Data"
    }
    let html = '<table><tr>'
    if(opt === 'one'){
        html += '<th>query-id</th><th>hit-id</th><th>bitscore</th><th>HMT</th><th>Species</th><th>Strain/Clone</th><th>Genbank</th><th>Status</th>'
        html += '<th>% Ident</th><th>FULL_PCT_ID</th><th>Hit Title</th>'
    }else if(opt === 'two'){
        html += '<th>query-id</th><th>hit-id</th><th>bitscore</th><th>Mis-Matches</th><th>Gaps</th><th>Alignments</th>'
    }else if(opt === 'std'){
        html += '<th>Query</th><th>Q Length</th><th>Q seq</th><th>Alignment</th><th>Hit-id</th><th>HOMD Clone Name</th><th>e-value</th>'
        html += '<th>Bit Score</th><th>% Ident</th>'
    }else{
       //qaccver, saccver, pident, length, mismatch, gaps, qstart, qend, sstart, send, evalue, bitscore, qlen, stitle
        html += '<th>query-id</th><th>hit-id</th><th>% Ident</th><th>Alignment Length</th><th>Mis-matches</th><th>Gaps</th>'
        html += '<th>q-start</th><th>q-end</th><th>s-start</th><th>s-end</th><th>E-value</th><th>Bit Score</th><th>Query Length</th><th>Hit Title</th>'
    }
    html += '</tr>'
    if(opt === 'std'){
        html+='<tr>'
            html+="<td rowspan='4'>"+query.trim()+'</td>' // query
            
            html+="<td rowspan='4'>"+row_collector[count][indexes.qlen]+'</td>'
            html+="<td rowspan='4'><a href='#' onclick=\"getFileContent('seq','"+blastID+"','"+count+"')\">view</a></td>"   // q seq (link)
            //html+="<td rowspan='4'><a href='#' onclick=\"getFileContent('res','"+blastID+"','"+count+"')\">open</a></td>"   // 
            html+="<td rowspan='4'><a href='#' onclick=\"create_alignment('"+row_collector[count][indexes.qseq]+"','"+row_collector[count][indexes.sseq]+"')\">open</a></td>"
    }
    for(let n in row_collector){
        let BEST_PCT_ID = 0.0
        let BEST_FULL_PCT_ID = 0.0
        let row_items = row_collector[n]
        let title_items = row_items[indexes.stitle].split('|')
        let hmt = title_items[2].trim()
        let otid = hmt.split('-')[1]
        if(opt === 'one'){
            //for(let i in row_items){
           //console.log('row_items',row_items)
           let PCT_ID = parseFloat(row_items[indexes.pct_identity])
        
           let ALIGNMENT_FRAC = parseFloat(parseInt(row_items[indexes.qend]) - parseInt(row_items[indexes.qstart]) + 1.0) / parseFloat(row_items[indexes.qlen])
           let FULL_PCT_ID = PCT_ID * ALIGNMENT_FRAC
        // row: qid, bitscore, species, strain, HMT, PCT_ID, FULL_PCT_ID
           
        
           html+='<tr>'
           html+='<td>'+row_items[indexes.query_id]+'</td>'
           html+='<td>'+row_items[indexes.hit_id]+'</td>'
           html+='<td>'+row_items[indexes.bit_score]+'</td>'
           html+="<td nowrap><a href='/taxa/tax_description?otid="+otid+"'>"+hmt+'</a></td>'  // hmt
           html+='<td nowrap><i>'+title_items[1].trim()+'</i></td>'   // genus species
           html+='<td nowrap>'+title_items[3].trim()+'</td>'  // strain
           let gb = title_items[4].trim().split(':')[1].trim()
           html+="<td><a href='https://www.ncbi.nlm.nih.gov/nuccore/"+gb+"' target='_blank'>"+gb+'</a></td>'
           html+='<td>'+title_items[5].trim().split(':')[1]+'</td>'
           html+='<td>'+(PCT_ID).toFixed(2).toString()+'</td>'
           html+='<td>'+(FULL_PCT_ID).toFixed(2).toString()+'</td>'
           html+='<td>'+row_items[indexes.stitle]+'</td>'
        
           html+='</tr>'
        }else if(opt === 'two'){
           html+='<tr>'
           html+='<td>'+row_items[indexes.query_id]+'</td>'
           html+='<td>'+row_items[indexes.hit_id]+'</td>'
           html+='<td>'+row_items[indexes.bit_score]+'</td>'
           html+='<td>'+row_items[indexes.mismatches]+'</td>'
           html+='<td>'+row_items[indexes.gaps]+'</td>'
           html+='<td><pre>'+create_alignment(row_items[14],row_items[15])+'</pre></td>'
        
           html+='</tr>'
        }else if(opt === 'std'){
            
            html+="<td><a href='/taxa/tax_description?otid="+otid+"'>"+title_items[0].trim()+'</a></td>'  // hit id
            html+='<td>'+row_items[indexes.stitle]+'</td>'  // whole title
            html+='<td>'+row_items[indexes.evalue]+'</td>'   // ?
            html+='<td>'+row_items[indexes.bit_score]+'</td>'   // 
            html+='<td>'+row_items[indexes.pct_identity]+'</td>'   // 
            html+='</tr>'
        }else{
            html+='<tr>'
            for(let i=0; i<14; i++){ //let i in row_items){
               
               html+='<td>'+row_items[i]+'</td>'
            }
            html+='</tr>'
        }
    }
    html+='</table>'
    
    return header+'<br><br>'+html
    
}
function create_alignment(qseq,sseq){
    let qseq_letters = qseq.trim().split('')
    let sseq_letters = sseq.trim().split('')
    let acolor = 'blue'
    let gcolor = 'blue'
    let ccolor = 'blue'
    let tcolor = 'blue'
    let qcaps = '',scaps = ''
    let qreturn_value = '',sreturn_value = '',align_value = ''
    let onereturn = ''
    //console.log(qseq_letters.length,sseq_letters.length)
    for(let q in qseq_letters){
       
       let letter = qseq_letters[q].toUpperCase()
       qcaps += letter
       // if(letter === 'A'){
//           onereturn += "<span class='A'>A</span>"
//           //qreturn_value += "<font color='"+acolor+"'>A</font>"
//        }else if(letter === 'G'){
//           onereturn += "<span class='G'>G</span>"
//           //qreturn_value += "<font color='"+gcolor+"'>G</font>"
//        }else if(letter === 'C'){
//           onereturn += "<span class='C'>C</span>"
//           //qreturn_value += "<font color='"+ccolor+"'>C</font>"
//        }else if(letter === 'T'){
//           onereturn += "<span class='T'>T</span>"
//           //qreturn_value += "<font color='"+tcolor+"'>T</font>"
//        }else{
//           onereturn += "<b>-</b>"
//        }
    }
    onereturn += '\n'
    for(let q in qseq_letters){
       let qletter = qseq_letters[q].toUpperCase()
       let sletter = sseq_letters[q].toUpperCase()
        if(qletter == sletter){
             align_value += "|"
        }else{
             align_value += ' '
        }
    }
    
    for(let s in sseq_letters){
       let letter = sseq_letters[s].toUpperCase()
       scaps += letter
       // if(letter === 'A'){
//           onereturn += "<span class='A'>A</span>"
//           //sreturn_value += "<font color='"+acolor+"'>A</font>"
//        }else if(letter === 'G'){
//           onereturn += "<span class='G'>G</span>"
//           //sreturn_value += "<font color='"+gcolor+"'>G</font>"
//        }else if(letter === 'C'){
//           onereturn += "<span class='C'>C</span>"
//           //sreturn_value += "<font color='"+ccolor+"'>C</font>"
//        }else if(letter === 'T'){
//           onereturn += "<span class='T'>T</span>"
//           //sreturn_value += "<font color='"+tcolor+"'>T</font>"
//        }else{
//           onereturn += "<b>-</b>"
//        }
    }
    return qcaps+'<br>'+align_value+'<br>'+scaps
    
    
    //return qreturn_value+'<br>'+align_value+'<br>'+sreturn_value
    //return onereturn
}
module.exports.parse_blast = function parse_blast0(file_data, fxn){
    //console.log('BLAST data',file_data.toString())
    let string = file_data.toString()
    //console.log('string',string)
    let file_collector = {}
    let id_collector = {}
    let tmp =[]
    let no_hits = false, clone='', clone_id, otid, version='unknown'
    //let result = string.match(/Java(Script)/);
    if(string.match(/No hits found/)){
       no_hits = true
    }
    let lines = string.split('\n')
    let line,query_length='0',query='',start_looking_for_gt=false,split_name
    for(let i in lines){
       
       line = lines[i].trim()
       
       if(!line) continue;
       if(line.indexOf('BLAST')===0){
          version = line
       }
       //console.log('line',line)
       if(line.indexOf('Query=') === 0 && !start_looking_for_gt){
          //console.log('Query=',line)
          query += line.substring(6).trim()
          if(lines[parseInt(i)+1] != 'Length='){
              query += ' '+lines[parseInt(i)+1]
          }
       }
       if(line.indexOf('Length=') === 0 && !start_looking_for_gt ){
          query_length = line.split('=')[1]
       }
       if(line.indexOf('Sequences producing significant alignments') === 0){
          start_looking_for_gt = true
       }
       if(line.indexOf('>') === 0 && start_looking_for_gt){
           clone = line.substring(1);  //s1.substring(1);
           if(lines[parseInt(i)+1] != 'Length='){
               //console.log(i,parseInt(i)+1)
               clone += lines[parseInt(i)+1]
           }
           if(lines[parseInt(i)+2] != 'Length='){
               //console.log(i,parseInt(i)+2)
               clone += lines[parseInt(i)+2]
           }
           
           split_name = clone.split('|')
           clone_id = split_name[0].trim()
           otid = 'none'
           if(fxn == 'refseq'){
             otid = split_name[2].trim().split('-')[1]
           }
           id_collector[clone_id] = {'clone': clone, 'clone_id': clone_id, otid: otid}
           // if(lines[parseInt(i)+1] != 'Length='){
//               clone += ' '+lines[parseInt(i)+1]
//            }
       }
       if(line.indexOf('Length=') === 0 && start_looking_for_gt){
             id_collector[clone_id]['length'] = line.split('=')[1]
       }
       if(line.indexOf('Score') === 0 && start_looking_for_gt){  // starts on row 2:score,expect
             let parts = line.split(',')
             id_collector[clone_id]['bitscore'] = parts[0].split('=')[1].trim().split(/\s+/)[0]
             id_collector[clone_id]['expect'] = parts[1].split('=')[1].trim()
       }
       if(line.indexOf('Identities') === 0 && start_looking_for_gt){  // starts on row 2:score,expect
             let parts = line.split(',')
             let regCapture = /\(([^)]+)\)/   // grab inside parens
             id_collector[clone_id]['identity'] = parts[0].split('=')[1].trim().match(regCapture)[1]
             id_collector[clone_id]['gaps'] = parts[1].split('=')[1].trim()
             
       }
       if(line.indexOf('Strand') === 0 && start_looking_for_gt){  // starts on row 2:score,expect
             id_collector[clone_id]['strand'] = line.split('=')[1]
       }
       
       
    }
    //console.log('id_collector',id_collector)
    file_collector.version = version
    file_collector.query = query
    file_collector.query_length = query_length
    if(no_hits){
        file_collector.data = ['no hits']
    }else{
        file_collector.data = Object.values(id_collector)
    }
    //console.log('file_collector',file_collector)
    return file_collector
    /*   For each file
    Want to grab  all this data:
    1) query: >524_3631 | Veillonella atypica | HMT-524 | Clone: MB5_P17 | GB:
DQ003631 | Status: Named | Preferred Habitat: Oral | Genome:
Genome: yes
    2)Length=1368
    3) Score = 115 bits (127),  Expect = 2e-27
 Identities = 71/76 (93%), Gaps = 0/76 (0%)
 Strand=Plus/Minus
    
    */
};

module.exports.execute = function execute(command, callback){
    exec(command, function(error, stdout, stderr){ callback(stdout); });
};

module.exports.getCallerIP = function getCallerIP(request) {
    var ip = request.headers['x-forwarded-for'] ||
        request.connection.remoteAddress ||
        request.socket.remoteAddress ||
        request.connection.socket.remoteAddress;
    ip = ip.split(',')[0];
    ip = ip.split(':').slice(-1); //in case the ip returned in a format: "::ffff:146.xxx.xxx.xxx"
    return ip;
};

module.exports.get_gc_for_gccontent = function get_gc_for_gccontent(gc){
    return (parseFloat(gc)/100).toFixed(2)
};

module.exports.readFromFile = function readFromFile(file, ext) {
    return new Promise((resolve, reject) => {
        fs.readFile(file, (err, data) => {
            if (err) {
                console.log(err);
                reject(err);
            }
            else {
                if(ext == 'json'){
                   resolve(JSON.parse(data));
                }else{
                   resolve(data);
                }
            }
        });
    });
}