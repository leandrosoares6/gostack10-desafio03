import jwt from 'jsonwebtoken';
import * as Yup from 'yup';
import User from '../models/User';
import File from '../models/File';

import authConfig from '../../config/authConfig';

class SessionController {
  async store(req, res) {
    const schema = Yup.object().shape({
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({
        error: 'Validations fails',
      });
    }

    const { email, password } = req.body;

    const user = await User.findOne({
      where: {
        email,
      },
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });

    if (!user) {
      res.status(401).json({
        error: 'User not found',
      });
    }

    if (!(await user.checkPassword(password))) {
      return res.status(401).json({
        error: 'Incorrect password',
      });
    }

    const { id, name, avatar, role } = user;

    return res.status(200).json({
      user: {
        id,
        name,
        email,
        avatar,
        role,
      },
      token: jwt.sign({ id }, authConfig.secret, {
        expiresIn: authConfig.expiresIn,
      }),
    });
  }
}

export default new SessionController();
