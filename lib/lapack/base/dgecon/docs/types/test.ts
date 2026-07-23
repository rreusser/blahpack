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

import dgecon = require( './index' );


// TESTS //

// The function returns a number...
{
	dgecon( 'row-major', 'no-transpose', 10, new Float64Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectType number
}

// The compiler throws an error if provided a first argument of invalid type...
{
	dgecon( 10, 'no-transpose', 10, new Float64Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dgecon( true, 'no-transpose', 10, new Float64Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dgecon( null, 'no-transpose', 10, new Float64Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dgecon( undefined, 'no-transpose', 10, new Float64Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dgecon( [], 'no-transpose', 10, new Float64Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dgecon( {}, 'no-transpose', 10, new Float64Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a second argument of invalid type...
{
	dgecon( 'row-major', 10, 10, new Float64Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dgecon( 'row-major', true, 10, new Float64Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dgecon( 'row-major', null, 10, new Float64Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dgecon( 'row-major', undefined, 10, new Float64Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dgecon( 'row-major', [], 10, new Float64Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dgecon( 'row-major', {}, 10, new Float64Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a third argument of invalid type...
{
	dgecon( 'row-major', 'no-transpose', '10', new Float64Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dgecon( 'row-major', 'no-transpose', true, new Float64Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dgecon( 'row-major', 'no-transpose', false, new Float64Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dgecon( 'row-major', 'no-transpose', null, new Float64Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dgecon( 'row-major', 'no-transpose', undefined, new Float64Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dgecon( 'row-major', 'no-transpose', [], new Float64Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dgecon( 'row-major', 'no-transpose', {}, new Float64Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a fourth argument of invalid type...
{
	dgecon( 'row-major', 'no-transpose', 10, '10', 10, 10, 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dgecon( 'row-major', 'no-transpose', 10, 10, 10, 10, 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dgecon( 'row-major', 'no-transpose', 10, true, 10, 10, 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dgecon( 'row-major', 'no-transpose', 10, null, 10, 10, 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dgecon( 'row-major', 'no-transpose', 10, undefined, 10, 10, 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dgecon( 'row-major', 'no-transpose', 10, [], 10, 10, 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dgecon( 'row-major', 'no-transpose', 10, {}, 10, 10, 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a fifth argument of invalid type...
{
	dgecon( 'row-major', 'no-transpose', 10, new Float64Array( 25 ), '10', 10, 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dgecon( 'row-major', 'no-transpose', 10, new Float64Array( 25 ), true, 10, 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dgecon( 'row-major', 'no-transpose', 10, new Float64Array( 25 ), false, 10, 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dgecon( 'row-major', 'no-transpose', 10, new Float64Array( 25 ), null, 10, 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dgecon( 'row-major', 'no-transpose', 10, new Float64Array( 25 ), undefined, 10, 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dgecon( 'row-major', 'no-transpose', 10, new Float64Array( 25 ), [], 10, 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dgecon( 'row-major', 'no-transpose', 10, new Float64Array( 25 ), {}, 10, 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a sixth argument of invalid type...
{
	dgecon( 'row-major', 'no-transpose', 10, new Float64Array( 25 ), 10, '10', 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dgecon( 'row-major', 'no-transpose', 10, new Float64Array( 25 ), 10, true, 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dgecon( 'row-major', 'no-transpose', 10, new Float64Array( 25 ), 10, false, 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dgecon( 'row-major', 'no-transpose', 10, new Float64Array( 25 ), 10, null, 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dgecon( 'row-major', 'no-transpose', 10, new Float64Array( 25 ), 10, undefined, 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dgecon( 'row-major', 'no-transpose', 10, new Float64Array( 25 ), 10, [], 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dgecon( 'row-major', 'no-transpose', 10, new Float64Array( 25 ), 10, {}, 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a seventh argument of invalid type...
{
	dgecon( 'row-major', 'no-transpose', 10, new Float64Array( 25 ), 10, 10, '10', new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dgecon( 'row-major', 'no-transpose', 10, new Float64Array( 25 ), 10, 10, true, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dgecon( 'row-major', 'no-transpose', 10, new Float64Array( 25 ), 10, 10, false, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dgecon( 'row-major', 'no-transpose', 10, new Float64Array( 25 ), 10, 10, null, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dgecon( 'row-major', 'no-transpose', 10, new Float64Array( 25 ), 10, 10, undefined, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dgecon( 'row-major', 'no-transpose', 10, new Float64Array( 25 ), 10, 10, [], new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dgecon( 'row-major', 'no-transpose', 10, new Float64Array( 25 ), 10, 10, {}, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a eighth argument of invalid type...
{
	dgecon( 'row-major', 'no-transpose', 10, new Float64Array( 25 ), 10, 10, 10, '10', 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dgecon( 'row-major', 'no-transpose', 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dgecon( 'row-major', 'no-transpose', 10, new Float64Array( 25 ), 10, 10, 10, true, 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dgecon( 'row-major', 'no-transpose', 10, new Float64Array( 25 ), 10, 10, 10, null, 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dgecon( 'row-major', 'no-transpose', 10, new Float64Array( 25 ), 10, 10, 10, undefined, 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dgecon( 'row-major', 'no-transpose', 10, new Float64Array( 25 ), 10, 10, 10, [], 10, new Int32Array( 25 ), 10 ); // $ExpectError
	dgecon( 'row-major', 'no-transpose', 10, new Float64Array( 25 ), 10, 10, 10, {}, 10, new Int32Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a ninth argument of invalid type...
{
	dgecon( 'row-major', 'no-transpose', 10, new Float64Array( 25 ), 10, 10, 10, new Float64Array( 25 ), '10', new Int32Array( 25 ), 10 ); // $ExpectError
	dgecon( 'row-major', 'no-transpose', 10, new Float64Array( 25 ), 10, 10, 10, new Float64Array( 25 ), true, new Int32Array( 25 ), 10 ); // $ExpectError
	dgecon( 'row-major', 'no-transpose', 10, new Float64Array( 25 ), 10, 10, 10, new Float64Array( 25 ), false, new Int32Array( 25 ), 10 ); // $ExpectError
	dgecon( 'row-major', 'no-transpose', 10, new Float64Array( 25 ), 10, 10, 10, new Float64Array( 25 ), null, new Int32Array( 25 ), 10 ); // $ExpectError
	dgecon( 'row-major', 'no-transpose', 10, new Float64Array( 25 ), 10, 10, 10, new Float64Array( 25 ), undefined, new Int32Array( 25 ), 10 ); // $ExpectError
	dgecon( 'row-major', 'no-transpose', 10, new Float64Array( 25 ), 10, 10, 10, new Float64Array( 25 ), [], new Int32Array( 25 ), 10 ); // $ExpectError
	dgecon( 'row-major', 'no-transpose', 10, new Float64Array( 25 ), 10, 10, 10, new Float64Array( 25 ), {}, new Int32Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a tenth argument of invalid type...
{
	dgecon( 'row-major', 'no-transpose', 10, new Float64Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10, '10', 10 ); // $ExpectError
	dgecon( 'row-major', 'no-transpose', 10, new Float64Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10, 10, 10 ); // $ExpectError
	dgecon( 'row-major', 'no-transpose', 10, new Float64Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10, true, 10 ); // $ExpectError
	dgecon( 'row-major', 'no-transpose', 10, new Float64Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10, null, 10 ); // $ExpectError
	dgecon( 'row-major', 'no-transpose', 10, new Float64Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10, undefined, 10 ); // $ExpectError
	dgecon( 'row-major', 'no-transpose', 10, new Float64Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10, [], 10 ); // $ExpectError
	dgecon( 'row-major', 'no-transpose', 10, new Float64Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10, {}, 10 ); // $ExpectError
}

// The compiler throws an error if provided a eleventh argument of invalid type...
{
	dgecon( 'row-major', 'no-transpose', 10, new Float64Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), '10' ); // $ExpectError
	dgecon( 'row-major', 'no-transpose', 10, new Float64Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), true ); // $ExpectError
	dgecon( 'row-major', 'no-transpose', 10, new Float64Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), false ); // $ExpectError
	dgecon( 'row-major', 'no-transpose', 10, new Float64Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), null ); // $ExpectError
	dgecon( 'row-major', 'no-transpose', 10, new Float64Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), undefined ); // $ExpectError
	dgecon( 'row-major', 'no-transpose', 10, new Float64Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), [] ); // $ExpectError
	dgecon( 'row-major', 'no-transpose', 10, new Float64Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), {} ); // $ExpectError
}

// The compiler throws an error if provided an unsupported number of arguments...
{
	dgecon(); // $ExpectError
	dgecon( 'row-major' ); // $ExpectError
}
