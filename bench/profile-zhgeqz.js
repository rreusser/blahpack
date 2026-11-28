#!/usr/bin/env node

// Profile zhgeqz's inner loops using V8's CPU profiler (inspector API).
// Shows per-function and per-line breakdown to identify exactly which
// rotation loops dominate the 50%+ exclusive time.
//
// Usage:
//   node bench/profile-zhgeqz.js
//   node bench/profile-zhgeqz.js --size 200 --iters 10

import inspector from 'node:inspector';
import path from 'node:path';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zggev from '../lib/lapack/zggev/lib/ndarray.js';

var ZHGEQZ_SOURCE = fileURLToPath( new URL( '../lib/lapack/zhgeqz/lib/base.js', import.meta.url ) );

// zggev's job flags, by the single-letter names this script reports.
var JOB = { 'N': 'no-vectors', 'V': 'compute-vectors' };

// CONFIGURATION //

var N = 200;
var ITERS = 5;
var MODE = 'V'; // 'V' for eigenvectors, 'N' for eigenvalues only
var argv = process.argv.slice( 2 );
var i;

for ( i = 0; i < argv.length; i++ ) {
	if ( argv[ i ] === '--size' && argv[ i + 1 ] ) {
		N = parseInt( argv[ i + 1 ], 10 );
		i += 1;
	} else if ( argv[ i ] === '--iters' && argv[ i + 1 ] ) {
		ITERS = parseInt( argv[ i + 1 ], 10 );
		i += 1;
	} else if ( argv[ i ] === '--eigenvalues-only' ) {
		MODE = 'N';
	}
}

// HELPERS //

function randomComplexMatrix( n ) {
	var view;
	var arr;
	var j;

	arr = new Complex128Array( n * n );
	view = new Float64Array( arr.buffer );
	for ( j = 0; j < view.length; j++ ) {
		view[ j ] = ( 2.0 * Math.random() ) - 1.0;
	}
	return arr;
}

function makeDiagDominant( arr, n ) {
	var view;
	var j;

	view = new Float64Array( arr.buffer );
	for ( j = 0; j < n; j++ ) {
		view[ 2 * ( ( j * n ) + j ) ] += n * 2.0;
	}
	return arr;
}

function runWorkload( count ) {
	var ALPHA;
	var BETA;
	var VL;
	var VR;
	var A;
	var B;
	var k;

	for ( k = 0; k < count; k++ ) {
		A = makeDiagDominant( randomComplexMatrix( N ), N );
		B = makeDiagDominant( randomComplexMatrix( N ), N );
		ALPHA = new Complex128Array( N );
		BETA = new Complex128Array( N );
		VL = new Complex128Array( N * N );
		VR = new Complex128Array( N * N );
		zggev( JOB[ MODE ], JOB[ MODE ], N,
			A, 1, N, 0,
			B, 1, N, 0,
			ALPHA, 1, 0,
			BETA, 1, 0,
			VL, 1, N, 0,
			VR, 1, N, 0,
			new Complex128Array( N + ( 32 * N ) + 4160 ), 1, 0,
			new Float64Array( 8 * N ), 1, 0
		);
	}
}

// SECTION MAPPING //
// A line of zhgeqz/lib/base.js belongs to the section named by the nearest
// comment line above it. The names are read from the source on each run, so
// they follow the file as it changes.

var SECTION_OF_LINE = ( function build() {
	var lines = readFileSync( ZHGEQZ_SOURCE, 'utf8' ).split( '\n' );
	var out = new Array( lines.length + 1 );
	var current = '(file header)';
	var text;
	var j;
	for ( j = 0; j < lines.length; j++ ) {
		text = lines[ j ].trim();
		if ( text.startsWith( '// ' ) && !text.startsWith( '// eslint' ) ) {
			current = text.slice( 3 );
		}
		out[ j + 1 ] = current;
	}
	return out;
})();

function lineToSection( lineNo ) {
	var name = SECTION_OF_LINE[ lineNo ] || ( 'line ' + lineNo );
	return ( name.length > 40 ) ? name.slice( 0, 39 ) + '…' : name;
}

// ANALYSIS //

function analyzeProfile( profile, totalMs ) {
	var zhgeqzFile = 'zhgeqz' + path.sep + 'lib' + path.sep + 'base.js';
	// Also match URL-style paths
	var zhgeqzUrlPat = 'zhgeqz/lib/base.js';
	var totalSamples = profile.samples.length;
	var sampleMs = totalMs / totalSamples;
	var allFuncs;
	var topFuncs;
	var zhgeqzNodes;
	var zhgeqzTotalHits;
	var hasPositionTicks;
	var sectionHits;
	var sectionEntries;
	var allLines;
	var topLines;
	var funcHits;
	var funcEntries;
	var node;
	var url;
	var funcName;
	var shortUrl;
	var match;
	var key;
	var tick;
	var section;
	var pct;
	var ms;
	var tf;
	var i;
	var j;
	var k;
	var n;

	// 1. Per-function breakdown across ALL modules
	allFuncs = {};
	for ( i = 0; i < profile.nodes.length; i++ ) {
		node = profile.nodes[ i ];
		if ( node.hitCount === 0 ) {
			continue;
		}
		url = node.callFrame.url;
		funcName = node.callFrame.functionName || '(anonymous)';

		shortUrl = '';
		match = url.match( /\/lib\/(?:blas|lapack)\/([^/]+)\// );
		if ( match ) {
			shortUrl = match[ 1 ];
		} else if ( url.includes( 'cmplx.js' ) ) {
			shortUrl = 'cmplx';
		} else if ( url === '' ) {
			shortUrl = '(native)';
		} else {
			match = url.match( /([^/]+)$/ );
			shortUrl = match ? match[ 1 ] : url;
		}

		key = shortUrl + ':' + funcName;
		if ( !allFuncs[ key ] ) {
			allFuncs[ key ] = { hits: 0, module: shortUrl, func: funcName };
		}
		allFuncs[ key ].hits += node.hitCount;
	}

	topFuncs = Object.values( allFuncs )
		.sort( function sorter( a, b ) {
			return b.hits - a.hits;
		})
		.slice( 0, 30 );

	console.log( '  TOP FUNCTIONS BY SELF TIME (V8 CPU profiler):' );
	console.log( '  ' + '-'.repeat( 68 ) );
	console.log(
		'  ' + 'Module:Function'.padEnd( 42 ) +
		'Hits'.padStart( 8 ) +
		'Self%'.padStart( 8 ) +
		'Time(ms)'.padStart( 10 )
	);
	console.log( '  ' + '-'.repeat( 68 ) );

	for ( i = 0; i < topFuncs.length; i++ ) {
		tf = topFuncs[ i ];
		pct = ( tf.hits / totalSamples * 100 ).toFixed( 1 );
		ms = ( tf.hits * sampleMs ).toFixed( 1 );
		if ( parseFloat( pct ) < 0.3 ) {
			continue;
		}
		console.log(
			'  ' + ( tf.module + ':' + tf.func ).padEnd( 42 ) +
			String( tf.hits ).padStart( 8 ) +
			( pct + '%' ).padStart( 8 ) +
			ms.padStart( 10 )
		);
	}

	// 2. zhgeqz-specific line-level breakdown
	zhgeqzNodes = [];
	for ( i = 0; i < profile.nodes.length; i++ ) {
		node = profile.nodes[ i ];
		if ( node.hitCount > 0 &&
			( node.callFrame.url.includes( zhgeqzFile ) ||
				node.callFrame.url.includes( zhgeqzUrlPat ) ) ) {
			zhgeqzNodes.push( node );
		}
	}

	zhgeqzTotalHits = 0;
	for ( i = 0; i < zhgeqzNodes.length; i++ ) {
		zhgeqzTotalHits += zhgeqzNodes[ i ].hitCount;
	}

	hasPositionTicks = false;
	for ( i = 0; i < zhgeqzNodes.length; i++ ) {
		if ( zhgeqzNodes[ i ].positionTicks && zhgeqzNodes[ i ].positionTicks.length > 0 ) {
			hasPositionTicks = true;
			break;
		}
	}

	console.log( '' );
	console.log( '' );
	console.log( '  ZHGEQZ LINE-LEVEL BREAKDOWN (' + zhgeqzTotalHits + ' self-time samples, ' +
		( zhgeqzTotalHits * sampleMs ).toFixed( 1 ) + 'ms):' );
	console.log( '  ' + '-'.repeat( 73 ) );

	if ( hasPositionTicks ) {
		// Aggregate by code section
		sectionHits = {};
		for ( i = 0; i < zhgeqzNodes.length; i++ ) {
			n = zhgeqzNodes[ i ];
			if ( !n.positionTicks ) {
				continue;
			}
			for ( j = 0; j < n.positionTicks.length; j++ ) {
				tick = n.positionTicks[ j ];
				section = lineToSection( tick.line );
				sectionHits[ section ] = ( sectionHits[ section ] || 0 ) + tick.ticks;
			}
		}

		sectionEntries = Object.entries( sectionHits )
			.sort( function sorter( a, b ) {
				return b[ 1 ] - a[ 1 ];
			});

		console.log(
			'  ' + 'Code Section'.padEnd( 42 ) +
			'Ticks'.padStart( 8 ) +
			'of zhgeqz'.padStart( 11 ) +
			'of total'.padStart( 10 )
		);
		console.log( '  ' + '-'.repeat( 71 ) );

		for ( i = 0; i < sectionEntries.length; i++ ) {
			var sName = sectionEntries[ i ][ 0 ];
			var sHits = sectionEntries[ i ][ 1 ];
			var sPctZh = ( sHits / zhgeqzTotalHits * 100 ).toFixed( 1 );
			var sPctAll = ( sHits / totalSamples * 100 ).toFixed( 1 );
			if ( parseFloat( sPctAll ) < 0.3 ) {
				continue;
			}
			console.log(
				'  ' + sName.padEnd( 42 ) +
				String( sHits ).padStart( 8 ) +
				( sPctZh + '%' ).padStart( 11 ) +
				( sPctAll + '%' ).padStart( 10 )
			);
		}

		// Top individual lines
		console.log( '' );
		console.log( '  Top 20 individual lines:' );
		allLines = {};
		for ( i = 0; i < zhgeqzNodes.length; i++ ) {
			n = zhgeqzNodes[ i ];
			if ( !n.positionTicks ) {
				continue;
			}
			for ( j = 0; j < n.positionTicks.length; j++ ) {
				tick = n.positionTicks[ j ];
				allLines[ tick.line ] = ( allLines[ tick.line ] || 0 ) + tick.ticks;
			}
		}

		topLines = Object.entries( allLines )
			.sort( function sorter( a, b ) {
				return b[ 1 ] - a[ 1 ];
			})
			.slice( 0, 20 );

		for ( i = 0; i < topLines.length; i++ ) {
			var ln = parseInt( topLines[ i ][ 0 ], 10 );
			var lHits = topLines[ i ][ 1 ];
			var lPctZh = ( lHits / zhgeqzTotalHits * 100 ).toFixed( 1 );
			console.log(
				'    Line ' + String( ln ).padStart( 5 ) + ': ' +
				String( lHits ).padStart( 6 ) + ' ticks (' +
				lPctZh + '%)  [' + lineToSection( ln ) + ']'
			);
		}
	} else {
		// No positionTicks — show function-level only
		console.log( '  (positionTicks not available — function-level breakdown only)' );
		console.log( '' );

		funcHits = {};
		for ( i = 0; i < zhgeqzNodes.length; i++ ) {
			n = zhgeqzNodes[ i ];
			funcName = n.callFrame.functionName || '(zhgeqz top-level)';
			funcHits[ funcName ] = ( funcHits[ funcName ] || 0 ) + n.hitCount;
		}

		funcEntries = Object.entries( funcHits )
			.sort( function sorter( a, b ) {
				return b[ 1 ] - a[ 1 ];
			});

		console.log(
			'  ' + 'Function'.padEnd( 30 ) +
			'Hits'.padStart( 8 ) +
			'of zhgeqz'.padStart( 11 ) +
			'Time(ms)'.padStart( 10 )
		);
		console.log( '  ' + '-'.repeat( 59 ) );

		for ( i = 0; i < funcEntries.length; i++ ) {
			var fName = funcEntries[ i ][ 0 ];
			var fHits = funcEntries[ i ][ 1 ];
			var fPct = ( fHits / zhgeqzTotalHits * 100 ).toFixed( 1 );
			ms = ( fHits * sampleMs ).toFixed( 1 );
			console.log(
				'  ' + fName.padEnd( 30 ) +
				String( fHits ).padStart( 8 ) +
				( fPct + '%' ).padStart( 11 ) +
				ms.padStart( 10 )
			);
		}
	}

	console.log( '' );
}

// MAIN //

function main() {
	var session;
	var totalMs;
	var t0;

	console.log( '' );
	console.log( '='.repeat( 74 ) );
	console.log( '  ZHGEQZ INNER LOOP PROFILING' );
	console.log( '  N=' + N + ', ' + ITERS + ' iterations, mode=' + MODE + '/' + MODE );
	console.log( '='.repeat( 74 ) );

	// Warmup JIT
	console.log( '\n  Warming up JIT (3 iterations)...' );
	runWorkload( 3 );

	// Start CPU profiler via inspector
	session = new inspector.Session();
	session.connect();

	session.post( 'Profiler.enable', function onEnabled( err ) {
		if ( err ) {
			throw err;
		}
		session.post( 'Profiler.setSamplingInterval', { interval: 100 }, function onInterval( err2 ) {
			if ( err2 ) {
				throw err2;
			}
			session.post( 'Profiler.start', function onStarted( err3 ) {
				if ( err3 ) {
					throw err3;
				}
				console.log( '  Running profiled workload (' + ITERS + ' iterations)...' );
				t0 = performance.now();
				runWorkload( ITERS );
				totalMs = performance.now() - t0;

				session.post( 'Profiler.stop', function onStopped( err4, result ) {
					if ( err4 ) {
						throw err4;
					}
					session.post( 'Profiler.disable' );
					session.disconnect();

					console.log( '  Done: ' + totalMs.toFixed( 1 ) + 'ms total (' +
						( totalMs / ITERS ).toFixed( 1 ) + 'ms/call)\n' );

					analyzeProfile( result.profile, totalMs );
				});
			});
		});
	});
}

main();
