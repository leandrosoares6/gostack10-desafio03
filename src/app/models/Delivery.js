import Sequelize, { Model } from 'sequelize';

class Delivery extends Model {
  static init(sequelize) {
    super.init(
      {
        product: Sequelize.STRING,
        canceled_at: Sequelize.DATE,
        started: Sequelize.VIRTUAL,
        start_date: Sequelize.DATE,
        finished: Sequelize.VIRTUAL,
        end_date: Sequelize.DATE,
        status: {
          type: Sequelize.VIRTUAL,
          get() {
            if (this.canceled_at !== null) {
              return 'CANCELED';
            }

            if (this.start_date !== null && this.end_date === null) {
              return 'WITHDRAWAL';
            }

            if (this.start_date !== null && this.end_date !== null) {
              return 'DELIVERED';
            }

            return 'PENDING';
          },
        },
      },
      {
        sequelize,
      }
    );

    this.addHook('beforeUpdate', async delivery => {
      if (delivery.started) {
        delivery.start_date = new Date();
      }

      if (delivery.finished) {
        delivery.end_date = new Date();
      }
    });

    return this;
  }

  static associate(models) {
    this.belongsTo(models.File, {
      foreignKey: 'signature_id',
      as: 'signature',
    });
    this.belongsTo(models.User, {
      foreignKey: 'deliveryman_id',
      as: 'deliveryman',
    });
    this.belongsTo(models.Recipient, {
      foreignKey: 'recipient_id',
      as: 'recipient',
    });
  }
}

export default Delivery;
