"use strict";
import express from "express";
const router = express.Router();
import fs from "fs-extra";

// const fs   = require('fs-extra')
import path from "path";
import * as helpers from "./helpers/helpers.js";

import C from "../public/constants.js";

import * as queries from "./queries.js";
//import pino from 'pino';

import logger from "../config/app_config.js";

router.get("/", function index(req, res) {
  res.render("pages/home", {
    title: "HOMD :: Human Oral Microbiome Database",
    pgname: "home", // for AbountThisPage
    config: JSON.stringify(ENV),
    ver_info: JSON.stringify(C.version_information),
    stats: JSON.stringify(C.homd_stats),
  });
});

router.get("/get_fasta", async function get_fasta(req, res) {
  // I think you can implement an url from the blast result page,
  // if possible, and as long as the url has an address such as
  // https://homd.org/get_fasta?seqid=xxx,xxx,xxx
  let dt = helpers.get_today_obj();

  logger.info("in get_fasta");
  logger.info("req.query", req.query);
  let anno = req.query.anno; // PROKKA or NCBI
  let dbtable = req.query.dbtable; // ffa ffn fna
  let seqids = req.query.seqids;
  let dbname = req.query.dbname;
  let jobid = req.query.jobid;
  let q;

  q =
    "SELECT genome_id as gid, protein_id as pid, UNCOMPRESS(seq_compressed) as seq from " +
    anno +
    "." +
    dbtable +
    ""; //
  // let q = "SELECT UNCOMPRESS(seq_compressed) as seq from PROKKA.ffn"
  //     let q = "SELECT UNCOMPRESS(seq_compressed) as seq from NCBI.faa"   //okay
  //     let q = "SELECT UNCOMPRESS(seq_compressed) as seq from NCBI.ffn"
  // PROKKA faa OKAY GCA_937930255.1_00784", "GCA_013267415.1_00353
  // NCBI faa  FIXED in routes.rb GCA_026783725.1|MCY7224140.1", "GCA_013267415.1|QKH46404.1
  // PROKKA::ffn OKAY GCA_019602835.1_00003,GCA_027625375.1_00003,GCA_030503915.1_02746
  // PROKKA fna BROKE XXXX "GCA_019602835.1|CP080761.1", "GCA_027625375.1|CP115182.1", "GCA_030148125.1|JASBUB010000108.1"
  // NCBI fna BROKE XXXX "GCA_019602835.1|CP080761.1", "GCA_030148125.1|JASBUB010000108.1", "GCA_027625375.1|CP115182.1"
  // NCBI ffn  FIXED in routes.rb "GCA_019602835.1|lcl|CP080761.1_cds_QYY25611.1_3", "GCA_000015545.1|lcl|CP000539.1_cds_ABM44247.1_3991"
  //
  q += " WHERE protein_id in ('" + seqids.replace(/,/g, "','") + "')";
  //q += " limit 10"
  logger.info("\n", anno, dbtable);

  let defline,
    seq,
    outfile_txt = "";
  const rows = await queries.run_query(q, req, res);

  //logger.info('rows',rows)
  if (rows.length === 0) {
    logger.warn("no rows found");
    res.send("No Data Found");
    return;
  } else {
    for (let n in rows) {
      defline = ">" + rows[n].pid + "|" + rows[n].gid;
      seq = rows[n].seq.toString();
      const arr = helpers.chunkSubstr(seq, 80);
      //arr.join('<br>')
      outfile_txt += defline + "\n" + arr.join("\n") + "\n";
    }
  }
  let outfilePath = path.join(ENV.PATH_TO_TMP, jobid + ".fa");
  logger.info("writing fasta to ", outfilePath);
  await fs.writeFile(outfilePath, outfile_txt);

  let fname =
    "HOMD_BLAST_FASTA_" +
    anno +
    "_" +
    dbname +
    "_" +
    dt.today +
    "_" +
    dt.seconds +
    ".fa";
  res.set({ "Content-Disposition": "attachment; filename=" + fname });
  res.send(outfile_txt);
  res.end();
});

router.get("/statistics", function poster(req, res) {
  res.render("pages/statistics", {
    title: "HOMD :: Human Oral Microbiome Database",
    pgname: "", // for AbountThisPage
    config: JSON.stringify(ENV),
    ver_info: JSON.stringify(C.version_information),
    stats: JSON.stringify(C.homd_stats),
  });
});

////
router.get("/poster", function poster(req, res) {
  res.render("pages/poster", {
    title: "HOMD :: Human Oral Microbiome Database",
    pgname: "", // for AbountThisPage
    config: JSON.stringify(ENV),
    ver_info: JSON.stringify(C.version_information),
  });
});
////

router.post("/open_phage_sequence", async function submit_phage_data(req, res) {
  logger.info("in open_phage_sequence");

  let html = "",
    contig,
    length,
    gid,
    predictor,
    species = "",
    strain = "",
    otid;
  let q =
    "SELECT genome_id,contig,predictor,seq_length,UNCOMPRESS(seq_compressed) as seq from phage_search WHERE search_id = '" +
    req.body.search_id +
    "'";

  const rows = await queries.run_query(q, req, res);

  //logger.info('rows',rows)
  if (rows.length === 0) {
    html += "No sequence found in database";
    logger.error("error-No sequence found in database");
  } else {
    predictor = rows[0].predictor;
    gid = rows[0].genome_id;
    if (gid && Object.hasOwn(C.genome_lookup, gid)) {
      //C.genome_lookup.hasOwnProperty(gid)) {
      otid = C.genome_lookup[gid]["otid"];
      strain = C.genome_lookup[gid]["strain"];
      species =
        C.taxon_lookup[otid]["genus"] + " " + C.taxon_lookup[otid]["species"];
    }
    contig = rows[0].contig;
    length = rows[0].seq_length;
    const seqstr = rows[0].seq.toString();
    const arr = helpers.chunkSubstr(seqstr, 100);
    html += arr.join("<br>");
  }
  res.send(
    JSON.stringify({
      html: html,
      length: length,
      gid: gid,
      contig: contig,
      org: species + " (" + strain + ")",
      predictor: predictor,
    }),
  );
});
//
router.post(
  "/show_all_phage_hits",
  async function show_all_phage_hits(req, res) {
    logger.info("in show_all_phage_hits");
    let all = JSON.parse(req.body.big_list);
    let hit_ids = [],
      hl;
    for (let n in all) {
      hl = all[n].hitlist;
      for (let m in hl) {
        hit_ids.push(hl[m][0]);
      }
    }
    //logger.info(hit_ids)
    let q = queries.get_phage_from_ids_noseqs(hit_ids);

    const rows = await queries.run_query(q, req, res);

    //logger.info('rows',rows)

    res.render("pages/phage/all_hits_result", {
      title: "HOMD :: Search Results",
      pgname: "", // for AboutThisPage
      config: JSON.stringify(ENV),
      ver_info: JSON.stringify(C.version_information),
      //hits_list: req.body.big_list,
      searchtxt: req.body.search_text,
      numhits: req.body.total_hits,
      sqldata: JSON.stringify(rows),
    });
  },
);
router.post("/submit_phage_data", async function submit_phage_data(req, res) {
  logger.info("in submit_phage_data");
  logger.info(req.body);

  let q =
    "SELECT * from phage_search WHERE search_id = '" + req.body.search_id + "'";

  const rows = await queries.run_query(q, req, res);

  res.send(JSON.stringify(rows));
  return;
});

// }); // end pipeline
// })  // end anno query
export default router;
