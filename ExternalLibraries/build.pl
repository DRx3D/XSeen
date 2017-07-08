#!/usr/bin/perl
#
#	Build file for JavaScript programs.
#	Takes no inputs and
#	outputs a merged JavaScript file containing the contents of the listed files
#

#	Only .js files are built
#
use strict;
use File::Basename;

my $dirname = dirname(__FILE__);
chdir ($dirname);

# Specify parameters. 
#	The input files are listed to ensure order is correct. 
#	Turns out that all files at top directory level are independent of each other
#	The @inputDirectories array ensures order dependency
#	Only *.js files in the listed directories are processed.
#
my $releaseDirectory = './';
#my @inputFiles = ('jquery-3.2.1.min.js', 'three.js', 'Tween.js');
my @inputFiles = ();
my @inputDirectories = ('.', 'THREE');
my $outputFilename = 'XSeenExternals';
my @filesInLibrary = ();
my $noOutput = 0;

my (@files, @output, @preamble);

foreach my $file (@inputFiles) {
	open (FILE, "<$file") or die "Unable to open $file\n$!\n";
	print STDERR "Reading $file\n";
	while (<FILE>) {
		chomp;
		push @output, $_;
	}
	close FILE;
	push @filesInLibrary, $file;
}
foreach my $dir (@inputDirectories) {
	opendir (DIR, "$dir") or die "Unable to open $dir\n$!\n";
	@files = grep /.*\.js$/, readdir DIR;
	closedir DIR;
	foreach my $file (@files) {
		open (FILE, "<$dir/$file") or die "Unable to open $dir/$file\n$!\n";
		print STDERR "Reading $dir/$file\n";
		push @output, "// File: $dir/$file";
		while (<FILE>) {
			chomp;
			push @output, $_;
		}
		close FILE;
		push @filesInLibrary, $file;
	}
}

# --> Compress the JS (in @output)
#my @compressed = compressJS(@output);

print "\n";
if ($noOutput) {
	print STDERR "Not creating output file: $outputFilename\n";
	exit;
}
open (FILE, ">$releaseDirectory$outputFilename.js") or die "Unable to open $releaseDirectory$outputFilename.js\n$!\n";
binmode FILE;
print "Writing $releaseDirectory$outputFilename.js\n";
print FILE "/*\n * XSeen support libraries.\n * This is a convenience build and contains the libraries listed below\n";
print FILE " * You can replace any library by including it after this file is included in your HTML.\n";
print FILE " * No claim is made on any of the included files, including (but not limited to) copyright and license.\n";
print FILE " *\n * Libraries:\n";
print FILE " *  - " . join("\n *  - ", @filesInLibrary) . "\n";
print FILE " */\n";
print FILE join("\n", @output);
close FILE;

exit;

sub getVersion {
	my ($file) = @_;
	open (FILE, "<$file") or die "Unable to open $file\n$!\n";
	my $foundVersion = 0;
	my @parts;
	my (%version, $name, $value);
	while (<FILE>) {
		if (/\s*var/) {
			$foundVersion = 1;
		}
		if ($foundVersion) {
			if (/^\/\//) {
				$foundVersion = 0;
			} elsif (/^\s*Major/ || /^\s*Minor/ || /^\s*Patch/ || /^\s*PreRelease/ || /^\s*Release/ || /^\s*Date/) {
				chomp;
				($name,$value,@parts) = split('=');
				$name =~ s/^\s+|\s+$//g;
				$value = (split(';', $value))[0];
				$value =~ s/^\s+|\s+$//g;
				$value =~ tr/'//d;
				$version{$name} = $value;
			}
		}
	}
	my $cmd = 'git rev-parse --short HEAD';
	my $gitHead = `$cmd`;
	chomp $gitHead;
	$version{'id'} = sprintf ("%d.%d.%d", $version{Major}, $version{Minor}, $version{Patch});
	$version{'id'} .= ($version{PreRelease} ne '') ? '-'.$version{PreRelease} : '';
	$version{'id'} .= '+' . $version{Release} . '_' . $gitHead;
	return %version;
}

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
		}
	}
	return @compressed;
}
