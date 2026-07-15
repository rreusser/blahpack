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
// Exemptions (mirroring the workspace gate's `internalAllocs`):
//   - scalar temporaries: a bare numeric size <= 8 (e.g. `new Float64Array( 2 )`
//     for a complex scalar / a `DUM(1)` placeholder);
//   - the block-reflector T factor (`T`, `T1`, `T2`, ...), which is a genuine
//     algorithm-internal block, not caller-visible workspace;
//   - buffer views (`new Complex128Array( x.buffer )`), which reinterpret an
//     existing allocation rather than creating one.

var path = require( 'path' );

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
// (optionally suffixed, e.g. work1). Its presence is what makes an internal
// workspace allocation a contract violation — a routine with no workspace
// parameter (e.g. a BLAS kernel with an internal register-tiling pack buffer)
// legitimately owns its scratch and is NOT covered by this policy.
var WORK_PARAM_RE = /^([irsdcz]?work|l?work)\d*$/i;


// HELPERS //

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
				var i;
				if ( !hasWorkParam ) {
					return; // no caller-provided workspace contract => not covered
				}
				for ( i = 0; i < candidates.length; i++ ) {
					context.report({
						'node': candidates[ i ],
						'message': bn + ' must not allocate a problem-sized workspace array (`new ' + candidates[ i ].callee.name + '(...)`) — this routine has a caller-provided workspace parameter, so base.js and ndarray.js must never allocate (the ndarray layer is where same-size batches reuse ONE workspace). Allocate only in the wrapper (<routine>.js) when `work === null`, and assert the size in ndarray.js. Exemptions: fixed-size bookkeeping arrays and the block-reflector T factor.'
					});
				}
			}
		};
	}
};

module.exports = rule;
