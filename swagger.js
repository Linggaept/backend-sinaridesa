const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Sinari Desa API',
      version: '1.0.0',
      description: 'API documentation for the Backend Sinari Desa project.',
      tags: [
        { name: 'Authentication', description: 'User authentication' },
        { name: 'Users', description: 'User management' },
        { name: 'Courses', description: 'Course management' },
        { name: 'Team', description: 'Team management' },
        { name: 'Events', description: 'Event management' },
        { name: 'Dashboard', description: 'Dashboard statistics' },
        { name: 'Certificates', description: 'The certificates managing API' },
        { name: 'Chatbot', description: 'Chatbot using Gemini API' },
      ]
    },
    servers: [
      {
        url: process.env.SWAGGER_URL_DEV || process.env.SWAGGER_URL_PROD,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key',
        },
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        ApiKeyAuth: [],
      },
    ],
  },
  apis: ['./server/routes/*.js'], // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
