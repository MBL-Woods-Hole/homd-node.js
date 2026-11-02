"use strict";
import express from "express";
const router = express.Router();
import fs from "fs-extra";

// const fs   = require('fs-extra')
import path from "path";
import * as helpers from "./helpers/helpers.js";

import C from "../public/constants.js";
import { exec, spawn } from "child_process";
import * as queries from "./queries.js";
//import pino from 'pino';
import { promisePool } from "../config/database.js";
import logger from "../config/app_config.js";
//import { search, searchAsync, searchOptionsSchema } from 'grepts';

////
router.get("/full_site_search", function full_site_search_GET(req, res) {
    //logger.info('full_site_searchGET')
    res.render("pages/search/full_site_search", {
        title: "HOMD :: Human Oral Microbiome Database",
        pgname: "", // for AbountThisPage
        config: JSON.stringify(ENV),
        ver_info: JSON.stringify(C.version_information),
    });
});

function execPromise(cmd, args, max) {
    return new Promise(function (resolve, reject) {
        // spawn(cmd, function(err, stdout) {
        //             if (err) return reject(err);
        //             resolve(stdout);
        //         });
        let chunk_rows = [],
            line_count = 0;
        let bufferArray = [];
        //logger.info('ARGS',cmd+' '+args.join(' '))
        let full_cmd_str = cmd + " " + args.join(" ");
        //const process = spawn(cmd, args, { shell: true });
        logger.info("Promise CMD: " + full_cmd_str);
        // shell:true need expand wildcard '*'
        // shell:true need glob so pass pass cmd in full NOT args
        const process = spawn(full_cmd_str, { shell: true }); // shell:true need expand wildcard '*'
        process.stdout.on("data", (data) => {
            // Process the data received from stdout
            //logger.info(`stdout: ${data}`);
            // STRATEGY:: protein_id is unique
            // grab accessions
            //logger.info(`stdout: ${data}`);

            //if(data){
            chunk_rows = data.toString().split("\n");
            //logger.info(`chunk_rows[0]: ${chunk_rows[0]}`);
            line_count += chunk_rows.length;
            //data_array.push(data.toString())
            if (line_count > max) {
                bufferArray = [];
                resolve(["too_long"]);
            }
            //data_array.push(...chunk_rows)
            bufferArray.push(data);
            //}
        });
        process.stderr.on("data", (data) => {
            logger.error(`stderr1: ${data}`);
            reject(data);
        });
        process.on("close", function (code) {
            // *** Process completed
            logger.info(`code: ${code}`);
            let dataBuffer = Buffer.concat(bufferArray);
            let dataBufferArray = dataBuffer.toString().split("\n");
            //logger.info('resolving okay',dataBufferArray[0])

            resolve(dataBufferArray);
        });
        process.on("error", function (err) {
            // *** Process creation failed
            logger.error(`stderr2: ${err}`);
            reject(err);
        });
    });
}

router.post(
    "/deep_anno_sql_search",
    async function deep_anno_sql_searchPOST(req, res) {
        console.log("IN=> deep_anno_sql_searchPOST");
        console.log("body", req.body);
        //logger.info('pidlist',req.body.pid_list)

        let annoUpper = req.body.anno.toUpperCase();

        let partial = false;
        if (req.body.whole_or_partial === "partial") {
            partial = true;
        }
        let q = queries.deep_anno_search(
            annoUpper,
            req.body.gid,
            req.body.search_text,
            partial,
        );
        console.log(q);
        let data = {};
        data.species = C.genome_lookup[req.body.gid].organism;
        data.strain = C.genome_lookup[req.body.gid].strain;
        data.gid = req.body.gid;
        const rows = await queries.run_query(q, req, res);
        data.rows = rows;
        res.send(JSON.stringify(data));
    },
);
//
//
//

router.post(
    "/advanced_site_search_anno_mysql",
    async function advanced_site_search_anno_mysql(req, res) {
        console.log("advanced_site_search_anno_mysql");
        console.log(req.body);
        let whole_or_partial = req.body.whole_or_partial; // whole or partial
        let anno = req.body.anno;
        let annoUpper = anno.toUpperCase();
        let search_string = req.body.search_text;
        let tmp_obj = {},
            gid_count = {},
            obj2 = {},
            sort_lst = [],
            total_length = 0,
            otid,
            hmt,
            strain,
            species;
        let gid;
        let allowed_max = C.grep_search_max_rows; // died at 73,000
        //prokka\tGCA_030450175.1\tCDS\tCP073095.1\tGCA_030450175.1_00089\tresA_1\tThiol-disulfide oxidoreductase ResA\t80060\t80623
        let partial = false;
        if (whole_or_partial === "partial") {
            partial = true;
        }

        let q = queries.search_sql_stream(
            annoUpper,
            search_string,
            partial,
            C.sql_search_max_rows,
        );

        //try{
        console.log("IN=> advanced_site_search_anno_mysql", q);
        let cnt = 0;
        let conn;
        //const rows = await queries.run_query(q, req,res)

        //try {
        //conn = await pool.getConnection();
        //const stream = conn.connection.query(q).stream();
        const stream = queries.run_query_stream(q, res);
        //console.log('st',stream)
        //const queryStream = connection.query(query, [searchTerm]).stream({ highWaterMark: 16 });
        //const conn = await pool.getConnection();
        //const stream = conn.connection.query(q).stream();//queries.run_query_stream(q, res)
        //stream.on('data', (row) => writable.write(JSON.stringify(row) + '\n'));
        stream.on("data", (row) => {
            // Process each row one by one without loading all into memory
            //console.log('Processed row:', row);
            gid = row.gid;
            cnt += 1;
            //logger.info('count '+cnt.toString())
            if (cnt >= allowed_max) {
                stream.destroy();
            }
            gid_count[gid] = 1;
            total_length += 1;
            tmp_obj = {
                gid: gid,
                otid: "",
                hmt: "",
                species: "=>Genome Not Found in db<=",
                strain: "",
                acc: "",
                gene: row.gene,
                pid: row.pid,

                prod: row.product,
                id: row.id,
            };
            if (gid && Object.hasOwn(C.genome_lookup, gid)) {
                //if(gid){
                otid = C.genome_lookup[gid]["otid"];
                ((hmt = helpers.make_otid_display_name(otid)),
                    (strain = C.genome_lookup[gid]["strain"]));
                species =
                    C.taxon_lookup[otid]["genus"] +
                    " " +
                    C.taxon_lookup[otid]["species"];
                tmp_obj.species = species;
                tmp_obj.strain = strain;
                tmp_obj.otid = otid;
                tmp_obj.hmt = hmt;
            }
            //logger.info('tmp_obj',tmp_obj)
            if (Object.hasOwn(obj2, gid)) {
                obj2[gid].push(tmp_obj);
            } else {
                sort_lst.push({ gid: gid, species: species, strain: strain });
                obj2[gid] = [tmp_obj];
            }
        });

        stream.on("error", (err) => {
            console.log("Stream error:", err);
        });

        stream.on("end", () => {
            console.log("Streaming finished.");
            //console.log('obj2',obj2)
            logger.info("Row Count " + cnt.toString());
            sort_lst.sort(function (a, b) {
                return helpers.compareStrings_alpha(
                    a.species + a.strain,
                    b.species + b.strain,
                );
            });
            res.render("pages/search/full_site_search_results", {
                title: "HOMD :: Search Results",
                pgname: "", // for AboutThisPage
                config: JSON.stringify(ENV),
                ver_info: JSON.stringify(C.version_information),

                anno: anno,
                search_text: search_string,
                otid_list: JSON.stringify([]),
                gid_list: JSON.stringify([]),
                taxon_otid_obj: JSON.stringify({}),
                //annotationList: JSON.stringify(obj_array),

                annotationList2: JSON.stringify(obj2),
                anno_sort_list: JSON.stringify(sort_lst),

                phageList: JSON.stringify({}),
                phage_sort_list: JSON.stringify([]),
                phage_lookup: JSON.stringify({}),
                phage_id_list: JSON.stringify([]),
                search_params:
                    "(Searches only whole words in `Gene` and `Gene Product`):",
                gid_count: Object.keys(gid_count).length,
                //hit_source: "mysql",
                whole_or_partial: whole_or_partial,
                total_hits: total_length,
                max: helpers.format_long_numbers(allowed_max),
                form_type: JSON.stringify(["annotations"]),
                no_ncbi_annot: JSON.stringify(C.no_ncbi_genomes),
            });
        });
        //} catch (e) {
        //  logger.error(e);
        //}
    },
);

router.get("/stream_results_sql", function stream_results_sql(req, res) {
    console.log("IN stream_results_sql");
    console.log(req.query);
    const annoLower = req.query.anno;
    //const annoUpper = annoLower.toUpperCase()
    const search_text = req.query.search_text.toLowerCase();
    const whole_or_partial = req.query.whole_or_partial; // whole or partial
    res.render("pages/search/search_stream_results_sql", {
        title: "HOMD :: Search Results",
        pgname: "", // for AboutThisPage
        config: JSON.stringify(ENV),
        ver_info: JSON.stringify(C.version_information),
        anno: annoLower,
        search_text: search_text,
        whole_or_partial: whole_or_partial,
    });
});
//
//
//
//
router.get("/get_sql_stream", async function get_sql_stream(req, res) {
    console.log("IN get_sql_stream line:860");
    console.log(req.query);
    //const annoLower = req.query.anno
    const annoUpper = req.query.anno.toUpperCase();
    const annoLower = req.query.anno.toLowerCase();
    const search_text = req.query.search_text
        .toLowerCase()
        .replace(/\|/g, "\\|");
    const whole_or_partial = req.query.whole_or_partial;
    let partial = false;
    if (whole_or_partial == "partial") {
        partial = true;
    }
    console.log("partial", partial);
    const download = req.query.download;
    let dt = helpers.get_today_obj();
    let allowed_max = C.grep_search_max_rows;
    let gid, payload, start, end, region, url, hmt;
    let gid_count = {},
        tmp_obj = {},
        otid,
        species,
        strain;
    // set no limit here

    let q = queries.search_sql_stream(annoUpper, search_text, partial);
    console.log(q);

    if (download === "1") {
        console.log("DOWNLOAD");
        let fname =
            "HOMD_" +
            annoLower +
            "_search" +
            dt.today +
            "_" +
            dt.seconds +
            ".csv";
        res.setHeader("Content-Disposition", "attachment; filename=" + fname);
        res.setHeader("Content-Type", "text/plain");
        res.setHeader("Transfer-Encoding", "chunked");
        res.write(
            "HOMD Annotation Search\t" +
                annoUpper +
                "\tSearchText:" +
                search_text +
                "\n",
        );
        res.write("Genome-ID\tHMT-ID\tOrganism\tProtein-ID\tGene\tProduct\n");
    } else {
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
    }
    res.flushHeaders();
    //try{
    const conn = await promisePool.getConnection();
    const stream = conn.connection.query(q).stream();
    let cnt = 0;

    stream.on("data", (row) => {
        // Process each row one by one without loading all into memory
        //console.log('1-Processed row:', row);
        gid = row.gid;
        cnt += 1;
        //logger.info('count '+cnt.toString())
        if (cnt >= allowed_max) {
            console.log("XXX");
            stream.destroy();
        }
        gid_count[gid] = 1;

        //logger.info('2count '+cnt.toString())
        tmp_obj = {
            gid: gid,
            otid: "",
            hmt: "",
            species: "=>Genome Not Found in db<=",
            strain: "",
            acc: "",
            gene: row.gene,
            pid: row.pid,
            prod: row.product,
            type: row.type,
        };
        //logger.info('3count '+cnt.toString())
        if (gid && Object.hasOwn(C.genome_lookup, gid)) {
            //if(gid){
            otid = C.genome_lookup[gid]["otid"];
            ((hmt = helpers.make_otid_display_name(otid)),
                (strain = C.genome_lookup[gid]["strain"]));
            species =
                C.taxon_lookup[otid]["genus"] +
                " " +
                C.taxon_lookup[otid]["species"];
            tmp_obj.species = species;
            tmp_obj.strain = strain;
            tmp_obj.otid = otid;
            tmp_obj.hmt = hmt;
        }
        region = row.region;
        start = row.start;
        end = row.end;
        url = helpers.create_jbrowse_url(gid, region, start, end);
        //console.log('tmp_obj',tmp_obj)
        payload = {
            gid: gid,
            hmt: hmt,
            otid: otid,
            org: species,
            pid: tmp_obj.pid,
            prod: tmp_obj.prod,
            gene: tmp_obj.gene,
            type: tmp_obj.type,
            jburl: url,
        };
        if (download === "1") {
            let text =
                gid +
                "\t" +
                hmt +
                "\t" +
                species +
                "\t" +
                tmp_obj.pid +
                "\t" +
                tmp_obj.type +
                "\t" +
                tmp_obj.gene +
                "\t" +
                tmp_obj.prod +
                "\n";
            res.write(text);
        } else {
            res.write(`data: ${JSON.stringify(payload)}\n\n`);
        }
        //logger.info('tmp_obj',tmp_obj)
    });
    stream.on("error", (err) => {
        res.write(`data: ERROR: ${err.toString()}\n\n`);
    });

    stream.on("end", () => {
        const endpayload = {
            notice: "END-OF-STREAM",
            count: cnt,
        };
        res.write(`data: ${JSON.stringify(endpayload)}\n\n`);
        console.log("DONE");
        res.end();
    });

    //}catch(e){
    //      logger.error(e);
    //}
});

//
//

//
//  Global Site Search
//
router.post("/basic_site_search", function basic_site_search(req, res) {
    console.log("index.js::in basic POST -Search");
    logger.info(req.body);
    const searchText = req.body.adv_search_text;
    const searchTextLower = req.body.adv_search_text.toLowerCase();
    let taxonOtidObj = {},
        otidLst = [],
        refseqObj = {},
        gidLst = [],
        ret_obj;
    let form_type = [];
    if (req.body.taxonomy && req.body.taxonomy == "on") {
        ret_obj = search_taxonomy(searchTextLower);
        taxonOtidObj = ret_obj.taxonOtidObj;
        otidLst = ret_obj.otidLst;
        refseqObj = ret_obj.refseqObj;
        form_type.push("taxonomy");
    }
    if (req.body.genomes && req.body.genomes == "on") {
        gidLst = search_genomes(searchTextLower);
        form_type.push("genomes");
    }

    let contigObj_list = search_contigs(searchTextLower);
    ///////////// PHAGE /////////////////////////////////////////////////////////////////////////////

    //  Now the phage db
    // phageID, phage:family,genus,species, host:genus,species, ncbi ids
    // logger.info(C.phage_lookup['HPT-000001'])
    // PHAGE Metadata
    //   const allPhageObjList = Object.values(C.phage_lookup)
    //   // let gid_lst = Object.keys(C.genome_lookup).filter(item => ((item.toLowerCase()+'').includes(searchTextLower)))
    //   // logger.info(allPhageObjList[0])
    //   const pidKeyList = Object.keys(allPhageObjList[0])
    //   const pidObjList = allPhageObjList.filter(function (el) {
    //     for (let n in pidKeyList) {
    //       // logger.info(pidkeylist[n]+'-'+searchTextLower)
    //       if (Array.isArray(el[pidKeyList[n]])) {
    //         // we're missing any arrays
    //         // return 0
    //       } else {
    //         if ((el[pidKeyList[n]]).toString().toLowerCase().includes(searchTextLower)) {
    //           return el.pid
    //         }
    //         // return 0
    //       }
    //     }
    //   })
    //   // logger.info(pidObjList)
    //
    //   const phageIdLst = pidObjList.map(e => e.pid)
    //////////// HELP PAGES //////////////////////////////////////////////////////////////////////////////
    // help pages uses grep
    let helpLst = [];
    let help_trunk = path.join(ENV.PROCESS_DIR, "views", "partials", "help");
    const grep_help_cmd =
        ENV.GREP_CMD +
        " -liR " +
        help_trunk +
        " -e '" +
        helpers.addslashes(searchText) +
        "'";
    console.log(grep_help_cmd);
    exec(grep_help_cmd, (err, stdout, stderr) => {
        if (stderr) {
            logger.error(stderr);
            return;
        }
        //logger.info('stdout',stdout);
        let fileLst = [];
        if (stdout) {
            fileLst = stdout.trim().split("\n");
        }
        if (fileLst.length > 0) {
            for (let n in fileLst) {
                //logger.info('file',fileLst[n])
                let cleanfinal = fileLst[n]
                    .replace(help_trunk, "")
                    .replace(/^\//, "")
                    .replace(/\.ejs$/, "");
                helpLst.push(cleanfinal);
            }
        }

        let prokka_genome_count = 0;
        let prokka_gene_count = 0;
        let ncbi_genome_count = 0;
        let ncbi_gene_count = 0;

        res.render("pages/search/basic_search_result", {
            title: "HOMD :: Site Search",
            pgname: "", // for AbountThisPage
            config: JSON.stringify(ENV),
            ver_info: JSON.stringify(C.version_information),

            search_text: searchText,
            otid_list: JSON.stringify(otidLst),
            refseq_obj: JSON.stringify(refseqObj),
            gid_list: JSON.stringify(gidLst),

            //let prokka_genome_count_lookup={},prokka_gene_count=0,ncbi_genome_count_lookup={},ncbi_gene_count=0
            num_prokka_genomes: prokka_genome_count,
            num_prokka_genes: prokka_gene_count,
            num_ncbi_genomes: ncbi_genome_count,
            num_ncbi_genes: ncbi_gene_count,

            taxon_otid_obj: JSON.stringify(taxonOtidObj),
            help_pages: JSON.stringify(helpLst),
            contig_list: JSON.stringify(contigObj_list),
            //phage_id_list: JSON.stringify(phageIdLst) // phageIDs
        });
    });
});

//
//
//
//
function search_taxonomy(text_string) {
    // type is names or otids
    // lets search the taxonomy names
    // Bacterial Taxonomy Names
    const taxonList = Object.values(C.taxon_lineage_lookup).filter(
        function (e) {
            if (Object.keys(e).length !== 0) {
                //logger.info('e',e)
                if (
                    e.domain.toLowerCase().includes(text_string) ||
                    e.phylum.toLowerCase().includes(text_string) ||
                    e.klass.toLowerCase().includes(text_string) ||
                    e.order.toLowerCase().includes(text_string) ||
                    e.family.toLowerCase().includes(text_string) ||
                    e.genus.toLowerCase().includes(text_string) ||
                    e.species.toLowerCase().includes(text_string) ||
                    e.subspecies.toLowerCase().includes(text_string)
                ) {
                    return e;
                }
            }
            //
        },
    );
    //logger.info('taxonList',taxonList)
    //  Now get the otids
    let pototid,
        taxonOtidObj = {};
    // must find: HMT-389, HMT_389, HMT389 as well as 389
    if (text_string.slice(0, 3) === "hmt") {
        // check first 3 chars
        pototid = parseInt(
            text_string.slice(3).replace("-", "").replace("_", ""),
        ); // Starts the slice at index 3
        //pototid = parseInt(text_string.slice(-3))  // get last 3 chars
    } else {
        pototid = parseInt(text_string);
    }
    if (pototid && pototid in C.taxon_lookup) {
        if (C.dropped_taxids.indexOf(pototid.toString()) != -1) {
            taxonOtidObj[pototid] = "This taxon has been dropped from HOMD.";
        } else {
            //logger.info('got OTID int',text_string)
            taxonOtidObj[pototid] = C.taxon_lineage_lookup[pototid].domain;
            taxonOtidObj[pototid] +=
                ";" + C.taxon_lineage_lookup[pototid].phylum;
            taxonOtidObj[pototid] +=
                ";" + C.taxon_lineage_lookup[pototid].klass;
            taxonOtidObj[pototid] +=
                ";" + C.taxon_lineage_lookup[pototid].order;
            taxonOtidObj[pototid] +=
                ";" + C.taxon_lineage_lookup[pototid].family;
            taxonOtidObj[pototid] +=
                ";" + C.taxon_lineage_lookup[pototid].genus;
            taxonOtidObj[pototid] +=
                ";" + C.taxon_lineage_lookup[pototid].species;
            taxonOtidObj[pototid] +=
                ";" + C.taxon_lineage_lookup[pototid].subspecies;
        }
    }
    const taxonOtidList = taxonList.map((e) => e.otid);

    for (let n in taxonOtidList) {
        const otid = taxonOtidList[n];
        taxonOtidObj[otid] = C.taxon_lineage_lookup[otid].domain;
        taxonOtidObj[otid] += ";" + C.taxon_lineage_lookup[otid].phylum;
        taxonOtidObj[otid] += ";" + C.taxon_lineage_lookup[otid].klass;
        taxonOtidObj[otid] += ";" + C.taxon_lineage_lookup[otid].order;
        taxonOtidObj[otid] += ";" + C.taxon_lineage_lookup[otid].family;
        taxonOtidObj[otid] += ";" + C.taxon_lineage_lookup[otid].genus;
        taxonOtidObj[otid] += ";" + C.taxon_lineage_lookup[otid].species;
        //if (C.taxon_lineage_lookup[otid].subspecies !== '') {
        taxonOtidObj[otid] += ";" + C.taxon_lineage_lookup[otid].subspecies;
    }

    // OTID Metadata
    const allOtidObjList = Object.values(C.taxon_lookup);
    const otidKeyList = Object.keys(allOtidObjList[0]);
    //helpers.print(['allOtidObjList[0]',allOtidObjList[0]]) // site is undefined
    let otidObjList = allOtidObjList.filter(function (el) {
        for (let n in otidKeyList) {
            //logger.info( 'el[otidKeyList[n]]',el[otidKeyList[n]] )
            //logger.info( 'el',el )
            if (
                Array.isArray(el[otidKeyList[n]]) &&
                el[otidKeyList[n]].length > 0
            ) {
                // we're catching any arrays: rrna_sequences, synonyms, sites, pangenomes, type_strains, ref_strains
                //logger.info('el',el)
                if (
                    el[otidKeyList[n]][0] &&
                    el[otidKeyList[n]].findIndex((element) =>
                        element.toString().toLowerCase().includes(text_string),
                    ) !== -1
                ) {
                    return el.otid;
                }
            } else {
                //helpers.print(['el',el])

                if (
                    Object.prototype.hasOwnProperty.call(el, otidKeyList[n]) &&
                    el[otidKeyList[n]] &&
                    el[otidKeyList[n]]
                        .toString()
                        .toLowerCase()
                        .includes(text_string)
                ) {
                    return el.otid;
                }
            }
        }
    });

    const otidMetaLst = otidObjList.map((e) => ({
        otid: e.otid,
        species: "<i>" + e.genus + " " + e.species + "</i>",
    }));

    //logger.info('otidMetaLst',otidMetaLst[0])
    otidMetaLst.sort(function (a, b) {
        return helpers.compareStrings_alpha(a.species, b.species);
    });

    // RefSeq
    // add to OTID Metadata
    //logger.info(C.refseq_lookup)
    const allRefSeqObjList = Object.values(C.refseq_lookup);

    // '998': [
    //         { refseq_id: 'HMT-998_16S005908', species: 'Victivallis lenta' },
    //         { refseq_id: 'HMT-998_16S005921', species: 'Victivallis lenta' },
    //         { refseq_id: 'HMT-998_16S005935', species: 'Victivallis lenta' }
    //       ]

    let refseqObj = {};
    allRefSeqObjList.filter((el) => {
        //logger.info('refseq-el',el)
        for (let n in el) {
            if (
                el[n].refseq_id.toLowerCase().includes(text_string) ||
                el[n].seqids.toLowerCase().includes(text_string)
            ) {
                //logger.info('el',el[n].refseq_id.toLowerCase())
                let hmt = el[n].refseq_id.split("_")[0];
                let otid = hmt.split("-")[1];
                if (!Object.hasOwn(refseqObj, hmt)) {
                    refseqObj[hmt] = {
                        otid: otid,
                        hmt: hmt,
                        species: el[n].species,
                        refseq_id: el[n].refseq_id,
                        seqids: el[n].seqids,
                    };
                }
            }
        }
    });

    //logger.info('in refseq search',refseqObj)

    return {
        taxonOtidObj: taxonOtidObj,
        otidLst: otidMetaLst,
        refseqObj: refseqObj,
    };
}
function search_genomes(text_string) {
    //let add_genome_to_otid = {}
    // Genome  Metadata
    const allGidObjList = Object.values(C.genome_lookup);
    // let gid_lst = Object.keys(C.genome_lookup).filter(item => ((item.toLowerCase()+'').includes(searchTextLower)))
    const gidKeyList = Object.keys(allGidObjList[0]);
    const gidObjList = allGidObjList.filter(function (el) {
        for (let n in gidKeyList) {
            if (Array.isArray(el[gidKeyList[n]])) {
                // we're missing any arrays
            } else {
                if (
                    Object.prototype.hasOwnProperty.call(el, gidKeyList[n]) &&
                    el[gidKeyList[n]]
                        .toString()
                        .toLowerCase()
                        .includes(text_string)
                ) {
                    //add_genome_to_otid[el.otid] = el.organism
                    el.species = C.taxon_lookup[el.otid].species;
                    el.genus = C.taxon_lookup[el.otid].genus;

                    return el.gid;
                }
            }
        }
    });
    //helpers.print(['gidObjList[0]',gidObjList[0]])
    let gidLst = gidObjList.map((e) => ({
        gid: e.gid,
        strain: e.strain,
        otid: e.otid,
        species: "<i>" + e.genus + " " + e.species + "</i>",
    }));
    //helpers.print(gidLst)
    gidLst.sort(function (a, b) {
        //logger.info('a',a)
        return helpers.compareStrings_alpha(a.species, b.species);
    });
    return gidLst;
}

function search_contigs(text_string) {
    // search contigs
    let contigObj_list = [];
    //logger.info('C.contig_lookup',C.contig_lookup )
    let all_contigs = Object.keys(C.contig_lookup);
    const contig_list = all_contigs.filter((el) => {
        if (el.toLowerCase().indexOf(text_string) !== -1) {
            return true;
        }
    });
    for (let n in contig_list) {
        contigObj_list.push({
            contig: contig_list[n],
            gids: C.contig_lookup[contig_list[n]],
        });
    }
    return contigObj_list;
}
////

// }); // end pipeline
// })  // end anno query
export default router;
