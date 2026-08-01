(() => {
  "use strict";

  /* ============================================================
     Estado da aplicação
     ============================================================ */
  const estado = {
    playlists: [],
    playlistAtual: null,      // objeto da playlist aberta na visão de detalhe
    musicaTocandoId: null,    // id da música tocando no momento
    playlistTocandoId: null,  // id da playlist dona da música tocando
    tocando: false,
    modoFonteAudio: "url",    // "url" | "arquivo"
    arquivoLocalUrl: null,    // object URL do arquivo escolhido
    aoConfirmar: null,        // callback usado pelo modal de confirmação genérico
    editandoPlaylistId: null, // se != null, o formPlaylist está em modo edição
  };

  /* ============================================================
     Referências de elementos
     ============================================================ */
  const el = (id) => document.getElementById(id);

  const viewGrade = el("viewGrade");
  const viewDetalhe = el("viewDetalhe");
  const gradePlaylists = el("gradePlaylists");
  const estadoCarregando = el("estadoCarregando");
  const estadoErro = el("estadoErro");
  const estadoErroDetalhe = el("estadoErroDetalhe");
  const estadoVazio = el("estadoVazio");

  const modalPlaylistBackdrop = el("modalPlaylistBackdrop");
  const formPlaylist = el("formPlaylist");
  const inputNome = el("inputNome");
  const inputDescricao = el("inputDescricao");
  const inputPublica = el("inputPublica");
  const erroNome = el("erroNome");
  const modalPlaylistTitulo = el("modalPlaylistTitulo");
  const salvarModalPlaylist = el("salvarModalPlaylist");

  const modalMusicaBackdrop = el("modalMusicaBackdrop");
  const formMusica = el("formMusica");
  const inputTitulo = el("inputTitulo");
  const inputArtista = el("inputArtista");
  const inputUrl = el("inputUrl");
  const inputArquivo = el("inputArquivo");
  const erroTitulo = el("erroTitulo");
  const erroArtista = el("erroArtista");
  const erroUrl = el("erroUrl");
  const erroArquivo = el("erroArquivo");
  const blocoUrl = el("blocoUrl");
  const blocoArquivo = el("blocoArquivo");
  const tabUrl = el("tabUrl");
  const tabArquivo = el("tabArquivo");

  const modalConfirmarBackdrop = el("modalConfirmarBackdrop");
  const confirmarTitulo = el("confirmarTitulo");
  const confirmarTexto = el("confirmarTexto");
  const confirmarConfirmar = el("confirmarConfirmar");

  const detalheNome = el("detalheNome");
  const detalheDescricao = el("detalheDescricao");
  const detalheMeta = el("detalheMeta");
  const detalheVisibilidade = el("detalheVisibilidade");
  const capaDetalhe = el("capaDetalhe");
  const listaMusicas = el("listaMusicas");
  const detalheEstadoVazio = el("detalheEstadoVazio");

  const player = el("player");
  const audioEl = el("audioEl");
  const playerTitulo = el("playerTitulo");
  const playerArtista = el("playerArtista");
  const btnPlayPause = el("btnPlayPause");
  const iconePlay = el("iconePlay");
  const iconePause = el("iconePause");
  const eqAnim = el("eqAnim");
  const ondaProgresso = el("ondaProgresso");
  const tempoAtual = el("tempoAtual");
  const tempoTotal = el("tempoTotal");
  const volumeSlider = el("volumeSlider");

  const toastStack = el("toastStack");

  /* ============================================================
     Utilidades
     ============================================================ */

  function mostrarToast(mensagem, tipo = "info") {
    const toast = document.createElement("div");
    toast.className = `toast ${tipo === "erro" ? "erro" : tipo === "sucesso" ? "sucesso" : ""}`;
    toast.innerHTML = `<span class="toast-msg"></span><button class="toast-fechar" aria-label="Fechar aviso">✕</button>`;
    toast.querySelector(".toast-msg").textContent = mensagem;
    toast.querySelector(".toast-fechar").addEventListener("click", () => toast.remove());
    toastStack.appendChild(toast);
    setTimeout(() => toast.remove(), 5500);
  }

  function formatarDuracao(minutosDecimais) {
    const totalSegundos = Math.round((minutosDecimais || 0) * 60);
    const min = Math.floor(totalSegundos / 60);
    const seg = totalSegundos % 60;
    return `${min}:${String(seg).padStart(2, "0")}`;
  }

  function formatarTempo(segundos) {
    if (!isFinite(segundos) || segundos < 0) segundos = 0;
    const min = Math.floor(segundos / 60);
    const seg = Math.floor(segundos % 60);
    return `${min}:${String(seg).padStart(2, "0")}`;
  }

  // Gera um gradiente determinístico (baseado no id) para a capa das playlists
  function gradientePorId(id) {
    const paletas = [
      ["#F2B84B", "#C9862C"],
      ["#8B6BF0", "#4A3A8F"],
      ["#59D18C", "#217A4E"],
      ["#F2618B", "#8B2B4E"],
      ["#4BB8F2", "#2C6FC9"],
      ["#F2A54B", "#8F5A1E"],
    ];
    const paleta = paletas[id % paletas.length];
    return `linear-gradient(135deg, ${paleta[0]}, ${paleta[1]})`;
  }

  function escaparHtml(texto) {
    const div = document.createElement("div");
    div.textContent = texto ?? "";
    return div.innerHTML;
  }

  async function chamarApi(caminho, opcoes = {}) {
    let resposta;
    try {
      resposta = await fetch(caminho, {
        headers: { "Content-Type": "application/json" },
        ...opcoes,
      });
    } catch (erroRede) {
      throw new Error("Não foi possível conectar ao servidor. Verifique se a aplicação Flask está em execução.");
    }

    let corpo = null;
    const temConteudo = resposta.status !== 204;
    if (temConteudo) {
      try {
        corpo = await resposta.json();
      } catch (erroParse) {
        corpo = null;
      }
    }

    if (!resposta.ok) {
      const mensagem = (corpo && corpo.erro) || `Erro inesperado do servidor (${resposta.status}).`;
      throw new Error(mensagem);
    }

    return corpo;
  }

  /* ============================================================
     Modal de confirmação genérico
     ============================================================ */
  function pedirConfirmacao({ titulo, texto, textoBotao = "Excluir", aoConfirmar }) {
    confirmarTitulo.textContent = titulo;
    confirmarTexto.textContent = texto;
    confirmarConfirmar.textContent = textoBotao;
    estado.aoConfirmar = aoConfirmar;
    modalConfirmarBackdrop.hidden = false;
  }

  el("cancelarConfirmar").addEventListener("click", () => {
    modalConfirmarBackdrop.hidden = true;
    estado.aoConfirmar = null;
  });
  modalConfirmarBackdrop.addEventListener("click", (evento) => {
    if (evento.target === modalConfirmarBackdrop) {
      modalConfirmarBackdrop.hidden = true;
      estado.aoConfirmar = null;
    }
  });
  confirmarConfirmar.addEventListener("click", async () => {
    const callback = estado.aoConfirmar;
    modalConfirmarBackdrop.hidden = true;
    estado.aoConfirmar = null;
    if (callback) await callback();
  });

  /* ============================================================
     Carregar e renderizar playlists (visão em grade)
     ============================================================ */
  async function carregarPlaylists() {
    estadoErro.hidden = true;
    estadoVazio.hidden = true;
    gradePlaylists.hidden = true;
    estadoCarregando.hidden = false;

    try {
      const dados = await chamarApi("/playlist");
      estado.playlists = dados || [];
      renderizarGrade();
    } catch (erro) {
      estadoErroDetalhe.textContent = erro.message;
      estadoErro.hidden = false;
    } finally {
      estadoCarregando.hidden = true;
    }
  }

  function renderizarGrade() {
    gradePlaylists.innerHTML = "";

    if (estado.playlists.length === 0) {
      estadoVazio.hidden = false;
      gradePlaylists.hidden = true;
      return;
    }
    estadoVazio.hidden = true;
    gradePlaylists.hidden = false;

    for (const playlist of estado.playlists) {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "card-playlist";
      card.setAttribute("aria-label", `Abrir playlist ${playlist.nome}`);
      card.innerHTML = `
        <div class="card-acoes-rapidas">
          <button type="button" class="btn-icone acao-editar" title="Editar" aria-label="Editar playlist">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M11.3 2.3a1.5 1.5 0 0 1 2.1 2.1L5 12.8l-2.9.6.6-2.9z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>
          </button>
          <button type="button" class="btn-icone acao-deletar" title="Excluir" aria-label="Excluir playlist">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 4.5h10M6.5 4.5v-1a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1M6.5 7.5v4M9.5 7.5v4M4 4.5l.6 8a1 1 0 0 0 1 .9h4.8a1 1 0 0 0 1-.9l.6-8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>
        <div class="capa" style="background:${gradientePorId(playlist.id)}">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none"><path d="M9 18V5l12-2v13" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="6" cy="18" r="3" stroke="currentColor" stroke-width="1.6"/><circle cx="18" cy="16" r="3" stroke="currentColor" stroke-width="1.6"/></svg>
          <span class="capa-play" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M4 2.5v11l9-5.5z"/></svg>
          </span>
        </div>
        <div class="card-corpo">
          <p class="card-nome"></p>
          <p class="card-descricao"></p>
          <div class="card-rodape">
            <span class="card-meta"></span>
            ${playlist.publica ? '<span class="tag-publica">Pública</span>' : ""}
          </div>
        </div>
      `;
      card.querySelector(".card-nome").textContent = playlist.nome;
      card.querySelector(".card-descricao").textContent = playlist.descricao || "Sem descrição";
      card.querySelector(".card-meta").textContent =
        `${playlist.qtd_musicas ?? playlist.musicas?.length ?? 0} música(s)`;

      card.addEventListener("click", () => abrirDetalhe(playlist.id));

      card.querySelector(".acao-editar").addEventListener("click", (evento) => {
        evento.stopPropagation();
        abrirModalPlaylist(playlist);
      });

      card.querySelector(".acao-deletar").addEventListener("click", (evento) => {
        evento.stopPropagation();
        pedirConfirmacao({
          titulo: "Excluir playlist",
          texto: `Tem certeza que deseja excluir "${playlist.nome}"? Essa ação não pode ser desfeita.`,
          aoConfirmar: () => excluirPlaylist(playlist.id),
        });
      });

      card.querySelector(".capa-play").addEventListener("click", (evento) => {
        evento.stopPropagation();
        const primeira = playlist.musicas && playlist.musicas[0];
        if (!primeira) {
          mostrarToast("Essa playlist ainda não tem músicas para tocar.", "erro");
          return;
        }
        tocarMusica(primeira, playlist);
      });

      gradePlaylists.appendChild(card);
    }
  }

  async function excluirPlaylist(id) {
    try {
      await chamarApi(`/playlist/${id}`, { method: "DELETE" });
      if (estado.playlistTocandoId === id) pararReproducao();
      mostrarToast("Playlist excluída.", "sucesso");
      if (estado.playlistAtual && estado.playlistAtual.id === id) {
        mostrarGrade();
      }
      await carregarPlaylists();
    } catch (erro) {
      mostrarToast(erro.message, "erro");
    }
  }

  /* ============================================================
     Navegação entre visões
     ============================================================ */
  function mostrarGrade() {
    estado.playlistAtual = null;
    viewDetalhe.hidden = true;
    viewGrade.hidden = false;
  }

  async function abrirDetalhe(id) {
    try {
      const playlist = await chamarApi(`/playlist/${id}`);
      estado.playlistAtual = playlist;
      viewGrade.hidden = true;
      viewDetalhe.hidden = false;
      renderizarDetalhe();
    } catch (erro) {
      mostrarToast(erro.message, "erro");
    }
  }

  function renderizarDetalhe() {
    const playlist = estado.playlistAtual;
    detalheNome.textContent = playlist.nome;
    detalheDescricao.textContent = playlist.descricao || "";
    detalheDescricao.hidden = !playlist.descricao;
    detalheVisibilidade.textContent = playlist.publica ? "Playlist pública" : "Playlist privada";
    capaDetalhe.style.background = gradientePorId(playlist.id);

    const musicas = playlist.musicas || [];
    const duracaoTotal = playlist.duracao_total_minutos
      ? `${formatarDuracao(playlist.duracao_total_minutos)} de duração cadastrada · `
      : "";
    detalheMeta.textContent = `${duracaoTotal}${musicas.length} música(s)`;

    listaMusicas.innerHTML = "";

    if (musicas.length === 0) {
      detalheEstadoVazio.hidden = false;
      return;
    }
    detalheEstadoVazio.hidden = true;

    musicas.forEach((musica, indice) => {
      const item = document.createElement("li");
      const tocandoAgora = estado.musicaTocandoId === musica.id && estado.playlistTocandoId === playlist.id;
      item.className = `item-musica${tocandoAgora ? " is-tocando" : ""}`;
      item.innerHTML = `
        <span class="indice">
          <span class="numero">${indice + 1}</span>
          <span class="icone-play-hover">
            ${
              tocandoAgora && estado.tocando
                ? '<span class="item-eq"><span></span><span></span><span></span></span>'
                : '<svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M4 2.5v11l9-5.5z"/></svg>'
            }
          </span>
        </span>
        <span class="item-info">
          <span class="item-titulo"></span>
          <span class="item-artista"></span>
        </span>
        <span></span>
        <button type="button" class="btn-icone item-remover" title="Remover música" aria-label="Remover música">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 4.5h10M6.5 4.5v-1a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1M6.5 7.5v4M9.5 7.5v4M4 4.5l.6 8a1 1 0 0 0 1 .9h4.8a1 1 0 0 0 1-.9l.6-8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      `;
      item.querySelector(".item-titulo").textContent = musica.titulo;
      item.querySelector(".item-artista").textContent = musica.artista;

      item.addEventListener("click", (evento) => {
        if (evento.target.closest(".item-remover")) return;
        if (tocandoAgora) {
          alternarPlayPause();
        } else {
          tocarMusica(musica, playlist);
        }
      });

      item.querySelector(".item-remover").addEventListener("click", (evento) => {
        evento.stopPropagation();
        pedirConfirmacao({
          titulo: "Remover música",
          texto: `Remover "${musica.titulo}" desta playlist?`,
          textoBotao: "Remover",
          aoConfirmar: () => removerMusica(playlist.id, musica.id),
        });
      });

      listaMusicas.appendChild(item);
    });
  }

  async function removerMusica(idPlaylist, idMusica) {
    try {
      await chamarApi(`/playlist/${idPlaylist}/musicas/${idMusica}`, { method: "DELETE" });
      if (estado.musicaTocandoId === idMusica) pararReproducao();
      mostrarToast("Música removida.", "sucesso");
      const playlistAtualizada = await chamarApi(`/playlist/${idPlaylist}`);
      estado.playlistAtual = playlistAtualizada;
      renderizarDetalhe();
      const idxNaLista = estado.playlists.findIndex((p) => p.id === idPlaylist);
      if (idxNaLista >= 0) estado.playlists[idxNaLista] = playlistAtualizada;
    } catch (erro) {
      mostrarToast(erro.message, "erro");
    }
  }

  el("btnVoltar").addEventListener("click", mostrarGrade);

  /* ============================================================
     Modal: criar / editar playlist
     ============================================================ */
  function abrirModalPlaylist(playlistParaEditar = null) {
    formPlaylist.reset();
    erroNome.textContent = "";
    inputNome.classList.remove("is-invalido");

    if (playlistParaEditar) {
      estado.editandoPlaylistId = playlistParaEditar.id;
      modalPlaylistTitulo.textContent = "Editar playlist";
      salvarModalPlaylist.textContent = "Salvar alterações";
      inputNome.value = playlistParaEditar.nome;
      inputDescricao.value = playlistParaEditar.descricao || "";
      inputPublica.checked = !!playlistParaEditar.publica;
    } else {
      estado.editandoPlaylistId = null;
      modalPlaylistTitulo.textContent = "Nova playlist";
      salvarModalPlaylist.textContent = "Criar playlist";
    }

    modalPlaylistBackdrop.hidden = false;
    setTimeout(() => inputNome.focus(), 0);
  }

  function fecharModalPlaylist() {
    modalPlaylistBackdrop.hidden = true;
  }

  el("btnNovaPlaylist").addEventListener("click", () => abrirModalPlaylist());
  el("btnCriarPrimeira").addEventListener("click", () => abrirModalPlaylist());
  el("btnEditarPlaylist").addEventListener("click", () => abrirModalPlaylist(estado.playlistAtual));
  el("fecharModalPlaylist").addEventListener("click", fecharModalPlaylist);
  el("cancelarModalPlaylist").addEventListener("click", fecharModalPlaylist);
  modalPlaylistBackdrop.addEventListener("click", (evento) => {
    if (evento.target === modalPlaylistBackdrop) fecharModalPlaylist();
  });

  el("btnDeletarPlaylist").addEventListener("click", () => {
    const playlist = estado.playlistAtual;
    pedirConfirmacao({
      titulo: "Excluir playlist",
      texto: `Tem certeza que deseja excluir "${playlist.nome}"? Essa ação não pode ser desfeita.`,
      aoConfirmar: () => excluirPlaylist(playlist.id),
    });
  });

  el("btnTentarNovamente").addEventListener("click", carregarPlaylists);

  formPlaylist.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const nome = inputNome.value.trim();
    erroNome.textContent = "";
    inputNome.classList.remove("is-invalido");

    if (nome === "") {
      erroNome.textContent = "O nome não pode ficar em branco.";
      inputNome.classList.add("is-invalido");
      inputNome.focus();
      return;
    }
    if (nome.length > 100) {
      erroNome.textContent = "O nome deve ter no máximo 100 caracteres.";
      inputNome.classList.add("is-invalido");
      return;
    }

    const corpo = {
      nome,
      descricao: inputDescricao.value.trim(),
      publica: inputPublica.checked,
    };

    salvarModalPlaylist.disabled = true;
    const textoOriginal = salvarModalPlaylist.textContent;
    salvarModalPlaylist.textContent = "Salvando…";

    try {
      if (estado.editandoPlaylistId) {
        const atualizada = await chamarApi(`/playlist/${estado.editandoPlaylistId}`, {
          method: "PUT",
          body: JSON.stringify(corpo),
        });
        mostrarToast("Playlist atualizada.", "sucesso");
        if (estado.playlistAtual && estado.playlistAtual.id === atualizada.id) {
          estado.playlistAtual = atualizada;
          renderizarDetalhe();
        }
      } else {
        await chamarApi("/playlist", { method: "POST", body: JSON.stringify(corpo) });
        mostrarToast("Playlist criada.", "sucesso");
      }
      fecharModalPlaylist();
      await carregarPlaylists();
    } catch (erro) {
      erroNome.textContent = erro.message;
      inputNome.classList.add("is-invalido");
    } finally {
      salvarModalPlaylist.disabled = false;
      salvarModalPlaylist.textContent = textoOriginal;
    }
  });

  /* ============================================================
     Modal: adicionar música
     ============================================================ */
  function alternarModoFonte(modo) {
    estado.modoFonteAudio = modo;
    const eUrl = modo === "url";
    tabUrl.classList.toggle("is-ativo", eUrl);
    tabArquivo.classList.toggle("is-ativo", !eUrl);
    blocoUrl.hidden = !eUrl;
    blocoArquivo.hidden = eUrl;
  }
  tabUrl.addEventListener("click", () => alternarModoFonte("url"));
  tabArquivo.addEventListener("click", () => alternarModoFonte("arquivo"));

  function abrirModalMusica() {
    formMusica.reset();
    [erroTitulo, erroArtista, erroUrl, erroArquivo].forEach((n) => (n.textContent = ""));
    [inputTitulo, inputArtista, inputUrl].forEach((n) => n.classList.remove("is-invalido"));
    alternarModoFonte("url");
    estado.arquivoLocalUrl = null;
    modalMusicaBackdrop.hidden = false;
    setTimeout(() => inputTitulo.focus(), 0);
  }
  function fecharModalMusica() {
    modalMusicaBackdrop.hidden = true;
  }

  el("btnAdicionarMusica").addEventListener("click", abrirModalMusica);
  el("fecharModalMusica").addEventListener("click", fecharModalMusica);
  el("cancelarModalMusica").addEventListener("click", fecharModalMusica);
  modalMusicaBackdrop.addEventListener("click", (evento) => {
    if (evento.target === modalMusicaBackdrop) fecharModalMusica();
  });

  formMusica.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const titulo = inputTitulo.value.trim();
    const artista = inputArtista.value.trim();
    let url = inputUrl.value.trim();

    [erroTitulo, erroArtista, erroUrl, erroArquivo].forEach((n) => (n.textContent = ""));
    [inputTitulo, inputArtista, inputUrl].forEach((n) => n.classList.remove("is-invalido"));

    let valido = true;
    if (titulo === "") {
      erroTitulo.textContent = "Informe o título da música.";
      inputTitulo.classList.add("is-invalido");
      valido = false;
    }
    if (artista === "") {
      erroArtista.textContent = "Informe o nome do artista.";
      inputArtista.classList.add("is-invalido");
      valido = false;
    }

    if (estado.modoFonteAudio === "url") {
      if (url === "") {
        erroUrl.textContent = "Informe a URL do áudio.";
        inputUrl.classList.add("is-invalido");
        valido = false;
      }
    } else {
      const arquivo = inputArquivo.files[0];
      if (!arquivo) {
        erroArquivo.textContent = "Selecione um arquivo de áudio.";
        valido = false;
      } else {
        url = URL.createObjectURL(arquivo);
      }
    }

    if (!valido) return;

    const botao = el("salvarModalMusica");
    botao.disabled = true;
    const textoOriginal = botao.textContent;
    botao.textContent = "Adicionando…";

    try {
      const playlistId = estado.playlistAtual.id;
      await chamarApi(`/playlist/${playlistId}/musicas`, {
        method: "POST",
        body: JSON.stringify({ titulo, artista, url }),
      });
      mostrarToast("Música adicionada.", "sucesso");
      fecharModalMusica();

      const playlistAtualizada = await chamarApi(`/playlist/${playlistId}`);
      estado.playlistAtual = playlistAtualizada;
      renderizarDetalhe();
      const idxNaLista = estado.playlists.findIndex((p) => p.id === playlistId);
      if (idxNaLista >= 0) estado.playlists[idxNaLista] = playlistAtualizada;
    } catch (erro) {
      erroUrl.textContent = erro.message;
      mostrarToast(erro.message, "erro");
    } finally {
      botao.disabled = false;
      botao.textContent = textoOriginal;
    }
  });

  /* ============================================================
     Player de áudio — elemento assinatura: barra em "forma de onda"
     ============================================================ */
  const QTD_BARRAS = 56;
  (function montarOnda() {
    for (let i = 0; i < QTD_BARRAS; i++) {
      const barra = document.createElement("div");
      barra.className = "barra";
      // Alturas pseudo-aleatórias, mas determinísticas, para simular uma forma de onda
      const altura = 25 + Math.round(Math.abs(Math.sin(i * 12.9898)) * 65);
      barra.style.height = `${altura}%`;
      ondaProgresso.appendChild(barra);
    }
  })();

  function atualizarOnda(progressoFrac) {
    const barras = ondaProgresso.children;
    const preenchidas = Math.round(progressoFrac * barras.length);
    for (let i = 0; i < barras.length; i++) {
      barras[i].classList.toggle("is-preenchida", i < preenchidas);
    }
  }

  ondaProgresso.addEventListener("click", (evento) => {
    if (!audioEl.duration) return;
    const retangulo = ondaProgresso.getBoundingClientRect();
    const frac = Math.min(1, Math.max(0, (evento.clientX - retangulo.left) / retangulo.width));
    audioEl.currentTime = frac * audioEl.duration;
  });

  function tocarMusica(musica, playlist) {
    const trocandoFaixa = estado.musicaTocandoId !== musica.id || estado.playlistTocandoId !== playlist.id;

    if (trocandoFaixa) {
      audioEl.src = musica.url;
      estado.musicaTocandoId = musica.id;
      estado.playlistTocandoId = playlist.id;
      playerTitulo.textContent = musica.titulo;
      playerArtista.textContent = musica.artista;
      player.hidden = false;
    }

    audioEl.play().catch(() => {
      mostrarToast("Não foi possível reproduzir este áudio. Verifique a URL/arquivo informado.", "erro");
      estado.tocando = false;
      atualizarEstadoBotaoPlay();
    });
  }

  function alternarPlayPause() {
    if (!estado.musicaTocandoId) return;
    if (audioEl.paused) {
      audioEl.play().catch(() => mostrarToast("Não foi possível reproduzir este áudio.", "erro"));
    } else {
      audioEl.pause();
    }
  }

  function pararReproducao() {
    audioEl.pause();
    audioEl.removeAttribute("src");
    estado.musicaTocandoId = null;
    estado.playlistTocandoId = null;
    estado.tocando = false;
    player.hidden = true;
  }

  function atualizarEstadoBotaoPlay() {
    iconePlay.hidden = estado.tocando;
    iconePause.hidden = !estado.tocando;
    btnPlayPause.setAttribute("aria-label", estado.tocando ? "Pausar" : "Tocar");
    eqAnim.classList.toggle("pausado", !estado.tocando);
    if (estado.playlistAtual && estado.playlistTocandoId === estado.playlistAtual.id) {
      renderizarDetalhe();
    }
  }

  btnPlayPause.addEventListener("click", alternarPlayPause);

  audioEl.addEventListener("play", () => {
    estado.tocando = true;
    atualizarEstadoBotaoPlay();
  });
  audioEl.addEventListener("pause", () => {
    estado.tocando = false;
    atualizarEstadoBotaoPlay();
  });
  audioEl.addEventListener("ended", () => {
    estado.tocando = false;
    atualizarOnda(0);
    tempoAtual.textContent = "0:00";
    atualizarEstadoBotaoPlay();
  });
  audioEl.addEventListener("timeupdate", () => {
    if (!audioEl.duration) return;
    tempoAtual.textContent = formatarTempo(audioEl.currentTime);
    atualizarOnda(audioEl.currentTime / audioEl.duration);
  });
  audioEl.addEventListener("loadedmetadata", () => {
    tempoTotal.textContent = formatarTempo(audioEl.duration);
  });
  audioEl.addEventListener("error", () => {
    if (estado.musicaTocandoId) {
      mostrarToast("Erro ao carregar este áudio. Verifique a URL/arquivo.", "erro");
    }
  });

  volumeSlider.addEventListener("input", () => {
    audioEl.volume = Number(volumeSlider.value) / 100;
  });
  audioEl.volume = Number(volumeSlider.value) / 100;

  /* ============================================================
     Atalhos de teclado (fechar modais com Esc)
     ============================================================ */
  document.addEventListener("keydown", (evento) => {
    if (evento.key !== "Escape") return;
    if (!modalMusicaBackdrop.hidden) fecharModalMusica();
    else if (!modalPlaylistBackdrop.hidden) fecharModalPlaylist();
    else if (!modalConfirmarBackdrop.hidden) {
      modalConfirmarBackdrop.hidden = true;
      estado.aoConfirmar = null;
    }
  });

  /* ============================================================
     Inicialização
     ============================================================ */
  carregarPlaylists();
})();