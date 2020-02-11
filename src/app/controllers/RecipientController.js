import * as Yup from 'yup';
import axios from 'axios';
import Recipient from '../models/Recipient';

class RecipientController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      zip_code: Yup.string()
        .required()
        .length(8),
      street: Yup.string().required(),
      number: Yup.string().required(),
      complement: Yup.string(),
      city: Yup.string(),
      state: Yup.string(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({
        error: 'Validations fails',
      });
    }

    const { name, zip_code, street, number } = req.body;
    let { complement, city, state } = req.body;

    const apiResponse = await axios.get(
      `https://viacep.com.br/ws/${zip_code}/json/`
    );

    const {
      erro,
      logradouro,
      complemento,
      bairro,
      localidade,
      uf,
    } = apiResponse.data;

    if (erro) {
      return res.status(400).json({
        error:
          'Zip code not found, please add other fields of address manually.',
        other_fields: ['complement', 'city', 'state'],
      });
    }

    if (!complement && complemento !== '') {
      complement = complemento;
    } else if (!complement) {
      complement = `Bairro ${bairro}, logradouro ${logradouro}`;
    }
    if (!city) {
      city = localidade;
    }
    if (!state) {
      state = uf;
    }

    const recipient = await Recipient.create({
      name,
      zip_code,
      street,
      number,
      complement,
      city,
      state,
    });

    return res.status(200).json(recipient);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      zip_code: Yup.string().length(8),
      street: Yup.string(),
      number: Yup.string(),
      complement: Yup.string(),
      city: Yup.string(),
      state: Yup.string(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({
        error: 'Validations fails',
      });
    }

    const { id } = req.params;

    const recipient = await Recipient.findByPk(id);

    if (!recipient) {
      return res.status(404).json({
        error: 'Recipient not found',
      });
    }

    const {
      name,
      zip_code,
      street,
      number,
      complement,
      city,
      state,
    } = req.body;

    const fields = {};

    if (name) {
      fields.name = name;
    }

    if (zip_code) {
      fields.zip_code = zip_code;
    }

    if (street) {
      fields.street = street;
    }

    if (number) {
      fields.number = number;
    }

    if (complement) {
      fields.complement = complement;
    }

    if (city) {
      fields.city = city;
    }

    if (state) {
      fields.state = state;
    }

    const recipientUpdated = await recipient.update(fields);

    return res.status(200).json(recipientUpdated);
  }

  async index(req, res) {
    const recipients = await Recipient.findAll();
    return res.status(200).json(recipients);
  }

  async show(req, res) {
    const { id } = req.params;
    const recipient = await Recipient.findByPk(id);

    if (!recipient) {
      return res.status(404).json({
        error: 'Recipient not found',
      });
    }

    return res.status(200).json(recipient);
  }

  async destroy(req, res) {
    const recipient = await Recipient.findOne({ where: { id: req.params.id } });

    if (!recipient) {
      return res.status(404).json({
        error: 'Recipient not found',
      });
    }

    await recipient.destroy();

    return res.status(200).send();
  }
}

export default new RecipientController();
