const db = require('../config/db');

exports.seedAttendance = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Get all users
        const [users] = await connection.query('SELECT id FROM users');
        
        // Delete existing attendance for clean seed (Optional, maybe just add?)
        // await connection.query('DELETE FROM attendance_records');

        const now = new Date();
        const records = [];

        for (const user of users) {
            // Generate for last 30 days
            for (let i = 0; i < 30; i++) {
                const date = new Date(now);
                date.setDate(date.getDate() - i);
                
                // Skip weekends roughly (just simple logic)
                if (date.getDay() === 0 || date.getDay() === 6) continue;

                // Random 80% chance of being present
                if (Math.random() > 0.2) {
                    const dateStr = date.toISOString().split('T')[0];
                    
                    // Random checkin between 8am and 10am
                    const checkInHour = 8 + Math.floor(Math.random() * 2); 
                    const checkInMin = Math.floor(Math.random() * 60);
                    const checkIn = `${dateStr} ${checkInHour.toString().padStart(2, '0')}:${checkInMin.toString().padStart(2, '0')}:00`;

                    // Random checkout between 5pm and 7pm
                    const checkOutHour = 17 + Math.floor(Math.random() * 2);
                    const checkOutMin = Math.floor(Math.random() * 60);
                    const checkOut = `${dateStr} ${checkOutHour.toString().padStart(2, '0')}:${checkOutMin.toString().padStart(2, '0')}:00`;

                    // Status
                    let status = 'Present';
                    if (checkInHour > 9 || (checkInHour === 9 && checkInMin > 30)) status = 'Late';

                    // Using stored procedure or direct insert? Direct is faster for seeding.
                    // Assuming table: attendance_records(user_id, date, check_in_time, check_out_time, status)
                    // The schema.sql uses: id, user_id, date, check_in, check_out, status, total_hours
                    
                    const totalHours = (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60);
                    
                    await connection.query(
                        `INSERT INTO attendance_records (user_id, date, check_in, check_out, status, total_hours)
                         VALUES (?, ?, ?, ?, ?, ?)`,
                        [user.id, dateStr, checkIn, checkOut, status, totalHours.toFixed(2)]
                    );
                }
            }
        }

        await connection.commit();
        res.json({ message: 'Attendance seeded successfully' });

    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: 'Seeding failed' });
    } finally {
        connection.release();
    }
};

exports.seedLeaves = async (req, res) => {
    // Similar logic for leaves
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const [users] = await connection.query('SELECT id FROM users');
        const types = ['Sick Leave', 'Casual Leave', 'Emergency'];
        const statuses = ['Pending', 'Approved', 'Rejected'];

        for (const user of users) {
             // 10% chance per user to have a leave request
             if (Math.random() > 0.9) {
                 const type = types[Math.floor(Math.random() * types.length)];
                 const status = statuses[Math.floor(Math.random() * statuses.length)];
                 
                 const startDate = new Date();
                 startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 20));
                 const endDate = new Date(startDate);
                 endDate.setDate(startDate.getDate() + 1 + Math.floor(Math.random() * 2));
                 
                 await connection.query(
                     `INSERT INTO leave_requests (user_id, leave_type, start_date, end_date, reason, status)
                      VALUES (?, ?, ?, ?, 'Seeded Data', ?)`,
                     [user.id, type, startDate, endDate, status]
                 );
             }
        }
        await connection.commit();
        res.json({ message: 'Leaves seeded successfully' });
    } catch (e) {
        await connection.rollback();
        console.error(e);
        res.status(500).json({ message: 'Seeding failed' });
    } finally {
        connection.release();
    }
};
