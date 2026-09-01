import swaggerJSDoc from 'swagger-jsdoc'

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Instant Mechanic — Operations API',
      version: '1.0.0',
      description:
        'REST API powering the Instant Mechanic Live Operations Dashboard: bookings, mechanics, customers, and live status updates.',
    },
    servers: [{ url: '/api', description: 'API base path' }],
    tags: [
      { name: 'Dashboard', description: 'Aggregate stats and chart data' },
      { name: 'Bookings', description: 'Booking records and status updates' },
      { name: 'Mechanics', description: 'Mechanic roster and derived workload stats' },
      { name: 'Customers', description: 'Customer records' },
      { name: 'Admin', description: 'Database seeding (guarded)' },
    ],
    components: {
      securitySchemes: {
        seedKey: {
          type: 'apiKey',
          in: 'header',
          name: 'x-seed-key',
        },
      },
      schemas: {
        Customer: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Nikko Bradtke' },
            phone: { type: 'string', example: '+18445755216' },
            email: { type: 'string', example: 'nikko@example.com' },
          },
        },
        Vehicle: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            make: { type: 'string', example: 'Maruti Suzuki' },
            model: { type: 'string', example: 'Swift' },
            licensePlate: { type: 'string', example: 'HR17QY5778' },
          },
        },
        Service: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Oil Change' },
            category: { type: 'string', example: 'Maintenance' },
          },
        },
        Mechanic: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Ariel Bergstrom' },
            phone: { type: 'string' },
            specialization: { type: 'string', example: 'Brakes & Suspension' },
            status: { type: 'string', enum: ['available', 'busy', 'offline'] },
            jobsCompleted: { type: 'integer', example: 18 },
            lastBooking: {
              type: 'object',
              nullable: true,
              properties: {
                id: { type: 'integer' },
                status: { type: 'string' },
                scheduledAt: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
        Booking: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 84 },
            status: {
              type: 'string',
              enum: ['pending', 'assigned', 'on_the_way', 'completed', 'cancelled'],
            },
            amount: { type: 'number', example: 696 },
            scheduledAt: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            customer: { $ref: '#/components/schemas/Customer' },
            vehicle: { $ref: '#/components/schemas/Vehicle' },
            service: { $ref: '#/components/schemas/Service' },
            mechanic: {
              allOf: [{ $ref: '#/components/schemas/Mechanic' }],
              nullable: true,
            },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 15 },
            total: { type: 'integer', example: 550 },
            totalPages: { type: 'integer', example: 37 },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Booking not found' },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
}

export const swaggerSpec = swaggerJSDoc(options)
