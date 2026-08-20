Creation of these search files:
use these tables: PROKKA.orf_gff  and NCBI.orf_gff  they are a combination of orf and gff tables
and have all rows besides 'CDS' which all should be searched.
Export the results (using Sequel Ace to remove the first header line) to a .csv or .txt file.

BAKTA
select count(*) from BAKTA.orf_gff    38731965
divided by 5 = 7746393
select concat_ws('|','bakta',LOWER(genome_id), LOWER(region),LOWER(attribute_gene),LOWER(attribute_locus_tag),LOWER(attribute_product),start,end) as file1 from BAKTA.gff limit 7746393
select concat_ws('|','bakta',LOWER(genome_id), LOWER(region),LOWER(attribute_gene),LOWER(attribute_locus_tag),LOWER(attribute_product),start,end) as file2 from BAKTA.gff limit 7746393,7746393
select concat_ws('|','bakta',LOWER(genome_id), LOWER(region),LOWER(attribute_gene),LOWER(attribute_locus_tag),LOWER(attribute_product),start,end) as file3 from BAKTA.gff limit 15492786,7746393
select concat_ws('|','bakta',LOWER(genome_id), LOWER(region),LOWER(attribute_gene),LOWER(attribute_locus_tag),LOWER(attribute_product),start,end) as file4 from BAKTA.gff limit 23239179,7746393
select concat_ws('|','bakta',LOWER(genome_id), LOWER(region),LOWER(attribute_gene),LOWER(attribute_locus_tag),LOWER(attribute_product),start,end) as file5 from BAKTA.gff limit 30985572,7746393

select count(*) from PROKKA.gff 19446765
PROKKA divided by 5 = 3889353
select concat_ws('|','prokka',LOWER(genome_id), LOWER(region),LOWER(attribute_gene),LOWER(attribute_locus_tag),LOWER(attribute_product),start,end) as file1 from PROKKA.gff limit 3889353
select concat_ws('|','prokka',LOWER(genome_id), LOWER(region),LOWER(attribute_gene),LOWER(attribute_locus_tag),LOWER(attribute_product),start,end) as file2 from PROKKA.gff limit 3889353,3889353
select concat_ws('|','prokka',LOWER(genome_id), LOWER(region),LOWER(attribute_gene),LOWER(attribute_locus_tag),LOWER(attribute_product),start,end) as file3 from PROKKA.gff limit 7778706,3889353
select concat_ws('|','prokka',LOWER(genome_id), LOWER(region),LOWER(attribute_gene),LOWER(attribute_locus_tag),LOWER(attribute_product),start,end) as file4 from PROKKA.gff limit 11668059,3889353
select concat_ws('|','prokka',LOWER(genome_id), LOWER(region),LOWER(attribute_gene),LOWER(attribute_locus_tag),LOWER(attribute_product),start,end) as file5 from PROKKA.gff limit 15557412,3889353

NCBI  29681979
NCBI   divided by 5 = 5936396
select concat_ws('|','ncbi',LOWER(genome_id), LOWER(region),LOWER(attribute_gene),LOWER(attribute_locus_tag),LOWER(attribute_product),start,end) as file1 from NCBI.gff limit 5936396
select concat_ws('|','ncbi',LOWER(genome_id), LOWER(region),LOWER(attribute_gene),LOWER(attribute_locus_tag),LOWER(attribute_product),start,end) as file2 from NCBI.gff limit 5936396,5936396
select concat_ws('|','ncbi',LOWER(genome_id), LOWER(region),LOWER(attribute_gene),LOWER(attribute_locus_tag),LOWER(attribute_product),start,end) as file3 from NCBI.gff limit 11872729,5936396
select concat_ws('|','ncbi',LOWER(genome_id), LOWER(region),LOWER(attribute_gene),LOWER(attribute_locus_tag),LOWER(attribute_product),start,end) as file4 from NCBI.gff limit 17809188,5936396
select concat_ws('|','ncbi',LOWER(genome_id), LOWER(region),LOWER(attribute_gene),LOWER(attribute_locus_tag),LOWER(attribute_product),start,end) as file5 from NCBI.gff limit 23745584,5936396


OLD:
select count(*) from PROKKA.orf_gff  19437410
select count(*) from NCBI.orf_gff    29651058
PROKKA divided by 5 = 3887482
select concat_ws('|','prokka',LOWER(genome_id), LOWER(region),LOWER(gene),LOWER(protein_id),LOWER(product),length_na,length_aa,start,end) as file1 from PROKKA.orf_gff limit 3887482
select concat_ws('|','prokka',LOWER(genome_id), LOWER(region),LOWER(gene),LOWER(protein_id),LOWER(product),length_na,length_aa,start,end) as file2 from PROKKA.orf_gff LIMIT 3887482, 3887482
select concat_ws('|','prokka',LOWER(genome_id), LOWER(region),LOWER(gene),LOWER(protein_id),LOWER(product),length_na,length_aa,start,end) as file3 from PROKKA.orf_gff limit 7774964, 3887482
select concat_ws('|','prokka',LOWER(genome_id), LOWER(region),LOWER(gene),LOWER(protein_id),LOWER(product),length_na,length_aa,start,end) as file4 from PROKKA.orf_gff limit 11662446, 3887482
select concat_ws('|','prokka',LOWER(genome_id), LOWER(region),LOWER(gene),LOWER(protein_id),LOWER(product),length_na,length_aa,start,end) as file5 from PROKKA.orf_gff limit 15549928, 3887482


NCBI   divided by 5 =  5930211

select concat_ws('|','ncbi',LOWER(genome_id), LOWER(region),LOWER(gene),LOWER(protein_id),LOWER(product),length_na,length_aa,start,end) as file1 from NCBI.orf_gff limit 5930211
select concat_ws('|','ncbi',LOWER(genome_id), LOWER(region),LOWER(gene),LOWER(protein_id),LOWER(product),length_na,length_aa,start,end) as file2 from NCBI.orf_gff LIMIT 5930211, 5930211
select concat_ws('|','ncbi',LOWER(genome_id), LOWER(region),LOWER(gene),LOWER(protein_id),LOWER(product),length_na,length_aa,start,end) as file3 from NCBI.orf_gff limit 11,860,422, 5930211
select concat_ws('|','ncbi',LOWER(genome_id), LOWER(region),LOWER(gene),LOWER(protein_id),LOWER(product),length_na,length_aa,start,end) as file4 from NCBI.orf_gff limit 17,790,633, 5930211
select concat_ws('|','ncbi',LOWER(genome_id), LOWER(region),LOWER(gene),LOWER(protein_id),LOWER(product),length_na,length_aa,start,end) as file5 from NCBI.orf_gff limit 23,720,844, 5930211



=======
homd_GREP_Search-PROKKA1.list
homd_GREP_Search-NCBI1.list

The [PROKKA|NCBI]_meta.orf DB tables are created using the scripts from homd-work/genomesV11/load_[prokka|ncbi]_meta_orf.py


Export the results (using Sequel Ace to remove the first header line) to a .csv or .txt file.

On the production server use a limit clause to make 5-10 different files for GREPing.
To make five files as example:
Find total # of rows: SELECT COUNT(*) FROM PROKKA_meta.orf
XX19440445  divided by 5 == 3888089
19448267  divided by 5 == 3889654
select concat_ws('|','prokka',LOWER(genome_id), LOWER(accession),LOWER(gene),LOWER(protein_id),LOWER(product),length_na,length_aa,start,stop) as file1 from PROKKA_meta.orf limit 3889654
select concat_ws('|','prokka',LOWER(genome_id), LOWER(accession),LOWER(gene),LOWER(protein_id),LOWER(product),length_na,length_aa,start,stop) as file2 from PROKKA_meta.orf LIMIT 3889654, 3889654
select concat_ws('|','prokka',LOWER(genome_id), LOWER(accession),LOWER(gene),LOWER(protein_id),LOWER(product),length_na,length_aa,start,stop) as file3 from PROKKA_meta.orf limit 7779308, 3889654
select concat_ws('|','prokka',LOWER(genome_id), LOWER(accession),LOWER(gene),LOWER(protein_id),LOWER(product),length_na,length_aa,start,stop) as file4 from PROKKA_meta.orf limit 11668962, 3889654
select concat_ws('|','prokka',LOWER(genome_id), LOWER(accession),LOWER(gene),LOWER(protein_id),LOWER(product),length_na,length_aa,start,stop) as file5 from PROKKA_meta.orf limit 15558616, 3889654


14382256 /5 == 2876452
select concat_ws('|','ncbi',LOWER(genome_id), LOWER(accession),LOWER(gene),LOWER(protein_id),LOWER(product),length_na,length_aa,start,stop) as file1 from NCBI_meta.orf limit 2876452
select concat_ws('|','ncbi',LOWER(genome_id), LOWER(accession),LOWER(gene),LOWER(protein_id),LOWER(product),length_na,length_aa,start,stop) as file2 from NCBI_meta.orf LIMIT 2876452, 2876452
select concat_ws('|','ncbi',LOWER(genome_id), LOWER(accession),LOWER(gene),LOWER(protein_id),LOWER(product),length_na,length_aa,start,stop) as file3 from NCBI_meta.orf LIMIT 5752904, 2876452
select concat_ws('|','ncbi',LOWER(genome_id), LOWER(accession),LOWER(gene),LOWER(protein_id),LOWER(product),length_na,length_aa,start,stop) as file4 from NCBI_meta.orf LIMIT 8629356, 2876452
select concat_ws('|','ncbi',LOWER(genome_id), LOWER(accession),LOWER(gene),LOWER(protein_id),LOWER(product),length_na,length_aa,start,stop) as file5 from NCBI_meta.orf LIMIT 11505808, 2876452