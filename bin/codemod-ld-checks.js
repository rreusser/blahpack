#!/usr/bin/env node
'use strict';

// Rewrite layout-wrapper leading-dimension checks from the reference Fortran rules.
//
//   node bin/codemod-ld-checks.js [--dry] [routine ...]
//
// For every `lib/<pkg>/base/<r>/lib/<r>.js` with leading-dimension params that
// have a reference rule (data/fortran-ld-rules.json), removes the wrapper's
// existing `if ( ...LDX < ... ) { throw new RangeError(...) }` checks (at any
// nesting depth) and inserts the checks rendered by bin/conformance/ld-rules.js,
// in parameter order, before the stride setup. Where a rule's row-major bound is
// marked 'skip' (unverified layouts), existing row-major checks are kept.
// The `ld-rules` conformance check verifies the result.

var fs = require( 'fs' );
var path = require( 'path' );
var ld = require( './conformance/ld-rules.js' );

var ROOT = path.join( __dirname, '..' );
var DRY = process.argv.indexOf( '--dry' ) >= 0;
var ONLY = process.argv.slice( 2 ).filter( function f( a ) {
	return a.indexOf( '--' ) !== 0;
});

var existingChecks = ld.existingChecks;

// Start offset of the depth-1 statement containing `pos`.
function topLevelStart( src, pos ) {
	var i = src.lastIndexOf( '\n\t', pos );
	while ( i >= 0 && src[ i + 2 ] === '\t' ) {
		i = src.lastIndexOf( '\n\t', i - 1 );
	}
	return i + 1;
}

function ensureImport( src, name, spec ) {
	if ( new RegExp( '^import ' + name + ' from ', 'm' ).test( src ) ) {
		return src;
	}
	var m = src.match( /^import base from [^\n]*\n/m );
	var line = 'import ' + name + ' from \'' + spec + '\';\n';
	return m ? src.replace( m[ 0 ], line + m[ 0 ] ) : src.replace( /(^import [^\n]*\n)(?![\s\S]*^import )/m, '$1' + line );
}

function processRoutine( pkg, r ) {
	var dir = path.join( ROOT, 'lib', pkg, 'base', r, 'lib' );
	var wp = path.join( dir, r + '.js' );
	var src;
	var exp;
	var params;
	var names;
	var removals = [];
	var keepRow = [];
	var inserted = '';
	var anchor = -1;
	var changed = false;
	if ( !fs.existsSync( wp ) ) {
		return null;
	}
	src = fs.readFileSync( wp, 'utf8' );
	exp = ld.expected( r, src, fs.readFileSync( path.join( dir, 'base.js' ), 'utf8' ), fs.existsSync( path.join( dir, 'ndarray.js' ) ) ? fs.readFileSync( path.join( dir, 'ndarray.js' ), 'utf8' ) : '' );
	names = Object.keys( exp );
	if ( !names.length ) {
		return null;
	}
	params = ld.wrapperParams( src, r );
	names.sort( function cmp( a, b ) {
		return params.indexOf( a ) - params.indexOf( b );
	});
	names.forEach( function each( name ) {
		var want = ld.checks( name, exp[ name ], params );
		var have = existingChecks( src, name );
		var skipRow = exp[ name ].row === 'skip';
		var wantCodes = want.map( function c( w ) {
			return w.code;
		});
		// Already exactly right?
		var present = wantCodes.every( function p( code ) {
			return src.indexOf( code ) >= 0;
		});
		var extras = have.filter( function x( h ) {
			return !wantCodes.some( function s( code ) {
				return code.indexOf( '\tif ( ' + h.cond + ' ) {' ) === 0;
			}) && !( skipRow && h.order === 'row-major' );
		});
		if ( present && !extras.length ) {
			return;
		}
		changed = true;
		have.forEach( function rm( h ) {
			if ( skipRow && h.order === 'row-major' ) {
				return;
			}
			removals.push( h );
			if ( skipRow && h.order === null ) {
				// Keep its row-major meaning.
				keepRow.push( '\tif ( order === \'row-major\' && ( ' + h.cond + ' ) ) {\n' + src.slice( h.start, h.end ).split( '\n' ).slice( 1 ).join( '\n' ).replace( /^\t+/gm, function t( tabs ) {
					return tabs.length > 2 ? '\t\t' : tabs.slice( 0, 2 );
				}) );
			}
		});
		inserted += wantCodes.join( '' ) + keepRow.join( '' );
		keepRow = [];
	});
	if ( !changed ) {
		return { 'r': r, 'changed': false };
	}
	// Anchor: first removed check (or its enclosing top-level statement), else before stride setup.
	removals.sort( function c( a, b ) {
		return a.start - b.start;
	});
	if ( removals.length ) {
		anchor = ( removals[ 0 ].depth === 1 ) ? removals[ 0 ].start : topLevelStart( src, removals[ 0 ].start );
	}
	if ( anchor < 0 ) {
		var m = src.search( /\n\tif \( order === '(column|row)-major' \) \{\n/ );
		if ( m < 0 ) {
			m = src.search( /\n\t(const \w+ = |let |return base\()/ );
		}
		anchor = m + 1;
	}
	// Apply removals from the end, adjusting the anchor.
	for ( var i = removals.length - 1; i >= 0; i-- ) {
		src = src.slice( 0, removals[ i ].start ) + src.slice( removals[ i ].end );
		if ( removals[ i ].start < anchor ) {
			anchor -= removals[ i ].end - removals[ i ].start;
		}
	}
	src = src.slice( 0, anchor ) + inserted + src.slice( anchor );
	if ( /\bmax\( /.test( inserted ) ) {
		src = ensureImport( src, 'max', '@stdlib/math/base/special/fast/max/lib/index.js' );
	}
	if ( /\bmin\( /.test( inserted ) ) {
		src = ensureImport( src, 'min', '@stdlib/math/base/special/fast/min/lib/index.js' );
	}
	if ( !DRY ) {
		fs.writeFileSync( wp, src );
	}
	return { 'r': r, 'changed': true, 'removed': removals.length };
}

var stats = { 'changed': 0, 'unchanged': 0 };
[ 'blas', 'lapack', 'arpack' ].forEach( function eachPkg( pkg ) {
	var d = path.join( ROOT, 'lib', pkg, 'base' );
	if ( !fs.existsSync( d ) ) {
		return;
	}
	fs.readdirSync( d ).forEach( function each( r ) {
		if ( ONLY.length && ONLY.indexOf( r ) < 0 ) {
			return;
		}
		var res = processRoutine( pkg, r );
		if ( !res ) {
			return;
		}
		if ( res.changed ) {
			stats.changed += 1;
			console.log( ( DRY ? 'would rewrite ' : 'rewrote ' ) + pkg + '/' + r + ' (' + res.removed + ' old checks)' );
		} else {
			stats.unchanged += 1;
		}
	});
});
console.log( stats );
