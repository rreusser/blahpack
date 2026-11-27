import __imp0 from './fixtures/upper_4x4.json' with { type: 'json' };
import __imp1 from './fixtures/lower_4x4.json' with { type: 'json' };
import __imp2 from './fixtures/n1.json' with { type: 'json' };
import __imp3 from './fixtures/lower_6x6.json' with { type: 'json' };
import __imp4 from './fixtures/singular_upper.json' with { type: 'json' };
import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zsytf2 from '../lib/ndarray.js';
const fixtures = {
	'upper_4x4': __imp0,
	'lower_4x4': __imp1,
	'n1': __imp2,
	'lower_6x6': __imp3,
	'singular_upper': __imp4
};
function assertClose( actual, expected, tol ) { for ( let ii = 0; ii < expected.length; ii++ ) { if ( !( Math.abs( actual[ii] - expected[ii] ) <= tol * ( 1.0 + Math.abs( expected[ii] ) ) ) ) { assert.fail( 'at ' + ii + ': ' + actual[ii] + ' vs ' + expected[ii] ); } } }
function convertIPIV( f ) { const r = new Int32Array(f.length); for ( let ii = 0; ii < f.length; ii++ ) { r[ii] = f[ii] > 0 ? f[ii] - 1 : ~(-f[ii]-1); } return r; }
function buildMatrix( n, LDA, vals ) { const A = new Complex128Array(LDA*n); const Av = reinterpret(A,0); for(let k=0;k<vals.length;k++){const v=vals[k];const idx=2*v.i+2*LDA*v.j;Av[idx]=v.re;Av[idx+1]=v.im;} return A; }
function extractA( A, n, LDA ) { const Av = reinterpret(A,0); const r=[]; for(let j=0;j<n;j++)for(let idx=0;idx<2*LDA;idx++)r.push(Av[j*2*LDA+idx]); return r; }
test( 'zsytf2: upper 4x4', function t() { const fix = fixtures.upper_4x4; const n = fix.n; const LDA = 6; const A = buildMatrix(n,LDA,[{i:0,j:0,re:2,im:1},{i:0,j:1,re:1,im:2},{i:0,j:2,re:3,im:-1},{i:0,j:3,re:0.5,im:0.5},{i:1,j:1,re:5,im:-1},{i:1,j:2,re:2,im:1},{i:1,j:3,re:1,im:-2},{i:2,j:2,re:4,im:2},{i:2,j:3,re:3,im:0},{i:3,j:3,re:6,im:-3}]); const IPIV = new Int32Array(n); const info = zsytf2('upper',n,A,1,LDA,0,IPIV,1,0); assert.equal(info,fix.info); assertClose(extractA(A,n,LDA),fix.A,1e-13); const e = convertIPIV(fix.ipiv); for(let k=0;k<n;k++) assert.equal(IPIV[k],e[k]); });
test( 'zsytf2: lower 4x4', function t() { const fix = fixtures.lower_4x4; const n = fix.n; const LDA = 6; const A = buildMatrix(n,LDA,[{i:0,j:0,re:2,im:1},{i:1,j:0,re:1,im:2},{i:1,j:1,re:5,im:-1},{i:2,j:0,re:3,im:-1},{i:2,j:1,re:2,im:1},{i:2,j:2,re:4,im:2},{i:3,j:0,re:0.5,im:0.5},{i:3,j:1,re:1,im:-2},{i:3,j:2,re:3,im:0},{i:3,j:3,re:6,im:-3}]); const IPIV = new Int32Array(n); const info = zsytf2('lower',n,A,1,LDA,0,IPIV,1,0); assert.equal(info,fix.info); assertClose(extractA(A,n,LDA),fix.A,1e-13); const e = convertIPIV(fix.ipiv); for(let k=0;k<n;k++) assert.equal(IPIV[k],e[k]); });
test( 'zsytf2: N=0', function t() { assert.equal(zsytf2('upper',0,new Complex128Array(1),1,1,0,new Int32Array(1),1,0),0); });
test( 'zsytf2: N=1', function t() { const fix = fixtures.n1; const A = new Complex128Array(1); const Av = reinterpret(A,0); Av[0]=3;Av[1]=2; const IPIV = new Int32Array(1); assert.equal(zsytf2('upper',1,A,1,1,0,IPIV,1,0),fix.info); assertClose(Array.from(Av),fix.A,1e-14); });
test( 'zsytf2: lower 6x6', function t() { const fix = fixtures.lower_6x6; const n = fix.n; const LDA = 6; const A = buildMatrix(n,LDA,[{i:0,j:0,re:0.01,im:0},{i:1,j:0,re:5,im:1},{i:1,j:1,re:0.02,im:0},{i:2,j:0,re:1,im:-1},{i:2,j:1,re:2,im:1},{i:2,j:2,re:8,im:-2},{i:3,j:0,re:0.5,im:0.5},{i:3,j:1,re:1,im:-1},{i:3,j:2,re:3,im:0},{i:3,j:3,re:7,im:1},{i:4,j:0,re:2,im:0},{i:4,j:1,re:1.5,im:0.5},{i:4,j:2,re:0,im:2},{i:4,j:3,re:1,im:-0.5},{i:4,j:4,re:6,im:0},{i:5,j:0,re:1,im:1},{i:5,j:1,re:0,im:3},{i:5,j:2,re:1,im:0},{i:5,j:3,re:2,im:2},{i:5,j:4,re:0.5,im:-1},{i:5,j:5,re:5,im:-1}]); const IPIV = new Int32Array(n); const info = zsytf2('lower',n,A,1,LDA,0,IPIV,1,0); assert.equal(info,fix.info); assertClose(extractA(A,n,LDA),fix.A,1e-13); const e = convertIPIV(fix.ipiv); for(let k=0;k<n;k++) assert.equal(IPIV[k],e[k]); });
test( 'zsytf2: upper 6x6 2x2', function t() { const n = 6; const LDA = n; const A = buildMatrix(n,LDA,[{i:0,j:0,re:5,im:-1},{i:0,j:1,re:0.5,im:-1},{i:1,j:1,re:6,im:0},{i:0,j:2,re:1,im:-0.5},{i:1,j:2,re:0,im:2},{i:2,j:2,re:7,im:1},{i:0,j:3,re:2,im:2},{i:1,j:3,re:1,im:0},{i:2,j:3,re:3,im:0},{i:3,j:3,re:8,im:-2},{i:0,j:4,re:0,im:3},{i:1,j:4,re:1.5,im:0.5},{i:2,j:4,re:2,im:1},{i:3,j:4,re:1,im:-1},{i:4,j:4,re:0.02,im:0},{i:0,j:5,re:1,im:1},{i:1,j:5,re:2,im:0},{i:2,j:5,re:1,im:-1},{i:3,j:5,re:0.5,im:0.5},{i:4,j:5,re:5,im:1},{i:5,j:5,re:0.01,im:0}]); const IPIV = new Int32Array(n); assert.equal(zsytf2('upper',n,A,1,LDA,0,IPIV,1,0),0); let h=false;for(let k=0;k<n;k++)if(IPIV[k]<0){h=true;break;} assert.ok(h); });
test( 'zsytf2: singular', function t() { const fix = fixtures.singular_upper; const A = buildMatrix(3,6,[{i:0,j:0,re:0,im:0},{i:0,j:1,re:1,im:1},{i:0,j:2,re:2,im:0},{i:1,j:1,re:3,im:-1},{i:1,j:2,re:1,im:1},{i:2,j:2,re:2,im:2}]); assert.equal(zsytf2('upper',3,A,1,6,0,new Int32Array(3),1,0),fix.info); });

test( 'zsytf2: upper 2x2 pivot found when the row maximum lies in column k (A = [[0,1],[1,0]])', function t() {
	// The upper path searched row IMAX over K-IMAX-1 entries instead of
	// K-IMAX, so it never saw A(IMAX,K): for this matrix ROWMAX was the zero
	// diagonal, a 1x1 pivot on 0 was chosen, and the factor was NaN.
	const A = new Complex128Array( [ 0, 0, 1, 0, 1, 0, 0, 0 ] );
	const IPIV = new Int32Array( 2 );
	const info = zsytf2( 'upper', 2, A, 1, 2, 0, IPIV, 1, 0 );
	assert.strictEqual( info, 0, 'info' );
	assert.deepStrictEqual( Array.from( IPIV ), [ -1, -1 ], 'one 2x2 pivot' );
	assert.deepStrictEqual( Array.from( reinterpret( A, 0 ) ), [ 0, 0, 1, 0, 1, 0, 0, 0 ], 'D is A itself' );
});


// PROPERTY-BASED TESTS //

/**
* Returns a deterministic pseudo-random number generator (LCG) returning values in `[0,1)`.
*
* @private
* @param {integer} seed - seed
* @returns {Function} generator
*/
function lcg( seed ) {
	let s = seed >>> 0;
	return function next() {
		s = ( ( Math.imul( s, 1664525 ) + 1013904223 ) >>> 0 );
		return s / 4294967296;
	};
}

/**
* Returns an `N`-by-`N` zero complex matrix (array of rows of `[re,im]` pairs).
*
* @private
* @param {integer} N - order
* @returns {Array} matrix
*/
function zeros( N ) {
	const M = [];
	let i;
	let j;
	for ( i = 0; i < N; i++ ) {
		M.push( [] );
		for ( j = 0; j < N; j++ ) {
			M[ i ].push( [ 0.0, 0.0 ] );
		}
	}
	return M;
}

/**
* Swaps rows and columns `i` and `j` of a dense complex matrix.
*
* @private
* @param {Array} M - matrix
* @param {integer} i - first index
* @param {integer} j - second index
*/
function symSwap( M, i, j ) {
	let tmp;
	let r;
	if ( i === j ) {
		return;
	}
	tmp = M[ i ];
	M[ i ] = M[ j ];
	M[ j ] = tmp;
	for ( r = 0; r < M.length; r++ ) {
		tmp = M[ r ][ i ];
		M[ r ][ i ] = M[ r ][ j ];
		M[ r ][ j ] = tmp;
	}
}

/**
* Computes `X * M * X^T` (plain transpose: complex symmetric) where `X` is the identity except for the multipliers in columns `cols`, rows `rows`.
*
* @private
* @param {Array} M - matrix (modified in place)
* @param {Function} get - accessor `get(i,j)` returning `[re,im]` of the factored matrix
* @param {Array} cols - block column indices
* @param {Array} rows - row indices holding the multipliers
*/
function applyBlock( M, get, cols, rows ) {
	const N = M.length;
	const X = zeros( N );
	const T = zeros( N );
	let sr;
	let si;
	let a;
	let b;
	let i;
	let j;
	let l;
	for ( i = 0; i < N; i++ ) {
		X[ i ][ i ] = [ 1.0, 0.0 ];
	}
	for ( l = 0; l < cols.length; l++ ) {
		for ( i = 0; i < rows.length; i++ ) {
			X[ rows[ i ] ][ cols[ l ] ] = get( rows[ i ], cols[ l ] );
		}
	}
	for ( i = 0; i < N; i++ ) {
		for ( j = 0; j < N; j++ ) {
			sr = 0.0;
			si = 0.0;
			for ( l = 0; l < N; l++ ) {
				a = X[ i ][ l ];
				b = M[ l ][ j ];
				sr += ( a[ 0 ] * b[ 0 ] ) - ( a[ 1 ] * b[ 1 ] );
				si += ( a[ 0 ] * b[ 1 ] ) + ( a[ 1 ] * b[ 0 ] );
			}
			T[ i ][ j ] = [ sr, si ];
		}
	}
	for ( i = 0; i < N; i++ ) {
		for ( j = 0; j < N; j++ ) {
			sr = 0.0;
			si = 0.0;
			for ( l = 0; l < N; l++ ) {
				a = T[ i ][ l ];
				b = X[ j ][ l ];
				sr += ( a[ 0 ] * b[ 0 ] ) - ( a[ 1 ] * b[ 1 ] );
				si += ( a[ 0 ] * b[ 1 ] ) + ( a[ 1 ] * b[ 0 ] );
			}
			M[ i ][ j ] = [ sr, si ];
		}
	}
}

/**
* Reconstructs `P*U*D*U^T*P^T` (or the `L` analogue) from the output of `zsytf2` (column-major, leading dimension `N`), validating the Bunch-Kaufman IPIV encoding along the way.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {integer} N - order
* @param {Complex128Array} F - factored matrix
* @param {Int32Array} ipiv - pivot indices
* @returns {Object} reconstructed matrix and blocks
*/
function reconstruct( uplo, N, F, ipiv ) {
	const Fv = reinterpret( F, 0 );
	const blocks = [];
	const M = zeros( N );
	let rows;
	let off;
	let b;
	let c;
	let i;
	let k;
	function get( r, col ) {
		return [ Fv[ 2 * ( r + ( col * N ) ) ], Fv[ ( 2 * ( r + ( col * N ) ) ) + 1 ] ];
	}
	if ( uplo === 'upper' ) {
		k = N - 1;
		while ( k >= 0 ) {
			if ( ipiv[ k ] >= 0 ) {
				assert.ok( ipiv[ k ] <= k, 'ipiv[' + k + '] in range' );
				blocks.push( [ k ] );
				k -= 1;
			} else {
				assert.ok( k > 0, 'ipiv 2x2 at ' + k );
				assert.equal( ipiv[ k - 1 ], ipiv[ k ], 'ipiv 2x2 pair equal at ' + k );
				assert.ok( ~ipiv[ k ] <= k - 1, 'ipiv 2x2 range at ' + k );
				blocks.push( [ k - 1, k ] );
				k -= 2;
			}
		}
	} else {
		k = 0;
		while ( k < N ) {
			if ( ipiv[ k ] >= 0 ) {
				assert.ok( ipiv[ k ] >= k && ipiv[ k ] < N, 'ipiv[' + k + '] in range' );
				blocks.push( [ k ] );
				k += 1;
			} else {
				assert.ok( k < N - 1, 'ipiv 2x2 at ' + k );
				assert.equal( ipiv[ k + 1 ], ipiv[ k ], 'ipiv 2x2 pair equal at ' + k );
				assert.ok( ~ipiv[ k ] >= k + 1 && ~ipiv[ k ] < N, 'ipiv 2x2 range at ' + k );
				blocks.push( [ k, k + 1 ] );
				k += 2;
			}
		}
	}
	for ( b = 0; b < blocks.length; b++ ) {
		c = blocks[ b ];
		M[ c[ 0 ] ][ c[ 0 ] ] = get( c[ 0 ], c[ 0 ] );
		if ( c.length === 2 ) {
			M[ c[ 1 ] ][ c[ 1 ] ] = get( c[ 1 ], c[ 1 ] );
			off = ( uplo === 'upper' ) ? get( c[ 0 ], c[ 1 ] ) : get( c[ 1 ], c[ 0 ] );
			M[ c[ 0 ] ][ c[ 1 ] ] = off;
			M[ c[ 1 ] ][ c[ 0 ] ] = off.slice();
		}
	}
	for ( b = blocks.length - 1; b >= 0; b-- ) {
		c = blocks[ b ];
		rows = [];
		if ( uplo === 'upper' ) {
			for ( i = 0; i < c[ 0 ]; i++ ) {
				rows.push( i );
			}
		} else {
			for ( i = c[ c.length - 1 ] + 1; i < N; i++ ) {
				rows.push( i );
			}
		}
		applyBlock( M, get, c, rows );
		if ( c.length === 1 ) {
			symSwap( M, c[ 0 ], ipiv[ c[ 0 ] ] );
		} else if ( uplo === 'upper' ) {
			// Bunch-Kaufman 2x2 (upper): rows/columns k-1 and kp were interchanged.
			symSwap( M, c[ 0 ], ~ipiv[ c[ 0 ] ] );
		} else {
			// Bunch-Kaufman 2x2 (lower): rows/columns k+1 and kp were interchanged.
			symSwap( M, c[ 1 ], ~ipiv[ c[ 1 ] ] );
		}
	}
	return {
		'M': M,
		'blocks': blocks
	};
}

/**
* Factors the complex symmetric matrix `S` with `zsytf2` and asserts that the factors reconstruct `S`.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {Array} S - full complex symmetric matrix (rows of `[re,im]`)
* @param {number} tol - relative tolerance
* @param {string} msg - message
* @returns {Object} factorization output (`info`, `ipiv`, `A`, `blocks`)
*/
function factorAndCheck( uplo, S, tol, msg ) {
	const N = S.length;
	const A = new Complex128Array( N * N );
	const Av = reinterpret( A, 0 );
	const ipiv = new Int32Array( N );
	let anorm = 0.0;
	let info;
	let rec;
	let p;
	let i;
	let j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			p = 2 * ( i + ( j * N ) );
			anorm = Math.max( anorm, Math.abs( S[ i ][ j ][ 0 ] ) + Math.abs( S[ i ][ j ][ 1 ] ) );
			if ( ( uplo === 'upper' && i <= j ) || ( uplo === 'lower' && i >= j ) ) {
				Av[ p ] = S[ i ][ j ][ 0 ];
				Av[ p + 1 ] = S[ i ][ j ][ 1 ];
			} else {
				// Poison the unreferenced triangle:
				Av[ p ] = NaN;
				Av[ p + 1 ] = NaN;
			}
		}
	}
	info = zsytf2( uplo, N, A, 1, N, 0, ipiv, 1, 0 );
	rec = reconstruct( uplo, N, A, ipiv );
	for ( i = 0; i < N; i++ ) {
		for ( j = 0; j < N; j++ ) {
			assert.ok( Math.abs( rec.M[ i ][ j ][ 0 ] - S[ i ][ j ][ 0 ] ) + Math.abs( rec.M[ i ][ j ][ 1 ] - S[ i ][ j ][ 1 ] ) <= tol * anorm, msg + ': reconstruction (' + i + ',' + j + '): expected ' + S[ i ][ j ] + ', got ' + rec.M[ i ][ j ] );
		}
	}
	return {
		'info': info,
		'ipiv': ipiv,
		'A': A,
		'blocks': rec.blocks
	};
}

/**
* Generates a random complex symmetric matrix with a weak diagonal and widely varying off-diagonal magnitudes (forces interchanges and 2x2 pivots).
*
* @private
* @param {integer} N - order
* @param {Function} rand - generator
* @returns {Array} matrix
*/
function weakDiagonal( N, rand ) {
	const S = zeros( N );
	let scale;
	let v;
	let i;
	let j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i <= j; i++ ) {
			scale = Math.pow( 10.0, ( 4.0 * rand() ) - 2.0 );
			if ( i === j ) {
				scale *= 0.01;
			}
			v = [ ( ( 2.0 * rand() ) - 1.0 ) * scale, ( ( 2.0 * rand() ) - 1.0 ) * scale ];
			S[ i ][ j ] = v;
			S[ j ][ i ] = v.slice();
		}
	}
	return S;
}

test( 'zsytf2: random weak-diagonal complex symmetric matrices reconstruct A = P*U*D*U^T*P^T and A = P*L*D*L^T*P^T (both uplo)', function t() {
	const counts = {
		'upper': [ 0, 0, 0 ],
		'lower': [ 0, 0, 0 ]
	};
	let rand;
	let out;
	let uplo;
	let seed;
	let N;
	let S;
	let b;
	let c;
	for ( seed = 1; seed <= 60; seed++ ) {
		rand = lcg( seed );
		N = 2 + ( seed % 7 );
		S = weakDiagonal( N, rand );
		for ( uplo of [ 'upper', 'lower' ] ) {
			out = factorAndCheck( uplo, S, 1e-11, 'seed ' + seed + ' ' + uplo );
			assert.equal( out.info, 0, 'info' );
			for ( b = 0; b < out.blocks.length; b++ ) {
				c = out.blocks[ b ];
				if ( c.length === 2 ) {
					counts[ uplo ][ 2 ] += 1;
				} else if ( out.ipiv[ c[ 0 ] ] === c[ 0 ] ) {
					counts[ uplo ][ 0 ] += 1;
				} else {
					counts[ uplo ][ 1 ] += 1;
				}
			}
		}
	}
	// 1x1 without interchange, 1x1 with interchange, and 2x2 pivots must all occur in both triangles:
	assert.ok( counts.upper[ 0 ] > 0 && counts.upper[ 1 ] > 0 && counts.upper[ 2 ] > 0, 'upper pivot mix ' + counts.upper );
	assert.ok( counts.lower[ 0 ] > 0 && counts.lower[ 1 ] > 0 && counts.lower[ 2 ] > 0, 'lower pivot mix ' + counts.lower );
});

test( 'zsytf2: zero column sets info to the first zero column (1-based) and the factorization still reconstructs A', function t() {
	const S = [
		[ [ 4.0, 1.0 ], [ 0.0, 0.0 ], [ 1.0, -1.0 ], [ 2.0, 0.5 ] ],
		[ [ 0.0, 0.0 ], [ 0.0, 0.0 ], [ 0.0, 0.0 ], [ 0.0, 0.0 ] ],
		[ [ 1.0, -1.0 ], [ 0.0, 0.0 ], [ 3.0, 2.0 ], [ 0.5, 0.0 ] ],
		[ [ 2.0, 0.5 ], [ 0.0, 0.0 ], [ 0.5, 0.0 ], [ 0.0, 1.0 ] ]
	];
	let out = factorAndCheck( 'lower', S, 1e-14, 'zero col lower' );
	assert.equal( out.info, 2, 'info lower' );
	assert.equal( out.ipiv[ 1 ], 1, 'ipiv lower (zero column: kp = k)' );
	out = factorAndCheck( 'upper', S, 1e-14, 'zero col upper' );
	assert.equal( out.info, 2, 'info upper' );
	assert.equal( out.ipiv[ 1 ], 1, 'ipiv upper (zero column: kp = k)' );
});

test( 'zsytf2: NaN diagonal sets info to that column (1-based), as the reference DISNAN check does', function t() {
	let IPIV;
	let info;
	let Av;
	let A;
	let uplo;
	for ( uplo of [ 'upper', 'lower' ] ) {
		// A = diag(2, NaN, 3):
		A = new Complex128Array( 9 );
		Av = reinterpret( A, 0 );
		Av[ 0 ] = 2.0;
		Av[ 8 ] = NaN;
		Av[ 16 ] = 3.0;
		IPIV = new Int32Array( 3 );
		info = zsytf2( uplo, 3, A, 1, 3, 0, IPIV, 1, 0 );
		assert.equal( info, 2, uplo + ': info' );
		assert.deepStrictEqual( Array.from( IPIV ), [ 0, 1, 2 ], uplo + ': ipiv' );
		assert.ok( Number.isNaN( Av[ 8 ] ), uplo + ': NaN pivot kept in D' );
		assert.equal( Av[ 0 ], 2.0, uplo + ': d(0)' );
		assert.equal( Av[ 16 ], 3.0, uplo + ': d(2)' );
	}
});

test( 'zsytf2: lower 2x2 pivot whose 1/(D11*D22-1) has a dominant imaginary part reconstructs A', function t() {
	// Leading 2x2 block [a d; d b] with cabs1(a), cabs1(b) just below ALPHA*cabs1(d) forces a 2x2 pivot at k=0; the phases make D11*D22-1 ~ -0.32+0.36i.
	const S = [
		[ [ 0.0, 0.877 ], [ -0.517, 0.856 ], [ 0.01, 0.0 ] ],
		[ [ -0.517, 0.856 ], [ -0.873, 0.0 ], [ 0.0, 0.01 ] ],
		[ [ 0.01, 0.0 ], [ 0.0, 0.01 ], [ 1.0, 0.5 ] ]
	];
	const out = factorAndCheck( 'lower', S, 1e-13, 'imaginary-dominant T' );
	assert.equal( out.info, 0, 'info' );
	assert.deepStrictEqual( Array.from( out.ipiv ), [ -2, -2, 2 ], 'ipiv: 2x2 block at (0,1) without interchange, then 1x1' );
});
