#!/usr/bin/env node
'use strict';

// Codemod (tests): in `assert.throws( …, RangeError )` cases, an option
// argument written as a number literal (scaffolded tests pass `2` for `job`)
// is replaced by the option's first canonical value from the spec. Such a
// test means to exercise a numeric check; with the generated prologue (which
// validates in reference order) the bogus option threw a TypeError first.
//
//   node bin/codemod-spec/test-flags.cjs [--dry] [routine ...]

var fs = require( 'fs' );
var path = require( 'path' );
var lib = require( './lib.cjs' );
var specLib = require( '../../lint/lib/spec.cjs' );
var P = require( '../../lint/lib/prologue.cjs' );

var argv = process.argv.slice( 2 );
var DRY = argv.indexOf( '--dry' ) >= 0;
var only = argv.filter( function f( a ) {
	return a.charAt( 0 ) !== '-';
});

// Position → first accepted value, for the enum checks of a form.
function flagValues( spec, form ) {
	var names = ( form === 'strided' ) ? specLib.strided( spec ) : specLib.base( spec );
	var out = {};
	P.prologue( spec, form, names ).forEach( function each( c ) {
		var i = names.indexOf( c.args[ 0 ] );
		var s;
		if ( c.kind === 'order' ) {
			out[ i ] = 'column-major';
		} else if ( c.kind === 'enum' && i >= 0 ) {
			s = spec.checks.filter( function f( x ) {
				return x.param === c.param;
			})[ 0 ];
			out[ i ] = s.values[ 0 ];
		}
	});
	return out;
}

function walk( n, fn ) {
	var k;
	if ( !n || typeof n.type !== 'string' ) {
		return;
	}
	fn( n );
	for ( k in n ) {
		if ( k !== 'parent' && n[ k ] && typeof n[ k ] === 'object' ) {
			if ( Array.isArray( n[ k ] ) ) {
				n[ k ].forEach( function e( c ) {
					walk( c, fn );
				});
			} else {
				walk( n[ k ], fn );
			}
		}
	}
}

function fixFile( file, routine, spec ) {
	var src = fs.readFileSync( file, 'utf8' );
	var ast;
	var imports = {};
	var edits = [];
	try {
		ast = require( 'acorn' ).parse( src, { 'ecmaVersion': 'latest', 'sourceType': 'module', 'ranges': true } );
	} catch ( e ) {
		console.error( file + ': ' + e.message );
		return 0;
	}
	ast.body.forEach( function each( n ) {
		if ( n.type === 'ImportDeclaration' && n.specifiers[ 0 ] ) {
			if ( /\/ndarray\.js$/.test( n.source.value ) ) {
				imports[ n.specifiers[ 0 ].local.name ] = 'ndarray';
			} else if ( new RegExp( '/(' + routine + '|index|main)\\.js$' ).test( n.source.value ) ) {
				imports[ n.specifiers[ 0 ].local.name ] = 'strided';
			}
		}
	});
	var vals = { 'ndarray': flagValues( spec, 'ndarray' ), 'strided': flagValues( spec, 'strided' ) };
	walk( ast, function each( n ) {
		var fnBody;
		if ( n.type !== 'CallExpression' || n.callee.type !== 'MemberExpression' || n.callee.property.name !== 'throws' || n.arguments.length < 2 ) {
			return;
		}
		if ( n.arguments[ 1 ].type !== 'Identifier' || n.arguments[ 1 ].name !== 'RangeError' ) {
			return;
		}
		fnBody = n.arguments[ 0 ];
		walk( fnBody, function call( c ) {
			var form = null;
			if ( c.type !== 'CallExpression' ) {
				return;
			}
			if ( c.callee.type === 'Identifier' && imports[ c.callee.name ] ) {
				form = imports[ c.callee.name ];
			} else if ( c.callee.type === 'MemberExpression' && c.callee.property.name === 'ndarray' && c.callee.object.type === 'Identifier' && imports[ c.callee.object.name ] === 'strided' ) {
				form = 'ndarray';
			}
			if ( !form ) {
				return;
			}
			c.arguments.forEach( function arg( a, i ) {
				if ( vals[ form ][ i ] !== undefined && a.type === 'Literal' && typeof a.value === 'number' ) {
					edits.push( { 'start': a.range[ 0 ], 'end': a.range[ 1 ], 'text': '\'' + vals[ form ][ i ] + '\'' } );
				}
			});
		});
	});
	if ( edits.length && !DRY ) {
		fs.writeFileSync( file, lib.applyEdits( src, edits ) );
	}
	return edits.length;
}

function main() {
	var total = 0;
	lib.modules( only ).forEach( function each( mod ) {
		var spec = specLib.load( mod.routine );
		var tdir = path.join( mod.dir, '..', 'test' );
		if ( !spec || !fs.existsSync( tdir ) ) {
			return;
		}
		fs.readdirSync( tdir ).filter( function f( n ) {
			return /\.js$/.test( n );
		}).forEach( function e( n ) {
			var k = fixFile( path.join( tdir, n ), mod.routine, spec );
			if ( k ) {
				total += k;
				console.log( mod.routine + '/test/' + n + ': ' + k );
			}
		});
	});
	console.log( 'replaced: ' + total );
}

main();
