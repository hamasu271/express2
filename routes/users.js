// routes/users.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const authMiddleware = require('../middleware/authMiddleware');
const validateMiddleware = require('../middleware/validateMiddleware');
const generateId = require('../utils/generateId');

const router = express.Router();

// 데이터 파일 경로
const usersFilePath = path.join(__dirname, '../data/users.json');

// 사용자 데이터 읽기
function getUsers() {
  if (!fs.existsSync(usersFilePath)) {
    fs.writeFileSync(usersFilePath, JSON.stringify([]));
  }
  const usersData = fs.readFileSync(usersFilePath);
  return JSON.parse(usersData);
}

// 사용자 데이터 쓰기
function saveUsers(users) {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
}

// GET /api/users - 모든 사용자 목록 조회
router.get('/', authMiddleware, (req, res) => {
  const users = getUsers();
  res.json(users);
});

// GET /api/users/:id - 특정 사용자 조회
router.get('/:id', authMiddleware, (req, res) => {
  const userId = parseInt(req.params.id);
  const users = getUsers();
  const user = users.find(u => u.id === userId);

  if (!user) {
    return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
  }

  res.json(user);
});

// POST /api/users - 새로운 사용자 생성
router.post('/', authMiddleware, validateMiddleware(['name', 'email']), (req, res) => {
  const { name, email } = req.body;
  const users = getUsers();

  // 이메일 중복 확인
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ error: '이미 존재하는 이메일입니다.' });
  }

  const newUser = {
    id: generateId(),
    name,
    email
  };

  users.push(newUser);
  saveUsers(users);

  res.status(201).json(newUser);
});

// PUT /api/users/:id - 사용자 정보 수정
router.put('/:id', authMiddleware, validateMiddleware(['name', 'email']), (req, res) => {
  const userId = parseInt(req.params.id);
  const { name, email } = req.body;
  const users = getUsers();
  const userIndex = users.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
  }

  // 이메일 중복 확인 (자신 제외)
  const existingUser = users.find(u => u.email === email && u.id !== userId);
  if (existingUser) {
    return res.status(400).json({ error: '이미 존재하는 이메일입니다.' });
  }

  users[userIndex].name = name;
  users[userIndex].email = email;
  saveUsers(users);

  res.json(users[userIndex]);
});

// DELETE /api/users/:id - 사용자 삭제
router.delete('/:id', authMiddleware, (req, res) => {
  const userId = parseInt(req.params.id);
  let users = getUsers();
  const user = users.find(u => u.id === userId);

  if (!user) {
    return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
  }

  users = users.filter(u => u.id !== userId);
  saveUsers(users);

  res.json({ message: '사용자가 삭제되었습니다.' });
});

module.exports = router;