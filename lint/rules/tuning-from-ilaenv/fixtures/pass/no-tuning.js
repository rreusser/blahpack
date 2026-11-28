// target: lib/blas/ddot/lib/base.js
// DDOT queries nothing; a local NB is not a tuning value.
const NB = 4;
function ddot( N ) {
	return N * NB;
}
export default ddot;
