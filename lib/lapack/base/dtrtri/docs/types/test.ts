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

import dtrtri = require( './index' );


// TESTS //

// The function returns a number...
{
	dtrtri( 'row-major', 'upper', 'unit', 10, new Float64Array( 25 ), 10 ); // $ExpectType number
}

// The compiler throws an error if provided a first argument of invalid type...
{
	dtrtri( 10, 'upper', 'unit', 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dtrtri( true, 'upper', 'unit', 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dtrtri( null, 'upper', 'unit', 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dtrtri( undefined, 'upper', 'unit', 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dtrtri( [], 'upper', 'unit', 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dtrtri( {}, 'upper', 'unit', 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a second argument of invalid type...
{
	dtrtri( 'row-major', 10, 'unit', 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dtrtri( 'row-major', true, 'unit', 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dtrtri( 'row-major', null, 'unit', 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dtrtri( 'row-major', undefined, 'unit', 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dtrtri( 'row-major', [], 'unit', 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dtrtri( 'row-major', {}, 'unit', 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a third argument of invalid type...
{
	dtrtri( 'row-major', 'upper', 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dtrtri( 'row-major', 'upper', true, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dtrtri( 'row-major', 'upper', null, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dtrtri( 'row-major', 'upper', undefined, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dtrtri( 'row-major', 'upper', [], 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dtrtri( 'row-major', 'upper', {}, 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a fourth argument of invalid type...
{
	dtrtri( 'row-major', 'upper', 'unit', '10', new Float64Array( 25 ), 10 ); // $ExpectError
	dtrtri( 'row-major', 'upper', 'unit', true, new Float64Array( 25 ), 10 ); // $ExpectError
	dtrtri( 'row-major', 'upper', 'unit', false, new Float64Array( 25 ), 10 ); // $ExpectError
	dtrtri( 'row-major', 'upper', 'unit', null, new Float64Array( 25 ), 10 ); // $ExpectError
	dtrtri( 'row-major', 'upper', 'unit', undefined, new Float64Array( 25 ), 10 ); // $ExpectError
	dtrtri( 'row-major', 'upper', 'unit', [], new Float64Array( 25 ), 10 ); // $ExpectError
	dtrtri( 'row-major', 'upper', 'unit', {}, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a fifth argument of invalid type...
{
	dtrtri( 'row-major', 'upper', 'unit', 10, '10', 10 ); // $ExpectError
	dtrtri( 'row-major', 'upper', 'unit', 10, 10, 10 ); // $ExpectError
	dtrtri( 'row-major', 'upper', 'unit', 10, true, 10 ); // $ExpectError
	dtrtri( 'row-major', 'upper', 'unit', 10, null, 10 ); // $ExpectError
	dtrtri( 'row-major', 'upper', 'unit', 10, undefined, 10 ); // $ExpectError
	dtrtri( 'row-major', 'upper', 'unit', 10, [], 10 ); // $ExpectError
	dtrtri( 'row-major', 'upper', 'unit', 10, {}, 10 ); // $ExpectError
}

// The compiler throws an error if provided a sixth argument of invalid type...
{
	dtrtri( 'row-major', 'upper', 'unit', 10, new Float64Array( 25 ), '10' ); // $ExpectError
	dtrtri( 'row-major', 'upper', 'unit', 10, new Float64Array( 25 ), true ); // $ExpectError
	dtrtri( 'row-major', 'upper', 'unit', 10, new Float64Array( 25 ), false ); // $ExpectError
	dtrtri( 'row-major', 'upper', 'unit', 10, new Float64Array( 25 ), null ); // $ExpectError
	dtrtri( 'row-major', 'upper', 'unit', 10, new Float64Array( 25 ), undefined ); // $ExpectError
	dtrtri( 'row-major', 'upper', 'unit', 10, new Float64Array( 25 ), [] ); // $ExpectError
	dtrtri( 'row-major', 'upper', 'unit', 10, new Float64Array( 25 ), {} ); // $ExpectError
}

// The compiler throws an error if provided an unsupported number of arguments...
{
	dtrtri(); // $ExpectError
	dtrtri( 'row-major' ); // $ExpectError
}
