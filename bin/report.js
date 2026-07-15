#!/usr/bin/env node

/**
* Generate a static HTML progress report.
*
* Usage:
*   node bin/report.js > progress.html
*
* Loads data/routines.json (from extract_metadata.py), scans lib/ for
* implemented modules, and produces a grouped dashboard showing algorithms
* with their type×storage variants.
*/

'use strict';

var fs = require( 'fs' );
var path = require( 'path' );
var execSync = require( 'child_process' ).execSync;

var ROOT = path.join( __dirname, '..' );

// ---------------------------------------------------------------------------
// Load the routine database
// ---------------------------------------------------------------------------

var routinesPath = path.join( ROOT, 'data', 'routines.json' );
if ( !fs.existsSync( routinesPath ) ) {
	process.stderr.write( 'Missing data/routines.json — run: python3 bin/extract_metadata.py > data/routines.json\n' );
	process.exit( 1 );
}
var db = JSON.parse( fs.readFileSync( routinesPath, 'utf8' ) );

// Strip single-precision (s, c) variants project-wide. We don't translate
// single-precision routines, so they shouldn't appear in the report.
var SKIP_TYPES = { 's': true, 'c': true };
db.routines.forEach( function( a ) {
	a.variants = a.variants.filter( function( v ) { return !SKIP_TYPES[ v.type ]; } );
});
db.routines = db.routines.filter( function( a ) { return a.variants.length > 0; } );

// Recompute meta totals to match the filtered set.
db.meta.total_routines = db.routines.reduce( function( s, a ) { return s + a.variants.length; }, 0 );
db.meta.total_algorithms = db.routines.length;
if ( db.meta.type_prefixes ) {
	delete db.meta.type_prefixes.s;
	delete db.meta.type_prefixes.c;
}

// ---------------------------------------------------------------------------
// Scan implemented modules
// ---------------------------------------------------------------------------

function scanModules( pkg ) {
	var baseDir = path.join( ROOT, 'lib', pkg, 'base' );
	var out = {};
	if ( !fs.existsSync( baseDir ) ) {
		return out;
	}
	var dirs = fs.readdirSync( baseDir ).filter( function( d ) {
		return fs.statSync( path.join( baseDir, d ) ).isDirectory();
	});
	dirs.forEach( function( name ) {
		var dir = path.join( baseDir, name );
		var baseJs = path.join( dir, 'lib', 'base.js' );
		var pkgJson = path.join( dir, 'package.json' );
		var testJs = path.join( dir, 'test', 'test.js' );

		var hasImpl = false;
		var isStub = true;
		if ( fs.existsSync( baseJs ) ) {
			hasImpl = true;
			var src = fs.readFileSync( baseJs, 'utf8' );
			isStub = /^\t(?:\/\/ )?TODO: implement|^\tthrow new Error\( 'not yet implemented' \)/m.test( src );
		}

		var description = '';
		if ( fs.existsSync( pkgJson ) ) {
			try {
				description = JSON.parse( fs.readFileSync( pkgJson, 'utf8' ) ).description || '';
			} catch ( e ) {}
		}

		// Discover ALL test files: test.js, test.<routine>.js, test.ndarray.js.
		// The earlier regex `/^test(\.|$).*\.js$/` *failed to match `test.js`*
		// (the bare-name file): after consuming `^test\.` it required a second
		// `.js` ending, leaving nothing in between. That silently excluded the
		// bare test.js from coverage runs and the test-count tally for any
		// module whose substantive tests happened to live there (e.g. dlaein
		// after wave 3 — reported 52% line coverage when the actual was 99%).
		var testDir = path.join( dir, 'test' );
		var testFiles = [];
		if ( fs.existsSync( testDir ) ) {
			testFiles = fs.readdirSync( testDir ).filter( function( f ) {
				return /^test(\..+)?\.js$/.test( f );
			}).map( function( f ) {
				return path.join( testDir, f );
			});
		}
		var hasTests = testFiles.length > 0;
		var testCount = 0;
		if ( hasTests ) {
			testFiles.forEach( function( tf ) {
				var testSrc = fs.readFileSync( tf, 'utf8' );
				testCount += ( testSrc.match( /\btest\s*\(/g ) || [] ).length;
			});
		}

		// Coverage — run ALL test files together so coverage reflects the
		// full test suite, not just test.js (which usually only has export
		// checks). The real fixture-based tests live in test.ndarray.js.
		var lineCov = null;
		var branchCov = null;
		if ( hasTests && hasImpl && !isStub ) {
			try {
				var covOut = execSync(
					'node --test --experimental-test-coverage ' + testFiles.join( ' ' ) + ' 2>&1',
					{ timeout: 60000, encoding: 'utf8' }
				);
				// Parse Node's coverage-table output. Coverage-table lines start
				// with the info-symbol `ℹ` (U+2139); test-result lines start
				// with `✔`/`✖`. Restricting to `ℹ`-lines avoids a real bug we
				// hit: a test name like `'dlartgs.ndarray: |x| < thresh branch'`
				// contains both the module name AND a `|`, so the previous
				// regex (`\b<name>\b` + `|`) latched onto the test result and
				// then read the *previous* module's base.js coverage. Result:
				// dlartgs reported 76% line cov when the actual was 100%.
				var covLines = covOut.split( '\n' );
				var foundDir = false;
				for ( var li = 0; li < covLines.length; li++ ) {
					var covLine = covLines[ li ];
					// Only consider coverage-table lines, which start with the
					// info-symbol `ℹ` (U+2139). Test-result lines start with
					// `✔`/`✖`. Without this filter, a test name like
					// `'dlartgs.ndarray: |x| < thresh branch'` matches both
					// the module name AND a `|`, latches `foundDir = true` on
					// the test line, then reads the *previous* module's
					// base.js coverage (dlartgs read 76% when actual was 100%).
					if ( !/^ℹ/.test( covLine ) ) {
						continue;
					}
					if ( new RegExp( '\\b' + name + '\\b' ).test( covLine ) && /\|/.test( covLine ) ) {
						foundDir = true;
						continue;
					}
					if ( foundDir && /base\.js/.test( covLine ) && /\d+\.\d+/.test( covLine ) ) {
						var nums = covLine.match( /(\d+\.?\d*)/g );
						if ( nums && nums.length >= 3 ) {
							lineCov = parseFloat( nums[ 0 ] );
							branchCov = parseFloat( nums[ 1 ] );
						}
						break;
					}
				}
			} catch ( e ) {}
		}

		out[ name ] = {
			name: name,
			package: pkg,
			description: description,
			hasImpl: hasImpl && !isStub,
			isStub: isStub,
			hasTests: hasTests,
			testCount: testCount,
			lineCov: lineCov,
			branchCov: branchCov,

			// Property-based validation: a `test.validate.js` file signals a
			// validation approach is in place; `validationLevel` (L0-L4) is filled
			// in later from the runtime ledger. See test/harness/.
			hasValidation: fs.existsSync( path.join( testDir, 'test.validate.js' ) ),
			validationLevel: 0
		};
	});
	return out;
}

// ---------------------------------------------------------------------------
// Build the report
// ---------------------------------------------------------------------------

// Clear stale validation-ledger fragments so recorded levels reflect THIS run:
// scanModules runs every test file (including test.validate.js), which
// repopulates the ledger via each test process's on-exit flush.
var LEDGER_DIR = path.join( ROOT, 'test', '.validation-ledger' );
try {
	if ( fs.existsSync( LEDGER_DIR ) ) {
		fs.readdirSync( LEDGER_DIR ).forEach( function( f ) {
			if ( /^frag-.*\.jsonl$/.test( f ) ) {
				fs.unlinkSync( path.join( LEDGER_DIR, f ) );
			}
		});
	}
} catch ( e ) {}

var blasImpl = scanModules( 'blas' );
var lapackImpl = scanModules( 'lapack' );

// Attach recorded validation levels (from the runtime ledger the test.validate.js
// runs above repopulated) to each implementation, keyed by routine name.
( function attachValidationLevels() {
	var summary = {};
	try {
		execSync( 'node ' + path.join( ROOT, 'bin', 'validation-level.js' ), { cwd: ROOT, stdio: [ 'ignore', 'ignore', 'ignore' ] } );
		var sp = path.join( LEDGER_DIR, 'summary.json' );
		if ( fs.existsSync( sp ) ) {
			summary = JSON.parse( fs.readFileSync( sp, 'utf8' ) );
		}
	} catch ( e ) {}
	[ blasImpl, lapackImpl ].forEach( function( set ) {
		Object.keys( set ).forEach( function( n ) {
			if ( summary[ n ] ) {
				set[ n ].validationLevel = summary[ n ].level;
			}
		});
	});
})();

// Lookup: routine name (lowercase) -> implementation info
function getImpl( name ) {
	var lower = name.toLowerCase();
	return blasImpl[ lower ] || lapackImpl[ lower ] || null;
}

// Compute overall stats
var totalRoutines = db.meta.total_routines;
var totalAlgorithms = db.meta.total_algorithms;
var allImpl = Object.keys( blasImpl ).concat( Object.keys( lapackImpl ) );
var implementedCount = allImpl.filter( function( k ) {
	var m = blasImpl[ k ] || lapackImpl[ k ];
	return m && m.hasImpl;
}).length;
var totalTests = allImpl.reduce( function( s, k ) {
	var m = blasImpl[ k ] || lapackImpl[ k ];
	return s + ( m ? m.testCount : 0 );
}, 0 );

// Count source routines from the actual Fortran directories — exclude
// single-precision (s*, c*) since we don't translate those.
function isSinglePrecision( f ) {
	return /^[sc]/i.test( f );
}
var blasSourceCount = fs.readdirSync( path.join( ROOT, 'data', 'BLAS-3.12.0' ) )
	.filter( function( f ) { return /\.(f|f90)$/i.test( f ) && !isSinglePrecision( f ); } ).length;
var lapackSourceCount = fs.readdirSync( path.join( ROOT, 'data', 'lapack-3.12.0', 'SRC' ) )
	.filter( function( f ) { return /\.(f|f90)$/i.test( f ) && !isSinglePrecision( f ); } ).length;
var blasImplCount = Object.keys( blasImpl ).filter( function( k ) { return blasImpl[ k ].hasImpl; } ).length;
var lapackImplCount = Object.keys( lapackImpl ).filter( function( k ) { return lapackImpl[ k ].hasImpl; } ).length;

// ---------------------------------------------------------------------------
// HTML helpers
// ---------------------------------------------------------------------------

function esc( s ) {
	return ( s || '' ).replace( /&/g, '&amp;' ).replace( /</g, '&lt;' ).replace( />/g, '&gt;' );
}

function covBadge( val, threshold ) {
	if ( val === null ) return '<span class="cov">—</span>';
	var cls = val >= threshold ? 'cov-good' : val >= threshold - 10 ? 'cov-warn' : 'cov-bad';
	return '<span class="' + cls + '">' + val.toFixed( 0 ) + '%</span>';
}

function coverageClass( lineCov ) {
	if ( lineCov === null || lineCov === undefined ) {
		return 'cov-unknown';
	}
	if ( lineCov >= 90 ) return 'cov-good';
	if ( lineCov >= 80 ) return 'cov-warn';
	return 'cov-bad';
}

function variantCell( variant ) {
	var impl = getImpl( variant.name );
	var cls = 'variant';
	if ( impl && impl.hasImpl ) {
		cls += ' variant-done';
		// Tint the implemented variant by its line coverage so per-variant
		// quality is visible at a glance instead of buried in a single
		// algorithm-level average.
		cls += ' variant-' + coverageClass( impl.lineCov );
	} else if ( impl && impl.isStub ) {
		cls += ' variant-stub';
	} else {
		cls += ' variant-none';
	}
	var typeLabel = db.meta.type_prefixes[ variant.type ];
	var tip = variant.name + ( typeLabel ? ' (' + typeLabel.label + ')' : '' );
	if ( impl && impl.hasImpl ) {
		if ( impl.lineCov !== null && impl.lineCov !== undefined ) {
			tip += ' — ' + impl.lineCov.toFixed( 0 ) + '% line';
			if ( impl.branchCov !== null && impl.branchCov !== undefined ) {
				tip += ' / ' + impl.branchCov.toFixed( 0 ) + '% branch';
			}
		} else {
			tip += ' — coverage: n/a';
		}
		tip += ' — tests: ' + impl.testCount;
	}
	// Property-based validation indicator: a corner dot on the variant, colored by
	// the recorded validation level (L2 property / L3 layout-fuzzed / L4 cross-diff).
	var vdot = '';
	if ( impl && impl.hasValidation ) {
		var vlvl = impl.validationLevel || 0;
		cls += ' variant-validated';
		tip += ' — validation: ' + ( vlvl >= 1 ? ( 'L' + vlvl ) : 'in place' );
		vdot = '<span class="vdot vdot-l' + vlvl + '"></span>';
	}
	var id = variant.name.toLowerCase();
	var href = '#' + id;
	if ( impl && impl.hasImpl ) {
		var pkg = impl.package || 'lapack';
		href = 'https://github.com/rreusser/notes/tree/main/lib/' + pkg + '/base/' + id;
	}
	return '<a id="' + id + '" href="' + href + '" class="' + cls + '" title="' + esc( tip ) + '">' + variant.type + vdot + '</a>';
}

function texifyDesc( raw ) {
	if ( !raw ) return '';
	var s = esc( raw );

	// := equations
	var eqnPattern = /([A-Za-z](?:\([^)]*\))?\s*:=\s*(?:[^,.]|,(?!\s+(?:where|or|and|such)\b))*)/g;
	s = s.replace( eqnPattern, function( match ) {
		return '\\(' + fortranToTex( match.trim() ) + '\\)';
	});

	// A = U**T*U or A = L*L**T style
	s = s.replace(
		/([A-Z]\s*=\s*(?:[A-Z*()^]+(?:\*\*[A-Za-z]+)?)+(?:\s+or\s+[A-Z]\s*=\s*(?:[A-Z*()^]+(?:\*\*[A-Za-z]+)?)+)*)(?=\s+(?:computed|where|using)\b|[,.])/g,
		function( match ) {
			if ( match.indexOf( '\\(' ) >= 0 ) return match;
			if ( !/\*\*/.test( match ) ) return match;
			var parts = match.split( /\s+or\s+/ );
			return parts.map( function( p ) {
				return '\\(' + fortranToTex( p.trim() ) + '\\)';
			}).join( ' or ' );
		}
	);

	// Q**T * A * Q = H style
	s = s.replace(
		/([A-Z]\*\*[A-Za-z]\s*\*\s*[A-Z][\s*A-Z]*=\s*[A-Z])\b/g,
		function( match ) {
			if ( match.indexOf( '\\(' ) >= 0 ) return match;
			return '\\(' + fortranToTex( match.trim() ) + '\\)';
		}
	);

	// A*X = B or A**T*X = B style
	s = s.replace(
		/([A-Z](?:\*\*[A-Z])?\s*\*\s*[A-Za-z]\s*=\s*[A-Za-z])\b/g,
		function( match ) {
			if ( match.indexOf( '\\(' ) >= 0 ) return match;
			return '\\(' + fortranToTex( match.trim() ) + '\\)';
		}
	);

	// A*x=(lambda)*B*x
	s = s.replace(
		/([A-Z]\*[a-z]=\(lambda\)\*[A-Z]\*[a-z])/g,
		function( match ) {
			if ( match.indexOf( '\\(' ) >= 0 ) return match;
			return '\\(' + fortranToTex( match ) + '\\)';
		}
	);

	// c**2 + s**2 = 1 style
	s = s.replace(
		/\b([a-z]\*\*\d[\s+a-z0-9*=]*)/g,
		function( match ) {
			if ( match.indexOf( '\\(' ) >= 0 ) return match;
			return '\\(' + fortranToTex( match.trim() ) + '\\)';
		}
	);

	// sqrt(...) standalone
	s = s.replace(
		/[A-Z]?sqrt\(\s*([^)]+)\s*\)/gi,
		function( match ) {
			if ( match.indexOf( '\\(' ) >= 0 || match.indexOf( '\\sqrt' ) >= 0 ) return match;
			return '\\(' + fortranToTex( match ) + '\\)';
		}
	);

	// op( X ) standalone
	s = s.replace( /op\(\s*([A-Z])\s*\)/g, function( m, l ) {
		if ( m.indexOf( '\\(' ) >= 0 ) return m;
		return '\\(\\operatorname{op}(' + l + ')\\)';
	});

	// Final cleanup in prose regions (outside math)
	var parts = s.split( /(\\\(.*?\\\))/g );
	for ( var i = 0; i < parts.length; i++ ) {
		if ( i % 2 === 0 ) {
			parts[ i ] = parts[ i ]
				.replace( /([A-Za-z])\*\*([A-Za-z0-9])/g, '\\($1^$2\\)' )
				.replace( /([A-Z])\^([A-Z0-9])\s*\*\s*([A-Z])/g, '\\($1^$2 $3\\)' )
				.replace( /([A-Za-z])\^([A-Za-z0-9])/g, '\\($1^$2\\)' )
				.replace( /\balpha\b/g, '\\(\\alpha\\)' )
				.replace( /\bbeta\b/g, '\\(\\beta\\)' )
				.replace( /\blambda\b/g, '\\(\\lambda\\)' );
		}
	}
	s = parts.join( '' );

	// Merge adjacent math regions
	s = s.replace( /\\\)\s*\\\(/g, '\\,' );

	// Remove nested delimiters
	s = s.replace( /\\\(\\\(/g, '\\(' );
	s = s.replace( /\\\)\\\)/g, '\\)' );

	return s;
}

function fortranToTex( expr ) {
	var s = expr;
	s = s.replace( /&amp;/g, '&' );
	s = s.replace( /&lt;/g, '<' );
	s = s.replace( /&gt;/g, '>' );
	s = s.replace( /conjg\(\s*alpha\s*\)/gi, '\\overline{\\alpha}' );
	s = s.replace( /[A-Z]?sqrt\(\s*([^)]+)\s*\)/gi, function( m, inner ) {
		return '\\sqrt{' + inner + '}';
	});
	s = s.replace( /\(lambda\)/gi, '\\lambda' );
	s = s.replace( /\(alpha\)/gi, '\\alpha' );
	s = s.replace( /\(beta\)/gi, '\\beta' );
	s = s.replace( /op\(\s*([A-Z])\s*\)/g, '\\operatorname{op}($1)' );
	s = s.replace( /(?<!\\)\balpha\b/g, '\\alpha' );
	s = s.replace( /(?<!\\)\bbeta\b/g, '\\beta' );
	s = s.replace( /(?<!\\)\blambda\b/g, '\\lambda' );
	s = s.replace( /(?<!\\)\bsigma\b/g, '\\sigma' );
	s = s.replace( /(?<!\\)\btau\b/g, '\\tau' );
	s = s.replace( /\*\*\(([^)]+)\)/g, function( m, inner ) {
		return '^{' + inner.replace( /\*\*/g, '^' ).replace( /\s*\*\s*/g, '' ) + '}';
	});
	s = s.replace( /\*\*(-?\d+)/g, '^{$1}' );
	s = s.replace( /\*\*([A-Za-z])/g, '^$1' );
	s = s.replace( /\s*\*\s*/g, '' );
	s = s.replace( /([a-z])(\d)/g, '$1^$2' );
	s = s.replace( /:=/g, '\\coloneqq ' );
	s = s.replace( /(\\(?:alpha|beta|lambda|sigma|tau))([A-Za-z])/g, '$1\\,$2' );
	return s;
}

// ---------------------------------------------------------------------------
// Build algorithm table rows, grouped by library
// ---------------------------------------------------------------------------

// Description overrides for algorithms whose Fortran-extracted descriptions
// are too long, contain ASCII art matrices, or are otherwise unhelpful.
var DESC_OVERRIDES = {
	// CS decomposition — Fortran description has huge ASCII matrices
	'csd':       'Computes the CS decomposition of a partitioned orthogonal/unitary matrix.',
	'csd2by1':   'Computes the CS decomposition of an M-by-Q matrix with orthonormal columns partitioned into a 2-by-1 block structure.',
	'bdb':       'Simultaneously bidiagonalizes the blocks of a partitioned orthogonal/unitary matrix (CS decomposition driver).',
	'bdb1':      'Simultaneously bidiagonalizes the blocks of a tall and skinny matrix with orthonormal columns (case 1).',
	'bdb2':      'Simultaneously bidiagonalizes the blocks of a tall and skinny matrix with orthonormal columns (case 2).',
	'bdb3':      'Simultaneously bidiagonalizes the blocks of a tall and skinny matrix with orthonormal columns (case 3).',
	'bdb4':      'Simultaneously bidiagonalizes the blocks of a tall and skinny matrix with orthonormal columns (case 4).',

	// Multiply by orthogonal/unitary Q — Fortran has SIDE/TRANS table
	'mbr':       'Multiplies a general matrix by the orthogonal/unitary matrix Q or P from a bidiagonal reduction.',
	'mhr':       'Multiplies a general matrix by the orthogonal/unitary matrix Q from a Hessenberg reduction.',
	'mlq':       'Multiplies a general matrix by the orthogonal/unitary matrix Q from an LQ factorization.',
	'mlqt':      'Multiplies a general matrix by the orthogonal/unitary matrix Q from a blocked LQ factorization.',
	'mql':       'Multiplies a general matrix by the orthogonal/unitary matrix Q from a QL factorization.',
	'mqr':       'Multiplies a general matrix by the orthogonal/unitary matrix Q from a QR factorization.',
	'mqrt':      'Multiplies a general matrix by the orthogonal/unitary matrix Q from a blocked QR factorization.',
	'mrq':       'Multiplies a general matrix by the orthogonal/unitary matrix Q from an RQ factorization.',
	'mrz':       'Multiplies a general matrix by the orthogonal/unitary matrix Q from an RZ factorization.',
	'mswlq':     'Multiplies a general matrix by the orthogonal/unitary matrix Q from a short-wide LQ factorization.',
	'mtsqr':     'Multiplies a general matrix by the orthogonal/unitary matrix Q from a tall-skinny QR factorization.',
	'mtr':       'Multiplies a general matrix by the orthogonal/unitary matrix Q stored in a triangular factorization.',

	// Tall-skinny and short-wide factorizations — long descriptions
	'tsqr':      'Computes a blocked tall-skinny QR factorization.',
	'swlq':      'Computes a blocked short-wide LQ factorization.',
	'tsqrhrt':   'Computes an upper-triangular factor of an orthogonal/unitary matrix from a tall-skinny QR factorization.',

	// QR factorization variants
	'qrfp':      'Computes a QR factorization with non-negative diagonal entries.',

	// Generalized problems
	'glm':       'Solves a general Gauss-Markov linear model (GLM) problem.',
	'svp3':      'Computes the generalized singular value decomposition (GSVD).',
	'syl':       'Solves the generalized Sylvester equation.',
	'sen':       'Reorders the generalized Schur decomposition and computes reciprocal condition numbers.',

	// Condition number / inverse with long factorization descriptions
	'con_3':     'Estimates the reciprocal of the condition number using the bounded Bunch-Kaufman factorization.',
	'tri_3':     'Computes the inverse of a symmetric/Hermitian indefinite matrix using the bounded Bunch-Kaufman factorization.',
	'tri_3x':    'Computes the inverse of a symmetric/Hermitian indefinite matrix using the bounded Bunch-Kaufman factorization (expert).',
	'trs_3':     'Solves a system of linear equations using the bounded Bunch-Kaufman factorization.',

	// Factorization format conversion
	'convf':     'Converts between factorization storage formats for symmetric/Hermitian indefinite factorizations.',
	'convf_rook': 'Converts between factorization storage formats for rook-pivoted symmetric/Hermitian indefinite factorizations.',

	// SVD
	'sdc':       'Computes the SVD of a bidiagonal matrix using a divide and conquer method.',
	'svdx':      'Computes selected singular values and vectors of a bidiagonal matrix.',
	'sqr':       'Computes singular values and vectors from the SVD of a bidiagonal matrix.',

	// Rotations — clean up ALL-CAPS and matrix notation
	'rotg':      'Constructs a Givens plane rotation.',
	'rotm':      'Applies a modified Givens rotation.',
	'rotmg':     'Constructs a modified Givens rotation.',

	// Empty or stub descriptions
	'syl3':      'Solves the Sylvester matrix equation (blocked algorithm).',
	'con_rook':  'Estimates the reciprocal of the condition number using rook pivoting.',
	'qz3':       'Performs aggressive early deflation in the QZ algorithm.',

	// Eigenvalue descriptions that say "for OTHER matrices"
	'ev_2stage':   'Computes eigenvalues and optionally eigenvectors (2-stage algorithm).',
	'evd':         'Computes eigenvalues and optionally eigenvectors using divide and conquer.',
	'evd_2stage':  'Computes eigenvalues and optionally eigenvectors using divide and conquer (2-stage algorithm).',
	'evr':         'Computes eigenvalues and optionally eigenvectors using the MRRR algorithm.',
	'evr_2stage':  'Computes eigenvalues and optionally eigenvectors using the MRRR algorithm (2-stage).',
	'evx_2stage':  'Computes selected eigenvalues and optionally eigenvectors (2-stage algorithm).',

	// Mixed-precision solvers
	'cgesv':     'Computes the solution to a system of linear equations using mixed-precision iterative refinement.',
	'cposv':     'Computes the solution to a positive definite system using mixed-precision iterative refinement.',
	'sgesv':     'Computes the solution to a system of linear equations using mixed-precision iterative refinement.',

	// Block reflector
	'rft':       'Forms the triangular factor T of a block reflector.',

	// BLAS descriptions — shorter versions
	'dotc':      'Computes the dot product of two complex vectors, conjugating the first.',
	'dotu':      'Computes the dot product of two complex vectors, without conjugation.',

	// Iterative refinement
	'_gbrfsx_extended': 'Improves the computed solution to a general banded system using extra-precise iterative refinement.',
	'_gerfsx_extended': 'Improves the computed solution to a general system using extra-precise iterative refinement.',
	'_herfsx_extended': 'Improves the computed solution to a Hermitian indefinite system using extra-precise iterative refinement.',
	'_porfsx_extended': 'Improves the computed solution to a positive definite system using extra-precise iterative refinement.',
	'_syrfsx_extended': 'Improves the computed solution to a symmetric indefinite system using extra-precise iterative refinement.',

	// Comment artifact
	'syf_rook':  'Computes a partial factorization of a symmetric matrix using rook pivoting (blocked).',

	// Overflow-safe
	'rmm':       'Computes a scaling factor to prevent overflow in triangular matrix multiplication.',

	// Householder reflector
	'rfb_gett':  'Applies a block Householder reflector to a triangular-pentagonal matrix.',
};

function algorithmRow( alg ) {
	var totalTestsAlg = 0;
	var variantNames = [];
	var storageSet = {};
	var typeSet = {};

	// Group variants by storage
	var byStorage = {};
	alg.variants.forEach( function( v ) {
		var s = v.storage || 'none';
		storageSet[ s ] = true;
		typeSet[ v.type ] = true;
		variantNames.push( v.name.toLowerCase() );
		if ( !byStorage[ s ] ) byStorage[ s ] = {};
		byStorage[ s ][ v.type ] = v;
		var impl = getImpl( v.name );
		if ( impl ) totalTestsAlg += impl.testCount;
	});

	var storageKeys = Object.keys( byStorage ).sort();
	// Canonical type order
	var typeOrder = [ 's', 'd', 'c', 'z', 'i', 'l', 'x' ];
	var typeKeys = typeOrder.filter( function( t ) { return typeSet[ t ]; } );

	// Build the variants grid: one row per storage, one column per type
	var gridHTML = '<table class="variant-grid"><tbody>';
	storageKeys.forEach( function( s ) {
		var storageLabel = s === 'none' ? '' : s;
		var storageTitle = db.meta.storage_codes[ s ] || '';
		gridHTML += '<tr data-vg-storage="' + s + '">';
		gridHTML += '<td class="vg-storage"' + ( storageTitle ? ' title="' + esc( storageTitle ) + '"' : '' ) + '>' + storageLabel + '</td>';
		typeKeys.forEach( function( t ) {
			var v = byStorage[ s ][ t ];
			if ( v ) {
				gridHTML += '<td>' + variantCell( v ) + '</td>';
			} else {
				gridHTML += '<td></td>';
			}
		});
		gridHTML += '</tr>';
	});
	gridHTML += '</tbody></table>';

	// Build the algorithm display name. If all variants share the same
	// storage, show a representative full name (e.g. "dgetrf").
	// If variants span multiple storages, show the algorithm suffix
	// with a wildcard (e.g. "*trf") since no single name represents all.
	var canonVar = alg.variants.find( function( v ) { return v.type === 'd'; } ) ||
		alg.variants.find( function( v ) { return v.type === 'z'; } ) ||
		alg.variants[ 0 ];
	var canonicalName;
	var uniqueTypes = Object.keys( typeSet ).length;
	if ( uniqueTypes === 1 && storageKeys.length === 1 ) {
		// Single type, single storage — show the actual routine name
		canonicalName = canonVar.name.toLowerCase();
	} else {
		canonicalName = '*' + alg.algorithm;
	}

	// Use description override or Fortran-extracted description
	var desc = DESC_OVERRIDES[ alg.algorithm ] || '';
	if ( !desc ) {
		var descVariant = alg.variants.find( function( v ) { return v.type === 'd' && v.description; } ) ||
			alg.variants.find( function( v ) { return v.type === 'z' && v.description; } ) ||
			alg.variants.find( function( v ) { return v.description; } );
		if ( descVariant ) {
			desc = descVariant.description;
		}
	}

	var doneCount = alg.variants.filter( function( v ) {
		var impl = getImpl( v.name );
		return impl && impl.hasImpl;
	}).length;

	// Per-variant line coverage. Show the range when implemented variants
	// disagree (e.g. a row covering 7 variants like *mm should NOT collapse
	// to one average — the coverage column should make per-variant gaps
	// visible). Format:
	//   single value         "92%"
	//   uniform across N     "92% (n=4)"
	//   range across N       "78–98% (n=7)"
	//   with missing data    "78–98% (4/7)"   — only 4 of 7 measured
	var covValues = [];
	var implCount = 0;
	alg.variants.forEach( function( v ) {
		var impl = getImpl( v.name );
		if ( impl && impl.hasImpl ) {
			implCount++;
			if ( impl.lineCov !== null && impl.lineCov !== undefined ) {
				covValues.push( impl.lineCov );
			}
		}
	});
	var covDisp;
	if ( covValues.length === 0 ) {
		covDisp = '—';
	} else {
		var covMin = Math.min.apply( null, covValues );
		var covMax = Math.max.apply( null, covValues );
		var covSpread = covMax - covMin;
		var rangeStr;
		if ( covSpread < 1 ) {
			// Within rounding — render as a single value.
			rangeStr = '<span class="' + coverageClass( covMin ) + '">' + covMin.toFixed( 0 ) + '%</span>';
		} else {
			// Color by the worst case so a single bad variant stands out.
			rangeStr = '<span class="' + coverageClass( covMin ) + '">' + covMin.toFixed( 0 ) + '–' + covMax.toFixed( 0 ) + '%</span>';
		}
		var sampleSuffix;
		if ( covValues.length < implCount ) {
			sampleSuffix = ' <span class="cov-sample">(' + covValues.length + '/' + implCount + ')</span>';
		} else if ( implCount > 1 ) {
			sampleSuffix = ' <span class="cov-sample">(n=' + implCount + ')</span>';
		} else {
			sampleSuffix = '';
		}
		covDisp = rangeStr + sampleSuffix;
	}

	return '<tr' +
		' data-algorithm="' + esc( alg.algorithm ) + '"' +
		' data-variants="' + variantNames.join( ',' ) + '"' +
		' data-storage="' + Object.keys( storageSet ).join( ',' ) + '"' +
		' data-types="' + typeKeys.join( ',' ) + '"' +
		'>' +
		'<td class="name"><a id="' + esc( canonicalName ) + '" href="#' + esc( canonicalName ) + '">' + esc( canonicalName ) + '</a></td>' +
		'<td class="variants-cell">' + gridHTML + '</td>' +
		'<td class="cov">' + covDisp + '</td>' +
		'<td class="desc">' + texifyDesc( desc ) + '</td>' +
		'</tr>';
}

function sectionHTML( title, algorithms ) {
	var totalAlg = algorithms.length;
	var totalVariants = algorithms.reduce( function( s, a ) { return s + a.variants.length; }, 0 );
	var doneAlg = algorithms.filter( function( a ) {
		return a.variants.some( function( v ) {
			var impl = getImpl( v.name );
			return impl && impl.hasImpl;
		});
	}).length;
	var doneVariants = 0;
	algorithms.forEach( function( a ) {
		a.variants.forEach( function( v ) {
			var impl = getImpl( v.name );
			if ( impl && impl.hasImpl ) doneVariants++;
		});
	});

	var rows = algorithms.map( algorithmRow ).join( '\n' );
	return '<section class="module-table">\n' +
		'<h2>' + title + ' <span class="count">' + doneAlg + '/' + totalAlg +
		' algorithms (' + doneVariants + '/' + totalVariants + ' routines)</span></h2>\n' +
		'<table>\n<thead><tr>' +
		'<th>Algorithm</th>' +
		'<th>Variants</th>' +
		'<th>Coverage</th>' +
		'<th>Description</th>' +
		'</tr></thead>\n' +
		'<tbody>\n' + rows + '\n</tbody>\n</table>\n</section>\n';
}

// Split algorithms by library
var blasAlgs = db.routines.filter( function( a ) { return a.library === 'BLAS'; } );
var lapackAlgs = db.routines.filter( function( a ) { return a.library === 'LAPACK'; } );

var now = new Date().toISOString().replace( /T.*/, '' );

var html = '<!DOCTYPE html>\n' +
'<html lang="en">\n<head>\n<meta charset="utf-8">\n' +
'<title>Blahpack Progress</title>\n' +
'<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.21/dist/katex.min.css">\n' +
'<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.21/dist/katex.min.js"></script>\n' +
'<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.21/dist/contrib/auto-render.min.js" onload="renderMathInElement(document.body,{delimiters:[{left:\'\\\\(\',right:\'\\\\)\',display:false}]});"></script>\n' +
'<style>\n' +
'* { margin: 0; padding: 0; box-sizing: border-box; }\n' +
'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #f8f9fa; color: #333; padding: 2rem; margin: 0 auto; }\n' +
'h1 { margin-bottom: 0.25rem; }\n' +
'.subtitle { color: #666; margin-bottom: 1.5rem; }\n' +
'.stats { display: flex; gap: 1.5rem; margin-bottom: 2rem; flex-wrap: wrap; }\n' +
'.stat { background: white; border-radius: 8px; padding: 1rem 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }\n' +
'.stat .val { font-size: 1.75rem; font-weight: 700; }\n' +
'.stat .lbl { font-size: 0.8rem; color: #888; }\n' +
'.stat.green .val { color: #16a34a; }\n' +
'section { margin-bottom: 2rem; }\n' +
'h2 { margin-bottom: 0.5rem; }\n' +
'.count { font-weight: 400; color: #888; font-size: 0.9rem; }\n' +
'table { width: 100%; border-collapse: collapse; background: white; border-radius: 6px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08); table-layout: auto; }\n' +
'th { text-align: left; padding: 0.5rem 0.75rem; background: #f1f3f5; font-size: 0.8rem; text-transform: uppercase; color: #666; }\n' +
'td { padding: 0.4rem 0.75rem; border-top: 1px solid #eee; font-size: 0.875rem; }\n' +
'.name { font-family: ui-monospace, monospace; font-weight: 600; white-space: nowrap; }\n' +
'.name a { color: inherit; text-decoration: none; }\n' +
'.name a:hover { text-decoration: underline; }\n' +
'a.variant { text-decoration: none; cursor: pointer; border: 1px solid transparent; }\n' +
'a.variant:hover { border-color: #3b82f6; }\n' +
'tr.vg-hidden { display: none; }\n' +
'.variants-cell { padding: 0.2rem 0.5rem; }\n' +
'.variant-grid { border-collapse: collapse; border: none; box-shadow: none; background: transparent; width: auto; }\n' +
'.variant-grid td { border: none; padding: 1px; }\n' +
'.vg-storage { font-family: ui-monospace, monospace; font-size: 0.7rem; color: #888; text-align: right; padding-right: 4px !important; font-weight: 500; }\n' +
'.variant { display: inline-block; width: 1.5rem; height: 1.3rem; line-height: 1.3rem; text-align: center; font-family: ui-monospace, monospace; font-size: 0.65rem; font-weight: 600; border-radius: 3px; cursor: default; }\n' +
'.variant-done { background: #dcfce7; color: #166534; }\n' +
'.variant-stub { background: #fef9c3; color: #854d0e; }\n' +
'.variant-none { background: #f3f4f6; color: #999; }\n' +
// Coverage tint applied on top of variant-done so per-variant coverage is
// visible without a separate column. Hue: green=>=90%, amber=80-89%,
// red=<80%, light-grey=no coverage data. The base "variant-done" green
// remains for the unknown/no-data case.
'.variant-done.variant-cov-good { background: #bbf7d0; color: #14532d; }\n' +
'.variant-done.variant-cov-warn { background: #fde68a; color: #78350f; }\n' +
'.variant-done.variant-cov-bad { background: #fecaca; color: #7f1d1d; }\n' +
'.variant-done.variant-cov-unknown { background: #dcfce7; color: #166534; }\n' +
'.variant-validated { position: relative; }\n' +
'.vdot { position: absolute; top: 0; right: 0; width: 5px; height: 5px; border-radius: 50%; box-shadow: 0 0 0 1px rgba(255,255,255,0.85); }\n' +
'.vdot-l0, .vdot-l1 { background: #9ca3af; }\n' +
'.vdot-l2 { background: #60a5fa; }\n' +
'.vdot-l3 { background: #6366f1; }\n' +
'.vdot-l4 { background: #7c3aed; }\n' +
'.vlegend-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 4px; vertical-align: middle; }\n' +
'.cov-sample { color: #999; font-weight: 400; font-size: 0.7rem; }\n' +
'.tests { text-align: center; }\n' +
'.desc { color: #555; font-size: 0.8rem; }\n' +
'.badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600; }\n' +
'.badge.done { background: #dcfce7; color: #166534; }\n' +
'.badge.partial { background: #dbeafe; color: #1e40af; }\n' +
'.badge.stub { background: #fef9c3; color: #854d0e; }\n' +
'.badge.none { background: #f3f4f6; color: #9ca3af; }\n' +
'.cov { text-align: center; font-size: 0.8rem; }\n' +
'.cov-good { color: #16a34a; font-weight: 600; }\n' +
'.cov-warn { color: #ca8a04; font-weight: 600; }\n' +
'.cov-bad { color: #dc2626; font-weight: 600; }\n' +
'tr.filter-hidden { display: none !important; }\n' +
// `.controls` is wrapped in `.controls-resizer`, which is the actual
// vertically-resizable box. The wrapper carries `resize: vertical` + a
// fixed `min-height` and `overflow: auto`; controls inside scroll when
// the user drags the wrapper shorter than its content. We use a wrapper
// (instead of `resize: vertical` directly on `.controls`) because the
// inner flex layout interferes with `position: absolute` for the custom
// drag-handle pseudo-element below.
'.controls-resizer { position: relative; margin-bottom: 1.5rem; background: white; border-radius: 8px; padding: 0.75rem 1rem 0.9rem; box-shadow: 0 1px 3px rgba(0,0,0,0.08); resize: vertical; overflow: auto; min-height: 2.5rem; max-height: 70vh; }\n' +
// Custom drag-handle indicator in the bottom-right corner. The browser's
// native `resize: vertical` handle is technically present but very small
// and easy to miss on mobile/touch — these diagonal stripes make the
// affordance obvious. The pseudo-element is `pointer-events: none` so
// the underlying native handle still does the actual resizing.
'.controls-resizer::after { content: ""; position: absolute; right: 4px; bottom: 4px; width: 12px; height: 12px; background-image: linear-gradient(135deg, transparent 0%, transparent 40%, #bbb 40%, #bbb 50%, transparent 50%, transparent 65%, #bbb 65%, #bbb 75%, transparent 75%); pointer-events: none; }\n' +
'.controls { display: flex; flex-wrap: wrap; gap: 1rem; align-items: center; }\n' +
'.toggle { font-size: 0.9rem; cursor: pointer; user-select: none; }\n' +
'.toggle input { margin-right: 0.4rem; cursor: pointer; }\n' +
'.legend { margin-bottom: 1.5rem; background: white; border-radius: 8px; padding: 0.75rem 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.08); font-size: 0.85rem; }\n' +
'.legend summary { cursor: pointer; font-weight: 600; color: #555; }\n' +
'.legend-cols { display: flex; gap: 2rem; margin-top: 0.75rem; flex-wrap: wrap; }\n' +
'.legend-col h4 { font-size: 0.75rem; text-transform: uppercase; color: #888; margin-bottom: 0.25rem; }\n' +
'.legend-table { border: none; box-shadow: none; background: transparent; width: auto; }\n' +
'.legend-table td { border: none; padding: 1px 0.5rem 1px 0; font-size: 0.8rem; }\n' +
'.legend-code { font-family: ui-monospace, monospace; font-weight: 600; color: #333; }\n' +
'.filter-group { display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; }\n' +
'.filter-group input[type="text"] { width: 8rem; padding: 4px 8px; border: 1px solid #ccc; border-radius: 4px; font-family: ui-monospace, monospace; font-size: 0.875rem; }\n' +
'.filter-btns { display: flex; gap: 0.25rem; }\n' +
'.filter-btns button { padding: 3px 10px; border: 1px solid #ccc; border-radius: 4px; background: white; font-size: 0.8rem; cursor: pointer; font-family: ui-monospace, monospace; }\n' +
'.filter-btns button:hover { background: #f1f3f5; }\n' +
'.filter-btns button.active { background: #3b82f6; color: white; border-color: #3b82f6; }\n' +
'</style>\n</head>\n<body>\n' +
'<h1>Blahpack Translation Progress</h1>\n' +
'<p class="subtitle">Fortran BLAS/LAPACK &rarr; JavaScript &mdash; ' + totalRoutines + ' routines across ' + totalAlgorithms + ' algorithms &mdash; generated ' + now + '</p>\n' +
'<div class="stats">\n' +
'<div class="stat green"><div class="val" id="statImpl">' + implementedCount + '/' + totalRoutines + '</div><div class="lbl">Routines Implemented</div></div>\n' +
'<div class="stat"><div class="val" id="statTests">' + totalTests + '</div><div class="lbl">Tests</div></div>\n' +
'<div class="stat" id="statBlas"><div class="val">' + blasImplCount + '/' + blasSourceCount + '</div><div class="lbl">BLAS</div></div>\n' +
'<div class="stat" id="statLapack"><div class="val">' + lapackImplCount + '/' + lapackSourceCount + '</div><div class="lbl">LAPACK</div></div>\n' +
'<div class="stat"><div class="val">' + totalAlgorithms + '</div><div class="lbl">Algorithms</div></div>\n' +
'</div>\n' +
'<details class="legend">\n' +
'<summary>Key: type prefixes &amp; storage codes</summary>\n' +
'<div class="legend-cols">\n' +
'<div class="legend-col">\n' +
'<h4>Type prefixes</h4>\n' +
'<table class="legend-table"><tbody>\n' +
'<tr><td class="legend-code">d</td><td>double-precision real</td></tr>\n' +
'<tr><td class="legend-code">z</td><td>double-precision complex</td></tr>\n' +
'</tbody></table>\n' +
'</div>\n' +
'<div class="legend-col">\n' +
'<h4>Storage codes</h4>\n' +
'<table class="legend-table"><tbody>\n' +
Object.keys( db.meta.storage_codes ).sort().map( function( code ) {
	return '<tr><td class="legend-code">' + code + '</td><td>' + esc( db.meta.storage_codes[ code ] ) + '</td></tr>';
}).join( '\n' ) +
'\n</tbody></table>\n' +
'</div>\n' +
'<div class="legend-col">\n' +
'<h4>Validation</h4>\n' +
'<table class="legend-table"><tbody>\n' +
'<tr><td><span class="vlegend-dot vdot-l2"></span></td><td>L2 property (independent oracle)</td></tr>\n' +
'<tr><td><span class="vlegend-dot vdot-l3"></span></td><td>L3 layout-fuzzed (bit-exact)</td></tr>\n' +
'<tr><td><span class="vlegend-dot vdot-l4"></span></td><td>L4 cross / differential</td></tr>\n' +
'</tbody></table>\n' +
'<div style="font-size:0.7rem;color:#888;margin-top:0.25rem;">corner dot on a variant = property-based validation in place</div>\n' +
'</div>\n' +
'</div>\n' +
'</details>\n' +
'<div class="controls-resizer">\n' +
'<div class="controls">\n' +
'<div class="filter-group">\n' +
'<span>Storage:</span>\n' +
'<div class="filter-btns" id="storageBtns">\n' +
'<button data-storage="" class="active">all</button>\n' +
Object.keys( db.meta.storage_codes ).sort().filter( function( c ) {
	return [ 'ge', 'sy', 'he', 'tr', 'po', 'gb', 'or', 'un', 'la' ].indexOf( c ) >= 0;
}).map( function( c ) {
	return '<button data-storage="' + c + '" title="' + esc( db.meta.storage_codes[ c ] ) + '">' + c + '</button>';
}).join( '\n' ) + '\n' +
'</div>\n' +
'</div>\n' +
'<div class="filter-group">\n' +
'<span>Search:</span>\n' +
'<input type="text" id="searchInput" placeholder="algorithm or routine">\n' +
'</div>\n' +
'</div>\n' +   // /.controls
'</div>\n' +   // /.controls-resizer
sectionHTML( 'BLAS', blasAlgs ) +
sectionHTML( 'LAPACK', lapackAlgs ) +
'<script>\n' +
'(function() {\n' +
'  var searchInput = document.getElementById("searchInput");\n' +
'  var storageBtns = document.querySelectorAll("#storageBtns button");\n' +
'  var activeStorage = "";\n' +
'\n' +
'\n' +
'  function applyFilters() {\n' +
'    var search = searchInput.value.toLowerCase();\n' +
'    var rows = document.querySelectorAll("section.module-table > table > tbody > tr");\n' +
'    rows.forEach(function(row) {\n' +
'      var alg = row.dataset.algorithm || "";\n' +
'      var variants = row.dataset.variants || "";\n' +
'      var storages = (row.dataset.storage || "").split(",");\n' +
'      var matchStorage = !activeStorage || storages.indexOf(activeStorage) >= 0;\n' +
'      var matchSearch = !search || alg.indexOf(search) >= 0 || variants.indexOf(search) >= 0;\n' +
'      row.classList.toggle("filter-hidden", !matchStorage || !matchSearch);\n' +
'      // Also filter variant grid rows within this row\n' +
'      var vgRows = row.querySelectorAll("tr[data-vg-storage]");\n' +
'      vgRows.forEach(function(vgRow) {\n' +
'        var s = vgRow.dataset.vgStorage;\n' +
'        var hideByStorage = activeStorage && s !== activeStorage;\n' +
'        // For search: hide grid rows where no variant name contains the search\n' +
'        var hideBySearch = false;\n' +
'        if (search && matchStorage) {\n' +
'          var chips = vgRow.querySelectorAll("a.variant");\n' +
'          var anyMatch = false;\n' +
'          chips.forEach(function(chip) {\n' +
'            if (chip.id.indexOf(search) >= 0) anyMatch = true;\n' +
'          });\n' +
'          hideBySearch = !anyMatch;\n' +
'        }\n' +
'        vgRow.classList.toggle("vg-hidden", hideByStorage || hideBySearch);\n' +
'      });\n' +
'    });\n' +
'  }\n' +
'\n' +
'  storageBtns.forEach(function(btn) {\n' +
'    btn.addEventListener("click", function() {\n' +
'      storageBtns.forEach(function(b) { b.classList.remove("active"); });\n' +
'      btn.classList.add("active");\n' +
'      activeStorage = btn.dataset.storage;\n' +
'      applyFilters();\n' +
'    });\n' +
'  });\n' +
'\n' +
'  searchInput.addEventListener("input", applyFilters);\n' +
'})();\n' +
'</script>\n' +
'</body>\n</html>\n';

process.stdout.write( html );
