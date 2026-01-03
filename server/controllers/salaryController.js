const db = require('../config/db');

exports.getSalaryByUserId = async (req, res) => {
    try {
        const [salary] = await db.query('SELECT * FROM salary_structures WHERE user_id = ?', [req.params.userId]);
        res.json(salary.length > 0 ? salary[0] : null);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching salary' });
    }
};

exports.updateSalary = async (req, res) => {
    const { userId, totalWage } = req.body;
    try {
        await db.query('CALL calculate_salary_structure(?, ?)', [userId, totalWage]);
        
        const [salary] = await db.query('SELECT * FROM salary_structures WHERE user_id = ?', [userId]);
        res.json(salary[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating salary' });
    }
};
