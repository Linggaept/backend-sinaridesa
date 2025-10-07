const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificate.controller');
const apiKeyMiddleware = require('../middlewares/apiKey');
const { authenticateToken } = require('../middlewares/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     Certificate:
 *       type: object
 *       required:
 *         - name
 *         - eventId
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the certificate.
 *         certificate_code:
 *           type: string
 *           description: The unique code of the certificate.
 *         hash:
 *           type: string
 *           description: The unique hash of the certificate.
 *         name:
 *           type: string
 *           description: The name of the certificate holder.
 *         eventId:
 *           type: integer
 *           description: The id of the event.
 *         issued_at:
 *           type: string
 *           format: date-time
 *           description: The date and time the certificate was issued.
 *         revoked:
 *           type: boolean
 *           description: Whether the certificate has been revoked.
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date and time the certificate was created.
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date and time the certificate was last updated.
 */

/**
 * @swagger
 * tags:
 *   name: Certificates
 *   description: The certificates managing API
 */

/**
 * @swagger
 * /certificates/verify/{hash}:
 *   get:
 *     summary: Verify a certificate by its hash
 *     tags: [Certificates]
 *     parameters:
 *       - in: path
 *         name: hash
 *         schema:
 *           type: string
 *         required: true
 *         description: The hash of the certificate
 *     responses:
 *       200:
 *         description: The certificate is valid.
 *       400:
 *         description: The certificate has been revoked.
 *       404:
 *         description: The certificate was not found.
 */
router.get('/verify/:hash', apiKeyMiddleware, certificateController.verifyCertificate);

/**
 * @swagger
 * /certificates:
 *   post:
 *     summary: Create a new certificate
 *     tags: [Certificates]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - eventId
 *             properties:
 *               name:
 *                 type: string
 *               eventId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: The certificate was successfully created.
 *       400:
 *         description: Failed to create certificate.
 *       401:
 *         description: Unauthorized.
 */
router.post('/', apiKeyMiddleware, authenticateToken, certificateController.createCertificate);

/**
 * @swagger
 * /certificates/batch:
 *   post:
 *     summary: Create multiple new certificates at once
 *     tags: [Certificates]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - names
 *               - eventId
 *             properties:
 *               names:
 *                 type: array
 *                 items:
 *                   type: string
 *               eventId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: The certificates were successfully created.
 *       400:
 *         description: Failed to create certificates.
 *       401:
 *         description: Unauthorized.
 */
router.post('/batch', apiKeyMiddleware, authenticateToken, certificateController.createBatchCertificates);

/**
 * @swagger
 * /certificates:
 *   get:
 *     summary: Returns the list of all the certificates
 *     tags: [Certificates]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: The list of the certificates.
 *       401:
 *         description: Unauthorized.
 */
router.get('/', apiKeyMiddleware, authenticateToken, certificateController.getAllCertificates);

/**
 * @swagger
 * /certificates/{id}:
 *   get:
 *     summary: Get the certificate by id
 *     tags: [Certificates]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The certificate id
 *     responses:
 *       200:
 *         description: The certificate description by id.
 *       404:
 *         description: The certificate was not found.
 *       401:
 *         description: Unauthorized.
 */
router.get('/:id', apiKeyMiddleware, authenticateToken, certificateController.getCertificateById);

/**
 * @swagger
 * /certificates/{id}:
 *   put:
 *     summary: Update the certificate by the id
 *     tags: [Certificates]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The certificate id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               eventId:
 *                 type: integer
 *               revoked:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: The certificate was updated.
 *       400:
 *         description: Failed to update certificate.
 *       404:
 *         description: The certificate was not found.
 *       401:
 *         description: Unauthorized.
 */
router.put('/:id', apiKeyMiddleware, authenticateToken, certificateController.updateCertificate);

/**
 * @swagger
 * /certificates/{id}:
 *   delete:
 *     summary: Remove the certificate by id
 *     tags: [Certificates]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The certificate id
 *     responses:
 *       204:
 *         description: The certificate was deleted.
 *       400:
 *         description: Failed to delete certificate.
 *       404:
 *         description: The certificate was not found.
 *       401:
 *         description: Unauthorized.
 */
router.delete('/:id', apiKeyMiddleware, authenticateToken, certificateController.deleteCertificate);

module.exports = router;