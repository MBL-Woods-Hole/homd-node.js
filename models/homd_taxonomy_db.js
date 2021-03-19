

const C = require(app_root + '/public/constants');


 
 //homd_query1 = "select * from HOMD_taxonomy.taxon_list"
 //homd_query2 = "select * from HOMD_taxonomy.warning"
 //homd_query3 = "select * from HOMD_taxonomy.status"
 homd_query = " SELECT  a.oral_taxon_id, a.genus, a.species, \
  IFNULL(b.warning, '0') as `warning`, \
        IFNULL(c.group, 'unknown') as `status` \
    FROM    HOMD_taxonomy.taxon_list a \
    left JOIN HOMD_taxonomy.1_warning b \
            ON a.oral_taxon_id = b.oral_taxon_id \
    left JOIN HOMD_taxonomy.1_status c \
            ON a.oral_taxon_id = c.oral_taxon_id \
    "

console.log('HOMD: running query from models/homd_taxonomy.js');



function homdTaxonomy() {}

homdTaxonomy.prototype.get_all_taxa = function(callback) 
{
    console.log('HOMD Taxonomy: '+homd_query)
    DBConn.query(homd_query, function (err, rows, fields) {
      callback(err, rows);
    });
};

module.exports = homdTaxonomy;