'use strict';

// Strict cross-file signature conformance gate — no wiggle room.
//
// Enforces the resolved conventions in lint/CONVENTIONS.md exactly:
//   * ndarray.js parameter list  ===  base.js parameter list
//   * <routine>.js parameter list === strided projection of base.js
//
// base.js is the offset-form authority (checked against Fortran by the
// fortran-signature ESLint rule). This gate checks the other two forms against
// it by exact string match. It reports every nonconformer, categorized, as the
// standardization worklist. The project contract is that it reaches zero.
//
// Usage:
//   node lint/verify-signatures.cjs            # summary + categorized counts
//   node lint/verify-signatures.cjs --list     # every nonconforming routine
//   node lint/verify-signatures.cjs --routine dgeqrf

var path = require( 'path' );
var fs = require( 'fs' );
var projection = require( './lib/strided-projection.cjs' );

var ROOT = path.join( __dirname, '..' );
var LIB = path.join( ROOT, 'lib' );

var argv = process.argv.slice( 2 );
var LIST = argv.indexOf( '--list' ) !== -1;
var only = null;
var ri = argv.indexOf( '--routine' );
if ( ri !== -1 ) {
	only = argv[ ri + 1 ];
}

function findBases( dir, out ) {
	fs.readdirSync( dir ).forEach( function forEach( e ) {
		var full = path.join( dir, e );
		if ( fs.statSync( full ).isDirectory() ) {
			findBases( full, out );
		} else if ( e === 'base.js' ) {
			out.push( full );
		}
	});
	return out;
}

// Extract the exported routine's parameter names from a file.
function params( file, routine ) {
	if ( !fs.existsSync( file ) ) {
		return null;
	}
	var src = fs.readFileSync( file, 'utf8' );
	var m = new RegExp( 'function\\s+' + routine + '\\s*\\(([^)]*)\\)' ).exec( src );
	if ( !m ) {
		return null;
	}
	return m[ 1 ].split( ',' ).map( function map( x ) {
		return x.trim();
	}).filter( Boolean );
}

function eq( a, b ) {
	return a && b && a.length === b.length && a.every( function every( x, i ) {
		return x.toLowerCase() === b[ i ].toLowerCase();
	});
}

// Classify a name-vs-projection mismatch into mechanical reason tags.
function classify( proj, name ) {
	var P = proj.map( function m( x ) { return x.toLowerCase(); } );
	var N = name.map( function m( x ) { return x.toLowerCase(); } );
	var pset = {}, nset = {};
	P.forEach( function f( x ) { pset[ x ] = true; } );
	N.forEach( function f( x ) { nset[ x ] = true; } );
	var r = {};
	if ( P[ 0 ] === 'order' && N[ 0 ] !== 'order' ) { r[ 'missing-order' ] = true; }
	if ( P[ 0 ] !== 'order' && N[ 0 ] === 'order' ) { r[ 'extra-order' ] = true; }
	if ( N.some( function s( x ) { return x.indexOf( 'offset' ) === 0; } ) ) { r[ 'has-offsets' ] = true; }
	if ( P.filter( function f( x ) { return x.indexOf( 'stride' ) === 0; } ).some( function s( x ) { return !nset[ x ]; } ) ) { r[ 'missing-stride' ] = true; }
	if ( N.filter( function f( x ) { return x.indexOf( 'stride' ) === 0; } ).some( function s( x ) { return !pset[ x ]; } ) ) { r[ 'extra-stride' ] = true; }
	var pld = P.filter( function f( x ) { return x.indexOf( 'ld' ) === 0; } ).join( ',' );
	var nld = N.filter( function f( x ) { return x.indexOf( 'ld' ) === 0; } ).join( ',' );
	if ( pld !== nld ) { r[ 'ld-mismatch' ] = true; }
	var keys = Object.keys( r ).sort();
	return keys.length ? keys.join( '+' ) : 'other';
}

var bases = findBases( LIB, [] );
var ndDiffs = [];
var nameDiffs = {};
var ndOK = 0, nameOK = 0, ndMissing = 0, nameMissing = 0, total = 0;

bases.forEach( function forEach( b ) {
	var dir = path.dirname( b );
	var routine = path.basename( path.dirname( dir ) );
	if ( only && routine !== only ) {
		return;
	}
	total += 1;
	var base = params( b, routine );
	if ( !base ) {
		return;
	}

	var nd = params( path.join( dir, 'ndarray.js' ), routine );
	if ( nd === null ) {
		ndMissing += 1;
	} else if ( eq( nd, base ) ) {
		ndOK += 1;
	} else {
		ndDiffs.push( { routine: routine, base: base, nd: nd } );
	}

	var name = params( path.join( dir, routine + '.js' ), routine );
	var proj = projection.project( base, { 'routine': routine } ).params;
	if ( name === null ) {
		nameMissing += 1;
	} else if ( eq( name, proj ) ) {
		nameOK += 1;
	} else {
		var cat = classify( proj, name );
		( nameDiffs[ cat ] = nameDiffs[ cat ] || [] ).push( { routine: routine, base: base, name: name, proj: proj } );
	}
});

var nameDiffCount = Object.keys( nameDiffs ).reduce( function r( a, k ) {
	return a + nameDiffs[ k ].length;
}, 0 );

console.log( 'Modules: ' + total );
console.log( '' );
console.log( 'ndarray.js === base.js :  ' + ndOK + ' conform,  ' + ndDiffs.length + ' nonconforming,  ' + ndMissing + ' base-only' );
if ( ndDiffs.length ) {
	ndDiffs.forEach( function forEach( d ) {
		console.log( '   ' + d.routine );
		if ( LIST ) {
			console.log( '       base:    ' + d.base.join( ', ' ) );
			console.log( '       ndarray: ' + d.nd.join( ', ' ) );
		}
	});
}
console.log( '' );
console.log( '<routine>.js === strided projection :  ' + nameOK + ' conform,  ' + nameDiffCount + ' nonconforming,  ' + nameMissing + ' base-only' );
Object.keys( nameDiffs ).sort( function s( a, b ) {
	return nameDiffs[ b ].length - nameDiffs[ a ].length;
}).forEach( function forEach( cat ) {
	var list = nameDiffs[ cat ];
	console.log( '   ' + String( list.length ).padStart( 4 ) + '  ' + cat );
	if ( LIST ) {
		list.forEach( function fe( d ) {
			console.log( '        ' + d.routine );
			console.log( '            want: ' + d.proj.join( ', ' ) );
			console.log( '            got:  ' + d.name.join( ', ' ) );
		});
	}
});

var totalNon = ndDiffs.length + nameDiffCount;
console.log( '' );
console.log( 'Total nonconforming: ' + totalNon );
process.exit( totalNon > 0 ? 1 : 0 );
