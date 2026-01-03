const db = require('../config/db');

exports.getStats = async (req, res) => {
    try {
        const connection = await db.getConnection();
        
        // 1. Employee Count
        const [empResult] = await connection.query('SELECT COUNT(*) as count FROM users WHERE role != "ADMIN" AND is_active = TRUE');
        const totalEmployees = empResult[0].count;

        // 2. Department Distribution
        const [deptResult] = await connection.query(`
            SELECT department, COUNT(*) as value 
            FROM employee_profiles ep
            JOIN users u ON ep.user_id = u.id
            WHERE u.is_active = TRUE
            GROUP BY department
        `);
        
        // 3. Today's Attendance Stats
        const [attResult] = await connection.query(`
            SELECT status, COUNT(*) as count
            FROM attendance
            WHERE date = CURDATE()
            GROUP BY status
        `);
        
        const presentCount = attResult.find(r => r.status === 'PRESENT')?.count || 0;
        const absentCount = attResult.find(r => r.status === 'ABSENT')?.count || 0;
        const halfDayCount = attResult.find(r => r.status === 'HALF_DAY')?.count || 0;
        const lateCount = attResult.find(r => r.status === 'LATE')?.count || 0;
        const onLeaveCount = attResult.find(r => r.status === 'ON_LEAVE')?.count || 0;

        // 4. Payroll Cost (Monthly)
        const [payrollResult] = await connection.query('SELECT SUM(total_wage) as cost FROM salary_structures');
        const totalPayroll = payrollResult[0].cost || 0;

        connection.release();

        res.json({
            totalEmployees,
            departmentStats: deptResult.map(d => ({ name: d.department || 'Unassigned', value: d.value })),
            attendanceStats: {
                present: presentCount + lateCount, // Late is also present
                absent: absentCount,
                onLeave: onLeaveCount,
                halfDay: halfDayCount
            },
            totalPayroll
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching dashboard stats' });
    }
};
