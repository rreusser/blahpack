'use strict';

// Flags z-prefix (complex-valued) base.js files that index Complex128Array
// parameters directly without using reinterpret(). Complex arrays must be
// reinterpreted as Float64Array views for element access.

var path = require( 'path' );

// Variable names that suggest complex array parameters
var RE_COMPLEX_INDEX = /(Av|Bv|Cv|Hv|Zv|Qv|Tv|Uv|Xv|VTv|VLv|VRv)\[/;

var rule = {
	'meta': {
		'docs': {
			'description': 'require reinterpret() in z-prefix routines that index complex arrays'
		},
		'schema': [],
		'type': 'problem'
	},
	'create': function main( context ) {
		var filename = ( context.filename || ( context.getFilename && context.getFilename() ) || '' );
		var basename = path.basename( filename );

		// Only applies to base.js in z-prefix routines
		if ( basename !== 'base.js' ) {
			return {};
		}
		var parts = filename.split( path.sep );
		var baseIdx = parts.indexOf( 'base' );
		if ( baseIdx === -1 || baseIdx + 1 >= parts.length ) {
			return {};
		}
		var routine = parts[ baseIdx + 1 ];
		if ( routine.charAt( 0 ) !== 'z' ) {
			return {};
		}

		var hasReinterpret = false;

		return {
			'CallExpression': function onCall( node ) {
				if (
					node.callee.type === 'Identifier' &&
					node.callee.name === 'reinterpret'
				) {
					hasReinterpret = true;
				}
			},
			'MemberExpression': function onMember( node ) {
				if (
					!hasReinterpret &&
					node.computed &&
					node.object.type === 'Identifier' &&
					RE_COMPLEX_INDEX.test( node.object.name + '[' )
				) {
					context.report({
						'node': node,
						'message': 'z-prefix routine indexes complex array "' + node.object.name + '" without reinterpret() — use reinterpret( viewType, arr, 0 ) first'
					});
				}
			}
		};
	}
};

module.exports = rule;
