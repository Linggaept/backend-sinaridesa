const { PrismaClient } = require('../../generated/prisma');
const prisma = new PrismaClient();

const getDashboardStats = async (req, res) => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

    const [
      totalTeams,
      totalCourses,
      totalEvents,
      totalUsers,
      totalCertificates,
      teamsLast7Days,
      coursesLast7Days,
      eventsLast7Days,
      usersLast7Days,
      certificatesLast7Days,
      teamsLast30Days,
      coursesLast30Days,
      eventsLast30Days,
      usersLast30Days,
      certificatesLast30Days,
      teamsLast90Days,
      coursesLast90Days,
      eventsLast90Days,
      usersLast90Days,
      certificatesLast90Days,
    ] = await Promise.all([
      prisma.team.count(),
      prisma.course.count(),
      prisma.event.count(),
      prisma.users.count(),
      prisma.certificate.count({ where: { revoked: false } }),
      prisma.team.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.course.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.event.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.users.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.certificate.count({ where: { createdAt: { gte: sevenDaysAgo }, revoked: false } }),
      prisma.team.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.course.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.event.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.users.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.certificate.count({ where: { createdAt: { gte: thirtyDaysAgo }, revoked: false } }),
      prisma.team.count({ where: { createdAt: { gte: ninetyDaysAgo } } }),
      prisma.course.count({ where: { createdAt: { gte: ninetyDaysAgo } } }),
      prisma.event.count({ where: { createdAt: { gte: ninetyDaysAgo } } }),
      prisma.users.count({ where: { createdAt: { gte: ninetyDaysAgo } } }),
      prisma.certificate.count({ where: { createdAt: { gte: ninetyDaysAgo }, revoked: false } }),
    ]);

    res.json({
      status: 'success',
      message: 'Dashboard stats retrieved successfully.',
      data: {
        total: {
          teams: totalTeams,
          courses: totalCourses,
          events: totalEvents,
          users: totalUsers,
          certificates: totalCertificates,
        },
        last7days: {
          teams: teamsLast7Days,
          courses: coursesLast7Days,
          events: eventsLast7Days,
          users: usersLast7Days,
          certificates: certificatesLast7Days,
        },
        last30days: {
          teams: teamsLast30Days,
          courses: coursesLast30Days,
          events: eventsLast30Days,
          users: usersLast30Days,
          certificates: certificatesLast30Days,
        },
        last90days: {
          teams: teamsLast90Days,
          courses: coursesLast90Days,
          events: eventsLast90Days,
          users: usersLast90Days,
          certificates: certificatesLast90Days,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'An internal server error occurred.',
      error: error.message,
    });
  }
};

module.exports = {
  getDashboardStats,
};
