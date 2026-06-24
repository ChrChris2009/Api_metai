// Modified inboxV2.js
const axios = require('axios');

const meta = {
  name: "Inbox",
  desc: "Check temporary email inbox",
  method: [ 'get', 'post' ],
  category: 'tempmail',
  params: [
    {
      name: 'token',
      desc: 'The authentication token',
      example: 'your_token_here',
      required: true
    }
  ]
};

async function onStart({ req, res }) {
  let token;
  if (req.method === 'POST') {
    ({ token } = req.body);
  } else {
    ({ token } = req.query);
  }
  if (!token) {
    return res.status(400).json({
      error: "Missing required parameter: token"
    });
  }

  try {
    const messages = await getMessages(token);
    const formattedMessages = messages.map(message => ({
      id: message.id,
      from: message.from,
      subject: message.subject,
      intro: message.intro,
      date: message.createdAt,
      read: message.seen
    }));

    return res.json({
      answer: formattedMessages
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || 'Internal server error'
    });
  }
}

async function getMessages(token) {
  const { data } = await axios.get('https://api.mail.tm/messages', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return data['hydra:member'];
}

module.exports = { meta, onStart };