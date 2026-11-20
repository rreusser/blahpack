#!/usr/bin/env node
'use strict';

// One-off codemod (CONVENTIONS S10, ruled 2026-11-19): the CHARACTER output
// EQUED crosses as a caller-provided single-element Array, like every other
// output scalar, and nothing returns a result object.
//
// - laq* (dlaqge, …): take a trailing `equed`; `return '<v>'` becomes
//   `equed[ 0 ] = '<v>'; return <primary output array>;` (S11).
// - svx drivers (dgesvx, …): `equed` is that Array; the result object becomes
//   `return info`, with RPVGRW in WORK(1) (real) / RWORK(1) (complex) as in
//   the reference, and RCOND in `rcond[ 0 ]`.
//
//   node bin/codemod-spec/equed.cjs

var fs = require( 'fs' );
var lib = require( './lib.cjs' );
var specLib = require( '../../lint/lib/spec.cjs' );

var LAQ = [ 'dlaqgb', 'dlaqge', 'dlaqsb', 'dlaqsp', 'dlaqsy', 'zlaqgb', 'zlaqge', 'zlaqhb', 'zlaqhe', 'zlaqhp', 'zlaqsb', 'zlaqsp', 'zlaqsy' ];
var SVX = [ 'dgesvx', 'dgbsvx', 'dposvx', 'zgesvx', 'zgbsvx', 'zposvx' ];

function walkReturns( fn, cb ) {
	( function walk( n ) {
		var k;
		if ( !n || typeof n.type !== 'string' ) {
			return;
		}
		if ( n !== fn && /Function/.test( n.type ) ) {
			return;
		}
		if ( n.type === 'ReturnStatement' ) {
			cb( n );
		}
		for ( k in n ) {
			if ( k !== 'parent' && n[ k ] && typeof n[ k ] === 'object' ) {
				if ( Array.isArray( n[ k ] ) ) {
					n[ k ].forEach( walk );
				} else {
					walk( n[ k ] );
				}
			}
		}
	})( fn.body );
}

function indentAt( src, i ) {
	var j = i;
	while ( j > 0 && src[ j - 1 ] !== '\n' ) {
		j -= 1;
	}
	return src.slice( j, i );
}

function laq( mod ) {
	var spec = specLib.load( mod.routine );
	[ 'base', 'ndarray', 'strided' ].forEach( function each( form ) {
		var file = mod.files[ form ];
		var src = fs.readFileSync( file, 'utf8' );
		var fn = lib.exported( lib.parse( src ) );
		var params = lib.params( fn );
		var arr;
		var edits = [];
		if ( params.indexOf( 'equed' ) < 0 ) {
			edits.push( { 'start': fn.params[ fn.params.length - 1 ].range[ 1 ], 'end': fn.params[ fn.params.length - 1 ].range[ 1 ], 'text': ', equed' } );
		}
		arr = params.filter( function f( p ) {
			return p.toLowerCase() === spec.returns.param.toLowerCase();
		})[ 0 ];
		walkReturns( fn, function each( r ) {
			var a = r.argument;
			if ( a && a.type === 'Literal' && typeof a.value === 'string' ) {
				edits.push( { 'start': r.range[ 0 ], 'end': r.range[ 1 ], 'text': 'equed[ 0 ] = \'' + a.value + '\';\n' + indentAt( src, r.range[ 0 ] ) + 'return ' + arr + ';' } );
			} else if ( a && a.type === 'CallExpression' && a.callee.name === 'base' ) {
				edits.push( { 'start': a.arguments[ a.arguments.length - 1 ].range[ 1 ], 'end': a.arguments[ a.arguments.length - 1 ].range[ 1 ], 'text': ', equed' } );
			}
		});
		fs.writeFileSync( file, lib.applyEdits( src, edits ) );
	});
}

function svx( mod ) {
	var file = mod.files.base;
	var src = fs.readFileSync( file, 'utf8' );
	var fn = lib.exported( lib.parse( src ) );
	var body = src.slice( fn.body.range[ 0 ], fn.body.range[ 1 ] );
	var complex = /^z/.test( mod.routine );
	var store = complex ? 'RWORK[ offsetRWork ]' : 'WORK[ offsetWork ]';
	// `equed = dlaqge( … )` → `dlaqge( …, equed )`
	body = body.replace( /\bequed = ([dz]laq\w+)\(([^;]*?) \);/g, '$1($2, equed );' );
	// every other read/write of the string goes through the Array
	body = body.replace( /'equed': equed/g, '\'equed\': EQUED_' );
	body = body.replace( /([^.'\w])equed\b(?!\[)(?! \);)(?!, )/g, '$1equed[ 0 ]' );
	body = body.replace( /\( ([^;]*?), equed\[ 0 \] \);/g, '( $1, equed );' );
	body = body.replace( /return \{\s*'info': ([^,]+),\s*'equed': EQUED_,\s*'(rpvgrw|rcond)': ([^\n]+?)\s*\};/g, function r( m, info, key, val ) {
		var ind = '\t\t';
		var pre = '';
		if ( key === 'rpvgrw' && val !== '1.0' ) {
			pre = store + ' = ' + val + ';\n' + ind;
		} else if ( key === 'rcond' && val !== 'rcond[ 0 ]' ) {
			pre = 'rcond[ 0 ] = ' + val + ';\n' + ind;
		}
		return pre + 'return ' + info + ';';
	});
	src = src.slice( 0, fn.body.range[ 0 ] ) + body + src.slice( fn.body.range[ 1 ] );
	fs.writeFileSync( file, src );
	if ( /EQUED_|'equed'/.test( src ) ) {
		console.log( mod.routine + ': leftover result object' );
	}
}

lib.modules( LAQ ).forEach( laq );
lib.modules( SVX ).forEach( svx );
console.log( 'done' );
