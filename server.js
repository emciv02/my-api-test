const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3005;
const bcrypt = require("bcrypt");
const crypto = require("crypto");

app.use(cors());
app.use(express.json());

const users = [];
const resetTokens = {};

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = users.find((u) => u.email === email);
  if (userExists) {
    return res.status(409).json({ message: "Usuário já existe" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = {
    id: users.length + 1,
    name,
    email,
    hashedPassword,
  };

  users.push(newUser);

  res.status(201).json({
    message: "Usuário registrado com sucesso",
    user: { id: newUser.id, name: newUser.name, email: newUser.email },
  });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = users.find((u) => u.email === email);
  if (!user) {
    return res.status(400).json({ message: "Usuário não encontrado" });
  }

  const validPassword = await bcrypt.compare(password, user.hashedPassword);
  if (!validPassword) {
    return res.status(401).json({ message: "Senha incorreta" });
  }

  res.status(200).json({
    message: "Login bem-sucedido",
    user: { id: user.id, name: user.name, email: user.email },
  });
});

app.post("/graphs", (req, res) => {
  console.log(req);
  return res.status(401).json({ message: "Graph pages" });
});

app.post("/homepage", (req, res) => {
  return res.status(401).json({ message: "Pagina inicial" });
});

app.get("/users", (req, res) => {
  const safeUsers = users.map(({ ...u }) => u);
  res.json(safeUsers);
});

app.post("/forgotPassword", (req, res) => {
  const { email } = req.body;

  const token = crypto.randomInt(100000, 999999).toString();

  resetTokens[email] = {
    token,
    expires: Date.now() + 15 * 60 * 1000,
  };

  console.log(`Token to ${email}: ${token}`);

  res.json({
    message:
      "If the e-mail exists, a recovery code has been sent. Check your inbox.",
  });
});

app.post("/resetPassword", async (req, res) => {
  const { email, token, newPassword } = req.body;
  const record = resetTokens[email];
  console.log(record);
  console.log(email, token, newPassword);

  if (!record) {
    return res.status(400).json({ message: "Código inválido ou expirado." });
  }

  if (record.token !== token) {
    return res.status(400).json({ message: "Código inválido." });
  }

  if (Date.now() > record.expires) {
    delete resetTokens[email];
    return res.status(400).json({ message: "Código expirado." });
  }

  const user = users.find((u) => u.email === email);
  if (!user) {
    return res.status(400).json({ message: "Usuário não encontrado." });
  }

  user.hashedPassword = await bcrypt.hash(newPassword, 10);
  delete resetTokens[email];
  res.json({ message: "Senha alterada com sucesso!" });
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
