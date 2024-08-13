const fetch = require('node-fetch');

exports.handler = async (event) => {
  try {
    const { file } = event.queryStringParameters;

    // Ensure the file path doesn't access restricted directories
    if (file.startsWith('dev/') || file.startsWith('admin/')) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: 'Access denied' }),
      };
    }

    const response = await fetch(`https://api.github.com/repos/usejxo/jxo-user-edit/contents/${file}`, {
      headers: {
        'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
      },
    });

    const result = await response.json();

    if (response.ok) {
      return {
        statusCode: 200,
        body: JSON.stringify({ content: Buffer.from(result.content, 'base64').toString() }),
      };
    } else {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: result.message || 'Error fetching file' }),
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server error' }),
    };
  }
};
