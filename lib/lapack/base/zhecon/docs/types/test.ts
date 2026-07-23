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

import zhecon = require( './index' );


// TESTS //

// The function returns a number...
{
	zhecon( 'upper', 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectType number
}

// The compiler throws an error if provided a first argument of invalid type...
{
	zhecon( 10, 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zhecon( true, 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zhecon( null, 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zhecon( undefined, 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zhecon( [], 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zhecon( {}, 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a second argument of invalid type...
{
	zhecon( 'upper', '10', new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zhecon( 'upper', true, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zhecon( 'upper', false, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zhecon( 'upper', null, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zhecon( 'upper', undefined, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zhecon( 'upper', [], new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zhecon( 'upper', {}, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a third argument of invalid type...
{
	zhecon( 'upper', 10, '10', 10, new Int32Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zhecon( 'upper', 10, 10, 10, new Int32Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zhecon( 'upper', 10, true, 10, new Int32Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zhecon( 'upper', 10, null, 10, new Int32Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zhecon( 'upper', 10, undefined, 10, new Int32Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zhecon( 'upper', 10, [], 10, new Int32Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zhecon( 'upper', 10, {}, 10, new Int32Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a fourth argument of invalid type...
{
	zhecon( 'upper', 10, new Float64Array( 25 ), '10', new Int32Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zhecon( 'upper', 10, new Float64Array( 25 ), true, new Int32Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zhecon( 'upper', 10, new Float64Array( 25 ), false, new Int32Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zhecon( 'upper', 10, new Float64Array( 25 ), null, new Int32Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zhecon( 'upper', 10, new Float64Array( 25 ), undefined, new Int32Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zhecon( 'upper', 10, new Float64Array( 25 ), [], new Int32Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zhecon( 'upper', 10, new Float64Array( 25 ), {}, new Int32Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a fifth argument of invalid type...
{
	zhecon( 'upper', 10, new Float64Array( 25 ), 10, '10', 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zhecon( 'upper', 10, new Float64Array( 25 ), 10, 10, 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zhecon( 'upper', 10, new Float64Array( 25 ), 10, true, 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zhecon( 'upper', 10, new Float64Array( 25 ), 10, null, 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zhecon( 'upper', 10, new Float64Array( 25 ), 10, undefined, 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zhecon( 'upper', 10, new Float64Array( 25 ), 10, [], 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zhecon( 'upper', 10, new Float64Array( 25 ), 10, {}, 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a sixth argument of invalid type...
{
	zhecon( 'upper', 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), '10', 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zhecon( 'upper', 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), true, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zhecon( 'upper', 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), false, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zhecon( 'upper', 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), null, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zhecon( 'upper', 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), undefined, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zhecon( 'upper', 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), [], 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zhecon( 'upper', 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), {}, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a seventh argument of invalid type...
{
	zhecon( 'upper', 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, '10', 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zhecon( 'upper', 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, true, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zhecon( 'upper', 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, false, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zhecon( 'upper', 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, null, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zhecon( 'upper', 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, undefined, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zhecon( 'upper', 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, [], 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zhecon( 'upper', 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, {}, 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a eighth argument of invalid type...
{
	zhecon( 'upper', 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, 10, '10', new Float64Array( 25 ), 10 ); // $ExpectError
	zhecon( 'upper', 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, 10, true, new Float64Array( 25 ), 10 ); // $ExpectError
	zhecon( 'upper', 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, 10, false, new Float64Array( 25 ), 10 ); // $ExpectError
	zhecon( 'upper', 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, 10, null, new Float64Array( 25 ), 10 ); // $ExpectError
	zhecon( 'upper', 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, 10, undefined, new Float64Array( 25 ), 10 ); // $ExpectError
	zhecon( 'upper', 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, 10, [], new Float64Array( 25 ), 10 ); // $ExpectError
	zhecon( 'upper', 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, 10, {}, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a ninth argument of invalid type...
{
	zhecon( 'upper', 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, 10, 10, '10', 10 ); // $ExpectError
	zhecon( 'upper', 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, 10, 10, 10, 10 ); // $ExpectError
	zhecon( 'upper', 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, 10, 10, true, 10 ); // $ExpectError
	zhecon( 'upper', 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, 10, 10, null, 10 ); // $ExpectError
	zhecon( 'upper', 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, 10, 10, undefined, 10 ); // $ExpectError
	zhecon( 'upper', 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, 10, 10, [], 10 ); // $ExpectError
	zhecon( 'upper', 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, 10, 10, {}, 10 ); // $ExpectError
}

// The compiler throws an error if provided a tenth argument of invalid type...
{
	zhecon( 'upper', 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, 10, 10, new Float64Array( 25 ), '10' ); // $ExpectError
	zhecon( 'upper', 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, 10, 10, new Float64Array( 25 ), true ); // $ExpectError
	zhecon( 'upper', 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, 10, 10, new Float64Array( 25 ), false ); // $ExpectError
	zhecon( 'upper', 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, 10, 10, new Float64Array( 25 ), null ); // $ExpectError
	zhecon( 'upper', 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, 10, 10, new Float64Array( 25 ), undefined ); // $ExpectError
	zhecon( 'upper', 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, 10, 10, new Float64Array( 25 ), [] ); // $ExpectError
	zhecon( 'upper', 10, new Float64Array( 25 ), 10, new Int32Array( 25 ), 10, 10, 10, new Float64Array( 25 ), {} ); // $ExpectError
}

// The compiler throws an error if provided an unsupported number of arguments...
{
	zhecon(); // $ExpectError
	zhecon( 'upper' ); // $ExpectError
}
