const express = require("express");
const { v4: uuidV4} = require("uuid");

const app = express();

app.use(express.json());

const customers = [];

function verifyIfExistsAccountCPF(request, response, next) {
  const { cpf } = request.headers;

  const customer = customers.find(customer => customer.cpf === cpf);

  if(!customer) {
    return response.status(400).json({ error: "Customer not exists!" });
  }

  request.customer = customer;

  return next();
}

function getBalance(statement) {
  const balance = statement.reduce((acc, operation) => {
    if(operation.type === 'credit') {
      return acc + operation.amount;
    } else {
      return acc - operation.amount;
    }
  }, 0);

  return balance;
}

app.post("/account", (request, response) => {
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

app.get("/statement", verifyIfExistsAccountCPF, (request, response) => {
  const { customer } = request;

  return response.json(customer.statement);
});

app.post("/deposit", verifyIfExistsAccountCPF, (request, response) => {
  const { customer } = request;
  const { amount, description } = request.body;

  const statementOperation = {
    amount,
    description,
    created_at: new Date(),
    type: "credit",
  }

  customer.statement.push(statementOperation);

  return response.status(201).send();
});

app.post("/withdraw", verifyIfExistsAccountCPF, (request, response) => {
  const { customer } = request;
  const { amount } = request.body;

  const balance = getBalance(customer.statement);

  if(balance < amount) {
    return response.status(400).json({ error: "Insufficient founds account!"})
  }

  const statementOperation = {
    amount,
    created_at: new Date(),
    type: "debit",
  }

  customer.statement.push(statementOperation);

  return response.status(201).send();
});

app.get("/statement/date", verifyIfExistsAccountCPF, (request, response) => {
  const { customer } = request;
  const { date } = request.query;

  const dateFormat = new Date(date + " 00:00");

  const statement = customer.statement.filter(
    (statement) =>
      statement.created_at.toDateString() ===
      new Date(dateFormat).toDateString()
    );

  return response.json(statement);
});

app.put("/account", verifyIfExistsAccountCPF, (request, response) => {
  const { customer } = request;
  const { name } = request.body;

  customer.name = name;

  return response.status(201).json(customer);
});

app.get("/account", verifyIfExistsAccountCPF, (request, response) => {
  const { customer } = request;
  return response.json(customer);
});

app.delete("/account", verifyIfExistsAccountCPF, (request, response) => {
  const { customer } = request;

  customers.splice(customer, 1);

  return response.status(200).json(customers);
})

app.listen(3333, () => {
  console.log("Servidor em execução!");
});