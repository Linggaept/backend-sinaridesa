
const { PrismaClient } = require('../../generated/prisma');
const prisma = new PrismaClient();
const crypto = require('crypto');

const createCertificate = async (req, res) => {
  const { name, eventId } = req.body;
  const certificate_code = `SINARI-2025-${Date.now()}`;
  const hash = crypto.createHash('sha256').update(certificate_code).digest('hex');

  try {
    const newCertificate = await prisma.certificate.create({
      data: {
        name,
        eventId,
        certificate_code,
        hash,
        issued_at: new Date(),
      },
    });
    res.status(201).json(newCertificate);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create certificate' });
  }
};

const getAllCertificates = async (req, res) => {
  try {
    const certificates = await prisma.certificate.findMany({
      orderBy: {
        updatedAt: 'desc',
      },
    });
    res.status(200).json(certificates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch certificates' });
  }
};

const getCertificateById = async (req, res) => {
  const { id } = req.params;
  try {
    const certificate = await prisma.certificate.findUnique({
      where: { id: parseInt(id) },
    });
    if (certificate) {
      res.status(200).json(certificate);
    } else {
      res.status(404).json({ error: 'Certificate not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch certificate' });
  }
};

const updateCertificate = async (req, res) => {
  const { id } = req.params;
  const { name, eventId, revoked } = req.body;
  try {
    const updatedCertificate = await prisma.certificate.update({
      where: { id: parseInt(id) },
      data: {
        name,
        eventId,
        revoked,
      },
    });
    res.status(200).json(updatedCertificate);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update certificate' });
  }
};

const deleteCertificate = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.certificate.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete certificate' });
  }
};

const verifyCertificate = async (req, res) => {
  const { hash } = req.params;

  try {
    const certificate = await prisma.certificate.findUnique({
      where: {
        hash,
      },
      include: {
        event: true,
      },
    });

    if (certificate) {
      if (certificate.revoked) {
        res.status(400).json({ error: 'Certificate has been revoked' });
      } else {
        res.status(200).json({ valid: true, certificate });
      }
    } else {
      res.status(404).json({ valid: false, error: 'Certificate not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to verify certificate', details: error.message });
  }
};

const createBatchCertificates = async (req, res) => {
  const { names, eventId } = req.body;

  if (!names || !Array.isArray(names) || names.length === 0) {
    return res.status(400).json({ error: 'Invalid request body. "names" must be a non-empty array.' });
  }

  try {
    const certificates = names.map(name => {
      const certificate_code = `SINARI-2025-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      const hash = crypto.createHash('sha256').update(certificate_code).digest('hex');
      return {
        name,
        eventId,
        certificate_code,
        hash,
        issued_at: new Date(),
      };
    });

    const createdCertificates = await prisma.$transaction(
      certificates.map(certificate => prisma.certificate.create({ data: certificate }))
    );

    res.status(201).json(createdCertificates);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Failed to create certificates in batch.', details: error.message });
  }
};

const revokeCertificate = async (req, res) => {
  const { id } = req.params;
  try {
    const certificate = await prisma.certificate.findUnique({
      where: { id: parseInt(id) },
    });

    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    if (certificate.revoked) {
      return res.status(400).json({ error: 'Certificate has already been revoked' });
    }

    const revokedCertificate = await prisma.certificate.update({
      where: { id: parseInt(id) },
      data: {
        revoked: true,
      },
    });
    res.status(200).json(revokedCertificate);
  } catch (error) {
    res.status(500).json({ error: 'Failed to revoke certificate' });
  }
};

const searchCertificates = async (req, res) => {
  const { query } = req.query;
  try {
    const certificates = await prisma.certificate.findMany({
      where: {
        OR: [
          {
            name: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            certificate_code: {
              contains: query,
              mode: 'insensitive',
            },
          },
        ],
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
    res.status(200).json(certificates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search certificates' });
  }
};

module.exports = {
  createCertificate,
  createBatchCertificates,
  getAllCertificates,
  getCertificateById,
  updateCertificate,
  deleteCertificate,
  verifyCertificate,
  revokeCertificate,
  searchCertificates,
};
