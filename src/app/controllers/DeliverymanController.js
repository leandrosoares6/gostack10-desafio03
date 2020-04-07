import { Op } from 'sequelize';
import * as Yup from 'yup';
import User from '../models/User';

class DeliverymanController {
  async index(req, res) {
    const { page = 1, q } = req.query;

    if (q) {
      const deliverymen = await User.findAll({
        where: {
          deliveryman: true,
          name: {
            [Op.iLike]: `%${q}`,
          },
        },
        order: [['name', 'ASC']],
        limit: 20,
        offset: (page - 1) * 20,
        attributes: ['id', 'name', 'email'],
      });

      return res.json(deliverymen);
    }

    const deliverymen = await User.findAll({
      where: {
        deliveryman: true,
      },
      order: [['name', 'ASC']],
      limit: 20,
      offset: (page - 1) * 20,
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

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      oldPassword: Yup.string(),
      password: Yup.string()
        .min(6)
        .when('oldPassword', (oldPassword, field) =>
          oldPassword ? field.required() : field
        ),
      confirmPassword: Yup.string().when('password', (password, field) =>
        password ? field.required().oneOf([Yup.ref('password')]) : field
      ),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({
        error: 'Validations fails',
      });
    }
    const { email, oldPassword } = req.body;

    const user = await User.findByPk(req.userId);

    if (email && email !== user.email) {
      const userExists = await User.findOne({ where: { email } });

      if (userExists) {
        return res.status(400).json({
          error: 'User already exists',
        });
      }
    }

    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(401).json({
        error: 'Password does not match',
      });
    }

    const { id, name } = await user.update(req.body);

    return res.status(200).json({
      id,
      name,
      email,
    });
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

export default new DeliverymanController();
