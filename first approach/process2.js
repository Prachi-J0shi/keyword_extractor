const fs = require("fs");
const path = require("path");

// File paths
const inputDataPath = path.join(__dirname, "cleaned_dynamic_products.txt"); // Replace with your input file name
const outputFilePath = path.join(__dirname, "relevant_product_names3.txt");

// List of irrelevant words to remove
const IRRELEVANT_WORDS = [
  "name", "dxn", "part", "no", "total", "packing", "terms", "price", "cif", "sea", "vancouver", "new", "vegetable","batch", "expiry", "lot", "contains", "code", "of", "with", "invoice", "registration", "order", "declaration"
];

// List of units/quantities to detect dynamically
const QUANTITIES = [
  "kg", "mg", "g", "pcs", "bottles", "cartons", "drums", "pouches", "count", "units", "ton", "capsules", "boxes", "ml", "l", "sheets"
];

// List of priority keywords related to the product (e.g., "curcumin", "turmeric", etc.)
const PRODUCT_KEYWORDS = [
    "curcumin", "moringa", "aloe", "cleanser", "foam", "eye", "mask", "seeds", "collagen", "vera", "drink", "chia", "turmeric", 
    "extract", "protein", "powder", "oil", "capsules", "tablet", "granules", "pills", "bulk", "green", "herb", "oil", "yogurt", 
    "soap", "flavor", "pulp", "lube", "massage", "gel", "baby bath", "spray", "syrup", "drops", "concentrate", "sweets", 
    "candy", "gummy", "tincture", "lozenge", "cream", "salve", "ointment", "lotion", "sunscreen", "shampoo", "conditioner", 
    "bar", "toothpaste", "mouthwash", "freshener", "detergent", "cleaning", "disinfectant", "deodorant", "antiseptic", "antibacterial", 
    "sanitizer", "wet wipes", "disinfecting", "water", "bottle", "soda", "juice", "fruit", "cocktail", "beer", "wine", "whiskey", 
    "liqueur", "tequila", "vodka", "rum", "coffee", "tea", "energy drink", "sports drink", "fruit drink", "smoothie", "milk", 
    "yogurt", "cheese", "butter", "margarine", "olive oil", "cooking oil", "vinegar", "honey", "maple syrup", "cereal", 
    "instant noodles", "rice", "pasta", "flour", "bread", "biscuits", "cookies", "cake", "baking powder", "spices", "salt", 
    "pepper", "chili", "garlic", "onion", "tomato", "fruit", "herbs", "seed", "vinegar", "sauce", "condiment", 
    "ketchup", "mustard", "mayonnaise", "jam", "marmalade", "preserves", "peanut butter", "syrup", "canned", "bottle", "packet", 
    "bag", "box", "pouch", "carton", "case", "tin", "tub", "bucket", "bucket", "spray", "dispense", "refill", "auto", "car", 
    "shoes", "clothing", "bag", "fashion", "skincare", "face", "body", "hair", "nail", "lip", "bath", "foot", "hand", "moisturizer", 
    "cleanser", "shaving", "aftershave", "deodorant", "antiperspirant", "foundation", "concealer", "highlighter", "blush", 
    "eyeliner", "mascara", "lipstick", "lip gloss", "blusher", "nail polish", "cleaning", "disinfecting", "air freshener", "inhaler", 
    "bandage", "gauze", "sterile", "antiseptic", "spray", "first aid", "plaster", "adhesive", "cut", "scrape", "burn", "pain relief", 
    "cold pack", "medicine", "supplement", "vitamin", "herb", "nutrient", "weight loss", "protein powder", "multivitamin", 
    "calcium", "magnesium", "iron", "zinc", "omega-3", "energy", "metabolism", "immune", "digestive", "joint", "bone", 
    "cardiovascular", "heart", "blood pressure", "cholesterol", "blood sugar", "detox", "cleanse", "anti-inflammatory", "liver", 
    "thyroid", "stress", "relaxation", "memory", "focus", "brain", "sleep", "insomnia", "energy drink", "drink", "water", "tea", 
    "coffee", "smoothie", "fruit juice", "vegetable juice", "nutrient drink", "powder", "concentrate", "tablet", "lozenge", 
    "gummies", "capsules", "protein", "bulk", "herb", "essential oil", "natural", "organic", "pure", "wildcrafted", "vitamin C", 
    "vitamin D", "probiotic", "herbal", "tea", "extract", "flower essence", "fragrance", "cologne", "perfume", "room", "air freshener", 
    "cleanser", "shampoo", "conditioner", "hand wash", "toothbrush", "toothpaste", "mouth rinse", "deodorant", "foot care", 
    "baby wipes", "wet wipes", "pet food", "dog food", "cat food", "fish food", "bird food", "pet shampoo", "pet grooming", 
    "pet toys", "pet care", "pet supplement", "pet treats", "pet collar", "pet harness", "pet leash", "pet bowl", "cat litter"
  ];
// Function to clean the product name and ensure "aloe vera" always comes first
function cleanProductName(productName) {
  const words = productName.split(" ");

  // Find the indices of "aloe" and "vera"
  const aloeIndex = words.indexOf("aloe");
  const veraIndex = words.indexOf("vera");

  // If both "aloe" and "vera" are present
  if (aloeIndex !== -1 && veraIndex !== -1) {
    // If "vera" comes before "aloe", swap them
    if (veraIndex < aloeIndex) {
      const temp = words[veraIndex];
      words[veraIndex] = words[aloeIndex];
      words[aloeIndex] = temp;
    }

    // If "aloe" and "vera" are not next to each other, clean them
    if (aloeIndex + 1 !== veraIndex) {
      // Remove anything in between "aloe" and "vera"
      words.splice(aloeIndex + 1, veraIndex - aloeIndex - 1);
      words.splice(aloeIndex + 1, 0, "vera");
    }
  }

  // Rebuild the product name with the corrected order of "aloe vera"
  return words.join(" ").trim();
}

// Function to generate multiple product names based on the description
function generateProductNames(baseName, description) {
  const variations = new Set(); // Use a Set to avoid duplicate entries

  // Clean the base name to ensure "aloe vera" comes first
  const cleanedBaseName = cleanProductName(baseName);
  variations.add(cleanedBaseName);

  // Extract product types (powder, extract, etc.) from the description
  const types = extractProductTypes(description);

  // Add product type variations (e.g., "aloe vera extract")
  types.forEach(type => {
    if (!cleanedBaseName.toLowerCase().includes(type)) {
      variations.add(`${cleanedBaseName} ${type}`);
    }
  });

  // Extract all quantities from the description and generate names for each valid quantity
  const quantities = extractQuantities(description);
  if (quantities.length > 0) {
    quantities.forEach(quantity => {
      if (isValidQuantity(quantity)) {
        variations.add(`${cleanedBaseName} ${quantity}`); // Add base name with quantity
        types.forEach(type => {
          const typeAndQuantity = `${cleanedBaseName} ${type} ${quantity}`;
          if (!variations.has(typeAndQuantity)) {
            variations.add(typeAndQuantity); // Add base name with type and quantity if not already added
          }
        });
      }
    });
  }

  // Special combinations of product-related keywords (like "aloe vera extract")
  if (types.length > 1) {
    const productCombination = types.join(" ");
    variations.add(productCombination);
    quantities.forEach(quantity => {
      variations.add(`${productCombination} ${quantity}`);
    });
  }

  // Remove duplicates like "aloe aloe" or "aloe vera aloe" (avoid repeated base names)
  const finalVariations = Array.from(variations).filter(name => !name.includes(`${cleanedBaseName.toLowerCase()} ${cleanedBaseName.toLowerCase()}`));

  // Convert Set back to an array and return
  return finalVariations;
}

// Function to extract product types (dynamically detect product-related terms)
function extractProductTypes(line) {
  const words = line.split(" ").map(word => word.toLowerCase());

  // Dynamically identify product-related terms based on the presence in the description
  const foundTypes = PRODUCT_KEYWORDS.filter(keyword => words.includes(keyword));

  return foundTypes;
}

// Function to extract quantities from the description
function extractQuantities(line) {
  const quantityRegex = /(\d+\s*(drums?|pouches?|cartons?|kg|g|mg|gm|l|ml|pcs|units?|count|bottles|ton|capsules?|boxes?|sheets?))/ig;
  const matches = [...line.matchAll(quantityRegex)];
  return matches.map(match => match[0].trim());
}

// Function to check if a quantity is valid
function isValidQuantity(quantity) {
  const validQuantityRegex = /^\d+$/;  // Ensure the quantity is only numeric
  const value = parseInt(quantity.replace(/\D/g, ''), 10); // Remove non-numeric characters and parse the number
  // Validate if it's a positive number and between 1 and 10000
  return validQuantityRegex.test(quantity) && value > 0 && value <= 10000;
}



// Function to dynamically detect the main product name
function detectMainProductName(description) {
  const words = description.split(" ").map(word => word.toLowerCase());
  const cleanedWords = words.filter(word => !IRRELEVANT_WORDS.includes(word) && !QUANTITIES.includes(word));

  const mainProduct = PRODUCT_KEYWORDS.find(keyword => cleanedWords.includes(keyword));

  if (!mainProduct) {
    const wordFrequency = {};
    cleanedWords.forEach(word => {
      if (word.length > 1 && !IRRELEVANT_WORDS.includes(word)) {
        wordFrequency[word] = (wordFrequency[word] || 0) + 1;
      }
    });

    const sortedWords = Object.entries(wordFrequency).sort((a, b) => b[1] - a[1]);
    return sortedWords.length > 0 ? sortedWords[0][0] : null;
  }

  return mainProduct;
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
      let description = line.trim();

      // Detect the main product name dynamically from the description
      const mainProductName = detectMainProductName(description);
      if (mainProductName) {
        // Clean the product name to remove irrelevant words
        const cleanedProductName = cleanProductName(mainProductName);
        
        // Generate multiple names based on the detected main product name and the description
        const names = generateProductNames(cleanedProductName, description);

        // Only add items if there is meaningful information
        if (names.length > 0) {
          items.push({
            description: description,
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

