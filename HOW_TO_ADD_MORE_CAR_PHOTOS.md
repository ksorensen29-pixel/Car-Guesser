# How to Add More Car Photos

Follow these steps to add new cars to the Car Guesser game:

## Step 1: Prepare Your Image
- Find a car photo you want to add
- Convert it to **JPEG format** (if not already)
- Give it a **numerical name** (e.g., `8.jpeg`, `9.jpeg`, etc.)
- Place it in the `ScriptMats/photos/` folder

## Step 2: Update the Game File
1. Open `ScriptMats/cargamehtml.html` in your editor
2. Find the `const cars = [` array (around line 122)
3. Add a new entry at the end (before the closing `];`):

```javascript
{ image: "photos/8.jpeg", name: "Car Model Name", year: 2023, country: "Country Name" }
```

**Example:**
```javascript
const cars = [
  { image: "photos/1.jpeg", name: "Porsche", year: 2020, country: "Germany" },
  { image: "photos/2.jpeg", name: "Toyota Corolla", year: 2019, country: "Japan" },
  // ... other cars ...
  { image: "photos/7.jpeg", name: "Lightning McQueen", year: 2006, country: "USA" },
  { image: "photos/8.jpeg", name: "Your Car Model", year: 2023, country: "Your Country" }  // <-- Add here
];
```

## Step 3: Commit Your Changes
Run these commands in the terminal:
```bash
git add -A
git commit -m "Add new car: [Car Name] and other cars"
git push
```

## Important Notes
✓ **Always use JPEG format** (.jpeg or .jpg extension)  
✓ **Use numerical filenames** (8.jpeg, 9.jpeg, 10.jpeg, etc.)  
✓ **Include all 4 fields**: image path, name, year, and country  
✓ **Don't break the JavaScript syntax** - ensure commas are correct  
✓ **Add multiple cars at once** when possible for cleaner commit history

## File Structure
```
Car-Guesser/
├── ScriptMats/
│   ├── cargamehtml.html       (Main game file)
│   ├── carguesserlogic.js     (Empty - logic is in HTML)
│   ├── base
│   └── photos/                 (Car images folder)
│       ├── 1.jpeg
│       ├── 2.jpeg
│       ├── 3.jpeg
│       ├── ... etc
│       └── 8.jpeg (your new image)
├── HOW_TO_ADD_MORE_CAR_PHOTOS.md
└── README.md
```

Good luck adding more cars! 🚗
