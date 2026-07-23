#!/usr/bin/env node

/**
 * Generate improved docs/types/index.d.ts for each module.
 *
 * Reads <routine>.js and ndarray.js/base.js to produce type declarations
 * with both layout wrapper and ndarray signatures, proper @stdlib/types
 * imports, and JSDoc.
 *
 * Usage:
 *   node bin/gen_index_dts.js [--all | module-path...]
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

// Map param names to stdlib types
var TYPED_PARAMS = {
	'order': { type: 'Layout', import: 'Layout' },
	'trans': { type: 'TransposeOperation', import: 'TransposeOperation' },
	'transa': { type: 'TransposeOperation', import: 'TransposeOperation' },
	'transb': { type: 'TransposeOperation', import: 'TransposeOperation' },
	'uplo': { type: 'MatrixTriangle', import: 'MatrixTriangle' },
	'side': { type: 'OperationSide', import: 'OperationSide' },
	'diag': { type: 'DiagonalType', import: 'DiagonalType' }
};

// Param type for typed arrays (detect from param name patterns)
var ARRAY_PATTERNS = {
	'Float64Array': /^[A-Z]|^[a-z]$/,
	'Int32Array': /^IPIV|^JPIV|^IWORK|^ISUPPZ|^IBLOCK|^ISPLIT|^IDX|^IDXP|^IDXQ|^PERM|^GIVCOL|^BWORK|^SELECT$/
};

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
	return m[ 1 ].split( /,\s*/ ).map( function( s ) {
		return s.trim();
	});
}

function getDescription( content ) {
	if ( !content ) {
		return '';
	}
	// Use the JSDoc block attached to the exported function (the last block
	// before its declaration), NOT the file's `@license` header block.
	var name = returnType.exportedName( content );
	var head = content;
	if ( name ) {
		var idx = content.search( new RegExp( 'function\\s+' + name + '\\s*\\(' ) );
		if ( idx >= 0 ) {
			head = content.slice( 0, idx );
		}
	}
	var blocks = head.match( /\/\*\*[\s\S]*?\*\//g );
	if ( !blocks || blocks.length === 0 ) {
		return '';
	}
	var lines = blocks[ blocks.length - 1 ].split( '\n' );
	var i;
	var line;
	for ( i = 0; i < lines.length; i++ ) {
		// Strip the JSDoc framing (`/**`, ` * `, `*/`).
		line = lines[ i ].replace( /^\s*\/?\*+\/?/, '' ).trim();
		if ( !line || line.charAt( 0 ) === '@' ) {
			continue;
		}
		// Skip license-header prose in case a block lacks a real summary.
		if ( /^(Copyright|Licensed|Derived|See |Unless|WITHOUT|distributed|you may|http)/i.test( line ) ) {
			continue;
		}
		return line.replace( /\.$/, '' );
	}
	return '';
}

function inferParamType( name, isComplex ) {
	var lower = name.toLowerCase();

	// Check typed params (string enums)
	if ( TYPED_PARAMS[ lower ] ) {
		return TYPED_PARAMS[ lower ].type;
	}

	// Check Int32Array patterns
	if ( ARRAY_PATTERNS.Int32Array.test( name ) ) {
		return 'Int32Array';
	}

	// Check if it has a stride companion (means it's an array)
	// This is handled by the caller

	// Scalars
	if ( /^(alpha|beta|anorm|rcond|scale|safmin|sigma|rho|tau|tol|abstol|vl|vu|pivmin|smin|eps)$/i.test( lower ) ) {
		return 'number';
	}

	// Dimensions and integers
	if ( /^(N|M|K|nrhs|kl|ku|ilo|ihi|il|iu|itype|lwork|liwork|lrwork|ncvt|nru|ncc|mm|sdim|rank|nb|kb|nsplit|nh|nv|nw|nshfts|kacc22|ifst|ilst|j1|n1|n2|iter)$/.test( name ) ) {
		return 'number';
	}

	// Leading dimensions
	if ( /^LD[A-Z]+$/.test( name ) ) {
		return 'number';
	}

	// Strides and offsets
	if ( /^stride|^offset/.test( name ) || name === 'stride' || name === 'offset' ) {
		return 'number';
	}

	// Boolean-like
	if ( /^(wantt|wantz|wantq|forwrd|upper|ltranl|ltranr|ltrans|pivot)$/.test( name ) ) {
		return 'boolean';
	}

	// String-like params with non-standard names
	if ( /^(job|jobvs|jobvl|jobvr|jobu|jobvt|jobz|joba|jobb|compq|compz|fact|equed|norm|range|sort|sense|direct|storev|vect|howmny|cmach|way|normin|transr|trana|tranb|jobq|jobt|jobv|isgn)$/i.test( name ) ) {
		return 'string';
	}

	// select function
	if ( name === 'select' ) {
		return 'Function';
	}

	return 'number';
}

function buildParamList( params, isComplex, hasStrides, knownArrays ) {
	// Detect arrays by checking for stride companions
	var arrayParams = new Set();
	var i, p;
	for ( i = 0; i < params.length; i++ ) {
		p = params[ i ];
		// stride<Name>1 or stride<Name> → Name is an array
		var m = p.match( /^stride(.+?)([12])?$/ );
		if ( m ) {
			var arrName = m[ 1 ];
			// Find actual param
			for ( var j = 0; j < params.length; j++ ) {
				if ( params[ j ] === arrName || params[ j ] === arrName.toLowerCase() || params[ j ] === arrName.toUpperCase() ) {
					arrayParams.add( params[ j ] );
				}
			}
		}
	}

	// Also use known arrays from ndarray signature
	if ( knownArrays ) {
		knownArrays.forEach( function( a ) {
			// Check if this param exists (case-insensitive)
			for ( var k = 0; k < params.length; k++ ) {
				if ( params[ k ].toLowerCase() === a.toLowerCase() ) {
					arrayParams.add( params[ k ] );
				}
			}
		});
	}

	return params.map( function( name ) {
		var type;
		var lower = name.toLowerCase();

		if ( TYPED_PARAMS[ lower ] ) {
			type = TYPED_PARAMS[ lower ].type;
		} else if ( arrayParams.has( name ) ) {
			if ( ARRAY_PATTERNS.Int32Array.test( name ) ) {
				type = 'Int32Array';
			} else {
				type = 'Float64Array';
			}
		} else {
			type = inferParamType( name, isComplex );
		}

		return { name: name, type: type };
	});
}

// Collect imports as a map of `@stdlib/types` submodule -> Set of type names.
function collectImports( paramList, extraImports ) {
	var byModule = {};
	function add( name, mod ) {
		if ( !byModule[ mod ] ) {
			byModule[ mod ] = new Set();
		}
		byModule[ mod ].add( name );
	}
	paramList.forEach( function( p ) {
		var lower = p.name.toLowerCase();
		if ( TYPED_PARAMS[ lower ] ) {
			add( TYPED_PARAMS[ lower ].import, '@stdlib/types/blas' );
		}
	});
	( extraImports || [] ).forEach( function( imp ) {
		add( imp.name, imp.module );
	});
	return byModule;
}

// Emit `/// <reference>` + one grouped import line per submodule.
function formatImports( byModule ) {
	var mods = Object.keys( byModule ).sort();
	if ( mods.length === 0 ) {
		return [];
	}
	var lines = [ '/// <reference types="@stdlib/types"/>', '' ];
	mods.forEach( function( mod ) {
		var names = Array.from( byModule[ mod ] ).sort();
		lines.push( 'import { ' + names.join( ', ' ) + ' } from \'' + mod + '\';' );
	});
	lines.push( '' );
	return lines;
}

function formatParamListInline( paramList ) {
	return paramList.map( function( p ) {
		return p.name + ': ' + p.type;
	}).join( ', ' );
}

function formatParamDocs( paramList, indent ) {
	return paramList.map( function( p ) {
		return indent + '* @param ' + p.name + ' - ' + describeParam( p.name );
	}).join( '\n' );
}

function describeParam( name ) {
	var descriptions = {
		'order': 'storage layout',
		'trans': 'specifies whether the matrix should be transposed',
		'transa': 'specifies the operation for matrix `A`',
		'transb': 'specifies the operation for matrix `B`',
		'uplo': 'specifies whether the upper or lower triangular part is referenced',
		'side': 'specifies the side of the operation',
		'diag': 'specifies whether the matrix is unit triangular',
		'M': 'number of rows',
		'N': 'number of columns',
		'K': 'inner dimension',
		'alpha': 'scalar constant',
		'beta': 'scalar constant',
		'nrhs': 'number of right-hand sides',
		'kl': 'number of subdiagonals',
		'ku': 'number of superdiagonals',
		'ilo': 'lower index',
		'ihi': 'upper index',
		'lwork': 'workspace size'
	};
	if ( descriptions[ name ] ) {
		return descriptions[ name ];
	}
	if ( /^LD[A-Z]+$/.test( name ) ) {
		return 'leading dimension of `' + name.replace( /^LD/, '' ) + '`';
	}
	if ( /^stride/.test( name ) ) {
		var arr = name.replace( /^stride/, '' ).replace( /[12]$/, '' );
		return 'stride of `' + arr + '`';
	}
	if ( /^offset/.test( name ) ) {
		var arr2 = name.replace( /^offset/, '' );
		return 'starting index for `' + arr2 + '`';
	}
	return '`' + name + '`';
}

function generateIndexDTS( routine, mod ) {
	var routinePath = path.join( mod.dir, 'lib', routine + '.js' );
	var ndarrayPath = path.join( mod.dir, 'lib', 'ndarray.js' );
	var basePath = path.join( mod.dir, 'lib', 'base.js' );

	var routineContent = fs.existsSync( routinePath ) ? fs.readFileSync( routinePath, 'utf8' ) : null;
	var ndarrayContent = fs.existsSync( ndarrayPath ) ? fs.readFileSync( ndarrayPath, 'utf8' ) : null;
	var baseContent = fs.existsSync( basePath ) ? fs.readFileSync( basePath, 'utf8' ) : null;

	var isComplex = routine.charAt( 0 ) === 'z' || routine.charAt( 0 ) === 'c';

	// Get ndarray params (from ndarray.js or base.js)
	var ndarrayParams = extractExportedSignature( ndarrayContent ) || extractExportedSignature( baseContent );
	if ( !ndarrayParams ) {
		return null;
	}

	// Get layout wrapper params (from routine.js) — skip if empty/stub
	var layoutParams = extractExportedSignature( routineContent );
	if ( layoutParams && ( layoutParams.length === 0 || ( layoutParams.length === 1 && layoutParams[ 0 ] === '' ) ) ) {
		layoutParams = null;
	}

	// Get description
	var desc = getDescription( ndarrayContent ) || getDescription( baseContent ) || getDescription( routineContent ) || routine;

	// Build typed param lists — detect arrays from ndarray params, share with layout
	var ndarrayTyped = buildParamList( ndarrayParams, isComplex, true, null );
	var knownArrayNames = ndarrayTyped.filter( function( p ) {
		return p.type === 'Float64Array' || p.type === 'Int32Array' || p.type === 'Complex128Array';
	}).map( function( p ) { return p.name; });
	var layoutTyped = layoutParams ? buildParamList( layoutParams, isComplex, false, knownArrayNames ) : null;

	// Determine return type from the implementation JSDoc (single source of
	// truth), preferring the public ndarray file, then base, then wrapper.
	var ret = returnType.fromImpl( ndarrayContent || baseContent || routineContent );
	var retType = ret.ts;

	// Collect imports from all params + the return type.
	var allParams = ndarrayTyped.concat( layoutTyped || [] );
	var importsByModule = collectImports( allParams, ret.imports );

	// Build the file
	var lines = [];
	lines.push( LICENSE );
	lines.push( '' );
	lines.push( '// TypeScript Version: 4.1' );
	lines.push( '' );

	formatImports( importsByModule ).forEach( function push( l ) {
		lines.push( l );
	});

	lines.push( '/**' );
	lines.push( '* Interface describing `' + routine + '`.' );
	lines.push( '*/' );
	lines.push( 'interface Routine {' );

	// Layout wrapper signature (if exists)
	if ( layoutTyped ) {
		lines.push( '\t/**' );
		lines.push( '\t* ' + desc + '.' );
		lines.push( '\t*' );
		lines.push( formatParamDocs( layoutTyped, '\t' ) );
		lines.push( '\t* @returns result' );
		lines.push( '\t*/' );
		lines.push( '\t( ' + formatParamListInline( layoutTyped ) + ' ): '  + retType +  ';' );
		lines.push( '' );
	}

	// ndarray signature
	lines.push( '\t/**' );
	if ( layoutTyped ) {
		lines.push( '\t* ' + desc + ' using alternative indexing semantics.' );
	} else {
		lines.push( '\t* ' + desc + '.' );
	}
	lines.push( '\t*' );
	lines.push( formatParamDocs( ndarrayTyped, '\t' ) );
	lines.push( '\t* @returns result' );
	lines.push( '\t*/' );
	if ( layoutTyped ) {
		lines.push( '\tndarray( ' + formatParamListInline( ndarrayTyped ) + ' ): '  + retType +  ';' );
	} else {
		lines.push( '\t( ' + formatParamListInline( ndarrayTyped ) + ' ): '  + retType +  ';' );
	}

	lines.push( '}' );
	lines.push( '' );

	// Module-level doc
	lines.push( '/**' );
	lines.push( '* ' + desc + '.' );
	lines.push( '*/' );
	lines.push( 'declare var ' + routine + ': Routine;' );
	lines.push( '' );
	lines.push( '' );
	lines.push( '// EXPORTS //' );
	lines.push( '' );
	lines.push( 'export = ' + routine + ';' );
	lines.push( '' );

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
		console.error( 'Usage: node bin/gen_index_dts.js [--all | module-path...]' );
		process.exit( 1 );
	}

	var generated = 0;
	var skipped = 0;
	var errors = [];

	modules.forEach( function( mod ) {
		var typesDir = path.join( mod.dir, 'docs', 'types' );
		if ( !fs.existsSync( typesDir ) ) {
			fs.mkdirSync( typesDir, { recursive: true } );
		}

		try {
			var content = generateIndexDTS( mod.routine, mod );
			if ( !content ) {
				errors.push( mod.routine + ': could not generate' );
				return;
			}
			var outPath = path.join( typesDir, 'index.d.ts' );
			fs.writeFileSync( outPath, content );
			generated++;
		} catch ( e ) {
			errors.push( mod.routine + ': ' + e.message );
		}
	});

	console.log( 'Generated: ' + generated + ', Skipped: ' + skipped );
	if ( errors.length > 0 ) {
		console.log( 'Errors (' + errors.length + '):' );
		errors.forEach( function( e ) { console.log( '  ' + e ); });
	}
}

main();
