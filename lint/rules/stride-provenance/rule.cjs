'use strict';

// BLIS-style addressing is honored in base.js (CONVENTIONS S13).
//
// In base.js every caller array arrives with its full addressing: a 1-D array
// as (x, strideX, offsetX), a 2-D array as (A, strideA1, strideA2, offsetA).
// The bug class this rule catches is code that quietly assumes one particular
// layout, typically column-major unit stride, inherited from a line-by-line
// Fortran translation:
//
//   rnrm = dznrm2( N, VR, 1, offsetVR + ( ks * strideVR2 ) );
//                         ^ Fortran's `VR(1,KS), 1`: walks a column with
//                           stride 1, which is only right when strideVR1 = 1
//
// Every value is tagged with the base.js parameters it is computed from
// (transitively through local variables, `reinterpret()` views and local
// helper functions). Then:
//
//   P1  An element access `A[ i ]` (or through a reinterpret view of A) must
//       be computed from offsetA. An index that never involves the offset
//       addresses the wrong elements whenever offsetA ≠ 0.
//
//   P3  When base.js passes one of its arrays A to a callee whose spec is
//       known (an import of …/base/<routine>/lib/{base,strided}.js, or a
//       recursive call), the callee's spec says which following arguments
//       are A's strides and offset (lint/lib/spec.cjs baseGroups). Each
//       stride argument must be computed from a stride of A (never a literal,
//       never another array's stride), and the offset argument from offsetA.
//       A literal stride is rejected even where it is harmless (a length-1
//       vector, the column stride of an N×1 view): passing A's own stride
//       costs nothing and keeps the rule free of exemptions.
//
// Both checks are "must include" checks. Tags are merged flow-insensitively,
// which can only over-approximate what a value depends on, so reusing a
// variable for two arrays cannot produce a false report (it can only hide
// one). Workspace arrays are skipped: their stride is unit-only by contract
// (D5) and their offset is checked by workspace-addressing-honored.

var path = require( 'path' );
var specLib = require( './../../lib/spec.cjs' );
var specTarget = require( './../../lib/spec-target.cjs' );

var CALLEE_RE = /^\.{1,2}\/(?:.*\/)?([a-z0-9_]+)\/lib\/(?:base|strided)\.js$/;


// FUNCTIONS //

function eachChild( node, fn ) {
	Object.keys( node ).forEach( function each( k ) {
		var v;
		if ( k === 'parent' || k === 'loc' || k === 'range' ) {
			return;
		}
		v = node[ k ];
		if ( Array.isArray( v ) ) {
			v.forEach( function c( x ) {
				if ( x && typeof x.type === 'string' ) {
					fn( x );
				}
			});
		} else if ( v && typeof v.type === 'string' ) {
			fn( v );
		}
	});
}

function walk( node, fn ) {
	fn( node );
	eachChild( node, function c( child ) {
		walk( child, fn );
	});
}

function identifiers( node ) {
	var out = [];
	walk( node, function f( n ) {
		if ( n.type === 'Identifier' ) {
			out.push( n.name );
		}
	});
	return out;
}

// Arrays of the routine's own spec, keyed by the name the code uses:
// { name, strides: [...], offset }. Spec names compare case-insensitively
// (S7), so names are taken from the code's parameter list, position by
// position (the caller has checked that the two lists match).
function arraysOf( spec, params ) {
	var out = {};
	var pos = 0;
	specLib.baseGroups( spec ).forEach( function each( g ) {
		var n = g.names.map( function m( x, i ) {
			return params[ pos + i ];
		});
		pos += g.names.length;
		if ( g.param.role === 'workspace' ) {
			return;
		}
		if ( n.length === 4 ) {
			out[ n[ 0 ] ] = { 'name': n[ 0 ], 'strides': [ n[ 1 ], n[ 2 ] ], 'offset': n[ 3 ] };
		} else if ( n.length === 3 ) {
			out[ n[ 0 ] ] = { 'name': n[ 0 ], 'strides': [ n[ 1 ] ], 'offset': n[ 2 ] };
		} else if ( n.length === 2 && /^offset/.test( n[ 1 ] ) ) {
			out[ n[ 0 ] ] = { 'name': n[ 0 ], 'strides': [], 'offset': n[ 1 ] };
		}
	});
	return out;
}

// Slot kinds of a callee's base signature, by argument position:
// [ { group, kind: 'array'|'stride'|'offset' }, ... ].
function slotsOf( spec ) {
	var slots = [];
	specLib.baseGroups( spec ).forEach( function each( g ) {
		var n = g.names;
		var array = ( n.length >= 2 && /^offset/.test( n[ n.length - 1 ] ) );
		n.forEach( function s( name, i ) {
			var kind = 'other';
			if ( array ) {
				if ( i === 0 ) {
					kind = 'array';
				} else if ( i === n.length - 1 ) {
					kind = 'offset';
				} else {
					kind = 'stride';
				}
			}
			slots.push( { 'group': g, 'kind': kind } );
		});
	});
	return slots;
}

function isNumberLiteral( node ) {
	if ( node.type === 'Literal' && typeof node.value === 'number' ) {
		return true;
	}
	return node.type === 'UnaryExpression' && node.operator === '-' && isNumberLiteral( node.argument );
}


// MAIN //

var rule = {
	'meta': {
		'type': 'problem',
		'docs': {
			'description': 'base.js computes every element index from the array\'s offset and passes callees the array\'s own strides and offset (CONVENTIONS S13)'
		},
		'schema': [],
		'fixable': 'code',
		'messages': {
			'accessWithoutOffset': '`{{array}}[ … ]` is not computed from `{{offset}}`: the access addresses the wrong element whenever the offset is non-zero.',
			'literalStride': 'Passing `{{array}}` to `{{callee}}` with the literal stride `{{value}}`: pass a stride computed from {{strides}}, or the call assumes a layout the caller did not promise.',
			'foreignStride': 'Passing `{{array}}` to `{{callee}}` with a stride not computed from {{strides}}.',
			'foreignOffset': 'Passing `{{array}}` to `{{callee}}` with an offset not computed from `{{offset}}`.'
		}
	},
	'create': function create( context ) {
		var filename = context.filename || ( context.getFilename && context.getFilename() ) || '';
		if ( path.basename( filename ) !== 'base.js' ) {
			return {};
		}
		return {
			'Program:exit': function exit( program ) {
				var callees = {};
				var helpers = {};
				var assigns = [];
				var aliases = {};
				var deps = {};
				var arrays;
				var info;
				var fn;

				info = specTarget.resolve( context, program );
				if ( !info || !info.spec || !info.matches ) {
					return; // spec-signature reports signature mismatches
				}
				fn = info.fn;
				arrays = arraysOf( info.spec, info.params );

				// Callee specs: imports of other modules' base/strided, plus recursion.
				program.body.forEach( function each( n ) {
					var m;
					if ( n.type === 'ImportDeclaration' && ( m = CALLEE_RE.exec( n.source.value ) ) ) {
						n.specifiers.forEach( function s( sp ) {
							if ( sp.type === 'ImportDefaultSpecifier' ) {
								callees[ sp.local.name ] = m[ 1 ];
							}
						});
					}
				});
				if ( fn.id ) {
					callees[ fn.id.name ] = info.routine;
				}

				// Local helper functions: a call depends on what their returns depend on.
				walk( program, function f( n ) {
					var body = null;
					var name = null;
					if ( n.type === 'FunctionDeclaration' && n !== fn && n.id ) {
						name = n.id.name;
						body = n;
					} else if ( n.type === 'VariableDeclarator' && n.init && n.id.type === 'Identifier' && /Function/.test( n.init.type ) ) {
						name = n.id.name;
						body = n.init;
					}
					if ( name && !callees[ name ] ) {
						helpers[ name ] = [];
						if ( body.body.type !== 'BlockStatement' ) {
							helpers[ name ].push( body.body );
						}
						walk( body.body, function r( x ) {
							if ( x.type === 'ReturnStatement' && x.argument ) {
								helpers[ name ].push( x.argument );
							}
						});
					}
				});

				// Assignments inside the routine (flow-insensitive).
				walk( fn, function f( n ) {
					if ( n.type === 'VariableDeclarator' && n.init && n.id.type === 'Identifier' ) {
						assigns.push( [ n.id.name, n.init ] );
					} else if ( n.type === 'AssignmentExpression' && n.left.type === 'Identifier' ) {
						assigns.push( [ n.left.name, n.right ] );
					}
				});
				assigns.forEach( function each( a ) {
					var init = a[ 1 ];
					if ( init.type === 'CallExpression' && init.callee.type === 'Identifier' && /^reinterpret/.test( init.callee.name ) && init.arguments[ 0 ] && init.arguments[ 0 ].type === 'Identifier' && arrays[ init.arguments[ 0 ].name ] ) {
						( aliases[ a[ 0 ] ] = aliases[ a[ 0 ] ] || {} )[ init.arguments[ 0 ].name ] = true;
					} else if ( init.type === 'Identifier' && arrays[ init.name ] ) {
						( aliases[ a[ 0 ] ] = aliases[ a[ 0 ] ] || {} )[ init.name ] = true;
					}
				});
				info.params.forEach( function each( p ) {
					deps[ p ] = {};
					deps[ p ][ p ] = true;
				});

				function depsOf( node, seen ) {
					var out = {};
					seen = seen || {};
					identifiers( node ).forEach( function each( id ) {
						Object.keys( deps[ id ] || {} ).forEach( function k( d ) {
							out[ d ] = true;
						});
						if ( helpers[ id ] && !seen[ id ] ) {
							seen[ id ] = true;
							helpers[ id ].forEach( function h( e ) {
								Object.keys( depsOf( e, seen ) ).forEach( function k( d ) {
									out[ d ] = true;
								});
							});
						}
					});
					return out;
				}

				// Fixpoint over the assignments.
				( function fixpoint() {
					var changed = true;
					var iter = 0;
					while ( changed && iter < 100 ) {
						changed = false;
						iter += 1;
						assigns.forEach( function each( a ) {
							var d = depsOf( a[ 1 ] );
							deps[ a[ 0 ] ] = deps[ a[ 0 ] ] || {};
							Object.keys( d ).forEach( function k( x ) {
								if ( !deps[ a[ 0 ] ][ x ] ) {
									deps[ a[ 0 ] ][ x ] = true;
									changed = true;
								}
							});
						});
					}
				})();

				// The array(s) an identifier refers to, merged: a view reassigned to
				// several arrays (zhpev's `apv`) accepts the addressing of any of them.
				function arrayOf( node ) {
					var names;
					if ( node.type !== 'Identifier' ) {
						return null;
					}
					if ( arrays[ node.name ] ) {
						names = [ node.name ];
					} else if ( aliases[ node.name ] ) {
						names = Object.keys( aliases[ node.name ] );
					} else {
						return null;
					}
					return names.reduce( function merge( acc, n ) {
						acc.strides = acc.strides.concat( arrays[ n ].strides );
						acc.offsets.push( arrays[ n ].offset );
						return acc;
					}, { 'strides': [], 'offsets': [] } );
				}

				// Autofix only where it is unambiguous: an array with exactly one
				// stride. (Which stride of a 2-D array a callee should walk is a
				// translation judgment: compare with the Fortran.)
				function fixer( node, A ) {
					if ( A.strides.length !== 1 ) {
						return null;
					}
					return function fix( f ) {
						return f.replaceText( node, A.strides[ 0 ] );
					};
				}

				function quoteList( names ) {
					return names.map( function m( n ) {
						return '`' + n + '`';
					}).join( ' or ' );
				}

				walk( fn, function check( n ) {
					var calleeSpec;
					var slots;
					var A;

					// P1: element accesses.
					if ( n.type === 'MemberExpression' && n.computed && ( A = arrayOf( n.object ) ) ) {
						if ( !A.offsets.some( function some( o ) {
							return depsOf( n.property )[ o ];
						}) ) {
							context.report({
								'node': n,
								'messageId': 'accessWithoutOffset',
								'data': { 'array': n.object.name, 'offset': A.offsets.join( '` or `' ) }
							});
						}
						return;
					}

					// P3: calls into routines with a spec.
					if ( n.type !== 'CallExpression' || n.callee.type !== 'Identifier' || !callees[ n.callee.name ] ) {
						return;
					}
					calleeSpec = specLib.load( callees[ n.callee.name ] );
					if ( !calleeSpec ) {
						return;
					}
					slots = slotsOf( calleeSpec );
					n.arguments.forEach( function each( arg, i ) {
						var slot = slots[ i ];
						var j;
						var a;
						var d;
						if ( !slot || slot.kind !== 'array' || slot.group.param.role === 'workspace' ) {
							return;
						}
						A = arrayOf( arg );
						if ( !A ) {
							return;
						}
						for ( j = i + 1; j < n.arguments.length && slots[ j ] && slots[ j ].group === slot.group; j++ ) {
							a = n.arguments[ j ];
							if ( slots[ j ].kind === 'stride' ) {
								if ( A.strides.length === 0 ) {
									continue; // an element passed where a callee expects a vector: nothing to compare
								}
								if ( isNumberLiteral( a ) ) {
									context.report({
										'node': a,
										'messageId': 'literalStride',
										'fix': fixer( a, A ),
										'data': { 'array': arg.name, 'callee': n.callee.name, 'value': ( context.sourceCode || context.getSourceCode() ).getText( a ), 'strides': quoteList( A.strides ) }
									});
									continue;
								}
								d = depsOf( a );
								if ( !A.strides.some( function some( s ) {
									return d[ s ];
								}) ) {
									context.report({
										'node': a,
										'messageId': 'foreignStride',
										'fix': fixer( a, A ),
										'data': { 'array': arg.name, 'callee': n.callee.name, 'strides': quoteList( A.strides ) }
									});
								}
							} else if ( slots[ j ].kind === 'offset' ) {
								d = depsOf( a );
								if ( !A.offsets.some( function some( o ) {
									return d[ o ];
								}) ) {
									context.report({
										'node': a,
										'messageId': 'foreignOffset',
										'data': { 'array': arg.name, 'callee': n.callee.name, 'offset': A.offsets.join( '` or `' ) }
									});
								}
							}
						}
					});
				});
			}
		};
	}
};

module.exports = rule;
