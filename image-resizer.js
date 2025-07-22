const fs = require('node:fs');
const path = require('node:path');
const process = require('node:process');
const sharp = require('sharp');

const IMG_MAX_WIDTH = 600;

function getFilenamesInDirectorySync(dirPath) {
    const files = fs.readdirSync(dirPath);
    const filenames = files.map(file => path.join(dirPath, file));
    filenames.sort((a, b) => path.basename(a).localeCompare(path.basename(b)));
    return filenames;
}

async function resizeImage(fileName, inputBuffer, outputPath) {
    try {
        await sharp(inputBuffer)
            .resize({
                width: IMG_MAX_WIDTH,
                withoutEnlargement: true
            })
            .toFile(outputPath);
    } catch (error) {
        console.error(`Error: [${fileName}]`, error);
    }
}

// =====

// Command-line arguments
const args = process.argv.slice(2);
if (args.length < 2) {
    console.error('Script requires two arguments: <Input Directory> <Output Directory>');
    process.exit(1);
}

const inputPath = path.resolve(args[0]);
const outputPath = path.resolve(args[1]);

// Check that output directory exists
if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath);
}

const fileNames = getFilenamesInDirectorySync(inputPath);

fileNames.forEach(async inputFile => {
    const fileName = path.basename(inputFile);
    const outputFile = path.join(outputPath, fileName);

    try {
        const dataBuffer = fs.readFileSync(inputFile);
        await resizeImage(fileName, dataBuffer, outputFile);
    } catch (err) {
        console.error('Error reading file:', err);
    }
});

process.exit(0);
