'use strict';

// ESLint rule: fortran-signature
//
// Enforces that a routine's OFFSET-FORM parameter list — declared identically in
// both `base.js` (the core) and `ndarray.js` (the public ndarray API) — is a
// faithful expansion of its reference Fortran signature. The expected signature
// is *computed* from the parsed Fortran arguments (see derive.cjs); this rule
// compares the actual exported function's parameters against that computed model
// on two axes:
//
//   1. Arity — the parameter count must be one the Fortran expansion can
//      produce (derive.cjs yields the full set of achievable counts, because
//      some Fortran argument classes have several faithful JS forms).
//
//   2. Naming discipline — every stride/offset parameter must refer to a real
//      array parameter by the `stride<Array>` / `offset<Array>` (and
//      `stride<Array>1` / `stride<Array>2` for 2D) convention (see
//      lint/lib/naming.cjs). Referential integrity, so it holds even when
//      flexible argument classes make absolute positions ambiguous.
//
// base.js and ndarray.js are both the offset form and both carry offsets, so
// both are checked with the same model and requireOffset=true. A routine with no
// ingested Fortran arguments is reported as a coverage gap (messageId 'noData')
// — a loud, visible failure, never a silent skip.

var path = require( 'path' );
var fortranData = require( '../../lib/fortran-data.cjs' );
var naming = require( '../../lib/naming.cjs' );
var derive = require( './derive.cjs' ).derive;

// The offset-form files this rule validates.
var OFFSET_FORM_FILES = { 'base.js': true, 'ndarray.js': true };

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

// Report the shared naming-discipline violations against the rule's own
// messageIds. Naming logic itself lives in lint/lib/naming.cjs.
function reportNaming( params, node, context ) {
	naming.checkNaming( params, { 'requireOffset': true } ).forEach( function forEach( v ) {
		context.report({
			'node': node.params[ v.index ] || node,
			'messageId': v.kind,
			'data': v.data
		});
	});
}

var rule = {
	'meta': {
		'type': 'problem',
		'docs': {
			'description': 'enforce that base.js/ndarray.js parameters faithfully expand the reference Fortran signature',
			'recommended': true
		},
		'schema': [],
		'messages': {
			'arity': 'Signature of {{routine}} has {{actual}} parameter(s); the Fortran expansion of {{fortran}} allows {{expected}}. Expected pattern (? = flexible): {{pattern}}',
			'strideNoArray': 'Stride parameter "{{stride}}" has no matching array parameter "{{array}}" — stride/offset names must be stride<Array>/offset<Array>.',
			'strideNoOffset': 'Stride parameter "{{stride}}" has no matching offset parameter "{{offset}}" — every strided array needs stride<Array> and offset<Array>.',
			'noData': 'No ingested Fortran arguments for "{{routine}}" — cannot compute its signature. Add its reference Fortran signature to data/fortran-signatures.supplemental.json and re-run `node bin/gen_fortran_signatures.js` (do NOT exempt it).'
		}
	},
	'create': function create( context ) {
		var filename = context.filename || ( context.getFilename && context.getFilename() ) || '';
		if ( OFFSET_FORM_FILES[ path.basename( filename ) ] !== true ) {
			return {};
		}

		// Routine name from `.../<pkg>/base/<routine>/lib/{base,ndarray}.js`.
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

				// 2. Naming discipline (position-independent); offset form.
				reportNaming( params, node, context );
			}
		};
	}
};

module.exports = rule;
