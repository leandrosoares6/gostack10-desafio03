import * as Yup from 'yup';
import Delivery from '../models/Delivery';
import User from '../models/User';
import Recipient from '../models/Recipient';
import File from '../models/File';

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
    const delivery = await Delivery.create(req.body);

    // Implementar aqui o envio do email/notificacao para o entregador
    return res.json(delivery);
  }

  async index(req, res) {
    const { page = 1 } = req.query;
    const deliveries = await Delivery.findAll({
      where: { canceled_at: null },
      order: [['created_at', 'DESC']],
      limit: 20,
      offset: (page - 1) * 20,
      attributes: ['id', 'product'],
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
      attributes: ['id', 'product'],
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

    await delivery.destroy();

    return res.status(200).send();
  }
}

export default new DeliveryController();
