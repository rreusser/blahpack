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

import dpptri = require( './index' );


// TESTS //

// The function returns a number...
{
	dpptri( 'upper', 10, new Float64Array( 25 ) ); // $ExpectType number
}

// The compiler throws an error if provided a first argument of invalid type...
{
	dpptri( 10, 10, new Float64Array( 25 ) ); // $ExpectError
	dpptri( true, 10, new Float64Array( 25 ) ); // $ExpectError
	dpptri( null, 10, new Float64Array( 25 ) ); // $ExpectError
	dpptri( undefined, 10, new Float64Array( 25 ) ); // $ExpectError
	dpptri( [], 10, new Float64Array( 25 ) ); // $ExpectError
	dpptri( {}, 10, new Float64Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a second argument of invalid type...
{
	dpptri( 'upper', '10', new Float64Array( 25 ) ); // $ExpectError
	dpptri( 'upper', true, new Float64Array( 25 ) ); // $ExpectError
	dpptri( 'upper', false, new Float64Array( 25 ) ); // $ExpectError
	dpptri( 'upper', null, new Float64Array( 25 ) ); // $ExpectError
	dpptri( 'upper', undefined, new Float64Array( 25 ) ); // $ExpectError
	dpptri( 'upper', [], new Float64Array( 25 ) ); // $ExpectError
	dpptri( 'upper', {}, new Float64Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a third argument of invalid type...
{
	dpptri( 'upper', 10, '10' ); // $ExpectError
	dpptri( 'upper', 10, 10 ); // $ExpectError
	dpptri( 'upper', 10, true ); // $ExpectError
	dpptri( 'upper', 10, null ); // $ExpectError
	dpptri( 'upper', 10, undefined ); // $ExpectError
	dpptri( 'upper', 10, [] ); // $ExpectError
	dpptri( 'upper', 10, {} ); // $ExpectError
}

// The compiler throws an error if provided an unsupported number of arguments...
{
	dpptri(); // $ExpectError
	dpptri( 'upper' ); // $ExpectError
}
