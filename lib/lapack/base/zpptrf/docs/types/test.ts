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

import zpptrf = require( './index' );


// TESTS //

// The function returns a number...
{
	zpptrf( 'upper', 10, new Float64Array( 25 ) ); // $ExpectType number
}

// The compiler throws an error if provided a first argument of invalid type...
{
	zpptrf( 10, 10, new Float64Array( 25 ) ); // $ExpectError
	zpptrf( true, 10, new Float64Array( 25 ) ); // $ExpectError
	zpptrf( null, 10, new Float64Array( 25 ) ); // $ExpectError
	zpptrf( undefined, 10, new Float64Array( 25 ) ); // $ExpectError
	zpptrf( [], 10, new Float64Array( 25 ) ); // $ExpectError
	zpptrf( {}, 10, new Float64Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a second argument of invalid type...
{
	zpptrf( 'upper', '10', new Float64Array( 25 ) ); // $ExpectError
	zpptrf( 'upper', true, new Float64Array( 25 ) ); // $ExpectError
	zpptrf( 'upper', false, new Float64Array( 25 ) ); // $ExpectError
	zpptrf( 'upper', null, new Float64Array( 25 ) ); // $ExpectError
	zpptrf( 'upper', undefined, new Float64Array( 25 ) ); // $ExpectError
	zpptrf( 'upper', [], new Float64Array( 25 ) ); // $ExpectError
	zpptrf( 'upper', {}, new Float64Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a third argument of invalid type...
{
	zpptrf( 'upper', 10, '10' ); // $ExpectError
	zpptrf( 'upper', 10, 10 ); // $ExpectError
	zpptrf( 'upper', 10, true ); // $ExpectError
	zpptrf( 'upper', 10, null ); // $ExpectError
	zpptrf( 'upper', 10, undefined ); // $ExpectError
	zpptrf( 'upper', 10, [] ); // $ExpectError
	zpptrf( 'upper', 10, {} ); // $ExpectError
}

// The compiler throws an error if provided an unsupported number of arguments...
{
	zpptrf(); // $ExpectError
	zpptrf( 'upper' ); // $ExpectError
}
