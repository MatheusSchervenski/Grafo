const express = require('express');
const { v4: uuidv4 } = require('uuid');
const neo4j = require('neo4j-driver');

const app = express();
const port = 3001;

const driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j', '1234'));

app.use(express.json());

app.post('/pessoa', async (req, res) => {
  const { nome, idade, localizacao } = req.body;
  const sessionId = uuidv4();

  const session = driver.session({ database: 'neo4j', defaultAccessMode: neo4j.session.WRITE });

  try {
    const result = await session.run(
      'CREATE (p:Pessoa {id: $id, nome: $nome, idade: $idade, localizacao: $localizacao}) RETURN p',
      { id: sessionId, nome, idade, localizacao }
    );

    res.json(result.records[0].get('p').properties);
  } finally {
    await session.close();
  }
});

app.get('/pessoas', async (req, res) => {
  const session = driver.session({ database: 'neo4j', defaultAccessMode: neo4j.session.READ });

  try {
    const result = await session.run('MATCH (p:Pessoa) RETURN p');

    res.json(result.records.map((record) => record.get('p').properties));
  } finally {
    await session.close();
  }
});

app.post('/amizade', async (req, res) => {
  const { idPessoa1, idPessoa2 } = req.body;

  const session = driver.session({ database: 'neo4j', defaultAccessMode: neo4j.session.WRITE });

  try {
    const result = await session.run(
      'MATCH (p1:Pessoa {id: $idPessoa1}), (p2:Pessoa {id: $idPessoa2}) ' +
      'CREATE (p1)-[:AMIGO_DE]->(p2) ' +
      'RETURN p1, p2',
      { idPessoa1, idPessoa2 }
    );

    res.json({
      pessoa1: result.records[0].get('p1').properties,
      pessoa2: result.records[0].get('p2').properties
    });
  } finally {
    await session.close();
  }
});

app.delete('/amizade', async (req, res) => {
  const { idPessoa1, idPessoa2 } = req.body;

  const session = driver.session({ database: 'neo4j', defaultAccessMode: neo4j.session.WRITE });

  try {
    const result = await session.run(
      'MATCH (p1:Pessoa {id: $idPessoa1})-[r:AMIGO_DE]->(p2:Pessoa {id: $idPessoa2}) ' +
      'DELETE r ' +
      'RETURN p1, p2',
      { idPessoa1, idPessoa2 }
    );

    res.json({
      pessoa1: result.records[0].get('p1').properties,
      pessoa2: result.records[0].get('p2').properties
    });
  } finally {
    await session.close();
  }
});

app.get('/rede-amizades/:id', async (req, res) => {
  const { id } = req.params;

  const session = driver.session({ database: 'neo4j', defaultAccessMode: neo4j.session.READ });

  try {
    const result = await session.run(
      'MATCH (p:Pessoa {id: $id})-[:AMIGO_DE*1..]-(amigo) ' +
      'RETURN DISTINCT amigo',
      { id }
    );

    res.json(result.records.map((record) => record.get('amigo').properties));
  } finally {
    await session.close();
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
