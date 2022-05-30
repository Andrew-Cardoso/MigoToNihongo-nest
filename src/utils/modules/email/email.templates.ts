const container = (content: string, name: string, greeting = 'Olá') => `
  <div 
    style="
      width: 100%;
      height: 100%;
      display: grid;
      justify-content: center;
      font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif;
      font-size: 18px;
      color: #000;">
      <div style="display: grid;width: 100%;height: 100%;place-content: center">
        <img src="https://i.pinimg.com/originals/0a/89/c3/0a89c3b99dc608f26ea779359c5a7d5b.jpg" alt="header-image"/>
        <h1 style="font-size: 24px">${greeting} ${name}</h1>
        ${content}
      </div>
    </div>
`;

const button = (href: string) => `
<a
  href="${href}"
  target="_blank"
  style="
    background-color: #f4d1d5;
    padding: 8px;
    font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif;
    display: inline-block;
    margin-bottom: 0;
    font-weight: normal;
    text-align: center;
    vertical-align: middle;
    cursor: pointer;
    white-space: nowrap;
    user-select: none;
    text-decoration: none;
    border-radius: 6px;
    font-size: 16px;
    line-height: 20px;
    padding: 8px 12px;
    overflow: hidden;
    position: relative;
    color: #000;
  "
  >
Clique aqui
</a>
`;

/* eslint-disable prettier/prettier */
export const resetPasswordTemplate = (name: string, href: string) =>
  container(
    `
  <p>
    ${button(href)}
    para redefinir sua senha no
    <strong>MigoTo Nihongo</strong>.
  </p>
  <p>Caso não tenha solicitado a redefinição de senha, ignore este email.</p>
  <small style="margin-top: 20px">Este email expira em 15 minutos.</small>
`,
    name,
  );

/* eslint-disable prettier/prettier */
export const verificationEmailTemplate = (name: string, href: string) =>
  container(
    `
  <p>
    ${button(href)}
    para se juntar ao
    <strong>MigoTo Nihongo</strong>.
  </p>

  <p>Caso não tenha criado uma conta em nossa página, ignore este email.</p>

  <small style="margin-top: 20px">Este email expira em 24 horas.</small>
`,
    name,
    'Bem vindo',
  );

export const confirmUserUpdate = (name: string, keys: string[], href: string) =>
  container(
    `
  <p>Foi solicitada a alteração ${
    keys.length > 1 ? 'das seguintes informações' : 'da seguinte informação'
  } sobre sua conta:</p>
  <div style="width: 100%; display: grid; grid-template-columns: 1fr; gap: 16px">
    <p>${keys.join(', ')}</p>
  </div>
  <p>
    ${button(href)}
    para confirmar e aplicar as alterações.
  </p>
  <p>Caso não tenha alterado seus dados sugerimos criar uma nova senha.</p>
  <small style="margin-top: 20px">Este email expira em 4 horas.</small>
`,
    name,
  );
