'use strict';

// The type check (CONVENTIONS S14; `npm run typecheck`) is only as strong as
// tsconfig.json and types/jsdoc-aliases.d.ts. Either can be loosened in one
// line, and the check would still pass. This test pins every strictness
// flag and alias that has been tightened: loosening one fails here, and
// tightening one more means adding it here (tickets 0023, 0085).
//
// Run:  node --test lint/typecheck-config.test.cjs

var path = require( 'path' );
var fs = require( 'fs' );
var test = require( 'node:test' );
var assert = require( 'node:assert' );

var ROOT = path.join( __dirname, '..' );

// `strict` must be on, and none of the flags it implies may be switched
// back off one by one (ticket 0023).
var FLAGS = [ 'checkJs', 'strict', 'esModuleInterop' ];
var STRICT_FAMILY = [ 'noImplicitAny', 'strictNullChecks', 'strictFunctionTypes', 'strictBindCallApply', 'strictPropertyInitialization', 'noImplicitThis', 'useUnknownInCatchVariables', 'alwaysStrict' ];

// Aliases still allowed to be `any`, each with the ticket that removes it.
var LOOSE = {
	'Complex128': '0085',
	'Complex64': '0085'
};

function aliases() {
	var src = fs.readFileSync( path.join( ROOT, 'types', 'jsdoc-aliases.d.ts' ), 'utf8' );
	var out = {};
	src.replace( /^type (\w+)(?:<[^>]*>)? = ([^;]+);/gm, function each( m, name, rhs ) {
		out[ name ] = rhs.trim();
		return m;
	});
	return out;
}

test( 'tsconfig.json keeps strict mode on', function t() {
	var co = JSON.parse( fs.readFileSync( path.join( ROOT, 'tsconfig.json' ), 'utf8' ) ).compilerOptions;
	FLAGS.forEach( function each( f ) {
		assert.strictEqual( co[ f ], true, f + ' must be true' );
	});
	STRICT_FAMILY.forEach( function each( f ) {
		assert.notStrictEqual( co[ f ], false, f + ' must not be switched off (strict implies it)' );
	});
	assert.notStrictEqual( co.skipDefaultLibCheck, true );
});

test( 'stdlib imports resolve to stdlib\'s own type declarations', function t() {
	var co = JSON.parse( fs.readFileSync( path.join( ROOT, 'tsconfig.json' ), 'utf8' ) ).compilerOptions;
	assert.deepStrictEqual( co.paths[ '@stdlib/*/lib/index.js' ], [ './node_modules/@stdlib/*/docs/types/index.d.ts' ] );
});

test( 'only the listed aliases are any, and each listed one still is', function t() {
	var a = aliases();
	Object.keys( a ).forEach( function each( name ) {
		if ( /\bany\b/.test( a[ name ] ) && name !== 'Collection' ) {
			assert.ok( LOOSE[ name ], name + ' is `any` but has no ticket in LOOSE' );
		}
	});
	Object.keys( LOOSE ).forEach( function each( name ) {
		assert.ok( /\bany\b/.test( a[ name ] || '' ), name + ' is no longer `any`: remove it from LOOSE (ticket ' + LOOSE[ name ] + ')' );
	});
});

test( 'array aliases are stdlib\'s array types, option aliases literal unions', function t() {
	var a = aliases();
	assert.match( a.Complex128Array, /@stdlib\/types\/array/ );
	assert.match( a.Complex64Array, /@stdlib\/types\/array/ );
	[ 'MatrixTriangle', 'Layout', 'TransposeOperation', 'DiagonalType', 'OperationSide' ].forEach( function each( n ) {
		assert.match( a[ n ], /^'[a-z-]+'( \| '[a-z-]+')+$/, n + ' must be a union of literal option values' );
	});
});

test( 'an option family\'s `type` alias is exactly the union of its values (ticket 0089)', function t() {
	var opts = JSON.parse( fs.readFileSync( path.join( ROOT, 'spec', 'options.json' ), 'utf8' ) );
	var a = aliases();
	var typed = opts.families.filter( function f( o ) {
		return o.type;
	});
	assert.ok( typed.length > 0, 'no option family names a type' );
	typed.forEach( function each( o ) {
		var want = Object.keys( o.values ).map( function v( k ) {
			return o.values[ k ];
		}).sort();
		var got;
		assert.ok( a[ o.type ], o.type + ' (spec/options.json) is not in types/jsdoc-aliases.d.ts' );
		got = a[ o.type ].split( '|' ).map( function v( x ) {
			return x.trim().replace( /^'|'$/g, '' );
		}).sort();
		assert.deepStrictEqual( got, want, o.type );
	});
});
