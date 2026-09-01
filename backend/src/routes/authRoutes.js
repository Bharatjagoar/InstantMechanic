import { Router } from 'express'
import { login, me, register } from '../controllers/authController.js'
import { requireAuth } from '../middleware/requireAuth.js'

const router = Router()

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new customer account
 *     description: >
 *       Creates a customer, a vehicle for them, and a login account in one step, then logs
 *       them in immediately (same response shape as /auth/login).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, phone, password, vehicle]
 *             properties:
 *               name: { type: string, example: 'Jordan Rivera' }
 *               email: { type: string, example: 'jordan@example.com' }
 *               phone: { type: string, example: '+15551234567' }
 *               password: { type: string, example: 'a-strong-password' }
 *               vehicle:
 *                 type: object
 *                 required: [make, model, licensePlate]
 *                 properties:
 *                   make: { type: string, example: 'Honda' }
 *                   model: { type: string, example: 'Civic' }
 *                   year: { type: integer, example: 2020 }
 *                   licensePlate: { type: string, example: 'HR26AB1234' }
 *     responses:
 *       201:
 *         description: Bearer token and the newly created user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token: { type: string }
 *                 user: { $ref: '#/components/schemas/User' }
 *       400:
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       409:
 *         description: An account with that email already exists
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post('/register', register)

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Log in with email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, example: 'ops@instantmechanic.demo' }
 *               password: { type: string, example: 'password123' }
 *     responses:
 *       200:
 *         description: Bearer token and the logged-in user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token: { type: string }
 *                 user: { $ref: '#/components/schemas/User' }
 *       401:
 *         description: Invalid email or password
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post('/login', login)

/**
 * @openapi
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get the currently logged-in user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The logged-in user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user: { $ref: '#/components/schemas/User' }
 *       401:
 *         description: Missing or invalid token
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get('/me', requireAuth, me)

export default router
