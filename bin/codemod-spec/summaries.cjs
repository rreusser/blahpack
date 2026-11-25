#!/usr/bin/env node
'use strict';

// Repairs broken JSDoc summaries (lint rule jsdoc-summary) on the exported
// function of base.js, ndarray.js and <routine>.js, and on lib/index.js's
// module JSDoc.
//
// - `@license` tag where the summary belongs: the tag line goes, the summary
//   goes in its place.
// - A first sentence that ends mid-statement ("…operations:."): the first
//   paragraph is replaced by the summary.
// - A first sentence with no closing period: the period is added.
//
// The summary is the routine's curated one-liner in
// data/descriptions.generated.json (bin/gen-descriptions.js), which exists
// because these sentences were truncated upstream. ndarray.js gets
// ", using alternative indexing semantics" as elsewhere in the corpus.
//
// Usage: node bin/codemod-spec/summaries.cjs [routine ...]

var fs = require( 'fs' );
var path = require( 'path' );
var H = require( '../../lint/lib/doc-health.cjs' );

var ROOT = path.join( __dirname, '..', '..' );
var DESCRIPTIONS = JSON.parse( fs.readFileSync( path.join( ROOT, 'data', 'descriptions.generated.json' ), 'utf8' ) );

function summaryFor( routine, file ) {
	var d = DESCRIPTIONS[ routine ];
	if ( !d ) {
		return null;
	}
	d = d.replace( /[.\s]+$/, '' );
	if ( path.basename( file ) === 'ndarray.js' ) {
		d += ', using alternative indexing semantics';
	}
	return d + '.';
}

// Returns the target comment's text in `src`, or null.
function targetComment( src, file ) {
	var m;
	var name;
	if ( path.basename( file ) === 'index.js' ) {
		m = src.replace( /^\/\*\*[\s\S]*?@license[\s\S]*?\*\//, '' ).match( /\/\*\*(?:(?!\*\/)[\s\S])*\*\// );
		return m ? m[ 0 ] : null;
	}
	name = ( /export\s+default\s+(\w+)\s*;/.exec( src ) || [] )[ 1 ];
	if ( !name ) {
		return null;
	}
	m = new RegExp( '(\\/\\*\\*(?:(?!\\*\\/)[\\s\\S])*\\*\\/)\\s*function\\s+' + name + '\\s*\\(' ).exec( src );
	return m ? m[ 1 ] : null;
}

function repair( comment, summary, problem ) {
	var lines = comment.split( '\n' );
	var i = 1;
	var end;
	if ( /@license/.test( problem ) ) {
		lines = lines.filter( function f( l ) {
			return !/^\s*\*\s*@license\b/.test( l );
		});
		while ( lines.length > 2 && /^\s*\*\s*$/.test( lines[ 1 ] ) ) {
			lines.splice( 1, 1 );
		}
		lines.splice( 1, 0, '* ' + summary, '*' );
		return lines.join( '\n' );
	}
	// First paragraph: lines 1..end-1 (until a blank `*` line, a tag, or the end).
	while ( i < lines.length && /^\s*\*\s*$/.test( lines[ i ] ) ) {
		i += 1;
	}
	end = i;
	while ( end < lines.length && !/^\s*\*\s*$/.test( lines[ end ] ) && !/^\s*\*\s*@/.test( lines[ end ] ) && !/\*\/\s*$/.test( lines[ end ] ) ) {
		end += 1;
	}
	if ( /ending in a period/.test( problem ) && end === i + 1 ) {
		lines[ i ] = lines[ i ].replace( /\s*$/, '.' );
		return lines.join( '\n' );
	}
	lines.splice( i, end - i, '* ' + summary );
	return lines.join( '\n' );
}

function main() {
	var only = process.argv.slice( 2 );
	var n = 0;
	var skipped = [];
	[ 'blas', 'lapack', 'arpack' ].forEach( function each( pkg ) {
		var base = path.join( ROOT, 'lib', pkg, 'base' );
		fs.readdirSync( base ).forEach( function f( routine ) {
			if ( only.length && only.indexOf( routine ) < 0 ) {
				return;
			}
			[ 'index.js', 'base.js', 'ndarray.js', routine + '.js' ].forEach( function g( x ) {
				var file = path.join( base, routine, 'lib', x );
				var src;
				var comment;
				var problem;
				var summary;
				if ( !fs.existsSync( file ) ) {
					return;
				}
				src = fs.readFileSync( file, 'utf8' );
				comment = targetComment( src, file );
				if ( !comment ) {
					return;
				}
				problem = H.summaryProblem( H.parse( comment.slice( 2, -2 ) ) );
				if ( !problem ) {
					return;
				}
				summary = summaryFor( routine, file );
				if ( !summary && !/ending in a period/.test( problem ) ) {
					skipped.push( path.relative( ROOT, file ) + ': ' + problem );
					return;
				}
				fs.writeFileSync( file, src.replace( comment, function r() {
					return repair( comment, summary, problem );
				}) );
				n += 1;
			});
		});
	});
	console.log( 'summaries: rewrote ' + n + ' files' );
	if ( skipped.length ) {
		console.log( 'No curated summary for:\n  ' + skipped.join( '\n  ' ) );
		process.exitCode = 1;
	}
}

main();
