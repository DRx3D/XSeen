#!/usr/bin/perl
#
#	Build file for JavaScript programs.
#	Takes as input (implied) order.asy and creates 
#	an output in the Release directory called XSeen.js
#

#	Only .js files are built
#	Source files are built in alphabetical order from directory order in %directoryOrder
#	The version information is extracted from the file $versionFile by looking for the string 'xseen.versionInfo'
#		It is assumed that this string defines an object with the fields: 'major', 'minor', 'revision', and 'date'
use strict;
use File::Basename;
require '../sourceCompressor.pl';

my $dirname = dirname(__FILE__);
chdir ($dirname);

my %directoryOrder = (	'Full'		=> ['utils', 'init', '.', 'tags', 'nodes'],
						'Partial'	=> ['utils', '.', 'tags', 'nodes']
						);
my %directoryOrder = (	'Full'		=> ['utils', 'init', '.', 'tags'],
						'Partial'	=> ['utils', '.', 'tags']
						);
my %directoryOrder = (	'Full'		=> ['.', 'tags'],
						'Partial'	=> ['.', 'tags']
						);
my $versionFile = './XSeen.js';
my $releaseDirectory = '../Release/';
my @releaseDirectories = ('../Release/', '../../Release/');
my $preambleFile = '../LICENSE';
my $outputFilename = 'XSeen';
my %version = getVersion ($versionFile);
my $partialBuild = (substr($version{'PreRelease'}, 0, 6) eq 'alpha.') ? 'Partial' : 'Full';
my @releaseFile = (
					$outputFilename . '.' . $version{'id'}, 
					$outputFilename . '.' . $version{'version'}, 
					$outputFilename . '.' . $version{'version-mm'}, 
					$outputFilename);
my @releaseFile = (
					$outputFilename . '.' . $version{'version-mm'}, 
					$outputFilename);
my $noOutput = 0;

my (@files, @output, @preamble);
open (FILE, "<$preambleFile") or die "Unable to open $preambleFile\n$!\n";
print "Reading $preambleFile\n";
push @preamble, ("/*", " *  XSeen V".$version{'id'}, " *  Built " . localtime(), " *\n");
while (<FILE>) {
	chomp;
	push @preamble, $_;
}
close FILE;
push @preamble, " */\n";

foreach my $dir (@{$directoryOrder{$partialBuild}}) {
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
if ($noOutput) {
	print STDERR "Not creating output file: $releaseFile[0]\n";
	exit;
}
foreach my $outDir (@releaseDirectories) {
	foreach my $outFile (@releaseFile) {
		open (FILE, ">$outDir$outFile.js") or die "Unable to open $outDir$outFile.js\n$!\n";
		binmode FILE;
		print "Writing $outDir$outFile.js\n";
		print FILE join("\n", @preamble);
		print FILE join("\n", @output);
		close FILE;
		open (FILE, ">$outDir$outFile.min.js") or die "Unable to open $outDir$outFile.min.js\n$!\n";
		binmode FILE;
		print "Writing $outDir$outFile.min.js\n";
		print FILE join("\n", @preamble);
		print FILE join("\n", @compressed);
		close FILE;
	}
}

exit;

sub getVersion {
	my ($file) = @_;
	open (FILE, "<$file") or die "Unable to open $file\n$!\n";
	my $foundVersion = 0;
	my @parts;
	my (%version, $name, $value);
	while (<FILE>) {
		if (/^XSeen\.Constants/) {
			$foundVersion = 1;
		}
		if ($foundVersion) {
			if (/^\/\//) {
				$foundVersion = 0;
			} elsif (/^\s*'_Major'/ || /^\s*'_Minor'/ || /^\s*'_Patch'/ || /^\s*'_PreRelease'/ || /^\s*'_Release'/ || /^\s*'_RDate'/) {
				chomp;
				($name,$value,@parts) = split(':');
				$name =~ s/^\s+|\s+$//g;
				$name =~ tr/'_//d;
				$value = (split(',', $value))[0];
				$value =~ s/^\s+|\s+$//g;
				$value =~ tr/'//d;
				$version{$name} = $value;
			}
		}
	}
	my $cmd = 'git rev-parse --short HEAD';
	my $gitHead = `$cmd`;
	chomp $gitHead;
	$version{'version'} = sprintf ("%d.%d.%d", $version{Major}, $version{Minor}, $version{Patch});
	$version{'version-mm'} = sprintf ("%d.%d", $version{Major}, $version{Minor});
	print STDERR "Version: $version{'version'}\n";
	$version{'id'} = $version{'version'} . (($version{PreRelease} ne '') ? '-'.$version{PreRelease} : '');
	print STDERR "ID (prelim): $version{'id'}\n";
	$version{'id'} .= '+' . $version{Release} . '_' . $gitHead;
	print STDERR "ID: $version{'id'}\n";
	return %version;
}

