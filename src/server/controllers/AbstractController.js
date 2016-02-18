'use strict';

/**
 * @apiDefine   Generic
 * 
 * @apiHeader {String}  [Accept-Encoding] Header for production mode only (<code>gzip, deflate</code> enabled).
 * @apiHeader {String}  [Authorization]   Users unique authorization token <code>Bearer <otr_access_token> <ot_access_token></code>.
 * 
 * @apiHeaderExample {json} Production/Staging
 *     {
 *       "Accept-Encoding": "Accept-Encoding: gzip, deflate",
 *       "Authorization": "Bearer xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx xxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
 *     }
 * 
 * @apiHeaderExample {json} Development header
 *     {
 *       "Authorization": "Bearer xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx xxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
 *     }
 * 
 * @apiSuccess  {Date}    date        Date of the message.
 * @apiSuccess  {Number}  code        Return status HTTP code (200, 403, 404, 500 for example).
 * @apiSuccess  {String}  messageCode Code for message (error or success) to use in the client application.
 * 
 * @apiSuccessExample Global
 *     -- "Return always the same response (and merge other responses)" --
 *     HTTP/1.1 200 OK
 *     {
 *        "code": 200,
 *        "date": "2016-02-18 17:55:89",
 *        "messageCode": "1"
 *     }
 * 
 * @apiError  {Date}    date        Date of the message.
 * @apiError  {Number}  code        Return status HTTP code (200, 403, 404, 500 for example).
 * @apiError  {Object}  error       Error object (dependeing on source).
 * @apiError  {String}  messageCode Code for message (error or success) to use in the client application.
 *
 * @apiErrorExample EnsureAuthorized
 *     -- "Check if authorizzation access_token is girven (header / parameter)." --
 *     HTTP/1.1 403 Forbidden
 *     {
 *        "code": 403,
 *        "date": "2016-02-18 17:56:05",
 *        "messageCode: "-3"
 *     }
 * 
 * @apiErrorExample CheckAuthorized
 *     -- "Check if access_token is mapped on a specific user." --
 *     HTTP/1.1 403 Forbidden
 *     {
 *        "code": 403,
 *        "date": "2016-02-18 17:56:05",
 *        "messageCode: "-3"
 *     }
 */
class AbstractController {
}

module.exports = AbstractController;