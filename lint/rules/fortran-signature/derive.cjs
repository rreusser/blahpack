'use strict';

// Derive the expected stdlib-js `base.js` parameter signature from a routine's
// parsed Fortran argument list.
//
// This is the pure, deterministic core of the fortran-signature rule: given the
// Fortran dummy arguments (name, intent, declared type) it returns a *model* of
// the JavaScript signature the translation must have. The model is intentionally
// NOT a single fixed parameter list — several Fortran argument classes have more
// than one faithful JS representation, so the model records, per Fortran
// argument, the *set* of parameter counts it may legitimately occupy and whether
// it forms a stride/offset-bearing array group. The rule then checks the actual
// signature against this model.
//
// The expansion rules (each documented, with its motivating routines, in the
// rule's README.md):
//
//   Fortran 2D array + LDx   ->  A, strideA1, strideA2, offsetA   (4, rigid)
//   Fortran 1D data array    ->  x, strideX, offsetX              (3, rigid)
//   Fortran CHARACTER / dim  ->  passthrough scalar               (1)
//   Fortran scalar (in)      ->  passthrough value                (1; complex 1-2)
//   Fortran scalar (out/inout) -> result value / out array        (flexible)
//   Fortran workspace array  ->  elided or out array              (flexible)
//   Fortran LDx              ->  consumed (replaced by strides)    (0)
//   Fortran INCx             ->  consumed (replaced by strides)    (0-1)
//   Fortran INFO             ->  consumed (returned)               (0-1)
//   Fortran L*WORK size      ->  consumed (implicit) or kept       (0-1)
//
// Every non-rigid case here corresponds to a real, named subtlety in the corpus
// — see README.md. New subtleties are accommodated by refining THIS function,
// never by exempting a routine.

// A workspace array: WORK, RWORK, IWORK, WORK2, H (typed "workspace"), etc.
var WORKSPACE_NAME_RE = /^[A-Z]?WORK\d*$/i;

// A workspace-size scalar: LWORK, LRWORK, LIWORK, LZWORK, LWORKL, ...
var WORKSIZE_RE = /^L[A-Z]*WORK[A-Z0-9]*$/i;

// A leading-dimension scalar: LDA, LDAB, LDGCOL, ... (but not an array named LD*)
var LEADING_DIM_RE = /^LD[A-Z0-9]*$/i;

// An increment scalar: INCX, INCY, INC, ...
var INCREMENT_RE = /^INC[A-Z0-9]*$/i;

// Normalize a Fortran intent ("in", "out", "in,out", "in, out", "inout") to
// one of 'in' | 'out' | 'inout'.
function normDirection( dir ) {
	var d = String( dir || '' ).toLowerCase().replace( /\s+/g, '' );
	if ( d === 'in' ) {
		return 'in';
	}
	if ( d === 'out' ) {
		return 'out';
	}
	return 'inout'; // "in,out" | "inout" | anything carrying input
}

function isArrayType( type ) {
	return /array/i.test( String( type ) );
}

function isComplexType( type ) {
	return /complex/i.test( String( type ) );
}

// A top-level (paren-depth 0) comma inside `dimension(...)` means two
// dimensions, e.g. `dimension (N,NRHS)`. Commas nested in a bound expression
// (`dimension (max(1,N))`) do not count, so 1D arrays with expression bounds
// are not misread as 2D.
function dimensionIs2D( type ) {
	var m = /dimension\s*\(([\s\S]*)\)/i.exec( String( type ) );
	if ( !m ) {
		return false;
	}
	var s = m[ 1 ];
	var depth = 0;
	for ( var i = 0; i < s.length; i++ ) {
		var ch = s[ i ];
		if ( ch === '(' ) {
			depth += 1;
		} else if ( ch === ')' ) {
			depth -= 1;
		} else if ( ch === ',' && depth === 0 ) {
			return true;
		}
	}
	return false;
}

// Classify one Fortran argument into a slot descriptor:
//
//   { fortranName, kind, shape, sizes }
//
//   shape : 'scalar' | '1d' | '2d' | 'consumed' — governs the naming check.
//   sizes : the set of JS parameter counts this argument may occupy. A single
//           value means the mapping is rigid (naming is then enforced for
//           array shapes); multiple values means the argument class is
//           representation-flexible and only participates in the count check.
function classifyArg( arg, allArgs ) {
	var name = String( arg.name ).toUpperCase();
	var type = arg.type || '';
	var dir = normDirection( arg.direction );
	var isArray = isArrayType( type );

	// --- consumed / near-consumed scalars ---------------------------------

	// INFO: an out scalar named INFO becomes the return value (0) or, rarely,
	// is surfaced through a result object and also kept — allow 0 or 1.
	if ( name === 'INFO' && !isArray ) {
		return slot( arg.name, 'info', 'consumed', [ 0, 1 ] );
	}

	// Workspace-size scalar (LWORK/LRWORK/...): the JS workspace size is
	// implicit in the typed array's own length, so it is normally dropped (0).
	// A few routines (notably ARPACK, e.g. dseupd's `lworkl`) keep it (1).
	if ( WORKSIZE_RE.test( name ) && !isArray ) {
		return slot( arg.name, 'worksize', 'consumed', [ 0, 1 ] );
	}

	// Leading dimension (LDA, LDAB, ...): always replaced by an explicit
	// stride, so dropped. The scalar test avoids consuming a genuine array
	// that merely begins with "LD" (e.g. DLAR1V's L*D vector).
	if ( LEADING_DIM_RE.test( name ) && !isArray ) {
		return slot( arg.name, 'leading-dim', 'consumed', [ 0 ] );
	}

	// Increment (INCX/INCY): normally replaced by a stride (0). A rare routine
	// keeps it for its sign semantics (e.g. DLASWP's pivot direction), so
	// allow 0 or 1 rather than forcing every vector routine to shed it.
	if ( INCREMENT_RE.test( name ) && !isArray ) {
		return slot( arg.name, 'increment', 'consumed', [ 0, 1 ] );
	}

	// --- workspace arrays --------------------------------------------------

	// The most representation-flexible class: allocated internally and elided
	// (0), or kept as `arr,offset` (2), `arr,stride,offset` (3), or a 2D
	// workspace `arr,stride1,stride2,offset` (4, e.g. DLARFB/DTPRFB).
	if ( WORKSPACE_NAME_RE.test( name ) || /workspace/i.test( type ) ) {
		return slot( arg.name, 'workspace', '1d', [ 0, 2, 3, 4 ] );
	}

	// --- data arrays -------------------------------------------------------

	if ( isArray ) {
		var hasLD = allArgs.some( function some( a ) {
			return new RegExp( '^LD' + name + '$', 'i' ).test( String( a.name ) );
		});
		if ( hasLD || dimensionIs2D( type ) ) {
			return slot( arg.name, 'array2d', '2d', [ 4 ] );
		}
		return slot( arg.name, 'array1d', '1d', [ 3 ] );
	}

	// --- scalars -----------------------------------------------------------

	// A scalar the routine writes cannot be returned through a by-value JS
	// parameter, so an out/inout scalar is represented as a caller array (or a
	// result object / packed with siblings, e.g. DROTG's DA,DB -> `ab`;
	// DLARTG's C,S,R -> `out`). These are the packing subtleties.
	if ( dir === 'out' ) {
		return slot( arg.name, 'scalar-out', 'scalar', [ 0, 1, 2, 3 ] );
	}
	if ( dir === 'inout' ) {
		return slot( arg.name, 'scalar-inout', 'scalar', [ 1, 2, 3 ] );
	}

	// A COMPLEX input is not a single JS number: it may be a Complex128 object
	// (1) or a typed-array + offset (2).
	if ( isComplexType( type ) ) {
		return slot( arg.name, 'scalar-complex-in', 'scalar', [ 1, 2 ] );
	}

	// A plain real/integer/character/logical input: a single passthrough value.
	return slot( arg.name, 'scalar-in', 'scalar', [ 1 ] );
}

function slot( fortranName, kind, shape, sizes ) {
	return {
		'fortranName': fortranName,
		'kind': kind,
		'shape': shape,
		'sizes': sizes
	};
}

// The sorted set of achievable total parameter counts: every combination of
// each slot's allowed sizes, deduped by sum.
function achievableCounts( slots ) {
	var sums = { '0': true };
	slots.forEach( function forEach( g ) {
		var next = {};
		Object.keys( sums ).forEach( function forEachSum( s ) {
			g.sizes.forEach( function forEachSize( sz ) {
				next[ Number( s ) + sz ] = true;
			});
		});
		sums = next;
	});
	return Object.keys( sums ).map( Number ).sort( function cmp( a, b ) {
		return a - b;
	});
}

// Is the signature positionally rigid? Only when every slot has exactly one
// allowed size can we prove where each parameter lands and enforce the
// stride/offset naming discipline positionally.
function isRigid( slots ) {
	return slots.every( function every( g ) {
		return g.sizes.length === 1;
	});
}

// Derive the full model from a Fortran argument list.
//
// opts.complexReturn — the Fortran routine is a COMPLEX-valued FUNCTION. A
// complex result is not a single JS number, so it is surfaced through an added
// output parameter that has no Fortran dummy-argument counterpart: a Complex128
// return value (0), or a caller `out` array as `out` (1) or `out,offset` (2).
// Real/integer FUNCTIONs return by value and add nothing.
function derive( fortranArgs, opts ) {
	opts = opts || {};
	var args = fortranArgs || [];
	var slots = args.map( function map( a ) {
		return classifyArg( a, args );
	});

	// Reverse-communication state. A Fortran routine driven by the ARPACK
	// reverse-communication protocol persists its progress across re-entries in
	// SAVE'd local variables (keyed off the IDO control argument). JavaScript
	// has no SAVE, so the translation threads an explicit `state` object as an
	// added leading parameter with no Fortran dummy-argument counterpart. Any
	// routine carrying an IDO argument therefore gains one `state` parameter.
	var hasIdo = args.some( function some( a ) {
		return String( a.name ).toUpperCase() === 'IDO';
	});
	if ( hasIdo ) {
		slots.unshift( slot( 'STATE', 'rci-state', 'scalar', [ 1 ] ) );
	}

	if ( opts.complexReturn ) {
		slots.push( slot( 'RETURN', 'complex-return', 'scalar', [ 0, 1, 2 ] ) );
	}
	return {
		'slots': slots,
		'counts': achievableCounts( slots ),
		'rigid': isRigid( slots )
	};
}

module.exports = {
	'derive': derive,
	'classifyArg': classifyArg,
	'achievableCounts': achievableCounts,
	'normDirection': normDirection,
	'dimensionIs2D': dimensionIs2D
};
