#!/usr/bin/env node
/**
 * Remove unused duplicate imports.
 *
 * When two `import` lines reference the same module path, one imported name
 * is actually used in the file body and one is not. This codemod removes the
 * import line whose bound name does not appear anywhere outside its own import
 * statement.
 *
 * Usage:
 *   node bin/codemod-dedup-imports.js [--dry-run] [file ...]
 *   # or pipe a list:
 *   find lib -name '*.js' | node bin/codemod-dedup-imports.js --stdin
 */

'use strict';

var fs = require( 'fs' );
var path = require( 'path' );
var readline = require( 'readline' );

var dryRun = process.argv.includes( '--dry-run' );
var fromStdin = process.argv.includes( '--stdin' );

function processFile( filePath ) {
	var src = fs.readFileSync( filePath, 'utf8' );
	var lines = src.split( '\n' );

	// Parse all import statements and group by module path.
	// Matches: import <name> from '<path>';
	var importRe = /^import\s+(\w+)\s+from\s+'([^']+)';?\s*$/;

	var byModule = Object.create( null );
	lines.forEach( function( line, idx ) {
		var m = importRe.exec( line );
		if ( !m ) return;
		var name = m[ 1 ];
		var mod = m[ 2 ];
		if ( !byModule[ mod ] ) byModule[ mod ] = [];
		byModule[ mod ].push( { name: name, lineIdx: idx } );
	} );

	// Find modules that appear more than once.
	var linesToRemove = new Set();
	var lineReplacements = Object.create( null ); // lineIdx -> replacement string
	Object.keys( byModule ).forEach( function( mod ) {
		var imports = byModule[ mod ];
		if ( imports.length < 2 ) return;

		// For each imported name, count occurrences outside its own import line.
		var usageCounts = imports.map( function( imp ) {
			var nameRe = new RegExp( '\\b' + imp.name + '\\b', 'g' );
			var count = 0;
			lines.forEach( function( line, idx ) {
				if ( idx === imp.lineIdx ) return;
				var m = line.match( nameRe );
				if ( m ) count += m.length;
			} );
			return count;
		} );

		imports.forEach( function( imp, i ) {
			if ( usageCounts[ i ] === 0 ) {
				linesToRemove.add( imp.lineIdx );
			}
		} );

		// If all names are actually used, keep the first import and replace
		// subsequent ones with a `var alias = firstName;` assignment.
		var allUsed = usageCounts.every( function( c ) { return c > 0; } );
		if ( allUsed ) {
			var firstName = imports[ 0 ].name;
			imports.slice( 1 ).forEach( function( imp ) {
				lineReplacements[ imp.lineIdx ] = 'var ' + imp.name + ' = ' + firstName + ';';
			} );
		}
	} );

	if ( linesToRemove.size === 0 && Object.keys( lineReplacements ).length === 0 ) return false;

	var newLines = lines.map( function( line, idx ) {
		if ( lineReplacements[ idx ] !== undefined ) return lineReplacements[ idx ];
		return line;
	} ).filter( function( _, idx ) {
		return !linesToRemove.has( idx );
	} );

	var result = newLines.join( '\n' );
	if ( result === src ) return false;

	if ( !dryRun ) {
		fs.writeFileSync( filePath, result, 'utf8' );
	}
	console.log( ( dryRun ? '[dry] ' : '' ) + 'Fixed: ' + filePath + ' (' + linesToRemove.size + ' lines removed)' );
	return true;
}

function main( files ) {
	var fixed = 0;
	files.forEach( function( f ) {
		try {
			if ( processFile( f ) ) fixed++;
		} catch ( e ) {
			console.error( 'Error processing ' + f + ': ' + e.message );
		}
	} );
	console.log( 'Done. Fixed ' + fixed + ' files.' );
}

if ( fromStdin ) {
	var rl = readline.createInterface( { input: process.stdin } );
	var files = [];
	rl.on( 'line', function( l ) { if ( l.trim() ) files.push( l.trim() ); } );
	rl.on( 'close', function() { main( files ); } );
} else {
	var args = process.argv.slice( 2 ).filter( function( a ) { return !a.startsWith( '--' ); } );
	if ( args.length === 0 ) {
		console.error( 'Usage: node bin/codemod-dedup-imports.js [--dry-run] [file ...] or --stdin' );
		process.exit( 1 );
	}
	main( args );
}
