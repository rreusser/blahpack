'use strict';

// ESLint rule: module-exports
//
// Checks the export surface of a module's lib/index.js, which carries no
// parameter list of its own but defines how the module is consumed (CONVENTIONS
// F3; there is no main.js, ticket 0124). index.js must:
//
//   - attach the offset form to the layout form:
//       setReadOnly( <routine>, 'strided', strided )
//   - default-export the routine, typed with what it attaches, so tsc checks
//     callers' `<routine>.strided( … )` (ticket 0094):
//       export default /** @type {typeof <routine> & { strided: typeof strided }} */ ( <routine> );
//   - export the offset form by name: export { strided };
//
// A module missing any of these is a broken public API.

var path = require( 'path' );
var moduleOf = require( '../../lib/module-path.cjs' ).moduleOf;

function isStridedAttach( node ) {
	// setReadOnly( X, 'strided', Y )
	if ( node.callee && node.callee.type === 'Identifier' && node.callee.name === 'setReadOnly' ) {
		var a = node.arguments && node.arguments[ 1 ];
		if ( a && ( a.type === 'Literal' || a.type === 'StringLiteral' ) && a.value === 'strided' ) {
			return true;
		}
	}
	return false;
}

var rule = {
	'meta': {
		'type': 'problem',
		'docs': {
			'description': 'enforce the export surface of index.js (typed default with .strided attached, and a named strided export)',
			'recommended': true
		},
		'schema': [],
		'messages': {
			'noDefault': 'index.js must export a default (the layout form).',
			'noAttach': 'index.js must attach the offset form: setReadOnly( <routine>, \'strided\', strided ).',
			'untyped': 'index.js must type its default export with the strided it attaches, so tsc checks callers\' `<routine>.strided( … )`: export default /** @type {typeof <routine> & { strided: typeof strided }} */ ( <routine> ); (ticket 0094)',
			'noNamedStrided': 'index.js must also export the offset form by name: export { strided };'
		}
	},
	'create': function create( context ) {
		var filename = context.filename || ( context.getFilename && context.getFilename() ) || '';
		if ( path.basename( filename ) !== 'index.js' ) {
			return {};
		}
		// Only a module's own lib/index.js (lib/<pkg>/<routine>/lib/index.js).
		var mod = moduleOf( filename );
		if ( !mod || mod.rest.length !== 2 || mod.rest[ 0 ] !== 'lib' ) {
			return {};
		}
		var hasDefaultExport = false;
		var hasNamedStrided = false;
		var stridedAttached = false;
		var defaultTyped = false;
		var sourceCode = context.sourceCode || context.getSourceCode();

		return {
			'ExportDefaultDeclaration': function onDefault( node ) {
				hasDefaultExport = true;
				if ( /^export default \/\*\* @type \{typeof ([\w$]+) & \{ strided: typeof [\w$]+ \}\} \*\/ \( \1 \);$/.test( sourceCode.getText( node ) ) ) {
					defaultTyped = true;
				}
			},
			'ExportNamedDeclaration': function onNamed( node ) {
				( node.specifiers || [] ).forEach( function forEach( spec ) {
					var exported = spec.exported && ( spec.exported.name || spec.exported.value );
					if ( exported === 'default' ) {
						hasDefaultExport = true;
					}
					if ( exported === 'strided' ) {
						hasNamedStrided = true;
					}
				});
			},
			'CallExpression': function onCall( node ) {
				if ( isStridedAttach( node ) ) {
					stridedAttached = true;
				}
			},
			'Program:exit': function onExit( programNode ) {
				if ( !hasDefaultExport ) {
					context.report({ 'node': programNode, 'messageId': 'noDefault' });
				}
				if ( !stridedAttached ) {
					context.report({ 'node': programNode, 'messageId': 'noAttach' });
				} else if ( hasDefaultExport && !defaultTyped ) {
					context.report({ 'node': programNode, 'messageId': 'untyped' });
				}
				if ( !hasNamedStrided ) {
					context.report({ 'node': programNode, 'messageId': 'noNamedStrided' });
				}
			}
		};
	}
};

module.exports = rule;
