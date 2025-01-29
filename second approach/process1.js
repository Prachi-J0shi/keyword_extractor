const fs = require("fs");
const path = require("path");

// File paths
const inputDataPath = path.join(__dirname, "cleaned_dynamic_products.txt"); // Replace with your input file name
const outputFilePath = path.join(__dirname, "relevant_product_names.txt");

// List of irrelevant words to remove
const IRRELEVANT_WORDS = [
  "name", "dxn", "part", "no", "total", "packing",
  "terms", "price", "cif", "sea", "vancouver"
];

// Function to remove irrelevant words from a string
function cleanProductName(productName) {
  return productName
    .split(' ')
    .filter(word => !IRRELEVANT_WORDS.includes(word.toLowerCase()) && word.trim() !== '')
    .join(' ')
    .trim();
}

// Function to extract quantities with various units including drums, pouches, cartons, kg, gm, mg, capsules etc.
function extractQuantity(line) {
  const quantityRegex = /(\d+\s*(drums?|pouches?|cartons?|kg|g|mg|gm|l|ml|pcs|units?|count|bottles|ton|capsules?))/i;
  const match = line.match(quantityRegex);
  return match ? match[0].trim() : '';
}

// Function to generate multiple product names from the description
function generateProductNames(baseName) {
  const variations = [];
  variations.push(baseName);
  variations.push(`${baseName} powder`);
  variations.push(`${baseName} 1000kgs`); // Assuming this is a common variation

  return variations;
}

// Read the input file asynchronously
fs.readFile(inputDataPath, "utf8", (err, inputData) => {
  if (err) {
    console.error("Error reading input file:", err);
    return;
  }

  const parseData = (inputData) => {
    const items = [];

    // Split the input data into individual lines
    const lines = inputData.split("\n");

    lines.forEach((line) => {
      // Regular expression pattern to capture potential product names
      const productNameRegex = /(spirulina\s*(powder|extract|tablet|capsule)\s*[^\d\W]*)/i;

      const productMatch = line.match(productNameRegex);
      let description = '';
      let quantity = '';

      if (productMatch) {
        let productName = productMatch[0].trim();

        // Clean up the product name by removing irrelevant codes or identifiers
        productName = cleanProductName(productName); // Remove specified irrelevant words

        // Extract quantity from the line
        quantity = extractQuantity(line);

        // The description is the original line
        description = line.trim();

        // Generate multiple names based on the cleaned product name
        const names = generateProductNames(productName);

        // Only add items if there is meaningful information
        if (names.length > 0 || description || quantity) {
          items.push({
            description: description,
            quantity: quantity,
            name: names,
          });
        }
      }
    });

    return items;
  };

  // Parse the input data
  const parsedData = parseData(inputData);

  // Write the parsed data to the output file
  fs.writeFile(outputFilePath, JSON.stringify(parsedData, null, 2), (err) => {
    if (err) {
      console.error("Error writing output file:", err);
    } else {
      console.log("Data successfully written to", outputFilePath);
    }
  });
});
