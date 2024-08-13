const fetch = require('node-fetch');

exports.handler = async (event) => {
  try {
    const { file, content, method } = JSON.parse(event.body);

    // Ensure the file path doesn't access restricted directories
    if (file.startsWith('dev/') || file.startsWith('admin/')) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: 'Access denied' }),
      };
    }

    // GitHub API URL for creating/updating a file
    const githubApiUrl = `https://api.github.com/repos/usejxo/jxo-user-edit/contents/${file}`;
    
    // Determine method for GitHub API (PUT for update, DELETE for delete)
    const apiMethod = method === 'DELETE' ? 'DELETE' : 'PUT';
    
    const response = await fetch(githubApiUrl, {
      method: apiMethod,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
      },
      body: JSON.stringify({
        message: `${apiMethod === 'PUT' ? 'Update' : 'Delete'} ${file}`,
        content: apiMethod === 'PUT' ? Buffer.from(content).toString('base64') : undefined,
        sha: apiMethod === 'DELETE' ? await getFileSha(file) : undefined,
      }),
    });

    const result = await response.json();

    if (response.ok) {
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true }),
      };
    } else {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: result.message || 'Error processing file' }),
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server error' }),
    };
  }
};

// Function to get file SHA for deletion
async function getFileSha(file) {
  const response = await fetch(`https://api.github.com/repos/usejxo/jxo-user-edit/contents/${file}`, {
    headers: {
      'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
    },
  });
  const result = await response.json();
  return result.sha;
}
