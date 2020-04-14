import * as Yup from 'yup';
import { Op } from 'sequelize';
import { startOfDay, endOfDay, getHours } from 'date-fns';
import Recipient from '../models/Recipient';
import Delivery from '../models/Delivery';
// import File from '../models/File';

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
    const schema = Yup.object().shape({
      started: Yup.boolean(),
      finished: Yup.boolean(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({
        error: 'Validations fails',
      });
    }

    const { started, finished } = req.body;

    if (started) {
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

      if (countDeliveries.count >= 5) {
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

      await delivery.update({ started: true });

      return res.json(delivery);
    }

    if (finished) {
      /**
       * Verify if signature has been uploaded before finalizing the delivery
       */
      /* if (!req.file) {
        return res.status(400).json({
          error:
            "To complete the delivery, the recipient's signature must be sent",
        });
      }
      const { originalname: name, filename: path } = req.file;
      const { id } = await File.create({
        name,
        path,
      }); */

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

      await delivery.update({ finished: true });

      return res.json(delivery);
    }

    return res.status(400).json({ error: 'Bad request' });
  }
}
export default new ScheduleController();
