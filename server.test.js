const test = require('node:test');
const assert = require('node:assert/strict');
const { createServer } = require('node:http');
const { app } = require('../server');

const server = createServer(app);

async function startServer() {
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  return port;
}

async function stopServer() {
  await new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}

test('health endpoint works', async () => {
  const port = await startServer();

  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/health`);
    const result = await response.json();

    assert.equal(response.status, 200);
    assert.equal(result.status, 'ok');
    assert.equal(result.app, 'GB Job Portal');
  } finally {
    await stopServer();
  }
});

test('jobs endpoint returns a list and application endpoints work', async () => {
  const port = await startServer();

  try {
    const jobsResponse = await fetch(`http://127.0.0.1:${port}/api/jobs`);
    const jobsData = await jobsResponse.json();

    assert.equal(jobsResponse.status, 200);
    assert.ok(Array.isArray(jobsData));
    assert.ok(jobsData.length > 0);

    const newJob = {
      title: 'Business Analyst',
      company: 'GB Consulting',
      location: 'Dubai',
      type: 'Full-time',
      category: 'Business',
      salary: '$2,800 - $3,500 / month',
      experience: '2+ years',
      description: 'We are hiring a business analyst to support digital transformation initiatives.',
      requirements: 'Excel, stakeholder management, reporting'
    };

    const postResponse = await fetch(`http://127.0.0.1:${port}/api/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newJob)
    });

    const createdJob = await postResponse.json();
    assert.equal(postResponse.status, 201);
    assert.equal(createdJob.title, 'Business Analyst');

    const applicationResponse = await fetch(`http://127.0.0.1:${port}/api/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobId: createdJob.id,
        name: 'Sara Khan',
        email: 'sara@example.com',
        phone: '+923001234567',
        portfolio: 'https://example.com/sara',
        coverLetter: 'I am excited to bring strategic thinking and analytical skills to this role.'
      })
    });

    const applicationData = await applicationResponse.json();
    assert.equal(applicationResponse.status, 201);
    assert.match(applicationData.message, /Application sent successfully/i);
  } finally {
    await stopServer();
  }
});
