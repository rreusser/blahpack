

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import ddisna from './ddisna.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( ddisna, 'ndarray', ndarray );


// EXPORTS //

export default ddisna;
