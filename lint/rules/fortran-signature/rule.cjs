'use strict';

// ESLint rule: fortran-signature
//
// Enforces that a routine's `base.js` parameter list is a faithful expansion of
// its reference Fortran signature. The expected signature is *computed* from the
// parsed Fortran arguments (see derive.cjs); this rule compares the actual
// exported function's parameters against that computed model on two axes:
//
//   1. Arity — the parameter count must be one the Fortran expansion can
//      produce (derive.cjs yields the full set of achievable counts, because
//      some Fortran argument classes have several faithful JS forms).
//
//   2. Naming discipline — every stride/offset parameter must refer to a real
//      array parameter by the `stride<Array>` / `offset<Array>` (and
//      `stride<Array>1` / `stride<Array>2` for 2D) convention. This is checked
//      by referential integrity on the actual parameter list, so it holds even
//      when flexible argument classes make absolute positions ambiguous.
//
// A routine with no ingested Fortran arguments is reported as a coverage gap
// (messageId 'noData') — a loud, visible failure, never a silent skip.

var path = require( 'path' );
var fortranData = require( '../../lib/fortran-data.cjs' );
var derive = require( './derive.cjs' ).derive;

// Compact rendering of the achievable-count set: a contiguous run as "a-b",
// otherwise "a or b or c".
function renderCounts( counts ) {
	if ( counts.length === 0 ) {
		return '0';
	}
	var contiguous = counts.every( function every( c, i ) {
		return i === 0 || c === counts[ i - 1 ] + 1;
	});
	if ( contiguous && counts.length > 2 ) {
		return counts[ 0 ] + '-' + counts[ counts.length - 1 ];
	}
	return counts.join( ' or ' );
}

// The maximal (all-positional) expected pattern, for diagnostics.
function renderPattern( slots ) {
	return slots.map( function map( g ) {
		var flex = ( g.sizes.length > 1 ) ? '?' : '';
		if ( g.shape === 'consumed' ) {
			return '(' + g.fortranName.toLowerCase() + ')' + flex;
		}
		if ( g.shape === 'scalar' ) {
			return g.fortranName.toLowerCase() + flex;
		}
		if ( g.shape === '1d' ) {
			return g.fortranName + ',stride,offset' + flex;
		}
		return g.fortranName + ',stride1,stride2,offset' + flex;
	}).join( ', ' );
}

function getParamNames( node ) {
	if ( !node.params ) {
		return [];
	}
	return node.params.map( function map( p ) {
		if ( p.type === 'Identifier' ) {
			return p.name;
		}
		if ( p.type === 'AssignmentPattern' && p.left && p.left.name ) {
			return p.left.name;
		}
		if ( p.type === 'RestElement' && p.argument && p.argument.name ) {
			return p.argument.name;
		}
		return '?';
	});
}

// Referential-integrity naming check. For every `stride*` parameter, resolve
// the array it refers to and confirm the array parameter and matching
// `offset*` parameter both exist under the convention. Position-independent, so
// flexible argument classes never produce spurious naming errors.
//
// An array parameter matches a stride suffix under two accepted relaxations,
// both real project conventions:
//
//   * Precision prefix — a complex vector kept as a reinterpreted typed array
//     retains its Fortran name (`zx`, `cy`) while its stride/offset use the
//     logical, prefix-stripped name (`strideX`, `offsetY`). So `zx`, `cx`,
//     `dx`, `sx` all satisfy suffix `X`.
//   * Digit-suffixed siblings — `stride<B>1` and `stride<B>2` denote the two
//     dimensions of a 2D array `B` ONLY when both siblings are present. When a
//     parameter is literally named `<B>1` (two separate 1D arrays like
//     `VN1`/`VN2`, `TAUP1`/`TAUP2`), the exact match wins and each is a plain
//     1D array. Exact match is therefore always tried first.
function checkNaming( params, node, context ) {
	var lower = {};
	params.forEach( function forEach( p ) {
		lower[ p.toLowerCase() ] = true;
	});

	function has( name ) {
		return lower[ String( name ).toLowerCase() ] === true;
	}

	// An array parameter satisfies `suffix` if it equals it, or equals it with a
	// single leading precision letter (z/c/d/s).
	function hasArray( suffix ) {
		if ( has( suffix ) ) {
			return true;
		}
		return [ 'z', 'c', 'd', 's' ].some( function some( pfx ) {
			return has( pfx + suffix );
		});
	}

	params.forEach( function forEach( p, i ) {
		var m = /^stride(.+)$/i.exec( p );
		if ( !m ) {
			return;
		}
		var suffix = m[ 1 ];
		var effSuffix = suffix;

		// Exact (or precision-prefixed) 1D array wins first.
		if ( !hasArray( suffix ) ) {
			var dm = /^(.*)([12])$/.exec( suffix );
			var resolved = false;
			if ( dm ) {
				var base = dm[ 1 ];
				var other = ( dm[ 2 ] === '1' ) ? '2' : '1';

				// (a) 2D array: `stride<B>1` paired with `stride<B>2`.
				if ( has( 'stride' + base + other ) && hasArray( base ) ) {
					effSuffix = base;
					resolved = true;

				// (b) Stride-name collision: a 1D array `B` whose canonical
				// `stride<B>` name is already claimed by another array's
				// dimension stride is disambiguated as `stride<B>1` (its sole
				// dimension), keeping `offset<B>`. Requires the digit `1`, the
				// array `B`, and the colliding `stride<B>` to all be present, so
				// it only fires on a real collision. (Motivating case: dlaed2,
				// where 2D `Q` claims strideQ2 and 1D `Q2` becomes strideQ21.)
				} else if ( dm[ 2 ] === '1' && hasArray( base ) && has( 'stride' + base ) ) {
					effSuffix = base;
					resolved = true;
				}
			}
			if ( !resolved ) {
				context.report({
					'node': node.params[ i ],
					'messageId': 'strideNoArray',
					'data': { 'stride': p, 'array': suffix }
				});
				return;
			}
		}

		if ( !has( 'offset' + effSuffix ) ) {
			context.report({
				'node': node.params[ i ],
				'messageId': 'strideNoOffset',
				'data': { 'stride': p, 'offset': 'offset' + effSuffix }
			});
		}
	});
}

var rule = {
	'meta': {
		'type': 'problem',
		'docs': {
			'description': 'enforce that base.js parameters faithfully expand the reference Fortran signature',
			'recommended': true
		},
		'schema': [],
		'messages': {
			'arity': 'Signature of {{routine}} has {{actual}} parameter(s); the Fortran expansion of {{fortran}} allows {{expected}}. Expected pattern (? = flexible): {{pattern}}',
			'strideNoArray': 'Stride parameter "{{stride}}" has no matching array parameter "{{array}}" — stride/offset names must be stride<Array>/offset<Array>.',
			'strideNoOffset': 'Stride parameter "{{stride}}" has no matching offset parameter "{{offset}}" — every strided array needs stride<Array> and offset<Array>.',
			'noData': 'No ingested Fortran arguments for "{{routine}}" — cannot compute its signature. Add its reference Fortran signature to lint/rules/fortran-signature/data/supplemental.json (do NOT exempt it).'
		}
	},
	'create': function create( context ) {
		var filename = context.filename || ( context.getFilename && context.getFilename() ) || '';
		if ( path.basename( filename ) !== 'base.js' ) {
			return {};
		}

		// Routine name from `.../<pkg>/base/<routine>/lib/base.js`.
		var parts = filename.split( path.sep );
		var baseIdx = parts.lastIndexOf( 'base' );
		if ( baseIdx === -1 || baseIdx + 1 >= parts.length ) {
			return {};
		}
		var routine = parts[ baseIdx + 1 ];

		var topLevelFns = [];

		return {
			'FunctionDeclaration': function onFn( node ) {
				if ( node.parent && node.parent.type === 'Program' ) {
					topLevelFns.push( node );
				}
			},
			'Program:exit': function onExit( programNode ) {
				// The exported routine is the top-level function named after the
				// routine; fall back to the last top-level function (base.js may
				// declare helpers like `cabs` or `computeWorkSize`).
				var node = null;
				var i;
				for ( i = 0; i < topLevelFns.length; i++ ) {
					if ( topLevelFns[ i ].id && topLevelFns[ i ].id.name.toLowerCase() === routine.toLowerCase() ) {
						node = topLevelFns[ i ];
						break;
					}
				}
				if ( !node && topLevelFns.length > 0 ) {
					node = topLevelFns[ topLevelFns.length - 1 ];
				}
				if ( !node ) {
					return;
				}

				var record = fortranData.lookup( routine );
				if ( !record || !record.arguments || record.arguments.length === 0 ) {
					context.report({
						'node': node.id || node,
						'messageId': 'noData',
						'data': { 'routine': routine }
					});
					return;
				}

				// A COMPLEX-valued FUNCTION surfaces its result through an added
				// output parameter (see derive.cjs).
				var complexReturn = /\bCOMPLEX(\*\d+)?\s+FUNCTION\b/i.test( record.signature || '' ) ||
					/\bDOUBLE\s+COMPLEX\s+FUNCTION\b/i.test( record.signature || '' );

				var model = derive( record.arguments, { 'complexReturn': complexReturn } );
				var params = getParamNames( node );

				// 1. Arity check against the Fortran-derived achievable counts.
				if ( model.counts.indexOf( params.length ) === -1 ) {
					context.report({
						'node': node.id || node,
						'messageId': 'arity',
						'data': {
							'routine': routine,
							'actual': String( params.length ),
							'fortran': record.name,
							'expected': renderCounts( model.counts ),
							'pattern': renderPattern( model.slots )
						}
					});
				}

				// 2. Naming discipline (position-independent).
				checkNaming( params, node, context );
			}
		};
	}
};

module.exports = rule;
