const db = require('../config/db');

exports.getAllAttendance = async (req, res) => {
    try {
        const [attendance] = await db.query('SELECT * FROM attendance ORDER BY date DESC');
        res.json(attendance);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching attendance' });
    }
};

exports.getAttendanceForUserToday = async (req, res) => {
    const { userId } = req.params;
    try {
        const [attendance] = await db.query(
            'SELECT * FROM attendance WHERE user_id = ? AND date = CURDATE()', 
            [userId]
        );
        res.json(attendance.length > 0 ? attendance[0] : null);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching attendance' });
    }
};

exports.checkIn = async (req, res) => {
    const { userId } = req.body;
    try {
        await db.query('CALL process_check_in(?)', [userId]);
        res.json({ message: 'Checked in successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Check-in failed' });
    }
};

exports.checkOut = async (req, res) => {
    const { userId } = req.body;
    try {
        await db.query('CALL process_check_out(?)', [userId]);
        res.json({ message: 'Checked out successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Check-out failed' });
    }
};
