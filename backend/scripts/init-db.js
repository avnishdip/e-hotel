const sqlite3 = require('sqlite3').verbose();
const fs = require('fs').promises;
const path = require('path');

async function initializeDatabase() {
    const dataDir = path.join(__dirname, '../data');
    const dbPath = path.join(dataDir, 'e_hotels.db');

    // Ensure data directory exists
    try {
        await fs.mkdir(dataDir, { recursive: true });
    } catch (err) {
        if (err.code !== 'EEXIST') throw err;
    }

    // Delete existing database if it exists
    try {
        await fs.unlink(dbPath);
    } catch (err) {
        if (err.code !== 'ENOENT') throw err;
    }

    // Create/open database
    const db = new sqlite3.Database(dbPath);

    // Convert db.run to Promise
    const runAsync = (sql) => new Promise((resolve, reject) => {
        db.exec(sql, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });

    try {
        // Read schema file
        const schemaPath = path.join(__dirname, '../sql/schema.sql');
        const schema = await fs.readFile(schemaPath, 'utf8');
        
        // Execute schema
        await runAsync(schema);
        console.log('Schema created successfully');

        // Read and execute sample data
        const sampleDataPath = path.join(__dirname, '../sql/sample_data.sql');
        const sampleData = await fs.readFile(sampleDataPath, 'utf8');
        
        // Execute sample data
        await runAsync(sampleData);
        console.log('Sample data inserted successfully');

        console.log('Database initialization completed successfully');

    } catch (error) {
        console.error('Error initializing database:', error);
        process.exit(1);
    } finally {
        db.close();
    }
}

// Run the initialization
initializeDatabase().catch(console.error);
