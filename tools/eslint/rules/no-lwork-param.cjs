'use strict';

// Disallow a vestigial workspace-LENGTH parameter (`lwork`, `liwork`, `lrwork`, ...).
//
// In reference Fortran LAPACK a blocked routine takes a WORK array AND a
// separate LWORK integer giving its length, because Fortran arrays do not carry
// their own size. In this JS port that integer is redundant: a typed array knows
// its `.length`, so a caller-owned WORK array fully determines the available
// workspace — `WORK.length - offsetWork`. A separate length parameter is not only
// redundant, it is a proven source of signature-drift bugs: args shift, base.js
// and ndarray.js disagree, callers pass it in the wrong slot (the dposvx/zgesvx
// rcond-arg crashes were exactly this class).
//
// Where reference LAPACK genuinely CONSUMES lwork, the fix is still to drop the
// parameter:
//   - NB adaptation (`nb = floor( lwork / ... )`): read `WORK.length - offsetWork`
//     instead — identical information, no redundant/contradictable parameter.
//   - the `lwork === -1` workspace query: expose the optimal size through a
//     dedicated mechanism (a size helper / documented formula), not by overloading
//     a parameter that otherwise just duplicates WORK.length.
//
// This rule forbids the PARAMETER only. A local variable computed from the array
// (`var lwork = WORK.length - offsetWork;`) is fine and encouraged.

// Matches a workspace-LENGTH parameter: an `l` prefix + optional element-type
// letter + `work` (lwork, liwork, lrwork, lswork, lcwork, lzwork). Does NOT
// match the WORK array parameter itself (`work`, `iwork`, `rwork`) — those are
// legitimate.
//
// The `d` alternative is deliberately EXCLUDED: `LD` is LAPACK's universal
// leading-dimension prefix (LDA, LDB, LDV, LDT, LDC), so `LDWORK` is the
// *leading dimension* of a 2D workspace matrix (e.g. DLARFB/DTPRFB), not a
// length. A flat typed array carries its `.length` but not its 2D leading
// dimension, so `LDWORK` is a genuine shape parameter kept by the layout
// wrapper exactly like LDV/LDT/LDC — not a redundant length. (There is no
// "length of double WORK" param in LAPACK; work lengths are just `LWORK`.)
var LWORK_PARAM_RE = /^l(?:i|r|s|c|z)?work$/i;


// RULE //

var rule = {
	'meta': {
		'docs': {
			'description': 'disallow a vestigial workspace-length parameter (lwork/liwork/lrwork); derive the length from WORK.length'
		},
		'schema': [],
		'type': 'problem'
	},
	'create': function main( context ) {
		function scanParams( node ) {
			var i;
			var p;
			for ( i = 0; i < node.params.length; i++ ) {
				p = node.params[ i ];
				if ( p.type === 'Identifier' && LWORK_PARAM_RE.test( p.name ) ) {
					context.report({
						'node': p,
						'message': 'Remove the vestigial `' + p.name + '` parameter. A typed workspace array carries its own `.length`, so the available workspace is `WORK.length - offsetWork` — a separate length integer is redundant and causes signature-drift bugs. If the routine adapts its block size to available workspace, read `WORK.length - offsetWork`; for the `lwork === -1` size query, expose the size via a dedicated helper rather than overloading a parameter.'
					});
				}
			}
		}
		return {
			'FunctionDeclaration': scanParams,
			'FunctionExpression': scanParams,
			'ArrowFunctionExpression': scanParams
		};
	}
};

module.exports = rule;
