'use strict';

/*
* Workspace convention check.
*
* LAPACK routines take caller-provided workspace (Fortran `WORK`/`RWORK`/
* `IWORK`/`SWORK`/`BWORK` arguments). The stdlib-js convention — see the
* authoritative reference implementation `@stdlib/lapack/base/dlarf1f` — is
* to expose that workspace as caller-provided `work, strideWork, offsetWork`
* triples on BOTH `base.js` and `ndarray.js`, sized per a documented formula.
* The integer length arguments (`LWORK`/`LRWORK`/`LIWORK`) are dropped and
* there is NO `lwork === -1` query mode: the required size is documented in
* the JSDoc instead.
*
* The historical anti-pattern (taught by an earlier revision of the
* /blahpack-translate skill) was to delete the WORK parameters that
* `bin/signature.py` correctly generates and allocate a `new Float64Array`
* internally. That defeats workspace reuse across batched same-size matrices
* and forces per-call allocation. This check flags every module that still
* does it so remediation can be focused rather than ad hoc.
*
* Genuine, justified exceptions go in gate.config.json with a mandatory
* reason (the standard gate exception mechanism applies to these ids).
*/

var path = require( 'path' );
var util = require( '../util.js' );

var ID = 'workspace';

// Fortran workspace argument names (caller-provided scratch):
var WORK_ARGS = [ 'WORK', 'RWORK', 'IWORK', 'SWORK', 'BWORK' ];

// Fortran workspace length arguments (dropped in JS — size is documented):
var LEN_ARGS = [ 'LWORK', 'LRWORK', 'LIWORK', 'LWORK1', 'LWORK2' ];

// Numeric typed-array constructors that may indicate an internal allocation:
var ALLOC_RE = /new\s+(Float64Array|Float32Array|Int32Array|Uint8Array|Uint32Array|Complex128Array|Complex64Array)\s*\(([^)]*)\)/;

// A bare numeric allocation no larger than this is treated as a scalar
// temporary (e.g. `new Float64Array( 2 )` for a complex scalar, DUM(1)),
// not a workspace buffer:
var SCALAR_MAX = 8;


// HELPERS //

/**
* Locate the reference Fortran source for a routine.
*
* @param {string} routine - routine name (e.g. `dgesvd`)
* @returns {(string|null)} file content or null
*/
function readFortran( routine ) {
	var candidates = [
		path.join( util.ROOT, 'data', 'lapack-3.12.0', 'SRC', routine + '.f' ),
		path.join( util.ROOT, 'data', 'lapack-3.12.0', 'SRC', routine + '.F' ),
		path.join( util.ROOT, 'data', 'BLAS-3.12.0', routine + '.f' ),
		path.join( util.ROOT, 'data', 'lapack-3.12.0', 'SRC', 'DEPRECATED', routine + '.f' )
	];
	var i;
	var c;
	for ( i = 0; i < candidates.length; i++ ) {
		c = util.readFile( candidates[ i ] );
		if ( c !== null ) {
			return c;
		}
	}
	return null;
}

/**
* Extract the uppercase argument list from a fixed-form Fortran declaration.
*
* Handles `$`/`&`-continued declaration lines and both SUBROUTINE and
* (typed) FUNCTION forms while skipping the commented copy in the doc block.
*
* @param {string} content - Fortran source
* @param {string} routine - routine name
* @returns {Array<string>} uppercase argument names
*/
function fortranArgs( content, routine ) {
	var lines = content.split( '\n' );
	var re = new RegExp( '\\b(?:SUBROUTINE|FUNCTION)\\s+' + routine.toUpperCase() + '\\s*\\(', 'i' );
	var buf = null;
	var depth = 0;
	var line;
	var frag;
	var i;
	var j;
	var ch;

	for ( i = 0; i < lines.length; i++ ) {
		line = lines[ i ];
		// Skip fixed-form comment lines (col 1 in C/c/*/!):
		if ( /^[*cC!]/.test( line ) ) {
			continue;
		}
		if ( buf === null ) {
			if ( !re.test( line ) ) {
				continue;
			}
			frag = line.slice( line.indexOf( '(' ) );
		} else {
			// Continuation line: drop the 6-column label/continuation field.
			frag = line.slice( 6 );
		}
		for ( j = 0; j < frag.length; j++ ) {
			ch = frag[ j ];
			if ( ch === '(' ) {
				depth += 1;
				if ( depth === 1 ) {
					buf = '';
					continue;
				}
			} else if ( ch === ')' ) {
				depth -= 1;
				if ( depth === 0 ) {
					return splitArgs( buf );
				}
			}
			if ( buf !== null ) {
				buf += ch;
			}
		}
	}
	return [];
}

/**
* Split a Fortran/JS argument string into trimmed uppercase identifiers.
*/
function splitArgs( s ) {
	return s.split( ',' )
		.map( function map( a ) {
			return a.replace( /=.*$/, '' ).trim().toUpperCase();
		})
		.filter( function filter( a ) {
			return a.length > 0;
		});
}

/**
* Extract the parameter list of the primary exported function in a JS file.
*
* @param {string} content - JS source
* @param {string} routine - routine name
* @returns {Array<string>} parameter names (original casing)
*/
function jsParams( content, routine ) {
	if ( !content ) {
		return [];
	}
	var re = new RegExp( 'function\\s+' + routine + '\\s*\\(', 'i' );
	var m = re.exec( content );
	if ( !m ) {
		return [];
	}
	var start = content.indexOf( '(', m.index );
	var depth = 0;
	var i;
	var ch;
	for ( i = start; i < content.length; i++ ) {
		ch = content[ i ];
		if ( ch === '(' ) {
			depth += 1;
		} else if ( ch === ')' ) {
			depth -= 1;
			if ( depth === 0 ) {
				return content.slice( start + 1, i )
					.split( ',' )
					.map( function map( a ) {
						return a.replace( /=.*$/, '' ).trim();
					})
					.filter( function filter( a ) {
						return a.length > 0 && !/^\/\//.test( a );
					});
			}
		}
	}
	return [];
}

/**
* Scan a JS source for internal workspace allocations, ignoring imports,
* JSDoc/example lines, and small scalar temporaries.
*
* @param {string} content - JS source
* @param {string} file - file label for locations
* @returns {Array<Object>} [ { line, text } ]
*/
function internalAllocs( content, file ) {
	if ( !content ) {
		return [];
	}
	var lines = content.split( '\n' );
	var hits = [];
	var line;
	var trimmed;
	var m;
	var size;
	var i;

	for ( i = 0; i < lines.length; i++ ) {
		line = lines[ i ];
		trimmed = line.trim();
		// Skip the typed-array import line and JSDoc/example/comment lines:
		if ( trimmed.indexOf( 'require(' ) !== -1 ) {
			continue;
		}
		if ( trimmed.charAt( 0 ) === '*' || trimmed.indexOf( '//' ) === 0 ) {
			continue;
		}
		m = ALLOC_RE.exec( line );
		if ( !m ) {
			continue;
		}
		// Skip block-reflector T-matrix allocations (T, T1, T2, etc.) — legitimately internal.
		if ( /\bT\d*\s*=\s*new\s+/.test( line ) ) {
			continue;
		}
		size = m[ 2 ].trim();
		// Variable-sized (references an identifier) OR a large numeric
		// literal => workspace. Small bare numbers => scalar temporary.
		if ( /[A-Za-z_]/.test( size ) || ( /^\d+$/.test( size ) && Number( size ) > SCALAR_MAX ) ) {
			hits.push({
				line: i + 1,
				text: file + ':' + ( i + 1 ) + '  ' + trimmed
			});
		}
	}
	return hits;
}


// CHECK //

function check( mod ) {
	var results = [];
	var basePath = path.join( mod.dir, 'lib', 'base.js' );
	var ndarrayPath = path.join( mod.dir, 'lib', 'ndarray.js' );
	var baseContent = util.readFile( basePath );
	var ndarrayContent = util.readFile( ndarrayPath );
	var fortran = readFortran( mod.routine );

	var fArgs;
	var hasLenArg;
	var workArgs;
	var baseParamsRaw;
	var baseParamsLC;
	var missing;
	var i;

	if ( fortran === null ) {
		results.push( util.skip( ID + '.caller-provided', 'Reference Fortran source not found' ) );
		return results;
	}
	if ( !baseContent ) {
		results.push( util.skip( ID + '.caller-provided', 'No base.js' ) );
		return results;
	}

	fArgs = fortranArgs( fortran, mod.routine );
	workArgs = fArgs.filter( function isWork( a ) {
		return WORK_ARGS.indexOf( a ) !== -1;
	});
	hasLenArg = fArgs.some( function isLen( a ) {
		return LEN_ARGS.indexOf( a ) !== -1;
	});

	// Routine has no caller-provided workspace at all — not applicable.
	if ( workArgs.length === 0 && !hasLenArg ) {
		results.push( util.skip( ID + '.caller-provided', 'No Fortran workspace argument' ) );
		return results;
	}

	baseParamsRaw = jsParams( baseContent, mod.routine );
	baseParamsLC = baseParamsRaw.map( function lc( p ) {
		return p.toLowerCase();
	});

	// 1. Every Fortran workspace array must appear as a caller-provided
	//    parameter (work / rwork / iwork / swork / bwork).
	missing = workArgs.filter( function notInJS( a ) {
		return baseParamsLC.indexOf( a.toLowerCase() ) === -1;
	});
	if ( workArgs.length === 0 ) {
		// Only an LWORK-style arg with no array (rare) — nothing to map.
		results.push( util.skip( ID + '.caller-provided', 'No Fortran workspace array' ) );
	} else if ( missing.length > 0 ) {
		results.push( util.fail(
			ID + '.caller-provided',
			'Workspace is caller-provided (not internally allocated)',
			missing.length,
			[ path.relative( util.ROOT, basePath ) ],
			'base.js is missing caller-provided workspace param(s) [' + missing.join( ', ' ).toLowerCase() + ']; Fortran has ' + workArgs.join( ', ' ) + '. Expose `work, strideWork, offsetWork` per @stdlib/lapack/base/dlarf1f instead of allocating internally.'
		));
	} else {
		results.push( util.pass( ID + '.caller-provided', 'Workspace is caller-provided (not internally allocated)' ) );
	}

	// 2. No internal workspace allocation in base.js.
	var allocs = internalAllocs( baseContent, 'base.js' );
	if ( allocs.length > 0 ) {
		results.push( util.fail(
			ID + '.no-internal-alloc',
			'No internal workspace allocation',
			allocs.length,
			allocs.map( function loc( h ) {
				return h.text;
			}),
			allocs.length + ' internal allocation(s) where Fortran uses a caller-provided WORK array; the caller must own the buffer (enables reuse across batched matrices).'
		));
	} else {
		results.push( util.pass( ID + '.no-internal-alloc', 'No internal workspace allocation' ) );
	}

	// 3. Naming/shape conventions: camelCase strideWork/offsetWork, and NO
	//    lwork parameter (size is documented in JSDoc, per dlarf1f).
	var namingProblems = [];
	for ( i = 0; i < baseParamsRaw.length; i++ ) {
		if ( /^(stride|offset)WORK$/i.test( baseParamsRaw[ i ] ) && !/^(stride|offset)Work$/.test( baseParamsRaw[ i ] ) ) {
			namingProblems.push( baseParamsRaw[ i ] + ' (use ' + baseParamsRaw[ i ].replace( /WORK/i, 'Work' ) + ')' );
		}
		if ( /^l[a-z]*work$/i.test( baseParamsRaw[ i ] ) ) {
			namingProblems.push( baseParamsRaw[ i ] + ' (drop; document required size in JSDoc instead)' );
		}
	}
	if ( namingProblems.length > 0 ) {
		results.push( util.warn(
			ID + '.naming',
			'Workspace params use stdlib naming',
			namingProblems.length,
			[ path.relative( util.ROOT, basePath ) ],
			'Non-conforming workspace params: ' + namingProblems.join( '; ' ) + '.'
		));
	} else {
		results.push( util.pass( ID + '.naming', 'Workspace params use stdlib naming' ) );
	}

	// 4. ndarray.js parity: same caller-provided workspace, no allocation.
	if ( !ndarrayContent ) {
		results.push( util.skip( ID + '.ndarray-parity', 'No ndarray.js' ) );
	} else if ( workArgs.length === 0 ) {
		results.push( util.skip( ID + '.ndarray-parity', 'No Fortran workspace array' ) );
	} else {
		var ndParams = jsParams( ndarrayContent, mod.routine ).map( function lc( p ) {
			return p.toLowerCase();
		});
		var ndMissing = workArgs.filter( function notInND( a ) {
			return ndParams.indexOf( a.toLowerCase() ) === -1;
		});
		var ndAllocs = internalAllocs( ndarrayContent, 'ndarray.js' );
		if ( ndMissing.length > 0 || ndAllocs.length > 0 ) {
			results.push( util.fail(
				ID + '.ndarray-parity',
				'ndarray.js exposes the same caller-provided workspace',
				ndMissing.length + ndAllocs.length,
				[ path.relative( util.ROOT, ndarrayPath ) ].concat( ndAllocs.map( function loc( h ) {
					return h.text;
				}) ),
				( ndMissing.length > 0 ? 'ndarray.js missing workspace param(s) [' + ndMissing.join( ', ' ).toLowerCase() + ']. ' : '' ) + ( ndAllocs.length > 0 ? 'ndarray.js allocates workspace internally.' : '' )
			));
		} else {
			results.push( util.pass( ID + '.ndarray-parity', 'ndarray.js exposes the same caller-provided workspace' ) );
		}
	}

	return results;
}

module.exports = check;
