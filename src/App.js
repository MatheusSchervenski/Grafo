import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [pessoas, setPessoas] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:3001/pessoas')
      .then((response) => setPessoas(response.data))
      .catch((error) => console.error('Erro ao buscar pessoas:', error));
  }, []);

  return (
    <div>
      <h1>Rede Social</h1>
      <ul>
        {pessoas.map((pessoa) => (
          <li key={pessoa.id}>{pessoa.nome} (ID: {pessoa.id})</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
