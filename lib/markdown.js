/**
 * Parse markdown files
 */
const FsLine = require('fs-line');
const path = require('path');
const chalk = require('chalk');
const upload = require('./upload');

function searchImg(line) {
  const regexp = /!\[.*\]\((<?.+\.(?:jpe?g|png|gif)>?)\)/;
  const result = regexp.exec(line);
  if (result) {
    return result[1];
  } else {
    return null;
  }
}

function isUrl(str) {
  return /^http(s)?:\/\//.test(str);
}

async function parseMarkdown(file) {
  const filePath = path.resolve(process.cwd(), file);
  const fsline = new FsLine();
  fsline.open(filePath);
  fsline.on('line', async (line, next) => {
    const imgPath = searchImg(line);
    let realImgPath = imgPath;
    // 去掉 <>
    if (/^<.+>$/.test(imgPath)) {
      realImgPath = imgPath.slice(1, -1);
    }
    if (imgPath && !isUrl(imgPath) && !isUrl(realImgPath)) {
      try {
        const imgUrl = await upload(realImgPath);
        const newLine = line.replace(imgPath, imgUrl);
        next(newLine);
      } catch (error) {
        console.error(error);
        next();
      }
    } else {
      next();
    }
  });
}

module.exports = parseMarkdown;
