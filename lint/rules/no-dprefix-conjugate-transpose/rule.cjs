'use strict';

// Flags "conjugate-transpose" string literals in d-prefix (real-valued) routines.
// Real routines don't have conjugate transposes — this is a copy-paste error
// from z-prefix (complex) routines.
//
// Fixable: replaces "conjugate-transpose" with "transpose".

var path = require( 'path' );

var rule = {
	'meta': {
		'docs': {
			'description': 'disallow "conjugate-transpose" in d-prefix (real-valued) routines'
		},
		'schema': [],
		'type': 'problem',
		'fixable': 'code'
	},
	'create': function main( context ) {
		var filename = ( context.filename || ( context.getFilename && context.getFilename() ) || '' );

		// Only applies to d-prefix routines
		var parts = filename.split( path.sep );
		var baseIdx = parts.indexOf( 'base' );
		if ( baseIdx === -1 || baseIdx + 1 >= parts.length ) {
			return {};
		}
		var routine = parts[ baseIdx + 1 ];
		if ( routine.charAt( 0 ) !== 'd' ) {
			return {};
		}

		return {
			'Literal': function onLiteral( node ) {
				if (
					typeof node.value === 'string' &&
					node.value === 'conjugate-transpose'
				) {
					context.report({
						'node': node,
						'message': 'd-prefix routine should not use "conjugate-transpose" — use "transpose" instead',
						'fix': function fix( fixer ) {
							return fixer.replaceText( node, "'" + 'transpose' + "'" );
						}
					});
				}
			}
		};
	}
};

module.exports = rule;
