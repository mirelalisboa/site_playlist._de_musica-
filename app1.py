# -*- coding: utf-8 -*-
"""
API REST de Playlists de Músicas.

Sistema simples em Flask que gerencia playlists e suas músicas guardadas
apenas na memória. Quando a aplicação é reiniciada, todos os dados são
perdidos (comportamento esperado).
"""

from flask import Flask, jsonify, render_template, request

app = Flask(__name__)

# "Banco de dados" em memória: uma lista que guarda todas as playlists
playlists = []

# Controla o próximo id a ser usado (gerado de forma sequencial pelo sistema)
proximo_id = 1

# Controla o próximo id de música (sequencial e único entre todas as playlists)
proximo_id_musica = 1


def _procurar_playlist_por_id(id_playlist):
    """Procura uma playlist pelo id na lista e devolve a playlist ou None."""
    for playlist in playlists:
        if playlist["id"] == id_playlist:
            return playlist
    return None


def _procurar_musica_por_id(playlist, id_musica):
    """Procura uma música pelo id dentro de uma playlist e devolve a música ou None."""
    for musica in playlist["musicas"]:
        if musica["id"] == id_musica:
            return musica
    return None


def _validar_nome(nome):
    """Valida o campo 'nome'. Devolve a mensagem de erro ou None se estiver ok."""
    if not isinstance(nome, str):
        return "O campo 'nome' deve ser um texto."
    if nome.strip() == "":
        return "O campo 'nome' não pode ser vazio ou conter apenas espaços."
    if len(nome) > 100:
        return "O campo 'nome' deve ter no máximo 100 caracteres."
    return None


def _validar_qtd_musicas(valor):
    """Valida o campo 'qtd_musicas' (deve ser um inteiro maior ou igual a 0)."""
    if type(valor) is not int:
        return "O campo 'qtd_musicas' deve ser um número inteiro."
    if valor < 0:
        return "O campo 'qtd_musicas' deve ser maior ou igual a 0."
    return None


def _validar_duracao_total_minutos(valor):
    """Valida o campo 'duracao_total_minutos' (deve ser um número maior ou igual a 0)."""
    if isinstance(valor, bool) or not isinstance(valor, (int, float)):
        return "O campo 'duracao_total_minutos' deve ser um número."
    if valor < 0:
        return "O campo 'duracao_total_minutos' deve ser maior ou igual a 0."
    return None


def _validar_nota(valor):
    """Valida o campo 'nota' (deve ser um número decimal entre 0.0 e 10.0)."""
    if isinstance(valor, bool) or not isinstance(valor, (int, float)):
        return "O campo 'nota' deve ser um número decimal entre 0.0 e 10.0."
    if valor < 0.0 or valor > 10.0:
        return "O campo 'nota' deve ser um número decimal entre 0.0 e 10.0."
    return None


def _validar_publica(valor):
    """Valida o campo 'publica' (deve ser do tipo booleano)."""
    if type(valor) is not bool:
        return "O campo 'publica' deve ser do tipo booleano (true ou false)."
    return None


def _validar_campo(campo, valor):
    """Valida um único campo e devolve a mensagem de erro ou None."""
    if campo == "nome":
        return _validar_nome(valor)
    if campo == "qtd_musicas":
        return _validar_qtd_musicas(valor)
    if campo == "duracao_total_minutos":
        return _validar_duracao_total_minutos(valor)
    if campo == "nota":
        return _validar_nota(valor)
    if campo == "publica":
        return _validar_publica(valor)
    return None


def _validar_texto_obrigatorio(valor, nome_campo, tamanho_maximo=200):
    """Valida um campo de texto obrigatório e não vazio."""
    if not isinstance(valor, str):
        return f"O campo '{nome_campo}' deve ser um texto."
    if valor.strip() == "":
        return f"O campo '{nome_campo}' não pode ser vazio ou conter apenas espaços."
    if len(valor) > tamanho_maximo:
        return f"O campo '{nome_campo}' deve ter no máximo {tamanho_maximo} caracteres."
    return None


def _validar_musica(dados):
    """Valida os campos de uma música (titulo, artista, url). Devolve erro ou None."""
    for campo in ("titulo", "artista", "url"):
        if campo not in dados:
            return f"O campo '{campo}' é obrigatório."

    erro = _validar_texto_obrigatorio(dados["titulo"], "titulo")
    if erro is not None:
        return erro

    erro = _validar_texto_obrigatorio(dados["artista"], "artista")
    if erro is not None:
        return erro

    erro = _validar_texto_obrigatorio(dados["url"], "url", tamanho_maximo=2000)
    if erro is not None:
        return erro

    return None


def _ler_corpo_json():
    """
    Lê o corpo da requisição como JSON.

    Devolve (dados, erro). Se der tudo certo, 'dados' é o objeto e 'erro' é None.
    """
    dados = request.get_json(silent=True)
    if dados is None:
        return None, {"erro": "O corpo da requisição deve ser um JSON válido."}
    if not isinstance(dados, dict):
        return None, {"erro": "O corpo da requisição deve ser um objeto JSON."}
    return dados, None


@app.route("/")
def pagina_inicial():
    """GET / -> Serve a tela web que consome a API de playlists."""
    return render_template("index.html")


@app.route("/playlist", methods=["GET"])
def listar_playlists():
    """GET /playlist -> Devolve todas as playlists cadastradas."""
    return jsonify(playlists), 200


@app.route("/playlist/<int:id_playlist>", methods=["GET"])
def buscar_playlist(id_playlist):
    """GET /playlist/<id> -> Devolve uma playlist específica pelo id."""
    playlist = _procurar_playlist_por_id(id_playlist)
    if playlist is None:
        return jsonify({"erro": "Playlist não encontrada."}), 404
    return jsonify(playlist), 200


@app.route("/playlist", methods=["POST"])
def criar_playlist():
    """POST /playlist -> Cadastra uma nova playlist."""
    dados, erro = _ler_corpo_json()
    if erro is not None:
        return jsonify(erro), 400

    # O campo 'nome' é obrigatório no cadastro
    if "nome" not in dados:
        return jsonify({"erro": "O campo 'nome' é obrigatório."}), 400

    # Valida o nome informado
    erro_nome = _validar_nome(dados["nome"])
    if erro_nome is not None:
        return jsonify({"erro": erro_nome}), 400

    # Valida os demais campos, caso tenham sido informados
    for campo in ("qtd_musicas", "duracao_total_minutos", "nota", "publica"):
        if campo in dados:
            erro_campo = _validar_campo(campo, dados[campo])
            if erro_campo is not None:
                return jsonify({"erro": erro_campo}), 400

    # O id é sempre escolhido pelo sistema (sequencial e único)
    global proximo_id
    nova_playlist = {
        "id": proximo_id,
        "nome": dados["nome"],
        "descricao": dados.get("descricao", ""),
        "qtd_musicas": dados.get("qtd_musicas", 0),
        "duracao_total_minutos": dados.get("duracao_total_minutos", 0.0),
        "nota": dados.get("nota", 0.0),
        "publica": dados.get("publica", False),
        "musicas": [],
    }

    playlists.append(nova_playlist)
    proximo_id += 1

    return jsonify(nova_playlist), 201


@app.route("/playlist/<int:id_playlist>", methods=["PUT"])
def atualizar_playlist(id_playlist):
    """PUT /playlist/<id> -> Atualiza os dados de uma playlist existente."""
    playlist = _procurar_playlist_por_id(id_playlist)
    if playlist is None:
        return jsonify({"erro": "Playlist não encontrada."}), 404

    dados, erro = _ler_corpo_json()
    if erro is not None:
        return jsonify(erro), 400

    # O id nunca pode ser alterado por quem está atualizando
    if "id" in dados:
        del dados["id"]

    # 'musicas' é gerenciado pelos endpoints dedicados, não por aqui
    if "musicas" in dados:
        del dados["musicas"]

    # Valida e aplica apenas os campos que vieram no corpo da requisição
    for campo in ("nome", "qtd_musicas", "duracao_total_minutos", "nota", "publica"):
        if campo in dados:
            erro_campo = _validar_campo(campo, dados[campo])
            if erro_campo is not None:
                return jsonify({"erro": erro_campo}), 400
            playlist[campo] = dados[campo]

    # A 'descricao' não tem regra especial: atualiza se vier no corpo
    if "descricao" in dados:
        playlist["descricao"] = dados["descricao"]

    return jsonify(playlist), 200


@app.route("/playlist/<int:id_playlist>", methods=["DELETE"])
def deletar_playlist(id_playlist):
    """DELETE /playlist/<id> -> Remove uma playlist existente pelo id."""
    playlist = _procurar_playlist_por_id(id_playlist)
    if playlist is None:
        return jsonify({"erro": "Playlist não encontrada."}), 404

    playlists.remove(playlist)

    return "", 204


@app.route("/playlist/<int:id_playlist>/musicas", methods=["POST"])
def adicionar_musica(id_playlist):
    """POST /playlist/<id>/musicas -> Adiciona uma música à playlist."""
    playlist = _procurar_playlist_por_id(id_playlist)
    if playlist is None:
        return jsonify({"erro": "Playlist não encontrada."}), 404

    dados, erro = _ler_corpo_json()
    if erro is not None:
        return jsonify(erro), 400

    erro_musica = _validar_musica(dados)
    if erro_musica is not None:
        return jsonify({"erro": erro_musica}), 400

    global proximo_id_musica
    nova_musica = {
        "id": proximo_id_musica,
        "titulo": dados["titulo"],
        "artista": dados["artista"],
        "url": dados["url"],
    }

    playlist["musicas"].append(nova_musica)
    playlist["qtd_musicas"] = len(playlist["musicas"])
    proximo_id_musica += 1

    return jsonify(nova_musica), 201


@app.route("/playlist/<int:id_playlist>/musicas/<int:id_musica>", methods=["DELETE"])
def remover_musica(id_playlist, id_musica):
    """DELETE /playlist/<id>/musicas/<id_musica> -> Remove uma música da playlist."""
    playlist = _procurar_playlist_por_id(id_playlist)
    if playlist is None:
        return jsonify({"erro": "Playlist não encontrada."}), 404

    musica = _procurar_musica_por_id(playlist, id_musica)
    if musica is None:
        return jsonify({"erro": "Música não encontrada."}), 404

    playlist["musicas"].remove(musica)
    playlist["qtd_musicas"] = len(playlist["musicas"])

    return "", 204


if __name__ == "__main__":
    # Rodando a aplicação no modo de desenvolvimento (com debug ativo)
    app.run(debug=True)