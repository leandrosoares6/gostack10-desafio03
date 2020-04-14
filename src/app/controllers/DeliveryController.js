import { Op, Sequelize } from 'sequelize';
import * as Yup from 'yup';
import { format } from 'date-fns';
import pt from 'date-fns/locale/pt';

import Delivery from '../models/Delivery';
import User from '../models/User';
import Recipient from '../models/Recipient';
import File from '../models/File';
import Notification from '../schemas/Notification';

class DeliveryController {
  async store(req, res) {
    const schema = Yup.object().shape({
      product: Yup.string().required(),
      recipient_id: Yup.number().required(),
      deliveryman_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({
        error: 'Validation fails',
      });
    }

    const { recipient_id, deliveryman_id } = req.body;

    const deliveryman = await User.findOne({ where: { id: deliveryman_id } });
    const recipient = await Recipient.findOne({ where: { id: recipient_id } });

    if (!deliveryman) {
      return res.status(404).json({ error: 'Delivery man not found' });
    }

    if (!recipient) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    const delivery = await Delivery.create(req.body);

    /**
     * Notify delivery man
     */
    const formattedDate = format(new Date(), "dd 'de' MMMM', às' H:mm'h'", {
      locale: pt,
    });

    await Notification.create({
      content: `Nova encomenda registrada em ${formattedDate}`,
      user: deliveryman_id,
    });

    /**
     * Implementar aqui envio de email
     */

    return res.json(delivery);
  }

  async index(req, res) {
    const { page = 1, linesPerPage = 6, q } = req.query;

    if (q) {
      const deliveries = await Delivery.findAndCountAll({
        /* where: {
          product: {
            [Op.iLike]: `%${q}%`,
          },
        }, */
        where: Sequelize.where(
          Sequelize.fn('unaccent', Sequelize.col('product')),
          {
            [Op.iLike]: `%${q}%`,
          }
        ),
        order: [['created_at', 'ASC']],
        limit: linesPerPage,
        offset: (page - 1) * linesPerPage,
        attributes: [
          'id',
          'product',
          'canceled_at',
          'start_date',
          'end_date',
          'status',
        ],
        include: [
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
        ],
      });

      return res.json(deliveries);
    }
    const deliveries = await Delivery.findAndCountAll({
      order: [['created_at', 'ASC']],
      limit: linesPerPage,
      offset: (page - 1) * linesPerPage,
      attributes: [
        'id',
        'product',
        'canceled_at',
        'start_date',
        'end_date',
        'status',
      ],
      include: [
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
      ],
    });

    return res.json(deliveries);
  }

  async show(req, res) {
    const delivery = await Delivery.findOne({
      where: { id: req.params.id },
      attributes: [
        'id',
        'product',
        'canceled_at',
        'start_date',
        'end_date',
        'status',
      ],
      include: [
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
      ],
    });

    if (!delivery) {
      return res.status(404).json({ error: 'Delivery not found' });
    }
    return res.json(delivery);
  }

  async update(req, res) {
    const delivery = await Delivery.findOne({ where: { id: req.params.id } });

    if (!delivery) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    const schema = Yup.object().shape({
      product: Yup.string(),
      recipient_id: Yup.number(),
      deliveryman_id: Yup.number(),
      canceled_at: Yup.date(),
      start_date: Yup.date(),
      end_date: Yup.date(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({
        error: 'Validation fails',
      });
    }

    delivery.update(req.body);

    return res.json(delivery);
  }

  async destroy(req, res) {
    const delivery = await Delivery.findOne({ where: { id: req.params.id } });

    if (!delivery) {
      return res.status(404).json({
        error: 'Delivery not found',
      });
    }

    await delivery.update({
      canceled_at: new Date(),
    });

    return res.status(200).send();
  }
}

export default new DeliveryController();
