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

import dsyrk = require( './index' );


// TESTS //

// The function returns a Float64Array...
{
	dsyrk( 'row-major', 'upper', 'no-transpose', 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectType Float64Array
}

// The compiler throws an error if provided a first argument of invalid type...
{
	dsyrk( 10, 'upper', 'no-transpose', 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dsyrk( true, 'upper', 'no-transpose', 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dsyrk( null, 'upper', 'no-transpose', 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dsyrk( undefined, 'upper', 'no-transpose', 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dsyrk( [], 'upper', 'no-transpose', 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dsyrk( {}, 'upper', 'no-transpose', 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a second argument of invalid type...
{
	dsyrk( 'row-major', 10, 'no-transpose', 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dsyrk( 'row-major', true, 'no-transpose', 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dsyrk( 'row-major', null, 'no-transpose', 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dsyrk( 'row-major', undefined, 'no-transpose', 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dsyrk( 'row-major', [], 'no-transpose', 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dsyrk( 'row-major', {}, 'no-transpose', 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a third argument of invalid type...
{
	dsyrk( 'row-major', 'upper', 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dsyrk( 'row-major', 'upper', true, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dsyrk( 'row-major', 'upper', null, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dsyrk( 'row-major', 'upper', undefined, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dsyrk( 'row-major', 'upper', [], 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dsyrk( 'row-major', 'upper', {}, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a fourth argument of invalid type...
{
	dsyrk( 'row-major', 'upper', 'no-transpose', '10', 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dsyrk( 'row-major', 'upper', 'no-transpose', true, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dsyrk( 'row-major', 'upper', 'no-transpose', false, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dsyrk( 'row-major', 'upper', 'no-transpose', null, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dsyrk( 'row-major', 'upper', 'no-transpose', undefined, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dsyrk( 'row-major', 'upper', 'no-transpose', [], 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dsyrk( 'row-major', 'upper', 'no-transpose', {}, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a fifth argument of invalid type...
{
	dsyrk( 'row-major', 'upper', 'no-transpose', 10, '10', 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dsyrk( 'row-major', 'upper', 'no-transpose', 10, true, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dsyrk( 'row-major', 'upper', 'no-transpose', 10, false, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dsyrk( 'row-major', 'upper', 'no-transpose', 10, null, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dsyrk( 'row-major', 'upper', 'no-transpose', 10, undefined, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dsyrk( 'row-major', 'upper', 'no-transpose', 10, [], 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dsyrk( 'row-major', 'upper', 'no-transpose', 10, {}, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a sixth argument of invalid type...
{
	dsyrk( 'row-major', 'upper', 'no-transpose', 10, 10, '10', new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dsyrk( 'row-major', 'upper', 'no-transpose', 10, 10, true, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dsyrk( 'row-major', 'upper', 'no-transpose', 10, 10, false, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dsyrk( 'row-major', 'upper', 'no-transpose', 10, 10, null, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dsyrk( 'row-major', 'upper', 'no-transpose', 10, 10, undefined, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dsyrk( 'row-major', 'upper', 'no-transpose', 10, 10, [], new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dsyrk( 'row-major', 'upper', 'no-transpose', 10, 10, {}, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a seventh argument of invalid type...
{
	dsyrk( 'row-major', 'upper', 'no-transpose', 10, 10, 10, '10', 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dsyrk( 'row-major', 'upper', 'no-transpose', 10, 10, 10, 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dsyrk( 'row-major', 'upper', 'no-transpose', 10, 10, 10, true, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dsyrk( 'row-major', 'upper', 'no-transpose', 10, 10, 10, null, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dsyrk( 'row-major', 'upper', 'no-transpose', 10, 10, 10, undefined, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dsyrk( 'row-major', 'upper', 'no-transpose', 10, 10, 10, [], 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dsyrk( 'row-major', 'upper', 'no-transpose', 10, 10, 10, {}, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a eighth argument of invalid type...
{
	dsyrk( 'row-major', 'upper', 'no-transpose', 10, 10, 10, new Float64Array( 25 ), '10', 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dsyrk( 'row-major', 'upper', 'no-transpose', 10, 10, 10, new Float64Array( 25 ), true, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dsyrk( 'row-major', 'upper', 'no-transpose', 10, 10, 10, new Float64Array( 25 ), false, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dsyrk( 'row-major', 'upper', 'no-transpose', 10, 10, 10, new Float64Array( 25 ), null, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dsyrk( 'row-major', 'upper', 'no-transpose', 10, 10, 10, new Float64Array( 25 ), undefined, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dsyrk( 'row-major', 'upper', 'no-transpose', 10, 10, 10, new Float64Array( 25 ), [], 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dsyrk( 'row-major', 'upper', 'no-transpose', 10, 10, 10, new Float64Array( 25 ), {}, 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a ninth argument of invalid type...
{
	dsyrk( 'row-major', 'upper', 'no-transpose', 10, 10, 10, new Float64Array( 25 ), 10, '10', new Float64Array( 25 ), 10 ); // $ExpectError
	dsyrk( 'row-major', 'upper', 'no-transpose', 10, 10, 10, new Float64Array( 25 ), 10, true, new Float64Array( 25 ), 10 ); // $ExpectError
	dsyrk( 'row-major', 'upper', 'no-transpose', 10, 10, 10, new Float64Array( 25 ), 10, false, new Float64Array( 25 ), 10 ); // $ExpectError
	dsyrk( 'row-major', 'upper', 'no-transpose', 10, 10, 10, new Float64Array( 25 ), 10, null, new Float64Array( 25 ), 10 ); // $ExpectError
	dsyrk( 'row-major', 'upper', 'no-transpose', 10, 10, 10, new Float64Array( 25 ), 10, undefined, new Float64Array( 25 ), 10 ); // $ExpectError
	dsyrk( 'row-major', 'upper', 'no-transpose', 10, 10, 10, new Float64Array( 25 ), 10, [], new Float64Array( 25 ), 10 ); // $ExpectError
	dsyrk( 'row-major', 'upper', 'no-transpose', 10, 10, 10, new Float64Array( 25 ), 10, {}, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a tenth argument of invalid type...
{
	dsyrk( 'row-major', 'upper', 'no-transpose', 10, 10, 10, new Float64Array( 25 ), 10, 10, '10', 10 ); // $ExpectError
	dsyrk( 'row-major', 'upper', 'no-transpose', 10, 10, 10, new Float64Array( 25 ), 10, 10, 10, 10 ); // $ExpectError
	dsyrk( 'row-major', 'upper', 'no-transpose', 10, 10, 10, new Float64Array( 25 ), 10, 10, true, 10 ); // $ExpectError
	dsyrk( 'row-major', 'upper', 'no-transpose', 10, 10, 10, new Float64Array( 25 ), 10, 10, null, 10 ); // $ExpectError
	dsyrk( 'row-major', 'upper', 'no-transpose', 10, 10, 10, new Float64Array( 25 ), 10, 10, undefined, 10 ); // $ExpectError
	dsyrk( 'row-major', 'upper', 'no-transpose', 10, 10, 10, new Float64Array( 25 ), 10, 10, [], 10 ); // $ExpectError
	dsyrk( 'row-major', 'upper', 'no-transpose', 10, 10, 10, new Float64Array( 25 ), 10, 10, {}, 10 ); // $ExpectError
}

// The compiler throws an error if provided a eleventh argument of invalid type...
{
	dsyrk( 'row-major', 'upper', 'no-transpose', 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), '10' ); // $ExpectError
	dsyrk( 'row-major', 'upper', 'no-transpose', 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), true ); // $ExpectError
	dsyrk( 'row-major', 'upper', 'no-transpose', 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), false ); // $ExpectError
	dsyrk( 'row-major', 'upper', 'no-transpose', 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), null ); // $ExpectError
	dsyrk( 'row-major', 'upper', 'no-transpose', 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), undefined ); // $ExpectError
	dsyrk( 'row-major', 'upper', 'no-transpose', 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), [] ); // $ExpectError
	dsyrk( 'row-major', 'upper', 'no-transpose', 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), {} ); // $ExpectError
}

// The compiler throws an error if provided an unsupported number of arguments...
{
	dsyrk(); // $ExpectError
	dsyrk( 'row-major' ); // $ExpectError
}
