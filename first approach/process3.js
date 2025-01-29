const fs = require('fs');

// Function to extract 'name' fields from a JSON file and store them in an output file
function extractNamesFromFile(inputFilePath, outputFilePath) {
    // Read the content of the .txt file
    fs.readFile(inputFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading the file:', err);
            return;
        }

        try {
            // Parse the JSON data
            const jsonData = JSON.parse(data);

            let output = '';  // Variable to store the output

            // Extract the 'name' field from each entry
            jsonData.forEach((entry) => {
                if (entry.name && Array.isArray(entry.name)) {
                    // Use a Set to filter out duplicate words
                    let uniqueNames = new Set();

                    entry.name.forEach((name) => {
                        // Split the name into words and add to Set to avoid duplicates
                        name.split(' ').forEach((word) => uniqueNames.add(word));
                    });

                    // Join the words back into a string and append to the output
                    output += `${[...uniqueNames].join(' ')}\n`;
                }
            });

            // Write the output to the specified output file
            fs.writeFile(outputFilePath, output, 'utf8', (writeErr) => {
                if (writeErr) {
                    console.error('Error writing to the file:', writeErr);
                } else {
                    console.log('Output successfully written to', outputFilePath);
                }
            });
        } catch (parseError) {
            console.error('Error parsing JSON:', parseError);
        }
    });
}



const inputFilePath = 'relevant_product_names3.txt';   // Replace with the path to your .txt file
const outputFilePath = 'relevant_product_names4.txt';     // Replace with the desired output file path

extractNamesFromFile(inputFilePath, outputFilePath);
