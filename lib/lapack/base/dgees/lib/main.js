// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dgees from './dgees.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dgees, 'ndarray', ndarray );


// EXPORTS //

export default dgees;
