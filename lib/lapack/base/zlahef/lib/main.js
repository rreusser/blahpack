// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zlahef from './zlahef.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zlahef, 'ndarray', ndarray );


// EXPORTS //

export default zlahef;
