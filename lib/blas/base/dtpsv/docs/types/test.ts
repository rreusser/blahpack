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

import dtpsv = require( './index' );


// TESTS //

// The function returns a Float64Array...
{
	dtpsv( 'upper', 'no-transpose', 'unit', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectType Float64Array
}

// The compiler throws an error if provided a first argument of invalid type...
{
	dtpsv( 10, 'no-transpose', 'unit', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dtpsv( true, 'no-transpose', 'unit', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dtpsv( null, 'no-transpose', 'unit', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dtpsv( undefined, 'no-transpose', 'unit', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dtpsv( [], 'no-transpose', 'unit', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dtpsv( {}, 'no-transpose', 'unit', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a second argument of invalid type...
{
	dtpsv( 'upper', 10, 'unit', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dtpsv( 'upper', true, 'unit', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dtpsv( 'upper', null, 'unit', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dtpsv( 'upper', undefined, 'unit', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dtpsv( 'upper', [], 'unit', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dtpsv( 'upper', {}, 'unit', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a third argument of invalid type...
{
	dtpsv( 'upper', 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dtpsv( 'upper', 'no-transpose', true, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dtpsv( 'upper', 'no-transpose', null, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dtpsv( 'upper', 'no-transpose', undefined, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dtpsv( 'upper', 'no-transpose', [], 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dtpsv( 'upper', 'no-transpose', {}, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a fourth argument of invalid type...
{
	dtpsv( 'upper', 'no-transpose', 'unit', '10', new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dtpsv( 'upper', 'no-transpose', 'unit', true, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dtpsv( 'upper', 'no-transpose', 'unit', false, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dtpsv( 'upper', 'no-transpose', 'unit', null, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dtpsv( 'upper', 'no-transpose', 'unit', undefined, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dtpsv( 'upper', 'no-transpose', 'unit', [], new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dtpsv( 'upper', 'no-transpose', 'unit', {}, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a fifth argument of invalid type...
{
	dtpsv( 'upper', 'no-transpose', 'unit', 10, '10', 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dtpsv( 'upper', 'no-transpose', 'unit', 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dtpsv( 'upper', 'no-transpose', 'unit', 10, true, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dtpsv( 'upper', 'no-transpose', 'unit', 10, null, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dtpsv( 'upper', 'no-transpose', 'unit', 10, undefined, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dtpsv( 'upper', 'no-transpose', 'unit', 10, [], 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dtpsv( 'upper', 'no-transpose', 'unit', 10, {}, 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a sixth argument of invalid type...
{
	dtpsv( 'upper', 'no-transpose', 'unit', 10, new Float64Array( 25 ), '10', new Float64Array( 25 ), 10 ); // $ExpectError
	dtpsv( 'upper', 'no-transpose', 'unit', 10, new Float64Array( 25 ), true, new Float64Array( 25 ), 10 ); // $ExpectError
	dtpsv( 'upper', 'no-transpose', 'unit', 10, new Float64Array( 25 ), false, new Float64Array( 25 ), 10 ); // $ExpectError
	dtpsv( 'upper', 'no-transpose', 'unit', 10, new Float64Array( 25 ), null, new Float64Array( 25 ), 10 ); // $ExpectError
	dtpsv( 'upper', 'no-transpose', 'unit', 10, new Float64Array( 25 ), undefined, new Float64Array( 25 ), 10 ); // $ExpectError
	dtpsv( 'upper', 'no-transpose', 'unit', 10, new Float64Array( 25 ), [], new Float64Array( 25 ), 10 ); // $ExpectError
	dtpsv( 'upper', 'no-transpose', 'unit', 10, new Float64Array( 25 ), {}, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a seventh argument of invalid type...
{
	dtpsv( 'upper', 'no-transpose', 'unit', 10, new Float64Array( 25 ), 10, '10', 10 ); // $ExpectError
	dtpsv( 'upper', 'no-transpose', 'unit', 10, new Float64Array( 25 ), 10, 10, 10 ); // $ExpectError
	dtpsv( 'upper', 'no-transpose', 'unit', 10, new Float64Array( 25 ), 10, true, 10 ); // $ExpectError
	dtpsv( 'upper', 'no-transpose', 'unit', 10, new Float64Array( 25 ), 10, null, 10 ); // $ExpectError
	dtpsv( 'upper', 'no-transpose', 'unit', 10, new Float64Array( 25 ), 10, undefined, 10 ); // $ExpectError
	dtpsv( 'upper', 'no-transpose', 'unit', 10, new Float64Array( 25 ), 10, [], 10 ); // $ExpectError
	dtpsv( 'upper', 'no-transpose', 'unit', 10, new Float64Array( 25 ), 10, {}, 10 ); // $ExpectError
}

// The compiler throws an error if provided a eighth argument of invalid type...
{
	dtpsv( 'upper', 'no-transpose', 'unit', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), '10' ); // $ExpectError
	dtpsv( 'upper', 'no-transpose', 'unit', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), true ); // $ExpectError
	dtpsv( 'upper', 'no-transpose', 'unit', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), false ); // $ExpectError
	dtpsv( 'upper', 'no-transpose', 'unit', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), null ); // $ExpectError
	dtpsv( 'upper', 'no-transpose', 'unit', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), undefined ); // $ExpectError
	dtpsv( 'upper', 'no-transpose', 'unit', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), [] ); // $ExpectError
	dtpsv( 'upper', 'no-transpose', 'unit', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), {} ); // $ExpectError
}

// The compiler throws an error if provided an unsupported number of arguments...
{
	dtpsv(); // $ExpectError
	dtpsv( 'upper' ); // $ExpectError
}
