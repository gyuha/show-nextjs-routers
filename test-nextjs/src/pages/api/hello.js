// API 라우트 예제 - Pages Router
export default function handler(req, res) {
  res.status(200).json({ name: 'John Doe', message: 'Hello from Pages Router API' });
}