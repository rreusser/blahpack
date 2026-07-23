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

import ztrti2 = require( './index' );


// TESTS //

// The function returns a number...
{
	ztrti2( 'row-major', 'upper', 'unit', 10, new Float64Array( 25 ), 10 ); // $ExpectType number
}

// The compiler throws an error if provided a first argument of invalid type...
{
	ztrti2( 10, 'upper', 'unit', 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztrti2( true, 'upper', 'unit', 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztrti2( null, 'upper', 'unit', 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztrti2( undefined, 'upper', 'unit', 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztrti2( [], 'upper', 'unit', 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztrti2( {}, 'upper', 'unit', 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a second argument of invalid type...
{
	ztrti2( 'row-major', 10, 'unit', 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztrti2( 'row-major', true, 'unit', 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztrti2( 'row-major', null, 'unit', 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztrti2( 'row-major', undefined, 'unit', 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztrti2( 'row-major', [], 'unit', 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztrti2( 'row-major', {}, 'unit', 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a third argument of invalid type...
{
	ztrti2( 'row-major', 'upper', 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztrti2( 'row-major', 'upper', true, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztrti2( 'row-major', 'upper', null, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztrti2( 'row-major', 'upper', undefined, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztrti2( 'row-major', 'upper', [], 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztrti2( 'row-major', 'upper', {}, 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a fourth argument of invalid type...
{
	ztrti2( 'row-major', 'upper', 'unit', '10', new Float64Array( 25 ), 10 ); // $ExpectError
	ztrti2( 'row-major', 'upper', 'unit', true, new Float64Array( 25 ), 10 ); // $ExpectError
	ztrti2( 'row-major', 'upper', 'unit', false, new Float64Array( 25 ), 10 ); // $ExpectError
	ztrti2( 'row-major', 'upper', 'unit', null, new Float64Array( 25 ), 10 ); // $ExpectError
	ztrti2( 'row-major', 'upper', 'unit', undefined, new Float64Array( 25 ), 10 ); // $ExpectError
	ztrti2( 'row-major', 'upper', 'unit', [], new Float64Array( 25 ), 10 ); // $ExpectError
	ztrti2( 'row-major', 'upper', 'unit', {}, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a fifth argument of invalid type...
{
	ztrti2( 'row-major', 'upper', 'unit', 10, '10', 10 ); // $ExpectError
	ztrti2( 'row-major', 'upper', 'unit', 10, 10, 10 ); // $ExpectError
	ztrti2( 'row-major', 'upper', 'unit', 10, true, 10 ); // $ExpectError
	ztrti2( 'row-major', 'upper', 'unit', 10, null, 10 ); // $ExpectError
	ztrti2( 'row-major', 'upper', 'unit', 10, undefined, 10 ); // $ExpectError
	ztrti2( 'row-major', 'upper', 'unit', 10, [], 10 ); // $ExpectError
	ztrti2( 'row-major', 'upper', 'unit', 10, {}, 10 ); // $ExpectError
}

// The compiler throws an error if provided a sixth argument of invalid type...
{
	ztrti2( 'row-major', 'upper', 'unit', 10, new Float64Array( 25 ), '10' ); // $ExpectError
	ztrti2( 'row-major', 'upper', 'unit', 10, new Float64Array( 25 ), true ); // $ExpectError
	ztrti2( 'row-major', 'upper', 'unit', 10, new Float64Array( 25 ), false ); // $ExpectError
	ztrti2( 'row-major', 'upper', 'unit', 10, new Float64Array( 25 ), null ); // $ExpectError
	ztrti2( 'row-major', 'upper', 'unit', 10, new Float64Array( 25 ), undefined ); // $ExpectError
	ztrti2( 'row-major', 'upper', 'unit', 10, new Float64Array( 25 ), [] ); // $ExpectError
	ztrti2( 'row-major', 'upper', 'unit', 10, new Float64Array( 25 ), {} ); // $ExpectError
}

// The compiler throws an error if provided an unsupported number of arguments...
{
	ztrti2(); // $ExpectError
	ztrti2( 'row-major' ); // $ExpectError
}
