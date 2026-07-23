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

import zpptri = require( './index' );


// TESTS //

// The function returns a number...
{
	zpptri( 'upper', 10, 10 ); // $ExpectType number
}

// The compiler throws an error if provided a first argument of invalid type...
{
	zpptri( 10, 10, 10 ); // $ExpectError
	zpptri( true, 10, 10 ); // $ExpectError
	zpptri( null, 10, 10 ); // $ExpectError
	zpptri( undefined, 10, 10 ); // $ExpectError
	zpptri( [], 10, 10 ); // $ExpectError
	zpptri( {}, 10, 10 ); // $ExpectError
}

// The compiler throws an error if provided a second argument of invalid type...
{
	zpptri( 'upper', '10', 10 ); // $ExpectError
	zpptri( 'upper', true, 10 ); // $ExpectError
	zpptri( 'upper', false, 10 ); // $ExpectError
	zpptri( 'upper', null, 10 ); // $ExpectError
	zpptri( 'upper', undefined, 10 ); // $ExpectError
	zpptri( 'upper', [], 10 ); // $ExpectError
	zpptri( 'upper', {}, 10 ); // $ExpectError
}

// The compiler throws an error if provided a third argument of invalid type...
{
	zpptri( 'upper', 10, '10' ); // $ExpectError
	zpptri( 'upper', 10, true ); // $ExpectError
	zpptri( 'upper', 10, false ); // $ExpectError
	zpptri( 'upper', 10, null ); // $ExpectError
	zpptri( 'upper', 10, undefined ); // $ExpectError
	zpptri( 'upper', 10, [] ); // $ExpectError
	zpptri( 'upper', 10, {} ); // $ExpectError
}

// The compiler throws an error if provided an unsupported number of arguments...
{
	zpptri(); // $ExpectError
	zpptri( 'upper' ); // $ExpectError
}
