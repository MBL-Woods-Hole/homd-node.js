import config from 'dotenv/config';
import fs from 'fs-extra';
import FlexSearch from 'flexsearch';
import mysql from 'mysql2/promise';
import path from 'path'
//console.log('config',config)
console.log('mysql user',process.env.DB_USER)

const sqlconn = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  
  connectionLimit: 20,
})


let document

//  = new FlexSearch.Document({
//   tokenize: "forward",
//   document: {
//     id: 'id',
//     
//     index: ['content:gene',
//             'content:product',
//             'content:region',
//             'content:pid',
//             'gid',
//             ],
//     store: true
//   }
// });

async function fetchData() {
    let pid,product,row,index
    let prokka_sql = "SELECT id, concat_ws('\t','prokka',genome_id,type,region,attribute_locus_tag,attribute_gene,attribute_product) as rowdata FROM PROKKA.gff"
    //prokka_sql += ' limit 10'
    
    let bakta_sql =  "SELECT id, concat_ws('\t','bakta',genome_id,type,region,attribute_locus_tag,attribute_gene,attribute_product) as rowdata from BAKTA.gff"
    let ncbi_sql =   "SELECT id, concat_ws('\t','ncbi',genome_id,type,region,attribute_locus_tag,attribute_gene,attribute_product) as rowdata from NCBI.gff"
    const [prokka_rows] = await sqlconn.execute(prokka_sql);
    
    //console.log(prokka_rows)
    // PROKKA
    document = new FlexSearch.Document({
        
        document: {
            id: "id",
            index: ["id", "content"],
            store: true // ◄ CRITICAL: Tells FlexSearch to retain original data
          }
    });
    console.log('Running PROKKA')
    //let data = []
    for(let n in prokka_rows){
        row = prokka_rows[n]
        //console.log('row',row)
        //data.push(row.rowdata)
        // ID=GCA_000174175.1_00100; inference=ab initio prediction:Prodigal:002006; locus_tag=GCA_000174175.1_00100; product=hypothetical protein
        
        document.add({
                id:         n,
                sqlid:      row.id,
                content:    row.rowdata
        });
        //console.log('PROKKA')
        
    }
    // Export and write chunks or keys to disk
    await document.export(async function(key, data){
        await fs.writeFile(path.join(process.env.PATH_TO_FLEXSEARCH_DB,'prokka',key+'.json'), data, "utf8");
    });
  
    // BAKTA
    document = new FlexSearch.Document({
        
        document: {
            id: "id",
            index: ["id", "content"],
            store: true // ◄ CRITICAL: Tells FlexSearch to retain original data
          }
    });
    console.log('Running BAKTA')
    const [bakta_rows] = await sqlconn.execute(bakta_sql);
    for(let n in bakta_rows){
        row = bakta_rows[n]
                
        // ID=GCA_000174175.1_00100; inference=ab initio prediction:Prodigal:002006; locus_tag=GCA_000174175.1_00100; product=hypothetical protein
        document.add({
                id:         n,
                sqlid:      row.id,
                content:    row.rowdata
        });
    }
    // Export and write chunks or keys to disk
    await document.export(async function(key, data){
       await fs.writeFileSync(path.join(process.env.PATH_TO_FLEXSEARCH_DB,'bakta',key+'.json'),  data, "utf8");
    });
    // NCBI
    document = new FlexSearch.Document({
        
        document: {
            id: "id",
            index: ["id", "content"],
            store: true // ◄ CRITICAL: Tells FlexSearch to retain original data
          }
    });
    console.log('Running NCBI')
    const [ncbi_rows] = await sqlconn.execute(ncbi_sql);
    for(let n in ncbi_rows){
        row = ncbi_rows[n]
                
        // ID=GCA_000174175.1_00100; inference=ab initio prediction:Prodigal:002006; locus_tag=GCA_000174175.1_00100; product=hypothetical protein
        document.add({
                id:         n,
                sqlid:        row.id,
                content:    row.rowdata
        });
    }
    // Export and write chunks or keys to disk
    await document.export(async function(key, data){
      await fs.writeFileSync(path.join(process.env.PATH_TO_FLEXSEARCH_DB,'ncbi',key+'.json'),  data, "utf8");
    });
    
    process.exit(0);
}
fetchData();

//=====AI: `flexsearch store to file` =============================================
// import fs from 'fs';
// import FlexSearch from 'flexsearch';
// 
// const index = new FlexSearch.Document({
//   document: {
//     id: 'id',
//     index: ['title', 'content']
//   }
// });
// 
// // Add your data...
// index.add({ id: 1, title: 'Hello World', content: 'FlexSearch is fast.' });
// 
// // Export and write chunks or keys to disk
// await index.export((key, data) => {
//   fs.writeFileSync(`./search_index/${key}.json`, JSON.stringify(data));
// });
// ```
// 
// ### Restoring / Importing the Index from File
// 
// To load the stored index back into memory, recreate the index using the exact same 
//  configuration options and read the saved files back via `.import()`:
// 
// ```javascript
// const index = new FlexSearch.Document({
//   document: {
//     id: 'id',
//     index: ['title', 'content']
//   }
// });
// 
// const files = fs.readdirSync('./search_index');
// 
// for (const file of files) {
//   const key = file.replace('.json', '');
//   const data = fs.readFileSync(`./search_index/${file}`, 'utf8');
//   index.import(key, JSON.parse(data));
// }
// 
// ### Key Details
// - **Async Handling:** Always `await` the `.export()` call or handle completion inside the callback, as the export operation processes asynchronously.
// - **Matching Config:** The configuration object passed during index instantiation must match identically when you run `.import()` later.
//==========================================