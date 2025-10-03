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
      teamsLast7Days,
      coursesLast7Days,
      eventsLast7Days,
      teamsLast30Days,
      coursesLast30Days,
      eventsLast30Days,
      teamsLast90Days,
      coursesLast90Days,
      eventsLast90Days,
    ] = await Promise.all([
      prisma.team.count(),
      prisma.course.count(),
      prisma.event.count(),
      prisma.team.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.course.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.event.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.team.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.course.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.event.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.team.count({ where: { createdAt: { gte: ninetyDaysAgo } } }),
      prisma.course.count({ where: { createdAt: { gte: ninetyDaysAgo } } }),
      prisma.event.count({ where: { createdAt: { gte: ninetyDaysAgo } } }),
    ]);

    res.json({
      status: 'success',
      message: 'Dashboard stats retrieved successfully.',
      data: {
        total: {
          teams: totalTeams,
          courses: totalCourses,
          events: totalEvents,
        },
        last7days: {
          teams: teamsLast7Days,
          courses: coursesLast7Days,
          events: eventsLast7Days,
        },
        last30days: {
          teams: teamsLast30Days,
          courses: coursesLast30Days,
          events: eventsLast30Days,
        },
        last90days: {
          teams: teamsLast90Days,
          courses: coursesLast90Days,
          events: eventsLast90Days,
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
