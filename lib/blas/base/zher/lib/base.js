/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the BLAS 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params, max-statements, max-lines-per-function, max-lines */

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';


// MAIN //

/**
* Perform Hermitian rank-1 update:.
* `A := alpha*x*x^H + A`
* where A is an N-by-N Hermitian matrix, x is an N-element vector,
* and alpha is a real scalar.
*
* ## Method
*
* The kernel picks whichever traversal of the stored triangle walks A's
* smaller-stride dimension in the inner loop and register-blocks the other
* dimension four wide:
*
* -   **column form** (four columns per pass, hoisted `alpha*conj(x[j+k])`)
*     when the first dimension has the smaller stride;
* -   **row form** (four rows per pass, hoisted `x[i+k]`) otherwise.
*
* Because `alpha` is real, the per-column temporary is the cheap
* `alpha*conj(x[j])` and every element receives exactly the reference update
* `x[i] * (alpha*conj(x[j]))` — real part `xr*tr - xi*ti`, imaginary part
* `xr*ti + xi*tr` — with the reference `x[j] !== 0` column guard preserved.
* Because each `A[i,j]` is written at most once (no summation is reordered),
* the kernel is verified bit-identically against the reference variant
* (`bench/zher-opt/check.mjs`).
*
* The diagonal is real by construction: the reference stores `DBLE(...)` in
* the real part and zeros the imaginary part unconditionally (even for a zero
* column). This kernel reproduces that exactly — every stored diagonal has its
* imaginary part written to `0.0`, and its real part receives the reference
* update only when the column pivot is nonzero. Only the stored triangle is
* read or written.
*
* @private
* @param {string} uplo - specifies whether the upper ('upper') or lower ('lower') triangle is stored
* @param {NonNegativeInteger} N - order of the matrix A
* @param {number} alpha - real scalar
* @param {Complex128Array} x - complex input vector
* @param {integer} strideX - stride for x (in complex elements)
* @param {NonNegativeInteger} offsetX - starting index for x (in complex elements)
* @param {Complex128Array} A - Hermitian matrix (updated in place)
* @param {integer} strideA1 - stride of the first dimension of A (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (in complex elements)
* @returns {Complex128Array} `A`
*/
function zher( uplo, N, alpha, x, strideX, offsetX, A, strideA1, strideA2, offsetA ) {
	let upper, base, sa1, sa2, Av, xv, oA, oX, sx, nz0, nz1, nz2, nz3, p0r, p0i;
	let p1r, p1i, p2r, p2i, p3r, p3i, tr0, ti0, tr1, ti1, tr2, ti2, tr3, ti3;
	let trc, tic, xr, xi, cr, ci, a0, a1, a2, a3, ac, jx, ix, ai, d, i, j, c;

	if ( N === 0 || alpha === 0.0 ) {
		return A;
	}

	upper = ( uplo === 'upper' );
	Av = reinterpret( A, 0 );
	xv = reinterpret( x, 0 );

	oA = offsetA * 2;
	oX = offsetX * 2;
	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	sx = strideX * 2;
	const n4 = N - ( N % 4 );

	if ( Math.abs( sa1 ) <= Math.abs( sa2 ) ) {
		// Column form: inner loop over rows (stride `sa1`), four columns per pass.
		jx = oX;
		for ( j = 0; j < n4; j += 4 ) {
			p0r = xv[ jx ];
			p0i = xv[ jx + 1 ];
			p1r = xv[ jx + sx ];
			p1i = xv[ jx + sx + 1 ];
			p2r = xv[ jx + ( 2 * sx ) ];
			p2i = xv[ jx + ( 2 * sx ) + 1 ];
			p3r = xv[ jx + ( 3 * sx ) ];
			p3i = xv[ jx + ( 3 * sx ) + 1 ];
			nz0 = ( p0r !== 0.0 || p0i !== 0.0 );
			nz1 = ( p1r !== 0.0 || p1i !== 0.0 );
			nz2 = ( p2r !== 0.0 || p2i !== 0.0 );
			nz3 = ( p3r !== 0.0 || p3i !== 0.0 );
			if ( nz0 && nz1 && nz2 && nz3 ) {
				// temp_k = alpha * conj(x[j+k])
				tr0 = alpha * p0r;
				ti0 = -( alpha * p0i );
				tr1 = alpha * p1r;
				ti1 = -( alpha * p1i );
				tr2 = alpha * p2r;
				ti2 = -( alpha * p2i );
				tr3 = alpha * p3r;
				ti3 = -( alpha * p3i );
				if ( upper ) {
					// Rectangular bulk: rows 0..j-1 (off-diagonal for all four columns)
					a0 = oA + ( j * sa2 );
					a1 = a0 + sa2;
					a2 = a1 + sa2;
					a3 = a2 + sa2;
					ix = oX;
					for ( i = 0; i < j; i++ ) {
						xr = xv[ ix ];
						xi = xv[ ix + 1 ];
						Av[ a0 ] += ( xr * tr0 ) - ( xi * ti0 );
						Av[ a0 + 1 ] += ( xr * ti0 ) + ( xi * tr0 );
						Av[ a1 ] += ( xr * tr1 ) - ( xi * ti1 );
						Av[ a1 + 1 ] += ( xr * ti1 ) + ( xi * tr1 );
						Av[ a2 ] += ( xr * tr2 ) - ( xi * ti2 );
						Av[ a2 + 1 ] += ( xr * ti2 ) + ( xi * tr2 );
						Av[ a3 ] += ( xr * tr3 ) - ( xi * ti3 );
						Av[ a3 + 1 ] += ( xr * ti3 ) + ( xi * tr3 );
						a0 += sa1;
						a1 += sa1;
						a2 += sa1;
						a3 += sa1;
						ix += sx;
					}
					// Upper 4x4 diagonal corner (rows j..j+3, cols j..j+3):
					base = oA + ( j * sa1 ) + ( j * sa2 );
					// col j: diagonal (j,j)
					Av[ base ] += ( p0r * tr0 ) - ( p0i * ti0 );
					Av[ base + 1 ] = 0.0;
					// col j+1: (j,j+1) then diagonal (j+1,j+1)
					ac = base + sa2;
					Av[ ac ] += ( p0r * tr1 ) - ( p0i * ti1 );
					Av[ ac + 1 ] += ( p0r * ti1 ) + ( p0i * tr1 );
					d = ac + sa1;
					Av[ d ] += ( p1r * tr1 ) - ( p1i * ti1 );
					Av[ d + 1 ] = 0.0;
					// col j+2: (j,j+2),(j+1,j+2) then diagonal (j+2,j+2)
					ac = base + ( 2 * sa2 );
					Av[ ac ] += ( p0r * tr2 ) - ( p0i * ti2 );
					Av[ ac + 1 ] += ( p0r * ti2 ) + ( p0i * tr2 );
					ac += sa1;
					Av[ ac ] += ( p1r * tr2 ) - ( p1i * ti2 );
					Av[ ac + 1 ] += ( p1r * ti2 ) + ( p1i * tr2 );
					d = ac + sa1;
					Av[ d ] += ( p2r * tr2 ) - ( p2i * ti2 );
					Av[ d + 1 ] = 0.0;
					// col j+3: (j,j+3),(j+1,j+3),(j+2,j+3) then diagonal (j+3,j+3)
					ac = base + ( 3 * sa2 );
					Av[ ac ] += ( p0r * tr3 ) - ( p0i * ti3 );
					Av[ ac + 1 ] += ( p0r * ti3 ) + ( p0i * tr3 );
					ac += sa1;
					Av[ ac ] += ( p1r * tr3 ) - ( p1i * ti3 );
					Av[ ac + 1 ] += ( p1r * ti3 ) + ( p1i * tr3 );
					ac += sa1;
					Av[ ac ] += ( p2r * tr3 ) - ( p2i * ti3 );
					Av[ ac + 1 ] += ( p2r * ti3 ) + ( p2i * tr3 );
					d = ac + sa1;
					Av[ d ] += ( p3r * tr3 ) - ( p3i * ti3 );
					Av[ d + 1 ] = 0.0;
				} else {
					// Lower 4x4 diagonal corner (rows j..j+3, cols j..j+3):
					base = oA + ( j * sa1 ) + ( j * sa2 );
					// col j: diagonal (j,j) then (j+1,j),(j+2,j),(j+3,j)
					Av[ base ] += ( p0r * tr0 ) - ( p0i * ti0 );
					Av[ base + 1 ] = 0.0;
					ac = base + sa1;
					Av[ ac ] += ( p1r * tr0 ) - ( p1i * ti0 );
					Av[ ac + 1 ] += ( p1r * ti0 ) + ( p1i * tr0 );
					ac += sa1;
					Av[ ac ] += ( p2r * tr0 ) - ( p2i * ti0 );
					Av[ ac + 1 ] += ( p2r * ti0 ) + ( p2i * tr0 );
					ac += sa1;
					Av[ ac ] += ( p3r * tr0 ) - ( p3i * ti0 );
					Av[ ac + 1 ] += ( p3r * ti0 ) + ( p3i * tr0 );
					// col j+1: diagonal (j+1,j+1) then (j+2,j+1),(j+3,j+1)
					d = base + sa2 + sa1;
					Av[ d ] += ( p1r * tr1 ) - ( p1i * ti1 );
					Av[ d + 1 ] = 0.0;
					ac = d + sa1;
					Av[ ac ] += ( p2r * tr1 ) - ( p2i * ti1 );
					Av[ ac + 1 ] += ( p2r * ti1 ) + ( p2i * tr1 );
					ac += sa1;
					Av[ ac ] += ( p3r * tr1 ) - ( p3i * ti1 );
					Av[ ac + 1 ] += ( p3r * ti1 ) + ( p3i * tr1 );
					// col j+2: diagonal (j+2,j+2) then (j+3,j+2)
					d = base + ( 2 * sa2 ) + ( 2 * sa1 );
					Av[ d ] += ( p2r * tr2 ) - ( p2i * ti2 );
					Av[ d + 1 ] = 0.0;
					ac = d + sa1;
					Av[ ac ] += ( p3r * tr2 ) - ( p3i * ti2 );
					Av[ ac + 1 ] += ( p3r * ti2 ) + ( p3i * tr2 );
					// col j+3: diagonal (j+3,j+3)
					d = base + ( 3 * sa2 ) + ( 3 * sa1 );
					Av[ d ] += ( p3r * tr3 ) - ( p3i * ti3 );
					Av[ d + 1 ] = 0.0;
					// Rectangular bulk: rows j+4..N-1 (off-diagonal for all four columns)
					a0 = oA + ( j * sa2 ) + ( ( j + 4 ) * sa1 );
					a1 = a0 + sa2;
					a2 = a1 + sa2;
					a3 = a2 + sa2;
					ix = jx + ( 4 * sx );
					for ( i = j + 4; i < N; i++ ) {
						xr = xv[ ix ];
						xi = xv[ ix + 1 ];
						Av[ a0 ] += ( xr * tr0 ) - ( xi * ti0 );
						Av[ a0 + 1 ] += ( xr * ti0 ) + ( xi * tr0 );
						Av[ a1 ] += ( xr * tr1 ) - ( xi * ti1 );
						Av[ a1 + 1 ] += ( xr * ti1 ) + ( xi * tr1 );
						Av[ a2 ] += ( xr * tr2 ) - ( xi * ti2 );
						Av[ a2 + 1 ] += ( xr * ti2 ) + ( xi * tr2 );
						Av[ a3 ] += ( xr * tr3 ) - ( xi * ti3 );
						Av[ a3 + 1 ] += ( xr * ti3 ) + ( xi * tr3 );
						a0 += sa1;
						a1 += sa1;
						a2 += sa1;
						a3 += sa1;
						ix += sx;
					}
				}
			} else {
				// One or more zero pivots in the block: reference-style scalar columns
				colScalar( j, j + 4 );
			}
			jx += 4 * sx;
		}
		// Remainder columns: reference-style scalar
		colScalar( n4, N );
	} else {
		// Row form: inner loop over columns (stride `sa2`), four rows per pass.
		ix = oX;
		for ( i = 0; i < n4; i += 4 ) {
			p0r = xv[ ix ];
			p0i = xv[ ix + 1 ];
			p1r = xv[ ix + sx ];
			p1i = xv[ ix + sx + 1 ];
			p2r = xv[ ix + ( 2 * sx ) ];
			p2i = xv[ ix + ( 2 * sx ) + 1 ];
			p3r = xv[ ix + ( 3 * sx ) ];
			p3i = xv[ ix + ( 3 * sx ) + 1 ];
			nz0 = ( p0r !== 0.0 || p0i !== 0.0 );
			nz1 = ( p1r !== 0.0 || p1i !== 0.0 );
			nz2 = ( p2r !== 0.0 || p2i !== 0.0 );
			nz3 = ( p3r !== 0.0 || p3i !== 0.0 );
			tr0 = alpha * p0r;
			ti0 = -( alpha * p0i );
			tr1 = alpha * p1r;
			ti1 = -( alpha * p1i );
			tr2 = alpha * p2r;
			ti2 = -( alpha * p2i );
			tr3 = alpha * p3r;
			ti3 = -( alpha * p3i );
			base = oA + ( i * sa1 ) + ( i * sa2 );
			if ( upper ) {
				// Upper 4x4 diagonal corner (rows i..i+3, cols i..i+3):
				// col i: diagonal (i,i)
				Av[ base + 1 ] = 0.0;
				if ( nz0 ) {
					Av[ base ] += ( p0r * tr0 ) - ( p0i * ti0 );
				}
				// col i+1: (i,i+1) then diagonal (i+1,i+1)
				ac = base + sa2;
				if ( nz1 ) {
					Av[ ac ] += ( p0r * tr1 ) - ( p0i * ti1 );
					Av[ ac + 1 ] += ( p0r * ti1 ) + ( p0i * tr1 );
				}
				d = ac + sa1;
				Av[ d + 1 ] = 0.0;
				if ( nz1 ) {
					Av[ d ] += ( p1r * tr1 ) - ( p1i * ti1 );
				}
				// col i+2: (i,i+2),(i+1,i+2) then diagonal (i+2,i+2)
				ac = base + ( 2 * sa2 );
				if ( nz2 ) {
					Av[ ac ] += ( p0r * tr2 ) - ( p0i * ti2 );
					Av[ ac + 1 ] += ( p0r * ti2 ) + ( p0i * tr2 );
					d = ac + sa1;
					Av[ d ] += ( p1r * tr2 ) - ( p1i * ti2 );
					Av[ d + 1 ] += ( p1r * ti2 ) + ( p1i * tr2 );
				}
				d = base + ( 2 * sa2 ) + ( 2 * sa1 );
				Av[ d + 1 ] = 0.0;
				if ( nz2 ) {
					Av[ d ] += ( p2r * tr2 ) - ( p2i * ti2 );
				}
				// col i+3: (i,i+3),(i+1,i+3),(i+2,i+3) then diagonal (i+3,i+3)
				ac = base + ( 3 * sa2 );
				if ( nz3 ) {
					Av[ ac ] += ( p0r * tr3 ) - ( p0i * ti3 );
					Av[ ac + 1 ] += ( p0r * ti3 ) + ( p0i * tr3 );
					ac += sa1;
					Av[ ac ] += ( p1r * tr3 ) - ( p1i * ti3 );
					Av[ ac + 1 ] += ( p1r * ti3 ) + ( p1i * tr3 );
					ac += sa1;
					Av[ ac ] += ( p2r * tr3 ) - ( p2i * ti3 );
					Av[ ac + 1 ] += ( p2r * ti3 ) + ( p2i * tr3 );
				}
				d = base + ( 3 * sa2 ) + ( 3 * sa1 );
				Av[ d + 1 ] = 0.0;
				if ( nz3 ) {
					Av[ d ] += ( p3r * tr3 ) - ( p3i * ti3 );
				}
				// Rectangular bulk: cols i+4..N-1 (off-diagonal for all four rows)
				a0 = oA + ( i * sa1 ) + ( ( i + 4 ) * sa2 );
				a1 = a0 + sa1;
				a2 = a1 + sa1;
				a3 = a2 + sa1;
				jx = ix + ( 4 * sx );
				for ( c = i + 4; c < N; c++ ) {
					cr = xv[ jx ];
					ci = xv[ jx + 1 ];
					if ( cr !== 0.0 || ci !== 0.0 ) {
						trc = alpha * cr;
						tic = -( alpha * ci );
						Av[ a0 ] += ( p0r * trc ) - ( p0i * tic );
						Av[ a0 + 1 ] += ( p0r * tic ) + ( p0i * trc );
						Av[ a1 ] += ( p1r * trc ) - ( p1i * tic );
						Av[ a1 + 1 ] += ( p1r * tic ) + ( p1i * trc );
						Av[ a2 ] += ( p2r * trc ) - ( p2i * tic );
						Av[ a2 + 1 ] += ( p2r * tic ) + ( p2i * trc );
						Av[ a3 ] += ( p3r * trc ) - ( p3i * tic );
						Av[ a3 + 1 ] += ( p3r * tic ) + ( p3i * trc );
					}
					a0 += sa2;
					a1 += sa2;
					a2 += sa2;
					a3 += sa2;
					jx += sx;
				}
			} else {
				// Rectangular bulk: cols 0..i-1 (off-diagonal for all four rows)
				a0 = oA + ( i * sa1 );
				a1 = a0 + sa1;
				a2 = a1 + sa1;
				a3 = a2 + sa1;
				jx = oX;
				for ( c = 0; c < i; c++ ) {
					cr = xv[ jx ];
					ci = xv[ jx + 1 ];
					if ( cr !== 0.0 || ci !== 0.0 ) {
						trc = alpha * cr;
						tic = -( alpha * ci );
						Av[ a0 ] += ( p0r * trc ) - ( p0i * tic );
						Av[ a0 + 1 ] += ( p0r * tic ) + ( p0i * trc );
						Av[ a1 ] += ( p1r * trc ) - ( p1i * tic );
						Av[ a1 + 1 ] += ( p1r * tic ) + ( p1i * trc );
						Av[ a2 ] += ( p2r * trc ) - ( p2i * tic );
						Av[ a2 + 1 ] += ( p2r * tic ) + ( p2i * trc );
						Av[ a3 ] += ( p3r * trc ) - ( p3i * tic );
						Av[ a3 + 1 ] += ( p3r * tic ) + ( p3i * trc );
					}
					a0 += sa2;
					a1 += sa2;
					a2 += sa2;
					a3 += sa2;
					jx += sx;
				}
				// Lower 4x4 diagonal corner (rows i..i+3, cols i..i+3):
				// col i: diagonal (i,i) then (i+1,i),(i+2,i),(i+3,i)
				Av[ base + 1 ] = 0.0;
				if ( nz0 ) {
					Av[ base ] += ( p0r * tr0 ) - ( p0i * ti0 );
					ac = base + sa1;
					Av[ ac ] += ( p1r * tr0 ) - ( p1i * ti0 );
					Av[ ac + 1 ] += ( p1r * ti0 ) + ( p1i * tr0 );
					ac += sa1;
					Av[ ac ] += ( p2r * tr0 ) - ( p2i * ti0 );
					Av[ ac + 1 ] += ( p2r * ti0 ) + ( p2i * tr0 );
					ac += sa1;
					Av[ ac ] += ( p3r * tr0 ) - ( p3i * ti0 );
					Av[ ac + 1 ] += ( p3r * ti0 ) + ( p3i * tr0 );
				}
				// col i+1: diagonal (i+1,i+1) then (i+2,i+1),(i+3,i+1)
				d = base + sa2 + sa1;
				Av[ d + 1 ] = 0.0;
				if ( nz1 ) {
					Av[ d ] += ( p1r * tr1 ) - ( p1i * ti1 );
					ac = d + sa1;
					Av[ ac ] += ( p2r * tr1 ) - ( p2i * ti1 );
					Av[ ac + 1 ] += ( p2r * ti1 ) + ( p2i * tr1 );
					ac += sa1;
					Av[ ac ] += ( p3r * tr1 ) - ( p3i * ti1 );
					Av[ ac + 1 ] += ( p3r * ti1 ) + ( p3i * tr1 );
				}
				// col i+2: diagonal (i+2,i+2) then (i+3,i+2)
				d = base + ( 2 * sa2 ) + ( 2 * sa1 );
				Av[ d + 1 ] = 0.0;
				if ( nz2 ) {
					Av[ d ] += ( p2r * tr2 ) - ( p2i * ti2 );
					ac = d + sa1;
					Av[ ac ] += ( p3r * tr2 ) - ( p3i * ti2 );
					Av[ ac + 1 ] += ( p3r * ti2 ) + ( p3i * tr2 );
				}
				// col i+3: diagonal (i+3,i+3)
				d = base + ( 3 * sa2 ) + ( 3 * sa1 );
				Av[ d + 1 ] = 0.0;
				if ( nz3 ) {
					Av[ d ] += ( p3r * tr3 ) - ( p3i * ti3 );
				}
			}
			ix += 4 * sx;
		}
		// Remainder rows: reference-style scalar (row-oriented, one row at a time)
		rowScalar( n4, N );
	}
	return A;

	/**
	* Reference-style scalar update over a range of columns (column form).
	*
	* @private
	* @param {integer} lo - first column
	* @param {integer} hi - one past the last column
	*/
	function colScalar( lo, hi ) {
		let jjx, tr, ti, kk, aii, iix, rr;

		jjx = oX + ( lo * sx );
		for ( kk = lo; kk < hi; kk++ ) {
			if ( xv[ jjx ] !== 0.0 || xv[ jjx + 1 ] !== 0.0 ) {
				tr = alpha * xv[ jjx ];
				ti = -( alpha * xv[ jjx + 1 ] );
				if ( upper ) {
					iix = oX;
					aii = oA + ( kk * sa2 );
					for ( rr = 0; rr < kk; rr++ ) {
						Av[ aii ] += ( xv[ iix ] * tr ) - ( xv[ iix + 1 ] * ti );
						Av[ aii + 1 ] += ( xv[ iix ] * ti ) + ( xv[ iix + 1 ] * tr );
						iix += sx;
						aii += sa1;
					}
					Av[ aii ] += ( xv[ jjx ] * tr ) - ( xv[ jjx + 1 ] * ti );
					Av[ aii + 1 ] = 0.0;
				} else {
					aii = oA + ( kk * sa1 ) + ( kk * sa2 );
					Av[ aii ] += ( xv[ jjx ] * tr ) - ( xv[ jjx + 1 ] * ti );
					Av[ aii + 1 ] = 0.0;
					iix = jjx + sx;
					aii += sa1;
					for ( rr = kk + 1; rr < N; rr++ ) {
						Av[ aii ] += ( xv[ iix ] * tr ) - ( xv[ iix + 1 ] * ti );
						Av[ aii + 1 ] += ( xv[ iix ] * ti ) + ( xv[ iix + 1 ] * tr );
						iix += sx;
						aii += sa1;
					}
				}
			} else {
				aii = oA + ( kk * sa1 ) + ( kk * sa2 );
				Av[ aii + 1 ] = 0.0;
			}
			jjx += sx;
		}
	}

	/**
	* Reference-style scalar update over a range of rows (row form).
	*
	* @private
	* @param {integer} lo - first row
	* @param {integer} hi - one past the last row
	*/
	function rowScalar( lo, hi ) {
		let iix, jjx, prr, pii, tr, ti, aii, dd, rr, cc;

		iix = oX + ( lo * sx );
		for ( rr = lo; rr < hi; rr++ ) {
			prr = xv[ iix ];
			pii = xv[ iix + 1 ];
			dd = oA + ( rr * sa1 ) + ( rr * sa2 );
			if ( upper ) {
				// diagonal (rr,rr)
				Av[ dd + 1 ] = 0.0;
				if ( prr !== 0.0 || pii !== 0.0 ) {
					tr = alpha * prr;
					ti = -( alpha * pii );
					Av[ dd ] += ( prr * tr ) - ( pii * ti );
				}
				// off-diagonal cols rr+1..N-1
				aii = dd + sa2;
				jjx = iix + sx;
				for ( cc = rr + 1; cc < N; cc++ ) {
					if ( xv[ jjx ] !== 0.0 || xv[ jjx + 1 ] !== 0.0 ) {
						tr = alpha * xv[ jjx ];
						ti = -( alpha * xv[ jjx + 1 ] );
						Av[ aii ] += ( prr * tr ) - ( pii * ti );
						Av[ aii + 1 ] += ( prr * ti ) + ( pii * tr );
					}
					aii += sa2;
					jjx += sx;
				}
			} else {
				// off-diagonal cols 0..rr-1
				aii = oA + ( rr * sa1 );
				jjx = oX;
				for ( cc = 0; cc < rr; cc++ ) {
					if ( xv[ jjx ] !== 0.0 || xv[ jjx + 1 ] !== 0.0 ) {
						tr = alpha * xv[ jjx ];
						ti = -( alpha * xv[ jjx + 1 ] );
						Av[ aii ] += ( prr * tr ) - ( pii * ti );
						Av[ aii + 1 ] += ( prr * ti ) + ( pii * tr );
					}
					aii += sa2;
					jjx += sx;
				}
				// diagonal (rr,rr)
				Av[ dd + 1 ] = 0.0;
				if ( prr !== 0.0 || pii !== 0.0 ) {
					tr = alpha * prr;
					ti = -( alpha * pii );
					Av[ dd ] += ( prr * tr ) - ( pii * ti );
				}
			}
			iix += sx;
		}
	}
}


// EXPORTS //

export default zher;
