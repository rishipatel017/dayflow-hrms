const db = require('../config/db');

exports.getAllEmployees = async (req, res) => {
    try {
        const [users] = await db.query(`
            SELECT u.*, ep.address, ep.phone, ep.job_position, ep.department, ep.manager_id,
                   ep.bank_account_no, ep.ifsc, ep.pan, ep.uan, ep.marital_status, ep.nationality, ep.date_of_birth,
                   ep.emergency_contact, ep.emergency_contact_name
            FROM users u
            LEFT JOIN employee_profiles ep ON u.id = ep.user_id
            ORDER BY u.created_at DESC
        `);
        
        // Remove passwords
        users.forEach(u => delete u.password_hash);
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching employees' });
    }
};

exports.getEmployeeById = async (req, res) => {
    try {
        const [users] = await db.query(`
            SELECT u.*, ep.address, ep.phone, ep.job_position, ep.department, ep.manager_id,
                   ep.bank_account_no, ep.ifsc, ep.pan, ep.uan, ep.marital_status, ep.nationality, ep.date_of_birth,
                   ep.emergency_contact, ep.emergency_contact_name
            FROM users u
            LEFT JOIN employee_profiles ep ON u.id = ep.user_id
            WHERE u.id = ?
        `, [req.params.id]);

        if (users.length === 0) return res.status(404).json({ message: 'User not found' });
        
        delete users[0].password_hash;
        res.json(users[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching employee' });
    }
};

exports.createEmployee = async (req, res) => {
    const { userData, profileData } = req.body;
    
    // Validation
    if (!userData || !userData.firstName || !userData.lastName || !userData.email || !userData.joiningDate) {
        return res.status(400).json({ message: "Missing required fields: firstName, lastName, email, joiningDate" });
    }

    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();

        const newId = `u${Date.now()}`;
        // Assuming generate_employee_id procedure handles the logic
        const [idResult] = await connection.query('CALL generate_employee_id(?, ?, ?, @employeeId)', 
            [userData.firstName, userData.lastName, userData.joiningDate]);
        const [empIdResult] = await connection.query('SELECT @employeeId as employeeId');
        const employeeId = empIdResult[0].employeeId;

        // Insert User
        await connection.query(
            `INSERT INTO users (id, employee_id, email, password_hash, role, first_name, last_name, joining_date, profile_picture_url)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [newId, employeeId, userData.email, 'user123', 'EMPLOYEE', userData.firstName, userData.lastName, userData.joiningDate, `https://i.pravatar.cc/150?u=${newId}`]
        );

        // Insert Profile
        await connection.query(
            `INSERT INTO employee_profiles (user_id, address, phone, job_position, department, bank_account_no, ifsc, pan, uan)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [newId, profileData?.address || '', profileData?.phone || '', profileData?.jobPosition || 'Employee', profileData?.department || 'General', 
             profileData?.bankAccountNo || '', profileData?.ifsc || '', profileData?.pan || '', profileData?.uan || '']
        );
        
        // Insert Salary (Empty)
        await connection.query(
            `INSERT INTO salary_structures (user_id) VALUES (?)`, [newId]
        );

        await connection.commit();

        res.status(201).json({ id: newId, employeeId, ...userData, role: 'EMPLOYEE' });

    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: 'Creation failed' });
    } finally {
        connection.release();
    }
};

exports.updateProfile = async (req, res) => {
    const { id } = req.params;
    const { firstName, lastName, phone, address, maritalStatus, nationality } = req.body;
    let profilePictureUrl = req.body.profilePictureUrl;
    
    // Authorization Check: Only Allow if it's the user themselves OR Admin
    // req.user is set by verifyToken middleware
    if (req.user.id !== id && req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: "Forbidden: You can only edit your own profile" });
    }

    if (req.file) {
        profilePictureUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Update User table
        if (firstName || lastName || profilePictureUrl) {
            let query = 'UPDATE users SET ';
            const params = [];
            if (firstName) { query += 'first_name = ?, '; params.push(firstName); }
            if (lastName) { query += 'last_name = ?, '; params.push(lastName); }
            if (profilePictureUrl) { query += 'profile_picture_url = ?, '; params.push(profilePictureUrl); }
            
            query = query.slice(0, -2) + ' WHERE id = ?';
            params.push(id);
            await connection.query(query, params);
        }

        // Update Profile table
        if (phone || address || maritalStatus || nationality) {
            let query = 'UPDATE employee_profiles SET ';
            const params = [];
            if (phone) { query += 'phone = ?, '; params.push(phone); }
            if (address) { query += 'address = ?, '; params.push(address); }
            if (maritalStatus) { query += 'marital_status = ?, '; params.push(maritalStatus); }
            if (nationality) { query += 'nationality = ?, '; params.push(nationality); }
            
            if (params.length > 0) {
                query = query.slice(0, -2) + ' WHERE user_id = ?';
                params.push(id);
                // Check if profile row exists first, or just use UPDATE (assumed exists from creation)
                await connection.query(query, params);
            }
        }

        await connection.commit();
        res.json({ message: 'Profile updated successfully', profilePictureUrl });

    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: 'Update failed' });
    } finally {
        connection.release();
    }
};

exports.deleteEmployee = async (req, res) => {
    const { id } = req.params;

    // Authorization: Only Admin
    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ message: "Require Admin Role" });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        
        // Cascading deletes handled by foreign keys ideally, but let's be explicit if needed
        // Assuming ON DELETE CASCADE is set in DB schema for simplicity, or we delete children first
        // Based on typical schema:
        
        await connection.query('DELETE FROM salary_structures WHERE user_id = ?', [id]);
        await connection.query('DELETE FROM employee_profiles WHERE user_id = ?', [id]);
        await connection.query('DELETE FROM attendance_records WHERE user_id = ?', [id]);
        await connection.query('DELETE FROM leave_requests WHERE user_id = ?', [id]);
        await connection.query('DELETE FROM users WHERE id = ?', [id]);

        await connection.commit();
        res.json({ message: 'Employee deleted successfully' });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: 'Delete failed' });
    } finally {
        connection.release();
    }
};
