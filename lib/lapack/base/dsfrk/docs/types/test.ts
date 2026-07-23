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

import dsfrk = require( './index' );


// TESTS //

// The function returns a Float64Array...
{
	dsfrk( 'no-transpose', 'upper', 'no-transpose', 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ) ); // $ExpectType Float64Array
}

// The compiler throws an error if provided a first argument of invalid type...
{
	dsfrk( 10, 'upper', 'no-transpose', 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ) ); // $ExpectError
	dsfrk( true, 'upper', 'no-transpose', 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ) ); // $ExpectError
	dsfrk( null, 'upper', 'no-transpose', 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ) ); // $ExpectError
	dsfrk( undefined, 'upper', 'no-transpose', 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ) ); // $ExpectError
	dsfrk( [], 'upper', 'no-transpose', 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ) ); // $ExpectError
	dsfrk( {}, 'upper', 'no-transpose', 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a second argument of invalid type...
{
	dsfrk( 'no-transpose', 10, 'no-transpose', 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ) ); // $ExpectError
	dsfrk( 'no-transpose', true, 'no-transpose', 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ) ); // $ExpectError
	dsfrk( 'no-transpose', null, 'no-transpose', 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ) ); // $ExpectError
	dsfrk( 'no-transpose', undefined, 'no-transpose', 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ) ); // $ExpectError
	dsfrk( 'no-transpose', [], 'no-transpose', 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ) ); // $ExpectError
	dsfrk( 'no-transpose', {}, 'no-transpose', 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a third argument of invalid type...
{
	dsfrk( 'no-transpose', 'upper', 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ) ); // $ExpectError
	dsfrk( 'no-transpose', 'upper', true, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ) ); // $ExpectError
	dsfrk( 'no-transpose', 'upper', null, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ) ); // $ExpectError
	dsfrk( 'no-transpose', 'upper', undefined, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ) ); // $ExpectError
	dsfrk( 'no-transpose', 'upper', [], 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ) ); // $ExpectError
	dsfrk( 'no-transpose', 'upper', {}, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a fourth argument of invalid type...
{
	dsfrk( 'no-transpose', 'upper', 'no-transpose', '10', 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ) ); // $ExpectError
	dsfrk( 'no-transpose', 'upper', 'no-transpose', true, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ) ); // $ExpectError
	dsfrk( 'no-transpose', 'upper', 'no-transpose', false, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ) ); // $ExpectError
	dsfrk( 'no-transpose', 'upper', 'no-transpose', null, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ) ); // $ExpectError
	dsfrk( 'no-transpose', 'upper', 'no-transpose', undefined, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ) ); // $ExpectError
	dsfrk( 'no-transpose', 'upper', 'no-transpose', [], 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ) ); // $ExpectError
	dsfrk( 'no-transpose', 'upper', 'no-transpose', {}, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a fifth argument of invalid type...
{
	dsfrk( 'no-transpose', 'upper', 'no-transpose', 10, '10', 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ) ); // $ExpectError
	dsfrk( 'no-transpose', 'upper', 'no-transpose', 10, true, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ) ); // $ExpectError
	dsfrk( 'no-transpose', 'upper', 'no-transpose', 10, false, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ) ); // $ExpectError
	dsfrk( 'no-transpose', 'upper', 'no-transpose', 10, null, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ) ); // $ExpectError
	dsfrk( 'no-transpose', 'upper', 'no-transpose', 10, undefined, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ) ); // $ExpectError
	dsfrk( 'no-transpose', 'upper', 'no-transpose', 10, [], 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ) ); // $ExpectError
	dsfrk( 'no-transpose', 'upper', 'no-transpose', 10, {}, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a sixth argument of invalid type...
{
	dsfrk( 'no-transpose', 'upper', 'no-transpose', 10, 10, '10', new Float64Array( 25 ), 10, 10, new Float64Array( 25 ) ); // $ExpectError
	dsfrk( 'no-transpose', 'upper', 'no-transpose', 10, 10, true, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ) ); // $ExpectError
	dsfrk( 'no-transpose', 'upper', 'no-transpose', 10, 10, false, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ) ); // $ExpectError
	dsfrk( 'no-transpose', 'upper', 'no-transpose', 10, 10, null, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ) ); // $ExpectError
	dsfrk( 'no-transpose', 'upper', 'no-transpose', 10, 10, undefined, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ) ); // $ExpectError
	dsfrk( 'no-transpose', 'upper', 'no-transpose', 10, 10, [], new Float64Array( 25 ), 10, 10, new Float64Array( 25 ) ); // $ExpectError
	dsfrk( 'no-transpose', 'upper', 'no-transpose', 10, 10, {}, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a seventh argument of invalid type...
{
	dsfrk( 'no-transpose', 'upper', 'no-transpose', 10, 10, 10, '10', 10, 10, new Float64Array( 25 ) ); // $ExpectError
	dsfrk( 'no-transpose', 'upper', 'no-transpose', 10, 10, 10, 10, 10, 10, new Float64Array( 25 ) ); // $ExpectError
	dsfrk( 'no-transpose', 'upper', 'no-transpose', 10, 10, 10, true, 10, 10, new Float64Array( 25 ) ); // $ExpectError
	dsfrk( 'no-transpose', 'upper', 'no-transpose', 10, 10, 10, null, 10, 10, new Float64Array( 25 ) ); // $ExpectError
	dsfrk( 'no-transpose', 'upper', 'no-transpose', 10, 10, 10, undefined, 10, 10, new Float64Array( 25 ) ); // $ExpectError
	dsfrk( 'no-transpose', 'upper', 'no-transpose', 10, 10, 10, [], 10, 10, new Float64Array( 25 ) ); // $ExpectError
	dsfrk( 'no-transpose', 'upper', 'no-transpose', 10, 10, 10, {}, 10, 10, new Float64Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a eighth argument of invalid type...
{
	dsfrk( 'no-transpose', 'upper', 'no-transpose', 10, 10, 10, new Float64Array( 25 ), '10', 10, new Float64Array( 25 ) ); // $ExpectError
	dsfrk( 'no-transpose', 'upper', 'no-transpose', 10, 10, 10, new Float64Array( 25 ), true, 10, new Float64Array( 25 ) ); // $ExpectError
	dsfrk( 'no-transpose', 'upper', 'no-transpose', 10, 10, 10, new Float64Array( 25 ), false, 10, new Float64Array( 25 ) ); // $ExpectError
	dsfrk( 'no-transpose', 'upper', 'no-transpose', 10, 10, 10, new Float64Array( 25 ), null, 10, new Float64Array( 25 ) ); // $ExpectError
	dsfrk( 'no-transpose', 'upper', 'no-transpose', 10, 10, 10, new Float64Array( 25 ), undefined, 10, new Float64Array( 25 ) ); // $ExpectError
	dsfrk( 'no-transpose', 'upper', 'no-transpose', 10, 10, 10, new Float64Array( 25 ), [], 10, new Float64Array( 25 ) ); // $ExpectError
	dsfrk( 'no-transpose', 'upper', 'no-transpose', 10, 10, 10, new Float64Array( 25 ), {}, 10, new Float64Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a ninth argument of invalid type...
{
	dsfrk( 'no-transpose', 'upper', 'no-transpose', 10, 10, 10, new Float64Array( 25 ), 10, '10', new Float64Array( 25 ) ); // $ExpectError
	dsfrk( 'no-transpose', 'upper', 'no-transpose', 10, 10, 10, new Float64Array( 25 ), 10, true, new Float64Array( 25 ) ); // $ExpectError
	dsfrk( 'no-transpose', 'upper', 'no-transpose', 10, 10, 10, new Float64Array( 25 ), 10, false, new Float64Array( 25 ) ); // $ExpectError
	dsfrk( 'no-transpose', 'upper', 'no-transpose', 10, 10, 10, new Float64Array( 25 ), 10, null, new Float64Array( 25 ) ); // $ExpectError
	dsfrk( 'no-transpose', 'upper', 'no-transpose', 10, 10, 10, new Float64Array( 25 ), 10, undefined, new Float64Array( 25 ) ); // $ExpectError
	dsfrk( 'no-transpose', 'upper', 'no-transpose', 10, 10, 10, new Float64Array( 25 ), 10, [], new Float64Array( 25 ) ); // $ExpectError
	dsfrk( 'no-transpose', 'upper', 'no-transpose', 10, 10, 10, new Float64Array( 25 ), 10, {}, new Float64Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a tenth argument of invalid type...
{
	dsfrk( 'no-transpose', 'upper', 'no-transpose', 10, 10, 10, new Float64Array( 25 ), 10, 10, '10' ); // $ExpectError
	dsfrk( 'no-transpose', 'upper', 'no-transpose', 10, 10, 10, new Float64Array( 25 ), 10, 10, 10 ); // $ExpectError
	dsfrk( 'no-transpose', 'upper', 'no-transpose', 10, 10, 10, new Float64Array( 25 ), 10, 10, true ); // $ExpectError
	dsfrk( 'no-transpose', 'upper', 'no-transpose', 10, 10, 10, new Float64Array( 25 ), 10, 10, null ); // $ExpectError
	dsfrk( 'no-transpose', 'upper', 'no-transpose', 10, 10, 10, new Float64Array( 25 ), 10, 10, undefined ); // $ExpectError
	dsfrk( 'no-transpose', 'upper', 'no-transpose', 10, 10, 10, new Float64Array( 25 ), 10, 10, [] ); // $ExpectError
	dsfrk( 'no-transpose', 'upper', 'no-transpose', 10, 10, 10, new Float64Array( 25 ), 10, 10, {} ); // $ExpectError
}

// The compiler throws an error if provided an unsupported number of arguments...
{
	dsfrk(); // $ExpectError
	dsfrk( 'no-transpose' ); // $ExpectError
}
