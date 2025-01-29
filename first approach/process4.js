const fs = require('fs');

// Function to read the contents of a text file
fs.readFile('relevant_product_names4.txt', 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading the file:', err);
        return;
    }

    // Process the file contents
    const uniqueItems = Array.from(new Set(data.split('\n')
        .map(item => item.replace(/\s*\d+.*$/, '').trim())
        .filter(item => item !== '')));

    // Convert unique items to JSON format
    const jsonOutput = JSON.stringify(uniqueItems, null, 2);

    // Write the output to a JSON file
    fs.writeFile('output.json', jsonOutput, 'utf8', (err) => {
        if (err) {
            console.error('Error writing to JSON file:', err);
            return;
        }
        console.log('Output successfully written to output.json');
    });
});
