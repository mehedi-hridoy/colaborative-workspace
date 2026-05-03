import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Collaborative Team Hub API (Fredocloud Assessment)',
      version: '1.0.0',
      description: 'REST API + Socket.io for team collaboration: goals, announcements, action items, real-time updates. Features JWT auth, Prisma/PostgreSQL, Cloudinary.',
      contact: {
        name: 'API Developer',
        email: 'info@fredocloud.com'
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
      {
        url: '{protocol}://{host}/api',
        description: 'Production (Railway)',
        variables: {
          protocol: {
            enum: ['http', 'https'],
            default: 'https'
          },
          host: {
            default: 'your-api.up.railway.app'
          }
        }
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: [
    path.join(__dirname, '../routes/*.js'),
    path.join(__dirname, '../controllers/*.js')
  ],
};


const swaggerSpec = swaggerJsdoc(options);
console.log("Swagger spec generated:", !!swaggerSpec);

export default swaggerSpec;

