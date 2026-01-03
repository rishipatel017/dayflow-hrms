const db = require('../config/db');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_change_this_in_prod';

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [users] = await db.query(
      'SELECT * FROM users WHERE (email = ? OR employee_id = ?) AND password_hash = ?',
      [email, email, password]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];
    
    // Generate Token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Remove password from response
    delete user.password_hash;

    res.json({ ...user, accessToken: token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.signup = async (req, res) => {
    const { companyName, adminData: adminDataStr, phone } = req.body;
    
    // Parse adminData
    let adminData;
    try {
        adminData = typeof adminDataStr === 'string' ? JSON.parse(adminDataStr) : adminDataStr;
    } catch (e) {
        return res.status(400).json({ message: 'Invalid adminData format' });
    }

    if (!companyName || !adminData || !adminData.email || !adminData.passwordHash || !phone) {
         return res.status(400).json({ message: 'Missing required fields' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const newId = `u${Date.now()}`;
        const joiningDate = new Date().toISOString().split('T')[0];
        
        // Handle File Upload
        let profilePictureUrl = `https://i.pravatar.cc/150?u=${newId}`;
        if (req.file) {
            profilePictureUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        } else if (adminData.profilePictureUrl) {
            profilePictureUrl = adminData.profilePictureUrl;
        }

        // Call ID Generation Procedure
        await connection.query('CALL generate_employee_id(?, ?, ?, @employeeId)', 
            [adminData.firstName, adminData.lastName, joiningDate]);
        const [empIdResult] = await connection.query('SELECT @employeeId as employeeId');
        const employeeId = empIdResult[0].employeeId;

        // Insert User
        await connection.query(
            `INSERT INTO users (id, employee_id, email, password_hash, role, first_name, last_name, joining_date, profile_picture_url)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [newId, employeeId, adminData.email, adminData.passwordHash, 'ADMIN', adminData.firstName, adminData.lastName, joiningDate, profilePictureUrl]
        );

        // Insert Profile
        await connection.query(
            `INSERT INTO employee_profiles (user_id, address, phone, job_position, department)
             VALUES (?, ?, ?, ?, ?)`,
            [newId, '', phone, 'Admin', 'Management']
        );

        // Insert Salary (Basic)
        await connection.query(
            `INSERT INTO salary_structures (user_id, total_wage, yearly_wage)
             VALUES (?, 0, 0)`,
            [newId]
        );

        await connection.commit();
        
        // Generate Token
        const token = jwt.sign(
          { id: newId, email: adminData.email, role: 'ADMIN' },
          JWT_SECRET,
          { expiresIn: '24h' }
        );

        const newUser = {
            id: newId,
            employeeId,
            email: adminData.email,
            role: 'ADMIN',
            firstName: adminData.firstName,
            lastName: adminData.lastName,
            joiningDate,
            profilePictureUrl
        };

        res.status(201).json({ ...newUser, accessToken: token });

    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: 'Signup failed', error: error.message });
    } finally {
        connection.release();
    }
};

exports.resetPassword = async (req, res) => {
    const { userId, newPass } = req.body;
    try {
        await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [newPass, userId]);
        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Password reset failed' });
    }
};
