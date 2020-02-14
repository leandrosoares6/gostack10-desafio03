import Mail from '../../lib/Mail';

class SendCredentials {
  get key() {
    return 'SendCredentials';
  }

  async handle({ data }) {
    const { deliveryman } = data;

    await Mail.sendMail({
      to: `${deliveryman.name} <${deliveryman.email}>`,
      subject: 'Credenciais de acesso ao app FastFeet',
      template: 'credentials',
      context: {
        name: deliveryman.name,
        email: deliveryman.email,
        password: deliveryman.password,
      },
    });
  }
}

export default new SendCredentials();
