#!/usr/bin/perl
#
#	Various JavaScript and other source language compressors

return 1;

sub compressJS {
	my (@records) = @_;
	my (@compressed, $blockComment);
	$blockComment = 0;
	foreach my $line (@records) {
		if ($line !~ /^\s*$/ && $line !~ /^\s*\/\//) {
			$line =~ s/^\s+//;
			if (!$blockComment && $line =~ /^\/\*/) {
				$blockComment = 1;
			} elsif ($blockComment && $line =~ /^\*\//) {
				$blockComment = 0;
			} elsif (!$blockComment) {
				push @compressed, $line;
			}
			if ($blockComment && $line =~ /\*\/$/) {
				$blockComment = 0;
			}
		}
	}
	return @compressed;
}
