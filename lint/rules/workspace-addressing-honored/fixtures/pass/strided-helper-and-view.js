// target: lib/lapack/base/zlansf/lib/base.js
function zlansf( N, A, WORK, strideWork, offsetWork ) {
	const Wv = reinterpret( WORK, 0 );
	const sw = strideWork * 2;
	const ow = offsetWork * 2;
	let i;
	function wi( k ) {
		return offsetWork + ( k * strideWork );
	}
	for ( i = 0; i < N; i++ ) {
		WORK[ wi( i ) ] = 0.0;
		Wv[ ow + ( i * sw ) ] = 0.0;
	}
	return WORK[ offsetWork ];
}
export default zlansf;
