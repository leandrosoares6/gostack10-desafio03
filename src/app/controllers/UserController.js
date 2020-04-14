import * as Yup from 'yup';
import generator from 'generate-password';
import User from '../models/User';
import File from '../models/File';

import SendCredentials from '../jobs/SendCredentials';
import Queue from '../../lib/Queue';

class UserController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({
        error: 'Validations fails',
      });
    }

    const userExists = await User.findOne({ where: { email: req.body.email } });

    if (userExists) {
      return res.status(400).json({
        error: 'User already exists',
      });
    }
    req.body.password = generator.generate({
      length: 6,
      numbers: true,
      lowercase: true,
      uppercase: true,
      strict: true,
    });

    const deliveryman = req.body;

    const { id, name, email } = await User.create(req.body);

    await Queue.add(SendCredentials.key, {
      deliveryman,
    });

    return res.status(200).json({
      id,
      name,
      email,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      password: Yup.string().min(6),
      confirmPassword: Yup.string().when('password', (password, field) =>
        password ? field.required().oneOf([Yup.ref('password')]) : field
      ),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({
        error: 'Validations fails',
      });
    }

    /**
     * Atualizar meu perfil de admin
     */
    if (!req.params.id) {
      const { email } = req.body;

      if (email) {
        const userExists = await User.findOne({ where: { email } });

        if (userExists && userExists.id !== req.userId) {
          return res.status(400).json({
            error: 'User already exists',
          });
        }
      }

      const user = await User.findByPk(req.userId);

      await user.update(req.body);

      const { id, name, avatar } = await User.findByPk(req.userId, {
        include: [
          {
            model: File,
            as: 'avatar',
            attributes: ['id', 'path', 'url'],
          },
        ],
      });

      return res.status(200).json({
        id,
        name,
        email,
        avatar,
      });
    }
    /**
     * Atualização de entregadores
     */
    const { email } = req.body;

    const user = await User.findOne({ where: { id: req.params.id } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (email && email !== user.email) {
      const userExists = await User.findOne({ where: { email } });

      if (userExists) {
        return res.status(400).json({
          error: 'User already exists',
        });
      }
    }

    await user.update(req.body);

    const { id, name, avatar } = await User.findByPk(req.params.id, {
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });

    return res.status(200).json({
      id,
      name,
      email,
      avatar,
    });
  }

  async index(req, res) {
    const { page = 1 } = req.query;
    const users = await User.findAll({
      order: [['name', 'ASC']],
      limit: 20,
      offset: (page - 1) * 20,
      attributes: ['id', 'name', 'email'],
    });

    return res.json(users);
  }

  async show(req, res) {
    const users = await User.findOne({
      attributes: ['id', 'name', 'email'],
    });

    if (!users) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json(users);
  }

  async destroy(req, res) {
    const deliveryman = await User.findOne({
      where: { id: req.params.id, deliveryman: true },
    });

    if (!deliveryman) {
      return res.status(404).json({ error: 'Delivery man not found' });
    }

    await deliveryman.destroy();

    return res.status(200).send();
  }
}

export default new UserController();
