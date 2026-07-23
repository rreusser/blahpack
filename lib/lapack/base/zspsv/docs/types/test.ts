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

import zspsv = require( './index' );


// TESTS //

// The function returns a number...
{
	zspsv( 'upper', 10, 10, new Float64Array( 25 ), new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectType number
}

// The compiler throws an error if provided a first argument of invalid type...
{
	zspsv( 10, 10, 10, new Float64Array( 25 ), new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zspsv( true, 10, 10, new Float64Array( 25 ), new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zspsv( null, 10, 10, new Float64Array( 25 ), new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zspsv( undefined, 10, 10, new Float64Array( 25 ), new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zspsv( [], 10, 10, new Float64Array( 25 ), new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zspsv( {}, 10, 10, new Float64Array( 25 ), new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a second argument of invalid type...
{
	zspsv( 'upper', '10', 10, new Float64Array( 25 ), new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zspsv( 'upper', true, 10, new Float64Array( 25 ), new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zspsv( 'upper', false, 10, new Float64Array( 25 ), new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zspsv( 'upper', null, 10, new Float64Array( 25 ), new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zspsv( 'upper', undefined, 10, new Float64Array( 25 ), new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zspsv( 'upper', [], 10, new Float64Array( 25 ), new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zspsv( 'upper', {}, 10, new Float64Array( 25 ), new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a third argument of invalid type...
{
	zspsv( 'upper', 10, '10', new Float64Array( 25 ), new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zspsv( 'upper', 10, true, new Float64Array( 25 ), new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zspsv( 'upper', 10, false, new Float64Array( 25 ), new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zspsv( 'upper', 10, null, new Float64Array( 25 ), new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zspsv( 'upper', 10, undefined, new Float64Array( 25 ), new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zspsv( 'upper', 10, [], new Float64Array( 25 ), new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zspsv( 'upper', 10, {}, new Float64Array( 25 ), new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a fourth argument of invalid type...
{
	zspsv( 'upper', 10, 10, '10', new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zspsv( 'upper', 10, 10, 10, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zspsv( 'upper', 10, 10, true, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zspsv( 'upper', 10, 10, null, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zspsv( 'upper', 10, 10, undefined, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zspsv( 'upper', 10, 10, [], new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zspsv( 'upper', 10, 10, {}, new Int32Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a fifth argument of invalid type...
{
	zspsv( 'upper', 10, 10, new Float64Array( 25 ), '10', 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zspsv( 'upper', 10, 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zspsv( 'upper', 10, 10, new Float64Array( 25 ), true, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zspsv( 'upper', 10, 10, new Float64Array( 25 ), null, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zspsv( 'upper', 10, 10, new Float64Array( 25 ), undefined, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zspsv( 'upper', 10, 10, new Float64Array( 25 ), [], 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zspsv( 'upper', 10, 10, new Float64Array( 25 ), {}, 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a sixth argument of invalid type...
{
	zspsv( 'upper', 10, 10, new Float64Array( 25 ), new Int32Array( 25 ), '10', new Float64Array( 25 ), 10 ); // $ExpectError
	zspsv( 'upper', 10, 10, new Float64Array( 25 ), new Int32Array( 25 ), true, new Float64Array( 25 ), 10 ); // $ExpectError
	zspsv( 'upper', 10, 10, new Float64Array( 25 ), new Int32Array( 25 ), false, new Float64Array( 25 ), 10 ); // $ExpectError
	zspsv( 'upper', 10, 10, new Float64Array( 25 ), new Int32Array( 25 ), null, new Float64Array( 25 ), 10 ); // $ExpectError
	zspsv( 'upper', 10, 10, new Float64Array( 25 ), new Int32Array( 25 ), undefined, new Float64Array( 25 ), 10 ); // $ExpectError
	zspsv( 'upper', 10, 10, new Float64Array( 25 ), new Int32Array( 25 ), [], new Float64Array( 25 ), 10 ); // $ExpectError
	zspsv( 'upper', 10, 10, new Float64Array( 25 ), new Int32Array( 25 ), {}, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a seventh argument of invalid type...
{
	zspsv( 'upper', 10, 10, new Float64Array( 25 ), new Int32Array( 25 ), 10, '10', 10 ); // $ExpectError
	zspsv( 'upper', 10, 10, new Float64Array( 25 ), new Int32Array( 25 ), 10, 10, 10 ); // $ExpectError
	zspsv( 'upper', 10, 10, new Float64Array( 25 ), new Int32Array( 25 ), 10, true, 10 ); // $ExpectError
	zspsv( 'upper', 10, 10, new Float64Array( 25 ), new Int32Array( 25 ), 10, null, 10 ); // $ExpectError
	zspsv( 'upper', 10, 10, new Float64Array( 25 ), new Int32Array( 25 ), 10, undefined, 10 ); // $ExpectError
	zspsv( 'upper', 10, 10, new Float64Array( 25 ), new Int32Array( 25 ), 10, [], 10 ); // $ExpectError
	zspsv( 'upper', 10, 10, new Float64Array( 25 ), new Int32Array( 25 ), 10, {}, 10 ); // $ExpectError
}

// The compiler throws an error if provided a eighth argument of invalid type...
{
	zspsv( 'upper', 10, 10, new Float64Array( 25 ), new Int32Array( 25 ), 10, new Float64Array( 25 ), '10' ); // $ExpectError
	zspsv( 'upper', 10, 10, new Float64Array( 25 ), new Int32Array( 25 ), 10, new Float64Array( 25 ), true ); // $ExpectError
	zspsv( 'upper', 10, 10, new Float64Array( 25 ), new Int32Array( 25 ), 10, new Float64Array( 25 ), false ); // $ExpectError
	zspsv( 'upper', 10, 10, new Float64Array( 25 ), new Int32Array( 25 ), 10, new Float64Array( 25 ), null ); // $ExpectError
	zspsv( 'upper', 10, 10, new Float64Array( 25 ), new Int32Array( 25 ), 10, new Float64Array( 25 ), undefined ); // $ExpectError
	zspsv( 'upper', 10, 10, new Float64Array( 25 ), new Int32Array( 25 ), 10, new Float64Array( 25 ), [] ); // $ExpectError
	zspsv( 'upper', 10, 10, new Float64Array( 25 ), new Int32Array( 25 ), 10, new Float64Array( 25 ), {} ); // $ExpectError
}

// The compiler throws an error if provided an unsupported number of arguments...
{
	zspsv(); // $ExpectError
	zspsv( 'upper' ); // $ExpectError
}
