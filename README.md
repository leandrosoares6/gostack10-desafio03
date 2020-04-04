# gostack10-desafio03

Este projeto foi desenvolvido baseado no desafio 03 do Bootcamp GoStack 10 da Rocketseat.

Link do desafio: https://github.com/Rocketseat/bootcamp-gostack-desafio-03/blob/master/README.md#desafio-03-continuando-aplica%C3%A7%C3%A3o

Se trata de uma API Rest para gerenciamento de entregas de encomendas, envolvendo cadastro de destinatários, entregadores, problemas nas entregas, envio de notificações e emails.

Os diferenciais desta abordagem são o fato de haver um perfil de acesso para um usuário administrador e para entregadores, além de envio de notificações para ambos e email ao entregador com suas credenciais após seu cadastro.

Tecnologias:

-> express - utilizada como base na construção do servidor, middlewares e toda a parte de roteamento da aplicação;

-> express-handlebars - lib para geração de templates, neste caso templates para emails;

-> jsonwebtoken, bcrypt e generate-password para autorização e geração de senha segura;

-> sequelize - ORM para persistência das entidades no banco de dados PostgreSQL;

-> mongoose - ORM NoSQL para persistência das notificações dos usuários;

-> nodemailer - Testando envio de emails aos entregadores recém cadastrados (através do mailtrap);

-> bee-queue - Geração de filas de trabalho, neste caso a terceirização do envio de emails com Redis;

-> axios - Ferramenta para realização de integração com outras APIs, neste caso para obtenção de endereços através de CEP;

-> dotenv - Biblioteca utilizada para organizar variáveis de ambiente;

-> multer - biblioteca para upload de arquivos, neste projeto o envio dos avatares dos usuários e as assinaturas dos destinatários após a entrega;

-> sentry - geração de logs de erros




