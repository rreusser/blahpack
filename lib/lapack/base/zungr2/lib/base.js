
// MODULES //

import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlacgv from '../../zlacgv/lib/base.js';
import zlarf from '../../zlarf/lib/base.js';
import zscal from '../../../../blas/base/zscal/lib/base.js';


// MAIN //

/**
* Generates an M-by-N complex matrix Q with unitary columns, defined as the.
* product of K elementary reflectors applied from the right:
*
* ```text
* Q = H(1)^H * H(2)^H * ... * H(K)^H
* ```
*
* as returned by ZGERQF.
*
* ## Notes
*
* -   On entry, the (M-K+i)-th row of A must contain the vector which defines
*     the elementary reflector H(i), for i = 1, 2, ..., K, as returned by
*     ZGERQF in the last K rows of its array argument A.
*
* -   On exit, A contains the M-by-N matrix Q.
*
* @private
* @param {NonNegativeInteger} M - number of rows of Q (0 <= M <= N)
* @param {NonNegativeInteger} N - number of columns of Q (N >= M)
* @param {NonNegativeInteger} K - number of elementary reflectors (0 <= K <= M)
* @param {Complex128Array} A - input/output matrix (M x N)
* @param {integer} strideA1 - stride of the first dimension of A (complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (complex elements)
* @param {Complex128Array} TAU - scalar factors of reflectors (length K)
* @param {integer} strideTAU - stride for TAU (complex elements)
* @param {NonNegativeInteger} offsetTAU - starting index for TAU (complex elements)
* @param {Complex128Array} WORK - workspace (length >= M)
* @param {integer} strideWORK - stride for WORK (complex elements)
* @param {NonNegativeInteger} offsetWORK - starting index for WORK (complex elements)
* @returns {integer} status code (0 = success)
*/
function zungr2( M, N, K, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWORK, offsetWORK ) { // eslint-disable-line max-len, max-params
	var negTau;
	var tauv;
	var sa1;
	var sa2;
	var oA;
	var st;
	var Av;
	var ia;
	var it;
	var ii;
	var i;
	var j;
	var l;

	/* @complex-arrays A, TAU, WORK */

	if ( M <= 0 ) {
		return 0;
	}

	Av = reinterpret( A, 0 );
	tauv = reinterpret( TAU, 0 );

	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	oA = offsetA * 2;
	st = strideTAU * 2;

	// Initialize rows 0..M-K-1 to rows of the unit matrix

	// Fortran: IF (K < M) THEN DO 20 J=1,N; DO 10 L=1,M-K; A(L,J)=ZERO

	//          IF (J > N-M .AND. J <= N-K) A(M-N+J, J) = ONE
	if ( K < M ) {
		for ( j = 0; j < N; j++ ) {
			for ( l = 0; l < M - K; l++ ) {
				ia = oA + ( l * sa1 ) + ( j * sa2 );
				Av[ ia ] = 0.0;
				Av[ ia + 1 ] = 0.0;
			}
			// Fortran 1-based: J > N-M AND J <= N-K => 0-based: j >= N-M AND j < N-K
			if ( j >= N - M && j < N - K ) {
				// Fortran: A(M-N+J, J) = ONE => 0-based: row = M-N+j-1+1-1 = M-1-N+j+1-1 = M-N+j
				// Wait, Fortran 1-based: row = M-N+J. 0-based: row = M-N+j (since J 1-based = j+1, M-N+(j+1)-1 = M-N+j)
				ia = oA + ( ( M - N + j ) * sa1 ) + ( j * sa2 );
				Av[ ia ] = 1.0;
				Av[ ia + 1 ] = 0.0;
			}
		}
	}

	// Apply each reflector: i = 1..K (1-based), JS: i = 0..K-1
	// Fortran: II = M - K + I (1-based row index of current reflector)
	// JS: ii = M - K + i (0-based)
	for ( i = 0; i < K; i++ ) {
		ii = M - K + i;
		it = ( offsetTAU * 2 ) + ( i * st );

		// Conjugate row ii, columns 0..N-M+ii-1 (N-M+II-1 elements, Fortran 1-based)

		// Fortran: ZLACGV(N-M+II-1, A(II,1), LDA)

		// In 0-based: N-M+ii elements from col 0, stride along cols = strideA2

		// Wait: Fortran N-M+II-1 with II 1-based = N-M+(ii+1)-1 = N-M+ii
		zlacgv( N - M + ii, A, strideA2, offsetA + ( ii * strideA1 ) );

		// Set A(ii, N-M+ii) = 1

		// Fortran: A(II, N-M+II) = ONE, 0-based: col = N-M+ii
		ia = oA + ( ii * sa1 ) + ( ( N - M + ii ) * sa2 );
		Av[ ia ] = 1.0;
		Av[ ia + 1 ] = 0.0;

		// ZLARF('Right', II-1, N-M+II, A(II,1), LDA, DCONJG(TAU(I)), A, LDA, WORK)

		// Fortran II-1 rows (1-based) = ii rows (0-based, rows 0..ii-1)

		// N-M+II columns (1-based) = N-M+ii+1 columns (0-based, since II 1-based = ii+1)

		// Wait: Fortran N-M+II with II 1-based = N-M+(ii+1) = N-M+ii+1

		// V starts at A(II,1) = row ii, col 0, stride = LDA (along columns = strideA2)

		// C starts at A(1,1) = row 0, col 0
		if ( ii > 0 ) {
			zlarf('right', ii, N - M + ii + 1, A, strideA2, offsetA + ( ii * strideA1 ), new Complex128Array( [ tauv[ it ], -tauv[ it + 1 ] ] ), 0, A, strideA1, strideA2, offsetA, WORK, strideWORK, offsetWORK);
		}

		// ZSCAL(N-M+II-1, -TAU(I), A(II,1), LDA)
		// Fortran: N-M+II-1 elements, II 1-based = N-M+(ii+1)-1 = N-M+ii
		// Starts at A(II,1), stride LDA = strideA2
		negTau = new Complex128( -tauv[ it ], -tauv[ it + 1 ] );
		zscal(N - M + ii, negTau, A, strideA2, offsetA + ( ii * strideA1 ));

		// Conjugate back
		zlacgv( N - M + ii, A, strideA2, offsetA + ( ii * strideA1 ) );

		// A(II, N-M+II) = ONE - DCONJG(TAU(I))
		ia = oA + ( ii * sa1 ) + ( ( N - M + ii ) * sa2 );
		Av[ ia ] = 1.0 - tauv[ it ];
		Av[ ia + 1 ] = tauv[ it + 1 ]; // negated because conj

		// Zero out columns N-M+ii+1..N-1 of row ii

		// Fortran: DO 30 L = N-M+II+1, N; A(II,L) = ZERO

		// 0-based: l from N-M+ii+1 to N-1
		for ( l = N - M + ii + 1; l < N; l++ ) {
			ia = oA + ( ii * sa1 ) + ( l * sa2 );
			Av[ ia ] = 0.0;
			Av[ ia + 1 ] = 0.0;
		}
	}
	return 0;
}


// EXPORTS //

export default zungr2;
