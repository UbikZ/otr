'use strict';

const path = require('path');
const bluebird = require('bluebird');
const childProcess = bluebird.promisifyAll(require('child_process'));
const fs = require('fs');
const moment = require('moment');

const AbstractController = require('./AbstractController');
const Http = require('./helpers/Http');
const logger = require('../logger');

const UndefinedUrl = require('../errors/UndefinedUrl');
const NotFoundPdfFile = require('../errors/NotFoundPdfFile');
const UndefinedDownloadFile = require('../errors/UndefinedDownloadFile');
const UndefinedName = require('../errors/UndefinedName');

const config = require('../../../config');

/**
 * PDF Controller
 * - indexAction (disabled at the moment)
 * - renderAction
 * - downloadAction
 */
class PdfController extends AbstractController {
  /**
   * Return the correct binary path for phantomjs
   * - defaulting on server install
   * @private
   */
  static _getPhantomBinaryPath() {
    let binPath = '';
    try {
      binPath = require('phantomjs').path;
    } catch (error) {
      binPath = config.bin.phantomjs;
    }

    return binPath;
  }

  /**
   * Index Action
   * TODO: list all rendered files
   * @method  GET
   */
  static indexAction() {
    // todo
  }

  /**
   * @api {get} /pdf/render Generate PDF file
   * @apiVersion 0.0.1
   *
   * @apiName RenderPdf
   *
   * @apiDescription The goal is to generate a file using PhantomJS on specific URL
   * - Enable rendering for specific element.
   * - Return a public link to get the file.
   *
   * @apiGroup PDF
   *
   * @apiUse Generic
   *
   * @apiParam  {String}  url The <code>url</code> parameter used to define entrypoint to generate the PDF
   * @apiParam  {String}  name  The output <code>name</code> for the file (<i>we wil add timestamp to unify file</i>)
   *
   *  * @apiParamExample {json} Query
   *     {
   *        "url": "http://localhost:3000/#/pdf/render/xxxxxxxxxxxxxxxxx",
   *        "fileName": "test"
   *     }
   *
   * @apiSuccess  {String}  fileName  Unique file name of the generated file
   *
   * @apiSuccessExample Success
   *     HTTP/1.1 200 OK
   *     {
   *       "fileName": "test.20160218175589.pdf"
   *     }
   *
   *
   * @apiErrorExample UndefinedUrl
   *     -- "The url parameter is missing." --
   *     HTTP/1.1 404 Not Found
   *     {
   *        "code": 404,
   *        "date": "2016-02-18 17:56:05",
   *        "messageCode: "-1"
   *     }
   *
   * @apiErrorExample UndefinedName
   *     -- "The file name parameter is missing." --
   *     HTTP/1.1 404 Not Found
   *     {
   *        "code": 404,
   *        "date": "2016-02-18 17:56:05",
   *        "messageCode: "-1"
   *     }
   *
   * @apiErrorExample NotFoundPdfFile
   *     -- "The PDF generated file is not found." --
   *     HTTP/1.1 404 Not Found
   *     {
   *        "code": 404,
   *        "date": "2016-02-18 17:56:05",
   *        "messageCode: "-1"
   *     }
   */
  static renderAction(request, response) {
    const data = request.query;
    let user = {},
      filePath = '';

    Http.checkAuthorized(request, response)
      .then(userData => {
        user = userData;
        let url, execArgs;
        if (!data.url) {
          throw new UndefinedUrl();
        }
        if (!data.name) {
          throw new UndefinedName();
        }

        filePath = config.path.export+'/' +
          data.name.replace(/[^a-z0-9]/gi, '_').toLowerCase() +
          moment().format('.YYYYMMDDHHmmSS') + '.pdf';
        url = request.protocol + '://' + request.get('host') + '/#' + data.url;
        execArgs = [path.join(__dirname, '../../../' + config.bin.phantomjsConfig), url, filePath, 1];

        return childProcess.execFileAsync(PdfController._getPhantomBinaryPath(), execArgs);
      })
      .then(result => {
        result[0].split('\n').forEach(el => {
          console.log(el);
        });

        if (!fs.existsSync(filePath)) {
          throw new NotFoundPdfFile();
        }

        Http.sendResponse(request, response, 200, {
          fileName: path.basename(filePath)
        });
      })
      .catch(NotFoundPdfFile, error => {
        Http.sendResponse(
          request, response, 404, {}, '-1', 'Error (' + user.name.username + '): pdf file not created', error
        );
      })
      .catch(UndefinedName, error => {
        Http.sendResponse(
          request, response, 404, {}, '-1', 'Error (' + user.name.username + '): rendered name (undefined)', error
        );
      })
      .catch(UndefinedUrl, error => {
        Http.sendResponse(
          request, response, 404, {}, '-1', 'Error (' + user.name.username + '): rendered url (undefined)', error
        );
      })
      .catch(error => {
        Http.sendResponse(request, response, 500, {}, '-1', 'Error: renderer fail. Check logs.', error);
      });
  }

  /**
   * Download Action
   * - Return a stream & force the downloading
   * - Delete the file from the filesystem after downloading
   * TODO: improve the "unlink" to archive old renders
   * @param   request
   * @param   response
   * @method  GET
   */
  static downloadAction(request, response) {
    const data = request.query;
    let user = {},
      finalPdfPath = '';

    Http.checkAuthorized(request, response)
      .then(userData => {
        user = userData;
        finalPdfPath = config.path.export+'/' + data.fileName;
        if (!data.fileName) {
          throw new UndefinedDownloadFile();
        }
        if (!fs.existsSync(finalPdfPath)) {
          throw new NotFoundPdfFile();
        }

        // FIXME: promise instead of callbacks
        response.download(finalPdfPath, (err) => {
          if (err) {
            logger.error(err);
          } else {
            fs.unlink(config.path.export+'/' + data.fileName);
          }
        });
      })
      .catch(NotFoundPdfFile, error => {
        Http.sendResponse(
          request, response, 404, {}, '-1', 'Error: pdf file not found (' + finalPdfPath + ')', error
        );
      })
      .catch(UndefinedDownloadFile, error => {
        Http.sendResponse(
          request, response, 404, {}, '-1', 'Error (' + user.name.username + '): download file (none)', error
        );
      })
      .catch(error => {
        Http.sendResponse(request, response, 500, {}, '-1', 'Error: download fail. Check logs.', error);
      });
  }
}

module.exports = PdfController;
