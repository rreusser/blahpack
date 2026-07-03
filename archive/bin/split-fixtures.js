#!/usr/bin/env node

/**
* Splits shared JSONL fixture files into per-scenario JSON files in each
* module's test/fixtures/ directory.
*
* Each line of the JSONL file becomes a separate JSON file named after
* the test case's "name" field.
*
* Usage:
*   node bin/split-fixtures.js [--dry-run] [module-path]
*   node bin/split-fixtures.js --all [--dry-run]
*/

'use strict';

var fs = require( 'fs' );
var path = require( 'path' );

var args = process.argv.slice( 2 );
var dryRun = args.includes( '--dry-run' );
var all = args.includes( '--all' );
var target = args.find( function( a ) { return a[ 0 ] !== '-'; } );

var SHARED_FIXTURES = path.join( __dirname, '..', 'test', 'fixtures' );

function findModules() {
	var results = [];
	var pkgs = [ 'blas', 'lapack' ];
	var i;
	var j;
	var pkg;
	var dir;
	var routines;
	var modDir;

	for ( i = 0; i < pkgs.length; i++ ) {
		pkg = pkgs[ i ];
		dir = path.join( 'lib', pkg, 'base' );
		if ( !fs.existsSync( dir ) ) {
			continue;
		}
		routines = fs.readdirSync( dir );
		for ( j = 0; j < routines.length; j++ ) {
			modDir = path.join( dir, routines[ j ] );
			if ( fs.existsSync( path.join( modDir, 'package.json' ) ) ) {
				results.push( modDir );
			}
		}
	}
	return results;
}

function getRoutineName( modDir ) {
	return path.basename( modDir );
}

function sanitizeName( name ) {
	// Convert test case name to a valid filename
	// Replace spaces, special chars with underscores
	return name.replace( /[^a-zA-Z0-9_-]/g, '_' ).toLowerCase();
}

function splitFixtures( modDir ) {
	var routineName = getRoutineName( modDir );
	var jsonlPath = path.join( SHARED_FIXTURES, routineName + '.jsonl' );

	if ( !fs.existsSync( jsonlPath ) ) {
		// No shared fixture for this module
		return 0;
	}

	var fixturesDir = path.join( modDir, 'test', 'fixtures' );
	var lines = fs.readFileSync( jsonlPath, 'utf8' ).trim().split( '\n' );
	var count = 0;
	var i;
	var data;
	var filename;
	var outPath;

	for ( i = 0; i < lines.length; i++ ) {
		if ( !lines[ i ].trim() ) {
			continue;
		}
		try {
			data = JSON.parse( lines[ i ] );
		} catch ( e ) {
			console.error( modDir + ': WARNING - failed to parse JSONL line ' + ( i + 1 ) );
			continue;
		}

		if ( !data.name ) {
			console.error( modDir + ': WARNING - JSONL line ' + ( i + 1 ) + ' has no "name" field' );
			filename = 'case_' + ( i + 1 );
		} else {
			filename = sanitizeName( data.name );
		}

		outPath = path.join( fixturesDir, filename + '.json' );

		if ( dryRun ) {
			if ( count === 0 ) {
				console.log( modDir + ': would create ' + lines.length + ' fixture files' );
			}
		} else {
			if ( count === 0 ) {
				// Create fixtures directory if needed
				if ( !fs.existsSync( fixturesDir ) ) {
					fs.mkdirSync( fixturesDir, { recursive: true } );
				}
			}
			// Write formatted JSON (2-space indent)
			fs.writeFileSync( outPath, JSON.stringify( data, null, '  ' ) + '\n' );
		}
		count += 1;
	}

	if ( !dryRun && count > 0 ) {
		console.log( modDir + ': created ' + count + ' fixture files' );
	}

	return count;
}

// Main
var modules;
var totalFiles = 0;
var i;

if ( all ) {
	modules = findModules();
} else if ( target ) {
	modules = [ target ];
} else {
	console.error( 'Usage: node bin/split-fixtures.js [--all] [--dry-run] [module-path]' );
	process.exit( 1 );
}

for ( i = 0; i < modules.length; i++ ) {
	totalFiles += splitFixtures( modules[ i ] );
}

console.log( '\nTotal: ' + totalFiles + ' fixture files' + ( dryRun ? ' would be' : '' ) + ' created across ' + modules.length + ' modules' );
