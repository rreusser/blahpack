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

import dgges = require( './index' );


// TESTS //

// The function is callable with the documented arguments...
{
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) );
}

// The compiler throws an error if provided a first argument of invalid type...
{
	dgges( 10, 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( true, 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( null, 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( undefined, 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( [], 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( {}, 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a second argument of invalid type...
{
	dgges( 'row-major', '10', 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', true, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', false, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', null, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', undefined, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', [], 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', {}, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a third argument of invalid type...
{
	dgges( 'row-major', 10, '10', 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, true, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, false, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, null, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, undefined, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, [], 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, {}, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a fourth argument of invalid type...
{
	dgges( 'row-major', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, true, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, null, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, undefined, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, [], 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, {}, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a fifth argument of invalid type...
{
	dgges( 'row-major', 10, 10, 'no-transpose', '10', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', true, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', false, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', null, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', undefined, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', [], 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', {}, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a sixth argument of invalid type...
{
	dgges( 'row-major', 10, 10, 'no-transpose', 10, '10', new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', 10, true, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', 10, false, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', 10, null, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', 10, undefined, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', 10, [], new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', 10, {}, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a seventh argument of invalid type...
{
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, '10', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, true, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, null, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, undefined, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, [], 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, {}, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a eighth argument of invalid type...
{
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), '10', new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), true, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), false, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), null, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), undefined, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), [], new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), {}, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a ninth argument of invalid type...
{
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, '10', 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, 10, 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, true, 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, null, 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, undefined, 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, [], 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, {}, 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a tenth argument of invalid type...
{
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), '10', new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), true, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), false, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), null, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), undefined, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), [], new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), {}, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a eleventh argument of invalid type...
{
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, '10', new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, true, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, null, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, undefined, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, [], new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, {}, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a twelfth argument of invalid type...
{
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), '10', new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), true, new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), null, new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), undefined, new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), [], new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), {}, new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a thirteenth argument of invalid type...
{
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), '10', new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), true, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), null, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), undefined, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), [], new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), {}, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a fourteenth argument of invalid type...
{
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), '10', 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), true, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), null, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), undefined, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), [], 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), {}, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a fifteenth argument of invalid type...
{
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), '10', new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), true, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), false, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), null, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), undefined, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), [], new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), {}, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a sixteenth argument of invalid type...
{
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, '10', 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, 10, 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, true, 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, null, 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, undefined, 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, [], 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, {}, 10, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a seventeenth argument of invalid type...
{
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), '10', new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), true, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), false, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), null, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), undefined, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), [], new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), {}, new Float64Array( 25 ), new Int32Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a eighteenth argument of invalid type...
{
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, '10', new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, 10, new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, true, new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, null, new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, undefined, new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, [], new Int32Array( 25 ) ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, {}, new Int32Array( 25 ) ); // $ExpectError
}

// The compiler throws an error if provided a nineteenth argument of invalid type...
{
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), '10' ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10 ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), true ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), null ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), undefined ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), [] ); // $ExpectError
	dgges( 'row-major', 10, 10, 'no-transpose', 10, 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), new Float64Array( 25 ), 10, new Float64Array( 25 ), 10, new Float64Array( 25 ), {} ); // $ExpectError
}

// The compiler throws an error if provided an unsupported number of arguments...
{
	dgges(); // $ExpectError
	dgges( 'row-major' ); // $ExpectError
}
