// target: lib/lapack/base/dopmtr/lib/base.js
// Fortran: II = II - I - 1, with Fortran I = i + 1.
// The matrix is ill-conditioned, so the scratch that follows starts after TAU.
// The algorithm keeps the Fortran 1-based indices and converts at access.
function f( ii, i ) {
	return ii - ( i + 2 );
}
export default f;
