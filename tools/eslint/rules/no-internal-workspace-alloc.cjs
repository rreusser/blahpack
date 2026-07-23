'use strict';

// Disallow internal workspace-array allocation inside base.js AND ndarray.js.
//
// Workspace strategy (three layers; allocation allowed in exactly one):
//   - base.js    : NEVER allocates. Pure strided kernel; the caller owns every
//                  buffer.
//   - ndarray.js : NEVER allocates; asserts the caller-provided size (throws a
//                  RangeError instead of silently reading OOB into NaN). This is
//                  the BATCHING layer — a stack of same-size matrices shares ONE
//                  workspace, allocated once by the batch driver and reused across
//                  every per-matrix call, so per-call allocation here would defeat
//                  the batching design.
//   - <routine>.js (the "easy" wrapper): the ONLY sanctioned allocation site, and
//                  only when the caller passes `work === null` (single-call
//                  ergonomics; the batch/perf path always passes a reused buffer).
//
// Rationale (per project design): (a) these JS routines model C implementations —
// avoiding allocation avoids C memory management; if C doesn't allocate, JS
// shouldn't either. (b) Batching reuses one workspace, so allocation must live
// above the per-invocation routines. This rule enforces the base+ndarray half.
//
// Exemptions (mirroring the workspace conformance check's `internalAllocs`):
//   - scalar temporaries: a bare numeric size <= 8 (e.g. `new Float64Array( 2 )`
//     for a complex scalar / a `DUM(1)` placeholder);
//   - the block-reflector T factor (`T`, `T1`, `T2`, ...), which is a genuine
//     algorithm-internal block, not caller-visible workspace;
//   - buffer views (`new Complex128Array( x.buffer )`), which reinterpret an
//     existing allocation rather than creating one.

var path = require( 'path' );
var util = require( '../../../bin/conformance/util.js' );

// Memoize the "does the reference Fortran declare a workspace array?" lookup so
// linting `base.js` and `ndarray.js` of the same routine reads the source once.
var FORTRAN_WS_CACHE = {};

var TYPED_ARRAYS = {
	'Float64Array': true,
	'Float32Array': true,
	'Int32Array': true,
	'Int8Array': true,
	'Uint8Array': true,
	'Uint32Array': true,
	'Complex128Array': true,
	'Complex64Array': true
};

// A caller-provided workspace parameter: work, iwork, rwork, swork, WORK, ...
// (optionally suffixed, e.g. work1).
//
// The trigger for this rule is NOT the presence of this parameter — that gate
// had a hole: a routine that never exposed the parameter and just allocated
// internally escaped entirely (see the workspace-tier backlog). The ground
// truth is the REFERENCE FORTRAN: if `<routine>.f` declares a WORK-family array
// argument, the scratch must be caller-owned, whether or not the JS port has
// gotten around to exposing it. The JS-parameter check remains a secondary
// trigger (so a half-refactored routine that exposes `work` but still allocates
// is caught even if the Fortran source can't be read).
var WORK_PARAM_RE = /^([irsdcz]?work|l?work)\d*$/i;


// HELPERS //

/**
* Derives the routine name from a `.../base/<routine>/lib/<file>.js` path.
*
* @private
* @param {string} filename - absolute path of the file being linted
* @returns {string} routine name (matches the reference Fortran filename)
*/
function routineFromFile( filename ) {
	return path.basename( path.dirname( path.dirname( filename ) ) );
}

/**
* Whether the reference LAPACK/BLAS Fortran for `routine` declares a
* caller-provided workspace array argument (`WORK`/`RWORK`/`IWORK`/`SWORK`/
* `BWORK`). This — not the presence of a JS parameter — is the ground truth for
* "this routine's scratch must be caller-owned": a routine that ignores (or
* never even exposes) that contract and allocates internally is the violation.
* Result is memoized per routine. Reads that fail (no Fortran on disk) return
* `false`, leaving the JS-parameter check as the fallback trigger.
*
* @private
* @param {string} routine - routine name
* @returns {boolean}
*/
function fortranDeclaresWorkspace( routine ) {
	var src;
	var args;
	var i;
	if ( Object.prototype.hasOwnProperty.call( FORTRAN_WS_CACHE, routine ) ) {
		return FORTRAN_WS_CACHE[ routine ];
	}
	FORTRAN_WS_CACHE[ routine ] = false;
	try {
		src = util.readFortran( routine );
		if ( src ) {
			args = util.fortranArgs( src, routine );
			for ( i = 0; i < args.length; i++ ) {
				if ( util.FORTRAN_WORK_ARGS.indexOf( args[ i ] ) !== -1 ) {
					FORTRAN_WS_CACHE[ routine ] = true;
					break;
				}
			}
		}
	} catch ( err ) {
		FORTRAN_WS_CACHE[ routine ] = false;
	}
	return FORTRAN_WS_CACHE[ routine ];
}

/**
* Whether the NewExpression is assigned to a block-reflector T factor variable
* (`T`, `T1`, `T2`, ...), which is legitimately internal.
*
* @private
* @param {Object} node - NewExpression AST node
* @returns {boolean}
*/
function isTFactorTarget( node ) {
	var p = node.parent;
	if ( !p ) {
		return false;
	}
	if ( p.type === 'VariableDeclarator' && p.id && p.id.type === 'Identifier' ) {
		return ( /^T\d*$/ ).test( p.id.name );
	}
	if ( p.type === 'AssignmentExpression' && p.left && p.left.type === 'Identifier' ) {
		return ( /^T\d*$/ ).test( p.left.name );
	}
	return false;
}

/**
* Whether the constructor argument denotes a workspace-sized allocation. True
* LAPACK workspace SCALES with the problem, so its size is a computed expression
* referencing a dimension (`nh*32`, `MN + …`, `in_*2`). A bare numeric literal —
* of ANY magnitude — is a fixed-size internal bookkeeping array (an ARPACK
* `IPNTR(14)`, a scalar `DUM(1)`), which is a Fortran local, not caller-owned
* workspace. A `.buffer` view is a reinterpret, not an allocation.
*
* @private
* @param {Object} arg - first argument AST node (or undefined)
* @returns {boolean}
*/
function isWorkspaceSized( arg ) {
	if ( !arg ) {
		return false;
	}
	if ( arg.type === 'Literal' ) {
		return false; // fixed size => bounded bookkeeping / scalar temp, not workspace
	}
	if ( arg.type === 'ArrayExpression' ) {
		return false; // `new T([a,b])` builds a fixed-size value (e.g. a complex scalar), not workspace
	}
	if ( arg.type === 'MemberExpression' && arg.property && arg.property.name === 'buffer' ) {
		return false;
	}
	return true; // computed size (identifier / binary expr / call) => scales with the problem
}


// RULE //

var rule = {
	'meta': {
		'docs': {
			'description': 'disallow internal workspace-array allocation in base.js (the caller must own the buffer)'
		},
		'schema': [],
		'type': 'problem'
	},
	'create': function main( context ) {
		var bn = path.basename( context.getFilename() );
		if ( bn !== 'base.js' && bn !== 'ndarray.js' ) {
			return {};
		}
		var fortranHasWorkspace = fortranDeclaresWorkspace( routineFromFile( context.getFilename() ) );
		var hasWorkParam = false;
		var candidates = [];

		function scanParams( node ) {
			var i;
			var p;
			for ( i = 0; i < node.params.length; i++ ) {
				p = node.params[ i ];
				if ( p.type === 'Identifier' && WORK_PARAM_RE.test( p.name ) ) {
					hasWorkParam = true;
				}
			}
		}
		return {
			'FunctionDeclaration': scanParams,
			'FunctionExpression': scanParams,
			'ArrowFunctionExpression': scanParams,
			'NewExpression': function onNew( node ) {
				if ( !node.callee || node.callee.type !== 'Identifier' || !TYPED_ARRAYS[ node.callee.name ] ) {
					return;
				}
				if ( isTFactorTarget( node ) ) {
					return;
				}
				if ( !isWorkspaceSized( node.arguments && node.arguments[ 0 ] ) ) {
					return;
				}
				candidates.push( node );
			},
			'Program:exit': function onExit() {
				var reason;
				var i;

				// The scratch must be caller-owned when EITHER the reference
				// Fortran declares a workspace array (the ground truth — this
				// catches routines that never even exposed the parameter and
				// allocate internally) OR the JS already exposes a workspace
				// parameter (the "ignored param + internal alloc" double bug).
				if ( !fortranHasWorkspace && !hasWorkParam ) {
					return; // genuinely no caller-provided workspace contract
				}
				reason = ( fortranHasWorkspace ) ?
					'the reference Fortran declares a caller-provided workspace array (WORK/RWORK/IWORK/SWORK/BWORK)' :
					'this routine exposes a caller-provided workspace parameter';
				for ( i = 0; i < candidates.length; i++ ) {
					context.report({
						'node': candidates[ i ],
						'message': bn + ' must not allocate a problem-sized workspace array (`new ' + candidates[ i ].callee.name + '(...)`) — ' + reason + ', so this workspace must be caller-owned. Expose `work, strideWork, offsetWork` (and `iwork`/`rwork` as needed) on base.js + ndarray.js and USE it (per @stdlib/lapack/base/dlarf1f); assert the size in ndarray.js; allocate only in the wrapper (<routine>.js) when `work === null`. base.js/ndarray.js must never allocate — that is what lets same-size batches reuse ONE workspace. Exemptions: fixed-size bookkeeping arrays, buffer views, and the block-reflector T factor.'
					});
				}
			}
		};
	}
};

module.exports = rule;
