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

/// <reference types="@stdlib/types"/>

import { Complex128Array } from '@stdlib/types/array';

import ztpsv = require( './index' );


// TESTS //

const zx = null as unknown as Complex128Array;

// The function returns a Complex128Array...
{
	ztpsv( 'upper', 'no-transpose', 'unit', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectType Complex128Array
}

// The compiler throws an error if provided a first argument of invalid type...
{
	ztpsv( 10, 'no-transpose', 'unit', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztpsv( true, 'no-transpose', 'unit', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztpsv( null, 'no-transpose', 'unit', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztpsv( undefined, 'no-transpose', 'unit', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztpsv( [], 'no-transpose', 'unit', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztpsv( {}, 'no-transpose', 'unit', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a second argument of invalid type...
{
	ztpsv( 'upper', 10, 'unit', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztpsv( 'upper', true, 'unit', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztpsv( 'upper', null, 'unit', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztpsv( 'upper', undefined, 'unit', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztpsv( 'upper', [], 'unit', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztpsv( 'upper', {}, 'unit', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a third argument of invalid type...
{
	ztpsv( 'upper', 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztpsv( 'upper', 'no-transpose', true, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztpsv( 'upper', 'no-transpose', null, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztpsv( 'upper', 'no-transpose', undefined, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztpsv( 'upper', 'no-transpose', [], 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztpsv( 'upper', 'no-transpose', {}, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a fourth argument of invalid type...
{
	ztpsv( 'upper', 'no-transpose', 'unit', '10', new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztpsv( 'upper', 'no-transpose', 'unit', true, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztpsv( 'upper', 'no-transpose', 'unit', false, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztpsv( 'upper', 'no-transpose', 'unit', null, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztpsv( 'upper', 'no-transpose', 'unit', undefined, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztpsv( 'upper', 'no-transpose', 'unit', [], new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztpsv( 'upper', 'no-transpose', 'unit', {}, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a fifth argument of invalid type...
{
	ztpsv( 'upper', 'no-transpose', 'unit', 10, '10', 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztpsv( 'upper', 'no-transpose', 'unit', 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztpsv( 'upper', 'no-transpose', 'unit', 10, true, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztpsv( 'upper', 'no-transpose', 'unit', 10, null, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztpsv( 'upper', 'no-transpose', 'unit', 10, undefined, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztpsv( 'upper', 'no-transpose', 'unit', 10, [], 10, new Float64Array( 25 ), 10 ); // $ExpectError
	ztpsv( 'upper', 'no-transpose', 'unit', 10, {}, 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a sixth argument of invalid type...
{
	ztpsv( 'upper', 'no-transpose', 'unit', 10, new Float64Array( 25 ), '10', new Float64Array( 25 ), 10 ); // $ExpectError
	ztpsv( 'upper', 'no-transpose', 'unit', 10, new Float64Array( 25 ), true, new Float64Array( 25 ), 10 ); // $ExpectError
	ztpsv( 'upper', 'no-transpose', 'unit', 10, new Float64Array( 25 ), false, new Float64Array( 25 ), 10 ); // $ExpectError
	ztpsv( 'upper', 'no-transpose', 'unit', 10, new Float64Array( 25 ), null, new Float64Array( 25 ), 10 ); // $ExpectError
	ztpsv( 'upper', 'no-transpose', 'unit', 10, new Float64Array( 25 ), undefined, new Float64Array( 25 ), 10 ); // $ExpectError
	ztpsv( 'upper', 'no-transpose', 'unit', 10, new Float64Array( 25 ), [], new Float64Array( 25 ), 10 ); // $ExpectError
	ztpsv( 'upper', 'no-transpose', 'unit', 10, new Float64Array( 25 ), {}, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a seventh argument of invalid type...
{
	ztpsv( 'upper', 'no-transpose', 'unit', 10, new Float64Array( 25 ), 10, '10', 10 ); // $ExpectError
	ztpsv( 'upper', 'no-transpose', 'unit', 10, new Float64Array( 25 ), 10, 10, 10 ); // $ExpectError
	ztpsv( 'upper', 'no-transpose', 'unit', 10, new Float64Array( 25 ), 10, true, 10 ); // $ExpectError
	ztpsv( 'upper', 'no-transpose', 'unit', 10, new Float64Array( 25 ), 10, null, 10 ); // $ExpectError
	ztpsv( 'upper', 'no-transpose', 'unit', 10, new Float64Array( 25 ), 10, undefined, 10 ); // $ExpectError
	ztpsv( 'upper', 'no-transpose', 'unit', 10, new Float64Array( 25 ), 10, [], 10 ); // $ExpectError
	ztpsv( 'upper', 'no-transpose', 'unit', 10, new Float64Array( 25 ), 10, {}, 10 ); // $ExpectError
}

// The compiler throws an error if provided a eighth argument of invalid type...
{
	ztpsv( 'upper', 'no-transpose', 'unit', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), '10' ); // $ExpectError
	ztpsv( 'upper', 'no-transpose', 'unit', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), true ); // $ExpectError
	ztpsv( 'upper', 'no-transpose', 'unit', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), false ); // $ExpectError
	ztpsv( 'upper', 'no-transpose', 'unit', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), null ); // $ExpectError
	ztpsv( 'upper', 'no-transpose', 'unit', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), undefined ); // $ExpectError
	ztpsv( 'upper', 'no-transpose', 'unit', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), [] ); // $ExpectError
	ztpsv( 'upper', 'no-transpose', 'unit', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), {} ); // $ExpectError
}

// The compiler throws an error if provided an unsupported number of arguments...
{
	ztpsv(); // $ExpectError
	ztpsv( 'upper' ); // $ExpectError
}
