const axios = require('axios');

const meta = {
  name: "Gen",
  desc: "Generate temporary email accounts",
  author: "rapido (jm)",
  method: "get",
  category: "tempmail",
  params: []
};

async function onStart({ res }) {
  try {
    const domain = await getRandomDomain();
    const randomString = generateRandomString(10);
    const email = `${randomString}@${domain}`;
    const password = randomString;
    
    const account = await createAccount(email, password);
    const token = await getToken(email, password);
    
    return res.json({
      email: account.address,
      password: password,
      token: token.token,
      id: account.id
    });
  } catch (error) {
    return res.json({ error: error.message });
  }
}

async function getRandomDomain() {
  const { data } = await axios.get('https://api.mail.tm/domains');
  const domains = data['hydra:member'];
  return domains[Math.floor(Math.random() * domains.length)].domain;
}

function generateRandomString(length) {
  return Math.random().toString(36).substring(2, length + 2);
}

async function createAccount(email, password) {
  const { data } = await axios.post('https://api.mail.tm/accounts', {
    address: email,
    password: password
  }, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return data;
}

async function getToken(email, password) {
  const { data } = await axios.post('https://api.mail.tm/token', {
    address: email,
    password: password
  }, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return data;
}

module.exports = { meta, onStart };