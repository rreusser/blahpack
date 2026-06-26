#!/usr/bin/env node
/**
 * Remove unused single-module imports.
 *
 * For each `import name from 'module';` line, if `name` does not appear
 * anywhere else in the file, the import line is removed.
 *
 * Usage:
 *   node bin/codemod-remove-unused-imports.js [--dry-run] file ...
 *   find lib -name '*.js' | node bin/codemod-remove-unused-imports.js --stdin
 */

'use strict';

var fs = require( 'fs' );
var readline = require( 'readline' );

var dryRun = process.argv.includes( '--dry-run' );
var fromStdin = process.argv.includes( '--stdin' );

function processFile( filePath ) {
	var src = fs.readFileSync( filePath, 'utf8' );
	var lines = src.split( '\n' );
	var importRe = /^import\s+(\w+)\s+from\s+'[^']+';?\s*$/;
	var linesToRemove = new Set();

	var commentRe = /^\s*(\*|\/\*|\*\/|\/\/)/;

	lines.forEach( function( line, idx ) {
		var m = importRe.exec( line );
		if ( !m ) return;
		var name = m[ 1 ];
		var nameRe = new RegExp( '\\b' + name + '\\b', 'g' );
		var usedElsewhere = lines.some( function( l, i ) {
			if ( i === idx ) return false;
			if ( commentRe.test( l ) ) return false; // skip comment lines
			return nameRe.test( l );
		} );
		if ( !usedElsewhere ) {
			linesToRemove.add( idx );
		}
	} );

	if ( linesToRemove.size === 0 ) return false;

	var newLines = lines.filter( function( _, idx ) {
		return !linesToRemove.has( idx );
	} );
	var result = newLines.join( '\n' );
	if ( result === src ) return false;

	if ( !dryRun ) {
		fs.writeFileSync( filePath, result, 'utf8' );
	}
	console.log( ( dryRun ? '[dry] ' : '' ) + 'Fixed: ' + filePath + ' (' + linesToRemove.size + ' imports removed)' );
	return true;
}

function main( files ) {
	var fixed = 0;
	files.forEach( function( f ) {
		try {
			if ( processFile( f ) ) fixed++;
		} catch ( e ) {
			console.error( 'Error: ' + f + ': ' + e.message );
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
		console.error( 'Usage: node bin/codemod-remove-unused-imports.js [--dry-run] file ...' );
		process.exit( 1 );
	}
	main( args );
}
