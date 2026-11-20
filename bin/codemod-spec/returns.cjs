#!/usr/bin/env node
'use strict';

// Codemod (CONVENTIONS S11): a routine whose spec returns its primary output
// array (`returns: { kind: 'array', param }`, the BLAS-style return of a
// subroutine without INFO) returns that array from every exit of base.js,
// ndarray.js and <routine>.js:
//
// - a bare `return;` becomes `return <array>;`
// - a final `base( … );` statement becomes `return base( … );`
// - a body that falls off its end gets `return <array>;`
//
// A function that already returns some other value is reported, not changed.
//
//   node bin/codemod-spec/returns.cjs [--dry] [routine ...]

var fs = require( 'fs' );
var lib = require( './lib.cjs' );
var specLib = require( '../../lint/lib/spec.cjs' );

var argv = process.argv.slice( 2 );
var DRY = argv.indexOf( '--dry' ) >= 0;
var only = argv.filter( function f( a ) {
	return a.charAt( 0 ) !== '-';
});

// Return statements of fn itself (not of nested functions).
function returns( fn ) {
	var out = [];
	( function walk( n ) {
		var k;
		if ( !n || typeof n.type !== 'string' ) {
			return;
		}
		if ( n !== fn && /Function/.test( n.type ) ) {
			return;
		}
		if ( n.type === 'ReturnStatement' ) {
			out.push( n );
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
	return out;
}

function isBaseCall( e ) {
	return e && e.type === 'CallExpression' && e.callee.type === 'Identifier' && e.callee.name === 'base';
}

function fix( file, spec, form, report ) {
	var src = fs.readFileSync( file, 'utf8' );
	var ast = lib.parse( src );
	var fn = lib.exported( ast );
	var params;
	var x;
	var edits = [];
	var body;
	var last;
	var bad = false;
	if ( !fn ) {
		return;
	}
	params = lib.params( fn );
	x = params.filter( function f( p ) {
		return p && p.toLowerCase() === spec.returns.param.toLowerCase();
	})[ 0 ];
	if ( !x ) {
		report.push( file + ': no parameter ' + spec.returns.param );
		return;
	}
	returns( fn ).forEach( function each( r ) {
		if ( !r.argument ) {
			edits.push( { 'start': r.range[ 0 ], 'end': r.range[ 1 ], 'text': 'return ' + x + ';' } );
		} else if ( ( r.argument.type === 'Identifier' && r.argument.name !== x && params.indexOf( r.argument.name ) >= 0 ) || ( r.argument.type === 'Literal' && r.argument.value === 0 ) ) {
			// another parameter, or a status 0 of a routine with no INFO
			edits.push( { 'start': r.argument.range[ 0 ], 'end': r.argument.range[ 1 ], 'text': x } );
		} else if ( !( r.argument.type === 'Identifier' && r.argument.name === x ) && !isBaseCall( r.argument ) ) {
			bad = true;
		}
	});
	if ( bad ) {
		report.push( file.replace( lib.ROOT + '/', '' ) + ': returns something other than `' + x + '`; not changed' );
		return;
	}
	body = fn.body.body;
	last = body[ body.length - 1 ];
	if ( last && last.type === 'ExpressionStatement' && isBaseCall( last.expression ) && form !== 'base' ) {
		edits.push( { 'start': last.range[ 0 ], 'end': last.range[ 0 ], 'text': 'return ' } );
	} else if ( !last || last.type !== 'ReturnStatement' ) {
		edits.push( { 'start': fn.body.range[ 1 ] - 1, 'end': fn.body.range[ 1 ] - 1, 'text': '\treturn ' + x + ';\n' } );
	}
	if ( !edits.length ) {
		return;
	}
	report.push( file.replace( lib.ROOT + '/', '' ) + ': ' + edits.length + ' edit(s)' );
	if ( !DRY ) {
		fs.writeFileSync( file, lib.applyEdits( src, edits ) );
	}
}

function main() {
	var report = [];
	lib.modules( only ).forEach( function each( mod ) {
		var spec = specLib.load( mod.routine );
		if ( !spec || spec.returns.kind !== 'array' ) {
			return;
		}
		[ 'base', 'ndarray', 'strided' ].forEach( function each( form ) {
			if ( fs.existsSync( mod.files[ form ] ) ) {
				fix( mod.files[ form ], spec, form, report );
			}
		});
	});
	console.log( report.join( '\n' ) );
}

main();
