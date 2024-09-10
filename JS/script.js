// Função para formatar o campo de input para o formato HH:MM
function formatarHora(input) {
  let valor = input.value.replace(/\D/g, "");

  if (valor.length > 4) {
    valor = valor.slice(0, 4);
  }

  if (valor.length > 2) {
    valor = valor.slice(0, 2) + ":" + valor.slice(2);
  }

  input.value = valor;
}

// Função para converter HH:MM para segundos
function horaParaSegundos(hora) {
  const partes = hora.split(":");
  const horas = parseInt(partes[0], 10);
  const minutos = parseInt(partes[1], 10);
  return horas * 3600 + minutos * 60;
}

// Função para converter segundos para HH:MM
function segundosParaHora(segundos) {
  const horas = Math.floor(segundos / 3600);
  const minutos = Math.floor((segundos % 3600) / 60);
  return (
    String(horas).padStart(2, "0") + ":" + String(minutos).padStart(2, "0")
  );
}

// Função para validar e ajustar o valor da carga horária
function validarCargaHoraria(input) {
  const valor = input.value;
  const segundos = horaParaSegundos(valor);

  if (segundos > 86400) {
    // 24 horas em segundos
    input.value = segundosParaHora(86400); // Define o valor máximo de 24 horas
    alert("Carga horária ajustada para o máximo de 24 horas.");
  }
}

// Função para calcular se um horário está dentro do período noturno (22h às 5h)
function isHoraNoturna(segundos) {
  const hora = Math.floor((segundos / 3600) % 24);
  return hora >= 22 || hora < 5;
}

// Função para calcular a carga horária, intervalos e exibir resultados
function calcularHoras() {
  const inputs = document.querySelectorAll("#marcacoes input");

  // Verifica se o número de marcações é ímpar
  if (inputs.length % 2 !== 0) {
    alert(
      "Erro: O número de marcações é ímpar. Certifique-se de que todas as entradas têm uma marcação de saída correspondente."
    );
    return;
  }

  let totalSegundos = 0;
  let intervaloTotalSegundos = 0;
  let totalHorasNoturnasSegundos = 0;

  // Itera sobre os inputs, pegando a entrada e saída a cada dois campos
  for (let i = 0; i < inputs.length; i += 2) {
    const entrada = inputs[i].value;
    const saida = inputs[i + 1]?.value;

    if (entrada && saida) {
      let segundosEntrada = horaParaSegundos(entrada);
      let segundosSaida = horaParaSegundos(saida);

      // Ajuste para marcações que passam de um dia para o outro (meia-noite)
      if (segundosSaida < segundosEntrada) {
        segundosSaida += 86400; // Adiciona 24 horas em segundos
      }

      let tempoTrabalhado = segundosSaida - segundosEntrada;
      totalSegundos += tempoTrabalhado;

      // Verifica se houve trabalho noturno
      for (let s = segundosEntrada; s < segundosSaida; s += 3600) {
        if (isHoraNoturna(s)) {
          totalHorasNoturnasSegundos += 3150; // 52 minutos e 30 segundos por hora noturna
        }
      }

      // Se houver uma próxima marcação de entrada, calcule o intervalo
      if (i + 2 < inputs.length) {
        const proximaEntrada = horaParaSegundos(inputs[i + 2].value);
        intervaloTotalSegundos += proximaEntrada - segundosSaida;
      }
    }
  }

  // Converte o total de segundos de volta para HH:MM
  const horasTrabalhadas = segundosParaHora(totalSegundos);
  const intervalo = segundosParaHora(intervaloTotalSegundos);
  const horasNoturnas = segundosParaHora(totalHorasNoturnasSegundos);

  // Pega o valor de Carga Horária (em segundos) e compara
  const cHorariaInput = document.getElementById("cHoraria").value;
  if (!cHorariaInput) {
    document.getElementById("resposta").innerText =
      "Por favor, defina a carga horária.";
    return;
  }

  const cHorariaSegundos = horaParaSegundos(cHorariaInput);

  // Calcula débito e crédito de horas
  let debitoHoras = 0;
  let creditoHoras = 0;

  if (totalSegundos < cHorariaSegundos) {
    debitoHoras = cHorariaSegundos - totalSegundos;
  } else {
    creditoHoras = totalSegundos - cHorariaSegundos;
  }

  // Exibindo resultados
  document.getElementById("horasTrabalhadas").innerText = horasTrabalhadas;
  document.getElementById("debitoHoras").innerText =
    segundosParaHora(debitoHoras);
  document.getElementById("creditoHoras").innerText =
    segundosParaHora(creditoHoras);
  document.getElementById("intervalo").innerText = intervalo;
  document.getElementById("horasNoturnas").innerText = horasNoturnas;

  // Exibindo comparação da carga horária
  let resultadoComparacao = "";
  if (totalSegundos < cHorariaSegundos) {
    resultadoComparacao =
      "Horas insuficientes. Faltam " +
      segundosParaHora(cHorariaSegundos - totalSegundos);
  } else if (totalSegundos === cHorariaSegundos) {
    resultadoComparacao = "Carga horária completa!";
  } else {
    resultadoComparacao =
      "Carga horária excedida em " +
      segundosParaHora(totalSegundos - cHorariaSegundos);
  }

  document.getElementById("resposta").innerText =
    "Total de horas trabalhadas: " +
    horasTrabalhadas +
    ". " +
    resultadoComparacao;
}

// Adicionar novos inputs dinamicamente
const btnAdd = document.getElementById("btnadd");
const btnRemove = document.getElementById("btnremove");
const btnCalc = document.getElementById("btncalc");
const marcacoesDiv = document.getElementById("marcacoes");

btnAdd.addEventListener("click", function () {
  const newInput = document.createElement("input");
  newInput.type = "text";
  newInput.placeholder = "00:00";
  newInput.maxLength = 5;

  newInput.addEventListener("input", function () {
    formatarHora(newInput);
  });

  marcacoesDiv.appendChild(newInput);
});

// Remover último input adicionado
btnRemove.addEventListener("click", function () {
  if (marcacoesDiv.getElementsByTagName("input").length > 1) {
    marcacoesDiv.removeChild(marcacoesDiv.lastElementChild);
  }
});

// Adiciona evento ao botão de calcular
btnCalc.addEventListener("click", calcularHoras);

const marcacaoInicial = marcacoesDiv.querySelector("input");
marcacaoInicial.addEventListener("input", function () {
  formatarHora(marcacaoInicial);
});

const cHorariaInput = document.getElementById("cHoraria");
cHorariaInput.addEventListener("input", function () {
  formatarHora(cHorariaInput);
  validarCargaHoraria(cHorariaInput);
});
