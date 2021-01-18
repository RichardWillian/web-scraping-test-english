const puppeteer = require("puppeteer");
const utils = require("../utils")

function recuperarQuestoesInput() {

    return new Promise(async function(resolve) {

        let paginas = [];

        let urls = [
            'https://test-english.com/grammar-points/a1/present-simple-forms-of-to-be/2/',
        ]

        urls.forEach(async(url) => {

            console.log(`Início Scrapping: ${url}`);

            let browser = await puppeteer.launch();
            let page = await browser.newPage();
            await page.goto(url, { waitUntil: "networkidle2" });

            let data = await page.evaluate(async() => {

                function delay(time) {
                    return new Promise(function(resolve) {
                        setTimeout(resolve, time)
                    });
                }

                pagina = {
                    titulo: $("#the_title_h1").text().replace("\n", ""),
                    texto_exercicio: $($("#exercises").find("h3")[0]).text(),
                    enunciado: $($("#exercises").find("h5")[0]).text(),
                    exercicios: []
                }

                async function recuperarQuestoes() {

                    $("#action-button").click();

                    await delay(4000);

                    $(".watupro-choices-columns").each(function(index, item) {

                        let exercicio = {
                            numero: index + 1,
                            tipo: "input"
                        }

                        let textoLinhaResposta = $(item).find(".watupro-main-feedback").find("span")[0].innerHTML;
                        let resposta = textoLinhaResposta.replace("Correct answers: ", "").replace("Correct answer: ", "").replace('<i class="fas fa-minus-circle"></i>', "").replace('<i class="fas fa-question-circle"></i>', "|").split("|")

                        console.log(resposta)

                        let elementosDentroDiv = $(item).find(".show-question-content")[0].childNodes;

                        let textoQuestao = "";
                        let contadorRespostas = 0;
                        elementosDentroDiv.forEach((elemento, i) => {

                            switch (elemento.nodeName) {
                                case "SPAN":
                                    if (elemento.innerHTML == "[no answer]") {
                                        textoQuestao += `[resposta:${resposta[contadorRespostas]}]`;
                                        contadorRespostas++;
                                    }
                                    break;
                                case "#text":
                                    textoQuestao += elemento.nodeValue;
                                    break;
                            }
                        });

                        exercicio.questao = textoQuestao;
                        pagina.exercicios.push(exercicio);
                    });
                }

                await recuperarQuestoes();

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

module.exports = { recuperarQuestoesInput }