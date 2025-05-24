const pool = require('../config/database');
const { ApiError } = require('../middleware/errorHandler');

const createEvent = async (req, res) => {
  const { name, valid_from, valid_to } = req.body;
  
  if (!name || !valid_from || !valid_to) {
    throw new ApiError(400, 'name, valid_from, and valid_to are required fields');
  }

  try {
    const created_date = new Date().toISOString().split('T')[0];
    const [result] = await pool.execute(
      'INSERT INTO Event (name, created_date, valid_from, valid_to) VALUES (?, ?, ?, ?)',
      [name, created_date, valid_from, valid_to]
    );

    res.status(201).json({
      status: 'success',
      data: {
        id: result.insertId,
        name,
        created_date,
        valid_from,
        valid_to
      }
    });
  } catch (error) {
    throw new ApiError(500, `Error creating event: ${error.message}`);
  }
};

const listEvents = async (req, res) => {
  try {
    const [events] = await pool.execute('SELECT * FROM Event');
    res.json({
      status: 'success',
      data: events
    });
  } catch (error) {
    throw new ApiError(500, `Error fetching events: ${error.message}`);
  }
};

const updateEvent = async (req, res) => {
  const { id } = req.params;
  const { name, valid_from, valid_to } = req.body;

  if (!id) {
    throw new ApiError(400, 'Event ID is required');
  }

  try {
    const [existingEvent] = await pool.execute('SELECT * FROM Event WHERE id = ?', [id]);
    
    if (!existingEvent.length) {
      throw new ApiError(404, 'Event not found');
    }

    const updates = [];
    const values = [];

    if (name) {
      updates.push('name = ?');
      values.push(name);
    }
    if (valid_from) {
      updates.push('valid_from = ?');
      values.push(valid_from);
    }
    if (valid_to) {
      updates.push('valid_to = ?');
      values.push(valid_to);
    }

    if (updates.length === 0) {
      throw new ApiError(400, 'No fields to update');
    }

    values.push(id);
    const [result] = await pool.execute(
      `UPDATE Event SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      throw new ApiError(404, 'Event not found');
    }

    const [updatedEvent] = await pool.execute('SELECT * FROM Event WHERE id = ?', [id]);
    
    res.json({
      status: 'success',
      data: updatedEvent[0]
    });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, `Error updating event: ${error.message}`);
  }
};

module.exports = {
  createEvent,
  listEvents,
  updateEvent
}; 