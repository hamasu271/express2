// utils/generateId.js
let currentId = 1;

function generateId() {
  return currentId++;
}

module.exports = generateId;