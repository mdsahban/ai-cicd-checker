const request = require('supertest');
const app = require('../src/server');

describe('API Endpoints', () => {
    
    it('GET / should return 200 and serve HTML', async () => {
        const res = await request(app).get('/');
        expect(res.statusCode).toEqual(200);
        expect(res.headers['content-type']).toMatch(/text\/html/);
    });

    it('GET /health should return 200 and JSON with status healthy', async () => {
        const res = await request(app).get('/health');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('status', 'healthy');
        expect(res.body).toHaveProperty('version', '1.0.0');
    });

    it('GET /unknown should return 404', async () => {
        const res = await request(app).get('/unknown');
        expect(res.statusCode).toEqual(404);
        expect(res.body).toHaveProperty('error', 'Not Found');
    });

});
