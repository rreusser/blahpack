'use strict';

// ESLint rule: module-exports
//
// Checks the export surface of the two plumbing files that carry no parameter
// list of their own but define how the module is consumed:
//
//   main.js  — must expose the routine with its ndarray variant attached
//              (`setReadOnly( routine, 'ndarray', ndarray )`) and export it as
//              the default.
//   index.js — must export a default AND make the `ndarray` variant reachable,
//              either as a named `ndarray` export (the common form) or by
//              re-exporting main.js's default (which already carries `.ndarray`).
//
// This is the "signature" of the module surface: a module must always offer both
// the strided default entry point and its ndarray counterpart. A module missing
// either is a broken public API.

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
			'description': 'enforce the export surface of main.js (ndarray attached) and index.js (default + ndarray)',
			'recommended': true
		},
		'schema': [],
		'messages': {
			'mainNoDefault': 'main.js must export a default (the routine).',
			'mainNoNdarray': 'main.js must attach the ndarray variant: setReadOnly( <routine>, \'ndarray\', ndarray ) or <routine>.ndarray = ndarray.',
			'indexNoDefault': 'index.js must export a default (the strided entry point).',
			'indexNoNdarray': 'index.js must expose the ndarray variant — a named `ndarray` export, or re-export main.js\'s default (which carries `.ndarray`).'
		}
	},
	'create': function create( context ) {
		var filename = context.filename || ( context.getFilename && context.getFilename() ) || '';
		var basename = path.basename( filename );
		if ( basename !== 'main.js' && basename !== 'index.js' ) {
			return {};
		}
		// Only within a module tree (…/base/<routine>/lib/).
		var parts = filename.split( path.sep );
		if ( parts.lastIndexOf( 'base' ) === -1 ) {
			return {};
		}

		var hasDefaultExport = false;
		var hasNamedNdarray = false;
		var defaultFromMain = false;
		var ndarrayAttached = false;
		var mainLocalNames = {}; // local identifiers imported (as default) from './main.js'

		return {
			'ImportDeclaration': function onImport( node ) {
				if ( node.source && /(^|\/)main\.js$/.test( String( node.source.value ) ) ) {
					node.specifiers.forEach( function forEach( spec ) {
						if ( spec.type === 'ImportDefaultSpecifier' && spec.local ) {
							mainLocalNames[ spec.local.name ] = true;
						}
					});
				}
			},
			'ExportDefaultDeclaration': function onDefault( node ) {
				hasDefaultExport = true;
				// `export default main;` where main is the default import of ./main.js
				if ( node.declaration && node.declaration.type === 'Identifier' && mainLocalNames[ node.declaration.name ] ) {
					defaultFromMain = true;
				}
			},
			'ExportNamedDeclaration': function onNamed( node ) {
				var fromMain = node.source && /(^|\/)main\.js$/.test( String( node.source.value ) );
				( node.specifiers || [] ).forEach( function forEach( spec ) {
					var exported = spec.exported && ( spec.exported.name || spec.exported.value );
					var local = spec.local && ( spec.local.name || spec.local.value );
					if ( exported === 'default' ) {
						hasDefaultExport = true;
						if ( fromMain ) {
							defaultFromMain = true;
						}
					}
					if ( exported === 'ndarray' ) {
						hasNamedNdarray = true;
					}
					// `export { default as X }` still counts as a default source
					if ( local === 'default' && fromMain ) {
						defaultFromMain = true;
					}
				});
			},
			'CallExpression': function onCall( node ) {
				if ( isNdarrayAttach( node ) ) {
					ndarrayAttached = true;
				}
			},
			'AssignmentExpression': function onAssign( node ) {
				// <routine>.ndarray = ndarray
				if ( node.left && node.left.type === 'MemberExpression' && node.left.property &&
					( node.left.property.name === 'ndarray' || node.left.property.value === 'ndarray' ) ) {
					ndarrayAttached = true;
				}
			},
			'Program:exit': function onExit( programNode ) {
				if ( basename === 'main.js' ) {
					if ( !hasDefaultExport ) {
						context.report({ 'node': programNode, 'messageId': 'mainNoDefault' });
					}
					if ( !ndarrayAttached ) {
						context.report({ 'node': programNode, 'messageId': 'mainNoNdarray' });
					}
				} else {
					if ( !hasDefaultExport ) {
						context.report({ 'node': programNode, 'messageId': 'indexNoDefault' });
					}
					if ( !hasNamedNdarray && !defaultFromMain ) {
						context.report({ 'node': programNode, 'messageId': 'indexNoNdarray' });
					}
				}
			}
		};
	}
};

module.exports = rule;
