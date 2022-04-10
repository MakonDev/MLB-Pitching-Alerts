const express = require("express");
const { gameSchedule } = require("./apiFunctions");
const PORT = process.env.PORT || 3001;
const app = express();

//app.use(express.static(path.join(__dirname, 'build')));

app.get("/api", (req, res) => {
  const one  = gameSchedule();
  console.log(one)

  res.json({ message: "Hello from Express!", data: one });
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});