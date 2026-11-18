#!/usr/bin/env node
'use strict';

// Rewrite TRANS*/SIDE/UPLO/DIAG validation to the reference option set.
//
//   node bin/codemod-option-rules.js [--dry] [routine ...]
//
// For every module the `option-rules` conformance check flags with a
// fixed-vocabulary mismatch, replaces the parameter's validation condition in
// ndarray.js AND the layout wrapper <routine>.js — either a stdlib helper
// (`if ( !isTransposeOperation( trans ) )`) or a literal chain
// (`if ( trans !== 'a' && trans !== 'b' )`) — with a literal chain of exactly the
// values the reference accepts, keeping the existing TypeError. Helper imports
// left unused are removed.
//
// Then, for every option ndarray.js validates that the wrapper takes but never
// validates (`option-parity`), inserts the ndarray.js check into the wrapper
// (after its `order` check, or at the top of the body), renumbered to the
// wrapper's argument position. Idempotent.

var fs = require( 'fs' );
var path = require( 'path' );
var mismatches = require( './conformance/checks/option-rules.js' ).mismatches;
var parity = require( './conformance/checks/option-parity.js' );
var ordinal = require( './conformance/ld-rules.js' ).ordinal;

var ROOT = path.join( __dirname, '..' );
var DRY = process.argv.indexOf( '--dry' ) >= 0;
var ONLY = process.argv.slice( 2 ).filter( function f( a ) {
	return a.indexOf( '--' ) !== 0;
});

// stdlib assertion helpers whose value set is exactly a reference set. Used in
// preference to a literal chain (the `no-dprefix-conjugate-transpose` lint rule
// forbids the literal in real routines, e.g. DTRSYL, whose reference accepts C).
var HELPERS = [
	{ 'name': 'isTransposeOperation', 'spec': '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js', 'values': [ 'no-transpose', 'transpose', 'conjugate-transpose' ] },
	{ 'name': 'isOperationSide', 'spec': '@stdlib/blas/base/assert/is-operation-side/lib/index.js', 'values': [ 'left', 'right' ] },
	{ 'name': 'isMatrixTriangle', 'spec': '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js', 'values': [ 'upper', 'lower' ] },
	{ 'name': 'isDiagonalType', 'spec': '@stdlib/blas/base/assert/is-diagonal-type/lib/index.js', 'values': [ 'unit', 'non-unit' ] }
];

function helperFor( values ) {
	return HELPERS.filter( function f( h ) {
		return h.values.length === values.length && h.values.every( function e( v ) {
			return values.indexOf( v ) >= 0;
		});
	})[ 0 ] || null;
}

function chain( name, values ) {
	var h = helperFor( values );
	if ( h ) {
		return '!' + h.name + '( ' + name + ' )';
	}
	return values.map( function m( v ) {
		return name + ' !== \'' + v + '\'';
	}).join( ' && ' );
}

function ensureHelperImports( src ) {
	HELPERS.forEach( function each( h ) {
		if ( src.indexOf( '!' + h.name + '( ' ) >= 0 && !new RegExp( '^import ' + h.name + ' from ', 'm' ).test( src ) ) {
			src = src.replace( /^(import format from [^\n]*\n)/m, 'import ' + h.name + ' from \'' + h.spec + '\';\n$1' );
		}
	});
	return src;
}

// Replace every validation condition for `name` in src; returns { src, n }.
function rewrite( src, name, values ) {
	var n = 0;
	var re = new RegExp( '(\\tif \\( )(?:!\\w+\\( ' + name + ' \\)|(?:' + name + ' !== \'[^\']*\'(?: && )?)+)( \\) \\{\\n\\t\\tthrow new TypeError)', 'g' );
	src = src.replace( re, function r( m, pre, post ) {
		n += 1;
		return pre + chain( name, values ) + post;
	});
	return { 'src': src, 'n': n };
}

function dropUnusedImports( src ) {
	// Unused aliases first (`const isMatrixTranspose = isTransposeOperation;`).
	src = src.replace( /^const (\w+) = (\w+);\n/gm, function r( line, id ) {
		return ( src.split( new RegExp( '\\b' + id + '\\b' ) ).length - 1 > 1 ) ? line : '';
	});
	return src.replace( /^import (\w+) from '@stdlib\/blas\/base\/assert\/[^']+';\n/gm, function r( line, id ) {
		var uses = src.split( new RegExp( '\\b' + id + '\\b' ) ).length - 1;
		return ( uses > 1 ) ? line : '';
	});
}

// Insert the wrapper validation ndarray.js performs for each unvalidated option.
function insertMissing( r, lib ) {
	var wp = path.join( lib, r + '.js' );
	var np = path.join( lib, 'ndarray.js' );
	var src;
	var nd;
	var params;
	var missing;
	var blocks;
	var at;
	var m;
	if ( !fs.existsSync( wp ) || !fs.existsSync( np ) ) {
		return;
	}
	src = fs.readFileSync( wp, 'utf8' );
	nd = fs.readFileSync( np, 'utf8' );
	missing = parity.unvalidated( src, r, parity.optionSets( src ), parity.optionSets( nd ) );
	if ( !missing.length ) {
		return;
	}
	params = src.match( new RegExp( 'function ' + r + '\\(([^)]*)\\)' ) )[ 1 ].split( ',' ).map( function t( p ) {
		return p.trim();
	});
	missing.sort( function c( a, b ) {
		return params.indexOf( a ) - params.indexOf( b );
	});
	blocks = missing.map( function each( k ) {
		var re = new RegExp( '\\tif \\( (?:!\\w+\\( ' + k + ' \\)|(?:' + k + " !== '[^']*'(?: && )?)+) \\) \\{\\n\\t\\tthrow new TypeError\\([^\\n]*\\n\\t\\}\\n" );
		var blk = nd.match( re );
		if ( !blk ) {
			throw new Error( 'no ndarray.js validation block for ' + k + ' in ' + r );
		}
		return blk[ 0 ].replace( /invalid argument\. [A-Z][a-z-]+ argument/, 'invalid argument. ' + ordinal( params.indexOf( k ) + 1 ) + ' argument' );
	}).join( '' );
	m = src.match( /\tif \( !isLayout\( order \) \) \{\n[^\n]*\n\t\}\n/ );
	if ( m ) {
		at = src.indexOf( m[ 0 ] ) + m[ 0 ].length;
	} else {
		m = src.match( new RegExp( 'function ' + r + '\\([^)]*\\) \\{[^\\n]*\\n(?:\\t(?:let|const|var) [^\\n]*\\n)*\\n?' ) );
		at = src.indexOf( m[ 0 ] ) + m[ 0 ].length;
	}
	src = src.slice( 0, at ) + blocks + src.slice( at );
	if ( !/^import format from /m.test( src ) ) {
		src = src.replace( /^(import base from [^\n]*\n)/m, "import format from '@stdlib/string/format/lib/index.js';\n$1" );
	}
	nd.replace( /^import (\w+) from ('@stdlib\/blas\/base\/assert\/[^']+');$/gm, function imp( line, id ) {
		if ( blocks.indexOf( id + '(' ) >= 0 && !new RegExp( '^import ' + id + ' from ', 'm' ).test( src ) ) {
			src = src.replace( /^(import base from [^\n]*\n)/m, line + '\n$1' );
		}
		return line;
	});
	stats.files += 1;
	if ( !DRY ) {
		fs.writeFileSync( wp, src );
	}
	console.log( ( DRY ? 'would add ' : 'added ' ) + 'validation of [' + missing.join( ', ' ) + '] to ' + path.relative( ROOT, wp ) );
}

var stats = { 'modules': 0, 'files': 0 };
[ 'blas', 'lapack', 'arpack' ].forEach( function eachPkg( pkg ) {
	var d = path.join( ROOT, 'lib', pkg, 'base' );
	if ( !fs.existsSync( d ) ) {
		return;
	}
	fs.readdirSync( d ).forEach( function each( r ) {
		var lib = path.join( d, r, 'lib' );
		var nd = path.join( lib, 'ndarray.js' );
		var bad;
		if ( ( ONLY.length && ONLY.indexOf( r ) < 0 ) || !fs.existsSync( nd ) ) {
			return;
		}
		bad = mismatches( r, fs.readFileSync( nd, 'utf8' ) ).filter( function f( b ) {
			return b.want;
		});
		if ( !bad.length ) {
			insertMissing( r, lib );
			return;
		}
		stats.modules += 1;
		[ nd, path.join( lib, r + '.js' ) ].forEach( function eachFile( file ) {
			var src;
			var res;
			var changed = false;
			if ( !fs.existsSync( file ) ) {
				return;
			}
			src = fs.readFileSync( file, 'utf8' );
			bad.forEach( function eachBad( b ) {
				res = rewrite( src, b.param, b.want );
				if ( !res.n ) {
					console.warn( 'no validation block for `' + b.param + '` in ' + path.relative( ROOT, file ) );
				}
				changed = changed || res.src !== src;
				src = res.src;
			});
			if ( changed ) {
				src = dropUnusedImports( ensureHelperImports( src ) );
				stats.files += 1;
				if ( !DRY ) {
					fs.writeFileSync( file, src );
				}
				console.log( ( DRY ? 'would rewrite ' : 'rewrote ' ) + path.relative( ROOT, file ) + '  ' + bad.map( function m( b ) {
					return b.param + ' → [' + b.want.join( ', ' ) + ']';
				}).join( '; ' ) );
			}
		});
		insertMissing( r, lib );
	});
});
console.log( stats );
