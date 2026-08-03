'use strict';

// ESLint rule: wrapper-signature
//
// Checks the classic strided wrapper — `<routine>.js`, the BLAS/LAPACK-style
// public API that takes leading dimensions (`LDA`) instead of strides+offsets
// and computes offsets internally. Unlike base.js/ndarray.js, this file is NOT
// a rigid expansion of the Fortran signature: `order` appears only for the
// CBLAS-style routines, some auxiliary arrays drop their strides, and scalars
// may be renamed. A bit-exact derived signature is therefore not the right
// contract here.
//
// What IS invariant, and what this rule enforces, is naming discipline: every
// `stride*` parameter must refer to a real array parameter (via
// lint/lib/naming.cjs, including the shared-stride form `strideXYZ` for parallel
// arrays `x`,`y`,`z`). Offsets are computed internally in this form, so no
// matching `offset*` is required (requireOffset = false). This catches the real
// defect class — a stride whose array was renamed or dropped — without imposing
// a false rigid shape on a legitimately irregular wrapper.
//
// `LD*` leading-dimension parameters use Fortran-native names (`LDAB`,
// `LDGCOL`) that need not derive from the JS array name, so they are not checked
// here.

var path = require( 'path' );
var naming = require( '../../lib/naming.cjs' );

// Files that are NOT the strided wrapper even if the routine were named this.
var NON_WRAPPER = { 'base.js': true, 'ndarray.js': true, 'main.js': true, 'index.js': true };

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

var rule = {
	'meta': {
		'type': 'problem',
		'docs': {
			'description': 'enforce stride/offset naming discipline in the strided <routine>.js wrapper',
			'recommended': true
		},
		'schema': [],
		'messages': {
			'strideNoArray': 'Stride parameter "{{stride}}" has no matching array parameter "{{array}}" — a stride must name a real array (stride<Array>, or a shared stride like strideXYZ over parallel arrays).'
		}
	},
	'create': function create( context ) {
		var filename = context.filename || ( context.getFilename && context.getFilename() ) || '';
		var basename = path.basename( filename );
		if ( NON_WRAPPER[ basename ] === true ) {
			return {};
		}

		var parts = filename.split( path.sep );
		var baseIdx = parts.lastIndexOf( 'base' );
		if ( baseIdx === -1 || baseIdx + 1 >= parts.length ) {
			return {};
		}
		var routine = parts[ baseIdx + 1 ];

		// Only the `<routine>.js` file (the strided wrapper) is in scope.
		if ( basename !== routine + '.js' ) {
			return {};
		}

		var topLevelFns = [];

		return {
			'FunctionDeclaration': function onFn( node ) {
				if ( node.parent && node.parent.type === 'Program' ) {
					topLevelFns.push( node );
				}
			},
			'Program:exit': function onExit() {
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

				var params = getParamNames( node );
				naming.checkNaming( params, { 'requireOffset': false } ).forEach( function forEach( v ) {
					context.report({
						'node': node.params[ v.index ] || node,
						'messageId': v.kind,
						'data': v.data
					});
				});
			}
		};
	}
};

module.exports = rule;
