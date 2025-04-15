// src/pages/api/docs.ts
import { withSwagger } from 'next-swagger-doc';

const swaggerHandler = withSwagger({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Healthcare Newsletter Platform API',
      version: '1.0.0',
      description: 'API documentation for the Healthcare Newsletter Platform',
      contact: {
        name: 'Support',
        email: 'support@healthcarenewsletter.com',
      },
    },
    servers: [
      {
        url: 'https://api.healthcarenewsletter.com/api',
        description: 'Production Server',
      },
      {
        url: 'http://localhost:3000/api',
        description: 'Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Patient: {
          type: 'object',
          required: ['email', 'first_name', 'last_name', 'provider_id'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique identifier for the patient',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'When the patient was created',
            },
            provider_id: {
              type: 'string',
              format: 'uuid',
              description: 'ID of the healthcare provider this patient belongs to',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Patient email address',
            },
            first_name: {
              type: 'string',
              description: 'Patient first name',
            },
            last_name: {
              type: 'string',
              description: 'Patient last name',
            },
            date_of_birth: {
              type: 'string',
              format: 'date',
              nullable: true,
              description: 'Patient date of birth',
            },
            health_conditions: {
              type: 'array',
              items: { type: 'string' },
              description: 'List of health conditions',
            },
            medications: {
              type: 'array',
              items: { type: 'string' },
              description: 'List of medications',
            },
            dietary_restrictions: {
              type: 'array',
              items: { type: 'string' },
              description: 'List of dietary restrictions',
            },
            consent_status: {
              type: 'string',
              enum: ['active', 'pending', 'revoked'],
              description: 'Status of patient consent for newsletters',
            },
            consent_date: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              description: 'When consent was given',
            },
            preferred_frequency: {
              type: 'string',
              enum: ['daily', 'weekly', 'monthly'],
              nullable: true,
              description: 'Preferred newsletter frequency',
            },
          },
        },
        PatientInput: {
          type: 'object',
          required: ['email', 'first_name', 'last_name'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'Patient email address',
            },
            first_name: {
              type: 'string',
              description: 'Patient first name',
            },
            last_name: {
              type: 'string',
              description: 'Patient last name',
            },
            date_of_birth: {
              type: 'string',
              format: 'date',
              nullable: true,
              description: 'Patient date of birth',
            },
            health_conditions: {
              type: 'array',
              items: { type: 'string' },
              description: 'List of health conditions',
            },
            medications: {
              type: 'array',
              items: { type: 'string' },
              description: 'List of medications',
            },
            dietary_restrictions: {
              type: 'array',
              items: { type: 'string' },
              description: 'List of dietary restrictions',
            },
            consent_status: {
              type: 'string',
              enum: ['active', 'pending', 'revoked'],
              description: 'Status of patient consent for newsletters',
            },
            consent_date: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              description: 'When consent was given',
            },
            preferred_frequency: {
              type: 'string',
              enum: ['daily', 'weekly', 'monthly'],
              nullable: true,
              description: 'Preferred newsletter frequency',
            },
          },
        },
        PatientUpdate: {
          type: 'object',
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'Patient email address',
            },
            first_name: {
              type: 'string',
              description: 'Patient first name',
            },
            last_name: {
              type: 'string',
              description: 'Patient last name',
            },
            date_of_birth: {
              type: 'string',
              format: 'date',
              nullable: true,
              description: 'Patient date of birth',
            },
            health_conditions: {
              type: 'array',
              items: { type: 'string' },
              description: 'List of health conditions',
            },
            medications: {
              type: 'array',
              items: { type: 'string' },
              description: 'List of medications',
            },
            dietary_restrictions: {
              type: 'array',
              items: { type: 'string' },
              description: 'List of dietary restrictions',
            },
            consent_status: {
              type: 'string',
              enum: ['active', 'pending', 'revoked'],
              description: 'Status of patient consent for newsletters',
            },
            consent_date: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              description: 'When consent was given',
            },
            preferred_frequency: {
              type: 'string',
              enum: ['daily', 'weekly', 'monthly'],
              nullable: true,
              description: 'Preferred newsletter frequency',
            },
          },
        },
        NewsletterTemplate: {
          type: 'object',
          required: ['name', 'subject', 'content', 'provider_id'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique identifier for the template',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'When the template was created',
            },
            provider_id: {
              type: 'string',
              format: 'uuid',
              description: 'ID of the healthcare provider this template belongs to',
            },
            name: {
              type: 'string',
              description: 'Template name',
            },
            subject: {
              type: 'string',
              description: 'Email subject line',
            },
            content: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  type: { 
                    type: 'string',
                    enum: ['text', 'image', 'button', 'divider', 'spacer', 'health-info']
                  },
                  content: { type: 'object' },
                  conditions: {
                    type: 'array',
                    items: { type: 'string' },
                  },
                  medications: {
                    type: 'array',
                    items: { type: 'string' },
                  },
                  dietary: {
                    type: 'array',
                    items: { type: 'string' },
                  },
                },
              },
              description: 'Newsletter content blocks',
            },
            target_conditions: {
              type: 'array',
              items: { type: 'string' },
              description: 'Target health conditions',
            },
            target_medications: {
              type: 'array',
              items: { type: 'string' },
              description: 'Target medications',
            },
            target_dietary: {
              type: 'array',
              items: { type: 'string' },
              description: 'Target dietary restrictions',
            },
            is_active: {
              type: 'boolean',
              description: 'Whether the template is active',
            },
          },
        },
        NewsletterCampaign: {
          type: 'object',
          required: ['template_id', 'name', 'provider_id'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique identifier for the campaign',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'When the campaign was created',
            },
            provider_id: {
              type: 'string',
              format: 'uuid',
              description: 'ID of the healthcare provider this campaign belongs to',
            },
            template_id: {
              type: 'string',
              format: 'uuid',
              description: 'ID of the newsletter template used',
            },
            name: {
              type: 'string',
              description: 'Campaign name',
            },
            status: {
              type: 'string',
              enum: ['draft', 'scheduled', 'sending', 'sent', 'paused'],
              description: 'Campaign status',
            },
            scheduled_date: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              description: 'When the campaign is scheduled to send',
            },
            sent_date: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              description: 'When the campaign was sent',
            },
            target_patient_count: {
              type: 'integer',
              description: 'Number of patients targeted',
            },
            actual_send_count: {
              type: 'integer',
              description: 'Number of newsletters actually sent',
            },
            open_count: {
              type: 'integer',
              description: 'Number of opens',
            },
            click_count: {
              type: 'integer',
              description: 'Number of clicks',
            },
          },
        },
        HealthOutcome: {
          type: 'object',
          required: ['patient_id', 'condition', 'measurement_type', 'measurement_value', 'measurement_date', 'provider_id'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique identifier for the health outcome',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'When the outcome was recorded',
            },
            provider_id: {
              type: 'string',
              format: 'uuid',
              description: 'ID of the healthcare provider',
            },
            patient_id: {
              type: 'string',
              format: 'uuid',
              description: 'ID of the patient',
            },
            condition: {
              type: 'string',
              description: 'Health condition being measured',
            },
            measurement_type: {
              type: 'string',
              description: 'Type of measurement (e.g., blood pressure, A1C)',
            },
            measurement_value: {
              type: 'number',
              description: 'Measured value',
            },
            measurement_date: {
              type: 'string',
              format: 'date-time',
              description: 'When the measurement was taken',
            },
            notes: {
              type: 'string',
              nullable: true,
              description: 'Additional notes',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  description: 'Error message',
                },
                details: {
                  type: 'array',
                  items: {
                    type: 'object',
                  },
                  description: 'Error details (optional)',
                },
              },
            },
          },
        },
        Success: {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              description: 'Response data',
            },
          },
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              properties: {
                items: {
                  type: 'array',
                  items: {
                    type: 'object',
                  },
                },
                pagination: {
                  type: 'object',
                  properties: {
                    total: {
                      type: 'integer',
                      description: 'Total number of items',
                    },
                    page: {
                      type: 'integer',
                      description: 'Current page',
                    },
                    limit: {
                      type: 'integer',
                      description: 'Items per page',
                    },
                    totalPages: {
                      type: 'integer',
                      description: 'Total number of pages',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    paths: {
      '/patients': {
        get: {
          summary: 'Get patients',
          description: 'Returns a list of patients for the authenticated healthcare provider',
          tags: ['Patients'],
          parameters: [
            {
              name: 'page',
              in: 'query',
              description: 'Page number',
              required: false,
              schema: {
                type: 'integer',
                default: 1,
              },
            },
            {
              name: 'limit',
              in: 'query',
              description: 'Items per page',
              required: false,
              schema: {
                type: 'integer',
                default: 10,
              },
            },
            {
              name: 'search',
              in: 'query',
              description: 'Search term for patient name or email',
              required: false,
              schema: {
                type: 'string',
              },
            },
            {
              name: 'condition',
              in: 'query',
              description: 'Filter by health condition',
              required: false,
              schema: {
                type: 'string',
              },
            },
          ],
          responses: {
            '200': {
              description: 'Successful operation',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'object',
                        properties: {
                          patients: {
                            type: 'array',
                            items: {
                              $ref: '#/components/schemas/Patient',
                            },
                          },
                          pagination: {
                            type: 'object',
                            properties: {
                              total: {
                                type: 'integer',
                                description: 'Total number of patients',
                              },
                              page: {
                                type: 'integer',
                                description: 'Current page',
                              },
                              limit: {
                                type: 'integer',
                                description: 'Items per page',
                              },
                              totalPages: {
                                type: 'integer',
                                description: 'Total number of pages',
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error',
                  },
                },
              },
            },
            '500': {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error',
                  },
                },
              },
            },
          },
        },
        post: {
          summary: 'Create patient',
          description: 'Creates a new patient for the authenticated healthcare provider',
          tags: ['Patients'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/PatientInput',
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'Patient created successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'object',
                        properties: {
                          patient: {
                            $ref: '#/components/schemas/Patient',
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            '400': {
              description: 'Validation error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error',
                  },
                },
              },
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error',
                  },
                },
              },
            },
            '500': {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error',
                  },
                },
              },
            },
          },
        },
      },
      '/patients/{id}': {
        get: {
          summary: 'Get patient by ID',
          description: 'Returns a specific patient by ID',
          tags: ['Patients'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              description: 'Patient ID',
              required: true,
              schema: {
                type: 'string',
                format: 'uuid',
              },
            },
          ],
          responses: {
            '200': {
              description: 'Successful operation',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'object',
                        properties: {
                          patient: {
                            $ref: '#/components/schemas/Patient',
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error',
                  },
                },
              },
            },
            '404': {
              description: 'Patient not found',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error',
                  },
                },
              },
            },
            '500': {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error',
                  },
                },
              },
            },
          },
        },
        put: {
          summary: 'Update patient',
          description: 'Updates an existing patient',
          tags: ['Patients'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              description: 'Patient ID',
              required: true,
              schema: {
                type: 'string',
                format: 'uuid',
              },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/PatientUpdate',
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Patient updated successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'object',
                        properties: {
                          patient: {
                            $ref: '#/components/schemas/Patient',
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            '400': {
              description: 'Validation error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error',
                  },
                },
              },
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error',
                  },
                },
              },
            },
            '404': {
              description: 'Patient not found',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error',
                  },
                },
              },
            },
            '500': {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error',
                  },
                },
              },
            },
          },
        },
        delete: {
          summary: 'Delete patient',
          description: 'Deletes a patient',
          tags: ['Patients'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              description: 'Patient ID',
              required: true,
              schema: {
                type: 'string',
                format: 'uuid',
              },
            },
          ],
          responses: {
            '200': {
              description: 'Patient deleted successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'object',
                        properties: {
                          message: {
                            type: 'string',
                            example: 'Patient deleted successfully',
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error',
                  },
                },
              },
            },
            '404': {
              description: 'Patient not found',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error',
                  },
                },
              },
            },
            '500': {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error',
                  },
                },
              },
            },
          },
        },
      },
      // Add additional endpoint documentation here
      // Like /newsletters/templates, /campaigns, etc.
    },
  },
  apiFolder: 'pages/api',
});

export default swaggerHandler();
