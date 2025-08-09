const path = require('path');
const fs = require('fs');

const writeJSONFileSync = (filePath, data) => {
    try {   
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        console.log('File written successfully:', filePath);    
    } catch (err) {
        console.error('Error writing file:', err);
    }
};

const readJSONFileSync = (filePath) => {
    try {
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(data);
        } else {
            throw new Error('File not found');
        }
    } 
    catch (err) {
        console.log('Error reading file:', err);
    }    
    return null;
}

module.exports = {
    readJSONFileSync, writeJSONFileSync
}