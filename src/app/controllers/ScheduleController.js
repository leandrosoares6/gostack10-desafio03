import { Op } from 'sequelize';
import { startOfDay, endOfDay, getHours } from 'date-fns';
import Recipient from '../models/Recipient';
import Delivery from '../models/Delivery';

class ScheduleController {
  async index(req, res) {
    const { page = 1, delivered } = req.query;

    if (delivered === 'true') {
      const deliveries = await Delivery.findAll({
        where: {
          deliveryman_id: req.userId,
          canceled_at: null,
          end_date: {
            [Op.ne]: null,
          },
        },
        order: [['end_date', 'DESC']],
        limit: 20,
        offset: (page - 1) * 20,
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
        ],
      });

      return res.json(deliveries);
    }

    const deliveries = await Delivery.findAll({
      where: {
        deliveryman_id: req.userId,
        canceled_at: null,
        end_date: null,
      },
      order: [['created_at', 'ASC']],
      limit: 20,
      offset: (page - 1) * 20,
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
      ],
    });

    return res.json(deliveries);
  }

  async update(req, res) {
    const { pickup, finish } = req.query;

    if (!finish && pickup === 'true') {
      const hour = getHours(new Date());

      if (hour < 8 || hour > 18) {
        return res.status(400).json({
          error: 'Withdrawals can only be made between 8 am and 6 pm',
        });
      }

      const countDeliveries = await Delivery.findAndCountAll({
        where: {
          deliveryman_id: req.userId,
          start_date: {
            [Op.between]: [startOfDay(new Date()), endOfDay(new Date())],
          },
        },
      });

      if (countDeliveries.count > 5) {
        return res.status(400).json({
          error: 'Delivery men can only make 5 withdrawal per day',
        });
      }

      const delivery = await Delivery.findOne({
        where: {
          id: req.params.id,
          deliveryman_id: req.userId,
          canceled_at: null,
          start_date: null,
        },
      });

      if (!delivery) {
        return res.status(404).json({ error: 'Delivery not found' });
      }

      await delivery.update({ start_date: new Date() });

      return res.json(delivery);
    }

    if (!pickup && finish === 'true') {
      const delivery = await Delivery.findOne({
        where: {
          id: req.params.id,
          deliveryman_id: req.userId,
          canceled_at: null,
          start_date: {
            [Op.ne]: null,
          },
          end_date: null,
        },
      });

      if (!delivery) {
        return res.status(404).json({ error: 'Delivery not found' });
      }

      await delivery.update({ end_date: new Date() });

      return res.json(delivery);
    }

    return res.status(400).json({ error: 'Bad request' });
  }
}
export default new ScheduleController();
