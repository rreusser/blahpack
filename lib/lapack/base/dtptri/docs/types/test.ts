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

import dtptri = require( './index' );


// TESTS //

// The function returns a number...
{
	dtptri( 'upper', 'unit', 10, new Float64Array( 25 ) ); // $ExpectType number
}

// The compiler throws an error if provided a first argument of invalid type...
{
	dtptri( 10, 'unit', 10, new Float64Array( 25 ) ); // $ExpectError
	dtptri( true, 'unit', 10, new Float64Array( 25 ) ); // $ExpectError
	dtptri( null, 'unit', 10, new Float64Array( 25 ) ); // $ExpectError
	dtptri( undefined, 'unit', 10, new Float64Array( 25 ) ); // $ExpectError
	dtptri( [], 'unit', 10, new Float64Array( 25 ) ); // $ExpectError
	dtptri( {}, 'unit', 10, new Float64Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a second argument of invalid type...
{
	dtptri( 'upper', 10, 10, new Float64Array( 25 ) ); // $ExpectError
	dtptri( 'upper', true, 10, new Float64Array( 25 ) ); // $ExpectError
	dtptri( 'upper', null, 10, new Float64Array( 25 ) ); // $ExpectError
	dtptri( 'upper', undefined, 10, new Float64Array( 25 ) ); // $ExpectError
	dtptri( 'upper', [], 10, new Float64Array( 25 ) ); // $ExpectError
	dtptri( 'upper', {}, 10, new Float64Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a third argument of invalid type...
{
	dtptri( 'upper', 'unit', '10', new Float64Array( 25 ) ); // $ExpectError
	dtptri( 'upper', 'unit', true, new Float64Array( 25 ) ); // $ExpectError
	dtptri( 'upper', 'unit', false, new Float64Array( 25 ) ); // $ExpectError
	dtptri( 'upper', 'unit', null, new Float64Array( 25 ) ); // $ExpectError
	dtptri( 'upper', 'unit', undefined, new Float64Array( 25 ) ); // $ExpectError
	dtptri( 'upper', 'unit', [], new Float64Array( 25 ) ); // $ExpectError
	dtptri( 'upper', 'unit', {}, new Float64Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a fourth argument of invalid type...
{
	dtptri( 'upper', 'unit', 10, '10' ); // $ExpectError
	dtptri( 'upper', 'unit', 10, 10 ); // $ExpectError
	dtptri( 'upper', 'unit', 10, true ); // $ExpectError
	dtptri( 'upper', 'unit', 10, null ); // $ExpectError
	dtptri( 'upper', 'unit', 10, undefined ); // $ExpectError
	dtptri( 'upper', 'unit', 10, [] ); // $ExpectError
	dtptri( 'upper', 'unit', 10, {} ); // $ExpectError
}

// The compiler throws an error if provided an unsupported number of arguments...
{
	dtptri(); // $ExpectError
	dtptri( 'upper' ); // $ExpectError
}
