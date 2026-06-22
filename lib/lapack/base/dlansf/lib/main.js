
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlansf from './dlansf.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlansf, 'ndarray', ndarray );


// EXPORTS //

export default dlansf;
