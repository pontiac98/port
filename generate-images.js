const fs = require('fs');
const path = require('path');
const { imageSize } = require('image-size');

const targetDir = 'images1';
const extensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

if (!fs.existsSync(targetDir)) {
    fs.writeFileSync('images.json', '[]');
    process.exit(0);
}

const files = fs.readdirSync(targetDir)
    .filter(file => extensions.includes(path.extname(file).toLowerCase()))
    .map(file => {

       const filePath = path.join(targetDir, file);

        const buffer = fs.readFileSync(filePath);
        const size = imageSize(buffer);

        const ratio = size.width / size.height;

        let type = "";

        if (ratio > 1.7)
            type = "wide";
        else if (ratio < 0.75)
            type = "tall";
        else if (ratio > 1.2)
            type = "big";

        return {
            name: file,
            url: filePath.replace(/\\/g, "/"),
            width: size.width,
            height: size.height,
            ratio: Number(ratio.toFixed(2)),
            type: type
        };

    });

fs.writeFileSync("images.json", JSON.stringify(files, null, 2));
