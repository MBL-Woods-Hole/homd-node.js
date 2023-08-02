#!/usr/bin/perl

use strict;
use warnings;

my %hsh=();

open (MYFILE, 'leaflabels.lst');
open (MYFILE2, 'tree.svg');
# while( my $line = <$info>)  {   
#     print $line;    
#     last if $. == 2;
# }

while (<MYFILE>) {
  chomp $_;
  my @arr = split/\t/;
 
  #print $arr[1];
  #print $arr[1]
  $hsh{$arr[0]} = $arr[1];
}
# foreach my $key (keys %hsh)
# {
#   print $key   . "\n";
# }
my $flag;
while(<MYFILE2>)
{
$flag=0;
my $line=$_;
foreach my $key (keys %hsh)
{
   if($line=~/$key/)
   {
    $flag=1; 
    $line=~s/$key/$hsh{$key}/g;
    print $line;
   }
}
  if($flag!=1)
  {
  print $line;
  $flag=0;
  }
}
close(MYFILE);
# close(MYFILE2);
