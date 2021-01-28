const tipoExerciciosDialogo = require("./tipos_exercicios/tipo_dialogo");
const tipoExerciciosSelection = require("./tipos_exercicios/tipo_selection");
const tipoExerciciosInputComum = require("./tipos_exercicios/tipo_input_comum");
const tipoExerciciosInputCarta = require("./tipos_exercicios/tipo_input_carta");
const tipoExerciciosMultiplaEscolha = require("./tipos_exercicios/tipo_multipla_escolha");

const fs = require('fs');

async function iniciarScrapping() {

    let paginasTextEnglish = {};

    paginasTextEnglish.questoesSelection = await tipoExerciciosSelection.recuperarQuestoesSelection();

    paginasTextEnglish.questoesInputComum = await tipoExerciciosInputComum.recuperarQuestoesInputComum();

    paginasTextEnglish.questoesInputCarta = await tipoExerciciosInputCarta.recuperarQuestoesInputCarta();

    paginasTextEnglish.questoesMultiplaEscolha = await tipoExerciciosMultiplaEscolha.recuperarQuestoesMultiplaEscolha();

    paginasTextEnglish.questoesDialogo = await tipoExerciciosDialogo.recuperarQuestoesDialogo();


    fs.writeFileSync('./exemplo_objeto.json', JSON.stringify(paginasTextEnglish));
}

iniciarScrapping();