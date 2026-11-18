#!/usr/bin/env node
'use strict';

// Precompute the reference leading-dimension rules for every routine.
//
//   data/fortran-ld-rules.json  ←  node bin/gen_fortran_ld_rules.js
//
// For each reference routine this records, per leading-dimension argument
// (`LDA`, `LDVL`, ...), the Fortran argument-check conditions that reject it,
// verbatim (continuation lines joined, whitespace collapsed), e.g.
//
//   "LDVL": [ "LDVL.LT.1 .OR. ( WANTVL .AND. LDVL.LT.N )" ]
//
// together with the routine's simple local definitions those conditions use
// (`WANTVL = LSAME( JOBVL, 'V' )`, `NROWA = M`), so the JS side can translate the
// rule without the (gitignored) Fortran tree. It contains NO JavaScript — the
// translation to wrapper checks lives in bin/conformance/ld-rules.js.
//
// Inputs: the reference sources fetched by `npm run fetch-reference`
// (data/lapack-3.12.0/SRC, data/BLAS-3.12.0, data/arpack-ng-3.9.1/{SRC,UTIL}).
// Output is deterministic (sorted keys).

var path = require( 'path' );
var fs = require( 'fs' );

var ROOT = path.join( __dirname, '..' );
var OUT = path.join( ROOT, 'data', 'fortran-ld-rules.json' );
var DIRS = [
	'data/lapack-3.12.0/SRC',
	'data/BLAS-3.12.0',
	'data/arpack-ng-3.9.1/SRC',
	'data/arpack-ng-3.9.1/UTIL'
];

// Join fixed-form continuation lines and drop comment lines.
function codeLines( src ) {
	var out = [];
	src.split( '\n' ).forEach( function each( raw ) {
		if ( /^[cC*!]/.test( raw ) || /^\s*!/.test( raw ) ) {
			return;
		}
		raw = raw.replace( /\s!.*$/, '' );
		if ( /^ {5}\S/.test( raw ) && out.length ) {
			out[ out.length - 1 ] += ' ' + raw.slice( 6 ).trim();
		} else if ( raw.trim() ) {
			out.push( raw.trim() );
		}
	});
	return out;
}

function norm( s ) {
	return s.replace( /\s+/g, ' ' ).trim().toUpperCase();
}

// Argument-check IFs: `[ELSE ]IF( cond ) THEN` followed by `INFO = -k`, or `IF( cond ) INFO = -k`.
function ldRules( lines ) {
	var rules = {};
	var i;
	var m;
	var body;
	var cond;
	var t;
	var re;
	for ( i = 0; i < lines.length; i++ ) {
		m = lines[ i ].match( /^(?:ELSE\s*)?IF\s*\((.*)\)\s*(THEN|INFO\s*=.*)?$/i );
		if ( !m ) {
			continue;
		}
		body = ( m[ 2 ] && !/^THEN$/i.test( m[ 2 ] ) ) ? m[ 2 ] : ( lines[ i + 1 ] || '' );
		if ( !/^INFO\s*=\s*-?\s*\d+\s*$/i.test( body.trim() ) ) {
			continue;
		}
		cond = norm( m[ 1 ] );
		re = /\b(LD[A-Z0-9]*)\s*\.LT\./g;
		while ( ( t = re.exec( cond ) ) !== null ) {
			rules[ t[ 1 ] ] = rules[ t[ 1 ] ] || [];
			if ( rules[ t[ 1 ] ].indexOf( cond ) === -1 ) {
				rules[ t[ 1 ] ].push( cond );
			}
		}
	}
	return rules;
}

// Simple scalar definitions before the argument checks: `X = expr`, or a
// top-level `IF( c1 ) THEN X = a ELSE IF( c2 ) THEN X = b ELSE X = c END IF`
// cascade, recorded in order as [guard, expr] pairs (guard `null` =
// unconditional, `ELSE` = none of the preceding guards in that block).
function locals( lines ) {
	var out = {};
	var guard = null;
	var depth = 0;
	var i;
	var l;
	var m;
	for ( i = 0; i < lines.length; i++ ) {
		l = norm( lines[ i ] );
		if ( /CALL XERBLA/.test( l ) ) {
			break;
		}
		if ( ( m = l.match( /^IF\s*\((.*)\)\s*THEN$/ ) ) ) {
			depth += 1;
			guard = ( depth === 1 ) ? m[ 1 ].trim() : '?';
			continue;
		}
		if ( depth === 1 && ( m = l.match( /^ELSE\s*IF\s*\((.*)\)\s*THEN$/ ) ) ) {
			guard = m[ 1 ].trim();
			continue;
		}
		if ( depth === 1 && /^ELSE$/.test( l ) ) {
			guard = 'ELSE';
			continue;
		}
		if ( /^END\s*IF$/.test( l ) ) {
			depth = Math.max( 0, depth - 1 );
			guard = ( depth === 0 ) ? null : '?';
			continue;
		}
		if ( depth > 1 || guard === '?' ) {
			continue;
		}
		if ( ( m = l.match( /^([A-Z][A-Z0-9_]*)\s*=\s*(.+)$/ ) ) && !/^INFO$/.test( m[ 1 ] ) ) {
			out[ m[ 1 ] ] = out[ m[ 1 ] ] || [];
			out[ m[ 1 ] ].push( guard ? [ guard, m[ 2 ].trim() ] : [ null, m[ 2 ].trim() ] );
		}
	}
	return out;
}

function main() {
	var all = {};
	DIRS.forEach( function each( d ) {
		var dir = path.join( ROOT, d );
		if ( !fs.existsSync( dir ) ) {
			process.stderr.write( 'missing ' + d + ' (run `npm run fetch-reference`)\n' );
			return;
		}
		fs.readdirSync( dir ).filter( function f( n ) {
			return /\.f(90)?$/i.test( n );
		}).forEach( function eachFile( n ) {
			var name = n.replace( /\.f(90)?$/i, '' ).toLowerCase();
			var lines = codeLines( fs.readFileSync( path.join( dir, n ), 'utf8' ) );
			var rules = ldRules( lines );
			if ( !Object.keys( rules ).length ) {
				return;
			}
			var loc = locals( lines );
			var used = {};
			var ids = Object.keys( rules ).map( function m( k ) {
				return rules[ k ].join( ' ' );
			}).join( ' ' ).match( /\b[A-Z][A-Z0-9_]*\b/g ) || [];
			// Keep only locals the rules reference (transitively).
			var queue = ids.slice();
			while ( queue.length ) {
				var id = queue.pop();
				if ( used[ id ] || !loc[ id ] ) {
					continue;
				}
				used[ id ] = loc[ id ];
				loc[ id ].forEach( function eachDef( def ) {
					queue.push.apply( queue, ( ( def[ 0 ] || '' ) + ' ' + def[ 1 ] ).match( /\b[A-Z][A-Z0-9_]*\b/g ) || [] );
				});
			}
			all[ name ] = { 'rules': rules };
			if ( Object.keys( used ).length ) {
				all[ name ].locals = used;
			}
		});
	});
	var keys = Object.keys( all ).sort();
	var ordered = {};
	keys.forEach( function each( k ) {
		var e = all[ k ];
		var r = {};
		Object.keys( e.rules ).sort().forEach( function s( x ) {
			r[ x ] = e.rules[ x ];
		});
		ordered[ k ] = { 'rules': r };
		if ( e.locals ) {
			var l = {};
			Object.keys( e.locals ).sort().forEach( function s( x ) {
				l[ x ] = e.locals[ x ];
			});
			ordered[ k ].locals = l;
		}
	});
	fs.writeFileSync( OUT, JSON.stringify( ordered, null, '\t' ) + '\n' );
	process.stderr.write( 'wrote LD rules for ' + keys.length + ' routines to ' + path.relative( ROOT, OUT ) + '\n' );
}

main();
