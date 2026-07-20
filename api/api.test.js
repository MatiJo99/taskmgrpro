const request = require('supertest');
const app = require('./server');

describe('API Integration Test', () => {

    test('GET /user-status should return loggedIn property', async () => {

        const res = await request(app)
            .get('/user-status');

        expect(res.statusCode).toBe(200);

        expect(res.body).toHaveProperty('loggedIn');

        expect(typeof res.body.loggedIn).toBe('boolean');

    });

});