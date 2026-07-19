#!/usr/bin/env node

/**
 * Generate docs/types/test.ts for each module from its index.d.ts.
 *
 * Parses the Routine interface to get parameter names/types and return type,
 * then generates TypeScript compile-time assertion tests.
 *
 * Usage:
 *   node bin/gen_test_ts.js [--all | module-path...]
 */

'use strict';

var fs = require( 'fs' );
var path = require( 'path' );
var util = require( './conformance/util.js' );

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

// Default values for each type
var DEFAULTS = {
	'string': '\'no-transpose\'',
	'number': '10',
	'Float64Array': 'new Float64Array( 25 )',
	'Complex128Array': 'new Float64Array( 50 )',
	'Int32Array': 'new Int32Array( 25 )',
	'any': '1.0',
	'boolean': 'true',
	'Function': '(): boolean => true'
};

// Wrong-type values for each expected type
var WRONG_TYPES = {
	'string': [ '10', 'true', 'false', 'null', 'undefined', '[]', '{}' ],
	'number': [ '\'10\'', 'true', 'false', 'null', 'undefined', '[]', '{}' ],
	'Float64Array': [ '\'10\'', '10', 'true', 'false', 'null', 'undefined', '[]', '{}' ],
	'Complex128Array': [ '\'10\'', '10', 'true', 'false', 'null', 'undefined', '[]', '{}' ],
	'Int32Array': [ '\'10\'', '10', 'true', 'false', 'null', 'undefined', '[]', '{}' ],
	'any': [],
	'boolean': [ '\'10\'', '10', 'null', 'undefined', '[]', '{}' ],
	'Function': [ '\'10\'', '10', 'true', 'false', 'null', 'undefined', '[]', '{}' ]
};

/**
 * Parse an index.d.ts to extract the Routine interface signature.
 */
function parseDeclaration( content ) {
	// Find the main call signature in the Routine interface
	var sigMatch = content.match( /interface Routine[\s\S]*?\(\s*([\s\S]*?)\):\s*(\w+)/ );
	if ( !sigMatch ) {
		return null;
	}

	var paramsStr = sigMatch[ 1 ];
	var returnType = sigMatch[ 2 ];

	// Parse each param line
	var paramLines = paramsStr.split( '\n' ).filter( function( l ) {
		return /\w+:\s*\w+/.test( l );
	});

	var params = paramLines.map( function( line ) {
		var m = line.match( /(\w+):\s*(\w+)/ );
		if ( !m ) {
			return null;
		}
		return { name: m[ 1 ], type: m[ 2 ] };
	}).filter( Boolean );

	return {
		params: params,
		returnType: returnType
	};
}

/**
 * Generate a valid call expression.
 */
function validCall( routine, params ) {
	var args = params.map( function( p ) {
		return DEFAULTS[ p.type ] || '0';
	});
	return routine + '( ' + args.join( ', ' ) + ' )';
}

/**
 * Generate a call with one param replaced by a wrong type.
 */
function invalidCall( routine, params, paramIdx, wrongValue ) {
	var args = params.map( function( p, i ) {
		if ( i === paramIdx ) {
			return wrongValue;
		}
		return DEFAULTS[ p.type ] || '0';
	});
	return routine + '( ' + args.join( ', ' ) + ' )';
}

/**
 * Generate the test.ts content.
 */
function generateTestTS( routine, sig ) {
	var lines = [];
	lines.push( LICENSE );
	lines.push( '' );
	lines.push( 'import ' + routine + ' = require( \'./index\' );' );
	lines.push( '' );
	lines.push( '' );
	lines.push( '// TESTS //' );
	lines.push( '' );

	// Valid call — return type assertion
	lines.push( '// The function returns ' + ( sig.returnType === 'number' ? 'a number' : 'a ' + sig.returnType ) + '...' );
	lines.push( '{' );
	lines.push( '\t' + validCall( routine, sig.params ) + '; // $ExpectType ' + sig.returnType );
	lines.push( '}' );
	lines.push( '' );

	// Invalid type tests for each parameter
	var i, j, p, wrongs;
	for ( i = 0; i < sig.params.length; i++ ) {
		p = sig.params[ i ];
		wrongs = WRONG_TYPES[ p.type ];
		if ( !wrongs || wrongs.length === 0 ) {
			continue;
		}

		lines.push( '// The compiler throws an error if the function is provided a ' + ordinalWord( i + 1 ) + ' argument which is not ' + articleFor( p.type ) + ' ' + p.type + '...' );
		lines.push( '{' );
		for ( j = 0; j < wrongs.length; j++ ) {
			lines.push( '\t' + invalidCall( routine, sig.params, i, wrongs[ j ] ) + '; // $ExpectError' );
		}
		lines.push( '}' );
		lines.push( '' );
	}

	// Unsupported number of arguments
	lines.push( '// The compiler throws an error if the function is provided an unsupported number of arguments...' );
	lines.push( '{' );
	lines.push( '\t' + routine + '(); // $ExpectError' );
	if ( sig.params.length > 1 ) {
		var partial = sig.params.slice( 0, 1 ).map( function( p ) {
			return DEFAULTS[ p.type ] || '0';
		});
		lines.push( '\t' + routine + '( ' + partial.join( ', ' ) + ' ); // $ExpectError' );
	}
	lines.push( '}' );
	lines.push( '' );

	return lines.join( '\n' );
}

function ordinalWord( n ) {
	var words = [ '', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth',
		'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth',
		'thirteenth', 'fourteenth', 'fifteenth', 'sixteenth', 'seventeenth',
		'eighteenth', 'nineteenth', 'twentieth' ];
	return words[ n ] || ( n + 'th' );
}

function articleFor( type ) {
	if ( type === 'Int32Array' ) {
		return 'an';
	}
	return 'a';
}

// ── Main ──

function main() {
	var args = process.argv.slice( 2 );
	var all = args.indexOf( '--all' ) >= 0;
	args = args.filter( function( a ) { return a !== '--all'; });

	var modules;
	if ( all ) {
		modules = util.discoverModules();
	} else if ( args.length > 0 ) {
		modules = args.map( function( a ) { return util.resolveModule( a ); }).filter( Boolean );
	} else {
		console.error( 'Usage: node bin/gen_test_ts.js [--all | module-path...]' );
		process.exit( 1 );
	}

	var generated = 0;
	var skipped = 0;
	var errors = [];

	modules.forEach( function( mod ) {
		var dtsPath = path.join( mod.dir, 'docs', 'types', 'index.d.ts' );
		if ( !fs.existsSync( dtsPath ) ) {
			skipped++;
			return;
		}

		var content = fs.readFileSync( dtsPath, 'utf8' );
		var sig = parseDeclaration( content );
		if ( !sig || sig.params.length === 0 ) {
			errors.push( mod.routine + ': could not parse index.d.ts' );
			return;
		}

		var testContent = generateTestTS( mod.routine, sig );
		var testPath = path.join( mod.dir, 'docs', 'types', 'test.ts' );
		fs.writeFileSync( testPath, testContent );
		generated++;
	});

	console.log( 'Generated: ' + generated + ', Skipped: ' + skipped );
	if ( errors.length > 0 ) {
		console.log( 'Errors (' + errors.length + '):' );
		errors.forEach( function( e ) { console.log( '  ' + e ); });
	}
}

main();
