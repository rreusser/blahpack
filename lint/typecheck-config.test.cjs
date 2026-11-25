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

test( 'every input option is typed as the literal union of its values (tickets 0022, 0089)', function t() {
	// lint/lib/jsdoc-spec.cjs derives the JSDoc type of each option parameter
	// from its spec; spec-jsdoc makes lib/ agree. Loosening it to `string`
	// would leave tsc unable to see a misspelled option.
	var J = require( './lib/jsdoc-spec.cjs' );
	var specLib = require( './lib/spec.cjs' );
	var opts = JSON.parse( fs.readFileSync( path.join( ROOT, 'spec', 'options.json' ), 'utf8' ) );
	var a = aliases();
	var loose = [];
	var n = 0;
	fs.readdirSync( path.join( ROOT, 'spec' ) ).forEach( function each( f ) {
		var spec;
		var types = {};
		if ( !/^[a-z].*\.json$/.test( f ) || f === 'options.json' || f === 'schema.json' ) {
			return;
		}
		spec = JSON.parse( fs.readFileSync( path.join( ROOT, 'spec', f ), 'utf8' ) );
		J.params( spec, 'ndarray', specLib.strided( spec ) ).forEach( function each( p ) {
			types[ p.name ] = p.type;
		});
		( spec.params || [] ).forEach( function each( p ) {
			var t;
			if ( p.role !== 'flag' || p.intent !== 'in' || !( p.name in types ) ) {
				return;
			}
			n += 1;
			t = types[ p.name ];
			t = ( a[ t ] ) ? a[ t ] : t;
			if ( !/^\(?'[^']*'( ?\| ?'[^']*')*\)?$/.test( t ) ) {
				loose.push( spec.routine + '.' + p.name + ': ' + types[ p.name ] );
			}
		});
	});
	assert.ok( n > 900, 'only ' + n + ' option parameters seen' );
	assert.ok( opts.families.length > 0 );
	assert.deepStrictEqual( loose, [], 'option parameters not typed as literal unions' );
});
