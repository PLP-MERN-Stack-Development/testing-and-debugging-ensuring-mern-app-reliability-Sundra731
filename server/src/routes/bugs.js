const express = require('express');
const router = express.Router();
const Bug = require('../models/Bug');
const { validateBugData, sanitizeBugData, isValidObjectId } = require('../utils/validation');

// GET /api/bugs - Get all bugs with optional filtering
router.get('/', async (req, res) => {
    try {
        console.log('GET /api/bugs - Fetching bugs with query:', req.query);

        const { status, priority, page = 1, limit = 10 } = req.query;
        const filter = {};

        if (status) filter.status = status;
        if (priority) filter.priority = priority;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const bugs = await Bug.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Bug.countDocuments(filter);

        console.log(`Found ${bugs.length} bugs out of ${total} total`);

        res.json({
        bugs,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit))
        }
        });
    } catch (error) {
        console.error('Error fetching bugs:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
    });

    // GET /api/bugs/:id - Get a single bug by ID
    router.get('/:id', async (req, res) => {
    try {
        console.log('GET /api/bugs/:id - Fetching bug:', req.params.id);

        if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ error: 'Invalid bug ID format' });
        }

        const bug = await Bug.findById(req.params.id);

        if (!bug) {
        return res.status(404).json({ error: 'Bug not found' });
        }

        res.json(bug);
    } catch (error) {
        console.error('Error fetching bug:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
    });

    // POST /api/bugs - Create a new bug
    router.post('/', async (req, res) => {
    try {
        console.log('POST /api/bugs - Creating new bug:', req.body);

        const sanitizedData = sanitizeBugData(req.body);
        const validation = validateBugData(sanitizedData);

        if (!validation.isValid) {
        console.log('Validation failed:', validation.errors);
        return res.status(400).json({
            error: 'Validation failed',
            details: validation.errors
        });
        }

        const bug = new Bug(sanitizedData);
        const savedBug = await bug.save();

        console.log('Bug created successfully:', savedBug._id);
        res.status(201).json(savedBug);
    } catch (error) {
        console.error('Error creating bug:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
    });

    // PUT /api/bugs/:id - Update a bug
    router.put('/:id', async (req, res) => {
    try {
        console.log('PUT /api/bugs/:id - Updating bug:', req.params.id, req.body);

        if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ error: 'Invalid bug ID format' });
        }

        const sanitizedData = sanitizeBugData(req.body);

        // For status-only updates, skip full validation
        let validation = { isValid: true };
        if (Object.keys(sanitizedData).length > 1 || !sanitizedData.status) {
            validation = validateBugData(sanitizedData);
        }

        if (!validation.isValid) {
        console.log('Validation failed:', validation.errors);
        return res.status(400).json({
            error: 'Validation failed',
            details: validation.errors
        });
        }

        const updatedBug = await Bug.findByIdAndUpdate(
        req.params.id,
        { ...sanitizedData, updatedAt: new Date() },
        { new: true, runValidators: true }
        );

        if (!updatedBug) {
        return res.status(404).json({ error: 'Bug not found' });
        }

        console.log('Bug updated successfully:', updatedBug._id);
        res.json(updatedBug);
    } catch (error) {
        console.error('Error updating bug:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
    });

    // DELETE /api/bugs/:id - Delete a bug
    router.delete('/:id', async (req, res) => {
    try {
        console.log('DELETE /api/bugs/:id - Deleting bug:', req.params.id);

        if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ error: 'Invalid bug ID format' });
        }

        const deletedBug = await Bug.findByIdAndDelete(req.params.id);

        if (!deletedBug) {
        return res.status(404).json({ error: 'Bug not found' });
        }

        console.log('Bug deleted successfully:', deletedBug._id);
        res.json({ message: 'Bug deleted successfully' });
    } catch (error) {
        console.error('Error deleting bug:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;