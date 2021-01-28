const puppeteer = require("puppeteer");
const utils = require("../utils")

function recuperarQuestoesMultiplaEscolha() {

    return new Promise(async function(resolve) {

        let paginas = [];

        let urls = [
            'https://test-english.com/grammar-points/a1/this-that-these-those/2/',
            'https://test-english.com/grammar-points/a1/possessive-adjectives/2/',
            'https://test-english.com/grammar-points/a1/adjectives/2/',
            'https://test-english.com/grammar-points/a1/questions/',
            'https://test-english.com/grammar-points/a1/adverbs-frequency/',
            'https://test-english.com/grammar-points/a1/adverbs-frequency/2/',
            'https://test-english.com/grammar-points/a1/whose-possessive-s/2/',
            'https://test-english.com/grammar-points/a1/at-in-on-prepositions-time/2/',
            'https://test-english.com/grammar-points/a1/at-in-on-prepositions-of-place/2/'
        ]

        urls.forEach(async(url) => {

            let browser = await puppeteer.launch();
            let page = await browser.newPage();
            await page.goto(url, { waitUntil: "networkidle2" });

            let data = await page.evaluate(async() => {

                function delay(time) {
                    return new Promise(function(resolve) {
                        setTimeout(resolve, time)
                    });
                }

                let pagina = {
                    titulo: $("#the_title_h1").text().replace("\n", ""),
                    texto_exercicio: $($("#exercises").find("h3")[0]).text(),
                    enunciado: $($("#exercises").find("h5")[0]).text(),
                    dicas: $("#exercises").find(".textBox")[0].innerHTML,
                    exemplo: $("#exercises").find("em")[0].innerHTML,
                    exercicios: []
                }

                $("#action-button").click();

                await delay(4000);

                $(".watupro-choices-columns").each((index, bloco) => {
                    let exercicio = {
                        numero: index + 1,
                        questao: $(bloco).find(".show-question-content")[0].innerText.split("\n")[1],
                        opcoes: [],
                        explicacao: ""
                    }

                    $(bloco).find(".show-question-choices").find("li").each((i, opcao) => {
                        let $opcao = $(opcao);

                        let descricaoOpcao = $opcao[0].innerText.replace("correct", "");
                        let tiposOpcoes = ["a. ", "b. ", "c. ", "d .", "e. ", "f. ", "g. ", "\n"];

                        tiposOpcoes.forEach((tipoOpcao) => {
                            descricaoOpcao = descricaoOpcao.replace(tipoOpcao, "");
                        });

                        exercicio.opcoes.push({
                            correta: $opcao.hasClass("correct-answer"),
                            descricao: descricaoOpcao
                        });
                    });

                    exercicio.explicacao = $(bloco).find(".watupro-main-feedback")[0].innerHTML;
                    pagina.exercicios.push(exercicio);
                });

                return pagina;

            });

            await browser.close();

            paginas.push(data);

            console.log(`Fim Scrapping: ${url}`);
        });

        let contador = 1;
        while (true) {

            if (paginas.length == urls.length) {
                resolve(paginas);
                return;
            }

            await utils.delay(1000)
            console.log(`Segundos ${contador++}`);
        }
    });
}

module.exports = { recuperarQuestoesMultiplaEscolha }