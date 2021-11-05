-- MySQL dump 10.13  Distrib 5.6.37, for macos10.12 (x86_64)
--
-- Host: localhost    Database: genome
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
-- Table structure for table `GC_count`
--

DROP TABLE IF EXISTS `GC_count`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `GC_count` (
  `id` int(6) NOT NULL DEFAULT '0',
  `contig` int(6) NOT NULL DEFAULT '0',
  `start` int(11) NOT NULL DEFAULT '0',
  `stop` int(11) NOT NULL DEFAULT '0',
  `GC_percentage` float NOT NULL DEFAULT '0',
  KEY `contig` (`contig`),
  KEY `start` (`start`),
  KEY `stop` (`stop`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ORF_seq`
--

DROP TABLE IF EXISTS `ORF_seq`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ORF_seq` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mol_id` int(11) NOT NULL DEFAULT '0',
  `length` int(11) NOT NULL DEFAULT '0',
  `gene` varchar(20) DEFAULT '0',
  `synonym` varchar(20) DEFAULT NULL,
  `PID` varchar(20) DEFAULT NULL,
  `code` varchar(20) DEFAULT NULL,
  `COD` varchar(20) DEFAULT NULL,
  `product` tinytext,
  `start` int(11) NOT NULL DEFAULT '0',
  `stop` int(11) NOT NULL DEFAULT '0',
  `seq_na` text,
  `seq_aa` text,
  PRIMARY KEY (`id`),
  KEY `id` (`id`),
  KEY `PID` (`PID`),
  KEY `start` (`start`),
  KEY `stop` (`stop`)
) ENGINE=MyISAM AUTO_INCREMENT=3859 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `genome_seq`
--

DROP TABLE IF EXISTS `genome_seq`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `genome_seq` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `molecule_id` int(11) NOT NULL DEFAULT '0',
  `mol_order` int(11) NOT NULL DEFAULT '0',
  `seq` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=4341 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `molecules`
--

DROP TABLE IF EXISTS `molecules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `molecules` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `accession` varchar(30) NOT NULL DEFAULT '',
  `name` tinytext NOT NULL,
  `bps` int(11) NOT NULL DEFAULT '0',
  `GC` float NOT NULL,
  `date` date NOT NULL DEFAULT '0000-00-00',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=20 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `rnt`
--

DROP TABLE IF EXISTS `rnt`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `rnt` (
  `id` int(11) NOT NULL,
  `mod_id` tinyint(4) NOT NULL,
  `start` int(11) NOT NULL,
  `stop` int(11) NOT NULL,
  `length` int(11) NOT NULL,
  `PID` varchar(20) DEFAULT NULL,
  `gene` varchar(20) DEFAULT NULL,
  `synonym` varchar(20) DEFAULT NULL,
  `code` varchar(20) DEFAULT NULL,
  `COD` varchar(20) DEFAULT NULL,
  `product` tinytext
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2021-11-05  5:48:50
