
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zlags2 from './zlags2.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zlags2, 'ndarray', ndarray );


// EXPORTS //

export default zlags2;
