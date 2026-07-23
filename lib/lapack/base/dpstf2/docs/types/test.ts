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

import dpstf2 = require( './index' );


// TESTS //

// The function returns a number...
{
	dpstf2( 'row-major', 'upper', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10 ); // $ExpectType number
}

// The compiler throws an error if provided a first argument of invalid type...
{
	dpstf2( 10, 'upper', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10 ); // $ExpectError
	dpstf2( true, 'upper', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10 ); // $ExpectError
	dpstf2( null, 'upper', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10 ); // $ExpectError
	dpstf2( undefined, 'upper', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10 ); // $ExpectError
	dpstf2( [], 'upper', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10 ); // $ExpectError
	dpstf2( {}, 'upper', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10 ); // $ExpectError
}

// The compiler throws an error if provided a second argument of invalid type...
{
	dpstf2( 'row-major', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10 ); // $ExpectError
	dpstf2( 'row-major', true, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10 ); // $ExpectError
	dpstf2( 'row-major', null, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10 ); // $ExpectError
	dpstf2( 'row-major', undefined, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10 ); // $ExpectError
	dpstf2( 'row-major', [], 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10 ); // $ExpectError
	dpstf2( 'row-major', {}, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10 ); // $ExpectError
}

// The compiler throws an error if provided a third argument of invalid type...
{
	dpstf2( 'row-major', 'upper', '10', new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10 ); // $ExpectError
	dpstf2( 'row-major', 'upper', true, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10 ); // $ExpectError
	dpstf2( 'row-major', 'upper', false, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10 ); // $ExpectError
	dpstf2( 'row-major', 'upper', null, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10 ); // $ExpectError
	dpstf2( 'row-major', 'upper', undefined, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10 ); // $ExpectError
	dpstf2( 'row-major', 'upper', [], new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10 ); // $ExpectError
	dpstf2( 'row-major', 'upper', {}, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, 10 ); // $ExpectError
}

// The compiler throws an error if provided a fourth argument of invalid type...
{
	dpstf2( 'row-major', 'upper', 10, '10', 10, new Float64Array( 25 ), 10, 10, 10 ); // $ExpectError
	dpstf2( 'row-major', 'upper', 10, 10, 10, new Float64Array( 25 ), 10, 10, 10 ); // $ExpectError
	dpstf2( 'row-major', 'upper', 10, true, 10, new Float64Array( 25 ), 10, 10, 10 ); // $ExpectError
	dpstf2( 'row-major', 'upper', 10, null, 10, new Float64Array( 25 ), 10, 10, 10 ); // $ExpectError
	dpstf2( 'row-major', 'upper', 10, undefined, 10, new Float64Array( 25 ), 10, 10, 10 ); // $ExpectError
	dpstf2( 'row-major', 'upper', 10, [], 10, new Float64Array( 25 ), 10, 10, 10 ); // $ExpectError
	dpstf2( 'row-major', 'upper', 10, {}, 10, new Float64Array( 25 ), 10, 10, 10 ); // $ExpectError
}

// The compiler throws an error if provided a fifth argument of invalid type...
{
	dpstf2( 'row-major', 'upper', 10, new Float64Array( 25 ), '10', new Float64Array( 25 ), 10, 10, 10 ); // $ExpectError
	dpstf2( 'row-major', 'upper', 10, new Float64Array( 25 ), true, new Float64Array( 25 ), 10, 10, 10 ); // $ExpectError
	dpstf2( 'row-major', 'upper', 10, new Float64Array( 25 ), false, new Float64Array( 25 ), 10, 10, 10 ); // $ExpectError
	dpstf2( 'row-major', 'upper', 10, new Float64Array( 25 ), null, new Float64Array( 25 ), 10, 10, 10 ); // $ExpectError
	dpstf2( 'row-major', 'upper', 10, new Float64Array( 25 ), undefined, new Float64Array( 25 ), 10, 10, 10 ); // $ExpectError
	dpstf2( 'row-major', 'upper', 10, new Float64Array( 25 ), [], new Float64Array( 25 ), 10, 10, 10 ); // $ExpectError
	dpstf2( 'row-major', 'upper', 10, new Float64Array( 25 ), {}, new Float64Array( 25 ), 10, 10, 10 ); // $ExpectError
}

// The compiler throws an error if provided a sixth argument of invalid type...
{
	dpstf2( 'row-major', 'upper', 10, new Float64Array( 25 ), 10, '10', 10, 10, 10 ); // $ExpectError
	dpstf2( 'row-major', 'upper', 10, new Float64Array( 25 ), 10, 10, 10, 10, 10 ); // $ExpectError
	dpstf2( 'row-major', 'upper', 10, new Float64Array( 25 ), 10, true, 10, 10, 10 ); // $ExpectError
	dpstf2( 'row-major', 'upper', 10, new Float64Array( 25 ), 10, null, 10, 10, 10 ); // $ExpectError
	dpstf2( 'row-major', 'upper', 10, new Float64Array( 25 ), 10, undefined, 10, 10, 10 ); // $ExpectError
	dpstf2( 'row-major', 'upper', 10, new Float64Array( 25 ), 10, [], 10, 10, 10 ); // $ExpectError
	dpstf2( 'row-major', 'upper', 10, new Float64Array( 25 ), 10, {}, 10, 10, 10 ); // $ExpectError
}

// The compiler throws an error if provided a seventh argument of invalid type...
{
	dpstf2( 'row-major', 'upper', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), '10', 10, 10 ); // $ExpectError
	dpstf2( 'row-major', 'upper', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), true, 10, 10 ); // $ExpectError
	dpstf2( 'row-major', 'upper', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), false, 10, 10 ); // $ExpectError
	dpstf2( 'row-major', 'upper', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), null, 10, 10 ); // $ExpectError
	dpstf2( 'row-major', 'upper', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), undefined, 10, 10 ); // $ExpectError
	dpstf2( 'row-major', 'upper', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), [], 10, 10 ); // $ExpectError
	dpstf2( 'row-major', 'upper', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), {}, 10, 10 ); // $ExpectError
}

// The compiler throws an error if provided a eighth argument of invalid type...
{
	dpstf2( 'row-major', 'upper', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, '10', 10 ); // $ExpectError
	dpstf2( 'row-major', 'upper', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, true, 10 ); // $ExpectError
	dpstf2( 'row-major', 'upper', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, false, 10 ); // $ExpectError
	dpstf2( 'row-major', 'upper', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, null, 10 ); // $ExpectError
	dpstf2( 'row-major', 'upper', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, undefined, 10 ); // $ExpectError
	dpstf2( 'row-major', 'upper', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, [], 10 ); // $ExpectError
	dpstf2( 'row-major', 'upper', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, {}, 10 ); // $ExpectError
}

// The compiler throws an error if provided a ninth argument of invalid type...
{
	dpstf2( 'row-major', 'upper', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, '10' ); // $ExpectError
	dpstf2( 'row-major', 'upper', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, true ); // $ExpectError
	dpstf2( 'row-major', 'upper', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, false ); // $ExpectError
	dpstf2( 'row-major', 'upper', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, null ); // $ExpectError
	dpstf2( 'row-major', 'upper', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, undefined ); // $ExpectError
	dpstf2( 'row-major', 'upper', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, [] ); // $ExpectError
	dpstf2( 'row-major', 'upper', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, {} ); // $ExpectError
}

// The compiler throws an error if provided an unsupported number of arguments...
{
	dpstf2(); // $ExpectError
	dpstf2( 'row-major' ); // $ExpectError
}
