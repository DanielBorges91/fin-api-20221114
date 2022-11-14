const express = require("express");
const { v4: uuidV4} = require("uuid");

const app = express();

app.use(express.json());

const customers = [];

app.put("/account", (request, response) => {
  const { name, cpf} = request.body;

  const account = {
    id: uuidV4(),
    name,
    cpf,
    created_at: new Date(),
    statement: [],
  }

  customers.push(account);

  return response.status(201).json(account);
});

app.listen(3333, () => {
  console.log("Servidor em execução!");
});