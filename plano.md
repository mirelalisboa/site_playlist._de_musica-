# PLANO.md — Planejamento da API: Playlist de Músicas

## 1. Qual é o meu recurso?
* **Recurso:** `playlist` (coleção: `playlists`)

---

## 2. Quais campos ele tem, e de que tipo?
* **id** → Número inteiro (gerado automaticamente)
* **nome** → Texto (`string`)
* **descricao** → Texto (`string`)
* **qtd_musicas** → Número inteiro (`integer`)
* **duracao_total_minutos** → Número decimal (`float`)
* **nota** → Número decimal (`float`, de 0.0 a 10.0)
* **publica** → Booleano (`boolean`: `true` ou `false`)

---

## 3. Quais campos são obrigatórios?
Ao cadastrar uma nova playlist (`POST`), o seguinte campo é obrigatório:
* `nome`

*(Os campos `descricao`, `qtd_musicas`, `duracao_total_minutos`, `nota` e `publica` são opcionais e assumem valores padrão caso não sejam informados).*

---

## 4. Quais validações preciso?
* **`nome`**: Não pode ser vazio, não pode conter apenas espaços e deve ter no máximo 100 caracteres.
* **`qtd_musicas`**: Não pode ser um valor negativo (deve ser >= 0).
* **`duracao_total_minutos`**: Não pode ser um valor negativo (deve ser >= 0).
* **`nota`**: Se informada, deve estar no intervalo entre **0.0** e **10.0**.
* **`publica`**: Deve ser um valor booleano válido (`true` ou `false`).

---

## 5. Quais serão minhas 5 rotas no padrão REST?

* `GET /playlist`
  * **Descrição:** Lista todas as playlists cadastradas.
  * **Resposta:** Status `200 OK` com a lista de playlists.

* `GET /playlist/<id>`
  * **Descrição:** Busca os detalhes de uma playlist específica pelo seu ID.
  * **Resposta:** Status `200 OK` com os dados da playlist se encontrada, ou `404 Not Found` se não existir.

* `POST /playlist`
  * **Descrição:** Cadastra uma nova playlist.
  * **Corpo da requisição:** Dados da playlist em JSON.
  * **Resposta:** Status `201 Created` com o objeto criado, ou `400 Bad Request` se falhar em alguma validação.

* `PUT /playlist/<id>`
  * **Descrição:** Atualiza as informações de uma playlist existente pelo ID.
  * **Corpo da requisição:** Campos atualizados em JSON.
  * **Resposta:** Status `200 OK` com a playlist atualizada, `400 Bad Request` em caso de dados inválidos, ou `404 Not Found`.

* `DELETE /playlist/<id>`
  * **Descrição:** Remove uma playlist da base de dados pelo seu ID.
  * **Resposta:** Status `200 OK` ou `204 No Content` após deletar, ou `404 Not Found`.