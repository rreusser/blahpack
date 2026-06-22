// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dgttrs from './dgttrs.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dgttrs, 'ndarray', ndarray );


// EXPORTS //

export default dgttrs;
