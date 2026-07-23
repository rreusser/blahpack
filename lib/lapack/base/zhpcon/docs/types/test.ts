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

import zhpcon = require( './index' );


// TESTS //

// The function returns a number...
{
	zhpcon( 'upper', 10, new Float64Array( 25 ), new Int32Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectType number
}

// The compiler throws an error if provided a first argument of invalid type...
{
	zhpcon( 10, 10, new Float64Array( 25 ), new Int32Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zhpcon( true, 10, new Float64Array( 25 ), new Int32Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zhpcon( null, 10, new Float64Array( 25 ), new Int32Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zhpcon( undefined, 10, new Float64Array( 25 ), new Int32Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zhpcon( [], 10, new Float64Array( 25 ), new Int32Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zhpcon( {}, 10, new Float64Array( 25 ), new Int32Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a second argument of invalid type...
{
	zhpcon( 'upper', '10', new Float64Array( 25 ), new Int32Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zhpcon( 'upper', true, new Float64Array( 25 ), new Int32Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zhpcon( 'upper', false, new Float64Array( 25 ), new Int32Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zhpcon( 'upper', null, new Float64Array( 25 ), new Int32Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zhpcon( 'upper', undefined, new Float64Array( 25 ), new Int32Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zhpcon( 'upper', [], new Float64Array( 25 ), new Int32Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zhpcon( 'upper', {}, new Float64Array( 25 ), new Int32Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a third argument of invalid type...
{
	zhpcon( 'upper', 10, '10', new Int32Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zhpcon( 'upper', 10, 10, new Int32Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zhpcon( 'upper', 10, true, new Int32Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zhpcon( 'upper', 10, null, new Int32Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zhpcon( 'upper', 10, undefined, new Int32Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zhpcon( 'upper', 10, [], new Int32Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zhpcon( 'upper', 10, {}, new Int32Array( 25 ), 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a fourth argument of invalid type...
{
	zhpcon( 'upper', 10, new Float64Array( 25 ), '10', 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zhpcon( 'upper', 10, new Float64Array( 25 ), 10, 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zhpcon( 'upper', 10, new Float64Array( 25 ), true, 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zhpcon( 'upper', 10, new Float64Array( 25 ), null, 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zhpcon( 'upper', 10, new Float64Array( 25 ), undefined, 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zhpcon( 'upper', 10, new Float64Array( 25 ), [], 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zhpcon( 'upper', 10, new Float64Array( 25 ), {}, 10, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a fifth argument of invalid type...
{
	zhpcon( 'upper', 10, new Float64Array( 25 ), new Int32Array( 25 ), '10', 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zhpcon( 'upper', 10, new Float64Array( 25 ), new Int32Array( 25 ), true, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zhpcon( 'upper', 10, new Float64Array( 25 ), new Int32Array( 25 ), false, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zhpcon( 'upper', 10, new Float64Array( 25 ), new Int32Array( 25 ), null, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zhpcon( 'upper', 10, new Float64Array( 25 ), new Int32Array( 25 ), undefined, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zhpcon( 'upper', 10, new Float64Array( 25 ), new Int32Array( 25 ), [], 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zhpcon( 'upper', 10, new Float64Array( 25 ), new Int32Array( 25 ), {}, 10, 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a sixth argument of invalid type...
{
	zhpcon( 'upper', 10, new Float64Array( 25 ), new Int32Array( 25 ), 10, '10', 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zhpcon( 'upper', 10, new Float64Array( 25 ), new Int32Array( 25 ), 10, true, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zhpcon( 'upper', 10, new Float64Array( 25 ), new Int32Array( 25 ), 10, false, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zhpcon( 'upper', 10, new Float64Array( 25 ), new Int32Array( 25 ), 10, null, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zhpcon( 'upper', 10, new Float64Array( 25 ), new Int32Array( 25 ), 10, undefined, 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zhpcon( 'upper', 10, new Float64Array( 25 ), new Int32Array( 25 ), 10, [], 10, new Float64Array( 25 ), 10 ); // $ExpectError
	zhpcon( 'upper', 10, new Float64Array( 25 ), new Int32Array( 25 ), 10, {}, 10, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a seventh argument of invalid type...
{
	zhpcon( 'upper', 10, new Float64Array( 25 ), new Int32Array( 25 ), 10, 10, '10', new Float64Array( 25 ), 10 ); // $ExpectError
	zhpcon( 'upper', 10, new Float64Array( 25 ), new Int32Array( 25 ), 10, 10, true, new Float64Array( 25 ), 10 ); // $ExpectError
	zhpcon( 'upper', 10, new Float64Array( 25 ), new Int32Array( 25 ), 10, 10, false, new Float64Array( 25 ), 10 ); // $ExpectError
	zhpcon( 'upper', 10, new Float64Array( 25 ), new Int32Array( 25 ), 10, 10, null, new Float64Array( 25 ), 10 ); // $ExpectError
	zhpcon( 'upper', 10, new Float64Array( 25 ), new Int32Array( 25 ), 10, 10, undefined, new Float64Array( 25 ), 10 ); // $ExpectError
	zhpcon( 'upper', 10, new Float64Array( 25 ), new Int32Array( 25 ), 10, 10, [], new Float64Array( 25 ), 10 ); // $ExpectError
	zhpcon( 'upper', 10, new Float64Array( 25 ), new Int32Array( 25 ), 10, 10, {}, new Float64Array( 25 ), 10 ); // $ExpectError
}

// The compiler throws an error if provided a eighth argument of invalid type...
{
	zhpcon( 'upper', 10, new Float64Array( 25 ), new Int32Array( 25 ), 10, 10, 10, '10', 10 ); // $ExpectError
	zhpcon( 'upper', 10, new Float64Array( 25 ), new Int32Array( 25 ), 10, 10, 10, 10, 10 ); // $ExpectError
	zhpcon( 'upper', 10, new Float64Array( 25 ), new Int32Array( 25 ), 10, 10, 10, true, 10 ); // $ExpectError
	zhpcon( 'upper', 10, new Float64Array( 25 ), new Int32Array( 25 ), 10, 10, 10, null, 10 ); // $ExpectError
	zhpcon( 'upper', 10, new Float64Array( 25 ), new Int32Array( 25 ), 10, 10, 10, undefined, 10 ); // $ExpectError
	zhpcon( 'upper', 10, new Float64Array( 25 ), new Int32Array( 25 ), 10, 10, 10, [], 10 ); // $ExpectError
	zhpcon( 'upper', 10, new Float64Array( 25 ), new Int32Array( 25 ), 10, 10, 10, {}, 10 ); // $ExpectError
}

// The compiler throws an error if provided a ninth argument of invalid type...
{
	zhpcon( 'upper', 10, new Float64Array( 25 ), new Int32Array( 25 ), 10, 10, 10, new Float64Array( 25 ), '10' ); // $ExpectError
	zhpcon( 'upper', 10, new Float64Array( 25 ), new Int32Array( 25 ), 10, 10, 10, new Float64Array( 25 ), true ); // $ExpectError
	zhpcon( 'upper', 10, new Float64Array( 25 ), new Int32Array( 25 ), 10, 10, 10, new Float64Array( 25 ), false ); // $ExpectError
	zhpcon( 'upper', 10, new Float64Array( 25 ), new Int32Array( 25 ), 10, 10, 10, new Float64Array( 25 ), null ); // $ExpectError
	zhpcon( 'upper', 10, new Float64Array( 25 ), new Int32Array( 25 ), 10, 10, 10, new Float64Array( 25 ), undefined ); // $ExpectError
	zhpcon( 'upper', 10, new Float64Array( 25 ), new Int32Array( 25 ), 10, 10, 10, new Float64Array( 25 ), [] ); // $ExpectError
	zhpcon( 'upper', 10, new Float64Array( 25 ), new Int32Array( 25 ), 10, 10, 10, new Float64Array( 25 ), {} ); // $ExpectError
}

// The compiler throws an error if provided an unsupported number of arguments...
{
	zhpcon(); // $ExpectError
	zhpcon( 'upper' ); // $ExpectError
}
