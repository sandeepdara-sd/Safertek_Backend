const express = require('express');
const fs = require('fs');
const path = require('path');
const helmet = require('helmet'); 


const app = express();
const port = 8000;

const uploadsDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

app.use(express.json());
app.use(helmet()); 

app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    console.log('Request Body:', req.body);
    next();
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

const validateInput = (req, res, next) => {
    const { filename, content } = req.body;
    if (!filename || !content) {
        return res.status(400).send('Both filename and content are required.');
    }
    next();
};

app.post('/createFile', validateInput, (req, res) => {
    const { filename, content } = req.body;
    const filePath = path.join(uploadsDir, filename);

    fs.writeFile(filePath, content, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Failed to create file.');
        }
        res.status(200).send('File created successfully.');
    });
});

app.get('/getFiles', (req, res) => {
    fs.readdir(uploadsDir, (err, files) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Failed to get files.');
        }
        res.status(200).json(files);
    });
});

app.get('/getFile', (req, res) => {
    const { filename } = req.query;

    if (!filename) {
        return res.status(400).send('Filename is required.');
    }

    const filePath = path.join(uploadsDir, filename);

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(400).send('File not found.');
        }
        res.status(200).send(data);
    });
});

app.put('/modifyFile', validateInput, (req, res) => {
    const { filename, content } = req.body;
    const filePath = path.join(uploadsDir, filename);

    fs.writeFile(filePath, content, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Failed to modify file.');
        }
        res.status(200).send('File modified successfully.');
    });
});

app.delete('/deleteFile', (req, res) => {
    const { filename } = req.query;

    if (!filename) {
        return res.status(400).send('Filename is required.');
    }

    const filePath = path.join(uploadsDir, filename);

    fs.unlink(filePath, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Failed to delete file.');
        }
        res.status(200).send('File deleted successfully.');
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
