const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'auction.db');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        balance REAL DEFAULT 1000,
        fullName TEXT,
        email TEXT,
        phone TEXT,
        totalBids INTEGER DEFAULT 0,
        auctionsSold INTEGER DEFAULT 0,
        auctionsUnsold INTEGER DEFAULT 0,
        joinDate DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Auctions table
    db.run(`CREATE TABLE IF NOT EXISTS auctions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        currentBid REAL DEFAULT 0,
        highestBidder TEXT,
        endTime DATETIME NOT NULL,
        sold BOOLEAN DEFAULT 0,
        unsold BOOLEAN DEFAULT 0,
        category TEXT NOT NULL,
        creator TEXT NOT NULL,
        images TEXT,
        createdDate DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // History table
    db.run(`CREATE TABLE IF NOT EXISTS history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        itemId INTEGER,
        itemName TEXT,
        amount REAL,
        time DATETIME DEFAULT CURRENT_TIMESTAMP,
        username TEXT,
        creator TEXT,
        isBidIncrease BOOLEAN DEFAULT 0,
        previousBid REAL DEFAULT 0
    )`);

    // Insert demo user only if it doesn't exist
    db.get("SELECT COUNT(*) as count FROM users WHERE username = 'admin'", (err, row) => {
        if (err) {
            console.error('Error checking admin user:', err);
            return;
        }
        
        if (row.count === 0) {
            db.run(`INSERT INTO users (username, password, balance, fullName, email, phone) 
                    VALUES ('admin', 'admin', 10000, 'Admin User', 'admin@example.com', '1234567890')`, 
            function(err) {
                if (err) {
                    console.error('Error creating admin user:', err);
                } else {
                    console.log('Demo admin user created');
                    
                    // Insert demo auctions only after admin user is created
                    const demoAuctions = [
                        {
                            name: "Antique Vase", 
                            description: "Beautiful 19th century vase in excellent condition", 
                            currentBid: 3000, 
                            endTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
                            category: "antiques",
                            creator: "admin",
                            images: JSON.stringify([
                                "v1.png",
                                "v2.png",
                                "v3.png"
                            ])
                        },
                        {
                            name: "iPhone 4S", 
                            description: "A Piece of History: Factory-Sealed Original iPhone - A Rare Opportunity!", 
                            currentBid: 10000, 
                            endTime: new Date(Date.now() + 7200000).toISOString(), // 2 hours from now
                            category: "electronics",
                            creator: "admin",
                            images: JSON.stringify([
                                "p1.png",
                                "p2.png",
                                "p3.png",
                                "p4.png"
                            ])
                        },
                        {
                            name: "Vintage Pocket Watch", 
                            description: "Rare 1960s pocket watch, fully serviced", 
                            currentBid: 5000, 
                            endTime: new Date(Date.now() + 5400000).toISOString(), // 1.5 hours from now
                            category: "collectibles",
                            creator: "admin",
                            images: JSON.stringify([
                                "w1.jpg",
                                "w2.jpeg",
                                "w3.png"
                            ])
                        }
                    ];

                    let auctionsInserted = 0;
                    const totalAuctions = demoAuctions.length;
                    
                    demoAuctions.forEach(auction => {
                        db.run(`INSERT INTO auctions (name, description, currentBid, endTime, category, creator, images) 
                                VALUES (?, ?, ?, ?, ?, ?, ?)`,
                            [auction.name, auction.description, auction.currentBid, auction.endTime, auction.category, auction.creator, auction.images],
                            function(err) {
                                if (err) {
                                    console.error('Error creating demo auction:', err);
                                } else {
                                    auctionsInserted++;
                                    if (auctionsInserted === totalAuctions) {
                                        console.log('All demo auctions created successfully');
                                    }
                                }
                            });
                    });
                }
            });
        } else {
            console.log('Admin user already exists');
            
            // Check if demo auctions exist
            db.get("SELECT COUNT(*) as count FROM auctions WHERE creator = 'admin'", (err, row) => {
                if (err) {
                    console.error('Error checking demo auctions:', err);
                    return;
                }
                
                if (row.count === 0) {
                    console.log('Creating demo auctions...');
                    // Insert demo auctions if they don't exist
                    const demoAuctions = [
                        {
                            name: "Antique Vase", 
                            description: "Beautiful 19th century vase in excellent condition", 
                            currentBid: 3000, 
                            endTime: new Date(Date.now() + 3600000).toISOString(),
                            category: "antiques",
                            creator: "admin",
                            images: JSON.stringify([
                                "v1.png",
                                "v2.png",
                                "v3.png"
                            ])
                        },
                        {
                            name: "iPhone 4S", 
                            description: "A Piece of History: Factory-Sealed Original iPhone - A Rare Opportunity!", 
                            currentBid: 10000, 
                            endTime: new Date(Date.now() + 7200000).toISOString(),
                            category: "electronics",
                            creator: "admin",
                            images: JSON.stringify([
                                "p1.png",
                                "p2.png",
                                "p3.png",
                                "p4.png"
                            ])
                        }
                    ];

                    demoAuctions.forEach(auction => {
                        db.run(`INSERT INTO auctions (name, description, currentBid, endTime, category, creator, images) 
                                VALUES (?, ?, ?, ?, ?, ?, ?)`,
                            [auction.name, auction.description, auction.currentBid, auction.endTime, auction.category, auction.creator, auction.images]);
                    });
                } else {
                    console.log('Demo auctions already exist');
                }
            });
        }
    });
});

module.exports = db;