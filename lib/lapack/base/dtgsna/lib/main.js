
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dtgsna from './dtgsna.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dtgsna, 'ndarray', ndarray );


// EXPORTS //

export default dtgsna;
