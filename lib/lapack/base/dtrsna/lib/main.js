

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dtrsna from './dtrsna.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dtrsna, 'ndarray', ndarray );


// EXPORTS //

export default dtrsna;
