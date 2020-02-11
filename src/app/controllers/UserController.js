import * as Yup from 'yup';
import User from '../models/User';

class UserController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string()
        .required()
        .min(6),
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

    const { id, name, email } = await User.create(req.body);

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

    const { id, name } = await user.update(req.body);

    return res.status(200).json({
      id,
      name,
      email,
    });
  }

  async index(req, res) {
    const deliverymen = await User.findAll({
      where: {
        deliveryman: true,
      },
      attributes: ['id', 'name', 'email'],
    });

    return res.json(deliverymen);
  }

  async show(req, res) {
    const deliveryman = await User.findOne({
      where: { id: req.params.id, deliveryman: true },
      attributes: ['id', 'name', 'email'],
    });

    if (!deliveryman) {
      return res.status(404).json({ error: 'Delivery man not found' });
    }

    return res.json(deliveryman);
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
