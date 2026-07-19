#!/usr/bin/env node

/**
 * Generate docs/repl.txt for each module from routine.js and ndarray.js signatures.
 *
 * Usage:
 *   node bin/gen_repl_txt.js [--all | module-path...]
 */

'use strict';

var fs = require( 'fs' );
var path = require( 'path' );
var util = require( './conformance/util.js' );

// Clean, curated descriptions keyed by routine name (see
// bin/gen-descriptions.js). Preferred over the JSDoc-derived summary, which
// is only the first physical line and is often a truncated fragment.
var CLEAN_DESCS = {};
try {
	CLEAN_DESCS = JSON.parse( fs.readFileSync( path.join( __dirname, '..', 'data', 'descriptions.generated.json' ), 'utf8' ) );
} catch ( err ) {
	CLEAN_DESCS = {};
}

// Max line width for wrapping descriptions
var MAX_WIDTH = 76;

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

// Wrap text to fit within width, with given indent for continuation lines
function wrapText( text, indent, width ) {
	var words = text.split( /\s+/ );
	var lines = [];
	var line = indent;
	var i;

	for ( i = 0; i < words.length; i++ ) {
		if ( line.length + words[ i ].length + 1 > width && line.length > indent.length ) {
			lines.push( line );
			line = indent + words[ i ];
		} else {
			if ( line.length === indent.length ) {
				line += words[ i ];
			} else {
				line += ' ' + words[ i ];
			}
		}
	}
	if ( line.length > indent.length ) {
		lines.push( line );
	}
	return lines.join( '\n' );
}

function paramType( name ) {
	var lower = name.toLowerCase();

	// String enum params
	if ( /^(order|trans|transa|transb|uplo|side|diag)$/.test( lower ) ) {
		return 'string';
	}
	if ( /^(job|jobvs|jobvl|jobvr|jobu|jobvt|jobz|compq|compz|fact|equed|norm|range|sort|sense|direct|storev|vect|howmny|cmach|way|normin|transr)$/i.test( lower ) ) {
		return 'string';
	}

	// Scalars
	if ( /^(alpha|beta|anorm|rcond|scale|safmin|sigma|rho|tau|tol|abstol)$/i.test( lower ) ) {
		return 'number';
	}

	// Booleans
	if ( /^(wantt|wantz|wantq|forwrd|upper)$/.test( name ) ) {
		return 'boolean';
	}

	// Int arrays
	if ( /^(IPIV|JPIV|IWORK|ISUPPZ|IBLOCK|ISPLIT|IDX|IDXP|IDXQ|PERM|GIVCOL|BWORK|SELECT)$/.test( name ) ) {
		return 'Int32Array';
	}

	// Leading dimensions
	if ( /^LD[A-Z]+$/.test( name ) ) {
		return 'integer';
	}

	// Strides and offsets
	if ( /^stride|^offset/.test( name ) || name === 'stride' || name === 'offset' ) {
		return 'integer';
	}

	// Dimensions
	if ( /^[MNK]$|^(nrhs|kl|ku|ilo|ihi|il|iu|itype|lwork|ncvt|nru|ncc|nb|kb|mm|nh|nv|nw|nshfts)$/.test( name ) ) {
		return 'integer';
	}

	// Uppercase names are typically arrays
	if ( /^[A-Z]/.test( name ) && name.length > 1 ) {
		return 'Float64Array';
	}

	// Single uppercase letter
	if ( /^[A-Z]$/.test( name ) ) {
		return 'Float64Array';
	}

	// Lowercase names with stride companions are arrays (handled by caller)
	return 'number';
}

function paramDescription( name ) {
	var lower = name.toLowerCase();
	var descs = {
		'order': 'Row-major (C-style) or column-major (Fortran-style) order.',
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
		'nrhs': 'number of right-hand sides.'
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
	// Default
	return '`' + name + '`.';
}

function generateReplTxt( routine, mod ) {
	var routinePath = path.join( mod.dir, 'lib', routine + '.js' );
	var ndarrayPath = path.join( mod.dir, 'lib', 'ndarray.js' );
	var baseContent = fs.existsSync( path.join( mod.dir, 'lib', 'base.js' ) ) ?
		fs.readFileSync( path.join( mod.dir, 'lib', 'base.js' ), 'utf8' ) : null;
	var routineContent = fs.existsSync( routinePath ) ?
		fs.readFileSync( routinePath, 'utf8' ) : null;
	var ndarrayContent = fs.existsSync( ndarrayPath ) ?
		fs.readFileSync( ndarrayPath, 'utf8' ) : null;

	var layoutParams = extractExportedSignature( routineContent );
	var ndarrayParams = extractExportedSignature( ndarrayContent ) ||
		extractExportedSignature( baseContent );

	if ( !ndarrayParams ) {
		return null;
	}

	var desc = CLEAN_DESCS[ routine.toLowerCase() ] || getDescription( ndarrayContent ) || getDescription( baseContent ) ||
		getDescription( routineContent ) || routine;

	// Detect arrays from ndarray strides
	var arraySet = new Set();
	var i, p;
	for ( i = 0; i < ndarrayParams.length; i++ ) {
		p = ndarrayParams[ i ];
		var sm = p.match( /^stride(.+?)([12])?$/ );
		if ( sm ) {
			var arrName = sm[ 1 ];
			ndarrayParams.forEach( function( np ) {
				if ( np.toLowerCase() === arrName.toLowerCase() ) {
					arraySet.add( np );
				}
			});
		}
	}

	var lines = [];

	// ── Layout wrapper section ──
	if ( layoutParams ) {
		var layoutSig = '{{alias}}( ' + layoutParams.join( ', ' ) + ' )';
		lines.push( layoutSig );
		lines.push( wrapText( desc + '.', '    ', MAX_WIDTH ) );
		lines.push( '' );
		lines.push( '    Parameters' );
		lines.push( '    ----------' );

		for ( i = 0; i < layoutParams.length; i++ ) {
			p = layoutParams[ i ];
			var pt = paramType( p );
			// Check if this is an array from the ndarray detection
			if ( arraySet.has( p ) || arraySet.has( p.toUpperCase() ) || arraySet.has( p.toLowerCase() ) ) {
				if ( /^(IPIV|JPIV|IWORK|ISUPPZ|IBLOCK|ISPLIT|IDX|IDXP|IDXQ|PERM|GIVCOL|BWORK|SELECT)$/.test( p ) ) {
					pt = 'Int32Array';
				} else {
					pt = 'Float64Array';
				}
			}
			lines.push( '    ' + p + ': ' + pt );
			lines.push( wrapText( paramDescription( p ), '        ', MAX_WIDTH ) );
			lines.push( '' );
		}

		lines.push( '    Returns' );
		lines.push( '    -------' );
		lines.push( '    out: Float64Array' );
		lines.push( '        Result.' );
		lines.push( '' );
		lines.push( '    Examples' );
		lines.push( '    --------' );
		lines.push( '    // TODO: Add examples' );
		lines.push( '' );
		lines.push( '' );
	}

	// ── ndarray section ──
	var ndarraySig;
	if ( layoutParams ) {
		ndarraySig = '{{alias}}.ndarray( ' + ndarrayParams.join( ', ' ) + ' )';
	} else {
		ndarraySig = '{{alias}}( ' + ndarrayParams.join( ', ' ) + ' )';
	}
	lines.push( ndarraySig );
	if ( layoutParams ) {
		lines.push( wrapText( desc + ' using alternative indexing semantics.', '    ', MAX_WIDTH ) );
	} else {
		lines.push( wrapText( desc + '.', '    ', MAX_WIDTH ) );
	}
	lines.push( '' );
	lines.push( '    Parameters' );
	lines.push( '    ----------' );

	for ( i = 0; i < ndarrayParams.length; i++ ) {
		p = ndarrayParams[ i ];
		var npt = paramType( p );
		if ( arraySet.has( p ) ) {
			if ( /^(IPIV|JPIV|IWORK|ISUPPZ|IBLOCK|ISPLIT|IDX|IDXP|IDXQ|PERM|GIVCOL|BWORK|SELECT)$/.test( p ) ) {
				npt = 'Int32Array';
			} else {
				npt = 'Float64Array';
			}
		}
		lines.push( '    ' + p + ': ' + npt );
		lines.push( wrapText( paramDescription( p ), '        ', MAX_WIDTH ) );
		lines.push( '' );
	}

	lines.push( '    Returns' );
	lines.push( '    -------' );
	lines.push( '    out: Float64Array' );
	lines.push( '        Result.' );
	lines.push( '' );
	lines.push( '    Examples' );
	lines.push( '    --------' );
	lines.push( '    // TODO: Add examples' );
	lines.push( '' );
	lines.push( '    See Also' );
	lines.push( '    --------' );
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
		console.error( 'Usage: node bin/gen_repl_txt.js [--all | module-path...]' );
		process.exit( 1 );
	}

	var generated = 0;
	var errors = [];

	modules.forEach( function( mod ) {
		var docsDir = path.join( mod.dir, 'docs' );
		if ( !fs.existsSync( docsDir ) ) {
			fs.mkdirSync( docsDir, { recursive: true } );
		}
		try {
			var content = generateReplTxt( mod.routine, mod );
			if ( !content ) {
				errors.push( mod.routine + ': could not generate' );
				return;
			}
			fs.writeFileSync( path.join( docsDir, 'repl.txt' ), content );
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
