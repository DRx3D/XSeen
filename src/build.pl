#!/usr/bin/perl
#
#	Build file for JavaScript programs.
#	Takes as input (implied) order.asy and creates 
#	an output in the Release directory called XSeen.js
#

#	Only .js files are built
#	Source files are built in alphabetical order from directory order in @directoryOrder
#	The version information is extracted from the file $versionFile by looking for the string 'xseen.versionInfo'
#		It is assumed that this string defines an object with the fields: 'major', 'minor', 'revision', and 'date'
use strict;
my @directoryOrder = ('utils', 'init', '.', 'nodes');
my $versionFile = 'init/Internals.js';
my $releaseDirectory = '../Release/';
my $preambleFile = '../LICENSE';
my $outputFilename = 'XSeen';
my $version = getVersion ($versionFile);
my @releaseFile = ($outputFilename . '.' . $version, $outputFilename);

my (@files, @output, @preamble);
open (FILE, "<$preambleFile") or die "Unable to open $preambleFile\n$!\n";
print "Reading $preambleFile\n";
push @preamble, ("/*", " *  XSeen V$version", " *  Built " . localtime(), " *\n");
while (<FILE>) {
	chomp;
	push @preamble, $_;
}
close FILE;
push @preamble, " */\n";

foreach my $dir (@directoryOrder) {
	opendir (DIR, "$dir") or die "Unable to open $dir\n$!\n";
	@files = grep /.*\.js$/, readdir DIR;
	closedir DIR;
	foreach my $file (@files) {
		open (FILE, "<$dir/$file") or die "Unable to open $dir/$file\n$!\n";
		print "Reading $dir/$file\n";
		push @output, "// File: $dir/$file";
		while (<FILE>) {
			chomp;
			push @output, $_;
		}
		close FILE;
	}
}

# --> Compress the JS (in @output)
my @compressed = compressJS(@output);

print "\n";
foreach my $outFile (@releaseFile) {
	open (FILE, ">$releaseDirectory$outFile.js") or die "Unable to open $releaseDirectory$outFile.js\n$!\n";
	binmode FILE;
	print "Writing $releaseDirectory$outFile.js\n";
	print FILE join("\n", @preamble);
	print FILE join("\n", @output);
	close FILE;
	open (FILE, ">$releaseDirectory$outFile.min.js") or die "Unable to open $releaseDirectory$outFile.min.js\n$!\n";
	binmode FILE;
	print "Writing $releaseDirectory$outFile.min.js\n";
	print FILE join("\n", @preamble);
	print FILE join("\n", @compressed);
	close FILE;
}

exit;

sub getVersion {
	my ($file) = @_;
	open (FILE, "<$file") or die "Unable to open $file\n$!\n";
	my $foundVersion = 0;
	my @parts;
	my (%version, $name, $value);
	while (<FILE>) {
		if (/xseen.versionInfo/) {
			$foundVersion = 1;
		}
		if ($foundVersion) {
			if (/\};/) {
				$foundVersion = 0;
			} elsif (/major/ || /minor/ || /revision/ || /date/) {
				chomp;
				($name,$value,@parts) = split(':');
				$name =~ s/^\s+|\s+$//g;
				$value = (split(',', $value))[0];
				$version{$name} = $value;
			}
		}
	}
	my $version = sprintf ("%d.%d.%d", $version{major}, $version{minor}, $version{revision});
	return $version;
}

sub compressJS {
	my (@records) = @_;
	my @compressed;
	foreach my $line (@records) {
		if ($line !~ /^\s*$/ && $line !~ /^\s*\/\//) {
			$line =~ s/^\s+//;
			push @compressed, $line;
		}
	}
	return @compressed;
}
