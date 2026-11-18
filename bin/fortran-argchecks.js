'use strict';

// Shared parsing of reference Fortran argument checks, used by
// bin/gen_fortran_ld_rules.js and bin/gen_fortran_option_rules.js.

var path = require( 'path' );
var fs = require( 'fs' );

var ROOT = path.join( __dirname, '..' );
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

// Argument-check IFs: `[ELSE ]IF( cond ) THEN` followed by `INFO = -k`, or
// `IF( cond ) INFO = -k`. Returns [ { cond, k } ] in source order; `k` is the
// signed INFO value (negative = invalid argument number -k).
function infoChecks( lines ) {
	var out = [];
	var i;
	var m;
	var body;
	var b;
	for ( i = 0; i < lines.length; i++ ) {
		m = lines[ i ].match( /^(?:ELSE\s*)?IF\s*\((.*)\)\s*(THEN|INFO\s*=.*)?$/i );
		if ( !m ) {
			continue;
		}
		body = ( m[ 2 ] && !/^THEN$/i.test( m[ 2 ] ) ) ? m[ 2 ] : ( lines[ i + 1 ] || '' );
		b = body.trim().match( /^INFO\s*=\s*(-?)\s*(\d+)\s*$/i );
		if ( !b ) {
			continue;
		}
		out.push( { 'cond': norm( m[ 1 ] ), 'k': ( b[ 1 ] ? -1 : 1 ) * Number( b[ 2 ] ) } );
	}
	return out;
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

// Locals (transitively) referenced by the given text.
function usedLocals( text, loc ) {
	var used = {};
	var queue = text.match( /\b[A-Z][A-Z0-9_]*\b/g ) || [];
	var id;
	while ( queue.length ) {
		id = queue.pop();
		if ( used[ id ] || !loc[ id ] ) {
			continue;
		}
		used[ id ] = loc[ id ];
		loc[ id ].forEach( function eachDef( def ) {
			queue.push.apply( queue, ( ( def[ 0 ] || '' ) + ' ' + def[ 1 ] ).match( /\b[A-Z][A-Z0-9_]*\b/g ) || [] );
		});
	}
	return used;
}

// Call fn( name, lines ) for every reference source file.
function eachSource( fn ) {
	DIRS.forEach( function each( d ) {
		var dir = path.join( ROOT, d );
		if ( !fs.existsSync( dir ) ) {
			process.stderr.write( 'missing ' + d + ' (run `npm run fetch-reference`)\n' );
			return;
		}
		fs.readdirSync( dir ).filter( function f( n ) {
			return /\.f(90)?$/i.test( n );
		}).forEach( function eachFile( n ) {
			fn( n.replace( /\.f(90)?$/i, '' ).toLowerCase(), codeLines( fs.readFileSync( path.join( dir, n ), 'utf8' ) ) );
		});
	});
}

// Deterministic JSON (sorted keys at every object level).
function sortedJSON( obj ) {
	return JSON.stringify( obj, function replacer( k, v ) {
		if ( v && typeof v === 'object' && !Array.isArray( v ) ) {
			return Object.keys( v ).sort().reduce( function r( o, key ) {
				o[ key ] = v[ key ];
				return o;
			}, {} );
		}
		return v;
	}, '\t' ) + '\n';
}

module.exports = {
	'ROOT': ROOT,
	'codeLines': codeLines,
	'norm': norm,
	'infoChecks': infoChecks,
	'locals': locals,
	'usedLocals': usedLocals,
	'eachSource': eachSource,
	'sortedJSON': sortedJSON
};
