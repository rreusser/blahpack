'use strict';

// Disallow calling the stdlib `max`/`min` functions with more than two arguments.
//
// `@stdlib/math/base/special/max`, `.../min` and their `fast/` variants are
// BINARY: `max( 1, M, N )` silently ignores `N` (returns `max( 1, M )`). Unlike
// `Math.max`, they are not variadic. The usual victims are default workspace
// sizes and leading-dimension checks translated from Fortran `MAX( 1, M, N )`,
// which then under-allocate or under-validate silently. Nest instead:
// `max( 1, max( M, N ) )`.

var SOURCE = /^@stdlib\/math\/base\/special\/(fast\/)?(max|min)(\/lib\/index\.js)?$/;

var rule = {
	'meta': {
		'docs': {
			'description': 'disallow n-ary calls to the binary stdlib max/min'
		},
		'messages': {
			'nary': '`{{name}}` is the binary stdlib {{fn}}: the call passes {{count}} arguments and silently ignores all but the first two. Nest calls instead.'
		},
		'schema': [],
		'type': 'problem'
	},
	'create': function main( context ) {
		var bound = {};
		return {
			'ImportDeclaration': function onImport( node ) {
				var m = SOURCE.exec( node.source.value );
				var i;
				if ( !m ) {
					return;
				}
				for ( i = 0; i < node.specifiers.length; i++ ) {
					if ( node.specifiers[ i ].type === 'ImportDefaultSpecifier' ) {
						bound[ node.specifiers[ i ].local.name ] = m[ 2 ];
					}
				}
			},
			'CallExpression': function onCall( node ) {
				var name = node.callee.type === 'Identifier' && node.callee.name;
				if ( name && bound[ name ] && node.arguments.length > 2 ) {
					context.report({
						'node': node,
						'messageId': 'nary',
						'data': { 'name': name, 'fn': bound[ name ], 'count': String( node.arguments.length ) }
					});
				}
			}
		};
	}
};

module.exports = rule;
