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

import dseupd from './index';


// TESTS //

// The function returns a number...
{
	const select = [ false, false, false, false ];
	const iparam = [ 0, 0, 0, 0, 0, 0, 1 ];
	const ipntr = [ 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1 ];
	dseupd( true, 'all', select, 1, new Float64Array( 2 ), 1, new Float64Array( 8 ), 2, 0.0, 'standard', 2, 'LM', 2, 0.0, new Float64Array( 2 ), 1, 4, new Float64Array( 8 ), 2, iparam, 1, ipntr, 1, new Float64Array( 4 ), 1, new Float64Array( 48 ), 1, 48 ); // $ExpectType number
}

// The compiler throws an error if the function is provided an unsupported number of arguments...
{
	dseupd(); // $ExpectError
}

// The ndarray method returns a number...
{
	const select = [ false, false, false, false ];
	const iparam = [ 0, 0, 0, 0, 0, 0, 1 ];
	const ipntr = [ 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1 ];
	dseupd.ndarray( true, 'all', select, 1, 0, new Float64Array( 2 ), 1, 0, new Float64Array( 8 ), 1, 2, 0, 0.0, 'standard', 2, 'LM', 2, 0.0, new Float64Array( 2 ), 1, 0, 4, new Float64Array( 8 ), 1, 2, 0, iparam, 1, 0, ipntr, 1, 0, new Float64Array( 4 ), 1, 0, new Float64Array( 48 ), 1, 0, 48 ); // $ExpectType number
}

// The compiler throws an error if the ndarray method is provided an unsupported number of arguments...
{
	dseupd.ndarray(); // $ExpectError
}
