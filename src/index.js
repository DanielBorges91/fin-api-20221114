const express = require("express");
const { v4: uuidV4} = require("uuid");

const app = express();

app.use(express.json());

const customers = [];

app.put("/account", (request, response) => {
  const { name, cpf} = request.body;

  const customerAlreadyExists = customers.some( customer => customer.cpf === cpf);

  if(customerAlreadyExists) {
    return response.status(400).json({ error: "Customer already exists!"});
  }

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

app.get("/statement/:cpf", (request, response) => {
  const { cpf } = request.params;
  const customer = customers.find(customer => customer.cpf === cpf);

  return response.json(customer.statement);

});

app.listen(3333, () => {
  console.log("Servidor em execução!");
});