'use strict';

// ESLint rule: module-exports
//
// Checks the export surface of a module's lib/index.js, which carries no
// parameter list of its own but defines how the module is consumed (CONVENTIONS
// F3; there is no main.js, ticket 0124). index.js must:
//
//   - attach the offset form to the layout form:
//       setReadOnly( <routine>, 'ndarray', ndarray )
//   - default-export the routine, typed with what it attaches, so tsc checks
//     callers' `<routine>.ndarray( … )` (ticket 0094):
//       export default /** @type {typeof <routine> & { ndarray: typeof ndarray }} */ ( <routine> );
//   - export the offset form by name: export { ndarray };
//
// A module missing any of these is a broken public API.

var path = require( 'path' );

function isNdarrayAttach( node ) {
	// setReadOnly( X, 'ndarray', Y )
	if ( node.callee && node.callee.type === 'Identifier' && node.callee.name === 'setReadOnly' ) {
		var a = node.arguments && node.arguments[ 1 ];
		if ( a && ( a.type === 'Literal' || a.type === 'StringLiteral' ) && a.value === 'ndarray' ) {
			return true;
		}
	}
	return false;
}

var rule = {
	'meta': {
		'type': 'problem',
		'docs': {
			'description': 'enforce the export surface of index.js (typed default with .ndarray attached, and a named ndarray export)',
			'recommended': true
		},
		'schema': [],
		'messages': {
			'noDefault': 'index.js must export a default (the layout form).',
			'noAttach': 'index.js must attach the offset form: setReadOnly( <routine>, \'ndarray\', ndarray ).',
			'untyped': 'index.js must type its default export with the ndarray it attaches, so tsc checks callers\' `<routine>.ndarray( … )`: export default /** @type {typeof <routine> & { ndarray: typeof ndarray }} */ ( <routine> ); (ticket 0094)',
			'noNamedNdarray': 'index.js must also export the offset form by name: export { ndarray };'
		}
	},
	'create': function create( context ) {
		var filename = context.filename || ( context.getFilename && context.getFilename() ) || '';
		if ( path.basename( filename ) !== 'index.js' ) {
			return {};
		}
		// Only within a module tree (…/base/<routine>/lib/).
		var parts = filename.split( path.sep );
		if ( parts.lastIndexOf( 'base' ) === -1 || parts[ parts.length - 2 ] !== 'lib' ) {
			return {};
		}
		var hasDefaultExport = false;
		var hasNamedNdarray = false;
		var ndarrayAttached = false;
		var defaultTyped = false;
		var sourceCode = context.sourceCode || context.getSourceCode();

		return {
			'ExportDefaultDeclaration': function onDefault( node ) {
				hasDefaultExport = true;
				if ( /^export default \/\*\* @type \{typeof ([\w$]+) & \{ ndarray: typeof [\w$]+ \}\} \*\/ \( \1 \);$/.test( sourceCode.getText( node ) ) ) {
					defaultTyped = true;
				}
			},
			'ExportNamedDeclaration': function onNamed( node ) {
				( node.specifiers || [] ).forEach( function forEach( spec ) {
					var exported = spec.exported && ( spec.exported.name || spec.exported.value );
					if ( exported === 'default' ) {
						hasDefaultExport = true;
					}
					if ( exported === 'ndarray' ) {
						hasNamedNdarray = true;
					}
				});
			},
			'CallExpression': function onCall( node ) {
				if ( isNdarrayAttach( node ) ) {
					ndarrayAttached = true;
				}
			},
			'Program:exit': function onExit( programNode ) {
				if ( !hasDefaultExport ) {
					context.report({ 'node': programNode, 'messageId': 'noDefault' });
				}
				if ( !ndarrayAttached ) {
					context.report({ 'node': programNode, 'messageId': 'noAttach' });
				} else if ( hasDefaultExport && !defaultTyped ) {
					context.report({ 'node': programNode, 'messageId': 'untyped' });
				}
				if ( !hasNamedNdarray ) {
					context.report({ 'node': programNode, 'messageId': 'noNamedNdarray' });
				}
			}
		};
	}
};

module.exports = rule;
