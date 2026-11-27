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

import dsaupd = require( './index' );


// TESTS //

// The function returns a number...
{
	dsaupd( {}, new Int32Array( 1 ), 'standard', 6, 'LM', 2, 0.0, new Float64Array( 6 ), 5, new Float64Array( 30 ), 6, new Int32Array( 11 ), new Int32Array( 11 ), new Float64Array( 18 ), new Float64Array( 65 ), 65, 1 ); // $ExpectType number
}

// The compiler throws an error if the function is provided an unsupported number of arguments...
{
	dsaupd(); // $ExpectError
}

// The ndarray method returns a number...
{
	dsaupd.ndarray( {}, new Int32Array( 1 ), 'standard', 6, 'LM', 2, 0.0, new Float64Array( 6 ), 1, 0, 5, new Float64Array( 30 ), 1, 6, 0, new Int32Array( 11 ), 1, 0, new Int32Array( 11 ), 1, 0, new Float64Array( 18 ), 1, 0, new Float64Array( 65 ), 1, 0, 65, 1 ); // $ExpectType number
}

// The compiler throws an error if the ndarray method is provided an unsupported number of arguments...
{
	dsaupd.ndarray(); // $ExpectError
}
