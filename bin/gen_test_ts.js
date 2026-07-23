#!/usr/bin/env node

/**
 * Generate docs/types/test.ts for each module.
 *
 * The parameter shape (names/types) comes from the committed index.d.ts, but
 * the asserted RETURN type comes from the implementation JSDoc via
 * return_type.js — independently of index.d.ts. That independence is the whole
 * point: type-checking the generated test.ts against index.d.ts then asserts
 * the public declaration's return type actually matches the code.
 *
 * Usage:
 *   node bin/gen_test_ts.js [--all | module-path...]
 */

'use strict';

var fs = require( 'fs' );
var path = require( 'path' );
var util = require( './conformance/util.js' );
var returnType = require( './return_type.js' );

var LICENSE = [
	'/*',
	'* @license Apache-2.0',
	'*',
	'* Copyright (c) 2025 The Stdlib Authors.',
	'*',
	'* Licensed under the Apache License, Version 2.0 (the "License");',
	'* you may not use this file except in compliance with the License.',
	'* You may obtain a copy of the License at',
	'*',
	'*    http://www.apache.org/licenses/LICENSE-2.0',
	'*',
	'* Unless required by applicable law or agreed to in writing, software',
	'* distributed under the License is distributed on an "AS IS" BASIS,',
	'* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.',
	'* See the License for the specific language governing permissions and',
	'* limitations under the License.',
	'*/'
].join( '\n' );

// A valid literal for each parameter type.
var DEFAULTS = {
	'number': '10',
	'boolean': 'true',
	'string': '\'no-transpose\'',
	'Layout': '\'row-major\'',
	'TransposeOperation': '\'no-transpose\'',
	'MatrixTriangle': '\'upper\'',
	'OperationSide': '\'left\'',
	'DiagonalType': '\'unit\'',
	'Float64Array': 'new Float64Array( 25 )',
	'Float32Array': 'new Float32Array( 25 )',
	'Int32Array': 'new Int32Array( 25 )',
	'Complex128Array': 'zx',
	'Complex64Array': 'zx',
	'Function': '(): boolean => true'
};

// Values that must NOT type-check for each parameter type. For the string-enum
// types a plain number/boolean/etc. is a reliable negative; we deliberately do
// not use look-alike strings (an out-of-union string is also an error but adds
// no signal here).
var WRONG = {
	'number': [ '\'10\'', 'true', 'false', 'null', 'undefined', '[]', '{}' ],
	'boolean': [ '\'10\'', '10', 'null', 'undefined', '[]', '{}' ],
	'string': [ '10', 'true', 'null', 'undefined', '[]', '{}' ],
	'Layout': [ '10', 'true', 'null', 'undefined', '[]', '{}' ],
	'TransposeOperation': [ '10', 'true', 'null', 'undefined', '[]', '{}' ],
	'MatrixTriangle': [ '10', 'true', 'null', 'undefined', '[]', '{}' ],
	'OperationSide': [ '10', 'true', 'null', 'undefined', '[]', '{}' ],
	'DiagonalType': [ '10', 'true', 'null', 'undefined', '[]', '{}' ],
	'Float64Array': [ '\'10\'', '10', 'true', 'null', 'undefined', '[]', '{}' ],
	'Float32Array': [ '\'10\'', '10', 'true', 'null', 'undefined', '[]', '{}' ],
	'Int32Array': [ '\'10\'', '10', 'true', 'null', 'undefined', '[]', '{}' ],
	'Complex128Array': [ '\'10\'', '10', 'true', 'null', 'undefined', '[]', '{}' ],
	'Complex64Array': [ '\'10\'', '10', 'true', 'null', 'undefined', '[]', '{}' ],
	'Function': [ '\'10\'', '10', 'true', 'null', 'undefined', '[]', '{}' ]
};

// Return types simple enough to assert exactly with `$ExpectType`. Object
// literals / Record are intentionally excluded (only assert the call
// type-checks) because their printed form is brittle to match.
var ASSERTABLE = {
	'number': true,
	'boolean': true,
	'string': true,
	'void': true,
	'Float64Array': true,
	'Float32Array': true,
	'Int32Array': true,
	'Complex128Array': true,
	'Complex64Array': true
};


// HELPERS //

/**
 * Parse the primary call signature `( ... ): Ret` from a Routine interface.
 *
 * @returns {?Object} { params: [ { name, type } ] } or null
 */
function parseSignature( content ) {
	var m = content.match( /interface Routine\s*\{[\s\S]*?\n\t\(\s*([\s\S]*?)\)\s*:/ );
	if ( !m ) {
		// Single-signature form: first `( ... ):` after the interface open.
		m = content.match( /interface Routine\s*\{[\s\S]*?\(\s*([\s\S]*?)\)\s*:/ );
	}
	if ( !m ) {
		return null;
	}
	var params = m[ 1 ]
		.split( ',' )
		.map( function pick( chunk ) {
			var mm = chunk.match( /(\w+)\s*:\s*([A-Za-z0-9_]+)/ );
			return mm ? { 'name': mm[ 1 ], 'type': mm[ 2 ] } : null;
		})
		.filter( Boolean );
	return params.length ? { 'params': params } : null;
}

function arg( type ) {
	return DEFAULTS[ type ] || '0';
}

function validCall( routine, params ) {
	return routine + '( ' + params.map( function a( p ) { return arg( p.type ); } ).join( ', ' ) + ' )';
}

function wrongCall( routine, params, idx, value ) {
	var args = params.map( function a( p, i ) { return i === idx ? value : arg( p.type ); } );
	return routine + '( ' + args.join( ', ' ) + ' )';
}

var ORDINAL = [ '', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth',
	'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth', 'thirteenth',
	'fourteenth', 'fifteenth', 'sixteenth', 'seventeenth', 'eighteenth',
	'nineteenth', 'twentieth' ];

function ordinal( n ) {
	return ORDINAL[ n ] || ( n + 'th' );
}


// MAIN //

function generate( routine, params, retTs, needsComplex ) {
	var lines = [];
	lines.push( LICENSE );
	lines.push( '' );
	if ( needsComplex ) {
		lines.push( '/// <reference types="@stdlib/types"/>' );
		lines.push( '' );
		lines.push( 'import { Complex128Array } from \'@stdlib/types/array\';' );
		lines.push( '' );
	}
	lines.push( 'import ' + routine + ' = require( \'./index\' );' );
	lines.push( '' );
	lines.push( '' );
	lines.push( '// TESTS //' );
	lines.push( '' );

	if ( needsComplex ) {
		lines.push( 'const zx = null as unknown as Complex128Array;' );
		lines.push( '' );
	}

	// Valid call. For ASSERTABLE returns, pin the exact return type; for
	// object-literal / unknown returns just require the call to type-check
	// (their printed form is too brittle to match on).
	if ( ASSERTABLE[ retTs ] ) {
		lines.push( '// The function returns ' + ( retTs === 'number' ? 'a number' : ( retTs === 'void' ? 'void' : 'a ' + retTs ) ) + '...' );
		lines.push( '{' );
		lines.push( '\t' + validCall( routine, params ) + '; // $ExpectType ' + retTs );
		lines.push( '}' );
	} else {
		lines.push( '// The function is callable with the documented arguments...' );
		lines.push( '{' );
		lines.push( '\t' + validCall( routine, params ) + ';' );
		lines.push( '}' );
	}
	lines.push( '' );

	// Per-parameter wrong-type assertions.
	params.forEach( function param( p, i ) {
		var wrongs = WRONG[ p.type ];
		if ( !wrongs || wrongs.length === 0 ) {
			return;
		}
		lines.push( '// The compiler throws an error if provided a ' + ordinal( i + 1 ) + ' argument of invalid type...' );
		lines.push( '{' );
		wrongs.forEach( function w( value ) {
			lines.push( '\t' + wrongCall( routine, params, i, value ) + '; // $ExpectError' );
		});
		lines.push( '}' );
		lines.push( '' );
	});

	// Argument-count assertions.
	lines.push( '// The compiler throws an error if provided an unsupported number of arguments...' );
	lines.push( '{' );
	lines.push( '\t' + routine + '(); // $ExpectError' );
	if ( params.length > 1 ) {
		lines.push( '\t' + routine + '( ' + arg( params[ 0 ].type ) + ' ); // $ExpectError' );
	}
	lines.push( '}' );
	lines.push( '' );

	return lines.join( '\n' );
}


function main() {
	var args = process.argv.slice( 2 );
	var all = args.indexOf( '--all' ) >= 0;
	args = args.filter( function keep( a ) { return a !== '--all'; } );

	var modules;
	if ( all ) {
		modules = util.discoverModules();
	} else if ( args.length > 0 ) {
		modules = args.map( function res( a ) { return util.resolveModule( a ); } ).filter( Boolean );
	} else {
		console.error( 'Usage: node bin/gen_test_ts.js [--all | module-path...]' );
		process.exit( 1 );
	}

	var generated = 0;
	var errors = [];

	modules.forEach( function each( mod ) {
		var dtsPath = path.join( mod.dir, 'docs', 'types', 'index.d.ts' );
		if ( !fs.existsSync( dtsPath ) ) {
			errors.push( mod.routine + ': missing index.d.ts' );
			return;
		}
		var sig = parseSignature( fs.readFileSync( dtsPath, 'utf8' ) );
		if ( !sig ) {
			errors.push( mod.routine + ': could not parse index.d.ts signature' );
			return;
		}

		// Return type from the implementation (source of truth).
		var ndPath = path.join( mod.dir, 'lib', 'ndarray.js' );
		var basePath = path.join( mod.dir, 'lib', 'base.js' );
		var impl = fs.existsSync( ndPath ) ? fs.readFileSync( ndPath, 'utf8' ) :
			( fs.existsSync( basePath ) ? fs.readFileSync( basePath, 'utf8' ) : '' );
		var retTs = returnType.fromImpl( impl ).ts;

		var needsComplex = sig.params.some( function isC( p ) {
			return p.type === 'Complex128Array' || p.type === 'Complex64Array';
		}) || retTs === 'Complex128Array' || retTs === 'Complex64Array';

		var out = generate( mod.routine, sig.params, retTs, needsComplex );
		fs.writeFileSync( path.join( mod.dir, 'docs', 'types', 'test.ts' ), out );
		generated++;
	});

	console.log( 'Generated: ' + generated );
	if ( errors.length ) {
		console.log( 'Errors (' + errors.length + '):' );
		errors.forEach( function e( msg ) { console.log( '  ' + msg ); } );
	}
}

main();
