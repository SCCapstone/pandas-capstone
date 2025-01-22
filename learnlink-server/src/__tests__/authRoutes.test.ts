// __tests__/authRoutes.test.ts
import request from 'supertest';
import { app } from '../index';

describe('POST /login', () => {
  it('responds with a token for valid credentials', async () => {
    const res = await request(app)
      .post('/login')
      .send({ username: 'testuser', password: 'testpassword' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('responds with 401 for invalid credentials', async () => {
    const res = await request(app)
      .post('/login')
      .send({ username: 'testuser', password: 'wrongpassword' });

    expect(res.status).toBe(401);
  });
});
