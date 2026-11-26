'use strict';

// base.js takes each tuning value from the ilaenv module wherever the
// reference queries ILAENV or IPARMQ (CONVENTIONS X3; ticket 0049).
//
// The JS used to replace ILAENV with constants copied into each module, and
// several were wrong: crossover points NX = 0 or 32 where ILAENV(3) gives 128,
// dlaqr3's NMIN = 12 where ILAENV(12) gives 75, zlaqr0/4's fixed window sizes
// where IPARMQ's depend on NH. A wrong value is still a valid algorithm, so no
// property test sees it; the routine just takes another path than the
// reference at some sizes.
//
// Reported in base.js, for a routine whose spec lists `tuning` queries
// (generated from the reference's ILAENV/IPARMQ calls):
// 1. a missing import of the ilaenv module (or iparmq, for a direct IPARMQ
//    query);
// 2. a variable named after a queried value (`NB`, `NX`, `NBMIN`, `NMIN`, ...,
//    in any case, optionally prefixed `DEFAULT_`) initialized to a number
//    literal and never assigned from an ilaenv/iparmq call (the reference
//    itself starts NBMIN at 2 before querying it).

var specTarget = require( '../../lib/spec-target.cjs' );
var specLib = require( '../../lib/spec.cjs' );

// Does expression `n` call an `ilaenv` or `iparmq` binding?
function callsTuning( n ) {
	var hit = false;
	( function walk( x ) {
		var k;
		if ( hit || !x || typeof x.type !== 'string' ) {
			return;
		}
		if ( x.type === 'CallExpression' && x.callee.type === 'Identifier' && /^(ilaenv|iparmq)$/.test( x.callee.name ) ) {
			hit = true;
			return;
		}
		for ( k in x ) {
			if ( k !== 'parent' && x[ k ] && typeof x[ k ] === 'object' ) {
				if ( Array.isArray( x[ k ] ) ) {
					x[ k ].forEach( walk );
				} else {
					walk( x[ k ] );
				}
			}
		}
	})( n );
	return hit;
}

var rule = {
	'meta': {
		'docs': {
			'description': 'base.js takes the reference\'s ILAENV/IPARMQ values from the ilaenv module, not from hard-coded constants (spec `tuning`)'
		},
		'schema': [],
		'type': 'problem'
	},
	'create': function main( context ) {
		var t = specTarget.target( context.filename || context.getFilename() );
		var spec;
		var fns;
		var into;
		var imported = {};
		var literal = [];
		var queried = {};
		if ( !t || t.form !== 'base' ) {
			return {};
		}
		spec = specLib.load( t.routine );
		if ( !spec || !spec.tuning || !spec.tuning.length ) {
			return {};
		}
		fns = {};
		into = {};
		spec.tuning.forEach( function each( q ) {
			fns[ q.fn ] = true;
			if ( q.into ) {
				into[ q.into.toUpperCase() ] = q;
			}
		});
		return {
			'ImportDeclaration': function onImport( n ) {
				var m = /\/(ilaenv|iparmq)\/lib\/base\.js$/.exec( n.source.value );
				if ( m ) {
					imported[ m[ 1 ] ] = true;
				}
			},
			'VariableDeclarator': function onDecl( n ) {
				if ( n.id.type !== 'Identifier' || !n.init ) {
					return;
				}
				if ( n.init.type === 'Literal' && typeof n.init.value === 'number' ) {
					literal.push( n );
				} else if ( callsTuning( n.init ) ) {
					queried[ n.id.name ] = true;
				}
			},
			'AssignmentExpression': function onAssign( n ) {
				if ( n.left.type === 'Identifier' && callsTuning( n.right ) ) {
					queried[ n.left.name ] = true;
				}
			},
			'Program:exit': function onExit( program ) {
				literal.forEach( function each( n ) {
					var q = into[ n.id.name.toUpperCase().replace( /^DEFAULT_/, '' ) ];
					if ( q && !queried[ n.id.name ] ) {
						context.report({
							'node': n,
							'message': '`' + n.id.name + '` is the reference\'s ' + q.into + ' = ' + q.fn.toUpperCase() + '( ' + q.ispec + ', \'' + q.name + '\', ... ); take it from the ' + q.fn + ' module with the reference\'s arguments instead of a constant (CONVENTIONS X3; ticket 0049).'
						});
					}
				});
				Object.keys( fns ).forEach( function each( f ) {
					// ILAENV answers the IPARMQ queries too (ISPEC 12-17).
					if ( imported[ f ] || ( f === 'iparmq' && imported.ilaenv ) ) {
						return;
					}
					context.report({
						'node': specTarget.exportedFunction( program ) || program,
						'message': 'The reference queries ' + f.toUpperCase() + ' (spec `tuning`: ' + spec.tuning.filter( function q( x ) {
							return x.fn === f;
						}).map( function m( x ) {
							return ( x.into || '?' ) + ' = ' + x.fn.toUpperCase() + '( ' + x.ispec + ', \'' + x.name + '\' )';
						}).join( ', ' ) + '), but base.js does not import the ' + f + ' module (CONVENTIONS X3; ticket 0049).'
					});
				});
			}
		};
	}
};

module.exports = rule;
