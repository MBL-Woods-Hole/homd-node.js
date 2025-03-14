#!/usr/bin/perl
use strict;
use Data::Dumper;

#The last executive program for low balance cluster server of the 16S rRNA blasting
#Extract top four matches from individual blast result, calcualte the alternative identify 
#and mismatches and finally compile to a single file.


#Provide the path first (the session id)
#my $root="/mnt/LV1/oral16S6_tmp";
#my $root="/home/ubuntu/homd/blast-upload";
my $root="/Users/avoorhis/programming/blast_upload";
my $sessionID=$ARGV[0];
my $seqfile=$ARGV[1];

my $sort_by=$ARGV[2];


$sessionID=~s/[\s|\n|\t]//g;
my $fld=$root."/".$sessionID;
my $resultfld=$fld."/blast_results";
#my $allfld=$resultfld."/all";
#my $blastfld=$resultfld."/blast";
my $parsedfld=$fld."/parsed_blast_results";

open(IN,"$resultfld/$seqfile")||die;


#open (PARSE,">$fld/parsed_id")||die;
#open (OUT,">$fld/parse_blast.out")||die;
#chdir $resultfld;
#       open (IN, $eas)||die;
my $store;
while(my $line=<IN>){
        $store.=$line;
}
close IN;
my $return=parse_blast($store);
#print PARSE $eas."\n";
#system("echo $seqfile >> $fld/parsed_id");
open(OUT,">$parsedfld/$seqfile")||die;
print OUT $return;
close OUT;

#system("touch $fld/compile");

#close PARSE;

################################################################################
################################################################################
sub parse_blast{ #For each blast result
    #my $eas=shift;
    my $store=shift;
    my $return;
    my %idx_line;
    my %idx_sort;
    my ($qid, $qsize, @aligns, $nothit);
    if($store=~/No\shits\sfound/si){#no blastn hits
        $store=~/Query= (\S+).*\((\d*?) letters\)/s;
        ($qid, $qsize)=($1, $2);
        $nothit="No hits found";
        return $qid."\t".$qsize."\t".$nothit."\n";
        #return;
    }else{#Containing the match results
        $store=~/Query=\s(.*)\n.*\((\d*?) letters\).+?(>.*)\n\n\s*Database\:.*$/s;
        ($qid, $qsize)=($1, $2);
        #@aligns=split("\n\n\n", $3);#$3: the alignment sequnce
        @aligns=split(">", $3);#$3: the alignment sequnce
    }
    #print Dumper @aligns;exit;
    
    my $count=0;
    foreach my $eachm (@aligns){#each fragment
        next if(!$eachm);
        $count++;
        last if ($count>20);
        my @fragment=split("\n\n\n", $eachm);   
        #print Dumper @fragment;exit;
        ###############################################################################################
        my ($qseq, $sseq, $sid, $ssize, $score, $expect, $ident1, $ident2, $per, $st1, $st2, $qsta,$qstp,$ssta,$sstp);
        my ($fqseq, $fsseq, $fsid, $fssize, $fscore, $fexpect, $fident1, $fident2, $fper, $fst1, $fst2, $fqsta, $fqstp, $fssta, $fsstp);
        foreach my $eachf(@fragment){ 
            my @tmp=split("\n\n",$eachf);
            #print Dumper @tmp;exit;
            my $tmp1= shift @tmp;
            my $fragment;
            if ($tmp1=~/^(.*)\n.+Length = (\d+)/s){
                ($qseq, $sseq, $sid, $ssize, $score, $expect, $ident1, $ident2, $per, $st1, $st2, $qsta, $qstp, $ssta, $sstp)="";
                ($sid, $ssize)=($1, $2);
                $sid=~s/\n\s+/ /sg;
                $sid=~s/\n//gi;
                $tmp1= shift @tmp;
            }else{#Deal with fragments
                $fragment=1;
                ($fqseq, $fsseq, $fsid, $fssize, $fscore, $fexpect, $fident1, $fident2, $fper, $fst1, $fst2, $fqsta, $fqstp, $fssta, $fsstp)="";
                ($fqseq, $fsseq, $fsid, $fssize, $fscore, $fexpect, $fident1, $fident2, $fper, $fst1, $fst2, $fqsta, $fqstp, $fssta, $fsstp)=($qseq, $sseq, $sid, $ssize, $score, $expect, $ident1, $ident2, $per, $st1, $st2, $qsta, $qstp, $ssta, $sstp);
                ($qseq, $sseq, $score, $expect, $ident1, $ident2, $per, $st1, $st2, $qsta, $qstp, $ssta, $sstp)="";
            }
            $tmp1=~/Score = +([\S]+).*Expect = +([\S]+).*Identities = +(\d+)\/(\d+) \((\d+)\%\).*Strand = (\w+) \/ (\w+)/s;
            ($score, $expect, $ident1, $ident2, $per, $st1, $st2)=($1, $2, $3, $4, $5, $6, $7);
            $per=sprintf("%.3f",($ident1/$ident2))*100;
            
            foreach my $line (@tmp){
                my @each=split("\n", $line);
                shift @each;
                my @q=split(" ",$each[0]);
                my @s=split(" ",$each[2]);
                $qseq.=$q[2];
                $sseq.=$s[2];
                $qsta=$q[1] if (!$qsta);
                $ssta=$s[1] if (!$ssta);
                $qstp=$q[3];
                $sstp=$s[3];
            }
            
            if ($fragment){
                my $discard;
                #if fragments are on different strands, keep only largest one
                if($fst2 ne $st2){
                    if ($fident2>=$ident2){#the previous fragment larger than the current fragment, then the current data will be replaced
                        ($qseq, $sseq, $sid, $ssize, $score, $expect, $ident1, $ident2, $per, $st1, $st2, $qsta, $qstp, $ssta, $sstp) = ($fqseq, $fsseq, $fsid, $fssize, $fscore, $fexpect, $fident1, $fident2, $fper, $fst1, $fst2, $fqsta, $fqstp, $fssta, $fsstp);
                    }
                    $discard=1;
                }else{#match in the same strand
                    #make sure a shorer alignment isn't inside of a longer one; check only subject is enough
                    if ($fident2>=$ident2){
                        if ($st2 eq "Plus"){
                            $discard=1 if ($qsta>=$fqsta && $qsta<=$fsstp && $sstp>=$fqsta && $sstp<=$fsstp);
                        }else{
                            $discard=1 if ($qsta<=$fqsta && $qsta>=$fsstp && $sstp<=$fqsta && $sstp>=$fsstp);
                        }
                    }else{
                        if ($st2 eq "Plus"){
                            $discard=1 if ($fqsta>=$qsta && $fqsta<=$sstp && $fsstp>=$qsta && $fsstp<=$sstp);
                        }else{
                            $discard=1 if ($fqsta<=$qsta && $fqsta>=$sstp && $fsstp<=$qsta && $fsstp>=$sstp);
                        }
                    }
                    ($qseq, $sseq, $sid, $ssize, $score, $expect, $ident1, $ident2, $per, $st1, $st2, $qsta, $qstp, $ssta, $sstp) = ($fqseq, $fsseq, $fsid, $fssize, $fscore, $fexpect, $fident1, $fident2, $fper, $fst1, $fst2, $fqsta, $fqstp, $fssta, $fsstp) if ($discard);
                    
                    if (!$discard){
                        ($qsta, $qstp, $ssta, $sstp)=($fqsta, $fqstp, $fssta, $fsstp) if ($fident2>=$ident2);#Keep the largest fragment coordination
                        $score+=$fscore;
                        $ident1+=$fident1;
                        $ident2+=$fident2;
                        $per=sprintf("%.3f",($ident1/$ident2))*100;
                        $qseq.=$fqseq;
                        $sseq.=$fsseq;
                    }
                }
            }
        }
        
        # removing non-IAUPC and gaps in aligment region
        my $qlen=length($qseq);
        my $slen=length($sseq);
        my @qArray=split("", $qseq);
        my @sArray=split("", $sseq);
        my $len=$qlen;
        next if ($qlen != $slen);#Wrong alignment length between query and subject for $eas
        my $p_iden1=$ident1;
        
        for (my $i=0; $i<$qlen; $i++){
            if ($qArray[$i] eq "-" || $sArray[$i] eq "-" ){
                $len--;
            }elsif($qArray[$i]=~/[^ATCGUatcgu]/ && $sArray[$i]=~/[^ATCGUatcgu]/ && $qArray[$i] eq $sArray[$i]){#match between non-ACGT symbols
                #$len--;
                #$p_iden1--;
            }elsif($qArray[$i]=~/[^ATCGUatcgu]/ || $sArray[$i]=~/[^ATCGUatcgu]/){
                $len--;
            }
        }
        my $p_iden2=$len;
        my $p_per=sprintf("%.3f",($p_iden1/$p_iden2))*100;
        
#       $return.= $qid."\t".$qsize."\t".$sid."\t".$ssize."\t".$score."\t".$expect."\t".$ident1."\t".$ident2."\t".$per."\t".$p_iden1."\t".$p_iden2."\t".$p_per."\t".$st1."\t".$st2."\t".$qsta."\t".$qstp."\t".$ssta."\t".$sstp."\n";
        $idx_line{$count}= $qid."\t".$qsize."\t".$sid."\t".$ssize."\t".$score."\t".$expect."\t".$ident1."\t".$ident2."\t".$per."\t".$p_iden1."\t".$p_iden2."\t".$p_per."\t".$st1."\t".$st2."\t".$qsta."\t".$qstp."\t".$ssta."\t".$sstp."\n";
        my $sort=($sort_by eq "P")?$per:$score;
        $idx_sort{$count}=$sort;
    }
    foreach my $idx(sort{$idx_sort{$b}<=>$idx_sort{$a}}keys %idx_sort){
        $return.=$idx_line{$idx};
    }

    return $return;
}

