// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlaqp2 from './dlaqp2.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlaqp2, 'ndarray', ndarray );


// EXPORTS //

export default dlaqp2;
