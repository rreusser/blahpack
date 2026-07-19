'use strict';

// Checks that base.js function signatures follow the expected expansion rules
// from Fortran to stdlib-js ndarray conventions:
//
//   Fortran array + LDA  →  JS: A, strideA1, strideA2, offsetA  (2D matrix)
//   Fortran array + INC  →  JS: x, strideX, offsetX             (1D vector)
//   Fortran CHARACTER*1  →  JS: lowercase name (trans, uplo)
//   Fortran scalar       →  JS: lowercase name (alpha, beta)
//   Fortran INTEGER dim  →  JS: uppercase name (M, N, K)
//   Fortran INFO (out)   →  consumed (returned as function value / result object)
//   Fortran LWORK/size   →  consumed (workspace size is implicit in JS)
//
// Several Fortran argument classes have more than one valid JS representation,
// so a correct signature can have several valid parameter counts. Each argument
// therefore contributes a *set* of allowed sizes (see `argInfo`), and the rule
// checks the actual count against the full set of achievable totals rather than
// a single number. The most flexible classes:
//
//   Workspace arrays (WORK/RWORK/IWORK/...) — allocated internally and elided,
//     or kept as `arr,offset` / `arr,stride,offset` / a 2D `arr,s1,s2,offset`.
//   Output scalars (direction "out", non-array, not INFO) — returned via a
//     result object (e.g. dgbequ's `{ info, rowcnd, colcnd, amax }`), kept as a
//     length-1 output array (e.g. `rcond`), or as `arr,offset` (e.g. `tau`).
//
// Structural stride/offset *naming* is only validated when the signature is
// fully rigid (exactly one achievable count) — a flexible group can shift later
// positions and produce spurious naming errors, so ambiguous layouts are
// checked by count only.
//
// The rule reads the routine's entry from data/routines.json to know what
// the Fortran signature is, then compares the structural pattern (not exact
// names, since BLAS uses DA/DX while JS uses alpha/x).

var path = require( 'path' );
var fs = require( 'fs' );

var DB_PATH = path.join( __dirname, '..', '..', '..', 'data', 'routines.json' );
var db;

// Workspace array names (kept as positional arrays OR allocated internally).
var WORKSPACE_RE = /^[A-Z]?WORK\d*$/i;

function loadDB() {
	if ( db ) return db;
	if ( !fs.existsSync( DB_PATH ) ) return null;
	db = JSON.parse( fs.readFileSync( DB_PATH, 'utf8' ) );
	return db;
}

// Detect a 2D array from its Fortran type string: a top-level (paren-depth 0)
// comma inside the `dimension(...)` spec means two dimensions, e.g.
// `dimension (N,NRHS)` or `dimension (2, N lg N)`. Commas nested inside a
// function call (`dimension (max(1,N))`) are ignored, so 1D arrays with
// expression bounds are not misread as 2D.
function dimensionIs2D( type ) {
	var m = /dimension\s*\(([\s\S]*)\)/i.exec( type );
	if ( !m ) return false;
	var s = m[ 1 ];
	var depth = 0;
	for ( var i = 0; i < s.length; i++ ) {
		var ch = s[ i ];
		if ( ch === '(' ) depth += 1;
		else if ( ch === ')' ) depth -= 1;
		else if ( ch === ',' && depth === 0 ) return true;
	}
	return false;
}

// Normalize a Fortran `direction` field ("in", "out", "in,out", "in, out",
// "inout") to one of: 'in' | 'out' | 'inout'.
function normDirection( dir ) {
	var d = ( dir || '' ).toLowerCase().replace( /\s+/g, '' );
	if ( d === 'in' ) return 'in';
	if ( d === 'out' ) return 'out';
	return 'inout'; // "in,out" | "inout" | anything carrying input
}

// Determine how a Fortran argument expands into JS params. Returns null for
// consumed args (LDA/LWORK-size/INFO), or a group descriptor:
//
//   { fortranName, shape: 'scalar'|'1d'|'2d', sizes: [ ...allowed counts ] }
//
// `sizes` lists every param count the argument may legitimately occupy — a
// single value when the mapping is rigid, several when the codebase uses more
// than one representation for that argument class (see notes inline). A group
// with one size is "positionally fixed"; multi-size groups make every later
// position ambiguous, which the naming walk accounts for.
function argInfo( arg, allArgs ) {
	var name = arg.name.toUpperCase();
	var type = arg.type;
	var dir = normDirection( arg.direction );

	// Consumed: INFO output (returned as function value / result object).
	if ( /^INFO$/i.test( name ) ) return null;

	// Consumed: workspace *sizes* (LWORK/LRWORK/LIWORK/LZWORK/...). The array
	// itself is handled below; only the integer size is dropped.
	if ( /^L[A-Z]*WORK$/i.test( name ) ) return null;

	var isArray = /array/i.test( type );

	// Consumed: leading dimensions (always replaced by strides). A leading
	// dimension is a *scalar* named `LD*` (LDA, LDAB, LDGCOL). The scalar test
	// avoids consuming a genuine array that merely happens to be named `LD`
	// (e.g. DLAR1V's L·D vector, which is `array` typed).
	if ( !isArray && /^LD/i.test( name ) ) return null;

	// Workspace arrays are the most representation-flexible argument class.
	// Observed forms: allocated internally and elided (0); `arr,offset` (2);
	// `arr,stride,offset` (3); or a 2D workspace `arr,stride1,stride2,offset`
	// (4, e.g. DLARFB/DTPRFB). Recognized by a conventional WORK* name or a
	// type string that declares the arg a "workspace" (e.g. DLASYF_AA's `H`).
	// Checked before the array-type test because some DB entries record
	// workspace args with an empty/short type string.
	if ( WORKSPACE_RE.test( name ) || /workspace/i.test( type ) ) {
		return { 'fortranName': arg.name, 'shape': '1d', 'sizes': [ 0, 2, 3, 4 ] };
	}

	// Consumed: increment parameters (INCX/INCY), always replaced by strides.
	// (A rare routine keeps one for its sign semantics, e.g. DLASWP's pivot
	// direction, and is flagged — treating INC as flexible everywhere would
	// disable the naming checks below for the whole BLAS vector family.)
	if ( /^INC/i.test( name ) ) return null;

	if ( !isArray ) {
		// A scalar written by the routine cannot be returned through the JS
		// parameter (scalars are by-value), so an output/in-out scalar is
		// represented as a caller-provided typed array. Observed forms:
		//   out    → returned via result object (0), length-1 array (1),
		//            or `arr,offset` (2)  [e.g. TAU]
		//   in,out → `arr,offset` (2) or a plain value passthrough (1)
		//   in     → plain value (1)
		if ( dir === 'out' ) {
			return { 'fortranName': arg.name, 'shape': 'scalar', 'sizes': [ 0, 1, 2 ] };
		}
		if ( dir === 'inout' ) {
			return { 'fortranName': arg.name, 'shape': 'scalar', 'sizes': [ 1, 2 ] };
		}
		return { 'fortranName': arg.name, 'shape': 'scalar', 'sizes': [ 1 ] };
	}

	// Determine if 2D matrix: either a corresponding LDx parameter exists (the
	// strongest indicator) or the type string declares two dimensions. Some
	// LAPACK routines pass 2D arrays dimensioned directly (N,NRHS) with no
	// separate leading-dim argument, so the LD check alone is insufficient.
	var hasLD = allArgs.some( function( a ) {
		return new RegExp( '^LD' + name + '$', 'i' ).test( a.name );
	});
	if ( hasLD || dimensionIs2D( type ) ) {
		return { 'fortranName': arg.name, 'shape': '2d', 'sizes': [ 4 ] };
	}

	// Regular 1D input/output array (always positional — it carries data).
	return { 'fortranName': arg.name, 'shape': '1d', 'sizes': [ 3 ] };
}

// Convert Fortran args to the ordered list of expected JS param groups.
function expectedParamGroups( fArgs ) {
	var groups = [];
	fArgs.forEach( function forEach( arg ) {
		var info = argInfo( arg, fArgs );
		if ( info ) groups.push( info );
	});
	return groups;
}

// Return the sorted set of achievable total param counts: every combination of
// each group's allowed sizes. Deduped by sum, so the set stays small even when
// many groups are flexible.
function achievableCounts( groups ) {
	var sums = { '0': true };
	groups.forEach( function( g ) {
		var next = {};
		Object.keys( sums ).forEach( function( s ) {
			g.sizes.forEach( function( sz ) {
				next[ Number( s ) + sz ] = true;
			});
		});
		sums = next;
	});
	return Object.keys( sums ).map( Number ).sort( function( a, b ) {
		return a - b;
	});
}

// Render a sorted count list compactly: a contiguous run as "a-b", else "a or
// b or c".
function renderCounts( counts ) {
	var contiguous = counts.every( function( c, i ) {
		return i === 0 || c === counts[ i - 1 ] + 1;
	});
	if ( contiguous && counts.length > 2 ) {
		return counts[ 0 ] + '-' + counts[ counts.length - 1 ];
	}
	return counts.join( ' or ' );
}

// Render the maximal (all-positional) expected pattern for diagnostics.
function renderPattern( groups ) {
	return groups.map( function( g ) {
		var tag = ( g.sizes.length > 1 ) ? '?' : '';
		if ( g.shape === 'scalar' ) return g.fortranName.toLowerCase() + tag;
		if ( g.shape === '1d' ) return g.fortranName + ',stride,offset' + tag;
		return g.fortranName + ',stride1,stride2,offset' + tag;
	}).join( ', ' );
}

// Extract function parameter names from a FunctionDeclaration AST node
function getFunctionParams( node ) {
	if ( !node.params ) return [];
	return node.params.map( function map( p ) {
		return p.name || ( p.type === 'AssignmentPattern' && p.left ? p.left.name : '?' );
	});
}

var rule = {
	'meta': {
		'docs': {
			'description': 'verify base.js function signatures match Fortran-to-ndarray expansion rules'
		},
		'schema': [],
		'type': 'problem'
	},
	'create': function main( context ) {
		var filename = context.getFilename();
		var basename = path.basename( filename );

		// Only check base.js files
		if ( basename !== 'base.js' ) return {};

		// Determine routine name from path
		var parts = filename.split( path.sep );
		var baseIdx = parts.indexOf( 'base' );
		if ( baseIdx === -1 || baseIdx + 1 >= parts.length ) return {};
		var routineName = parts[ baseIdx + 1 ];

		// Load DB and find the variant
		var data = loadDB();
		if ( !data || !data.routines ) return {};

		var fVariant = null;
		var algKeys = Object.keys( data.routines );
		for ( var i = 0; i < algKeys.length; i++ ) {
			var alg = data.routines[ algKeys[i] ];
			var variants = alg.variants || [];
			for ( var j = 0; j < variants.length; j++ ) {
				if ( variants[j].name.toLowerCase() === routineName ) {
					fVariant = variants[j];
					break;
				}
			}
			if ( fVariant ) break;
		}

		if ( !fVariant ) return {}; // Not in DB

		// Can't validate a signature we have no argument data for (a few DB
		// entries failed extraction and record zero arguments, e.g. DSDOT).
		if ( !fVariant.arguments || fVariant.arguments.length === 0 ) return {};

		var groups = expectedParamGroups( fVariant.arguments );
		var counts = achievableCounts( groups );

		var routineFunc = null;
		var lastTopLevelFunc = null;

		return {
			'FunctionDeclaration': function onFunc( node ) {
				// Track top-level function declarations. The exported routine is
				// the one named after the routine (base.js also declares helper
				// functions like `computeWorkSize`, so we can't just take the
				// last one).
				if ( node.parent.type !== 'Program' ) return;
				lastTopLevelFunc = node;
				if ( node.id && node.id.name.toLowerCase() === routineName ) {
					routineFunc = node;
				}
			},
			'Program:exit': function onExit() {
				var node = routineFunc || lastTopLevelFunc;
				if ( !node ) return;

				var jsParams = getFunctionParams( node );
				var actualCount = jsParams.length;

				// Check parameter count against the set of achievable counts.
				if ( counts.indexOf( actualCount ) === -1 ) {
					context.report({
						'node': node,
						'message': 'Signature has ' + actualCount + ' params, expected ' + renderCounts( counts ) + ' based on Fortran signature (' + fVariant.name + '). ' +
							'Expected pattern (? = flexible): ' + renderPattern( groups )
					});
					return;
				}

				// Structural naming checks require provably-exact positions.
				// Only a fully rigid signature — every group single-size, so
				// exactly one achievable count — guarantees this. Any flexible
				// group (workspace/output-scalar/increment) or a 2D matrix that
				// the DB records without an LD arg (misclassified as 1D) can
				// shift later positions and produce spurious naming errors, so
				// naming is validated only when the layout is unambiguous. The
				// count check above still guards flexible signatures.
				if ( counts.length !== 1 ) return;
				var pos = 0;
				for ( var g = 0; g < groups.length; g++ ) {
					var shape = groups[ g ];
					var size = shape.sizes[ 0 ];
					if ( pos >= jsParams.length ) break;

					if ( shape.shape === '1d' && size === 3 ) {
						var arrName = jsParams[ pos ];
						var strideName = jsParams[ pos + 1 ];
						var offsetName = jsParams[ pos + 2 ];

						if ( !/^stride/i.test( strideName ) ) {
							context.report({
								'node': node.params[ pos + 1 ],
								'message': 'Expected stride parameter for 1D array "' + arrName + '", got "' + strideName + '". Should match pattern: stride<Name>'
							});
						}
						if ( !/^offset/i.test( offsetName ) ) {
							context.report({
								'node': node.params[ pos + 2 ],
								'message': 'Expected offset parameter for 1D array "' + arrName + '", got "' + offsetName + '". Should match pattern: offset<Name>'
							});
						}
					} else if ( shape.shape === '2d' && size === 4 ) {
						var matName = jsParams[ pos ];
						var s1 = jsParams[ pos + 1 ];
						var s2 = jsParams[ pos + 2 ];
						var off = jsParams[ pos + 3 ];

						if ( !/^stride/i.test( s1 ) || !/1$/.test( s1 ) ) {
							context.report({
								'node': node.params[ pos + 1 ],
								'message': 'Expected stride1 parameter for 2D array "' + matName + '", got "' + s1 + '". Should match: stride<Name>1'
							});
						}
						if ( !/^stride/i.test( s2 ) || !/2$/.test( s2 ) ) {
							context.report({
								'node': node.params[ pos + 2 ],
								'message': 'Expected stride2 parameter for 2D array "' + matName + '", got "' + s2 + '". Should match: stride<Name>2'
							});
						}
						if ( !/^offset/i.test( off ) ) {
							context.report({
								'node': node.params[ pos + 3 ],
								'message': 'Expected offset parameter for 2D array "' + matName + '", got "' + off + '". Should match: offset<Name>'
							});
						}
					}
					pos += size;
				}
			}
		};
	}
};

module.exports = rule;
