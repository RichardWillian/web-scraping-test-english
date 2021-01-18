const tipoExerciciosSelection = require("./tipos_exercicios/tipo_selection");
const tipoExerciciosInput = require("./tipos_exercicios/tipo_input");

async function iniciarScrapping() {

    let paginasTextEnglish = {};

    paginasTextEnglish.questoesSelection = await tipoExerciciosSelection.recuperarQuestoesSelection();

    paginasTextEnglish.questoesInput = await tipoExerciciosInput.recuperarQuestoesInput();

    console.log(JSON.stringify(paginasTextEnglish.questoesInput));
}

iniciarScrapping();