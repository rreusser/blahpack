#!/usr/bin/env node

/**
* Generate QUEUE.md — prioritized implementation checklist for remaining
* d/z BLAS/LAPACK routines.
*
* Usage:
*   node bin/gen-queue.js > QUEUE.md
*/

'use strict';

var fs = require( 'fs' );
var path = require( 'path' );

var ROOT = path.join( __dirname, '..' );
var db = JSON.parse( fs.readFileSync( path.join( ROOT, 'data', 'routines.json' ), 'utf8' ) );
var routines = db.routines;

// Scan implemented modules
var impl = new Set();
[ 'blas', 'lapack' ].forEach( function forEach( pkg ) {
	var base = path.join( ROOT, 'lib', pkg );
	if ( !fs.existsSync( base ) ) {
		return;
	}
	fs.readdirSync( base ).forEach( function each( d ) {
		impl.add( d.toLowerCase() );
	});
});

// Build items
var algs = Object.keys( routines );
var items = [];
var totalImpl = impl.size;
var completeAlgs = 0;

algs.forEach( function forEach( alg ) {
	var r = routines[ alg ];
	var variants = r.variants || [];
	var dz = variants.filter( function( v ) {
		return v.type === 'd' || v.type === 'z';
	});
	if ( dz.length === 0 ) {
		return;
	}

	var done = [];
	var notdone = [];
	dz.forEach( function each( v ) {
		var name = v.name.toLowerCase();
		if ( impl.has( name ) ) {
			done.push( name );
		} else {
			notdone.push( name );
		}
	});

	if ( notdone.length === 0 ) {
		completeAlgs += 1;
		return;
	}

	var desc = ( dz[0].description || '' ).replace( /\n/g, ' ' ).substring( 0, 120 );
	var name0 = notdone[0];

	// Priority tier
	var tier;
	var isVariant = notdone.some( function( n ) { return /_2stage|_aa|_rk|_rook|_3x|_3$/.test( n ); });
	var isTsqr = notdone.some( function( n ) { return /tsqr|mqrt|mlqt|plqt|pqrt|prfb|_col_/.test( n ); });
	var isExpert = notdone.some( function( n ) { return /svx$|svxx$|rfsx$/.test( n ); });
	var isEquil = notdone.some( function( n ) { return /equb$/.test( n ); });
	var isMixed = notdone.some( function( n ) { return /^dsgesv|^zcgesv|^zcposv|^dsposv|lag2[sc]|lat2[sc]/.test( n ); });
	var isDC = notdone.some( function( n ) { return /laed[0-9]|laeda|lasd[0-8]|lasda|lasdq|bdsdc|stedc|stemr|stegr/.test( n ); });
	var isGenEig = notdone.some( function( n ) { return /^dgg|^zgg|hgeqz|tgex|tgsen|tgsna/.test( n ); });
	var isBandPack = notdone.some( function( n ) { return /^.sb|^.sp|^.hp|^.pp|^.pb|^.hb|^.bp/.test( n ); });
	var isCSD = notdone.some( function( n ) { return /[ou]rbdb|[ou]ncsd|bbcsd/.test( n ); });
	var isRefine = notdone.some( function( n ) { return /rfs$|rfsx$|la_/.test( n ); });
	var isAux = notdone.some( function( n ) { return /^dla[a-z]|^zla[a-z]/.test( n ); }) && !isDC && !isRefine;

	if ( /solv|factor|decompos|eigenvalue|singular value/.test( desc.toLowerCase() ) &&
		!isVariant && !isTsqr && !isExpert && !isBandPack && !isMixed && !isDC && !isCSD && !isGenEig ) {
		tier = 1;
	} else if ( isDC ) {
		tier = 2;
	} else if ( isGenEig && !isVariant ) {
		tier = 3;
	} else if ( isBandPack && !isVariant ) {
		tier = 4;
	} else if ( isRefine || /con$/.test( name0 ) ) {
		tier = 5;
	} else if ( isAux ) {
		tier = 6;
	} else if ( isExpert ) {
		tier = 7;
	} else if ( isVariant || isTsqr || isEquil || isMixed || isCSD ) {
		tier = 8;
	} else {
		tier = 5;
	}

	items.push({
		alg: alg,
		tier: tier,
		done: done.length,
		total: dz.length,
		todo: notdone,
		desc: desc,
		lib: r.library
	});
});

// Sort: tier first, then fraction done descending, then name
items.sort( function sort( a, b ) {
	if ( a.tier !== b.tier ) {
		return a.tier - b.tier;
	}
	var fracA = a.done / a.total;
	var fracB = b.done / b.total;
	if ( fracA !== fracB ) {
		return fracB - fracA;
	}
	return a.todo[0].localeCompare( b.todo[0] );
});

var tierNames = {
	1: 'Core Solvers & Factorizations',
	2: 'Divide-and-Conquer (eigen/SVD)',
	3: 'Generalized Eigenvalue Problems',
	4: 'Banded & Packed Storage',
	5: 'Condition Numbers, Norms & Refinement',
	6: 'Auxiliary Routines',
	7: 'Expert Drivers',
	8: 'Variants, TSQR, Mixed-Precision & CSD'
};

// Output
var totalTodo = items.reduce( function( s, it ) { return s + it.todo.length; }, 0 );

console.log( '# Implementation Queue' );
console.log( '' );
console.log( 'Prioritized remaining d\\*/z\\* LAPACK routines, ordered by tier then by' );
console.log( 'completion progress. Items near the top of each tier are closest to done.' );
console.log( '' );
console.log( '**Implemented: ' + totalImpl + ' modules (' + completeAlgs + ' algorithms complete) | Remaining: ' + totalTodo + ' routines (' + items.length + ' algorithms)**' );
console.log( '' );
console.log( '> To update this file after implementing a routine, run `/blahpack-status`' );
console.log( '> or check the box manually. Regenerate with `node bin/gen-queue.js > QUEUE.md`.' );

var lastTier = 0;
items.forEach( function forEach( it ) {
	if ( it.tier !== lastTier ) {
		console.log( '' );
		var tierItems = items.filter( function( x ) { return x.tier === it.tier; });
		var tierTodo = tierItems.reduce( function( s, x ) { return s + x.todo.length; }, 0 );
		console.log( '## ' + tierNames[ it.tier ] + ' (' + tierTodo + ' routines)' );
		console.log( '' );
		lastTier = it.tier;
	}
	var progress = it.done > 0 ? ' (' + it.done + '/' + it.total + ' done)' : '';
	var todoStr = it.todo.join( ', ' );
	console.log( '- [ ] **' + todoStr + '**' + progress + ' \u2014 ' + it.desc );
});

console.log( '' );
console.log( '---' );
console.log( '**Total remaining: ' + totalTodo + ' routines across ' + items.length + ' algorithms**' );
