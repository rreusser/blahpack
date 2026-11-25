'use strict';

// The JSDoc a spec implies for each form (CONVENTIONS J2, C1, C4, W5, S10,
// S11): one `@param {Type} name` per parameter, in order; the `@throws` of the
// generated validation prologue (ndarray.js, <routine>.js); and the `@returns`
// type.

var fs = require( 'fs' );
var path = require( 'path' );
var specLib = require( './spec.cjs' );
var P = require( './prologue.cjs' );

var ARRAY = {
	'float64': 'Float64Array',
	'float32': 'Float32Array',
	'complex128': 'Complex128Array',
	'complex64': 'Complex64Array',
	'int32': 'Int32Array',
	'bool': 'Uint8Array'
};

var SCALAR_IN = {
	'float64': 'number',
	'float32': 'number',
	'complex128': 'Complex128',
	'complex64': 'Complex64',
	'int32': 'integer',
	'bool': 'boolean',
	'string': 'string',
	'function': 'Function',
	'object': 'Object'
};

var OPTIONS = null;
var ALIASES = null;

// Alias name per literal-union alias in types/jsdoc-aliases.d.ts, keyed by
// its sorted values.
function aliases() {
	var src;
	if ( ALIASES === null ) {
		ALIASES = {};
		src = fs.readFileSync( path.join( __dirname, '..', '..', 'types', 'jsdoc-aliases.d.ts' ), 'utf8' );
		src.replace( /^type (\w+) = ((?:\s*\|?\s*'[^']*')+);/gm, function each( m, name, rhs ) {
			ALIASES[ rhs.match( /'[^']*'/g ).map( function u( v ) {
				return v.slice( 1, -1 );
			}).sort().join( '|' ) ] = name;
			return m;
		});
	}
	return ALIASES;
}

// The strings an input option accepts, in spec/options.json order: the
// values of its spec enum check (what the reference accepts for this
// routine), else every value of its options family (plus its `other`),
// else null.
function optionValues( spec, fortran ) {
	var checked = null;
	var fam = null;
	var all;
	var i;
	( spec.checks || [] ).forEach( function each( c ) {
		if ( c.kind === 'enum' && c.param === fortran && c.values ) {
			checked = c.values;
		}
	});
	if ( OPTIONS === null ) {
		OPTIONS = JSON.parse( fs.readFileSync( path.join( __dirname, '..', '..', 'spec', 'options.json' ), 'utf8' ) ).families;
	}
	for ( i = 0; i < OPTIONS.length && !fam; i++ ) {
		if ( OPTIONS[ i ].params.indexOf( fortran ) >= 0 && ( !OPTIONS[ i ].routines || new RegExp( OPTIONS[ i ].routines ).test( spec.routine ) ) ) {
			fam = OPTIONS[ i ];
		}
	}
	all = ( fam ) ? Object.keys( fam.values ).map( function v( k ) {
		return fam.values[ k ];
	}).concat( ( fam.other ) ? [ fam.other ] : [] ) : [];
	if ( checked ) {
		return all.filter( function f( v ) {
			return checked.indexOf( v ) >= 0;
		}).concat( checked.filter( function f( v ) {
			return all.indexOf( v ) < 0;
		}) );
	}
	return ( fam ) ? all : null;
}

// The JSDoc type of an input option: the literal union of the strings it
// accepts (CONVENTIONS S14), so `tsc` rejects any other string at a call
// and any comparison against one in base.js. Spelled as the alias in
// types/jsdoc-aliases.d.ts with exactly those values when there is one.
// `string` only when the option has no known values (ticket 0022).
function optionType( spec, fortran ) {
	var vals = optionValues( spec, fortran );
	var key;
	if ( !vals ) {
		return 'string';
	}
	vals = vals.filter( function u( v, i ) {
		return vals.indexOf( v ) === i;
	});
	key = vals.slice().sort().join( '|' );
	if ( aliases()[ key ] ) {
		return aliases()[ key ];
	}
	return '(' + vals.map( function q( v ) {
		return '\'' + v + '\'';
	}).join( '|' ) + ')';
}

function arrayType( p ) {
	return ARRAY[ p.dtype ] || 'Array';
}

// Type of the leading (array or scalar) name of a param group.
function leadType( p, form, g, spec ) {
	switch ( p.role ) {
	case 'flag':
		// An output option (EQUED of the svx drivers) is a single-element Array.
		return ( p.intent === 'in' ) ? optionType( spec, p.fortran ) : 'Array<string>';
	case 'dim':
		return 'NonNegativeInteger';
	case 'info':
		return 'integer';
	case 'state':
		return 'Object';
	case 'workspace':
		return ( form === 'strided' ) ? '(' + arrayType( p ) + '|null)' : arrayType( p );
	case 'scalar':
		if ( g.names.length === 2 ) {
			return arrayType( p );
		}
		if ( p.intent === 'in' ) {
			return SCALAR_IN[ p.dtype ] || '*';
		}
		return arrayType( p );
	default:
		return arrayType( p );
	}
}

// [ { name, type } ] for a form, spelled as `actual` spells the names.
function params( spec, form, actual ) {
	var out = [];
	specLib.baseGroups( spec ).forEach( function each( g ) {
		var p = g.param;
		var lead = leadType( p, form, g, spec );
		if ( !g.names.length ) {
			return;
		}
		if ( form !== 'strided' ) {
			g.names.forEach( function each( n, i ) {
				var t;
				if ( i === 0 ) {
					t = lead;
				} else if ( /^offset/.test( n ) ) {
					t = 'NonNegativeInteger';
				} else {
					t = 'integer';
				}
				out.push( { 'name': n, 'type': t } );
			});
			return;
		}
		out.push( { 'name': p.name, 'type': lead } );
		if ( g.names.length === 4 ) {
			out.push( { 'name': 'LD' + p.name.toUpperCase(), 'type': 'PositiveInteger' } );
		} else if ( g.names.length === 3 && p.role !== 'workspace' && !( p.role === 'packed' && p.format === 'packed' ) ) {
			out.push( { 'name': g.names[ 1 ], 'type': 'integer' } );
		}
	});
	if ( form === 'strided' && specLib.takesOrder( spec ) ) {
		out.unshift( { 'name': 'order', 'type': 'Layout' } );
	}
	if ( actual && actual.length === out.length ) {
		out.forEach( function each( o, i ) {
			if ( actual[ i ].toLowerCase() === o.name.toLowerCase() ) {
				o.name = actual[ i ];
			}
		});
	}
	return out;
}

// `@returns` type (S11), or null when nothing is returned.
function returns( spec ) {
	var r = spec.returns;
	var p;
	if ( r.kind === 'info' ) {
		return 'integer';
	}
	if ( r.kind === 'value' ) {
		if ( /^complex/.test( r.dtype ) ) {
			// with an `out` result param the function returns it (S1);
			// otherwise (BLAS dot products) it returns the value
			return spec.params.some( function some( p ) {
				return p.role === 'result';
			}) ? ARRAY[ r.dtype ] : SCALAR_IN[ r.dtype ];
		}
		return SCALAR_IN[ r.dtype ] || '*';
	}
	if ( r.kind === 'array' ) {
		p = spec.params.filter( function f( q ) {
			return q.name === r.param;
		})[ 0 ];
		return p ? arrayType( p ) : '*';
	}
	return null;
}

// `@throws` lines (type and text) of the generated prologue.
function throwsDocs( spec, form, actual ) {
	if ( form === 'base' ) {
		return [];
	}
	return P.prologue( spec, form, actual ).map( function m( c ) {
		return { 'type': c.ctor, 'text': c.doc };
	});
}

// Parse a JSDoc comment value into its @param / @throws / @returns tags.
function parseTags( value ) {
	var out = { 'params': [], 'throws': [], 'returns': [] };
	value.split( '\n' ).forEach( function each( line ) {
		var l = line.replace( /^\s*\*\s?/, '' );
		var m;
		if ( ( m = /^@param\s+\{([^}]*)\}\s+\[?([\w$]+)/.exec( l ) ) ) {
			out.params.push( { 'type': m[ 1 ], 'name': m[ 2 ] } );
		} else if ( ( m = /^@throws\s+\{([^}]*)\}\s*(.*)$/.exec( l ) ) ) {
			out.throws.push( { 'type': m[ 1 ], 'text': m[ 2 ].trim() } );
		} else if ( ( m = /^@returns?\s+\{([^}]*)\}/.exec( l ) ) ) {
			out.returns.push( m[ 1 ] );
		}
	});
	return out;
}

module.exports = {
	'params': params,
	'returns': returns,
	'throwsDocs': throwsDocs,
	'parseTags': parseTags
};
