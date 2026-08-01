<div align="center">

# 🎵 API de Playlists de Músicas

### Uma API REST simples, feita com Flask, para gerenciar playlists e suas músicas.

[![Python](https://img.shields.io/badge/Python-3.8+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-Framework-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![License](https://img.shields.io/badge/Licença-MIT-green?style=for-the-badge)](#-licença)
[![Status](https://img.shields.io/badge/Status-Em%20Desenvolvimento-yellow?style=for-the-badge)](#)

</div>

---

## 📖 Sobre o projeto

Esta é uma **API REST** desenvolvida em **Flask** para gerenciar **playlists** e as **músicas** dentro delas.

> ⚠️ **Atenção:** os dados são armazenados **apenas em memória** (em listas Python). Isso significa que, sempre que a aplicação for reiniciada, **todos os dados cadastrados serão perdidos**. Esse é o comportamento esperado do projeto — ideal para estudos e testes rápidos, mas **não recomendado para produção**.

---

## 📚 Sumário

- [✨ Funcionalidades](#-funcionalidades)
- [🗂️ Estrutura dos dados](#️-estrutura-dos-dados)
- [🚀 Como executar](#-como-executar)
- [🔌 Endpoints da API](#-endpoints-da-api)
  - [Playlists](#-playlists)
  - [Músicas](#-músicas)
- [✅ Regras de validação](#-regras-de-validação)
- [🧪 Exemplos de uso](#-exemplos-de-uso)
- [🛠️ Tecnologias utilizadas](#️-tecnologias-utilizadas)
- [📄 Licença](#-licença)

---

## ✨ Funcionalidades

- ✅ Criar, listar, buscar, atualizar e remover **playlists**
- ✅ Adicionar e remover **músicas** dentro de uma playlist
- ✅ Validação completa dos campos enviados
- ✅ Contagem automática da quantidade de músicas (`qtd_musicas`)
- ✅ IDs gerados automaticamente pelo sistema (sequenciais e únicos)
- ✅ Página web inicial servida em `/`

---

## 🗂️ Estrutura dos dados

### Playlist

| Campo | Tipo | Obrigatório | Descrição |
|---|---|:---:|---|
| `id` | inteiro | 🔒 gerado pelo sistema | Identificador único da playlist |
| `nome` | texto | ✅ | Nome da playlist (até 100 caracteres) |
| `descricao` | texto | ❌ | Descrição livre da playlist |
| `qtd_musicas` | inteiro | ❌ | Quantidade de músicas (≥ 0) |
| `duracao_total_minutos` | número | ❌ | Duração total em minutos (≥ 0) |
| `nota` | número | ❌ | Avaliação de `0.0` a `10.0` |
| `publica` | booleano | ❌ | Define se a playlist é pública (`true`/`false`) |
| `musicas` | lista | 🔒 gerenciado pelos endpoints de música | Lista de músicas da playlist |

### Música

| Campo | Tipo | Obrigatório | Descrição |
|---|---|:---:|---|
| `id` | inteiro | 🔒 gerado pelo sistema | Identificador único da música |
| `titulo` | texto | ✅ | Título da música |
| `artista` | texto | ✅ | Nome do artista |
| `url` | texto | ✅ | Link da música (até 2000 caracteres) |

---

## 🚀 Como executar

```bash
# 1. Clone o repositório
git clone <url-do-seu-repositorio>
cd <nome-da-pasta>

# 2. Instale as dependências
pip install flask

# 3. Execute a aplicação
python app.py
```

A aplicação vai rodar em modo de desenvolvimento, disponível em:

<div align="center">

[![Acessar API](https://img.shields.io/badge/🌐_Acessar_API-http://127.0.0.1:5000-4CAF50?style=for-the-badge)](http://127.0.0.1:5000)

</div>

---

## 🔌 Endpoints da API

### 🎧 Playlists

<table>
<tr><th>Método</th><th>Rota</th><th>Descrição</th></tr>
<tr>
<td><img src="https://img.shields.io/badge/GET-61affe?style=flat-square" /></td>
<td><code>/playlist</code></td>
<td>Lista todas as playlists cadastradas</td>
</tr>
<tr>
<td><img src="https://img.shields.io/badge/GET-61affe?style=flat-square" /></td>
<td><code>/playlist/&lt;id&gt;</code></td>
<td>Busca uma playlist específica pelo id</td>
</tr>
<tr>
<td><img src="https://img.shields.io/badge/POST-49cc90?style=flat-square" /></td>
<td><code>/playlist</code></td>
<td>Cria uma nova playlist</td>
</tr>
<tr>
<td><img src="https://img.shields.io/badge/PUT-fca130?style=flat-square" /></td>
<td><code>/playlist/&lt;id&gt;</code></td>
<td>Atualiza os dados de uma playlist existente</td>
</tr>
<tr>
<td><img src="https://img.shields.io/badge/DELETE-f93e3e?style=flat-square" /></td>
<td><code>/playlist/&lt;id&gt;</code></td>
<td>Remove uma playlist existente</td>
</tr>
</table>

### 🎶 Músicas

<table>
<tr><th>Método</th><th>Rota</th><th>Descrição</th></tr>
<tr>
<td><img src="https://img.shields.io/badge/POST-49cc90?style=flat-square" /></td>
<td><code>/playlist/&lt;id&gt;/musicas</code></td>
<td>Adiciona uma música à playlist</td>
</tr>
<tr>
<td><img src="https://img.shields.io/badge/DELETE-f93e3e?style=flat-square" /></td>
<td><code>/playlist/&lt;id&gt;/musicas/&lt;id_musica&gt;</code></td>
<td>Remove uma música da playlist</td>
</tr>
</table>

---

## ✅ Regras de validação

| Campo | Regra |
|---|---|
| `nome` | Texto, obrigatório, não vazio, máximo de 100 caracteres |
| `qtd_musicas` | Número inteiro, maior ou igual a 0 |
| `duracao_total_minutos` | Número (inteiro ou decimal), maior ou igual a 0 |
| `nota` | Número decimal entre `0.0` e `10.0` |
| `publica` | Deve ser `true` ou `false` (booleano) |
| `titulo`, `artista` | Texto, obrigatório, não vazio, máximo de 200 caracteres |
| `url` | Texto, obrigatório, não vazio, máximo de 2000 caracteres |

> 💡 Se algum campo obrigatório não for enviado ou estiver com o tipo/formato errado, a API responde com status `400` e uma mensagem explicando o erro.

---

## 🧪 Exemplos de uso

### ➕ Criar uma playlist

```bash
curl -X POST http://127.0.0.1:5000/playlist \
  -H "Content-Type: application/json" \
  -d '{
        "nome": "Foco Total",
        "descricao": "Playlist para estudar",
        "publica": true
      }'
```

**Resposta (`201 Created`):**

```json
{
  "id": 1,
  "nome": "Foco Total",
  "descricao": "Playlist para estudar",
  "qtd_musicas": 0,
  "duracao_total_minutos": 0.0,
  "nota": 0.0,
  "publica": true,
  "musicas": []
}
```

### 🎵 Adicionar uma música

```bash
curl -X POST http://127.0.0.1:5000/playlist/1/musicas \
  -H "Content-Type: application/json" \
  -d '{
        "titulo": "Nome da Música",
        "artista": "Nome do Artista",
        "url": "https://exemplo.com/musica"
      }'
```

**Resposta (`201 Created`):**

```json
{
  "id": 1,
  "titulo": "Nome da Música",
  "artista": "Nome do Artista",
  "url": "https://exemplo.com/musica"
}
```

### 🗑️ Remover uma playlist

```bash
curl -X DELETE http://127.0.0.1:5000/playlist/1
```

**Resposta:** `204 No Content`

---

## 🛠️ Tecnologias utilizadas

<div align="left">

![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)
![JSON](https://img.shields.io/badge/JSON-000000?style=for-the-badge&logo=json&logoColor=white)

</div>

---

## 📄 Licença

Este projeto está sob a licença MIT. Sinta-se livre para usar, estudar e modificar. 💜

<div align="center">

**Feito com 🎧 e ☕**

</div>
