const bcrypt = require('bcryptjs');
const authController = require('./authController');

jest.mock('bcryptjs');

test('login with wrong password returns 400', async () => {

    bcrypt.compare.mockResolvedValue(false);

    const req = {
        body: {
            email: 'test@test.com',
            password: '123456'
        }
    };

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        cookie: jest.fn()
    };

    await authController.login_post(req, res);

    expect(res.status).toHaveBeenCalledWith(400);

});