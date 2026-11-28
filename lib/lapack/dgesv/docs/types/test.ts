/*
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

import dgesv = require( './index' );


// TESTS //

// The function returns a number...
{
	const A = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	const IPIV = new Int32Array( 2 );
	const B = new Float64Array( [ 1.0, 2.0 ] );

	dgesv( 'row-major', 2, 1, A, 2, IPIV, 1, B, 2 ); // $ExpectType number
}

// The compiler throws an error if the function is provided an unsupported number of arguments...
{
	dgesv(); // $ExpectError
	dgesv( 'row-major' ); // $ExpectError
}

// The ndarray method returns a number...
{
	const A = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	const IPIV = new Int32Array( 2 );
	const B = new Float64Array( [ 1.0, 2.0 ] );

	dgesv.ndarray( 2, 1, A, 1, 2, 0, IPIV, 1, 0, B, 1, 2, 0 ); // $ExpectType number
}

// The compiler throws an error if the ndarray method is provided an unsupported number of arguments...
{
	dgesv.ndarray(); // $ExpectError
	dgesv.ndarray( 2 ); // $ExpectError
}
