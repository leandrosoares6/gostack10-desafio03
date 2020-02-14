import * as Yup from 'yup';
import { format } from 'date-fns';
import pt from 'date-fns/locale/pt';

import User from '../models/User';
import Problem from '../models/Problem';
import Delivery from '../models/Delivery';
import Notification from '../schemas/Notification';
/* import Recipient from '../models/Recipient';
import User from '../models/User';
import File from '../models/File'; */

class ProblemController {
  async index(req, res) {
    const { page = 1 } = req.query;
    /* const allProblems = await Problem.findAll({
      order: [['created_at', 'ASC']],
      limit: 20,
      offset: (page - 1) * 20,
      attributes: ['id', 'description'],
      include: [
        {
          model: Delivery,
          as: 'delivery',
          attributes: ['id', 'product'],
          include: [
            {
              model: Recipient,
              as: 'recipient',
              attributes: [
                'id',
                'name',
                'zip_code',
                'street',
                'number',
                'complement',
                'city',
                'state',
              ],
            },
            {
              model: User,
              as: 'deliveryman',
              attributes: ['id', 'name'],
              include: [
                {
                  model: File,
                  as: 'avatar',
                  attributes: ['id', 'path', 'url'],
                },
              ],
            },
            {
              model: File,
              as: 'signature',
              attributes: ['id', 'path', 'url'],
            },
          ],
        },
      ],
    }); */

    const allProblems = await Problem.findAll({
      order: [['created_at', 'ASC']],
      limit: 20,
      offset: (page - 1) * 20,
      attributes: ['id', 'description'],
      include: [
        {
          model: Delivery,
          as: 'delivery',
          attributes: ['id', 'product'],
        },
      ],
    });

    return res.json(allProblems);
  }

  async show(req, res) {
    const deliveryProblems = await Problem.findAll({
      where: {
        delivery_id: req.params.id,
      },
      order: [['created_at', 'ASC']],
      attributes: ['id', 'description'],
      /* include: [
        {
          model: Delivery,
          as: 'delivery',
          attributes: ['id', 'product'],
          include: [
            {
              model: Recipient,
              as: 'recipient',
              attributes: [
                'id',
                'name',
                'zip_code',
                'street',
                'number',
                'complement',
                'city',
                'state',
              ],
            },
            {
              model: User,
              as: 'deliveryman',
              attributes: ['id', 'name'],
              include: [
                {
                  model: File,
                  as: 'avatar',
                  attributes: ['id', 'path', 'url'],
                },
              ],
            },
            {
              model: File,
              as: 'signature',
              attributes: ['id', 'path', 'url'],
            },
          ],
        },
      ], */
    });

    if (!deliveryProblems) {
      return res.status(400).json({ error: 'Problem not found' });
    }

    return res.json(deliveryProblems);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      description: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({
        error: 'Validations fails',
      });
    }

    const delivery = await Delivery.findOne({
      where: {
        id: req.params.id,
      },
    });

    if (!delivery) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    if (delivery.deliveryman_id !== req.userId) {
      return res.status(401).json({
        error: "You  don't have permission to add problems in this delivery.",
      });
    }

    if (delivery.start_date === null) {
      return res.status(400).json({
        error:
          'It is not allowed to register a problem in a delivery that has not started',
      });
    }

    req.body.delivery_id = req.params.id;

    const { id, description } = await Problem.create(req.body);

    /**
     * Notify admin user when register a new problem
     */
    const admin = await User.findOne({ where: { role: 'ADMIN' } });

    const formattedDate = format(new Date(), "dd 'de' MMMM', às' H:mm'h'", {
      locale: pt,
    });

    await Notification.create({
      content: `Novo problema registrado em ${formattedDate}`,
      user: admin.id,
    });

    return res.json({
      id,
      description,
    });
  }

  async delete(req, res) {
    const problem = await Problem.findOne({ where: { id: req.params.id } });

    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    const delivery = await Delivery.findOne({
      where: { id: problem.delivery_id },
    });

    await delivery.update({ canceled_at: new Date() });

    return res.json(delivery);
  }
}

export default new ProblemController();
