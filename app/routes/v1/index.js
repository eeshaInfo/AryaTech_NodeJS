
'use strict';


/********************************
 ********* All routes ***********
 ********************************/
let v1Routes = [
    ...require('./userRoutes'),
    ...require('./courseRoutes'),
     ...require('./paymentRoutes'),
     ...require('./certificationRoutes')
    
]


module.exports = v1Routes;
