#!/usr/bin/env node

/**
 * Generate improved README.md for each module.
 *
 * Produces both layout wrapper and ndarray API documentation with
 * parameter tables and code examples.
 *
 * Usage:
 *   node bin/gen_readme.js [--all | module-path...]
 */

'use strict';

var fs = require( 'fs' );
var path = require( 'path' );
var util = require( './gate/util.js' );

// Clean, curated descriptions keyed by routine name (see
// bin/gen-descriptions.js). Preferred over the JSDoc-derived summary, which
// is only the first physical line and is often a truncated fragment.
var CLEAN_DESCS = {};
try {
	CLEAN_DESCS = JSON.parse( fs.readFileSync( path.join( __dirname, '..', 'data', 'descriptions.generated.json' ), 'utf8' ) );
} catch ( err ) {
	CLEAN_DESCS = {};
}

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
	var params = m[ 1 ].split( /,\s*/ ).map( function( s ) {
		return s.trim();
	});
	if ( params.length === 1 && params[ 0 ] === '' ) {
		return null;
	}
	return params;
}

function getDescription( content ) {
	if ( !content ) {
		return '';
	}
	var m = content.match( /\/\*\*\s*\n\s*\*\s*([^@\n][^\n]+)/ );
	if ( m ) {
		return m[ 1 ].trim().replace( /\.\s*$/, '' );
	}
	return '';
}

function paramDesc( name ) {
	var descs = {
		'order': 'storage layout (`\'row-major\'` or `\'column-major\'`).',
		'trans': 'specifies whether the matrix should be transposed.',
		'transa': 'specifies the operation for matrix `A`.',
		'transb': 'specifies the operation for matrix `B`.',
		'uplo': 'specifies whether the upper or lower triangular part is referenced.',
		'side': 'specifies the side of the operation.',
		'diag': 'specifies whether the matrix is unit triangular.',
		'M': 'number of rows.',
		'N': 'number of columns.',
		'K': 'inner dimension.',
		'alpha': 'scalar constant.',
		'beta': 'scalar constant.',
		'nrhs': 'number of right-hand sides.',
		'kl': 'number of subdiagonals.',
		'ku': 'number of superdiagonals.'
	};
	if ( descs[ name ] ) {
		return descs[ name ];
	}
	if ( /^LD[A-Z]+$/.test( name ) ) {
		var mat = name.replace( /^LD/, '' );
		return 'leading dimension of `' + mat + '`.';
	}
	if ( /^stride(.+)[12]$/.test( name ) ) {
		var m2 = name.match( /^stride(.+?)([12])$/ );
		return 'stride of dimension ' + m2[ 2 ] + ' of `' + m2[ 1 ] + '`.';
	}
	if ( /^stride(.+)$/.test( name ) ) {
		var arr = name.replace( /^stride/, '' );
		return 'stride length for `' + arr + '`.';
	}
	if ( /^offset(.+)$/.test( name ) ) {
		var arr2 = name.replace( /^offset/, '' );
		return 'starting index for `' + arr2 + '`.';
	}
	if ( /^[A-Z]/.test( name ) ) {
		return 'input array `' + name + '`.';
	}
	return '`' + name + '`.';
}

function generateReadme( routine, mod ) {
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

	var desc = CLEAN_DESCS[ routine.toLowerCase() ] || getDescription( ndarrayContent ) || getDescription( baseContent ) || getDescription( routineContent ) || routine;
	var pkgName = '@stdlib/' + mod.pkg + '/base/' + routine;

	var lines = [];

	// Header
	lines.push( '<!--' );
	lines.push( '' );
	lines.push( '@license Apache-2.0' );
	lines.push( '' );
	lines.push( 'Copyright (c) 2025 The Stdlib Authors.' );
	lines.push( '' );
	lines.push( 'Licensed under the Apache License, Version 2.0 (the "License");' );
	lines.push( 'you may not use this file except in compliance with the License.' );
	lines.push( 'You may obtain a copy of the License at' );
	lines.push( '' );
	lines.push( '   http://www.apache.org/licenses/LICENSE-2.0' );
	lines.push( '' );
	lines.push( 'Unless required by applicable law or agreed to in writing, software' );
	lines.push( 'distributed under the License is distributed on an "AS IS" BASIS,' );
	lines.push( 'WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.' );
	lines.push( 'See the License for the specific language governing permissions and' );
	lines.push( 'limitations under the License.' );
	lines.push( '' );
	lines.push( '-->' );
	lines.push( '' );
	lines.push( '# ' + routine );
	lines.push( '' );
	lines.push( '> ' + desc + '.' );
	lines.push( '' );

	// Usage section
	lines.push( '<section class="usage">' );
	lines.push( '' );
	lines.push( '## Usage' );
	lines.push( '' );
	lines.push( '```javascript' );
	lines.push( 'var ' + routine + ' = require( \'' + pkgName + '\' );' );
	lines.push( '```' );
	lines.push( '' );

	// Layout wrapper API
	if ( layoutParams ) {
		var layoutSig = routine + '( ' + layoutParams.join( ', ' ) + ' )';
		lines.push( '#### ' + layoutSig );
		lines.push( '' );
		lines.push( desc + '.' );
		lines.push( '' );
		lines.push( '```javascript' );
		lines.push( 'var Float64Array = require( \'@stdlib/array/float64\' );' );
		lines.push( '' );
		lines.push( '// TODO: Add usage example' );
		lines.push( '```' );
		lines.push( '' );
		lines.push( 'The function has the following parameters:' );
		lines.push( '' );
		var i;
		for ( i = 0; i < layoutParams.length; i++ ) {
			lines.push( '-   **' + layoutParams[ i ] + '**: ' + paramDesc( layoutParams[ i ] ) );
		}
		lines.push( '' );
	}

	// ndarray API
	var ndarraySig;
	if ( layoutParams ) {
		ndarraySig = routine + '.ndarray( ' + ndarrayParams.join( ', ' ) + ' )';
	} else {
		ndarraySig = routine + '( ' + ndarrayParams.join( ', ' ) + ' )';
	}
	lines.push( '#### ' + ndarraySig );
	lines.push( '' );
	if ( layoutParams ) {
		lines.push( desc + ', using alternative indexing semantics.' );
	} else {
		lines.push( desc + '.' );
	}
	lines.push( '' );
	lines.push( '```javascript' );
	lines.push( 'var Float64Array = require( \'@stdlib/array/float64\' );' );
	lines.push( '' );
	lines.push( '// TODO: Add usage example' );
	lines.push( '```' );
	lines.push( '' );
	if ( layoutParams ) {
		lines.push( 'The function has the following additional parameters:' );
	} else {
		lines.push( 'The function has the following parameters:' );
	}
	lines.push( '' );
	var ndarrayOnly = ndarrayParams;
	if ( layoutParams ) {
		// Only show params unique to ndarray (strides/offsets)
		var layoutSet = new Set( layoutParams );
		ndarrayOnly = ndarrayParams.filter( function( p ) {
			return !layoutSet.has( p );
		});
	}
	for ( i = 0; i < ndarrayOnly.length; i++ ) {
		lines.push( '-   **' + ndarrayOnly[ i ] + '**: ' + paramDesc( ndarrayOnly[ i ] ) );
	}
	lines.push( '' );
	lines.push( '</section>' );
	lines.push( '' );
	lines.push( '<!-- /.usage -->' );
	lines.push( '' );

	// Notes section
	lines.push( '<section class="notes">' );
	lines.push( '' );
	lines.push( '## Notes' );
	lines.push( '' );
	lines.push( '-   `' + routine + '()` corresponds to the [LAPACK][lapack] level routine [`' + routine + '`][lapack-' + routine + '].' );
	lines.push( '' );
	lines.push( '</section>' );
	lines.push( '' );
	lines.push( '<!-- /.notes -->' );
	lines.push( '' );

	// Examples section
	lines.push( '<section class="examples">' );
	lines.push( '' );
	lines.push( '## Examples' );
	lines.push( '' );
	lines.push( '<!-- eslint no-undef: "error" -->' );
	lines.push( '' );
	lines.push( '```javascript' );
	lines.push( 'var ' + routine + ' = require( \'' + pkgName + '\' );' );
	lines.push( '' );
	lines.push( '// TODO: Add examples' );
	lines.push( '```' );
	lines.push( '' );
	lines.push( '</section>' );
	lines.push( '' );
	lines.push( '<!-- /.examples -->' );
	lines.push( '' );

	// Related section
	lines.push( '<!-- Section for related `stdlib` packages. Do not manually edit this section, as it is automatically populated. -->' );
	lines.push( '' );
	lines.push( '<section class="related">' );
	lines.push( '' );
	lines.push( '</section>' );
	lines.push( '' );
	lines.push( '<!-- /.related -->' );
	lines.push( '' );

	// Links section
	lines.push( '<!-- Section for all links. Make sure to keep an empty line after the `section` element and another before the `/section` close. -->' );
	lines.push( '' );
	lines.push( '<section class="links">' );
	lines.push( '' );
	lines.push( '[lapack]: https://www.netlib.org/lapack/explore-html/' );
	lines.push( '' );
	lines.push( '[lapack-' + routine + ']: https://www.netlib.org/lapack/explore-html/d5/d2f/group__' + routine + '.html' );
	lines.push( '' );
	lines.push( '[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array' );
	lines.push( '' );
	lines.push( '[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray' );
	lines.push( '' );
	lines.push( '</section>' );
	lines.push( '' );
	lines.push( '<!-- /.links -->' );

	return lines.join( '\n' );
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
		console.error( 'Usage: node bin/gen_readme.js [--all | module-path...]' );
		process.exit( 1 );
	}

	var generated = 0;
	var errors = [];

	modules.forEach( function( mod ) {
		try {
			var content = generateReadme( mod.routine, mod );
			if ( !content ) {
				errors.push( mod.routine + ': could not generate' );
				return;
			}
			fs.writeFileSync( path.join( mod.dir, 'README.md' ), content );
			generated++;
		} catch ( e ) {
			errors.push( mod.routine + ': ' + e.message );
		}
	});

	console.log( 'Generated: ' + generated );
	if ( errors.length > 0 ) {
		console.log( 'Errors (' + errors.length + '):' );
		errors.forEach( function( e ) { console.log( '  ' + e ); });
	}
}

main();
