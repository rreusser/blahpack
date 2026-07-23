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

import dsptri = require( './index' );


// TESTS //

// The function returns a number...
{
	dsptri( 'upper', 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectType number
}

// The compiler throws an error if provided a first argument of invalid type...
{
	dsptri( 10, 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dsptri( true, 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dsptri( null, 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dsptri( undefined, 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dsptri( [], 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dsptri( {}, 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a second argument of invalid type...
{
	dsptri( 'upper', '10', new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dsptri( 'upper', true, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dsptri( 'upper', false, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dsptri( 'upper', null, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dsptri( 'upper', undefined, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dsptri( 'upper', [], new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dsptri( 'upper', {}, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a third argument of invalid type...
{
	dsptri( 'upper', 10, '10', new Int32Array( 25 ) ); // $ExpectError
	dsptri( 'upper', 10, 10, new Int32Array( 25 ) ); // $ExpectError
	dsptri( 'upper', 10, true, new Int32Array( 25 ) ); // $ExpectError
	dsptri( 'upper', 10, null, new Int32Array( 25 ) ); // $ExpectError
	dsptri( 'upper', 10, undefined, new Int32Array( 25 ) ); // $ExpectError
	dsptri( 'upper', 10, [], new Int32Array( 25 ) ); // $ExpectError
	dsptri( 'upper', 10, {}, new Int32Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a fourth argument of invalid type...
{
	dsptri( 'upper', 10, new Float64Array( 25 ), '10' ); // $ExpectError
	dsptri( 'upper', 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dsptri( 'upper', 10, new Float64Array( 25 ), true ); // $ExpectError
	dsptri( 'upper', 10, new Float64Array( 25 ), null ); // $ExpectError
	dsptri( 'upper', 10, new Float64Array( 25 ), undefined ); // $ExpectError
	dsptri( 'upper', 10, new Float64Array( 25 ), [] ); // $ExpectError
	dsptri( 'upper', 10, new Float64Array( 25 ), {} ); // $ExpectError
}

// The compiler throws an error if provided an unsupported number of arguments...
{
	dsptri(); // $ExpectError
	dsptri( 'upper' ); // $ExpectError
}
