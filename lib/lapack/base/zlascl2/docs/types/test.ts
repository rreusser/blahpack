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

import zlascl2 = require( './index' );


// TESTS //

const zx = null as unknown as Complex128Array;

// The function returns a Complex128Array...
{
	zlascl2( 'row-major', 10, 10, new Float64Array( 25 ), new Float64Array( 25 ), 10 ); // $ExpectType Complex128Array
}

// The compiler throws an error if provided a first argument of invalid type...
{
	zlascl2( 10, 10, 10, new Float64Array( 25 ), new Float64Array( 25 ), 10 ); // $ExpectError
	zlascl2( true, 10, 10, new Float64Array( 25 ), new Float64Array( 25 ), 10 ); // $ExpectError
	zlascl2( null, 10, 10, new Float64Array( 25 ), new Float64Array( 25 ), 10 ); // $ExpectError
	zlascl2( undefined, 10, 10, new Float64Array( 25 ), new Float64Array( 25 ), 10 ); // $ExpectError
	zlascl2( [], 10, 10, new Float64Array( 25 ), new Float64Array( 25 ), 10 ); // $ExpectError
	zlascl2( {}, 10, 10, new Float64Array( 25 ), new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a second argument of invalid type...
{
	zlascl2( 'row-major', '10', 10, new Float64Array( 25 ), new Float64Array( 25 ), 10 ); // $ExpectError
	zlascl2( 'row-major', true, 10, new Float64Array( 25 ), new Float64Array( 25 ), 10 ); // $ExpectError
	zlascl2( 'row-major', false, 10, new Float64Array( 25 ), new Float64Array( 25 ), 10 ); // $ExpectError
	zlascl2( 'row-major', null, 10, new Float64Array( 25 ), new Float64Array( 25 ), 10 ); // $ExpectError
	zlascl2( 'row-major', undefined, 10, new Float64Array( 25 ), new Float64Array( 25 ), 10 ); // $ExpectError
	zlascl2( 'row-major', [], 10, new Float64Array( 25 ), new Float64Array( 25 ), 10 ); // $ExpectError
	zlascl2( 'row-major', {}, 10, new Float64Array( 25 ), new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a third argument of invalid type...
{
	zlascl2( 'row-major', 10, '10', new Float64Array( 25 ), new Float64Array( 25 ), 10 ); // $ExpectError
	zlascl2( 'row-major', 10, true, new Float64Array( 25 ), new Float64Array( 25 ), 10 ); // $ExpectError
	zlascl2( 'row-major', 10, false, new Float64Array( 25 ), new Float64Array( 25 ), 10 ); // $ExpectError
	zlascl2( 'row-major', 10, null, new Float64Array( 25 ), new Float64Array( 25 ), 10 ); // $ExpectError
	zlascl2( 'row-major', 10, undefined, new Float64Array( 25 ), new Float64Array( 25 ), 10 ); // $ExpectError
	zlascl2( 'row-major', 10, [], new Float64Array( 25 ), new Float64Array( 25 ), 10 ); // $ExpectError
	zlascl2( 'row-major', 10, {}, new Float64Array( 25 ), new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a fourth argument of invalid type...
{
	zlascl2( 'row-major', 10, 10, '10', new Float64Array( 25 ), 10 ); // $ExpectError
	zlascl2( 'row-major', 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zlascl2( 'row-major', 10, 10, true, new Float64Array( 25 ), 10 ); // $ExpectError
	zlascl2( 'row-major', 10, 10, null, new Float64Array( 25 ), 10 ); // $ExpectError
	zlascl2( 'row-major', 10, 10, undefined, new Float64Array( 25 ), 10 ); // $ExpectError
	zlascl2( 'row-major', 10, 10, [], new Float64Array( 25 ), 10 ); // $ExpectError
	zlascl2( 'row-major', 10, 10, {}, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a fifth argument of invalid type...
{
	zlascl2( 'row-major', 10, 10, new Float64Array( 25 ), '10', 10 ); // $ExpectError
	zlascl2( 'row-major', 10, 10, new Float64Array( 25 ), 10, 10 ); // $ExpectError
	zlascl2( 'row-major', 10, 10, new Float64Array( 25 ), true, 10 ); // $ExpectError
	zlascl2( 'row-major', 10, 10, new Float64Array( 25 ), null, 10 ); // $ExpectError
	zlascl2( 'row-major', 10, 10, new Float64Array( 25 ), undefined, 10 ); // $ExpectError
	zlascl2( 'row-major', 10, 10, new Float64Array( 25 ), [], 10 ); // $ExpectError
	zlascl2( 'row-major', 10, 10, new Float64Array( 25 ), {}, 10 ); // $ExpectError
}

// The compiler throws an error if provided a sixth argument of invalid type...
{
	zlascl2( 'row-major', 10, 10, new Float64Array( 25 ), new Float64Array( 25 ), '10' ); // $ExpectError
	zlascl2( 'row-major', 10, 10, new Float64Array( 25 ), new Float64Array( 25 ), true ); // $ExpectError
	zlascl2( 'row-major', 10, 10, new Float64Array( 25 ), new Float64Array( 25 ), false ); // $ExpectError
	zlascl2( 'row-major', 10, 10, new Float64Array( 25 ), new Float64Array( 25 ), null ); // $ExpectError
	zlascl2( 'row-major', 10, 10, new Float64Array( 25 ), new Float64Array( 25 ), undefined ); // $ExpectError
	zlascl2( 'row-major', 10, 10, new Float64Array( 25 ), new Float64Array( 25 ), [] ); // $ExpectError
	zlascl2( 'row-major', 10, 10, new Float64Array( 25 ), new Float64Array( 25 ), {} ); // $ExpectError
}

// The compiler throws an error if provided an unsupported number of arguments...
{
	zlascl2(); // $ExpectError
	zlascl2( 'row-major' ); // $ExpectError
}
