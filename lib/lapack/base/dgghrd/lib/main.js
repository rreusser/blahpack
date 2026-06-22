
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dgghrd from './dgghrd.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dgghrd, 'ndarray', ndarray );


// EXPORTS //

export default dgghrd;
