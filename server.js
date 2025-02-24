const app = require('./app');
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// app.listen(PORT, '0.0.0.0', () => {
//   console.log(`Server is running on http://0.0.0.0:${PORT}`);
// });