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

import ilaenv = require( './index' );


// TESTS //

// The function returns a number...
{
	ilaenv( 1, 'X', 'X', 1, 1, 1, 1 ); // $ExpectType number
}

// The compiler throws an error if the function is provided a first argument which is not a number...
{
	ilaenv( '1', 'X', 'X', 1, 1, 1, 1 ); // $ExpectError
	ilaenv( true, 'X', 'X', 1, 1, 1, 1 ); // $ExpectError
	ilaenv( null, 'X', 'X', 1, 1, 1, 1 ); // $ExpectError
	ilaenv( [], 'X', 'X', 1, 1, 1, 1 ); // $ExpectError
	ilaenv( {}, 'X', 'X', 1, 1, 1, 1 ); // $ExpectError
}

// The compiler throws an error if the function is provided a second argument which is not a string...
{
	ilaenv( 1, 1, 'X', 1, 1, 1, 1 ); // $ExpectError
	ilaenv( 1, true, 'X', 1, 1, 1, 1 ); // $ExpectError
	ilaenv( 1, null, 'X', 1, 1, 1, 1 ); // $ExpectError
	ilaenv( 1, [], 'X', 1, 1, 1, 1 ); // $ExpectError
	ilaenv( 1, {}, 'X', 1, 1, 1, 1 ); // $ExpectError
}

// The compiler throws an error if the function is provided a third argument which is not a string...
{
	ilaenv( 1, 'X', 1, 1, 1, 1, 1 ); // $ExpectError
	ilaenv( 1, 'X', true, 1, 1, 1, 1 ); // $ExpectError
	ilaenv( 1, 'X', null, 1, 1, 1, 1 ); // $ExpectError
	ilaenv( 1, 'X', [], 1, 1, 1, 1 ); // $ExpectError
	ilaenv( 1, 'X', {}, 1, 1, 1, 1 ); // $ExpectError
}

// The compiler throws an error if the function is provided a fourth argument which is not a number...
{
	ilaenv( 1, 'X', 'X', '1', 1, 1, 1 ); // $ExpectError
	ilaenv( 1, 'X', 'X', true, 1, 1, 1 ); // $ExpectError
	ilaenv( 1, 'X', 'X', null, 1, 1, 1 ); // $ExpectError
	ilaenv( 1, 'X', 'X', [], 1, 1, 1 ); // $ExpectError
	ilaenv( 1, 'X', 'X', {}, 1, 1, 1 ); // $ExpectError
}

// The compiler throws an error if the function is provided a fifth argument which is not a number...
{
	ilaenv( 1, 'X', 'X', 1, '1', 1, 1 ); // $ExpectError
	ilaenv( 1, 'X', 'X', 1, true, 1, 1 ); // $ExpectError
	ilaenv( 1, 'X', 'X', 1, null, 1, 1 ); // $ExpectError
	ilaenv( 1, 'X', 'X', 1, [], 1, 1 ); // $ExpectError
	ilaenv( 1, 'X', 'X', 1, {}, 1, 1 ); // $ExpectError
}

// The compiler throws an error if the function is provided a sixth argument which is not a number...
{
	ilaenv( 1, 'X', 'X', 1, 1, '1', 1 ); // $ExpectError
	ilaenv( 1, 'X', 'X', 1, 1, true, 1 ); // $ExpectError
	ilaenv( 1, 'X', 'X', 1, 1, null, 1 ); // $ExpectError
	ilaenv( 1, 'X', 'X', 1, 1, [], 1 ); // $ExpectError
	ilaenv( 1, 'X', 'X', 1, 1, {}, 1 ); // $ExpectError
}

// The compiler throws an error if the function is provided a seventh argument which is not a number...
{
	ilaenv( 1, 'X', 'X', 1, 1, 1, '1' ); // $ExpectError
	ilaenv( 1, 'X', 'X', 1, 1, 1, true ); // $ExpectError
	ilaenv( 1, 'X', 'X', 1, 1, 1, null ); // $ExpectError
	ilaenv( 1, 'X', 'X', 1, 1, 1, [] ); // $ExpectError
	ilaenv( 1, 'X', 'X', 1, 1, 1, {} ); // $ExpectError
}

// The compiler throws an error if the function is provided an unsupported number of arguments...
{
	ilaenv(); // $ExpectError
	ilaenv( 1, 'X', 'X', 1, 1, 1 ); // $ExpectError
	ilaenv( 1, 'X', 'X', 1, 1, 1, 1, 1 ); // $ExpectError
}

// The `ndarray` method returns a number...
{
	ilaenv.ndarray( 1, 'X', 'X', 1, 1, 1, 1 ); // $ExpectType number
}

// The compiler throws an error if the `ndarray` method is provided an unsupported number of arguments...
{
	ilaenv.ndarray(); // $ExpectError
	ilaenv.ndarray( 1, 'X', 'X', 1, 1, 1, 1, 1 ); // $ExpectError
}
