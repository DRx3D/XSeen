#!/usr/bin/perl
#
#	Build file for JavaScript programs.
#	Takes as input (implied) order.asy and creates 
#	an output in the Release directory called XSeen.js
#

use strict;
my $input = 'order.asy';
my $output = '../Release/XSeen.js';
open (ORDER, "<$input") or die "Unable to open '$input'\n$!\n";
open (OUTPUT, ">$output") or die "Unable to open '$output'\n$!\n";

while (<ORDER>) {
	if (!(/^#/)) {			# Not comment
		chomp;
		if ($_ ne '') {		# Not blank
			open (FILE, "<$_") or die "Unable to open source '$_'\n$!";
			while (<FILE>) {
				print OUTPUT $_;
			}
			close FILE;
		}
	}
}

close OUTPUT;
close ORDER;
exit;
