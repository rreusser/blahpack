#!/usr/bin/env node
'use strict';

// Precompute the reference leading-dimension rules for every routine.
//
//   data/fortran-ld-rules.json  ←  node bin/gen_fortran_ld_rules.js
//
// For each reference routine this records, per leading-dimension argument
// (`LDA`, `LDVL`, ...), the Fortran argument-check conditions that reject it,
// verbatim (continuation lines joined, whitespace collapsed), e.g.
//
//   "LDVL": [ "LDVL.LT.1 .OR. ( WANTVL .AND. LDVL.LT.N )" ]
//
// together with the routine's simple local definitions those conditions use
// (`WANTVL = LSAME( JOBVL, 'V' )`, `NROWA = M`), so the JS side can translate the
// rule without the (gitignored) Fortran tree. It contains NO JavaScript — the
// translation to wrapper checks lives in bin/conformance/ld-rules.js.
//
// Inputs: the reference sources fetched by `npm run fetch-reference`.
// Output is deterministic (sorted keys).

var path = require( 'path' );
var fs = require( 'fs' );
var fa = require( './fortran-argchecks.js' );

var OUT = path.join( fa.ROOT, 'data', 'fortran-ld-rules.json' );

function main() {
	var all = {};
	fa.eachSource( function each( name, lines ) {
		var rules = {};
		fa.infoChecks( lines ).forEach( function eachCheck( c ) {
			var re = /\b(LD[A-Z0-9]*)\s*\.LT\./g;
			var t;
			while ( ( t = re.exec( c.cond ) ) !== null ) {
				rules[ t[ 1 ] ] = rules[ t[ 1 ] ] || [];
				if ( rules[ t[ 1 ] ].indexOf( c.cond ) === -1 ) {
					rules[ t[ 1 ] ].push( c.cond );
				}
			}
		});
		if ( !Object.keys( rules ).length ) {
			return;
		}
		var used = fa.usedLocals( Object.keys( rules ).map( function m( k ) {
			return rules[ k ].join( ' ' );
		}).join( ' ' ), fa.locals( lines ) );
		all[ name ] = { 'rules': rules };
		if ( Object.keys( used ).length ) {
			all[ name ].locals = used;
		}
	});
	fs.writeFileSync( OUT, fa.sortedJSON( all ) );
	process.stderr.write( 'wrote LD rules for ' + Object.keys( all ).length + ' routines to ' + path.relative( fa.ROOT, OUT ) + '\n' );
}

main();
