// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlarra from './dlarra.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlarra, 'ndarray', ndarray );


// EXPORTS //

export default dlarra;
