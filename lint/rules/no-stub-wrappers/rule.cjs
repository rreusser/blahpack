'use strict';

// Flags files (other than base.js) that still contain "not yet implemented".
// These are scaffold remnants that should be replaced with real implementations.

var path = require( 'path' );

var rule = {
	'meta': {
		'docs': {
			'description': 'disallow "not yet implemented" stubs in wrapper files'
		},
		'schema': [],
		'type': 'problem'
	},
	'create': function main( context ) {
		var filename = ( context.filename || ( context.getFilename && context.getFilename() ) || '' );
		var basename = path.basename( filename );

		// Only check wrapper files (index.js, strided.js, etc.), not base.js
		if ( basename === 'base.js' ) {
			return {};
		}

		return {
			'ThrowStatement': function onThrow( node ) {
				var arg = node.argument;
				if (
					arg &&
					arg.type === 'NewExpression' &&
					arg.arguments &&
					arg.arguments.length > 0 &&
					arg.arguments[ 0 ].type === 'Literal' &&
					typeof arg.arguments[ 0 ].value === 'string' &&
					/not yet implemented/.test( arg.arguments[ 0 ].value )
				) {
					context.report({
						'node': node,
						'message': 'Stub wrapper — replace "not yet implemented" with real implementation'
					});
				}
			},
			'Literal': function onLiteral( node ) {
				if (
					typeof node.value === 'string' &&
					/not yet implemented/.test( node.value ) &&
					node.parent.type !== 'ThrowStatement' &&
					!( node.parent.type === 'NewExpression' && node.parent.parent && node.parent.parent.type === 'ThrowStatement' )
				) {
					context.report({
						'node': node,
						'message': 'Stub wrapper — "not yet implemented" string found'
					});
				}
			}
		};
	}
};

module.exports = rule;
