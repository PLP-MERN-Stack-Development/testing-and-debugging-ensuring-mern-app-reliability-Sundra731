// bugs.test.js - Integration tests for bugs API endpoints

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../src/app');
const Bug = require('../../src/models/Bug');

let mongoServer;

beforeAll(async () => {
  // Disconnect if already connected
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
}, 30000); // Increase timeout for MongoDB setup

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

beforeEach(async () => {
  // Clear all bugs before each test
  await Bug.deleteMany({});
});

describe('POST /api/bugs', () => {
  it('should create a new bug with valid data', async () => {
    const bugData = {
      title: 'Test Bug',
      description: 'This is a test bug description',
      reporter: 'John Doe',
      status: 'open',
      priority: 'medium'
    };

    const res = await request(app)
      .post('/api/bugs')
      .send(bugData);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.title).toBe(bugData.title);
    expect(res.body.description).toBe(bugData.description);
    expect(res.body.reporter).toBe(bugData.reporter);
    expect(res.body.status).toBe(bugData.status);
    expect(res.body.priority).toBe(bugData.priority);
  });

  it('should create a bug with default values', async () => {
    const bugData = {
      title: 'Test Bug',
      description: 'This is a test bug description',
      reporter: 'John Doe'
    };

    const res = await request(app)
      .post('/api/bugs')
      .send(bugData);

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('open'); // default status
    expect(res.body.priority).toBe('medium'); // default priority
  });

  it('should return 400 for invalid data', async () => {
    const invalidData = {
      // missing title and description
      reporter: 'John Doe'
    };

    const res = await request(app)
      .post('/api/bugs')
      .send(invalidData);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body).toHaveProperty('details');
  });

  it('should trim and sanitize input data', async () => {
    const bugData = {
      title: '  Test Bug  ',
      description: '  Test Description  ',
      reporter: '  John Doe  ',
      tags: ['  tag1  ', '', '  tag2  ']
    };

    const res = await request(app)
      .post('/api/bugs')
      .send(bugData);

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Test Bug');
    expect(res.body.description).toBe('Test Description');
    expect(res.body.reporter).toBe('John Doe');
    expect(res.body.tags).toEqual(['tag1', 'tag2']);
  });
});

describe('GET /api/bugs', () => {
  beforeEach(async () => {
    // Create test bugs
    await Bug.create([
      {
        title: 'Bug 1',
        description: 'Description 1',
        reporter: 'Reporter 1',
        status: 'open',
        priority: 'high'
      },
      {
        title: 'Bug 2',
        description: 'Description 2',
        reporter: 'Reporter 2',
        status: 'resolved',
        priority: 'medium'
      },
      {
        title: 'Bug 3',
        description: 'Description 3',
        reporter: 'Reporter 3',
        status: 'open',
        priority: 'low'
      }
    ]);
  });

  it('should return all bugs', async () => {
    const res = await request(app).get('/api/bugs');

    expect(res.status).toBe(200);
    expect(res.body.bugs).toHaveLength(3);
    expect(res.body).toHaveProperty('pagination');
  });

  it('should filter bugs by status', async () => {
    const res = await request(app).get('/api/bugs?status=open');

    expect(res.status).toBe(200);
    expect(res.body.bugs).toHaveLength(2);
    expect(res.body.bugs.every(bug => bug.status === 'open')).toBe(true);
  });

  it('should filter bugs by priority', async () => {
    const res = await request(app).get('/api/bugs?priority=high');

    expect(res.status).toBe(200);
    expect(res.body.bugs).toHaveLength(1);
    expect(res.body.bugs[0].priority).toBe('high');
  });

  it('should paginate results', async () => {
    const res = await request(app).get('/api/bugs?page=1&limit=2');

    expect(res.status).toBe(200);
    expect(res.body.bugs).toHaveLength(2);
    expect(res.body.pagination.page).toBe(1);
    expect(res.body.pagination.limit).toBe(2);
  });
});

describe('GET /api/bugs/:id', () => {
  let testBug;

  beforeEach(async () => {
    testBug = await Bug.create({
      title: 'Test Bug',
      description: 'Test Description',
      reporter: 'Test Reporter'
    });
  });

  it('should return a bug by ID', async () => {
    const res = await request(app).get(`/api/bugs/${testBug._id}`);

    expect(res.status).toBe(200);
    expect(res.body._id).toBe(testBug._id.toString());
    expect(res.body.title).toBe(testBug.title);
  });

  it('should return 404 for non-existent bug', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/bugs/${fakeId}`);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Bug not found');
  });

  it('should return 400 for invalid ID format', async () => {
    const res = await request(app).get('/api/bugs/invalid-id');

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid bug ID format');
  });
});

describe('PUT /api/bugs/:id', () => {
  let testBug;

  beforeEach(async () => {
    testBug = await Bug.create({
      title: 'Original Bug',
      description: 'Original Description',
      reporter: 'Original Reporter',
      status: 'open'
    });
  });

  it('should update a bug successfully', async () => {
    const updateData = {
      title: 'Updated Bug',
      description: 'Updated Description',
      status: 'resolved',
      reporter: 'Original Reporter' // Include required reporter field
    };

    const res = await request(app)
      .put(`/api/bugs/${testBug._id}`)
      .send(updateData);

    expect(res.status).toBe(200);
    expect(res.body.title).toBe(updateData.title);
    expect(res.body.description).toBe(updateData.description);
    expect(res.body.status).toBe(updateData.status);
  });

  it('should return 404 for non-existent bug', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .put(`/api/bugs/${fakeId}`)
      .send({
        title: 'Updated Title',
        description: 'Updated Description',
        reporter: 'Test Reporter'
      });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Bug not found');
  });

  it('should return 400 for invalid data', async () => {
    const invalidData = {
      title: '', // empty title
      description: 'Valid description',
      reporter: 'Valid reporter'
    };

    const res = await request(app)
      .put(`/api/bugs/${testBug._id}`)
      .send(invalidData);

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
  });
});

describe('DELETE /api/bugs/:id', () => {
  let testBug;

  beforeEach(async () => {
    testBug = await Bug.create({
      title: 'Test Bug',
      description: 'Test Description',
      reporter: 'Test Reporter'
    });
  });

  it('should delete a bug successfully', async () => {
    const res = await request(app).delete(`/api/bugs/${testBug._id}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Bug deleted successfully');

    // Verify bug is deleted
    const deletedBug = await Bug.findById(testBug._id);
    expect(deletedBug).toBeNull();
  });

  it('should return 404 for non-existent bug', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).delete(`/api/bugs/${fakeId}`);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Bug not found');
  });

  it('should return 400 for invalid ID format', async () => {
    const res = await request(app).delete('/api/bugs/invalid-id');

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid bug ID format');
  });
});