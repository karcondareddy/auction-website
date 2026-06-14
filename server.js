const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.static(__dirname));

// Serve static files from current directory
app.use('/images', express.static(path.join(__dirname, 'images')));

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API Routes

// Helper to convert SQLite's default UTC string to a full ISO string
const toISO = (dateTimeString) => {
    return dateTimeString ? new Date(dateTimeString + 'Z').toISOString() : null;
};

// Users
app.get('/api/users', (req, res) => {
    db.all("SELECT * FROM users", (err, rows) => {
        if (err) {
            console.error('Error fetching users:', err);
            res.status(500).json({ error: err.message });
            return;
        }
        // [FIX] Convert joinDate to full ISO string
        const users = rows.map(user => ({
            ...user,
            joinDate: toISO(user.joinDate)
        }));
        res.json(users);
    });
});

app.get('/api/users/:username', (req, res) => {
    const username = req.params.username;
    db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
        if (err) {
            console.error('Error fetching user:', err);
            res.status(500).json({ error: err.message });
            return;
        }
        // [FIX] Convert joinDate to full ISO string
        if (row) {
            row.joinDate = toISO(row.joinDate);
        }
        res.json(row || {});
    });
});

app.post('/api/users', (req, res) => {
    const { username, password, fullName, email, phone } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }
    
    db.run(`INSERT INTO users (username, password, fullName, email, phone, balance, totalBids, auctionsSold, auctionsUnsold) 
            VALUES (?, ?, ?, ?, ?, 1000, 0, 0, 0)`,
        [username, password, fullName, email, phone],
        function(err) {
            if (err) {
                console.error('Error creating user:', err);
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ id: this.lastID, message: 'User created successfully' });
        });
});

// Auctions
app.get('/api/auctions', (req, res) => {
    db.all("SELECT * FROM auctions ORDER BY createdDate DESC", (err, rows) => {
        if (err) {
            console.error('Error fetching auctions:', err);
            res.status(500).json({ error: err.message });
            return;
        }
        // Parse images JSON string and convert endTime to timestamp
        const auctions = rows.map(auction => ({
            ...auction,
            images: JSON.parse(auction.images || '[]'),
            endTime: new Date(auction.endTime).getTime(), // This is already ISO
            createdDate: toISO(auction.createdDate), // [FIX] Convert createdDate
            sold: Boolean(auction.sold),
            unsold: Boolean(auction.unsold)
        }));
        res.json(auctions);
    });
});

app.get('/api/auctions/:id', (req, res) => {
    const id = req.params.id;
    db.get("SELECT * FROM auctions WHERE id = ?", [id], (err, row) => {
        if (err) {
            console.error('Error fetching auction:', err);
            res.status(500).json({ error: err.message });
            return;
        }
        if (row) {
            row.images = JSON.parse(row.images || '[]');
            row.endTime = new Date(row.endTime).getTime(); // This is already ISO
            row.createdDate = toISO(row.createdDate); // [FIX] Convert createdDate
            row.sold = Boolean(row.sold);
            row.unsold = Boolean(row.unsold);
        }
        res.json(row || {});
    });
});

app.post('/api/auctions', (req, res) => {
    const { name, description, currentBid, endTime, category, creator, images } = req.body;
    
    if (!name || !description || !category || !creator) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // For demo purposes, use placeholder images if none provided
    const defaultImages = JSON.stringify([
        "https://via.placeholder.com/400x300/4361ee/ffffff?text=" + encodeURIComponent(name),
        "https://via.placeholder.com/400x300/3f37c9/ffffff?text=Side+View"
    ]);
    
    const auctionImages = images && images.length > 0 ? JSON.stringify(images) : defaultImages;
    
    db.run(`INSERT INTO auctions (name, description, currentBid, endTime, category, creator, images) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [name, description, currentBid || 1, new Date(endTime).toISOString(), category, creator, auctionImages],
        function(err) {
            if (err) {
                console.error('Error creating auction:', err);
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ id: this.lastID, message: 'Auction created successfully' });
        });
});

app.put('/api/auctions/:id', (req, res) => {
    const id = req.params.id;
    const { currentBid, highestBidder, sold, unsold } = req.body;
    
    db.run(`UPDATE auctions SET currentBid = ?, highestBidder = ?, sold = ?, unsold = ? WHERE id = ?`,
        [currentBid, highestBidder, sold ? 1 : 0, unsold ? 1 : 0, id],
        function(err) {
            if (err) {
                console.error('Error updating auction:', err);
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ message: 'Auction updated successfully' });
        });
});

// History
app.get('/api/history', (req, res) => {
    db.all("SELECT * FROM history ORDER BY time DESC", (err, rows) => {
        if (err) {
            console.error('Error fetching history:', err);
            res.status(500).json({ error: err.message });
            return;
        }
        // [FIX] Convert time to full ISO string
        const history = rows.map(item => ({
            ...item,
            time: toISO(item.time)
        }));
        res.json(history);
    });
});

app.post('/api/history', (req, res) => {
    const { type, itemId, itemName, amount, username, creator, isBidIncrease, previousBid } = req.body;
    
    db.run(`INSERT INTO history (type, itemId, itemName, amount, username, creator, isBidIncrease, previousBid) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [type, itemId, itemName, amount, username, creator, isBidIncrease, previousBid],
        function(err) {
            if (err) {
                console.error('Error adding history:', err);
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ id: this.lastID, message: 'History added successfully' });
        });
});

// Update user balance
app.put('/api/users/:username/balance', (req, res) => {
    const username = req.params.username;
    const { balance } = req.body;
    
    db.run("UPDATE users SET balance = ? WHERE username = ?", [balance, username], function(err) {
        if (err) {
            console.error('Error updating balance:', err);
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Balance updated successfully' });
    });
});

// Update user stats
app.put('/api/users/:username/stats', (req, res) => {
    const username = req.params.username;
    const { totalBids, auctionsSold, auctionsUnsold } = req.body;
    
    let query = "UPDATE users SET ";
    let params = [];
    let updates = [];
    
    if (totalBids !== undefined) {
        updates.push("totalBids = ?");
        params.push(totalBids);
    }
    if (auctionsSold !== undefined) {
        updates.push("auctionsSold = ?");
        params.push(auctionsSold);
    }
    if (auctionsUnsold !== undefined) {
        updates.push("auctionsUnsold = ?");
        params.push(auctionsUnsold);
    }
    
    if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
    }
    
    query += updates.join(", ") + " WHERE username = ?";
    params.push(username);
    
    db.run(query, params, function(err) {
        if (err) {
            console.error('Error updating stats:', err);
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Stats updated successfully' });
    });
});

// Update user password
app.put('/api/users/:username/password', (req, res) => {
    const username = req.params.username;
    const { password } = req.body; // This is the new password

    if (!password) {
        return res.status(400).json({ error: 'New password is required' });
    }

    db.run("UPDATE users SET password = ? WHERE username = ?", [password, username], function(err) {
        if (err) {
            console.error('Error updating password:', err);
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ message: 'Password updated successfully' });
    });
});

// [NEW] Update user profile details
app.put('/api/users/:username/profile', (req, res) => {
    const username = req.params.username;
    const { fullName, email, phone } = req.body;

    if (fullName === undefined || email === undefined || phone === undefined) {
        return res.status(400).json({ error: 'Missing profile fields' });
    }

    db.run("UPDATE users SET fullName = ?, email = ?, phone = ? WHERE username = ?",
        [fullName, email, phone, username],
        function(err) {
            if (err) {
                console.error('Error updating profile:', err);
                res.status(500).json({ error: err.message });
                return;
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'User not found' });
            }
            res.json({ message: 'Profile updated successfully' });
        }
    );
});


// Get user won auctions count
app.get('/api/users/:username/won-auctions', (req, res) => {
    const username = req.params.username;
    
    db.get("SELECT COUNT(*) as count FROM auctions WHERE highestBidder = ? AND sold = 1", [username], (err, row) => {
        if (err) {
            console.error('Error fetching won auctions:', err);
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ wonAuctions: row.count });
    });
});

// Get user bidding stats
app.get('/api/users/:username/stats', (req, res) => {
    const username = req.params.username;
    
    db.get(`SELECT 
        (SELECT COUNT(*) FROM auctions WHERE creator = ?) as auctionsCreated,
        (SELECT COUNT(*) FROM auctions WHERE creator = ? AND sold = 1) as auctionsSold,
        (SELECT COUNT(*) FROM auctions WHERE creator = ? AND unsold = 1) as auctionsUnsold,
        (SELECT COUNT(*) FROM auctions WHERE highestBidder = ? AND sold = 1) as auctionsWon,
        (SELECT COUNT(*) FROM history WHERE username = ? AND type = 'bid') as totalBids`,
        [username, username, username, username, username], (err, row) => {
        if (err) {
            console.error('Error fetching user stats:', err);
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(row || {
            auctionsCreated: 0,
            auctionsSold: 0,
            auctionsUnsold: 0,
            auctionsWon: 0,
            totalBids: 0
        });
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('e-Auction application is ready!');
});