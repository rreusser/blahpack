
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlaqsp from './dlaqsp.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlaqsp, 'ndarray', ndarray );


// EXPORTS //

export default dlaqsp;
