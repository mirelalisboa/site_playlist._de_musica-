
# AGENTS.md

## O que é este projeto
Um sistema para gerenciar playlists de músicas.
Cada playlist tem:
- id: número identificador único gerado pelo sistema
- nome: nome da playlist (obrigatório)
- descricao: detalhes ou resumo sobre a playlist
- qtd_musicas: quantidade total de músicas na playlist
- duracao_total_minutos: tempo total de duração em minutos
- nota: avaliação de 0.0 a 10.0
- publica: indica se a playlist é pública (true) ou privada (false)

Os dados ficam guardados só na memória — não usamos banco de dados.

## Como escrever o código
- Python com Flask
- Tudo em um arquivo só: app.py
- Comentários em português, explicando o que cada parte faz

## Regras que você nunca pode quebrar

1. Não deixe cadastrar playlist sem o campo obrigatório 'nome'.
   Se faltar, responda: {"erro": "O campo 'nome' é obrigatório."}

2. Validações do sistema:
   - O 'nome' não pode ser vazio, conter apenas espaços em branco ou ter mais de 100 caracteres.
   - A 'qtd_musicas' deve ser um número inteiro maior ou igual a 0.
   - A 'duracao_total_minutos' deve ser um número maior ou igual a 0.
   - A 'nota', se fornecida, deve ser um número decimal entre 0.0 e 10.0.
   - O campo 'publica', se fornecido, deve ser do tipo booleano (true ou false).

3. Quem escolhe o id é o sistema, nunca quem está cadastrando.

4. O sistema nunca pode travar. Se faltar alguma informação ou os dados forem inválidos,
   responda com erro — não deixe a aplicação quebrar.

5. Toda mensagem de erro sai assim: {"erro": "texto explicando"}

6. Use sempre o código de resposta certo:
   - deu certo ............ 200
   - cadastrou ............ 201
   - pediram algo errado .. 400
   - não existe ........... 404

## Endereços do sistema
- GET    /playlist        -> Lista todas as playlists
- GET    /playlist/<id>   -> Busca uma playlist pelo ID
- POST   /playlist        -> Cadastra uma nova playlist
- PUT    /playlist/<id>   -> Atualiza uma playlist existente pelo ID
- DELETE /playlist/<id>   -> Remove uma playlist pelo ID

```