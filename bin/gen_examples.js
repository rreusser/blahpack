#!/usr/bin/env node

/**
 * Generate examples/index.js for modules that currently have TODO stubs.
 *
 * Generates a basic example that creates random arrays and calls
 * both the layout wrapper and ndarray APIs.
 *
 * Usage:
 *   node bin/gen_examples.js [--all | module-path...]
 */

'use strict';

var fs = require( 'fs' );
var path = require( 'path' );
var util = require( './conformance/util.js' );

var LICENSE = [
	'/**',
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

// String param defaults
var STRING_DEFAULTS = {
	'order': '\'row-major\'',
	'trans': '\'no-transpose\'',
	'transa': '\'no-transpose\'',
	'transb': '\'no-transpose\'',
	'uplo': '\'upper\'',
	'side': '\'left\'',
	'diag': '\'non-unit\'',
	'job': '\'both\'',
	'jobvs': '\'V\'',
	'jobvl': '\'V\'',
	'jobvr': '\'V\'',
	'jobu': '\'A\'',
	'jobvt': '\'A\'',
	'jobz': '\'V\'',
	'compq': '\'V\'',
	'compz': '\'V\'',
	'fact': '\'N\'',
	'equed': '\'N\'',
	'norm': '\'1\'',
	'range': '\'A\'',
	'sort': '\'N\'',
	'sense': '\'N\'',
	'direct': '\'forward\'',
	'storev': '\'columnwise\'',
	'vect': '\'Q\'',
	'howmny': '\'A\'',
	'way': '\'1\'',
	'normin': '\'N\'',
	'transr': '\'no-transpose\'',
	'cmach': '\'E\''
};

var SCALAR_PARAMS = new Set([
	'alpha', 'beta', 'anorm', 'rcond', 'scale', 'safmin', 'sigma',
	'rho', 'tau', 'tol', 'abstol', 'vl', 'vu', 'pivmin', 'da', 'c', 's'
]);

var DIM_PARAMS = new Set([
	'N', 'M', 'K', 'nrhs', 'kl', 'ku', 'ilo', 'ihi', 'il', 'iu',
	'itype', 'ncvt', 'nru', 'ncc', 'nb', 'kb', 'mm', 'lwork'
]);

function extractExportedSignature( content ) {
	if ( !content ) {
		return null;
	}
	var exportMatch = content.match( /module\.exports\s*=\s*(\w+)/ );
	var m;
	if ( exportMatch ) {
		var fnName = exportMatch[ 1 ];
		m = content.match( new RegExp( 'function\\s+' + fnName + '\\s*\\(\\s*([^)]+)\\)' ) );
	}
	if ( !m ) {
		m = content.match( /function\s+\w+\(\s*([^)]+)\)/ );
	}
	if ( !m ) {
		return null;
	}
	var params = m[ 1 ].split( /,\s*/ ).map( function( s ) { return s.trim(); });
	if ( params.length === 1 && params[ 0 ] === '' ) {
		return null;
	}
	return params;
}

// Detect arrays from stride companions
function detectArrays( params ) {
	var arrays2D = new Set();
	var arrays1D = new Set();
	var i, p, sm;
	for ( i = 0; i < params.length; i++ ) {
		p = params[ i ];
		sm = p.match( /^stride(.+?)([12])$/ );
		if ( sm ) {
			var arrName = sm[ 1 ];
			params.forEach( function( np ) {
				if ( np.toLowerCase() === arrName.toLowerCase() ) {
					arrays2D.add( np );
				}
			});
			continue;
		}
		sm = p.match( /^stride(.+)$/ );
		if ( sm && sm[ 1 ] ) {
			var arrName2 = sm[ 1 ];
			params.forEach( function( np ) {
				if ( np.toLowerCase() === arrName2.toLowerCase() && !arrays2D.has( np ) ) {
					arrays1D.add( np );
				}
			});
		}
	}
	return { arrays2D: arrays2D, arrays1D: arrays1D };
}

function generateExample( routine, mod ) {
	var routinePath = path.join( mod.dir, 'lib', routine + '.js' );
	var ndarrayPath = path.join( mod.dir, 'lib', 'ndarray.js' );
	var basePath = path.join( mod.dir, 'lib', 'base.js' );

	var routineContent = fs.existsSync( routinePath ) ? fs.readFileSync( routinePath, 'utf8' ) : null;
	var ndarrayContent = fs.existsSync( ndarrayPath ) ? fs.readFileSync( ndarrayPath, 'utf8' ) : null;
	var baseContent = fs.existsSync( basePath ) ? fs.readFileSync( basePath, 'utf8' ) : null;

	var layoutParams = extractExportedSignature( routineContent );
	var ndarrayParams = extractExportedSignature( ndarrayContent ) || extractExportedSignature( baseContent );

	if ( !ndarrayParams ) {
		return null;
	}

	var arrays = detectArrays( ndarrayParams );
	var allArrays = Array.from( arrays.arrays2D ).concat( Array.from( arrays.arrays1D ) );
	var pkgName = '@stdlib/' + mod.pkg + '/base/' + routine;

	var lines = [];
	lines.push( LICENSE );
	lines.push( '' );
	lines.push( '\'use strict\';' );
	lines.push( '' );

	// Imports
	if ( allArrays.length > 0 ) {
		lines.push( 'var discreteUniform = require( \'@stdlib/random/array/discrete-uniform\' );' );
	}
	lines.push( 'var ' + routine + ' = require( \'./../lib\' );' );
	lines.push( '' );

	// Create options and arrays
	if ( allArrays.length > 0 ) {
		lines.push( 'var opts = {' );
		lines.push( '\t\'dtype\': \'float64\'' );
		lines.push( '};' );
		lines.push( 'var N = 3;' );

		allArrays.forEach( function( arr ) {
			var size = arrays.arrays2D.has( arr ) ? 'N * N' : 'N';
			lines.push( 'var ' + arr + ' = discreteUniform( ' + size + ', -10, 10, opts );' );
		});
		lines.push( '' );
	}

	// Layout wrapper call
	if ( layoutParams ) {
		lines.push( '// Using the standard interface:' );
		var layoutArgs = layoutParams.map( function( p ) {
			var lower = p.toLowerCase();
			if ( STRING_DEFAULTS[ lower ] ) {
				return STRING_DEFAULTS[ lower ];
			}
			if ( allArrays.some( function( a ) { return a.toLowerCase() === p.toLowerCase(); }) ) {
				return p;
			}
			if ( SCALAR_PARAMS.has( lower ) ) {
				return '1.0';
			}
			if ( /^LD[A-Z]+$/.test( p ) ) {
				return 'N';
			}
			if ( /^stride/.test( p ) ) {
				return '1';
			}
			if ( DIM_PARAMS.has( p ) ) {
				return 'N';
			}
			return '1';
		});
		lines.push( 'var out = ' + routine + '( ' + layoutArgs.join( ', ' ) + ' );' );
		lines.push( 'console.log( out );' );
		lines.push( '' );
	}

	// ndarray call
	if ( layoutParams ) {
		lines.push( '// Using the ndarray interface:' );
	}
	var ndarrayArgs = ndarrayParams.map( function( p ) {
		var lower = p.toLowerCase();
		if ( STRING_DEFAULTS[ lower ] ) {
			return STRING_DEFAULTS[ lower ];
		}
		if ( allArrays.some( function( a ) { return a.toLowerCase() === p.toLowerCase(); }) ) {
			return p;
		}
		if ( SCALAR_PARAMS.has( lower ) ) {
			return '1.0';
		}
		if ( /^stride.+[12]$/.test( p ) ) {
			return /1$/.test( p ) ? 'N' : '1';
		}
		if ( /^stride/.test( p ) ) {
			return '1';
		}
		if ( /^offset/.test( p ) ) {
			return '0';
		}
		if ( DIM_PARAMS.has( p ) ) {
			return 'N';
		}
		return '1';
	});
	if ( layoutParams ) {
		lines.push( 'out = ' + routine + '.ndarray( ' + ndarrayArgs.join( ', ' ) + ' );' );
	} else {
		lines.push( 'var out = ' + routine + '( ' + ndarrayArgs.join( ', ' ) + ' );' );
	}
	lines.push( 'console.log( out );' );
	lines.push( '' );

	return lines.join( '\n' );
}

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
		console.error( 'Usage: node bin/gen_examples.js [--all | module-path...]' );
		process.exit( 1 );
	}

	var generated = 0;
	var skipped = 0;
	var errors = [];

	modules.forEach( function( mod ) {
		var exDir = path.join( mod.dir, 'examples' );
		var exPath = path.join( exDir, 'index.js' );

		// Only overwrite stubs
		if ( fs.existsSync( exPath ) ) {
			var existing = fs.readFileSync( exPath, 'utf8' );
			if ( existing.indexOf( 'TODO' ) < 0 ) {
				skipped++;
				return;
			}
		}

		if ( !fs.existsSync( exDir ) ) {
			fs.mkdirSync( exDir, { recursive: true } );
		}

		try {
			var content = generateExample( mod.routine, mod );
			if ( !content ) {
				errors.push( mod.routine + ': could not generate' );
				return;
			}
			fs.writeFileSync( exPath, content );
			generated++;
		} catch ( e ) {
			errors.push( mod.routine + ': ' + e.message );
		}
	});

	console.log( 'Generated: ' + generated + ', Skipped (already working): ' + skipped );
	if ( errors.length > 0 ) {
		console.log( 'Errors (' + errors.length + '):' );
		errors.forEach( function( e ) { console.log( '  ' + e ); });
	}
}

main();
