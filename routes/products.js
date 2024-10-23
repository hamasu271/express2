// routes/products.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const authMiddleware = require('../middleware/authMiddleware');
const validateMiddleware = require('../middleware/validateMiddleware');
const generateId = require('../utils/generateId');

const router = express.Router();

// 데이터 파일 경로
const productsFilePath = path.join(__dirname, '../data/products.json');

// 상품 데이터 읽기
function getProducts() {
  if (!fs.existsSync(productsFilePath)) {
    fs.writeFileSync(productsFilePath, JSON.stringify([]));
  }
  const productsData = fs.readFileSync(productsFilePath);
  return JSON.parse(productsData);
}

// 상품 데이터 쓰기
function saveProducts(products) {
  fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2));
}

// GET /api/products - 모든 상품 목록 조회
router.get('/', authMiddleware, (req, res) => {
  const products = getProducts();
  res.json(products);
});

// GET /api/products/:id - 특정 상품 조회
router.get('/:id', authMiddleware, (req, res) => {
  const productId = parseInt(req.params.id);
  const products = getProducts();
  const product = products.find(p => p.id === productId);

  if (!product) {
    return res.status(404).json({ error: '상품을 찾을 수 없습니다.' });
  }

  res.json(product);
});

// POST /api/products - 새로운 상품 생성
router.post('/', authMiddleware, validateMiddleware(['name', 'price']), (req, res) => {
  const { name, price } = req.body;
  const products = getProducts();

  // 이름 중복 확인
  const existingProduct = products.find(p => p.name === name);
  if (existingProduct) {
    return res.status(400).json({ error: '이미 존재하는 상품 이름입니다.' });
  }

  const newProduct = {
    id: generateId(),
    name,
    price
  };

  products.push(newProduct);
  saveProducts(products);

  res.status(201).json(newProduct);
});

// PUT /api/products/:id - 상품 정보 수정
router.put('/:id', authMiddleware, validateMiddleware(['name', 'price']), (req, res) => {
  const productId = parseInt(req.params.id);
  const { name, price } = req.body;
  const products = getProducts();
  const productIndex = products.findIndex(p => p.id === productId);

  if (productIndex === -1) {
    return res.status(404).json({ error: '상품을 찾을 수 없습니다.' });
  }

  // 이름 중복 확인 (자신 제외)
  const existingProduct = products.find(p => p.name === name && p.id !== productId);
  if (existingProduct) {
    return res.status(400).json({ error: '이미 존재하는 상품 이름입니다.' });
  }

  products[productIndex].name = name;
  products[productIndex].price = price;
  saveProducts(products);

  res.json(products[productIndex]);
});

// DELETE /api/products/:id - 상품 삭제
router.delete('/:id', authMiddleware, (req, res) => {
  const productId = parseInt(req.params.id);
  let products = getProducts();
  const product = products.find(p => p.id === productId);

  if (!product) {
    return res.status(404).json({ error: '상품을 찾을 수 없습니다.' });
  }

  products = products.filter(p => p.id !== productId);
  saveProducts(products);

  res.json({ message: '상품이 삭제되었습니다.' });
});

// 추가 기능: 페이징과 검색
router.get('/search', authMiddleware, (req, res) => {
  let products = getProducts();
  const { name, minPrice, maxPrice, page = 1, limit = 10 } = req.query;

  if (name) {
    products = products.filter(p => p.name.toLowerCase().includes(name.toLowerCase()));
  }

  if (minPrice) {
    products = products.filter(p => p.price >= parseFloat(minPrice));
  }

  if (maxPrice) {
    products = products.filter(p => p.price <= parseFloat(maxPrice));
  }

  const start = (page - 1) * limit;
  const end = start + parseInt(limit);
  const paginatedProducts = products.slice(start, end);

  res.json({
    page: parseInt(page),
    limit: parseInt(limit),
    total: products.length,
    products: paginatedProducts
  });
});

module.exports = router;
