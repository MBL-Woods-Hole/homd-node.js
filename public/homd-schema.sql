-- MySQL dump 10.13  Distrib 5.6.37, for macos10.12 (x86_64)
--
-- Host: localhost    Database: homd
-- ------------------------------------------------------
-- Server version	5.6.37

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `domain`
--

DROP TABLE IF EXISTS `domain`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `domain` (
  `domain_id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `domain` varchar(300) NOT NULL DEFAULT '',
  PRIMARY KEY (`domain_id`),
  UNIQUE KEY `domain` (`domain`)
) ENGINE=InnoDB AUTO_INCREMENT=2844 DEFAULT CHARSET=latin1 COMMENT='select domain,phylum,klass,`order`,family,genus,species from taxonomy\n	JOIN domain using(domain_id)\n	JOIN phylum using(phylum_id)\n	JOIN klass using (klass_id)\n	JOIN `order` using(order_id)\n	JOIN family using(family_id)\n	JOIN genus using (genus_id)\n	JOIN species using (species_id)\n	WHERE oral_taxon_id = ''500''';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `extra_flat_info`
--

DROP TABLE IF EXISTS `extra_flat_info`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `extra_flat_info` (
  `flat_info_id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `otid` int(11) unsigned NOT NULL,
  `NCBI_pubmed_search_count` varchar(10) NOT NULL DEFAULT '0',
  `NCBI_nucleotide_search_count` varchar(10) NOT NULL DEFAULT '0',
  `NCBI_protein_search_count` varchar(10) NOT NULL DEFAULT '0',
  `NCBI_genome_search_count` varchar(10) NOT NULL DEFAULT '0',
  `NCBI_taxonomy_search_count` varchar(10) NOT NULL DEFAULT '0',
  `NCBI_gene_search_count` varchar(10) NOT NULL DEFAULT '0',
  `NCBI_genomeP_search_count` varchar(10) NOT NULL DEFAULT '0',
  `create_info` text NOT NULL,
  `update_date` datetime NOT NULL,
  `Curator` varchar(50) NOT NULL DEFAULT '',
  `modifier` varchar(10) NOT NULL DEFAULT '',
  PRIMARY KEY (`flat_info_id`),
  UNIQUE KEY `otid` (`otid`),
  KEY `otid_flat_info_id_ibfk_3` (`otid`),
  CONSTRAINT `otid_flat_info_id_ibfk_3` FOREIGN KEY (`otid`) REFERENCES `otid_prime` (`otid`)
) ENGINE=InnoDB AUTO_INCREMENT=11041 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `family`
--

DROP TABLE IF EXISTS `family`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `family` (
  `family_id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `family` varchar(300) NOT NULL DEFAULT '',
  PRIMARY KEY (`family_id`),
  UNIQUE KEY `family` (`family`)
) ENGINE=InnoDB AUTO_INCREMENT=2990 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `genomes`
--

DROP TABLE IF EXISTS `genomes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `genomes` (
  `seq_id` varchar(12) NOT NULL,
  `otid` int(11) unsigned DEFAULT NULL,
  `genus_id` int(8) unsigned NOT NULL,
  `species_id` int(8) unsigned NOT NULL,
  `culture_collection` varchar(50) DEFAULT NULL,
  `status` varchar(25) NOT NULL,
  `sequence_center` varchar(256) DEFAULT NULL,
  `number_contig` int(8) DEFAULT NULL COMMENT 'the latest version',
  `combined_length` int(15) DEFAULT NULL COMMENT 'the latest version',
  `flag` int(3) unsigned NOT NULL COMMENT 'indexed',
  `oral_pathogen` tinyint(1) DEFAULT NULL COMMENT '"0" means oral bacteria. "1" means oral pathogen.',
  PRIMARY KEY (`seq_id`),
  UNIQUE KEY `seq_id` (`seq_id`,`otid`),
  KEY `culture_collection` (`culture_collection`),
  KEY `genome_ibfk_1` (`genus_id`),
  KEY `genome_ibfk_2` (`species_id`),
  KEY `genome_ibfk_3` (`flag`),
  KEY `seq_genome_ibfk_1` (`otid`),
  CONSTRAINT `genome_ibfk_1` FOREIGN KEY (`genus_id`) REFERENCES `genus` (`genus_id`) ON UPDATE CASCADE,
  CONSTRAINT `genome_ibfk_2` FOREIGN KEY (`species_id`) REFERENCES `species` (`species_id`) ON UPDATE CASCADE,
  CONSTRAINT `seq_genome_ibfk_1` FOREIGN KEY (`otid`) REFERENCES `otid_prime` (`otid`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Flags:\n11 — Annotated at HOMD with NCBI Annotation\n12 -- Annotated at HOMD without NCBI Annotation\n21 -- Genomes with NCBI annotation\n91  - is for those NonOralRef genomes';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `genomes_extra`
--

DROP TABLE IF EXISTS `genomes_extra`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `genomes_extra` (
  `seq_id` varchar(11) NOT NULL,
  `isolate_origin` text NOT NULL,
  `ncbi_id` varchar(30) NOT NULL DEFAULT '',
  `ncbi_taxon_id` varchar(10) NOT NULL DEFAULT '',
  `goldstamp_id` varchar(20) NOT NULL DEFAULT '',
  `genbank_acc` varchar(100) NOT NULL DEFAULT '',
  `cmr_id` varchar(10) NOT NULL DEFAULT '',
  `gc` varchar(5) NOT NULL DEFAULT '',
  `gc_comment` text NOT NULL,
  `atcc_medium_number` varchar(25) NOT NULL DEFAULT '',
  `non_atcc_medium` varchar(25) NOT NULL DEFAULT '',
  `16s_rrna` text NOT NULL,
  `16s_rrna_comment` text NOT NULL,
  `type_strain` varchar(10) NOT NULL DEFAULT '',
  `oral` varchar(80) NOT NULL DEFAULT '',
  `number_of_clones_6_06` varchar(10) NOT NULL DEFAULT '',
  `air_or_anerobe` varchar(10) NOT NULL DEFAULT '',
  `shape` varchar(20) NOT NULL DEFAULT '',
  `gram_stain` varchar(10) NOT NULL DEFAULT '',
  `atcc_list_1` varchar(14) NOT NULL DEFAULT '',
  `other_internal_names` text NOT NULL,
  `flag_explanation` varchar(50) NOT NULL DEFAULT '',
  `ncbi_nucleotide_Entries_7_06` varchar(7) NOT NULL DEFAULT '',
  `biochemistry` text NOT NULL,
  `dna_molecular_Summary` text NOT NULL,
  `orf_annotation_Summary` text NOT NULL,
  `Unnamed_Field4` text NOT NULL,
  `Unnamed_Field5` text NOT NULL,
  PRIMARY KEY (`seq_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `genus`
--

DROP TABLE IF EXISTS `genus`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `genus` (
  `genus_id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `genus` varchar(300) NOT NULL DEFAULT '',
  PRIMARY KEY (`genus_id`),
  UNIQUE KEY `genus` (`genus`)
) ENGINE=InnoDB AUTO_INCREMENT=3130 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `image_name`
--

DROP TABLE IF EXISTS `image_name`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `image_name` (
  `image_name_id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `otid` int(11) unsigned NOT NULL,
  `image_name` varchar(100) NOT NULL DEFAULT '',
  PRIMARY KEY (`image_name_id`),
  UNIQUE KEY `otid` (`otid`,`image_name`),
  CONSTRAINT `image_name_ibfk_1` FOREIGN KEY (`otid`) REFERENCES `otid_prime` (`otid`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `klass`
--

DROP TABLE IF EXISTS `klass`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `klass` (
  `klass_id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `klass` varchar(300) NOT NULL DEFAULT '',
  PRIMARY KEY (`klass_id`),
  UNIQUE KEY `klass` (`klass`)
) ENGINE=InnoDB AUTO_INCREMENT=2990 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `order`
--

DROP TABLE IF EXISTS `order`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `order` (
  `order_id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `order` varchar(300) NOT NULL DEFAULT '',
  PRIMARY KEY (`order_id`),
  UNIQUE KEY `order` (`order`)
) ENGINE=InnoDB AUTO_INCREMENT=2990 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `otid_prime`
--

DROP TABLE IF EXISTS `otid_prime`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `otid_prime` (
  `otid` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `otid_name` varchar(20) NOT NULL DEFAULT '',
  `taxonomy_id` int(8) unsigned NOT NULL,
  `warning` int(8) NOT NULL DEFAULT '0',
  `ncbi_taxon_id` int(11) NOT NULL,
  `status` varchar(10) NOT NULL DEFAULT '',
  PRIMARY KEY (`otid`),
  KEY `otid_taxonomy_fk` (`taxonomy_id`),
  CONSTRAINT `otid_taxonomy_fk` FOREIGN KEY (`taxonomy_id`) REFERENCES `taxonomy` (`taxonomy_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1000 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `phage_data`
--

DROP TABLE IF EXISTS `phage_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `phage_data` (
  `phage_data_id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `phage_id` varchar(11) NOT NULL DEFAULT '',
  `Assembly_NCBI` varchar(50) NOT NULL DEFAULT '',
  `SRA_Accession_NCBI` varchar(100) NOT NULL DEFAULT '',
  `Submitters_NCBI` text NOT NULL,
  `Release_Date_NCBI` varchar(50) NOT NULL DEFAULT '',
  `Family_NCBI` varchar(50) NOT NULL DEFAULT '',
  `Genus_NCBI` varchar(50) NOT NULL DEFAULT '',
  `Species_NCBI` varchar(100) NOT NULL DEFAULT '',
  `Molecule_type_NCBI` varchar(50) NOT NULL DEFAULT '',
  `Sequence_Type_NCBI` varchar(50) NOT NULL DEFAULT '',
  `Genotype_NCBI` varchar(5) NOT NULL DEFAULT '',
  `Publications_NCBI` varchar(5) NOT NULL DEFAULT '',
  `Geo_Location_NCBI` varchar(100) NOT NULL DEFAULT '',
  `USA_NCBI` varchar(10) NOT NULL DEFAULT '',
  `Host_NCBI` varchar(100) NOT NULL DEFAULT '',
  `Isolation_Source_NCBI` varchar(100) NOT NULL DEFAULT '',
  `Collection_Date_NCBI` varchar(100) NOT NULL DEFAULT '',
  `BioSample_NCBI` varchar(20) NOT NULL DEFAULT '',
  `GenBank_Title_NCBI` varchar(100) NOT NULL DEFAULT '',
  PRIMARY KEY (`phage_data_id`),
  UNIQUE KEY `Assembly_NCBI` (`Assembly_NCBI`),
  UNIQUE KEY `phage_id` (`phage_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1164 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `phylum`
--

DROP TABLE IF EXISTS `phylum`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `phylum` (
  `phylum_id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `phylum` varchar(300) NOT NULL DEFAULT '',
  PRIMARY KEY (`phylum_id`),
  UNIQUE KEY `phylum` (`phylum`)
) ENGINE=InnoDB AUTO_INCREMENT=2990 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ref_strain`
--

DROP TABLE IF EXISTS `ref_strain`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ref_strain` (
  `reference_strain_id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `otid` int(11) unsigned NOT NULL,
  `reference_strain` varchar(100) NOT NULL,
  PRIMARY KEY (`reference_strain_id`),
  UNIQUE KEY `otid` (`otid`,`reference_strain`),
  CONSTRAINT `otid_ref_strain_fk3` FOREIGN KEY (`otid`) REFERENCES `otid_prime` (`otid`)
) ENGINE=InnoDB AUTO_INCREMENT=4496 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `reference`
--

DROP TABLE IF EXISTS `reference`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `reference` (
  `reference_id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `otid` int(11) unsigned NOT NULL,
  `pubmed_id` int(15) NOT NULL,
  `journal` varchar(150) NOT NULL,
  `authors` varchar(200) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `title` varchar(200) NOT NULL,
  `auto_id` varchar(10) NOT NULL,
  PRIMARY KEY (`reference_id`),
  UNIQUE KEY `otid` (`otid`,`auto_id`),
  KEY `otid_reference_ibfk_3` (`otid`),
  CONSTRAINT `otid_reference_ibfk_3` FOREIGN KEY (`otid`) REFERENCES `otid_prime` (`otid`)
) ENGINE=InnoDB AUTO_INCREMENT=1011 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `rrna_sequence`
--

DROP TABLE IF EXISTS `rrna_sequence`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `rrna_sequence` (
  `rrna_sequence_id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `otid` int(11) unsigned NOT NULL,
  `rrna_sequence` varchar(100) NOT NULL DEFAULT '',
  PRIMARY KEY (`rrna_sequence_id`),
  UNIQUE KEY `otid` (`otid`,`rrna_sequence`),
  CONSTRAINT `otid_rRNA_sequence_fk3` FOREIGN KEY (`otid`) REFERENCES `otid_prime` (`otid`)
) ENGINE=InnoDB AUTO_INCREMENT=31084 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `site`
--

DROP TABLE IF EXISTS `site`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `site` (
  `site_id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `otid` int(11) unsigned NOT NULL,
  `site` varchar(20) DEFAULT '',
  PRIMARY KEY (`site_id`),
  UNIQUE KEY `otid` (`otid`,`site`),
  CONSTRAINT `otid_fk3` FOREIGN KEY (`otid`) REFERENCES `otid_prime` (`otid`)
) ENGINE=InnoDB AUTO_INCREMENT=33703 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `species`
--

DROP TABLE IF EXISTS `species`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `species` (
  `species_id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `species` varchar(255) NOT NULL DEFAULT '',
  PRIMARY KEY (`species_id`),
  UNIQUE KEY `species` (`species`)
) ENGINE=InnoDB AUTO_INCREMENT=3131 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `subspecies`
--

DROP TABLE IF EXISTS `subspecies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `subspecies` (
  `subspecies_id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `subspecies` varchar(300) NOT NULL DEFAULT '',
  PRIMARY KEY (`subspecies_id`),
  UNIQUE KEY `subspecies` (`subspecies`)
) ENGINE=InnoDB AUTO_INCREMENT=82 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `synonym`
--

DROP TABLE IF EXISTS `synonym`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `synonym` (
  `synonym_id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `otid` int(11) unsigned DEFAULT NULL,
  `synonym` varchar(100) NOT NULL DEFAULT '',
  PRIMARY KEY (`synonym_id`),
  UNIQUE KEY `otid` (`otid`,`synonym`),
  CONSTRAINT `synonyms_ibfk_1` FOREIGN KEY (`otid`) REFERENCES `otid_prime` (`otid`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1006 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `taxon_info`
--

DROP TABLE IF EXISTS `taxon_info`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `taxon_info` (
  `taxon_info_id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `otid` int(11) unsigned NOT NULL,
  `general` text NOT NULL,
  `prevalence` text NOT NULL,
  `cultivability` text NOT NULL,
  `disease_associations` text NOT NULL,
  `phenotypic_characteristics` text NOT NULL,
  PRIMARY KEY (`taxon_info_id`),
  UNIQUE KEY `otid` (`otid`),
  KEY `otid_info_ibfk_1` (`otid`),
  CONSTRAINT `taxon_info_ibfk_1` FOREIGN KEY (`otid`) REFERENCES `otid_prime` (`otid`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=169 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `taxon_refseqid`
--

DROP TABLE IF EXISTS `taxon_refseqid`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `taxon_refseqid` (
  `taxon_refseq_id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `otid` int(11) unsigned NOT NULL,
  `refseqid` varchar(20) NOT NULL,
  `seqname` varchar(50) NOT NULL,
  `strain` varchar(128) NOT NULL,
  `genbank` varchar(30) NOT NULL,
  `seq_trim9` blob NOT NULL,
  `seq_trim28` blob NOT NULL,
  `seq_aligned` blob NOT NULL,
  `seq_trim28_end` blob NOT NULL,
  `status` varchar(20) NOT NULL,
  `site` varchar(100) NOT NULL,
  `order` int(11) NOT NULL,
  `flag` varchar(100) NOT NULL,
  PRIMARY KEY (`taxon_refseq_id`),
  UNIQUE KEY `otid` (`otid`,`refseqid`),
  CONSTRAINT `otid_refseq_fk3` FOREIGN KEY (`otid`) REFERENCES `otid_prime` (`otid`)
) ENGINE=InnoDB AUTO_INCREMENT=39586 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `taxonomy`
--

DROP TABLE IF EXISTS `taxonomy`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `taxonomy` (
  `taxonomy_id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `domain_id` int(11) unsigned DEFAULT NULL,
  `phylum_id` int(11) unsigned DEFAULT NULL,
  `klass_id` int(11) unsigned DEFAULT NULL,
  `order_id` int(11) unsigned DEFAULT NULL,
  `family_id` int(11) unsigned DEFAULT NULL,
  `genus_id` int(11) unsigned NOT NULL,
  `species_id` int(11) unsigned DEFAULT NULL,
  `subspecies_id` int(11) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`taxonomy_id`),
  UNIQUE KEY `domain_id` (`domain_id`,`phylum_id`,`klass_id`,`order_id`,`family_id`,`genus_id`,`species_id`,`subspecies_id`),
  KEY `taxonomy_fk_klass_id` (`klass_id`),
  KEY `taxonomy_fk_family_id` (`family_id`),
  KEY `taxonomy_fk_genus_id` (`genus_id`),
  KEY `taxonomy_fk_order_id` (`order_id`),
  KEY `taxonomy_fk_phylum_id` (`phylum_id`),
  KEY `taxonomy_fk_species_id` (`species_id`),
  KEY `taxonomy_fk_subspecies_id` (`subspecies_id`),
  CONSTRAINT `taxonomy_fk_subspecies_id` FOREIGN KEY (`subspecies_id`) REFERENCES `subspecies` (`subspecies_id`),
  CONSTRAINT `taxonomy_ibfk_3` FOREIGN KEY (`genus_id`) REFERENCES `genus` (`genus_id`) ON UPDATE CASCADE,
  CONSTRAINT `taxonomy_ibfk_4` FOREIGN KEY (`domain_id`) REFERENCES `domain` (`domain_id`) ON UPDATE CASCADE,
  CONSTRAINT `taxonomy_ibfk_5` FOREIGN KEY (`family_id`) REFERENCES `family` (`family_id`) ON UPDATE CASCADE,
  CONSTRAINT `taxonomy_ibfk_7` FOREIGN KEY (`order_id`) REFERENCES `order` (`order_id`) ON UPDATE CASCADE,
  CONSTRAINT `taxonomy_ibfk_8` FOREIGN KEY (`phylum_id`) REFERENCES `phylum` (`phylum_id`) ON UPDATE CASCADE,
  CONSTRAINT `taxonomy_ibfk_9` FOREIGN KEY (`species_id`) REFERENCES `species` (`species_id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3112 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary table structure for view `taxonomy_view`
--

DROP TABLE IF EXISTS `taxonomy_view`;
/*!50001 DROP VIEW IF EXISTS `taxonomy_view`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `taxonomy_view` AS SELECT 
 1 AS `otid`,
 1 AS `domain`,
 1 AS `phylum`,
 1 AS `klass`,
 1 AS `order`,
 1 AS `family`,
 1 AS `genus`,
 1 AS `species`,
 1 AS `subspecies`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `type_strain`
--

DROP TABLE IF EXISTS `type_strain`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `type_strain` (
  `type_strain_id` int(8) unsigned NOT NULL AUTO_INCREMENT,
  `otid` int(11) unsigned NOT NULL,
  `type_strain` varchar(30) NOT NULL DEFAULT '',
  PRIMARY KEY (`type_strain_id`),
  UNIQUE KEY `otid` (`otid`,`type_strain`),
  CONSTRAINT `type_strain_ibfk_1` FOREIGN KEY (`otid`) REFERENCES `otid_prime` (`otid`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6643 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Final view structure for view `taxonomy_view`
--

/*!50001 DROP VIEW IF EXISTS `taxonomy_view`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = latin1 */;
/*!50001 SET character_set_results     = latin1 */;
/*!50001 SET collation_connection      = latin1_swedish_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `taxonomy_view` AS select `otid_prime`.`otid` AS `otid`,`domain`.`domain` AS `domain`,`phylum`.`phylum` AS `phylum`,`klass`.`klass` AS `klass`,`order`.`order` AS `order`,`family`.`family` AS `family`,`genus`.`genus` AS `genus`,`species`.`species` AS `species`,`subspecies`.`subspecies` AS `subspecies` from (((((((((`otid_prime` join `taxonomy` on((`otid_prime`.`taxonomy_id` = `taxonomy`.`taxonomy_id`))) join `domain` on((`taxonomy`.`domain_id` = `domain`.`domain_id`))) join `phylum` on((`taxonomy`.`phylum_id` = `phylum`.`phylum_id`))) join `klass` on((`taxonomy`.`klass_id` = `klass`.`klass_id`))) join `order` on((`taxonomy`.`order_id` = `order`.`order_id`))) join `family` on((`taxonomy`.`family_id` = `family`.`family_id`))) join `genus` on((`taxonomy`.`genus_id` = `genus`.`genus_id`))) join `species` on((`taxonomy`.`species_id` = `species`.`species_id`))) join `subspecies` on((`taxonomy`.`subspecies_id` = `subspecies`.`subspecies_id`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2021-11-05  5:48:23
