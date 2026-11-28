'use strict';

// Which spec and which form a linted file is, and the function it exports.
// Shared by the spec-* rules (lint/rules/spec-*).
//
//   lib/<pkg>/<routine>/lib/base.js       → form 'base'
//   lib/<pkg>/<routine>/lib/strided.js    → form 'strided'
//   lib/<pkg>/<routine>/lib/<routine>.js  → form 'wrapper'

var path = require( 'path' );
var specLib = require( './spec.cjs' );
var moduleOf = require( './module-path.cjs' ).moduleOf;

function target( filename ) {
	var mod = moduleOf( filename );
	var routine;
	var file;
	// A file directly in the module's lib/: lib/<pkg>/<routine>/lib/<file>.
	if ( !mod || mod.rest.length !== 2 || mod.rest[ 0 ] !== 'lib' ) {
		return null;
	}
	routine = mod.routine;
	file = mod.rest[ 1 ];
	if ( file === 'base.js' ) {
		return { 'routine': routine, 'form': 'base' };
	}
	if ( file === 'strided.js' ) {
		return { 'routine': routine, 'form': 'strided' };
	}
	if ( file === routine + '.js' ) {
		return { 'routine': routine, 'form': 'wrapper' };
	}
	return null;
}

// The FunctionDeclaration the Program default-exports.
function exportedFunction( program ) {
	var name = null;
	var fn = null;
	program.body.forEach( function each( n ) {
		if ( n.type === 'ExportDefaultDeclaration' ) {
			if ( n.declaration.type === 'Identifier' ) {
				name = n.declaration.name;
			} else if ( n.declaration.type === 'FunctionDeclaration' ) {
				fn = n.declaration;
			}
		}
	});
	if ( !fn && name ) {
		program.body.forEach( function each( n ) {
			if ( n.type === 'FunctionDeclaration' && n.id && n.id.name === name ) {
				fn = n;
			}
		});
	}
	return fn;
}

function paramNames( fn ) {
	return fn.params.map( function map( p ) {
		return ( p.type === 'Identifier' ) ? p.name : '?';
	});
}

// The projection for a form.
function projection( spec, form ) {
	return ( form === 'wrapper' ) ? specLib.wrapper( spec ) : specLib.base( spec );
}

function sameNames( a, b ) {
	return a.length === b.length && a.every( function every( x, i ) {
		return x.toLowerCase() === b[ i ].toLowerCase();
	});
}

// Everything a spec-* rule needs, or null when the file is not a spec form.
// `{ routine, form, spec, fn, params, matches }`; `spec` is null when the
// routine has no spec, `matches` says whether the signature is the projection.
function resolve( context, program ) {
	var t = target( context.filename || context.getFilename() );
	var fn;
	var spec;
	var params;
	if ( !t ) {
		return null;
	}
	fn = exportedFunction( program );
	if ( !fn ) {
		return null;
	}
	spec = specLib.load( t.routine );
	params = paramNames( fn );
	return {
		'routine': t.routine,
		'form': t.form,
		'spec': spec,
		'fn': fn,
		'params': params,
		'matches': !!spec && sameNames( params, projection( spec, t.form ) )
	};
}

// Body statements before the prologue: uninitialized `let`/`var`
// declarations (`let sa1, sa2;`) only.
function prologueStart( fn ) {
	var body = fn.body.body;
	var i = 0;
	while ( i < body.length && body[ i ].type === 'VariableDeclaration' && body[ i ].declarations.every( function every( d ) {
		return d.init === null;
	}) ) {
		i += 1;
	}
	return i;
}

module.exports = {
	'target': target,
	'resolve': resolve,
	'projection': projection,
	'exportedFunction': exportedFunction,
	'paramNames': paramNames,
	'prologueStart': prologueStart
};
