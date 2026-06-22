// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dggsvp3 from './dggsvp3.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dggsvp3, 'ndarray', ndarray );


// EXPORTS //

export default dggsvp3;
