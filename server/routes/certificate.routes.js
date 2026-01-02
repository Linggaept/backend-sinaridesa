const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificate.controller');
const apiKeyMiddleware = require('../middlewares/apiKey');
const { authenticateToken, isAdmin } = require('../middlewares/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     Event:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the event.
 *         title:
 *           type: string
 *           description: The title of the event.
 *         slug:
 *           type: string
 *           description: The slug of the event.
 *         description:
 *           type: string
 *           description: The description of the event.
 *         date:
 *           type: string
 *           format: date-time
 *           description: The date of the event.
 *         location:
 *           type: string
 *           description: The location of the event.
 *         participants:
 *           type: integer
 *           description: The number of participants in the event.
 *         thumbnail:
 *           type: string
 *           description: The URL of the event thumbnail.
 *         image:
 *           type: string
 *           description: The URL of the event image.
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date and time the event was created.
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date and time the event was last updated.
 *     Certificate:
 *       type: object
 *       required:
 *         - name
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
 *         event:
 *           $ref: '#/components/schemas/Event'
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
 *     summary: Verify a certificate by its hash (Public, requires API Key)
 *     tags: [Certificates]
 *     security:
 *       - ApiKeyAuth: []
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
 *     summary: Create a new certificate (Admin only)
 *     tags: [Certificates]
 *     security:
 *       - ApiKeyAuth: []
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
 *       403:
 *         description: Forbidden.
 */
router.post('/', authenticateToken, isAdmin, certificateController.createCertificate);

/**
 * @swagger
 * /certificates/batch:
 *   post:
 *     summary: Create multiple new certificates at once (Admin only)
 *     tags: [Certificates]
 *     security:
 *       - ApiKeyAuth: []
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
 *       403:
 *         description: Forbidden.
 */
router.post('/batch', authenticateToken, isAdmin, certificateController.createBatchCertificates);

/**
 * @swagger
 * /certificates:
 *   get:
 *     summary: Returns the list of all the certificates (Authenticated users only)
 *     tags: [Certificates]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: The list of the certificates.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Certificate'
 *       401:
 *         description: Unauthorized.
 */
router.get('/', authenticateToken, certificateController.getAllCertificates);

/**
 * @swagger
 * /certificates/search:
 *   get:
 *     summary: Search for certificates by name or certificate code (Authenticated users only)
 *     tags: [Certificates]
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         required: true
 *         description: The search query
 *     responses:
 *       200:
 *         description: A list of certificates matching the search query.
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Failed to search certificates.
 */
router.get('/search', authenticateToken, certificateController.searchCertificates);

/**
 * @swagger
 * /certificates/{id}:
 *   get:
 *     summary: Get the certificate by id (Authenticated users only)
 *     tags: [Certificates]
 *     security:
 *       - ApiKeyAuth: []
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
router.get('/:id', authenticateToken, certificateController.getCertificateById);

/**
 * @swagger
 * /certificates/{id}:
 *   put:
 *     summary: Update the certificate by the id (Admin only)
 *     tags: [Certificates]
 *     security:
 *       - ApiKeyAuth: []
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
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: The certificate was not found.
 */
router.put('/:id', authenticateToken, isAdmin, certificateController.updateCertificate);

/**
 * @swagger
 * /certificates/{id}/revoke:
 *   patch:
 *     summary: Revoke the certificate by the id (Admin only)
 *     tags: [Certificates]
 *     security:
 *       - ApiKeyAuth: []
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
 *         description: The certificate was revoked.
 *       400:
 *         description: Certificate has already been revoked.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: The certificate was not found.
 */
router.patch('/:id/revoke', authenticateToken, isAdmin, certificateController.revokeCertificate);

/**
 * @swagger
 * /certificates/{id}:
 *   delete:
 *     summary: Remove the certificate by id (Admin only)
 *     tags: [Certificates]
 *     security:
 *       - ApiKeyAuth: []
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
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: The certificate was not found.
 */
router.delete('/:id', authenticateToken, isAdmin, certificateController.deleteCertificate);

module.exports = router;