// =====================================================
// LUCKTINNMS - MULTIPLAYER
// JOGO DA MEMÓRIA
// =====================================================


// =====================================================
// SUPABASE
// =====================================================

const SUPABASE_URL =
  "https://haycwckorpywbqwgfqbd.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_VV9-XOb5fo5nJT8zKDwM-g_0u5uKE7w";


let supabaseClient = null;


// =====================================================
// VARIÁVEIS
// =====================================================

let meuNome = "";

let salaAtual = "";

let canalSala = null;

let souDono = false;

let jogoIniciado = false;

let primeiraCarta = null;

let segundaCarta = null;

let bloqueado = false;

let pontos = 0;


// =====================================================
// TELAS
// =====================================================

const homeScreen =
  document.getElementById("homeScreen");

const roomScreen =
  document.getElementById("roomScreen");

const gameScreen =
  document.getElementById("gameScreen");


// =====================================================
// ELEMENTOS
// =====================================================

const nameInput =
  document.getElementById("nameInput");

const roomInput =
  document.getElementById("roomInput");

const createRoomBtn =
  document.getElementById("createRoomBtn");

const joinRoomBtn =
  document.getElementById("joinRoomBtn");

const homeMessage =
  document.getElementById("homeMessage");

const roomCode =
  document.getElementById("roomCode");

const roomCodeDisplay =
  document.getElementById("roomCodeDisplay");

const playersList =
  document.getElementById("playersList");

const roomMessage =
  document.getElementById("roomMessage");

const copyCodeBtn =
  document.getElementById("copyCodeBtn");

const startGameBtn =
  document.getElementById("startGameBtn");

const leaveRoomBtn =
  document.getElementById("leaveRoomBtn");

const gameBoard =
  document.getElementById("gameBoard");

const gameRoomCode =
  document.getElementById("gameRoomCode");

const gameMessage =
  document.getElementById("gameMessage");

const backRoomBtn =
  document.getElementById("backRoomBtn");


// =====================================================
// ELEMENTOS DA CAPA
// =====================================================

const playBtn =
  document.getElementById("playBtn");

const createCoverBtn =
  document.getElementById("createCoverBtn");

const menuJogo =
  document.getElementById("menuJogo");

const fecharMenuBtn =
  document.getElementById("fecharMenuBtn");

const fecharMenuBtn2 =
  document.getElementById("fecharMenuBtn2");


// =====================================================
// ABRIR MENU DA CAPA
// =====================================================

function abrirMenuJogo() {

  menuJogo.classList.add("aberto");

  setTimeout(function () {

    if (nameInput) {
      nameInput.focus();
    }

  }, 100);

}


// =====================================================
// FECHAR MENU
// =====================================================

function fecharMenuJogo() {

  menuJogo.classList.remove("aberto");

  mensagemHome("");

}


// =====================================================
// EVENTOS DA CAPA
// =====================================================

playBtn.addEventListener(
  "click",
  abrirMenuJogo
);


createCoverBtn.addEventListener(
  "click",
  abrirMenuJogo
);


fecharMenuBtn.addEventListener(
  "click",
  fecharMenuJogo
);


fecharMenuBtn2.addEventListener(
  "click",
  fecharMenuJogo
);


// =====================================================
// FECHAR CLICANDO FORA DO MENU
// =====================================================

menuJogo.addEventListener(
  "click",
  function (evento) {

    if (
      evento.target === menuJogo
    ) {

      fecharMenuJogo();

    }

  }
);


// =====================================================
// ESC FECHA MENU
// =====================================================

document.addEventListener(
  "keydown",
  function (evento) {

    if (
      evento.key === "Escape" &&
      menuJogo.classList.contains("aberto")
    ) {

      fecharMenuJogo();

    }

  }
);


// =====================================================
// INICIALIZAR SUPABASE
// =====================================================

function iniciarSupabase() {

  if (
    !window.supabase ||
    !window.supabase.createClient
  ) {

    console.error(
      "Supabase ainda não carregou."
    );

    setTimeout(
      iniciarSupabase,
      300
    );

    return;

  }


  supabaseClient =
    window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_KEY
    );


  console.log(
    "Supabase conectado!"
  );

}


// =====================================================
// TROCAR TELA
// =====================================================

function trocarTela(tela) {

  document
    .querySelectorAll(".tela")
    .forEach(
      function (elemento) {

        elemento.classList.remove(
          "ativa"
        );

      }
    );


  tela.classList.add(
    "ativa"
  );


  window.scrollTo(
    0,
    0
  );

}


// =====================================================
// MENSAGENS
// =====================================================

function mensagemHome(texto) {

  homeMessage.textContent =
    texto;

}


function mensagemSala(texto) {

  roomMessage.textContent =
    texto;

}


// =====================================================
// GERAR CÓDIGO
// =====================================================

function gerarCodigo() {

  const caracteres =
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let codigo = "";


  for (
    let i = 0;
    i < 6;
    i++
  ) {

    const numero =
      Math.floor(
        Math.random() *
        caracteres.length
      );


    codigo +=
      caracteres[numero];

  }


  return codigo;

}


// =====================================================
// CRIAR SALA
// =====================================================

async function criarSala() {

  if (!supabaseClient) {

    mensagemHome(
      "Carregando o jogo..."
    );

    return;

  }


  meuNome =
    nameInput.value.trim();


  if (!meuNome) {

    mensagemHome(
      "Digite seu nome primeiro."
    );

    return;

  }


  createRoomBtn.disabled =
    true;


  createRoomBtn.textContent =
    "CRIANDO SALA...";


  try {

    let codigoEncontrado =
      null;


    for (
      let tentativa = 0;
      tentativa < 10;
      tentativa++
    ) {

      const codigo =
        gerarCodigo();


      const resultado =
        await supabaseClient
          .from("salas")
          .insert({
            codigo: codigo
          })
          .select()
          .single();


      if (!resultado.error) {

        codigoEncontrado =
          codigo;

        break;

      }


      console.log(
        resultado.error
      );

    }


    if (!codigoEncontrado) {

      throw new Error(
        "Não foi possível criar a sala."
      );

    }


    salaAtual =
      codigoEncontrado;


    souDono =
      true;


    jogoIniciado =
      false;


    const jogador =
      await supabaseClient
        .from("jogadores")
        .insert({

          sala_codigo:
            salaAtual,

          nome:
            meuNome

        });


    if (jogador.error) {

      throw jogador.error;

    }


    mostrarCodigoSala();


    mensagemSala(
      "👑 Você é o dono. Aguarde seu amigo entrar."
    );


    await conectarRealtime();

    await atualizarJogadores();


    menuJogo.classList.remove(
      "aberto"
    );


    trocarTela(
      roomScreen
    );

  }


  catch (erro) {

    console.error(
      erro
    );


    mensagemHome(
      "Erro: " +
      (erro.message || erro)
    );

  }


  finally {

    createRoomBtn.disabled =
      false;


    createRoomBtn.textContent =
      "🏠 CRIAR SALA";

  }

}


// =====================================================
// ENTRAR NA SALA
// =====================================================

async function entrarSala() {

  if (!supabaseClient) {

    mensagemHome(
      "Carregando o jogo..."
    );

    return;

  }


  meuNome =
    nameInput.value.trim();


  const codigo =
    roomInput.value
      .trim()
      .toUpperCase();


  if (!meuNome) {

    mensagemHome(
      "Digite seu nome primeiro."
    );

    return;

  }


  if (!codigo) {

    mensagemHome(
      "Digite o código da sala."
    );

    return;

  }


  joinRoomBtn.disabled =
    true;


  joinRoomBtn.textContent =
    "ENTRANDO...";


  try {

    const resultado =
      await supabaseClient
        .from("salas")
        .select("*")
        .eq(
          "codigo",
          codigo
        )
        .maybeSingle();


    if (resultado.error) {

      throw resultado.error;

    }


    if (!resultado.data) {

      mensagemHome(
        "Essa sala não existe."
      );

      return;

    }


    salaAtual =
      codigo;


    souDono =
      false;


    jogoIniciado =
      false;


    const jogador =
      await supabaseClient
        .from("jogadores")
        .insert({

          sala_codigo:
            salaAtual,

          nome:
            meuNome

        });


    if (jogador.error) {

      throw jogador.error;

    }


    mostrarCodigoSala();


    mensagemSala(
      "⏳ Aguardando o dono começar o jogo..."
    );


    await conectarRealtime();

    await atualizarJogadores();


    menuJogo.classList.remove(
      "aberto"
    );


    trocarTela(
      roomScreen
    );

  }


  catch (erro) {

    console.error(
      erro
    );


    mensagemHome(
      "Erro: " +
      (erro.message || erro)
    );

  }


  finally {

    joinRoomBtn.disabled =
      false;


    joinRoomBtn.textContent =
      "🚪 ENTRAR NA SALA";

  }

}


// =====================================================
// MOSTRAR CÓDIGO
// =====================================================

function mostrarCodigoSala() {

  roomCode.textContent =
    salaAtual;


  if (roomCodeDisplay) {

    roomCodeDisplay.textContent =
      salaAtual;

  }

}


// =====================================================
// REALTIME
// =====================================================

async function conectarRealtime() {

  if (!supabaseClient) {

    return;

  }


  if (canalSala) {

    await supabaseClient
      .removeChannel(
        canalSala
      );

  }


  canalSala =
    supabaseClient.channel(
      "sala-" +
      salaAtual
    );


  // ===================================================
  // JOGADORES
  // ===================================================

  canalSala.on(

    "postgres_changes",

    {
      event: "*",

      schema: "public",

      table: "jogadores",

      filter:
        "sala_codigo=eq." +
        salaAtual

    },

    function (payload) {

      console.log(
        "Jogadores:",
        payload
      );


      atualizarJogadores();

    }

  );


  // ===================================================
  // COMEÇAR JOGO
  // ===================================================

  canalSala.on(

    "broadcast",

    {
      event:
        "iniciar-jogo"

    },

    function (payload) {

      console.log(
        "🎮 INÍCIO RECEBIDO:",
        payload
      );


      if (
        !jogoIniciado
      ) {

        jogoIniciado =
          true;


        abrirJogo();

      }

    }

  );


  // ===================================================
  // SUBSCRIBE
  // ===================================================

  canalSala.subscribe(
    function (status) {

      console.log(
        "Realtime:",
        status
      );

    }
  );

}


// =====================================================
// ATUALIZAR JOGADORES
// =====================================================

async function atualizarJogadores() {

  if (
    !supabaseClient ||
    !salaAtual
  ) {

    return;

  }


  const resultado =
    await supabaseClient
      .from("jogadores")
      .select("*")
      .eq(
        "sala_codigo",
        salaAtual
      )
      .order(
        "entrou_em",
        {
          ascending:
            true
        }
      );


  if (resultado.error) {

    console.error(
      resultado.error
    );

    return;

  }


  const jogadores =
    resultado.data || [];


  playersList.innerHTML =
    "";


  if (jogadores.length === 0) {

    playersList.innerHTML =
      "<p>Nenhum jogador.</p>";

  }


  jogadores.forEach(
    function (
      jogador,
      indice
    ) {

      const div =
        document.createElement(
          "div"
        );


      div.className =
        "player";


      if (
        indice === 0
      ) {

        div.innerHTML =
          "👑 " +
          jogador.nome;

      }


      else {

        div.innerHTML =
          "🟢 " +
          jogador.nome;

      }


      playersList.appendChild(
        div
      );

    }
  );


  // ===================================================
  // BOTÃO DO DONO
  // ===================================================

  if (souDono) {

    startGameBtn.style.display =
      "block";


    if (
      jogadores.length >= 2
    ) {

      startGameBtn.disabled =
        false;


      startGameBtn.textContent =
        "🎮 COMEÇAR JOGO";

    }


    else {

      startGameBtn.disabled =
        true;


      startGameBtn.textContent =
        "AGUARDANDO JOGADOR...";

    }

  }


  else {

    startGameBtn.style.display =
      "none";

  }


  // ===================================================
  // MENSAGEM
  // ===================================================

  if (
    jogadores.length < 2
  ) {

    if (souDono) {

      mensagemSala(
        "👑 Você é o dono. Aguarde outro jogador."
      );

    }


    else {

      mensagemSala(
        "⏳ Aguardando outro jogador..."
      );

    }

  }


  else {

    if (souDono) {

      mensagemSala(
        "🎮 Todos estão prontos! Clique em COMEÇAR JOGO."
      );

    }


    else {

      mensagemSala(
        "⏳ Aguardando o dono começar o jogo..."
      );

    }

  }

}


// =====================================================
// DONO COMEÇA
// =====================================================

startGameBtn.addEventListener(
  "click",
  async function () {

    if (!souDono) {

      return;

    }


    if (!canalSala) {

      mensagemSala(
        "Conectando ao servidor..."
      );

      return;

    }


    const resultado =
      await supabaseClient
        .from("jogadores")
        .select("id")
        .eq(
          "sala_codigo",
          salaAtual
        );


    if (resultado.error) {

      console.error(
        resultado.error
      );

      return;

    }


    if (
      !resultado.data ||
      resultado.data.length < 2
    ) {

      mensagemSala(
        "É necessário ter pelo menos 2 jogadores."
      );

      return;

    }


    startGameBtn.disabled =
      true;


    startGameBtn.textContent =
      "🎮 COMEÇANDO...";


    mensagemSala(
      "🎮 Começando o jogo!"
    );


    // =================================================
    // ENVIA PARA TODOS
    // =================================================

    const resposta =
      await canalSala.send({

        type:
          "broadcast",

        event:
          "iniciar-jogo",

        payload: {

          sala:
            salaAtual,

          iniciadoPor:
            meuNome,

          horario:
            Date.now()

        }

      });


    console.log(
      "Broadcast:",
      resposta
    );


    // Dono também começa

    jogoIniciado =
      true;


    abrirJogo();

  }
);


// =====================================================
// ABRIR JOGO
// =====================================================

function abrirJogo() {

  if (!salaAtual) {

    return;

  }


  if (
    gameScreen.classList.contains(
      "ativa"
    )
  ) {

    return;

  }


  gameRoomCode.textContent =
    "Sala: " +
    salaAtual;


  gameMessage.textContent =
    "Encontre os pares!";


  criarTabuleiro();


  trocarTela(
    gameScreen
  );

}


// =====================================================
// COPIAR CÓDIGO
// =====================================================

copyCodeBtn.addEventListener(
  "click",
  async function () {

    try {

      await navigator.clipboard.writeText(
        salaAtual
      );


      mensagemSala(
        "✅ Código copiado!"
      );

    }


    catch (erro) {

      mensagemSala(
        "Código: " +
        salaAtual
      );

    }

  }
);


// =====================================================
// TABULEIRO
// =====================================================

function criarTabuleiro() {

  gameBoard.innerHTML =
    "";


  primeiraCarta =
    null;


  segundaCarta =
    null;


  bloqueado =
    false;


  pontos =
    0;


  const simbolos = [

    "🍎",
    "🍎",

    "🍌",
    "🍌",

    "🍕",
    "🍕",

    "⚽",
    "⚽",

    "🚗",
    "🚗",

    "🚀",
    "🚀",

    "🎮",
    "🎮",

    "🐱",
    "🐱"

  ];


  // Embaralhar

  simbolos.sort(
    function () {

      return Math.random() - 0.5;

    }
  );


  simbolos.forEach(
    function (simbolo) {

      const carta =
        document.createElement(
          "button"
        );


      carta.type =
        "button";


      carta.className =
        "memoryCard";


      carta.textContent =
        "?";


      carta.dataset.simbolo =
        simbolo;


      carta.setAttribute(
        "aria-label",
        "Carta fechada"
      );


      carta.addEventListener(
        "click",
        function () {

          virarCarta(
            carta
          );

        }
      );


      gameBoard.appendChild(
        carta
      );

    }
  );

}


// =====================================================
// VIRAR CARTA
// =====================================================

function virarCarta(carta) {

  if (bloqueado) {

    return;

  }


  if (
    carta.classList.contains(
      "aberta"
    )
  ) {

    return;

  }


  if (
    carta.classList.contains(
      "encontrada"
    )
  ) {

    return;

  }


  carta.textContent =
    carta.dataset.simbolo;


  carta.classList.add(
    "aberta"
  );


  carta.setAttribute(
    "aria-label",
    "Carta aberta"
  );


  if (!primeiraCarta) {

    primeiraCarta =
      carta;

    return;

  }


  segundaCarta =
    carta;


  verificarPar();

}


// =====================================================
// VERIFICAR PAR
// =====================================================

function verificarPar() {

  bloqueado =
    true;


  if (
    primeiraCarta.dataset.simbolo ===
    segundaCarta.dataset.simbolo
  ) {

    primeiraCarta.classList.add(
      "encontrada"
    );


    segundaCarta.classList.add(
      "encontrada"
    );


    pontos++;


    primeiraCarta =
      null;


    segundaCarta =
      null;


    bloqueado =
      false;


    gameMessage.textContent =
      "🎉 Par encontrado!";


    const encontradas =
      document.querySelectorAll(
        ".memoryCard.encontrada"
      );


    if (
      encontradas.length === 16
    ) {

      gameMessage.textContent =
        "🏆 Você encontrou todos os pares!";

    }

  }


  else {

    gameMessage.textContent =
      "❌ Não foi par!";


    setTimeout(
      function () {

        if (
          primeiraCarta &&
          segundaCarta
        ) {

          primeiraCarta.textContent =
            "?";


          segundaCarta.textContent =
            "?";


          primeiraCarta.classList.remove(
            "aberta"
          );


          segundaCarta.classList.remove(
            "aberta"
          );


          primeiraCarta.setAttribute(
            "aria-label",
            "Carta fechada"
          );


          segundaCarta.setAttribute(
            "aria-label",
            "Carta fechada"
          );

        }


        primeiraCarta =
          null;


        segundaCarta =
          null;


        bloqueado =
          false;


        gameMessage.textContent =
          "Encontre os pares!";

      },
      900
    );

  }

}


// =====================================================
// SAIR DA SALA
// =====================================================

leaveRoomBtn.addEventListener(
  "click",
  async function () {

    try {

      if (canalSala) {

        await supabaseClient
          .removeChannel(
            canalSala
          );

        canalSala =
          null;

      }


      if (
        salaAtual &&
        meuNome
      ) {

        await supabaseClient
          .from("jogadores")
          .delete()
          .eq(
            "sala_codigo",
            salaAtual
          )
          .eq(
            "nome",
            meuNome
          );

      }

    }


    catch (erro) {

      console.error(
        erro
      );

    }


    salaAtual =
      "";

    meuNome =
      "";

    souDono =
      false;

    jogoIniciado =
      false;


    roomCode.textContent =
      "------";


    roomCodeDisplay.textContent =
      "------";


    playersList.innerHTML =
      "<p>Aguardando jogadores...</p>";


    nameInput.value =
      "";

    roomInput.value =
      "";


    trocarTela(
      homeScreen
    );

  }
);


// =====================================================
// VOLTAR PARA SALA
// =====================================================

backRoomBtn.addEventListener(
  "click",
  function () {

    trocarTela(
      roomScreen
    );

  }
);


// =====================================================
// BOTÕES
// =====================================================

createRoomBtn.addEventListener(
  "click",
  criarSala
);


joinRoomBtn.addEventListener(
  "click",
  entrarSala
);


// =====================================================
// ENTER NO NOME
// =====================================================

nameInput.addEventListener(
  "keydown",
  function (evento) {

    if (
      evento.key ===
      "Enter"
    ) {

      criarSala();

    }

  }
);


// =====================================================
// ENTER NO CÓDIGO
// =====================================================

roomInput.addEventListener(
  "keydown",
  function (evento) {

    if (
      evento.key ===
      "Enter"
    ) {

      entrarSala();

    }

  }
);


// =====================================================
// DEIXAR CÓDIGO DA SALA SEMPRE MAIÚSCULO
// =====================================================

roomInput.addEventListener(
  "input",
  function () {

    roomInput.value =
      roomInput.value
        .toUpperCase()
        .replace(
          /[^A-Z0-9]/g,
          ""
        )
        .slice(
          0,
          6
        );

  }
);


// =====================================================
// INICIAR
// =====================================================

trocarTela(
  homeScreen
);


iniciarSupabase();


console.log(
  "🎮 LUCKTINNMS carregado!"
);