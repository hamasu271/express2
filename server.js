
// server.js
const express = require('express');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');

const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// 미들웨어
app.use(bodyParser.json());

// 요청 제한 미들웨어 적용 (모든 API에 적용)
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1분
  max: 100, // 분당 최대 100개 요청 허용
  message: { error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' }
});
app.use(limiter);

// 라우팅
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);

// 기본 라우트
app.get('/', (req, res) => {
  res.send('RESTful API 서버입니다.');
});

// 에러 처리 미들웨어
app.use(errorHandler);

// 서버 시작
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`서버가 ${PORT}번 포트에서 실행 중입니다.`);
});
