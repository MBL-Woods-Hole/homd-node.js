'use strict'

const router = express.Router()
import C from '../../public/constants.js';
//const queries = require(app_root + '/routes/queries');

import express from 'express';
import fs from 'fs-extra';
import readline from 'readline';
//import accesslog from 'access-log';
import async from 'async';
import util from 'util';
import path from 'path';
import { exec, spawn } from 'child_process';
//import {Index} from 'flexsearch';
import FlexSearch from 'flexsearch';
import * as helpers_taxa from './helpers_taxa.js'
//import pino from 'pino';
import logger from '../../config/app_config.js';

// ### Restoring / Importing the Index from File
// 
// To load the stored index back into memory, recreate the index using the exact same 
//  configuration options and read the saved files back via `.import()`:
// 
// ```javascript
//const index = new Index({tokenize: "forward"});
const index = new FlexSearch.Document({
        tokenize: "forward",
        document: {
            id: "id",
            index: ["id", "content"],
            store: true // ◄ CRITICAL: Tells FlexSearch to retain original data
          }
    });

//    (async function(){
export const search_test = async (anno, search_string = 'hypo') => {
        console.log('Searching FlexSearch DB')
        let return_data = [],field,doc,gid,gene,region,product,idx,obj={}
        const files = fs.readdirSync(path.join(ENV.PATH_TO_FLEXSEARCH_DB,anno));
        console.log('path',path.join(ENV.PATH_TO_FLEXSEARCH_DB,anno),files)
        for (const file of files) {
            const key = file.replace('.json', '');
            //const data = fs.readFileSync(`./search_index/${file}`, 'utf8');
            const data = fs.readFileSync(path.join(ENV.PATH_TO_FLEXSEARCH_DB,anno,file), 'utf8');
            index.import(key, JSON.parse(data));
        }
        //console.log('idx',index)
        const qresult = index.search(search_string,{
                                limit: 5000
                        });
        //console.log('my qresult DB',anno,search_string,qresult)
         //console.log(index.get('728'))
         if(!qresult || !qresult[0] || qresult[0].result.length == 0){
           return []
         }
         for(let n in qresult[0].result){
             //console.log(qresult[0].result[n])
             let d = index.get(qresult[0].result[n])
             //console.log('d',d)
             return_data.push(d.content)
         }
        // qresult.forEach(i => {
//             console.log(qresult[0]);
//         });
        // const qresult = await index.search({
//                 //query: "cute cat"
//                 //console.log('Searching DB')
//                 query: search_string
//         });
        // for(let n in qresult){
//             
//             field = qresult[n].field
//             for(let i in qresult[n].result){
//                 doc = index.get(qresult[n].result[i])
//                 gid = doc.gid
//                 idx = doc.id
//                 gene = doc.content.gene
//                 region = doc.content.region
//                 product = doc.content.product
//                 obj = {id:idx,gene:gene,region:region,product:product}
//                 if(!return_data.hasOwnProperty(gid)){
//                     return_data[gid] = []
//                 }
//                 return_data[gid].push(obj)
//                 //console.log(field,doc); 
//             }
//         }
        
        //doc = index.get('181');
        
        // display results
        // if(result.length == 0){
//            console.log("Nothing found for string: `"+search_string+"` in "+anno)
//         }else{
//             result.forEach(i => {
//                 console.log('Search String: `'+search_string+"`in "+anno,'FOUND:',i); //data[i]);
//             });
//         }
        return return_data
};
//search_test();


export default router;