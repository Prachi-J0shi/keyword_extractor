const fs = require("fs");
const path = require("path");

// List of priority keywords that are meaningful
const PRIORITY_KEYWORDS = [
  "spirulina", "powder", "tablet", "capsule", "protein", "green", "extract",
  "supplement", "diet", "pouch", "1kg", "250mg", "100mg"
];

// List of words to ignore (low relevance)
const IGNORE_WORDS = [
  "batch", "expiry", "manufacturer", "date", "product", "content", "gram",
  "mg", "kg", "lot", "new", "jar", "bottle", "pack", "use", "food", "sample",
  "nos", "certified", "code", "item", "contains", "net", "weight", "form",
  "presentation", "brand", "contains"
];

// Function to clean and extract meaningful product names
function cleanAndExtractNames(filePath) {
  try {
    // Read the file content
    const data = fs.readFileSync(filePath, "utf-8");

    // Split content into lines
    const lines = data.split("\n");

    const productNames = lines.map((line) => {
      // Step 1: Clean the line by removing special characters, except for meaningful units like "mg" or "kg"
      const cleanedLine = line
        .replace(/[^a-zA-Z0-9\s]/g, " ") // Remove special characters
        .replace(/\s+/g, " ") // Replace multiple spaces with one
        .trim();

      // Step 2: Split the cleaned line into words
      const words = cleanedLine.toLowerCase().split(" ");

      // Step 3: Filter out ignored words and keep priority keywords
      const filteredWords = words.filter(
        (word) =>
          word.length > 1 &&
          (!IGNORE_WORDS.includes(word) || PRIORITY_KEYWORDS.includes(word))
      );

      // Step 4: Dynamically assemble meaningful product names
      const productName = filteredWords.join(" ");

      // Step 5: Return the cleaned product name
      return productName;
    });

    // Remove duplicates and empty lines
    const uniqueProductNames = [...new Set(productNames)].filter((name) => name.trim() !== "");

    return uniqueProductNames;
  } catch (err) {
    console.error("Error reading or processing the file:", err.message);
    return [];
  }
}

// Run the program
const inputFilePath = path.join(__dirname, "products.txt"); // Replace with your file's name
const extractedNames = cleanAndExtractNames(inputFilePath);

// Output the results
console.log("Extracted Product Names:");
extractedNames.forEach((name, index) => console.log(`${index + 1}. ${name}`));

// Save the results to a new file
const outputFilePath = path.join(__dirname, "cleaned_dynamic_products.txt");
fs.writeFileSync(outputFilePath, extractedNames.join("\n"), "utf-8");
console.log(`Cleaned product names saved to: ${outputFilePath}`);
