const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// banco de dados fake (somente em memória)
const users = [];

app.post("/register", (req, res) => {
  const { name, email, password } = req.body;
  const userExists = users.find((u) => u.email === email);

  if (userExists) {
    return res.status(400).json({ message: "User already exists" });
  }

  const newUser = { id: users.length + 1, name, email, password };
  users.push(newUser);

  res.status(201).json({ message: "User created", user: newUser });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  res.json({ message: "Login successful", user });
});

app.get("/users", (req, res) => {
  res.json(users);
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
