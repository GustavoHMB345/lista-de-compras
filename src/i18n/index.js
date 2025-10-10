const pt = {
  auth: {
    login: 'Login',
    register: 'Cadastro',
    name: 'Nome',
    email: 'Email',
    password: 'Senha',
    placeholder: {
      name: 'Seu nome completo',
      email: 'Digite seu email',
      password: '••••••••',
    },
    testUser: 'Usuário de teste',
    toggle: {
      toRegister: 'Não tem uma conta? Cadastre-se.',
      toLogin: 'Já tem uma conta? Faça login.',
    },
    error: {
      invalidCredentials: 'Email ou senha inválidos.',
      registerFailed: 'Não foi possível cadastrar.',
      testUserNotFound: 'Usuário de teste não encontrado.',
    },
  },
};

let currentLocale = 'pt';
const bundles = { pt };

export const setLocale = (locale) => {
  if (bundles[locale]) currentLocale = locale;
};

export const t = (key, vars) => {
  const parts = String(key).split('.');
  let node = bundles[currentLocale];
  for (const p of parts) {
    if (!node) break;
    node = node[p];
  }
  let str = typeof node === 'string' ? node : key;
  if (vars && typeof str === 'string') {
    Object.entries(vars).forEach(([k, v]) => {
      str = str.replace(new RegExp(`{${k}}`, 'g'), String(v));
    });
  }
  return str;
};
