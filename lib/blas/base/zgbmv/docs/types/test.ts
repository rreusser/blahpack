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

import zgbmv = require( './index' );


// TESTS //

const zx = null as unknown as Complex128Array;

// The function returns a Complex128Array...
{
	zgbmv( 'row-major', 'no-transpose', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectType Complex128Array
}

// The compiler throws an error if provided a first argument of invalid type...
{
	zgbmv( 10, 'no-transpose', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zgbmv( true, 'no-transpose', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zgbmv( null, 'no-transpose', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zgbmv( undefined, 'no-transpose', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zgbmv( [], 'no-transpose', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zgbmv( {}, 'no-transpose', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a second argument of invalid type...
{
	zgbmv( 'row-major', 10, 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zgbmv( 'row-major', true, 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zgbmv( 'row-major', null, 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zgbmv( 'row-major', undefined, 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zgbmv( 'row-major', [], 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zgbmv( 'row-major', {}, 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a third argument of invalid type...
{
	zgbmv( 'row-major', 'no-transpose', '10', 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zgbmv( 'row-major', 'no-transpose', true, 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zgbmv( 'row-major', 'no-transpose', false, 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zgbmv( 'row-major', 'no-transpose', null, 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zgbmv( 'row-major', 'no-transpose', undefined, 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zgbmv( 'row-major', 'no-transpose', [], 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zgbmv( 'row-major', 'no-transpose', {}, 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a fourth argument of invalid type...
{
	zgbmv( 'row-major', 'no-transpose', 10, '10', 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zgbmv( 'row-major', 'no-transpose', 10, true, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zgbmv( 'row-major', 'no-transpose', 10, false, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zgbmv( 'row-major', 'no-transpose', 10, null, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zgbmv( 'row-major', 'no-transpose', 10, undefined, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zgbmv( 'row-major', 'no-transpose', 10, [], 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zgbmv( 'row-major', 'no-transpose', 10, {}, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a fifth argument of invalid type...
{
	zgbmv( 'row-major', 'no-transpose', 10, 10, '10', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zgbmv( 'row-major', 'no-transpose', 10, 10, true, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zgbmv( 'row-major', 'no-transpose', 10, 10, false, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zgbmv( 'row-major', 'no-transpose', 10, 10, null, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zgbmv( 'row-major', 'no-transpose', 10, 10, undefined, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zgbmv( 'row-major', 'no-transpose', 10, 10, [], 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zgbmv( 'row-major', 'no-transpose', 10, 10, {}, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a sixth argument of invalid type...
{
	zgbmv( 'row-major', 'no-transpose', 10, 10, 10, '10', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zgbmv( 'row-major', 'no-transpose', 10, 10, 10, true, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zgbmv( 'row-major', 'no-transpose', 10, 10, 10, false, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zgbmv( 'row-major', 'no-transpose', 10, 10, 10, null, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zgbmv( 'row-major', 'no-transpose', 10, 10, 10, undefined, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zgbmv( 'row-major', 'no-transpose', 10, 10, 10, [], 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zgbmv( 'row-major', 'no-transpose', 10, 10, 10, {}, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a seventh argument of invalid type...
{
	zgbmv( 'row-major', 'no-transpose', 10, 10, 10, 10, '10', new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zgbmv( 'row-major', 'no-transpose', 10, 10, 10, 10, true, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zgbmv( 'row-major', 'no-transpose', 10, 10, 10, 10, false, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zgbmv( 'row-major', 'no-transpose', 10, 10, 10, 10, null, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zgbmv( 'row-major', 'no-transpose', 10, 10, 10, 10, undefined, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zgbmv( 'row-major', 'no-transpose', 10, 10, 10, 10, [], new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zgbmv( 'row-major', 'no-transpose', 10, 10, 10, 10, {}, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a eighth argument of invalid type...
{
	zgbmv( 'row-major', 'no-transpose', 10, 10, 10, 10, 10, '10', 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zgbmv( 'row-major', 'no-transpose', 10, 10, 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zgbmv( 'row-major', 'no-transpose', 10, 10, 10, 10, 10, true, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zgbmv( 'row-major', 'no-transpose', 10, 10, 10, 10, 10, null, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zgbmv( 'row-major', 'no-transpose', 10, 10, 10, 10, 10, undefined, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zgbmv( 'row-major', 'no-transpose', 10, 10, 10, 10, 10, [], 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zgbmv( 'row-major', 'no-transpose', 10, 10, 10, 10, 10, {}, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a ninth argument of invalid type...
{
	zgbmv( 'row-major', 'no-transpose', 10, 10, 10, 10, 10, new Float64Array( 25 ), '10', new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zgbmv( 'row-major', 'no-transpose', 10, 10, 10, 10, 10, new Float64Array( 25 ), true, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zgbmv( 'row-major', 'no-transpose', 10, 10, 10, 10, 10, new Float64Array( 25 ), false, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zgbmv( 'row-major', 'no-transpose', 10, 10, 10, 10, 10, new Float64Array( 25 ), null, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zgbmv( 'row-major', 'no-transpose', 10, 10, 10, 10, 10, new Float64Array( 25 ), undefined, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zgbmv( 'row-major', 'no-transpose', 10, 10, 10, 10, 10, new Float64Array( 25 ), [], new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zgbmv( 'row-major', 'no-transpose', 10, 10, 10, 10, 10, new Float64Array( 25 ), {}, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a tenth argument of invalid type...
{
	zgbmv( 'row-major', 'no-transpose', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, '10', 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zgbmv( 'row-major', 'no-transpose', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zgbmv( 'row-major', 'no-transpose', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, true, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zgbmv( 'row-major', 'no-transpose', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, null, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zgbmv( 'row-major', 'no-transpose', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, undefined, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zgbmv( 'row-major', 'no-transpose', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, [], 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zgbmv( 'row-major', 'no-transpose', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, {}, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a eleventh argument of invalid type...
{
	zgbmv( 'row-major', 'no-transpose', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), '10', 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zgbmv( 'row-major', 'no-transpose', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), true, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zgbmv( 'row-major', 'no-transpose', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), false, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zgbmv( 'row-major', 'no-transpose', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), null, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zgbmv( 'row-major', 'no-transpose', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), undefined, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zgbmv( 'row-major', 'no-transpose', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), [], 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zgbmv( 'row-major', 'no-transpose', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), {}, 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a twelfth argument of invalid type...
{
	zgbmv( 'row-major', 'no-transpose', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, '10', new Float64Array( 25 ), 10 ); // $ExpectError
	zgbmv( 'row-major', 'no-transpose', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, true, new Float64Array( 25 ), 10 ); // $ExpectError
	zgbmv( 'row-major', 'no-transpose', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, false, new Float64Array( 25 ), 10 ); // $ExpectError
	zgbmv( 'row-major', 'no-transpose', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, null, new Float64Array( 25 ), 10 ); // $ExpectError
	zgbmv( 'row-major', 'no-transpose', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, undefined, new Float64Array( 25 ), 10 ); // $ExpectError
	zgbmv( 'row-major', 'no-transpose', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, [], new Float64Array( 25 ), 10 ); // $ExpectError
	zgbmv( 'row-major', 'no-transpose', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, {}, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a thirteenth argument of invalid type...
{
	zgbmv( 'row-major', 'no-transpose', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, '10', 10 ); // $ExpectError
	zgbmv( 'row-major', 'no-transpose', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10, 10 ); // $ExpectError
	zgbmv( 'row-major', 'no-transpose', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, true, 10 ); // $ExpectError
	zgbmv( 'row-major', 'no-transpose', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, null, 10 ); // $ExpectError
	zgbmv( 'row-major', 'no-transpose', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, undefined, 10 ); // $ExpectError
	zgbmv( 'row-major', 'no-transpose', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, [], 10 ); // $ExpectError
	zgbmv( 'row-major', 'no-transpose', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, {}, 10 ); // $ExpectError
}

// The compiler throws an error if provided a fourteenth argument of invalid type...
{
	zgbmv( 'row-major', 'no-transpose', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), '10' ); // $ExpectError
	zgbmv( 'row-major', 'no-transpose', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), true ); // $ExpectError
	zgbmv( 'row-major', 'no-transpose', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), false ); // $ExpectError
	zgbmv( 'row-major', 'no-transpose', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), null ); // $ExpectError
	zgbmv( 'row-major', 'no-transpose', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), undefined ); // $ExpectError
	zgbmv( 'row-major', 'no-transpose', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), [] ); // $ExpectError
	zgbmv( 'row-major', 'no-transpose', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), {} ); // $ExpectError
}

// The compiler throws an error if provided an unsupported number of arguments...
{
	zgbmv(); // $ExpectError
	zgbmv( 'row-major' ); // $ExpectError
}
