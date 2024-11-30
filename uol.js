const UUID = "3d0a6d3f-8184-4560-bb28-aa0afd571d28";
let integrantes = [];
let nomeIntegrante = "";
let mensagens = "";
let ultimaMensagem = "";
let contatoSelecionado = "Todos";
let visibilidadeMensagem = "Público";


function acessarMenu() {
    document.querySelector(".menu-lateral").classList.remove("escondido");
    document.querySelector(".fundo-escuro").classList.remove("escondido");

}

function retornarBatePapo() {
    document.querySelector(".menu-lateral").classList.add("escondido");
    document.querySelector(".fundo-escuro").classList.add("escondido");
}

function selecionarContato(elemento) {
    contatoSelecionado = elemento.querySelector(".descrição-contato").innerHTML;

    const contatoSelecionadoAntes = document.querySelector(".tipo-contato .selecionado");

    if (contatoSelecionadoAntes !== null) {
        contatoSelecionadoAntes.classList.remove("selecionado");

    }
    elemento.classList.add("selecionado");

}

function selecionarVisibilidade(elemento) {
    let visibilidade = elemento.querySelector(".descrição-visibilidade").innerHTML;

    const elementoSelecionadoAntes = document.querySelector(".tipo-visibilidade .selecionado");

    if (elementoSelecionadoAntes !== null) {
        elementoSelecionadoAntes.classList.remove("selecionado");
    }
    
    elemento.classList.add("selecionado");

    if (visibilidade === "Público") {
        visibilidadeMensagem = "Público";
    } else {
        visibilidadeMensagem = "Reservadamente";
    }

    let informaçõesMensagem = document.querySelector(".informações-mensagem");
    if (informaçõesMensagem){
        informaçõesMensagem.innerHTML = `Enviando para ${contatoSelecionado} (${visibilidadeMensagem})`;
    }
    
}

function adicionarNovoIntegrante() {
    nomeIntegrante = prompt("Qual é o seu nome?");

    if (nomeIntegrante !== null && nomeIntegrante !== "") {
        const novoIntegrante = {
            name: nomeIntegrante
        };

        const promessa = axios.post("https://mock-api.driven.com.br/api/v6/uol/participants/" + UUID, novoIntegrante);

        promessa.then(iniciarChat);
        promessa.catch(mostrarErro);
    } else {
        window.location.reload();
    }
}

function iniciarChat() {
    console.log("Integrante adicionado com sucesso");
    buscarMensagens();
    buscarIntegrantes();
    
    setInterval(manterConexão, 5000);
    setInterval(buscarMensagens, 3000);
    setInterval(buscarIntegrantes, 10000);
}

function buscarMensagens() {
    const promessa = axios.get("https://mock-api.driven.com.br/api/v6/uol/messages/" + UUID);

    promessa.then(renderizarMensagens);

}

function buscarIntegrantes(resposta) {
    const promessa = axios.get("https://mock-api.driven.com.br/api/v6/uol/participants/" + UUID);

    promessa.then(processarListaRecebida);
    promessa.catch(mostrarErro);
}

function processarListaRecebida(resposta) {
    console.log("Lista processada com sucesso");
    integrantes = resposta.data;
    renderizarIntegrantes();
}

function renderizarIntegrantes() {
    const ulIntegrantes = document.querySelector(".contato-único");
    ulIntegrantes.innerHTML = "";

    for (let i = 0; i < integrantes.length; i++) {
        ulIntegrantes.innerHTML += `
                <li onclick="selecionarContato(this)">
                    <ion-icon name="people-circle"></ion-icon>
                    <p class="descrição-contato">${integrantes[i].name}</p>
                    <ion-icon name="checkmark" class="check"></ion-icon>
                </li>
            `
    }
}

function manterConexão() {
    const url = ("https://mock-api.driven.com.br/api/v6/uol/status/" + UUID);
    const dadosRequisição = {
        name: nomeIntegrante
    };

    const promessa = axios.post(url, dadosRequisição);

    promessa.then(resposta => {
        console.log("Status atualizado com sucesso")
    });
    promessa.catch(mostrarErro);
}

function renderizarMensagens(resposta) {
    console.log("Mensagens renderizadas com sucesso!");
    mensagens = resposta.data;

    mensagens.sort((a, b) => new Date(a.horario) - new Date(b.horario));

    const ulChat = document.querySelector(".chat");
    ulChat.innerHTML = "";

    mensagens.forEach(mensagem => {
        if (selecionarMensagensPrivadas(mensagem)) {
            if (mensagem.to === nomeIntegrante || mensagem.from === nomeIntegrante){
                estruturarMensagensPrivadas(mensagem);
            }        
        }else if(selecionarMensagensPublicas(mensagem)) {
            estruturarMensagensPublicas(mensagem);
        }else if (selecionarMensagensStatus(mensagem)) {
            estruturarMensagensStatus(mensagem);
        }
    });
    

    const elementoUltimaMensagem = ulChat.lastElementChild;
    if (elementoUltimaMensagem !== ultimaMensagem) {
        elementoUltimaMensagem.scrollIntoView();
        ultimaMensagem = elementoUltimaMensagem;
    }
}


function selecionarMensagensPrivadas(mensagem) {
    return mensagem.type === "private_message"
}

function estruturarMensagensPrivadas(mensagem) {
    const ulChat = document.querySelector(".chat");
 
    ulChat.innerHTML += `
        <li class="mensagem-privada">
            <p>
                <span class="horário">(${mensagem.time})</span>
                <strong>${mensagem.from}</strong> para
                <strong>${mensagem.to}</strong>:
                ${mensagem.text}
            </p>
         </li >
    `;
}

function selecionarMensagensPublicas(mensagem) {
    return mensagem.type === "message";
}

function estruturarMensagensPublicas(mensagem) {
    const ulChat = document.querySelector(".chat");

    ulChat.innerHTML += `
        <li class="mensagem-publica">
            <p>
                <span class="horário">(${mensagem.time})</span>
                <strong>${mensagem.from}</strong> para
                <strong>${mensagem.to}</strong>:
                ${mensagem.text}
            </p>
        </li >
    `;
}       

function selecionarMensagensStatus(mensagem) {
    return mensagem.type === "status";
} 

function estruturarMensagensStatus(mensagem) {
    const ulChat = document.querySelector(".chat");

    ulChat.innerHTML += `
        <li class="mensagem-status">
            <p>
                <span class="horário">(${mensagem.time})</span>
                <strong>${mensagem.from}</strong> ${mensagem.text}
            </p>
        </li>
    `;
}

function enviarMensagem() {
    const mensagemEnviada = document.querySelector(".mensagem").value;
    let tipoMensagem;
    if (visibilidadeMensagem === "Público") {
        tipoMensagem = "message";
    } else {
        tipoMensagem = "private_message";
    }

    const novaMensagem = {
        from: nomeIntegrante,
        to: contatoSelecionado,
        text: mensagemEnviada,
        type: tipoMensagem
    }


    const promessa = axios.post("https://mock-api.driven.com.br/api/v6/uol/messages/" + UUID, novaMensagem);

    promessa.then(buscarMensagens);

    document.querySelector(".mensagem").value = "";
    document.querySelector(".informações-mensagem").value = "";
}

function mostrarErro(erro) {
    console.log(erro)
    if (erro.response.status === 400) {
        alert("Já existe um usuário com esse nome. Insira um novo nome");
        adicionarNovoIntegrante();
    } else if (erro.response.status === 500 || erro.response.status === 404) {
        alert("Ocorreu um erro. Tente novamente!")
        setInterval(manterConexão, 5000);
        setInterval(buscarMensagens, 3000);
        setInterval(buscarIntegrantes, 10000)
    } else {
        alert("Você não está mais conectado. Redirecionando para página inicial");
        window.location.reload();
    }

}

adicionarNovoIntegrante();

