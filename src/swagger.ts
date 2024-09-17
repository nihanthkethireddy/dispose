import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CCI Node API',
      version: '1.0.0',
      description: 'CCI Node API',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Local server'
      }
    ]
  },
  apis: ['./src/routes/*.ts'],
};

const specs = swaggerJsdoc(options);

export { swaggerUi, specs };
