
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dgges from './dgges.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dgges, 'ndarray', ndarray );


// EXPORTS //

export default dgges;
