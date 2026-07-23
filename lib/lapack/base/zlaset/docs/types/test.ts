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

import zlaset = require( './index' );


// TESTS //

const zx = null as unknown as Complex128Array;

// The function returns a Complex128Array...
{
	zlaset( 'row-major', 'upper', 10, 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectType Complex128Array
}

// The compiler throws an error if provided a first argument of invalid type...
{
	zlaset( 10, 'upper', 10, 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zlaset( true, 'upper', 10, 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zlaset( null, 'upper', 10, 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zlaset( undefined, 'upper', 10, 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zlaset( [], 'upper', 10, 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zlaset( {}, 'upper', 10, 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a second argument of invalid type...
{
	zlaset( 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zlaset( 'row-major', true, 10, 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zlaset( 'row-major', null, 10, 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zlaset( 'row-major', undefined, 10, 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zlaset( 'row-major', [], 10, 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zlaset( 'row-major', {}, 10, 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a third argument of invalid type...
{
	zlaset( 'row-major', 'upper', '10', 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zlaset( 'row-major', 'upper', true, 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zlaset( 'row-major', 'upper', false, 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zlaset( 'row-major', 'upper', null, 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zlaset( 'row-major', 'upper', undefined, 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zlaset( 'row-major', 'upper', [], 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zlaset( 'row-major', 'upper', {}, 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a fourth argument of invalid type...
{
	zlaset( 'row-major', 'upper', 10, '10', 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zlaset( 'row-major', 'upper', 10, true, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zlaset( 'row-major', 'upper', 10, false, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zlaset( 'row-major', 'upper', 10, null, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zlaset( 'row-major', 'upper', 10, undefined, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zlaset( 'row-major', 'upper', 10, [], 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zlaset( 'row-major', 'upper', 10, {}, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a fifth argument of invalid type...
{
	zlaset( 'row-major', 'upper', 10, 10, '10', 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zlaset( 'row-major', 'upper', 10, 10, true, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zlaset( 'row-major', 'upper', 10, 10, false, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zlaset( 'row-major', 'upper', 10, 10, null, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zlaset( 'row-major', 'upper', 10, 10, undefined, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zlaset( 'row-major', 'upper', 10, 10, [], 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zlaset( 'row-major', 'upper', 10, 10, {}, 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a sixth argument of invalid type...
{
	zlaset( 'row-major', 'upper', 10, 10, 10, '10', new Float64Array( 25 ), 10 ); // $ExpectError
	zlaset( 'row-major', 'upper', 10, 10, 10, true, new Float64Array( 25 ), 10 ); // $ExpectError
	zlaset( 'row-major', 'upper', 10, 10, 10, false, new Float64Array( 25 ), 10 ); // $ExpectError
	zlaset( 'row-major', 'upper', 10, 10, 10, null, new Float64Array( 25 ), 10 ); // $ExpectError
	zlaset( 'row-major', 'upper', 10, 10, 10, undefined, new Float64Array( 25 ), 10 ); // $ExpectError
	zlaset( 'row-major', 'upper', 10, 10, 10, [], new Float64Array( 25 ), 10 ); // $ExpectError
	zlaset( 'row-major', 'upper', 10, 10, 10, {}, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a seventh argument of invalid type...
{
	zlaset( 'row-major', 'upper', 10, 10, 10, 10, '10', 10 ); // $ExpectError
	zlaset( 'row-major', 'upper', 10, 10, 10, 10, 10, 10 ); // $ExpectError
	zlaset( 'row-major', 'upper', 10, 10, 10, 10, true, 10 ); // $ExpectError
	zlaset( 'row-major', 'upper', 10, 10, 10, 10, null, 10 ); // $ExpectError
	zlaset( 'row-major', 'upper', 10, 10, 10, 10, undefined, 10 ); // $ExpectError
	zlaset( 'row-major', 'upper', 10, 10, 10, 10, [], 10 ); // $ExpectError
	zlaset( 'row-major', 'upper', 10, 10, 10, 10, {}, 10 ); // $ExpectError
}

// The compiler throws an error if provided a eighth argument of invalid type...
{
	zlaset( 'row-major', 'upper', 10, 10, 10, 10, new Float64Array( 25 ), '10' ); // $ExpectError
	zlaset( 'row-major', 'upper', 10, 10, 10, 10, new Float64Array( 25 ), true ); // $ExpectError
	zlaset( 'row-major', 'upper', 10, 10, 10, 10, new Float64Array( 25 ), false ); // $ExpectError
	zlaset( 'row-major', 'upper', 10, 10, 10, 10, new Float64Array( 25 ), null ); // $ExpectError
	zlaset( 'row-major', 'upper', 10, 10, 10, 10, new Float64Array( 25 ), undefined ); // $ExpectError
	zlaset( 'row-major', 'upper', 10, 10, 10, 10, new Float64Array( 25 ), [] ); // $ExpectError
	zlaset( 'row-major', 'upper', 10, 10, 10, 10, new Float64Array( 25 ), {} ); // $ExpectError
}

// The compiler throws an error if provided an unsupported number of arguments...
{
	zlaset(); // $ExpectError
	zlaset( 'row-major' ); // $ExpectError
}
