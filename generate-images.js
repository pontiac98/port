const fs = require('fs');
const path = require('path');
const { imageSize } = require('image-size');

// Карта соответствия: "имя_папки": "тип_галереи_для_HTML"
const galleryConfig = {
    'images1': '1',     // Папка images1 -> Галерея "1" (RGB)
    'images2': '2',     // Папка images2 -> Галерея "2" (CMYK)
    'images3': '3',     // Папка images3 -> Галерея "3" (3-D)
    'images4': '4' // Папка images_about -> Галерея "about"
};

const extensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
let allFilesData = [];

//// обновил
// Проходим циклом по всем настроенным папкам
for (const [dirName, galleryType] of Object.entries(galleryConfig)) {
    
    // Если папки физически нет в репозитории, просто пропускаем её и идем к следующей
    if (!fs.existsSync(dirName)) {
        console.log(`Папка ${dirName} не найдена, пропускаем...`);
        continue;
    }

    console.log(`Сканируем папку: ${dirName} для галереи: ${galleryType}`);

    const folderFiles = fs.readdirSync(dirName)
        .filter(file => extensions.includes(path.extname(file).toLowerCase()))
        .map(file => {
            const filePath = path.join(dirName, file);
            const buffer = fs.readFileSync(filePath);
            const size = imageSize(buffer);
            const ratio = size.width / size.height;

            let type = "";
            if (ratio > 2.4) type = "verywide";
            else if (ratio > 1.7) type = "wide";
            else if (ratio < 0.75) type = "tall";
            else if (ratio > 1.2) type = "big";

            // Возвращаем объект карточки с новым полем gallery
            return {
                gallery: galleryType, // <-- НОВОЕ ПОЛЕ: связывает картинку с разделом меню
                name: file,
                url: filePath.replace(/\\/g, "/"), // Приводим пути к веб-виду (слеши вправо)
                width: size.width,
                height: size.height,
                ratio: Number(ratio.toFixed(2)),
                type: type
            };
        });

    // Объединяем результаты из текущей папки с общим массивом
    allFilesData = allFilesData.concat(folderFiles);
}

// Записываем собранные данные всех галерей в единый JSON-файл
fs.writeFileSync("images.json", JSON.stringify(allFilesData, null, 2));
console.log(`Генерация успешна! Всего обработано картинок: ${allFilesData.length}`);
